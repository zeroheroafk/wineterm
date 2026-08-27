/**
 * WineTerm domain types.
 *
 * These types define the contract between the interface and the data
 * services. Real data sources can replace the fixture-backed services in
 * src/services without touching any component.
 */

/** ISO 3166-1 alpha-2, uppercase. */
export type CountryCode = "ES" | "PT" | "FR" | "IT";

export const COUNTRY_NAMES: Record<CountryCode, string> = {
  ES: "Spain",
  PT: "Portugal",
  FR: "France",
  IT: "Italy",
};

export type WineColour = "red" | "white" | "rose";

export type PriceUnit = "EUR/hl" | "EUR/kg" | "EUR/tonne";

/**
 * Lifecycle status of a data series or a single observation.
 * Rendered by the DataStatus component.
 */
export type DataStatus =
  | "final"
  | "provisional"
  | "estimate"
  | "forecast"
  | "illustrative";

export interface DataSource {
  /** Publishing body, e.g. a ministry or statistics office. */
  name: string;
  url?: string;
}

/** One row of a market price table. */
export interface PriceQuote {
  id: string;
  /** Monospace series code, e.g. "ES-CLM-RED-GEN". */
  code: string;
  market: string;
  country: CountryCode;
  colour?: WineColour;
  /** Product description, e.g. "Generic red, 12 to 13 percent vol". */
  product: string;
  price: number;
  unit: PriceUnit;
  /** Absolute change against the previous observation, in the series unit. */
  change: number;
  /** Percentage change against the previous observation. */
  changePercent: number;
  observedAt: string;
  status: DataStatus;
  source: DataSource;
}

export interface PricePoint {
  date: string;
  value: number;
}

/** A historical series backing a chart. */
export interface PriceSeries {
  id: string;
  code: string;
  name: string;
  unit: PriceUnit;
  country: CountryCode;
  points: PricePoint[];
  status: DataStatus;
  source: DataSource;
  updatedAt: string;
}

export type ArticleKind =
  | "news"
  | "analysis"
  | "weekly-briefing"
  | "monthly-report";

export interface Article {
  id: string;
  kind: ArticleKind;
  /** Section label shown above the headline, e.g. "Bulk Market". */
  section: string;
  headline: string;
  standfirst: string;
  publishedAt: string;
  readingMinutes: number;
  href: string;
}

/** A short dated commentary block attached to a market table. */
export interface MarketCommentary {
  id: string;
  market: string;
  body: string;
  author: string;
  publishedAt: string;
}
