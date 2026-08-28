/**
 * Trade domain model. Customs categories are kept strictly separate:
 * bulk wine, bottled still wine, sparkling wine, and must and
 * concentrates are reported and totalled independently, because their
 * volumes and unit values are not comparable across categories.
 */

import type { SourceId } from "@/services/markets/sources";
import type { CountryCode, DataStatus } from "@/services/types";

export type TradeCategory = "bulk" | "bottled" | "sparkling" | "must";

export const TRADE_CATEGORY_LABELS: Record<TradeCategory, string> = {
  bulk: "Bulk wine",
  bottled: "Bottled still wine",
  sparkling: "Sparkling wine",
  must: "Must and concentrates",
};

export type TradeDirection = "import" | "export";

/** Reference period of the aggregated figures, e.g. 12 months to June. */
export interface TradePeriod {
  label: string;
  /** Latest month covered, e.g. "2026-06". */
  latestMonth: string;
}

/** Category totals across the four covered exporters. */
export interface TradeCategorySummary {
  category: TradeCategory;
  exportVolumeMhl: number;
  exportValueMeur: number;
  importVolumeMhl: number;
  importValueMeur: number;
  /** Export unit value, EUR per litre, value over volume. */
  exportUnitValueEurL: number;
  volumeYoYPercent: number;
  valueYoYPercent: number;
  status: DataStatus;
}

/** One ranked partner row within a single category. */
export interface TradePartnerRow {
  rank: number;
  country: CountryCode;
  direction: TradeDirection;
  volumeMhl: number;
  valueMeur: number;
  unitValueEurL: number;
  /** Change against the previous 12-month period, percent. */
  yoyPercent: number;
  /** Change of the latest month against the month before, percent. */
  momPercent: number;
  /** Share of the category's total volume in this direction, percent. */
  sharePercent: number;
}

/** One origin-to-destination relationship within a category. */
export interface TradeFlowRow {
  origin: CountryCode;
  destination: CountryCode;
  volumeMhl: number;
  valueMeur: number;
  unitValueEurL: number;
  yoyPercent: number;
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
