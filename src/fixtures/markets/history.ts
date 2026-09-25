/**
 * ILLUSTRATIVE FIXTURE DATA: deterministic series histories.
 *
 * Development observations are generated from a seeded pseudo-random
 * walk so every build and request sees identical values. Nothing here is
 * a real market observation; the shapes are plausible, the values are
 * not. See src/fixtures/README.md.
 */

import type { SeriesObservation } from "@/services/markets/types";

/** Latest observation date shared by weekly development series. */
export const LATEST_WEEKLY_DATE = "2026-08-20";
export const FIXTURES_UPDATED_AT = "2026-08-21T09:30:00Z";

export interface HistoryConfig {
  /** Anchor value: the generated series ends near this latest value. */
  latestValue: number;
  /** Number of observations to generate. */
  points: number;
  /** Days between observations (7 = weekly, 28 = four-weekly). */
  stepDays: number;
  /** Per-step noise as a fraction of the base value. */
  volatility: number;
  /** Total drift across the whole history as a fraction (e.g. 0.12). */
  drift: number;
  /** Seasonal swing amplitude as a fraction; peaks before harvest. */
  seasonality: number;
  /** Half-width of the published range as a fraction; omit for no range. */
  rangeSpread?: number;
}

/** Deterministic 32-bit PRNG (mulberry32). */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashCode(code: string): number {
  let h = 2166136261;
  for (let i = 0; i < code.length; i++) {
    h ^= code.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Generates the observation list for one series, oldest first. The walk
 * is built backwards from the anchored latest value so table figures stay
 * consistent with the homepage fixtures.
 */
export function generateHistory(
  code: string,
  config: HistoryConfig,
): SeriesObservation[] {
  const rand = mulberry32(hashCode(code));
  const last = new Date(`${LATEST_WEEKLY_DATE}T00:00:00Z`);

  // Build multiplicative steps forward, then rescale so the final value
  // lands exactly on the anchor.
  const factors: number[] = [1];
  for (let i = 1; i < config.points; i++) {
    const noise = (rand() * 2 - 1) * config.volatility;
    const driftStep = config.drift / config.points;
    factors.push(factors[i - 1] * (1 + driftStep + noise));
  }
  const finalFactor = factors[factors.length - 1];

  // Seasonal component peaking in late summer (pre-harvest).
  const seasonalFor = (date: Date) => {
    const dayOfYear =
      (Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) -
        Date.UTC(date.getUTCFullYear(), 0, 1)) /
      86400000;
    return (
      1 + config.seasonality * Math.sin(((dayOfYear - 140) / 365) * 2 * Math.PI)
    );
  };
  const finalSeasonal = seasonalFor(last);

  const observations: SeriesObservation[] = [];
  for (let i = 0; i < config.points; i++) {
    const date = new Date(last);
    date.setUTCDate(date.getUTCDate() - (config.points - 1 - i) * config.stepDays);

    const value = round2(
      (config.latestValue * factors[i] * seasonalFor(date)) /
        (finalFactor * finalSeasonal),
    );

    const isLatest = i === config.points - 1;
    const published = new Date(date);
    published.setUTCDate(published.getUTCDate() + 1);

    observations.push({
      date: isoDate(date),
      value,
      min:
        config.rangeSpread !== undefined
          ? round2(value * (1 - config.rangeSpread))
          : undefined,
      max:
        config.rangeSpread !== undefined
          ? round2(value * (1 + config.rangeSpread))
          : undefined,
      status: isLatest ? "provisional" : "final",
      publishedAt: `${isoDate(published)}T08:00:00Z`,
      updatedAt: FIXTURES_UPDATED_AT,
      revised: false,
    });
  }
  return observations;
}
