/**
 * Trade service: category summaries, ranked partners, relationships and
 * monthly evolution. Categories are never combined, except that the
 * homepage overview adds up the wine categories; grape must stays apart.
 *
 * With Supabase configured, figures are Eurostat Comext statistics read
 * through the trade aggregate functions in the database. Without it, they
 * come from the illustrative fixtures.
 */

import { cache } from "react";

import { tradeOverview } from "@/fixtures/home";
import {
  monthlyExportVolumes,
  TRADE_UPDATED_AT,
  tradeCategoryDetails,
  tradePeriod,
} from "@/fixtures/trade";
import type { Database } from "@/lib/database.types";
import { formatMonthYear } from "@/lib/format";
import { getSupabase } from "@/lib/supabase";
import { getSource, type MarketSource } from "@/services/markets/sources";
import {
  TRADE_CATEGORIES,
  TRADE_CATEGORY_CODES,
  type TradeCategory,
  type TradeCategoryDetail,
  type TradeCategorySummary,
  type TradeFlowRow,
  type TradeMonthlyPoint,
  type TradePartnerRow,
  type TradePeriod,
} from "@/services/trade/types";
import {
  PRODUCER_COUNTRIES,
  type ProducerCountry,
  type TradeOverview,
} from "@/services/types";

export interface TradeService {
  getPeriod(): Promise<TradePeriod>;
  /** Where the figures come from, for attribution lines. */
  getSource(): Promise<MarketSource>;
  /** When the figures were last refreshed. */
  getUpdatedAt(): Promise<string>;
  getCategorySummaries(): Promise<TradeCategorySummary[]>;
  getCategoryDetail(category: TradeCategory): Promise<TradeCategoryDetail | null>;
  getAllCategoryDetails(): Promise<TradeCategoryDetail[]>;
  getMonthlyExportVolumes(category: TradeCategory): Promise<TradeMonthlyPoint[]>;
  /** Homepage view: wine exporters, leading destinations and product split. */
  getOverview(): Promise<TradeOverview>;
}

class FixtureTradeService implements TradeService {
  async getPeriod(): Promise<TradePeriod> {
    return tradePeriod;
  }

  async getSource(): Promise<MarketSource> {
    return getSource("sample-customs");
  }

  async getUpdatedAt(): Promise<string> {
    return TRADE_UPDATED_AT;
  }

  async getCategorySummaries(): Promise<TradeCategorySummary[]> {
    return tradeCategoryDetails.map((d) => d.summary);
  }

  async getCategoryDetail(
    category: TradeCategory,
  ): Promise<TradeCategoryDetail | null> {
    return tradeCategoryDetails.find((d) => d.category === category) ?? null;
  }

  async getAllCategoryDetails(): Promise<TradeCategoryDetail[]> {
    return tradeCategoryDetails;
  }

  async getMonthlyExportVolumes(
    category: TradeCategory,
  ): Promise<TradeMonthlyPoint[]> {
    return monthlyExportVolumes(category);
  }

  async getOverview(): Promise<TradeOverview> {
    return tradeOverview;
  }
}

type Rows<Name extends keyof Database["public"]["Functions"]> =
  Database["public"]["Functions"][Name]["Returns"];

interface Snapshot {
  /** Last month of the reference period, e.g. "2026-06-01". */
  endMonth: string;
  updatedAt: string;
  totals: Rows<"trade_totals">;
  destinations: Rows<"trade_destinations">;
  flows: Rows<"trade_top_flows">;
  monthly: Rows<"trade_monthly">;
}

const LITRES_PER_MHL = 100_000_000;
const EUR_PER_MEUR = 1_000_000;
const MONTHS_CHARTED = 24;

/** The categories that are wine, and are added up on the homepage. */
const WINE_CATEGORIES: TradeCategory[] = [
  "bulk",
  "bottled",
  "bag-in-box",
  "sparkling",
];

const SPLIT_LABELS: Record<TradeCategory, string> = {
  bulk: "Bulk",
  bottled: "Bottled",
  "bag-in-box": "Bag-in-box",
  sparkling: "Sparkling",
  must: "Grape must",
};

const NOTES: Record<TradeCategory, string> = {
  bulk: "Still wine in containers of more than 10 litres (CN 2204 29), shipped in tankers and flexitanks. Unit values are not comparable with bottled trade.",
  bottled:
    "Still wine in containers of up to 2 litres (CN 2204 21), mostly bottles.",
  "bag-in-box":
    "Still wine in containers of more than 2 and up to 10 litres (CN 2204 22), mostly bag-in-box: a subheading of its own between bottles and bulk.",
  sparkling:
    "Sparkling wine (CN 2204 10), a subheading of its own with its own price structure.",
  must: "Grape must of more than 0.5% vol (CN 2204 30), fermenting or with fermentation arrested, including some concentrated must. Unfermented must and most concentrates are grape juice (CN 2009) and are not covered. Volumes are product as shipped and are never added to wine.",
};

/**
 * Everything the trade pages read, fetched once per render. The period
 * ends at the latest month every reporter has published, and a render
 * fails rather than show the volume of part of the trade, so a
 * regeneration keeps the last good page instead.
 */
const loadSnapshot = cache(async (): Promise<Snapshot> => {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured");

  const latest = await supabase.rpc("trade_latest_month");
  if (latest.error) {
    throw new Error(`Reading the latest trade month failed: ${latest.error.message}`);
  }
  const endMonth = latest.data;
  if (!endMonth) throw new Error("The database holds no trade flows");

  const [totals, destinations, flows, monthly, imported] = await Promise.all([
    supabase.rpc("trade_totals", { end_month: endMonth }),
    supabase.rpc("trade_destinations", { end_month: endMonth }),
    supabase.rpc("trade_top_flows", { end_month: endMonth }),
    supabase.rpc("trade_monthly", { end_month: endMonth }),
    supabase
      .from("trade_flows")
      .select("imported_at")
      .order("imported_at", { ascending: false })
      .limit(1)
      .single(),
  ]);
  for (const result of [totals, destinations, flows, monthly, imported]) {
    if (result.error) {
      throw new Error(`Reading trade aggregates failed: ${result.error.message}`);
    }
  }

  const snapshot = {
    endMonth,
    updatedAt: imported.data!.imported_at,
    totals: totals.data!,
    destinations: destinations.data!,
    flows: flows.data!,
    monthly: monthly.data!,
  };
  const groups = [
    ...snapshot.totals,
    ...snapshot.destinations,
    ...snapshot.flows,
    ...snapshot.monthly,
  ];
  if (groups.some((group) => !group.litres_complete)) {
    throw new Error(
      "Trade flows in the reference period lack litres; see the notes in import_runs",
    );
  }
  return snapshot;
});

function total(values: (number | null)[]): number {
  return values.reduce<number>((sum, value) => sum + (value ?? 0), 0);
}

/** Percentage change, or null when there is nothing to compare with. */
function change(current: number | null, previous: number | null): number | null {
  if (current === null || previous === null || previous <= 0) return null;
  return (current / previous - 1) * 100;
}

function unitValue(valueEur: number, litres: number): number {
  return litres > 0 ? valueEur / litres : 0;
}

function isProducer(code: string): code is ProducerCountry {
  return (PRODUCER_COUNTRIES as string[]).includes(code);
}

/** "2026-06-01" to "2026-06", and back a number of months. */
function monthOf(date: string, back = 0): string {
  const [year, month] = date.split("-").map(Number);
  const shifted = new Date(Date.UTC(year, month - 1 - back, 1));
  return shifted.toISOString().slice(0, 7);
}

class SupabaseTradeService implements TradeService {
  async getPeriod(): Promise<TradePeriod> {
    const { endMonth } = await loadSnapshot();
    const latestMonth = monthOf(endMonth);
    return {
      label: `12 months to ${formatMonthYear(latestMonth)}`,
      latestMonth,
    };
  }

  async getSource(): Promise<MarketSource> {
    return getSource("eurostat-comext");
  }

  async getUpdatedAt(): Promise<string> {
    return (await loadSnapshot()).updatedAt;
  }

  async getCategorySummaries(): Promise<TradeCategorySummary[]> {
    const snapshot = await loadSnapshot();
    return TRADE_CATEGORIES.map((category) => summarise(snapshot, category));
  }

  async getCategoryDetail(
    category: TradeCategory,
  ): Promise<TradeCategoryDetail | null> {
    return detail(await loadSnapshot(), category);
  }

  async getAllCategoryDetails(): Promise<TradeCategoryDetail[]> {
    const snapshot = await loadSnapshot();
    return TRADE_CATEGORIES.map((category) => detail(snapshot, category));
  }

  async getMonthlyExportVolumes(
    category: TradeCategory,
  ): Promise<TradeMonthlyPoint[]> {
    const snapshot = await loadSnapshot();
    const code = TRADE_CATEGORY_CODES[category];
    const litres = new Map(
      snapshot.monthly
        .filter((row) => row.product === code)
        .map((row) => [monthOf(row.period), row.litres]),
    );
    const points: TradeMonthlyPoint[] = [];
    for (let back = MONTHS_CHARTED - 1; back >= 0; back--) {
      const month = monthOf(snapshot.endMonth, back);
      points.push({ month, volumeMhl: (litres.get(month) ?? 0) / LITRES_PER_MHL });
    }
    return points;
  }

  async getOverview(): Promise<TradeOverview> {
    const snapshot = await loadSnapshot();
    const [period, source] = await Promise.all([this.getPeriod(), this.getSource()]);
    const wineCodes = WINE_CATEGORIES.map((category) => TRADE_CATEGORY_CODES[category]);
    const wineExports = snapshot.totals.filter(
      (row) => row.flow === "export" && wineCodes.includes(row.product),
    );

    const exporters = PRODUCER_COUNTRIES.map((country) => {
      const rows = wineExports.filter((row) => row.reporter === country);
      const litres = total(rows.map((row) => row.litres));
      return {
        country,
        litres,
        yoyPercent: change(litres, total(rows.map((row) => row.litres_prior_year))),
      };
    })
      .sort((a, b) => b.litres - a.litres)
      .map((row, index) => ({
        rank: index + 1,
        country: row.country,
        volumeMhl: row.litres / LITRES_PER_MHL,
        yoyPercent: row.yoyPercent,
      }));

    const importers = snapshot.destinations
      .filter((row) => row.product === "wine")
      .map((row, index) => ({
        rank: index + 1,
        country: row.partner,
        volumeMhl: row.litres / LITRES_PER_MHL,
        yoyPercent: change(row.litres, row.litres_prior_year),
      }));

    const wineLitres = total(wineExports.map((row) => row.litres));
    const split = WINE_CATEGORIES.map((category) => ({
      label: SPLIT_LABELS[category],
      sharePercent:
        wineLitres > 0
          ? (total(
              wineExports
                .filter((row) => row.product === TRADE_CATEGORY_CODES[category])
                .map((row) => row.litres),
            ) /
              wineLitres) *
            100
          : 0,
    }));

    return {
      period: period.label,
      exporters,
      importers,
      split,
      status: "provisional",
      source: { name: source.name, url: source.url },
      updatedAt: snapshot.updatedAt,
    };
  }
}

function summarise(
  snapshot: Snapshot,
  category: TradeCategory,
): TradeCategorySummary {
  const rows = snapshot.totals.filter(
    (row) => row.product === TRADE_CATEGORY_CODES[category],
  );
  const exports = rows.filter((row) => row.flow === "export");
  const imports = rows.filter((row) => row.flow === "import");
  const exportLitres = total(exports.map((row) => row.litres));
  const exportValue = total(exports.map((row) => row.value_eur));
  return {
    category,
    exportVolumeMhl: exportLitres / LITRES_PER_MHL,
    exportValueMeur: exportValue / EUR_PER_MEUR,
    importVolumeMhl: total(imports.map((row) => row.litres)) / LITRES_PER_MHL,
    importValueMeur: total(imports.map((row) => row.value_eur)) / EUR_PER_MEUR,
    exportUnitValueEurL: unitValue(exportValue, exportLitres),
    volumeYoYPercent: change(
      exportLitres,
      total(exports.map((row) => row.litres_prior_year)),
    ),
    valueYoYPercent: change(
      exportValue,
      total(exports.map((row) => row.value_eur_prior_year)),
    ),
    status: "provisional",
  };
}

function detail(snapshot: Snapshot, category: TradeCategory): TradeCategoryDetail {
  const code = TRADE_CATEGORY_CODES[category];
  const exports = snapshot.totals.filter(
    (row) => row.product === code && row.flow === "export",
  );
  const exportLitres = total(exports.map((row) => row.litres));
  const share = (litres: number) =>
    exportLitres > 0 ? (litres / exportLitres) * 100 : 0;

  const exporters: TradePartnerRow[] = exports
    .filter((row) => isProducer(row.reporter))
    .sort((a, b) => b.litres - a.litres)
    .map((row, index) => ({
      rank: index + 1,
      country: row.reporter,
      direction: "export",
      volumeMhl: row.litres / LITRES_PER_MHL,
      valueMeur: row.value_eur / EUR_PER_MEUR,
      unitValueEurL: unitValue(row.value_eur, row.litres),
      yoyPercent: change(row.litres, row.litres_prior_year),
      momPercent: change(row.litres_month, row.litres_prior_month),
      sharePercent: share(row.litres),
    }));

  const destinations: TradePartnerRow[] = snapshot.destinations
    .filter((row) => row.product === code)
    .map((row, index) => ({
      rank: index + 1,
      country: row.partner,
      direction: "import",
      volumeMhl: row.litres / LITRES_PER_MHL,
      valueMeur: row.value_eur / EUR_PER_MEUR,
      unitValueEurL: unitValue(row.value_eur, row.litres),
      yoyPercent: change(row.litres, row.litres_prior_year),
      momPercent: change(row.litres_month, row.litres_prior_month),
      sharePercent: share(row.litres),
    }));

  const topFlows: TradeFlowRow[] = snapshot.flows
    .filter((row) => row.product === code)
    .flatMap((row) =>
      isProducer(row.reporter)
        ? [
            {
              origin: row.reporter,
              destination: row.partner,
              volumeMhl: row.litres / LITRES_PER_MHL,
              valueMeur: row.value_eur / EUR_PER_MEUR,
              unitValueEurL: unitValue(row.value_eur, row.litres),
              yoyPercent: change(row.litres, row.litres_prior_year),
            },
          ]
        : [],
    );

  return {
    category,
    summary: summarise(snapshot, category),
    exporters,
    destinations,
    topFlows,
    note: NOTES[category],
    sourceId: "eurostat-comext",
    updatedAt: snapshot.updatedAt,
  };
}

let service: TradeService | null = null;
let illustrative: TradeService | null = null;

/** Eurostat figures when Supabase is configured, fixtures otherwise. */
export function getTradeService(): TradeService {
  service ??= getSupabase()
    ? new SupabaseTradeService()
    : new FixtureTradeService();
  return service;
}

/**
 * Always the illustrative fixtures, for sample publications such as the
 * Market Outlook, whose text was written against them.
 */
export function getIllustrativeTradeService(): TradeService {
  illustrative ??= new FixtureTradeService();
  return illustrative;
}
