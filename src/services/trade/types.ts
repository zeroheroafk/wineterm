/**
 * Trade domain model. Customs categories are kept strictly separate:
 * bulk, bottled and bag-in-box still wine, sparkling wine and grape must
 * are reported and totalled independently, because their unit values are
 * not comparable across categories and grape must volumes are not wine.
 */

import type { SourceId } from "@/services/markets/sources";
import type { DataStatus, ProducerCountry } from "@/services/types";

export type TradeCategory =
  | "bulk"
  | "bottled"
  | "bag-in-box"
  | "sparkling"
  | "must";

/** Display order: still wine by container size, then sparkling, then must. */
export const TRADE_CATEGORIES: TradeCategory[] = [
  "bulk",
  "bottled",
  "bag-in-box",
  "sparkling",
  "must",
];

export const TRADE_CATEGORY_LABELS: Record<TradeCategory, string> = {
  bulk: "Bulk wine",
  bottled: "Bottled still wine",
  "bag-in-box": "Bag-in-box wine",
  sparkling: "Sparkling wine",
  must: "Grape must",
};

/** The Combined Nomenclature subheading behind each category. */
export const TRADE_CATEGORY_CODES: Record<TradeCategory, string> = {
  bulk: "220429",
  bottled: "220421",
  "bag-in-box": "220422",
  sparkling: "220410",
  must: "220430",
};

export type TradeDirection = "import" | "export";

/** Reference period of the aggregated figures, e.g. 12 months to June. */
export interface TradePeriod {
  label: string;
  /** Latest month covered, e.g. "2026-06". */
  latestMonth: string;
}

/** Category totals across the four covered reporters. */
export interface TradeCategorySummary {
  category: TradeCategory;
  exportVolumeMhl: number;
  exportValueMeur: number;
  importVolumeMhl: number;
  importValueMeur: number;
  /** Export unit value, EUR per litre, value over volume. */
  exportUnitValueEurL: number;
  volumeYoYPercent: number | null;
  valueYoYPercent: number | null;
  status: DataStatus;
}

/**
 * One ranked partner row within a single category. Partners are ISO
 * 3166-1 alpha-2 codes: any country, not only those WineTerm covers.
 */
export interface TradePartnerRow {
  rank: number;
  country: string;
  direction: TradeDirection;
  volumeMhl: number;
  valueMeur: number;
  unitValueEurL: number;
  /** Change against the previous 12-month period, percent. */
  yoyPercent: number | null;
  /** Change of the latest month against the month before, percent. */
  momPercent: number | null;
  /** Share of the category's total volume in this direction, percent. */
  sharePercent: number;
}

/** One origin-to-destination relationship within a category. */
export interface TradeFlowRow {
  origin: ProducerCountry;
  destination: string;
  volumeMhl: number;
  valueMeur: number;
  unitValueEurL: number;
  yoyPercent: number | null;
}

/** One month of export volume for the evolution chart. */
export interface TradeMonthlyPoint {
  month: string; // "2026-06"
  volumeMhl: number;
}

export interface TradeCategoryDetail {
  category: TradeCategory;
  summary: TradeCategorySummary;
  exporters: TradePartnerRow[];
  destinations: TradePartnerRow[];
  topFlows: TradeFlowRow[];
  note: string;
  sourceId: SourceId;
  updatedAt: string;
}
