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

const REGION_NAMES = new Intl.DisplayNames(["en-GB"], { type: "region" });

/**
 * English name of any ISO 3166-1 alpha-2 code: the names above for the
 * countries WineTerm covers, the runtime's region names for trade partners
 * elsewhere, and the code itself when neither knows it.
 */
export function countryName(code: string): string {
  if (code in COUNTRY_NAMES) return COUNTRY_NAMES[code as CountryCode];
  try {
    return REGION_NAMES.of(code) ?? code;
  } catch {
    return code;
  }
}

/** The four producer countries WineTerm covers at launch. */
export type ProducerCountry = "ES" | "PT" | "FR" | "IT";

export const PRODUCER_COUNTRIES: ProducerCountry[] = ["ES", "PT", "FR", "IT"];

export type WineColour = "red" | "white" | "rose";

export type PriceUnit = "EUR/hl" | "EUR/kg" | "EUR/tonne";

/**
 * How the strength behind a per-degree conversion was chosen: stated by
 * the product, the midpoint of a stated range, or assumed where the
 * product states none.
 */
export type StrengthBasis = "stated" | "range-midpoint" | "assumed";

/**
 * The strength at which a price recorded per hectolitre-degree (euros per
 * hectolitre for each % vol, the usual basis of bulk wine and must
 * quotations) is expressed per hectolitre.
 */
export interface DegreeBasis {
  /** % vol; for must, the potential strength. */
  alcoholPercent: number;
  strengthBasis: StrengthBasis;
}

/** A quote's price and change as recorded per hectolitre-degree. */
export interface PerDegreeRecord extends DegreeBasis {
  price: number;
  change: number;
}

/**
 * EUR/hl from a price per hectolitre-degree: the price times the
 * strength, to the cent, with halves rounded away from zero so that a
 * fall converts to the same figure as an equal rise.
 */
export function perHectolitre(perDegree: number, alcoholPercent: number): number {
  const cents = Math.abs(perDegree) * alcoholPercent * 100;
  // Clear binary noise, such as 57.49999… for 57.5, before rounding.
  const rounded = Math.round(Math.round(cents * 1e6) / 1e6);
  const value = (Math.sign(perDegree) * rounded) / 100;
  return value === 0 ? 0 : value;
}

/** E.g. "12.5% vol, the midpoint of the stated range". */
export function describeDegreeBasis(basis: DegreeBasis): string {
  const strength = `${basis.alcoholPercent}% vol`;
  switch (basis.strengthBasis) {
    case "stated":
      return `${strength}, the stated strength`;
    case "range-midpoint":
      return `${strength}, the midpoint of the stated range`;
    case "assumed":
      return `an assumed ${strength}, as none is stated`;
  }
}

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
  /**
   * Caveat on how the source's figures are recorded, shown with the
   * attribution wherever the source is cited, e.g. a conversion from the
   * unit they were recorded in. Worded to stand on its own, since one
   * line may cite several sources.
   */
  note?: string;
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
  /**
   * The price and change as recorded per hectolitre-degree, when price
   * and change are their conversion to EUR/hl.
   */
  perDegree?: PerDegreeRecord;
}

/**
 * Price, unit and change in EUR/hl for a quote recorded per
 * hectolitre-degree, which keeps the recorded figures.
 */
export function quoteFromPerDegree(
  recorded: PerDegreeRecord,
): Pick<PriceQuote, "price" | "unit" | "change" | "perDegree"> {
  return {
    price: perHectolitre(recorded.price, recorded.alcoholPercent),
    unit: "EUR/hl",
    change: perHectolitre(recorded.change, recorded.alcoholPercent),
    perDegree: recorded,
  };
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
  /** Stable identifier, which is also the article's URL slug. */
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

/** A run of citation text: plain, or the title of a work, set in italics. */
export type CitationText = string | { title: string };

/** One paragraph of an article, with the sources it cites at its end. */
export interface ArticleParagraph {
  /** A subheading set before the paragraph, opening a section. */
  heading?: string;
  text: string;
  /** Numbers of the sources cited, counting from 1. */
  cites?: number[];
}

/** One numbered source in an article's source list. */
export interface ArticleSource {
  /** The citation as printed, linked to its address. */
  citation: CitationText[];
  url: string;
  /** A caveat printed after the citation, outside the link. */
  note?: string;
}

/**
 * A chart of figures an article cites: one part's share of one or more
 * wholes, e.g. bulk wine's share of export volume and of export value.
 */
export interface ArticleChart {
  title: string;
  /** What the part and the wholes cover. */
  description: string;
  /** The part, e.g. "Bulk wine". */
  part: string;
  /** The rest of each whole, e.g. "All other wine". */
  rest: string;
  /** One bar per whole, with the part's share of it in percent. */
  bars: { label: string; percent: number }[];
  source: DataSource;
  /** The paragraph the chart follows in the article, counting from 0. */
  afterParagraph: number;
}

/**
 * A table of figures an article cites, set after one of its paragraphs.
 * Cells are printed as written, so they carry their own units and signs.
 */
export interface ArticleTable {
  title: string;
  /** Headings of the figure columns, after the row labels'. */
  columns: string[];
  rows: { label: string; cells: string[] }[];
  /** Numbers of the sources the figures come from, counting from 1. */
  cites: number[];
  /** The paragraph the table follows, counting from 0. */
  afterParagraph: number;
}

/** A published article: its preview fields, full text and sources. */
export interface ArticleDetail extends Article {
  body: ArticleParagraph[];
  sources: ArticleSource[];
  chart?: ArticleChart;
  tables?: ArticleTable[];
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
  /** Publisher of a real quote; illustrative quotes have none. */
  source?: DataSource;
}

/** The editorial market briefing that leads the homepage. */
export interface MarketBriefing {
  headline: string;
  summary: string;
  /** At most one further development, when it adds to the summary. */
  development?: string;
  updatedAt: string;
  status: DataStatus;
  outlookHref: string;
}

/**
 * One producer country's row in the supply snapshot, taken from the
 * campaign's supply balance.
 */
export interface SupplyCountryRow {
  country: ProducerCountry;
  /** Estimated production for the campaign, million hl. */
  productionMhl: number;
  /** Opening stocks carried into the campaign, million hl. */
  openingStocksMhl: number;
  /** Imports expected over the campaign, as stated in the balance, million hl. */
  importsMhl: number;
  /** Opening stocks plus production plus imports, million hl. */
  availabilityMhl: number;
  /** Availability against the previous campaign's balance, percent. */
  vsPreviousPercent: number;
}

export interface SupplySnapshot {
  /** Campaign code, e.g. "2026/27". */
  campaign: string;
  /** Campaign the comparison column refers to, e.g. "2025/26". */
  previousCampaign: string;
  rows: SupplyCountryRow[];
  /** The desk's one-sentence reading of the rows. */
  takeaway: string;
  /** Short definition of the figures; full methodology lives elsewhere. */
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
  status: DataStatus;
}

/** One ranked row in a trade flow table; any ISO 3166-1 alpha-2 country. */
export interface TradeRankRow {
  rank: number;
  country: string;
  /** Volume over the reference period, million hl. */
  volumeMhl: number;
  /** Year-on-year change in volume, percent, when a year earlier is known. */
  yoyPercent: number | null;
}

/** Export volume of one product form and its share of the forms shown. */
export interface TradeSplitSegment {
  label: string;
  volumeMhl: number;
  /** Share of the total of the forms shown, percent. */
  sharePercent: number;
}

/**
 * The homepage trade snapshot, built from the trade categories. Wine
 * covers every wine category, still wine by container size and sparkling
 * wine; grape must is a separate subheading and is never added to wine.
 */
export interface TradeOverview {
  /** Reference period, e.g. "12 months to Jun 2026". */
  period: string;
  /** Wine exports by producer country, across the wine categories. */
  exporters: TradeRankRow[];
  /** What the exporter figures cover, e.g. "Bulk, bottled and sparkling wine". */
  exportersLabel: string;
  /** Leading destinations of those exports, named by destinationsLabel. */
  destinations: TradeRankRow[];
  /** What the destinations cover, e.g. "All wine" or "Bottled still wine". */
  destinationsLabel: string;
  split: TradeSplitSegment[];
  /** Combined export volume of the forms in the split, million hl. */
  splitTotalMhl: number;
  /** What the figures cover and leave out. */
  scopeNote: string;
  status: DataStatus;
  source: DataSource;
  updatedAt: string;
}

/** One edition of the Weekly Briefing. */
export interface BriefingEdition {
  id: string;
  date: string;
  headline: string;
  summary: string;
  isCurrent: boolean;
}

/** Industry coverage topics, matching the Industry navigation. */
export type IndustryTopic =
  | "companies"
  | "deals"
  | "regulation"
  | "technology"
  | "packaging-logistics";

export const INDUSTRY_TOPIC_LABELS: Record<IndustryTopic, string> = {
  companies: "Companies",
  deals: "Deals & Investments",
  regulation: "Regulation",
  technology: "Technology",
  "packaging-logistics": "Packaging & Logistics",
};

/**
 * One industry story, assigned to a coverage topic: WineTerm's own
 * headline and summary of a report published elsewhere, which it links.
 */
export interface IndustryStory {
  id: string;
  topic: IndustryTopic;
  headline: string;
  summary: string;
  /** When the source published the report, e.g. "2026-09-30". */
  publishedAt: string;
  /** The publication that reported it, and the report's address. */
  source: { name: string; url: string };
}

/** A compact dated headline for the industry rail. */
export interface IndustryItem {
  id: string;
  headline: string;
  publishedAt: string;
  href: string;
  /** Short topic name shown in the meta line, e.g. "Regulation". */
  topic: string;
}
