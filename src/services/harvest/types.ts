/**
 * Harvest domain model. Progress and forecasts are deliberately coarse:
 * progress in 5 percent steps, production forecasts as ranges. No
 * artificial precision is added to qualitative field reporting.
 */

import type { SourceId } from "@/services/markets/sources";
import type { DataStatus, ProducerCountry } from "@/services/types";

export type YieldExpectation =
  | "above-average"
  | "average"
  | "below-average"
  | "well-below-average";

export const YIELD_EXPECTATION_LABELS: Record<YieldExpectation, string> = {
  "above-average": "Above average",
  average: "Average",
  "below-average": "Below average",
  "well-below-average": "Well below average",
};

export type CropDirection = "up" | "down" | "flat";

/** One region's harvest status report. */
export interface HarvestRegionReport {
  id: string;
  country: ProducerCountry;
  region: string;
  /** Phenological or picking stage. */
  stage: string;
  /** Actual or expected start of picking; null when not yet scheduled. */
  harvestStart: string | null;
  started: boolean;
  /**
   * Approximate share of the crop picked, rounded to 5 percent steps;
   * null when picking has not started. Displayed with a tilde.
   */
  progressPercent: number | null;
  /** Recent weather and its effect on the vineyard. */
  weather: string;
  yieldExpectation: YieldExpectation;
  /** Short quality commentary from field reporting. */
  quality: string;
  /** Expected crop against the previous campaign. */
  direction: CropDirection;
  updatedAt: string;
  sourceId: SourceId;
  status: DataStatus;
}

/** Country-level production forecast expressed as a range. */
export interface CountryHarvestForecast {
  country: ProducerCountry;
  /** Forecast range for the new campaign, Mhl. */
  minMhl: number;
  maxMhl: number;
  /** Previous campaign production, Mhl, for comparison. */
  previousMhl: number;
  direction: CropDirection;
  commentary: string;
  status: DataStatus;
  sourceId: SourceId;
  updatedAt: string;
}

/** Dated entry in the campaign timeline. */
export interface HarvestTimelineEvent {
  id: string;
  date: string;
  /** Region or country the event refers to. */
  scope: string;
  kind: "start" | "weather" | "estimate" | "progress";
  text: string;
}

/** The desk's executive summary for the harvest page. */
export interface HarvestSummary {
  updatedAt: string;
  paragraphs: string[];
  keyPoints: { id: string; text: string; direction: CropDirection }[];
}
