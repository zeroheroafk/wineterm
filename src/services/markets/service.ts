/**
 * Markets service: the typed seam between the Markets interface and the
 * data layer. The fixture-backed implementation derives everything from
 * the series fixtures; a production implementation talks to real
 * providers through the same interface.
 */

import { marketCommentary } from "@/fixtures/markets/commentary";
import { generateHistory } from "@/fixtures/markets/history";
import { seriesFixtures } from "@/fixtures/markets/series";
import { getSource } from "@/services/markets/sources";
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
import type { MarketCommentary } from "@/services/types";

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

class FixtureMarketsService implements MarketsService {
  private historyCache = new Map<string, SeriesObservation[]>();
  private rowCache = new Map<string, MarketRow>();

  private history(code: string): SeriesObservation[] {
    let cached = this.historyCache.get(code);
    if (!cached) {
      const fixture = seriesFixtures.find((f) => f.series.code === code);
      cached = fixture ? generateHistory(code, fixture.history) : [];
      this.historyCache.set(code, cached);
    }
    return cached;
  }

  private buildRow(series: MarketSeries): MarketRow | null {
    const cached = this.rowCache.get(series.code);
    if (cached) return cached;
    const history = this.history(series.code);
    const latest = history[history.length - 1];
    if (!latest) return null;

    const reference = referenceUnit(series.unit);
    const normalisedValue =
      series.unit === reference
        ? null
        : Math.round(latest.value * UNIT_TO_REFERENCE[series.unit] * 100) / 100;

    const row: MarketRow = {
      series,
      latest,
      changes: computeChanges(history),
      normalisedValue,
    };
    this.rowCache.set(series.code, row);
    return row;
  }

  private matches(row: MarketRow, filter: SeriesFilter): boolean {
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
        const age =
          (new Date(`2026-08-21T00:00:00Z`).getTime() -
            new Date(`${latest.date}T00:00:00Z`).getTime()) /
          DAY_MS;
        if (age > days) return false;
      }
    }
    return true;
  }

  async listSeries(kind?: MarketKind): Promise<MarketSeries[]> {
    return seriesFixtures
      .map((f) => f.series)
      .filter((s) => (kind ? s.kind === kind : true));
  }

  async getSeries(code: string): Promise<MarketSeries | null> {
    return seriesFixtures.find((f) => f.series.code === code)?.series ?? null;
  }

  async getRows(kind: MarketKind, filter: SeriesFilter = {}): Promise<MarketRow[]> {
    const rows: MarketRow[] = [];
    for (const fixture of seriesFixtures) {
      if (fixture.series.kind !== kind) continue;
      const row = this.buildRow(fixture.series);
      if (row && this.matches(row, filter)) rows.push(row);
    }
    return rows.sort((a, b) =>
      `${a.series.country}-${a.series.region}-${a.series.code}`.localeCompare(
        `${b.series.country}-${b.series.region}-${b.series.code}`,
      ),
    );
  }

  async getRow(code: string): Promise<MarketRow | null> {
    const series = await this.getSeries(code);
    return series ? this.buildRow(series) : null;
  }

  async getHistory(
    code: string,
    range: TimeRangeKey = "max",
  ): Promise<SeriesObservation[]> {
    const history = this.history(code);
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
    const history = this.history(code);
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
    const history = this.history(code);
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
    const series = await this.getSeries(code);
    if (!series) return [];
    const candidates = seriesFixtures
      .map((f) => f.series)
      .filter((s) => s.code !== code && s.kind === series.kind)
      .map((s) => ({
        s,
        score:
          (s.region === series.region ? 2 : 0) +
          (s.country === series.country ? 1 : 0) +
          (s.colour && s.colour === series.colour ? 1 : 0) +
          (s.classification === series.classification ? 1 : 0),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
    const rows: MarketRow[] = [];
    for (const { s } of candidates) {
      const row = this.buildRow(s);
      if (row) rows.push(row);
    }
    return rows;
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

export function getMarketsService(): MarketsService {
  service ??= new FixtureMarketsService();
  return service;
}
