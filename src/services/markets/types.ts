/**
 * Market domain model for the Markets experience.
 *
 * A MarketSeries describes one observed price series (a bulk wine
 * reference, a grape price, a must or concentrate quotation). Series
 * definitions, observations and sources are strictly separated so real
 * providers can replace the fixture implementations series by series.
 */

import type { CountryCode, DataStatus } from "@/services/types";
import type { SourceId } from "@/services/markets/sources";

export type MarketKind = "bulk-wine" | "grape" | "must";

/** Geographical-indication status of a wine series. */
export type WineClassification = "no-gi" | "pgi" | "pdo";

/** Product category, orthogonal to the GI classification. */
export type ProductCategory = "generic" | "varietal" | "organic";

export type WineColour = "red" | "white" | "rose";

/**
 * How a market observation was established. Used prominently for grape
 * prices, where provenance differs row by row.
 */
export type ObservationSourceType =
  | "official"
  | "contract"
  | "coop-settlement"
  | "buyer-announcement"
  | "reported-range"
  | "wineterm-estimate";

export const OBSERVATION_SOURCE_LABELS: Record<ObservationSourceType, string> =
  {
    official: "Official price",
    contract: "Contract price",
    "coop-settlement": "Coop settlement",
    "buyer-announcement": "Buyer announcement",
    "reported-range": "Reported range",
    "wineterm-estimate": "WineTerm estimate",
  };

/** Verification state of an individual reported observation. */
export type VerificationStatus = "verified" | "reported" | "unverified";

/** Units in which observations are published. Never converted silently. */
export type SeriesUnit =
  | "EUR/hl"
  | "EUR/litre"
  | "EUR/kg"
  | "EUR/100kg"
  | "EUR/tonne";

export type Currency = "EUR";

/**
 * Units belong to a physical family. Normalisation happens only within a
 * family, to the family's reference unit; normalised values are always
 * labelled and shown alongside the original observation, never instead
 * of it. Volume and mass quotations are never converted into each other.
 */
export type UnitFamily = "volume" | "mass";

export const UNIT_FAMILY: Record<SeriesUnit, UnitFamily> = {
  "EUR/hl": "volume",
  "EUR/litre": "volume",
  "EUR/kg": "mass",
  "EUR/100kg": "mass",
  "EUR/tonne": "mass",
};

export const FAMILY_REFERENCE_UNIT: Record<UnitFamily, SeriesUnit> = {
  volume: "EUR/hl",
  mass: "EUR/kg",
};

/** Multiplier from a unit to its family's reference unit. */
export const UNIT_TO_REFERENCE: Record<SeriesUnit, number> = {
  "EUR/hl": 1,
  "EUR/litre": 100,
  "EUR/kg": 1,
  "EUR/100kg": 0.01,
  "EUR/tonne": 0.001,
};

/** The labelled reference unit for a series' observations. */
export function referenceUnit(unit: SeriesUnit): SeriesUnit {
  return FAMILY_REFERENCE_UNIT[UNIT_FAMILY[unit]];
}

/** Must and concentrate product forms. */
export type MustProduct = "grape-must" | "concentrated-must" | "rcgm";

export const MUST_PRODUCT_LABELS: Record<MustProduct, string> = {
  "grape-must": "Grape must",
  "concentrated-must": "Concentrated grape must",
  rcgm: "Rectified concentrated grape must",
};

export interface MarketSeries {
  /** Stable series code, e.g. "ES-CLM-RED-GEN". */
  code: string;
  kind: MarketKind;
  name: string;
  country: CountryCode;
  region: string;
  /** Reference market or appellation, when narrower than the region. */
  appellation?: string;
  colour?: WineColour;
  classification?: WineClassification;
  category?: ProductCategory;
  /** Grape series only. */
  variety?: string;
  /** Grape series only: quality band, e.g. "Standard", "Premium". */
  qualityCategory?: string;
  /** Grape series only: harvest the price refers to. */
  harvestYear?: number;
  /** Must series only. */
  mustProduct?: MustProduct;
  /** Technical specification, e.g. sugar concentration. */
  spec?: string;
  /** Product description shown in tables. */
  product: string;
  unit: SeriesUnit;
  currency: Currency;
  /** Marketing campaign of the current observations, e.g. "2026/27". */
  campaign: string;
  sourceId: SourceId;
  sourceType: ObservationSourceType;
  verification: VerificationStatus;
  /** Short methodology note for the detail page. */
  methodology: string;
}

/** One dated observation of a series. */
export interface SeriesObservation {
  date: string;
  value: number;
  /** Reported range, when the source publishes one. */
  min?: number;
  max?: number;
  status: DataStatus;
  /** When the source published the observation. */
  publishedAt: string;
  /** When WineTerm last updated the record. */
  updatedAt: string;
  /** True when the value revises an earlier publication. */
  revised: boolean;
}

/** Percentage movements against earlier observations; null when history is too short. */
export interface SeriesChanges {
  weekPercent: number | null;
  monthPercent: number | null;
  yoyPercent: number | null;
}

/** A series joined with its latest observation and movements: one table row. */
export interface MarketRow {
  series: MarketSeries;
  latest: SeriesObservation;
  changes: SeriesChanges;
  /** Latest value in the reference unit; null when already published in it. */
  normalisedValue: number | null;
}

/** Average price per campaign, for the detail page comparison. */
export interface CampaignAverage {
  campaign: string;
  average: number;
  observations: number;
  /** Percent change against the previous campaign average, null for the first. */
  changePercent: number | null;
}

/** Maximum number of series in one comparison. */
export const MAX_COMPARE_SERIES = 4;

export type TimeRangeKey = "1m" | "3m" | "1y" | "3y" | "5y" | "max";

export const TIME_RANGES: { key: TimeRangeKey; label: string; days: number | null }[] = [
  { key: "1m", label: "1M", days: 31 },
  { key: "3m", label: "3M", days: 93 },
  { key: "1y", label: "1Y", days: 366 },
  { key: "3y", label: "3Y", days: 1096 },
  { key: "5y", label: "5Y", days: 1827 },
  { key: "max", label: "Max", days: null },
];
