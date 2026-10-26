/**
 * Consumer service: what a bottle of wine is worth when it leaves Spain,
 * Portugal, France and Italy, from the Eurostat Comext figures read
 * through the bottle aggregates in the database, and the price of wine to
 * the consumer, from the consumer prices imported from Eurostat and the
 * US Bureau of Labor Statistics. Without a database there is no consumer
 * service, and the pages say that no figures are connected.
 */

import { cacheLife, cacheTag } from "next/cache";

import type { Database } from "@/lib/database.types";
import { formatMonthYear } from "@/lib/format";
import { getSupabase } from "@/lib/supabase";
import {
  BOTTLE_CATEGORIES,
  BOTTLE_LITRES,
  perBottle,
  type BottleCategory,
  type BottleMonth,
  type BottleOrigin,
  type BottleValueRow,
  type BottleValues,
  type UsWinePrice,
  type WinePriceIndexRow,
  type WinePriceIndices,
} from "@/services/consumer/types";
import { getSource } from "@/services/markets/sources";
import { TRADE_CATEGORY_CODES } from "@/services/trade/types";
import {
  countryName,
  PRODUCER_COUNTRIES,
  type DataStatus,
  type ProducerCountry,
} from "@/services/types";

export interface ConsumerService {
  getBottleValues(): Promise<BottleValues>;
  /** Eurostat's consumer price indices of wine; null without figures. */
  getWinePriceIndices(): Promise<WinePriceIndices | null>;
  /** The BLS average price of table wine in the US; null without figures. */
  getUsWinePrice(): Promise<UsWinePrice | null>;
}

type Rows<Name extends keyof Database["public"]["Functions"]> =
  Database["public"]["Functions"][Name]["Returns"];

export type PriceRow = Database["public"]["Tables"]["consumer_prices"]["Row"];

export interface BottleSnapshot {
  /** Last month of the reference period, e.g. "2026-07-01". */
  endMonth: string;
  updatedAt: string;
  destinations: Rows<"trade_bottle_destinations">;
  monthly: Rows<"trade_bottle_monthly">;
}

/** Destinations listed for each origin. */
const DESTINATIONS_SHOWN = 8;
const MONTHS_CHARTED = 36;
const LITRES_PER_MILLION_BOTTLES = 1_000_000 * BOTTLE_LITRES;
/** The first month the consumer price pages read: a decade of history. */
const PRICES_FROM = "2015-01-01";
/** The Data API returns at most this many rows per request. */
const PAGE_SIZE = 1000;
/** The span of the index's longer comparison. */
const LONG_COMPARISON_MONTHS = 60;

/**
 * The bottle aggregates, read at most hourly, as the trade figures they
 * come from are. The period ends at the latest month every reporter has
 * published, and a read fails rather than divide a value by part of its
 * litres, so a regeneration keeps the last good page instead.
 */
async function loadBottleSnapshot(): Promise<BottleSnapshot> {
  "use cache";
  cacheLife("hours");
  cacheTag("trade-data");

  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured");

  const latest = await supabase.rpc("trade_latest_month");
  if (latest.error) {
    throw new Error(`Reading the latest trade month failed: ${latest.error.message}`);
  }
  const endMonth = latest.data;
  if (!endMonth) throw new Error("The database holds no trade flows");

  const [destinations, monthly, imported] = await Promise.all([
    supabase.rpc("trade_bottle_destinations", {
      end_month: endMonth,
      top_n: DESTINATIONS_SHOWN,
    }),
    supabase.rpc("trade_bottle_monthly", { end_month: endMonth, months: MONTHS_CHARTED }),
    supabase
      .from("trade_flows")
      .select("imported_at")
      .order("imported_at", { ascending: false })
      .limit(1)
      .single(),
  ]);
  for (const result of [destinations, monthly, imported]) {
    if (result.error) {
      throw new Error(`Reading bottle aggregates failed: ${result.error.message}`);
    }
  }
  if ([...destinations.data!, ...monthly.data!].some((row) => !row.litres_complete)) {
    throw new Error(
      "Trade flows in the reference period lack litres; see the notes in import_runs",
    );
  }
  return {
    endMonth,
    updatedAt: imported.data!.imported_at,
    destinations: destinations.data!,
    monthly: monthly.data!,
  };
}

/** Every consumer price from PRICES_FROM, read at most hourly: they change monthly. */
async function loadConsumerPrices(): Promise<PriceRow[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("consumer-prices");

  const supabase = getSupabase();
  if (!supabase) return [];
  const rows: PriceRow[] = [];
  for (;;) {
    const page = await supabase
      .from("consumer_prices")
      .select("*", { count: "exact" })
      .gte("period", PRICES_FROM)
      .order("country")
      .order("product")
      .order("measure")
      .order("period")
      .range(rows.length, rows.length + PAGE_SIZE - 1);
    if (page.error) {
      throw new Error(`Reading consumer prices failed: ${page.error.message}`);
    }
    rows.push(...page.data);
    if (page.data.length === 0 || rows.length >= (page.count ?? 0)) break;
  }
  return rows;
}

/** Percentage change, or null when there is nothing to compare with. */
function change(current: number | null, previous: number | null): number | null {
  if (current === null || previous === null || previous <= 0) return null;
  return (current / previous - 1) * 100;
}

/** "2026-06-01" to "2026-06", and back a number of months. */
function monthOf(date: string, back = 0): string {
  const [year, month] = date.split("-").map(Number);
  const shifted = new Date(Date.UTC(year, month - 1 - back, 1));
  return shifted.toISOString().slice(0, 7);
}

function isProducer(code: string): code is ProducerCountry {
  return (PRODUCER_COUNTRIES as string[]).includes(code);
}

/** One row of the bottle tables, or null for a destination without litres. */
function bottleRow(row: Rows<"trade_bottle_destinations">[number]): BottleValueRow | null {
  const eurPerBottle = perBottle(row.value_eur ?? 0, row.litres ?? 0);
  if (eurPerBottle === null) return null;
  const prior = perBottle(row.value_eur_prior_year ?? 0, row.litres_prior_year ?? 0);
  return {
    destination: row.partner,
    bottlesM: row.litres / LITRES_PER_MILLION_BOTTLES,
    eurPerBottle,
    yoyPercent: change(eurPerBottle, prior),
  };
}

/**
 * The bottle pages' figures from the aggregates: for each category and
 * origin, the exports to every destination and to the leading ones, and
 * the value per bottle month by month.
 */
export function bottleValues(snapshot: BottleSnapshot): Omit<BottleValues, "source"> {
  const origins = {} as Record<BottleCategory, BottleOrigin[]>;
  const monthly = {} as Record<BottleCategory, BottleMonth[]>;
  for (const category of BOTTLE_CATEGORIES) {
    const code = TRADE_CATEGORY_CODES[category];
    const rows = snapshot.destinations.filter((row) => row.product === code);
    origins[category] = PRODUCER_COUNTRIES.flatMap((origin) => {
      const own = rows
        .filter((row) => row.reporter === origin)
        .sort((a, b) => a.place - b.place);
      const world = own.find((row) => row.partner === "WORLD");
      const worldRow = world ? bottleRow(world) : null;
      if (!worldRow) return [];
      return [{
        origin,
        world: worldRow,
        destinations: own
          .filter((row) => row.partner !== "WORLD")
          .map(bottleRow)
          .filter((row): row is BottleValueRow => row !== null),
      }];
    });

    const months = new Map<string, BottleMonth>();
    for (let back = MONTHS_CHARTED - 1; back >= 0; back--) {
      const month = monthOf(snapshot.endMonth, back);
      months.set(month, { month, values: {} });
    }
    for (const row of snapshot.monthly) {
      if (row.product !== code || !isProducer(row.reporter)) continue;
      const point = months.get(monthOf(row.period));
      const value = perBottle(row.value_eur ?? 0, row.litres ?? 0);
      if (point && value !== null) point.values[row.reporter] = value;
    }
    monthly[category] = [...months.values()];
  }

  const latestMonth = monthOf(snapshot.endMonth);
  return {
    period: { label: `12 months to ${formatMonthYear(latestMonth)}`, latestMonth },
    origins,
    monthly,
    updatedAt: snapshot.updatedAt,
  };
}

function statusOf(value: string): DataStatus {
  return value === "provisional" || value === "estimate" ? value : "final";
}

/** The EU first, then the producer countries, then the others by name. */
function countryOrder(a: string, b: string): number {
  const rank = (code: string) =>
    code === "EU" ? 0 : isProducer(code) ? 1 + PRODUCER_COUNTRIES.indexOf(code) : 9;
  return rank(a) - rank(b) || countryName(a).localeCompare(countryName(b), "en-GB");
}

/**
 * Eurostat's wine price indices from the stored rows: each country's
 * latest month with its published annual rate and the change over five
 * years, and the monthly history of the EU and the producer countries.
 */
export function winePriceIndices(
  rows: PriceRow[],
): Omit<WinePriceIndices, "source"> | null {
  const indices = rows.filter(
    (row) =>
      row.source_id === "eurostat-hicp" &&
      row.product === "wine-from-grapes" &&
      row.measure === "index",
  );
  if (indices.length === 0) return null;

  const byCountry = new Map<string, PriceRow[]>();
  for (const row of indices) {
    byCountry.set(row.country, [...(byCountry.get(row.country) ?? []), row]);
  }
  const tableRows: WinePriceIndexRow[] = [...byCountry.entries()]
    .map(([country, own]) => {
      const sorted = [...own].sort((a, b) => a.period.localeCompare(b.period));
      const latest = sorted[sorted.length - 1];
      const month = monthOf(latest.period);
      const earlier = sorted.find(
        (row) => monthOf(row.period) === monthOf(latest.period, LONG_COMPARISON_MONTHS),
      );
      return {
        country,
        month,
        index: Number(latest.value),
        annualRate: latest.annual_rate === null ? null : Number(latest.annual_rate),
        fiveYearPercent: earlier ? change(Number(latest.value), Number(earlier.value)) : null,
        status: statusOf(latest.status),
      };
    })
    .sort((a, b) => countryOrder(a.country, b.country));

  const charted = new Set<string>(["EU", ...PRODUCER_COUNTRIES]);
  const history = new Map<string, { month: string; values: Partial<Record<string, number>> }>();
  for (const row of [...indices].sort((a, b) => a.period.localeCompare(b.period))) {
    if (!charted.has(row.country)) continue;
    const month = monthOf(row.period);
    const point = history.get(month) ?? { month, values: {} };
    point.values[row.country] = Number(row.value);
    history.set(month, point);
  }

  const latestMonth = tableRows.map((row) => row.month).sort().at(-1)!;
  const latestRows = indices.filter((row) => monthOf(row.period) === latestMonth);
  return {
    latestMonth,
    rows: tableRows,
    history: [...history.values()],
    publishedAt: latestRows.map((row) => row.published_at).sort().at(-1)!,
    updatedAt: indices.map((row) => row.updated_at).sort().at(-1)!,
  };
}

/** The BLS average price of table wine from the stored rows. */
export function usWinePrice(rows: PriceRow[]): Omit<UsWinePrice, "source"> | null {
  const prices = rows
    .filter(
      (row) =>
        row.source_id === "bls-average-prices" &&
        row.country === "US" &&
        row.product === "table-wine" &&
        row.measure === "average-price",
    )
    .sort((a, b) => a.period.localeCompare(b.period));
  const latest = prices[prices.length - 1];
  if (!latest) return null;

  const month = monthOf(latest.period);
  const usdPerLitre = Number(latest.value);
  const byMonth = new Map(prices.map((row) => [monthOf(row.period), Number(row.value)]));
  const yearEarlier = byMonth.get(monthOf(latest.period, 12)) ?? null;

  // Every month from the first, so a month without a price leaves a gap.
  const history: UsWinePrice["history"] = [];
  for (let current = monthOf(prices[0].period); current <= month; ) {
    const value = byMonth.get(current);
    history.push({
      month: current,
      usdPerBottle: value === undefined ? null : value * BOTTLE_LITRES,
    });
    current = monthOf(`${current}-01`, -1);
  }
  return {
    month,
    usdPerLitre,
    usdPerBottle: usdPerLitre * BOTTLE_LITRES,
    yoyPercent: change(usdPerLitre, yearEarlier),
    history,
    updatedAt: prices.map((row) => row.updated_at).sort().at(-1)!,
  };
}

class DatabaseConsumerService implements ConsumerService {
  async getBottleValues(): Promise<BottleValues> {
    const comext = getSource("eurostat-comext");
    return {
      ...bottleValues(await loadBottleSnapshot()),
      source: { name: "Eurostat Comext, calculated by WineTerm", url: comext.url },
    };
  }

  async getWinePriceIndices(): Promise<WinePriceIndices | null> {
    const indices = winePriceIndices(await loadConsumerPrices());
    if (!indices) return null;
    const source = getSource("eurostat-hicp");
    return { ...indices, source: { name: source.name, url: source.url } };
  }

  async getUsWinePrice(): Promise<UsWinePrice | null> {
    const price = usWinePrice(await loadConsumerPrices());
    if (!price) return null;
    const source = getSource("bls-average-prices");
    return { ...price, source: { name: source.name, url: source.url } };
  }
}

let service: ConsumerService | null = null;

/** The figures when Supabase is configured; null otherwise. */
export function getConsumerService(): ConsumerService | null {
  if (!getSupabase()) return null;
  service ??= new DatabaseConsumerService();
  return service;
}
