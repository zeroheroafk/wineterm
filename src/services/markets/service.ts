/**
 * Markets service: the typed seam between the Markets interface and the
 * data layer. Series come from two catalogues read through one
 * implementation: the database, which holds the series imported from
 * real sources, and the illustrative fixtures for everything not yet
 * connected. A real series and a sample behave alike in every table,
 * filter and chart; their source and observation status say which is
 * which, and real series are listed first.
 */

import { unstable_cache } from "next/cache";
import { cache } from "react";

import { marketCommentary } from "@/fixtures/markets/commentary";
import { FIXTURES_UPDATED_AT, generateHistory } from "@/fixtures/markets/history";
import { seriesFixtures } from "@/fixtures/markets/series";
import type { Database } from "@/lib/database.types";
import { getSupabase } from "@/lib/supabase";
import {
  getSource,
  SOURCE_REGISTRY,
  type SourceId,
} from "@/services/markets/sources";
import {
  TIME_RANGES,
  UNIT_TO_REFERENCE,
  referenceUnit,
  type CampaignAverage,
  type MarketKind,
  type MarketRow,
  type MarketSeries,
  type SeriesChanges,
  type SeriesObservation,
  type TimeRangeKey,
} from "@/services/markets/types";
import {
  COUNTRY_NAMES,
  type CountryCode,
  type DataStatus,
  type MarketCommentary,
} from "@/services/types";

/**
 * String filters as they arrive from the URL. Each field applies only to
 * the series kinds where it makes sense; unknown values simply match
 * nothing rather than throwing.
 */
export interface SeriesFilter {
  country?: string;
  region?: string;
  classification?: string;
  colour?: string;
  category?: string;
  campaign?: string;
  currency?: string;
  unit?: string;
  /** Observation recency in days ("7", "30"). */
  window?: string;
  /** Data classification of the source (official, reported, ...). */
  dataClass?: string;
  variety?: string;
  harvest?: string;
  sourceType?: string;
  product?: string;
}

export interface FilterOptions {
  countries: string[];
  regions: string[];
  campaigns: string[];
  units: string[];
  varieties: string[];
  harvestYears: string[];
}

export interface MarketsService {
  listSeries(kind?: MarketKind): Promise<MarketSeries[]>;
  getSeries(code: string): Promise<MarketSeries | null>;
  getRows(kind: MarketKind, filter?: SeriesFilter): Promise<MarketRow[]>;
  getRow(code: string): Promise<MarketRow | null>;
  getHistory(code: string, range?: TimeRangeKey): Promise<SeriesObservation[]>;
  getAvailableRanges(code: string): Promise<TimeRangeKey[]>;
  getCampaignAverages(code: string): Promise<CampaignAverage[]>;
  getRelated(code: string, limit?: number): Promise<MarketRow[]>;
  getFilterOptions(kind: MarketKind): Promise<FilterOptions>;
  getCommentary(kind: MarketKind): Promise<MarketCommentary | null>;
}

const DAY_MS = 86400000;

/**
 * The day the fixtures were written for. Recency filters count back from
 * it for sample series, and from today for real ones.
 */
const FIXTURES_TODAY_MS = Date.parse(`${FIXTURES_UPDATED_AT.slice(0, 10)}T00:00:00Z`);

/** Marketing campaign (Aug to Jul) containing a date. */
export function campaignOf(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  const year = date.getUTCFullYear();
  const startYear = date.getUTCMonth() >= 7 ? year : year - 1;
  return `${startYear}/${String((startYear + 1) % 100).padStart(2, "0")}`;
}

function percentChange(current: number, previous: number): number {
  return ((current - previous) / previous) * 100;
}

/** Observation closest to `targetDaysBack` before the latest, within tolerance. */
function observationNear(
  history: SeriesObservation[],
  latestDate: string,
  targetDaysBack: number,
  toleranceDays: number,
): SeriesObservation | null {
  const latestMs = new Date(`${latestDate}T00:00:00Z`).getTime();
  let best: SeriesObservation | null = null;
  let bestDistance = Infinity;
  for (const obs of history) {
    const daysBack = (latestMs - new Date(`${obs.date}T00:00:00Z`).getTime()) / DAY_MS;
    if (daysBack <= 0) continue;
    const distance = Math.abs(daysBack - targetDaysBack);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = obs;
    }
  }
  return bestDistance <= toleranceDays ? best : null;
}

function computeChanges(history: SeriesObservation[]): SeriesChanges {
  const latest = history[history.length - 1];
  if (!latest) {
    return { weekPercent: null, monthPercent: null, yoyPercent: null };
  }
  const week = observationNear(history, latest.date, 7, 4);
  const month = observationNear(history, latest.date, 30, 10);
  const yoy = observationNear(history, latest.date, 365, 21);
  return {
    weekPercent: week ? percentChange(latest.value, week.value) : null,
    monthPercent: month ? percentChange(latest.value, month.value) : null,
    yoyPercent: yoy ? percentChange(latest.value, yoy.value) : null,
  };
}

/** A series and its observations, oldest first. */
interface CatalogueEntry {
  series: MarketSeries;
  history: SeriesObservation[];
}

/**
 * Whether a row is an illustrative sample rather than a real price: every
 * fixture observation says so, and no imported one does.
 */
export function isIllustrative(row: MarketRow): boolean {
  return row.latest.status === "illustrative";
}

let fixtureEntries: CatalogueEntry[] | null = null;

/** The illustrative series, generated once per server. */
function fixtureCatalogue(): CatalogueEntry[] {
  fixtureEntries ??= seriesFixtures.map((fixture) => ({
    series: fixture.series,
    history: generateHistory(fixture.series.code, fixture.history),
  }));
  return fixtureEntries;
}

type SeriesRow = Database["public"]["Tables"]["market_series"]["Row"];
type ObservationRow = Database["public"]["Tables"]["market_observations"]["Row"];

/** The Data API returns at most this many rows per request. */
const PAGE_SIZE = 1000;

/** A stored series, or null when the site cannot describe its source or country. */
function toSeries(row: SeriesRow): MarketSeries | null {
  if (!(row.source_id in SOURCE_REGISTRY) || !(row.country in COUNTRY_NAMES)) {
    return null;
  }
  // The table's check constraints hold the other coded fields to the
  // values of their types.
  return {
    code: row.code,
    kind: row.kind as MarketKind,
    name: row.name,
    country: row.country as CountryCode,
    region: row.region,
    appellation: row.appellation ?? undefined,
    colour: (row.colour ?? undefined) as MarketSeries["colour"],
    classification: (row.classification ?? undefined) as MarketSeries["classification"],
    category: (row.category ?? undefined) as MarketSeries["category"],
    variety: row.variety ?? undefined,
    qualityCategory: row.quality_category ?? undefined,
    harvestYear: row.harvest_year ?? undefined,
    mustProduct: (row.must_product ?? undefined) as MarketSeries["mustProduct"],
    spec: row.spec ?? undefined,
    product: row.product,
    unit: row.unit as MarketSeries["unit"],
    currency: row.currency as MarketSeries["currency"],
    campaign: row.campaign,
    sourceId: row.source_id as SourceId,
    sourceType: row.source_type as MarketSeries["sourceType"],
    verification: row.verification as MarketSeries["verification"],
    methodology: row.methodology,
  };
}

function toObservation(row: ObservationRow): SeriesObservation {
  return {
    date: row.observed_on,
    value: row.value,
    min: row.min_value ?? undefined,
    max: row.max_value ?? undefined,
    status: row.status as DataStatus,
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
    revised: row.revised,
  };
}

/**
 * The series imported from real sources, with every observation. Read at
 * most hourly: the sources publish weekly, and the pages that filter by
 * query string would otherwise read the tables on each request.
 */
const loadDatabaseCatalogue = unstable_cache(
  async (): Promise<CatalogueEntry[]> => {
    const supabase = getSupabase();
    if (!supabase) return [];

    const series = await supabase.from("market_series").select("*").order("code");
    if (series.error) {
      throw new Error(`Reading market series failed: ${series.error.message}`);
    }

    const observations: ObservationRow[] = [];
    for (;;) {
      const page = await supabase
        .from("market_observations")
        .select("*", { count: "exact" })
        .order("series_code")
        .order("observed_on")
        .range(observations.length, observations.length + PAGE_SIZE - 1);
      if (page.error) {
        throw new Error(`Reading market observations failed: ${page.error.message}`);
      }
      observations.push(...page.data);
      if (page.data.length === 0 || observations.length >= (page.count ?? 0)) break;
    }

    const histories = new Map<string, SeriesObservation[]>();
    for (const row of observations) {
      const history = histories.get(row.series_code) ?? [];
      history.push(toObservation(row));
      histories.set(row.series_code, history);
    }
    return series.data.flatMap((row) => {
      const mapped = toSeries(row);
      const history = histories.get(row.code);
      return mapped && history ? [{ series: mapped, history }] : [];
    });
  },
  ["market-catalogue"],
  { revalidate: 3600, tags: ["market-data"] },
);

/**
 * Every series, once per request: the imported ones, then the fixtures.
 * A fixture whose code has been imported gives way to the real series.
 */
const loadCatalogue = cache(async (): Promise<CatalogueEntry[]> => {
  const imported = getSupabase() ? await loadDatabaseCatalogue() : [];
  const codes = new Set(imported.map((entry) => entry.series.code));
  return [
    ...imported,
    ...fixtureCatalogue().filter((entry) => !codes.has(entry.series.code)),
  ];
});

function buildRow({ series, history }: CatalogueEntry): MarketRow | null {
  const latest = history[history.length - 1];
  if (!latest) return null;

  const reference = referenceUnit(series.unit);
  const normalisedValue =
    series.unit === reference
      ? null
      : Math.round(latest.value * UNIT_TO_REFERENCE[series.unit] * 100) / 100;

  return {
    series,
    latest,
    changes: computeChanges(history),
    normalisedValue,
  };
}

function matches(row: MarketRow, filter: SeriesFilter): boolean {
  const { series, latest } = row;
  if (filter.country && series.country !== filter.country) return false;
  if (filter.region && series.region !== filter.region) return false;
  if (filter.classification && series.classification !== filter.classification)
    return false;
  if (filter.colour && series.colour !== filter.colour) return false;
  if (filter.category && series.category !== filter.category) return false;
  if (filter.campaign && series.campaign !== filter.campaign) return false;
  if (filter.currency && series.currency !== filter.currency) return false;
  if (filter.unit && series.unit !== filter.unit) return false;
  if (filter.variety && series.variety !== filter.variety) return false;
  if (filter.harvest && String(series.harvestYear) !== filter.harvest)
    return false;
  if (filter.sourceType && series.sourceType !== filter.sourceType)
    return false;
  if (filter.product && series.mustProduct !== filter.product) return false;
  if (
    filter.dataClass &&
    getSource(series.sourceId).classification !== filter.dataClass
  )
    return false;
  if (filter.window) {
    const days = Number(filter.window);
    if (Number.isFinite(days)) {
      const today = isIllustrative(row) ? FIXTURES_TODAY_MS : Date.now();
      const age = (today - new Date(`${latest.date}T00:00:00Z`).getTime()) / DAY_MS;
      if (age > days) return false;
    }
  }
  return true;
}

/** Real series first, then by country, region and code. */
function compareRows(a: MarketRow, b: MarketRow): number {
  return (
    Number(isIllustrative(a)) - Number(isIllustrative(b)) ||
    `${a.series.country}-${a.series.region}-${a.series.code}`.localeCompare(
      `${b.series.country}-${b.series.region}-${b.series.code}`,
    )
  );
}

class CatalogueMarketsService implements MarketsService {
  constructor(private readonly catalogue: () => Promise<CatalogueEntry[]>) {}

  private async entry(code: string): Promise<CatalogueEntry | undefined> {
    return (await this.catalogue()).find((entry) => entry.series.code === code);
  }

  async listSeries(kind?: MarketKind): Promise<MarketSeries[]> {
    return (await this.catalogue())
      .map((entry) => entry.series)
      .filter((s) => (kind ? s.kind === kind : true));
  }

  async getSeries(code: string): Promise<MarketSeries | null> {
    return (await this.entry(code))?.series ?? null;
  }

  async getRows(kind: MarketKind, filter: SeriesFilter = {}): Promise<MarketRow[]> {
    const rows: MarketRow[] = [];
    for (const entry of await this.catalogue()) {
      if (entry.series.kind !== kind) continue;
      const row = buildRow(entry);
      if (row && matches(row, filter)) rows.push(row);
    }
    return rows.sort(compareRows);
  }

  async getRow(code: string): Promise<MarketRow | null> {
    const entry = await this.entry(code);
    return entry ? buildRow(entry) : null;
  }

  async getHistory(
    code: string,
    range: TimeRangeKey = "max",
  ): Promise<SeriesObservation[]> {
    const history = (await this.entry(code))?.history ?? [];
    const spec = TIME_RANGES.find((r) => r.key === range);
    if (!spec || spec.days === null || history.length === 0) return history;
    const latest = history[history.length - 1];
    const cutoff =
      new Date(`${latest.date}T00:00:00Z`).getTime() - spec.days * DAY_MS;
    return history.filter(
      (obs) => new Date(`${obs.date}T00:00:00Z`).getTime() >= cutoff,
    );
  }

  async getAvailableRanges(code: string): Promise<TimeRangeKey[]> {
    const history = (await this.entry(code))?.history ?? [];
    if (history.length < 2) return ["max"];
    const spanDays =
      (new Date(`${history[history.length - 1].date}T00:00:00Z`).getTime() -
        new Date(`${history[0].date}T00:00:00Z`).getTime()) /
      DAY_MS;
    return TIME_RANGES.filter(
      (r) => r.days === null || spanDays >= r.days * 0.95,
    ).map((r) => r.key);
  }

  async getCampaignAverages(code: string): Promise<CampaignAverage[]> {
    const history = (await this.entry(code))?.history ?? [];
    const groups = new Map<string, number[]>();
    for (const obs of history) {
      const campaign = campaignOf(obs.date);
      const list = groups.get(campaign) ?? [];
      list.push(obs.value);
      groups.set(campaign, list);
    }
    const ordered = [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
    const averages: CampaignAverage[] = ordered.map(([campaign, values]) => {
      const average =
        Math.round(
          (values.reduce((sum, v) => sum + v, 0) / values.length) * 100,
        ) / 100;
      return { campaign, average, observations: values.length, changePercent: null };
    });
    for (let i = 1; i < averages.length; i++) {
      averages[i].changePercent = percentChange(
        averages[i].average,
        averages[i - 1].average,
      );
    }
    return averages.slice(-5);
  }

  async getRelated(code: string, limit = 4): Promise<MarketRow[]> {
    const entries = await this.catalogue();
    const entry = entries.find((e) => e.series.code === code);
    const current = entry ? buildRow(entry) : null;
    if (!current) return [];
    const { series } = current;
    // Real series relate first to real ones, samples to samples.
    return entries
      .filter((e) => e.series.code !== code && e.series.kind === series.kind)
      .flatMap((e) => {
        const row = buildRow(e);
        return row ? [row] : [];
      })
      .map((row) => ({
        row,
        score:
          (isIllustrative(row) === isIllustrative(current) ? 3 : 0) +
          (row.series.region === series.region ? 2 : 0) +
          (row.series.country === series.country ? 1 : 0) +
          (row.series.colour && row.series.colour === series.colour ? 1 : 0) +
          (row.series.classification === series.classification ? 1 : 0),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ row }) => row);
  }

  async getFilterOptions(kind: MarketKind): Promise<FilterOptions> {
    const series = await this.listSeries(kind);
    const distinct = (values: (string | undefined)[]) =>
      [...new Set(values.filter((v): v is string => Boolean(v)))].sort();
    return {
      countries: distinct(series.map((s) => s.country)),
      regions: distinct(series.map((s) => s.region)),
      campaigns: distinct(series.map((s) => s.campaign)),
      units: distinct(series.map((s) => s.unit)),
      varieties: distinct(series.map((s) => s.variety)),
      harvestYears: distinct(series.map((s) => s.harvestYear?.toString())),
    };
  }

  async getCommentary(kind: MarketKind): Promise<MarketCommentary | null> {
    return marketCommentary[kind] ?? null;
  }
}

let service: MarketsService | null = null;

/** Imported series when Supabase is configured, beside the fixtures. */
export function getMarketsService(): MarketsService {
  service ??= new CatalogueMarketsService(loadCatalogue);
  return service;
}

/** True when at least one series of a kind carries real prices. */
export async function hasRealSeries(kind: MarketKind): Promise<boolean> {
  const rows = await getMarketsService().getRows(kind);
  return rows.some((row) => !isIllustrative(row));
}
