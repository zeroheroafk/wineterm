/**
 * Supply service: balances, production comparisons and stocks with
 * derived context. Spain's stocks come from the Ministry of Agriculture's
 * INFOVI declarations when Supabase is configured; everything else is
 * still the illustrative fixtures, and every row says which it is.
 */

import { unstable_cache } from "next/cache";
import { cache } from "react";

import {
  CURRENT_CAMPAIGN,
  PREVIOUS_CAMPAIGN,
  campaigns,
  openingStocksHistory,
  productionRecords,
  stockRecords,
  supplyBalances,
} from "@/fixtures/supply";
import type { Database } from "@/lib/database.types";
import { getSupabase } from "@/lib/supabase";
import type {
  Campaign,
  MonthlyStocksPoint,
  ProductionComparison,
  ProductionRecord,
  SpainMonthlyStocks,
  StockComparison,
  StockRecord,
  SupplyBalanceComputed,
} from "@/services/supply/types";
import { PRODUCER_COUNTRIES, type ProducerCountry } from "@/services/types";

const round1 = (v: number) => Math.round(v * 10) / 10;

export interface SupplyService {
  getCampaigns(): Promise<Campaign[]>;
  getCurrentCampaign(): Promise<string>;
  /** Computed balances for a campaign, one row per country. */
  getBalances(campaign: string): Promise<SupplyBalanceComputed[]>;
  getProductionComparisons(): Promise<ProductionComparison[]>;
  getProductionByCampaign(): Promise<ProductionRecord[]>;
  getStocks(): Promise<StockComparison[]>;
  getOpeningStocksHistory(): Promise<
    Record<ProducerCountry, { campaign: string; stocksMhl: number }[]>
  >;
  /** Spain's month-end stocks in detail; null without a real source. */
  getSpainMonthlyStocks(): Promise<SpainMonthlyStocks | null>;
}

function computeBalance(
  campaign: string,
  country: ProducerCountry,
): SupplyBalanceComputed | null {
  const balance = supplyBalances.find(
    (row) => row.campaign === campaign && row.country === country,
  );
  if (!balance) return null;
  const availabilityMhl = round1(
    balance.openingStocksMhl + balance.productionMhl + balance.importsMhl,
  );
  const closingStocksMhl = round1(
    availabilityMhl - balance.domesticUseMhl - balance.exportsMhl,
  );

  const campaignIndex = campaigns.findIndex((c) => c.code === campaign);
  const next = campaigns[campaignIndex + 1];
  const nextBalance = next
    ? supplyBalances.find(
        (row) => row.campaign === next.code && row.country === country,
      )
    : undefined;

  return {
    ...balance,
    availabilityMhl,
    closingStocksMhl,
    yieldHlHa: round1((balance.productionMhl * 1000) / balance.vineyardKha),
    residualMhl: nextBalance
      ? round1(nextBalance.openingStocksMhl - closingStocksMhl)
      : null,
  };
}

/**
 * Stocks rows with their derived context. The share of the four-country
 * total needs four real figures, or four samples; months of use divides
 * by the illustrative balances, so only sample rows get it.
 */
function compareStocks(
  records: StockRecord[],
  previousBalances: SupplyBalanceComputed[],
): StockComparison[] {
  const samples = records.filter((r) => r.status === "illustrative").length;
  const mixed = samples > 0 && samples < records.length;
  const total = records.reduce((sum, r) => sum + r.stocksMhl, 0);
  return records.map((record) => {
    const balance =
      record.status === "illustrative"
        ? previousBalances.find((b) => b.country === record.country)
        : undefined;
    const monthlyUse = balance
      ? (balance.domesticUseMhl + balance.exportsMhl) / 12
      : null;
    return {
      ...record,
      yoyPercent:
        ((record.stocksMhl - record.yearEarlierMhl) / record.yearEarlierMhl) *
        100,
      shareOfTotalPercent: mixed ? null : (record.stocksMhl / total) * 100,
      monthsOfUse: monthlyUse ? round1(record.stocksMhl / monthlyUse) : null,
    };
  });
}

class FixtureSupplyService implements SupplyService {
  async getCampaigns(): Promise<Campaign[]> {
    return campaigns;
  }

  async getCurrentCampaign(): Promise<string> {
    return CURRENT_CAMPAIGN;
  }

  async getBalances(campaign: string): Promise<SupplyBalanceComputed[]> {
    return PRODUCER_COUNTRIES.map((country) =>
      computeBalance(campaign, country),
    ).filter((row): row is SupplyBalanceComputed => row !== null);
  }

  async getProductionComparisons(): Promise<ProductionComparison[]> {
    const totals = productionRecords.filter((r) => r.colour === "total");
    const completed = campaigns
      .filter((c) => !c.isEstimate)
      .slice(-5)
      .map((c) => c.code);

    return PRODUCER_COUNTRIES.map((country) => {
      const byCampaign = (code: string) =>
        totals.find((r) => r.country === country && r.campaign === code);
      const current = byCampaign(CURRENT_CAMPAIGN);
      const previous = byCampaign(PREVIOUS_CAMPAIGN);
      const fiveYear = completed
        .map((code) => byCampaign(code)?.volumeMhl ?? 0)
        .filter((v) => v > 0);
      const fiveYearAvg =
        fiveYear.reduce((sum, v) => sum + v, 0) / fiveYear.length;

      const colour = (kind: "red-rose" | "white") =>
        productionRecords.find(
          (r) =>
            r.country === country &&
            r.campaign === CURRENT_CAMPAIGN &&
            r.colour === kind,
        )?.volumeMhl ?? 0;
      const currentVolume = current?.volumeMhl ?? 0;

      return {
        country,
        currentMhl: currentVolume,
        currentStatus: current?.status ?? "estimate",
        previousMhl: previous?.volumeMhl ?? 0,
        fiveYearAvgMhl: round1(fiveYearAvg),
        vsPreviousPercent:
          ((currentVolume - (previous?.volumeMhl ?? 0)) /
            (previous?.volumeMhl ?? 1)) *
          100,
        vsFiveYearPercent: ((currentVolume - fiveYearAvg) / fiveYearAvg) * 100,
        redRoseShare: (colour("red-rose") / currentVolume) * 100,
        whiteShare: (colour("white") / currentVolume) * 100,
      };
    });
  }

  async getProductionByCampaign(): Promise<ProductionRecord[]> {
    return productionRecords.filter((r) => r.colour === "total");
  }

  async getStocks(): Promise<StockComparison[]> {
    return compareStocks(stockRecords, await this.getBalances(PREVIOUS_CAMPAIGN));
  }

  async getOpeningStocksHistory() {
    return openingStocksHistory;
  }

  async getSpainMonthlyStocks(): Promise<SpainMonthlyStocks | null> {
    return null;
  }
}

type FigureRow = Database["public"]["Tables"]["supply_figures"]["Row"];

const INFOVI = "mapa-infovi";
/** The Data API returns at most this many rows per request. */
const PAGE_SIZE = 1000;
const HL_PER_MHL = 1_000_000;

/** Spain's INFOVI figures, oldest first. Read at most hourly: they change monthly. */
const loadSpainFigures = unstable_cache(
  async (): Promise<FigureRow[]> => {
    const supabase = getSupabase();
    if (!supabase) return [];
    const rows: FigureRow[] = [];
    for (;;) {
      const page = await supabase
        .from("supply_figures")
        .select("*", { count: "exact" })
        .eq("country", "ES")
        .eq("source_id", INFOVI)
        .order("period")
        .order("measure")
        .order("product")
        .order("colour")
        .order("presentation")
        .range(rows.length, rows.length + PAGE_SIZE - 1);
      if (page.error) {
        throw new Error(`Reading supply figures failed: ${page.error.message}`);
      }
      rows.push(...page.data);
      if (page.data.length === 0 || rows.length >= (page.count ?? 0)) break;
    }
    return rows;
  },
  ["supply-figures-es"],
  { revalidate: 3600, tags: ["supply-data"] },
);

const spainFigures = cache(
  async (): Promise<FigureRow[]> => (getSupabase() ? loadSpainFigures() : []),
);

/** Hectolitres of the figures matching a month and filter, or null when none. */
function volume(
  rows: FigureRow[],
  month: string,
  match: Partial<Pick<FigureRow, "measure" | "product" | "colour" | "presentation">>,
): number | null {
  const found = rows.filter(
    (row) =>
      row.period.startsWith(month) &&
      Object.entries(match).every(
        ([field, value]) => row[field as keyof typeof match] === value,
      ),
  );
  return found.length > 0 ? found.reduce((sum, row) => sum + row.volume_hl, 0) : null;
}

/** Wine held at the end of each month, hl, by month ("2026-07"). */
function wineStocksByMonth(rows: FigureRow[]): Map<string, number> {
  const byMonth = new Map<string, number>();
  for (const row of rows) {
    if (row.measure !== "closing-stocks" || row.product !== "wine") continue;
    const month = row.period.slice(0, 7);
    byMonth.set(month, (byMonth.get(month) ?? 0) + row.volume_hl);
  }
  return byMonth;
}

/** The same month a year earlier: "2026-07" to "2025-07". */
function yearBefore(month: string): string {
  return `${Number(month.slice(0, 4)) - 1}${month.slice(4)}`;
}

/** Marketing campaign (August to July) of a month, e.g. "2025/26". */
function campaignOfMonth(month: string): string {
  const year = Number(month.slice(0, 4));
  const start = Number(month.slice(5, 7)) >= 8 ? year : year - 1;
  return `${start}/${String((start + 1) % 100).padStart(2, "0")}`;
}

/** The last day of a month: "2026-07" to "2026-07-31". */
function lastDay(month: string): string {
  const [year, number] = month.split("-").map(Number);
  return new Date(Date.UTC(year, number, 0)).toISOString().slice(0, 10);
}

const SPAIN_METHODOLOGY =
  "Month-end stocks declared to the Ministry of Agriculture (INFOVI) by producers of 1,000 hl or more and by warehouse holders, published about six weeks after the month ends. Smaller producers do not declare monthly: at 31 July 2024 the annual declaration counted another 1.5 Mhl in their hands.";

/** The fixtures, with Spain's stocks from INFOVI where they are imported. */
class LiveSupplyService extends FixtureSupplyService {
  async getStocks(): Promise<StockComparison[]> {
    const stocks = wineStocksByMonth(await spainFigures());
    const latest = [...stocks.keys()].sort().at(-1);
    const yearEarlier = latest ? stocks.get(yearBefore(latest)) : undefined;
    if (!latest || yearEarlier === undefined) return super.getStocks();

    const spain: StockRecord = {
      country: "ES",
      referenceDate: lastDay(latest),
      stocksMhl: stocks.get(latest)! / HL_PER_MHL,
      yearEarlierMhl: yearEarlier / HL_PER_MHL,
      status: "provisional",
      sourceId: INFOVI,
      methodology: SPAIN_METHODOLOGY,
    };
    return compareStocks(
      stockRecords.map((record) => (record.country === "ES" ? spain : record)),
      await this.getBalances(PREVIOUS_CAMPAIGN),
    );
  }

  async getOpeningStocksHistory() {
    const history = await super.getOpeningStocksHistory();
    const stocks = wineStocksByMonth(await spainFigures());
    if (stocks.size === 0) return history;
    // Opening stocks at 1 August are the stocks declared at 31 July.
    const spain = history.ES.flatMap(({ campaign }) => {
      const july = stocks.get(`${campaign.slice(0, 4)}-07`);
      return july === undefined ? [] : [{ campaign, stocksMhl: july / HL_PER_MHL }];
    });
    return { ...history, ES: spain };
  }

  async getSpainMonthlyStocks(): Promise<SpainMonthlyStocks | null> {
    const rows = await spainFigures();
    const stocks = wineStocksByMonth(rows);
    const latestMonth = [...stocks.keys()].sort().at(-1);
    if (!latestMonth) return null;
    const earlierMonth = yearBefore(latestMonth);

    const line = (
      label: string,
      match: Parameters<typeof volume>[2],
      isTotal = false,
    ) => {
      const latest = volume(rows, latestMonth, { measure: "closing-stocks", ...match });
      const earlier = volume(rows, earlierMonth, { measure: "closing-stocks", ...match });
      return latest === null
        ? []
        : [{
            label,
            latestMhl: latest / HL_PER_MHL,
            yearEarlierMhl: earlier === null ? null : earlier / HL_PER_MHL,
            isTotal,
          }];
    };
    const breakdown = [
      ...line("Red and rosé, bulk", { product: "wine", colour: "red-rose", presentation: "bulk" }),
      ...line("Red and rosé, packaged", { product: "wine", colour: "red-rose", presentation: "packaged" }),
      ...line("White, bulk", { product: "wine", colour: "white", presentation: "bulk" }),
      ...line("White, packaged", { product: "wine", colour: "white", presentation: "packaged" }),
      ...line("All wine", { product: "wine" }, true),
      ...line("Grape must, not concentrated", { product: "must" }),
    ];

    const latestCampaign = campaignOfMonth(latestMonth);
    const previousStart = Number(latestCampaign.slice(0, 4)) - 1;
    const previousCampaign = `${previousStart}/${String((previousStart + 1) % 100).padStart(2, "0")}`;
    const campaignPoints = (campaign: string): MonthlyStocksPoint[] =>
      [...stocks]
        .filter(([month]) => campaignOfMonth(month) === campaign)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, hl]) => ({ month, wineMhl: hl / HL_PER_MHL }));

    const latestRows = rows.filter((row) => row.period.startsWith(latestMonth));
    return {
      latestMonth,
      breakdown,
      campaigns: [latestCampaign, previousCampaign].map((campaign) => ({
        campaign,
        points: campaignPoints(campaign),
      })),
      sourceId: INFOVI,
      publishedAt: latestRows.map((row) => row.published_at).sort().at(-1)!,
      updatedAt: rows.map((row) => row.updated_at).sort().at(-1)!,
    };
  }
}

let service: SupplyService | null = null;

/** Spain's stocks from INFOVI when Supabase is configured, fixtures otherwise. */
export function getSupplyService(): SupplyService {
  service ??= new LiveSupplyService();
  return service;
}
