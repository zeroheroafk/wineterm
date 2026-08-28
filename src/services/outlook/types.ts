/**
 * Market Outlook domain model: an editorial research publication built
 * over the structured data services. Text carries the judgement; data
 * tables are pulled from the supply, harvest, trade and markets
 * services so figures are never duplicated in outlook fixtures.
 */

import type { SourceId } from "@/services/markets/sources";
import type { DataStatus, ProducerCountry } from "@/services/types";

export type MarketEffect = "supportive" | "neutral" | "pressuring";

export const MARKET_EFFECT_LABELS: Record<MarketEffect, string> = {
  supportive: "Price supportive",
  neutral: "Broadly neutral",
  pressuring: "Price pressuring",
};

export type RiskLikelihood = "low" | "medium" | "high";

/** A discrete risk over the next one to three months. */
export interface RiskFactor {
  id: string;
  title: string;
  detail: string;
  horizon: "next month" | "one to three months";
  likelihood: RiskLikelihood;
  effect: MarketEffect;
}

export interface CountryOutlookEntry {
  country: ProducerCountry;
  /** One-word stance shown as a tag. */
  stance: "firm" | "stable" | "soft";
  paragraphs: string[];
}

export interface OutlookKeyPoint {
  id: string;
  text: string;
  effect: MarketEffect;
}

/** One edition of the Market Outlook. */
export interface OutlookEdition {
  id: string;
  edition: string;
  publishedAt: string;
  updatedAt: string;
  status: DataStatus;
  /** Executive summary: conclusions first. */
  summaryParagraphs: string[];
  keyPoints: OutlookKeyPoint[];
  /** Section bodies, one array of paragraphs per section. */
  priceDirection: string[];
  supplyAndStocks: string[];
  demand: string[];
  harvest: string[];
  trade: string[];
  countryOutlooks: CountryOutlookEntry[];
  risks: RiskFactor[];
  methodology: string[];
  sourceIds: SourceId[];
}
