/**
 * Harvest domain model: the official production estimates for the
 * vintage, as each country's statistical body publishes them.
 */

import type { SourceId } from "@/services/markets/sources";
import type { DataStatus, ProducerCountry } from "@/services/types";

export type CropDirection = "up" | "down" | "flat";

/**
 * Country-level production estimate: a range, or a single figure where
 * the source publishes one (min equals max), against the previous
 * campaign as the same source counts it. Before the harvest the sources
 * publish forecasts; once picking starts, estimates of the crop, revised
 * until the declarations close.
 */
export interface CountryHarvestForecast {
  country: ProducerCountry;
  /** Estimate for the new campaign, Mhl; null while none is published. */
  minMhl: number | null;
  maxMhl: number | null;
  /** Previous campaign's production, Mhl, for comparison; null when not available. */
  previousMhl: number | null;
  /** Null while no figure is published. */
  direction: CropDirection | null;
  commentary: string;
  status: DataStatus;
  sourceId: SourceId;
  /** When the source published the figures. */
  publishedAt?: string;
  updatedAt: string;
}
