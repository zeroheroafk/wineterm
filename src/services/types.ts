/**
 * WineTerm domain types.
 *
 * These types define the contract between the interface and the data
 * services. Real data sources can replace the fixture-backed services in
 * src/services without touching any component.
 */

/** ISO 3166-1 alpha-2, uppercase. Producer countries plus trade partners. */
export type CountryCode =
  | "ES"
  | "PT"
  | "FR"
  | "IT"
  | "DE"
  | "GB"
  | "US"
  | "NL"
  | "BE";

export const COUNTRY_NAMES: Record<CountryCode, string> = {
  ES: "Spain",
  PT: "Portugal",
  FR: "France",
  IT: "Italy",
  DE: "Germany",
  GB: "United Kingdom",
  US: "United States",
  NL: "Netherlands",
  BE: "Belgium",
};

/** The four producer countries WineTerm covers at launch. */
export type ProducerCountry = "ES" | "PT" | "FR" | "IT";

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
  /** Percentage change against the same week a year earlier, when known. */
  yoyPercent?: number;
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

/** One entry in the compact market status strip. */
export interface StripQuote {
  id: string;
  /** Short display name, e.g. "CLM red". */
  name: string;
  country: CountryCode;
  value: number;
  unit: PriceUnit;
  changePercent: number;
  observedAt: string;
  status: DataStatus;
}

/** One observation bullet in the lead market briefing. */
export interface BriefingObservation {
  id: string;
  text: string;
  direction: "up" | "down" | "flat";
}

/** The editorial market briefing that leads the homepage. */
export interface MarketBriefing {
  /** Short market status phrase, e.g. "Firm into the vintage". */
  statusLabel: string;
  headline: string;
  summary: string;
  observations: BriefingObservation[];
  updatedAt: string;
  status: DataStatus;
  outlookHref: string;
}

/** One producer country's row in the supply snapshot. */
export interface SupplyCountryRow {
  country: ProducerCountry;
  /** Estimated production for the campaign, million hl. */
  productionMhl: number;
  /** Opening stocks carried into the campaign, million hl. */
  openingStocksMhl: number;
  /** Production plus opening stocks, million hl. */
  availabilityMhl: number;
  /** Availability against the five-year average, percent. */
  vsFiveYearPercent: number;
}

export interface SupplySnapshot {
  /** Campaign reference, e.g. "2026/27 campaign, first estimates". */
  campaign: string;
  rows: SupplyCountryRow[];
  note: string;
  status: DataStatus;
  source: DataSource;
  updatedAt: string;
}

export type HarvestStageDirection = "up" | "down" | "flat";
export type HarvestCondition = "good" | "mixed" | "stressed";

/** One region's row in the harvest monitor. */
export interface HarvestRegion {
  id: string;
  region: string;
  country: ProducerCountry;
  /** Current phenological or picking stage. */
  stage: string;
  condition: HarvestCondition;
  conditionNote: string;
  /** Expected crop against the previous vintage. */
  expected: HarvestStageDirection;
  updatedAt: string;
}

/** One ranked row in a trade flow table. */
export interface TradeRankRow {
  rank: number;
  country: CountryCode;
  /** Volume over the reference period, million hl. */
  volumeMhl: number;
  /** Year-on-year change in volume, percent. */
  yoyPercent: number;
}

/** Volume share of a product category, percent. */
export interface TradeSplitSegment {
  label: string;
  sharePercent: number;
}

export interface TradeOverview {
  /** Reference period, e.g. "12 months to Jun 2026". */
  period: string;
  exporters: TradeRankRow[];
  importers: TradeRankRow[];
  split: TradeSplitSegment[];
  status: DataStatus;
  source: DataSource;
  updatedAt: string;
}

/** A compact dated headline for the industry rail. */
export interface IndustryItem {
  id: string;
  headline: string;
  publishedAt: string;
  href: string;
}

export interface IndustryDigest {
  news: IndustryItem[];
  deals: IndustryItem[];
  regulation: IndustryItem[];
}
