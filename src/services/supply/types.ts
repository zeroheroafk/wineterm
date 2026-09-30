/**
 * Supply domain model: campaigns, balance sheets, production and stocks.
 * Volumes are million hectolitres (Mhl) unless a field says otherwise;
 * country identifiers are the shared ProducerCountry codes.
 */

import type { SourceId } from "@/services/markets/sources";
import type { DataStatus, ProducerCountry } from "@/services/types";

/** A marketing campaign, running 1 August to 31 July. */
export interface Campaign {
  /** Canonical code, e.g. "2026/27". */
  code: string;
  startYear: number;
  /** True while figures for the campaign are estimates. */
  isEstimate: boolean;
}

/**
 * One country's supply balance for one campaign. All volumes in Mhl.
 *
 * Balance logic: opening + production + imports - domesticUse - exports
 * = estimated closing stocks. The identity is indicative, not exact:
 * source definitions, reporting periods and revisions differ, so the
 * computed closing figure can deviate from the next campaign's declared
 * opening stocks. That residual is reported, never hidden.
 */
export interface SupplyBalance {
  campaign: string;
  country: ProducerCountry;
  openingStocksMhl: number;
  productionMhl: number;
  importsMhl: number;
  domesticUseMhl: number;
  exportsMhl: number;
  /** Vineyard area, thousand hectares. */
  vineyardKha: number;
  status: DataStatus;
  sourceId: SourceId;
  updatedAt: string;
}

/** Derived balance figures, computed by the service, never stored. */
export interface SupplyBalanceComputed extends SupplyBalance {
  /** opening + production + imports. */
  availabilityMhl: number;
  /** Balance-derived estimate; see the identity caveat above. */
  closingStocksMhl: number;
  /** hl per hectare, production over vineyard area. */
  yieldHlHa: number;
  /**
   * Declared opening stocks of the following campaign minus the
   * computed closing stocks, when the following campaign is known.
   */
  residualMhl: number | null;
}

/** Production of one country in one campaign, optionally by colour. */
export interface ProductionRecord {
  campaign: string;
  country: ProducerCountry;
  /** "total", or a colour breakdown row. */
  colour: "total" | "red-rose" | "white";
  volumeMhl: number;
  status: DataStatus;
  sourceId: SourceId;
}

/** Comparison row assembled by the service for the production table. */
export interface ProductionComparison {
  country: ProducerCountry;
  currentMhl: number;
  currentStatus: DataStatus;
  previousMhl: number;
  fiveYearAvgMhl: number;
  vsPreviousPercent: number;
  vsFiveYearPercent: number;
  redRoseShare: number;
  whiteShare: number;
}

/** Stocks declared by one country at one reference date. */
export interface StockRecord {
  country: ProducerCountry;
  /** Reference date of the declaration. */
  referenceDate: string;
  stocksMhl: number;
  /** Stocks at the same reference point a year earlier. */
  yearEarlierMhl: number;
  status: DataStatus;
  sourceId: SourceId;
  /** How and when this country reports stocks. */
  methodology: string;
}

/** Stocks row with derived context, assembled by the service. */
export interface StockComparison extends StockRecord {
  /** Change against the year-earlier reference, percent. */
  yoyPercent: number;
  /**
   * Share of the four-country total at the latest reference, percent.
   * Null when the four rows do not all come from real sources, since a
   * share of a total that mixes real and illustrative figures means
   * nothing.
   */
  shareOfTotalPercent: number | null;
  /**
   * Opening stocks divided by monthly average use (domestic use plus
   * exports) of the latest complete campaign, in months. Null when the
   * balance data does not support the ratio.
   */
  monthsOfUse: number | null;
}

/** A volume of wine at one month: stocks at its end, or made up to it. Mhl. */
export interface MonthlyWinePoint {
  /** e.g. "2026-07" */
  month: string;
  wineMhl: number;
}

/** A figure for the latest month against the same month a year earlier, Mhl. */
export interface YearOnYearRow {
  label: string;
  latestMhl: number;
  /** The same month a year earlier; null when not declared. */
  yearEarlierMhl: number | null;
  /** Totals are set apart from their parts. */
  isTotal: boolean;
}

/** Month by month through one campaign, August to July, as far as declared. */
export interface CampaignPath {
  campaign: string;
  points: MonthlyWinePoint[];
}

/**
 * Spain's month-end stocks as declared to the Ministry of Agriculture
 * (INFOVI): the latest month in detail, and the monthly path of the
 * latest two campaigns.
 */
export interface SpainMonthlyStocks {
  /** Latest month with declarations, e.g. "2026-07". */
  latestMonth: string;
  breakdown: YearOnYearRow[];
  /** Latest campaign first. */
  campaigns: CampaignPath[];
  sourceId: SourceId;
  /** When the ministry published the latest month. */
  publishedAt: string;
  /** When WineTerm last updated the figures. */
  updatedAt: string;
}

/** Wine made in one completed campaign, by colour, Mhl. */
export interface CampaignProduction {
  campaign: string;
  redRoseMhl: number;
  whiteMhl: number;
  totalMhl: number;
}

/**
 * Spain's wine production as declared to the Ministry of Agriculture
 * (INFOVI) by producers of 1,000 hl or more: wine made since 1 August,
 * month by month, and the totals of completed campaigns. Must is not
 * included.
 */
export interface SpainProduction {
  /** Latest month with declarations, e.g. "2026-07". */
  latestMonth: string;
  /** Campaign of the latest month, e.g. "2025/26". */
  campaign: string;
  /** Wine made from 1 August to the end of the latest month, by colour, against a campaign earlier. */
  toDate: YearOnYearRow[];
  /** Latest campaign first. */
  campaigns: CampaignPath[];
  /** Completed campaigns, latest first. */
  history: CampaignProduction[];
  sourceId: SourceId;
  /** When the ministry published the latest month. */
  publishedAt: string;
  /** When WineTerm last updated the figures. */
  updatedAt: string;
}
