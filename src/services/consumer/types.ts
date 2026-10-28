/**
 * Consumer domain model: what a bottle of wine is worth when it leaves
 * Spain, Portugal, France and Italy, and how the price of wine to the
 * consumer moves, country by country.
 */

import type { TradePeriod } from "@/services/trade/types";
import type { DataSource, DataStatus, ProducerCountry } from "@/services/types";

/** Litres in the bottle every value per bottle refers to. */
export const BOTTLE_LITRES = 0.75;

/** The customs categories sold mostly in bottles. */
export type BottleCategory = "bottled" | "sparkling";

export const BOTTLE_CATEGORIES: BottleCategory[] = ["bottled", "sparkling"];

export const BOTTLE_CATEGORY_LABELS: Record<BottleCategory, string> = {
  bottled: "Still wine",
  sparkling: "Sparkling wine",
};

/** EUR per 75 cl bottle from a value in euros and a volume in litres. */
export function perBottle(valueEur: number, litres: number): number | null {
  return litres > 0 ? (valueEur / litres) * BOTTLE_LITRES : null;
}

/** One origin's exports to one destination, or to every destination. */
export interface BottleValueRow {
  /** ISO 3166-1 alpha-2 code; WORLD for every destination together. */
  destination: string;
  /** Million 75 cl bottles: the litres exported over 0.75. */
  bottlesM: number;
  /** Value per 75 cl bottle, EUR. */
  eurPerBottle: number;
  /** Change of the value per bottle on the 12 months before, percent. */
  yoyPercent: number | null;
}

export interface BottleOrigin {
  origin: ProducerCountry;
  /** Exports to every destination. */
  world: BottleValueRow;
  /** The leading destinations by volume. */
  destinations: BottleValueRow[];
}

/** One month of values per bottle, EUR, by origin. */
export interface BottleMonth {
  month: string; // "2026-07"
  values: Partial<Record<ProducerCountry, number>>;
}

export interface BottleValues {
  period: TradePeriod;
  /** Each category's origins, in the order of PRODUCER_COUNTRIES. */
  origins: Record<BottleCategory, BottleOrigin[]>;
  /** Each category's value per bottle by month, oldest first. */
  monthly: Record<BottleCategory, BottleMonth[]>;
  source: DataSource;
  updatedAt: string;
}

/** One country's latest consumer price index of wine. */
export interface WinePriceIndexRow {
  /** ISO 3166-1 alpha-2 code, or EU for the European Union. */
  country: string;
  /** The latest month, e.g. "2026-09". */
  month: string;
  /** Index, 2025 = 100. */
  index: number;
  /** Change on the same month a year earlier, percent, as published. */
  annualRate: number | null;
  /** Change on the same month five years earlier, percent, from the indices. */
  fiveYearPercent: number | null;
  status: DataStatus;
}

export interface WinePriceIndices {
  /** The latest month any country has, e.g. "2026-09". */
  latestMonth: string;
  /** The EU first, then Spain, Portugal, France and Italy, then the others by name. */
  rows: WinePriceIndexRow[];
  /** Index by month for the EU and the four producer countries, oldest first. */
  history: { month: string; values: Partial<Record<string, number>> }[];
  source: DataSource;
  /** When Eurostat published the latest month. */
  publishedAt: string;
  updatedAt: string;
}

/** The average price of table wine in US shops. */
export interface UsWinePrice {
  /** The latest month, e.g. "2026-09". */
  month: string;
  usdPerLitre: number;
  usdPerBottle: number;
  /** Change on the same month a year earlier, percent, from the prices. */
  yoyPercent: number | null;
  /** USD per 75 cl by month, oldest first; null for a month the BLS skipped. */
  history: { month: string; usdPerBottle: number | null }[];
  source: DataSource;
  updatedAt: string;
}
