/**
 * Supply domain model: the stocks each country declares, Spain's wine
 * production and declared balance from the Ministry of Agriculture's
 * monthly INFOVI declarations, Italy's month-end stocks from the
 * telematic wine register, and the stocks France's and Portugal's
 * operators declare at 31 July. Volumes are million hectolitres (Mhl)
 * unless a field says otherwise.
 */

import type { SourceId } from "@/services/markets/sources";
import type { ProducerCountry } from "@/services/types";

/** A volume of wine at one month: stocks at its end, or made up to it. Mhl. */
export interface MonthlyWinePoint {
  /** e.g. "2026-07" */
  month: string;
  wineMhl: number;
}

/** A figure for the latest period against the same period a year earlier, Mhl. */
export interface YearOnYearRow {
  label: string;
  latestMhl: number;
  /** The same period a year earlier; null when not declared. */
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
 * A country's month-end stocks as its declarations or register give
 * them: the latest month in detail, and the monthly path of the latest
 * two campaigns. Spain from the INFOVI declarations to the Ministry of
 * Agriculture, Italy from the ICQRF's Cantina Italia reports.
 */
export interface MonthlyStocks {
  country: ProducerCountry;
  /** Latest month with figures, e.g. "2026-07". */
  latestMonth: string;
  breakdown: YearOnYearRow[];
  /** Latest campaign first. */
  campaigns: CampaignPath[];
  sourceId: SourceId;
  /** When the source published the latest month. */
  publishedAt: string;
  /** When WineTerm last updated the figures. */
  updatedAt: string;
}

/** Stocks declared at 31 July of one year, Mhl. */
export interface JulyStockPoint {
  /** The year of the 31 July the stocks are counted at. */
  year: number;
  totalMhl: number;
  /** The producers' and the traders' parts, where the source keeps them apart. */
  producersMhl: number | null;
  tradersMhl: number | null;
}

/**
 * A country's stocks declared at 31 July, as its declarations give them:
 * the latest year in detail against the year before, and the totals of
 * every year declared. France from the customs' stock declarations,
 * Portugal from the wine institute's.
 */
export interface AnnualStocks {
  country: ProducerCountry;
  /** The year of the latest 31 July declared, e.g. 2026. */
  latestYear: number;
  /** The latest year's figures against the year before. */
  breakdown: YearOnYearRow[];
  /** Every year declared, oldest first. */
  history: JulyStockPoint[];
  sourceId: SourceId;
  /** When the source published the latest year. */
  publishedAt: string;
  /** When WineTerm last updated the figures. */
  updatedAt: string;
}

/** One country's stocks at its latest 31 July, for the comparison across countries. */
export interface JulyStocksRow {
  country: ProducerCountry;
  /** The year of the 31 July the latest figure is counted at. */
  year: number;
  latestMhl: number;
  /** At 31 July a year earlier; null when not declared. */
  yearEarlierMhl: number | null;
  /** What the figure counts, as the source does. */
  scope: string;
  sourceId: SourceId;
}

/** Wine made in one completed campaign, by colour, Mhl. */
export interface CampaignProduction {
  campaign: string;
  redRoseMhl: number;
  whiteMhl: number;
  totalMhl: number;
}

/** Wine of one colour and presentation that went out of Spain, Mhl. */
export interface ExitsAbroadLine {
  colour: "red-rose" | "white";
  presentation: "bulk" | "packaged";
  euMhl: number;
  thirdCountriesMhl: number;
}

/**
 * Spain's wine balance from 1 August to the end of one month of a
 * campaign, as declared to the Ministry of Agriculture (INFOVI), Mhl.
 * Entries and exits are summed over the months; stocks are those declared
 * at 31 July before the campaign and at the end of the last month.
 */
export interface SpainCampaignBalance {
  campaign: string;
  /** Last month covered, e.g. "2026-07": July for a whole campaign. */
  throughMonth: string;
  /** Held at 31 July before the campaign. */
  openingMhl: number;
  /** Made since 1 August. */
  madeMhl: number;
  /** Came in from other operators in Spain. */
  entriesDomesticMhl: number;
  entriesEuMhl: number;
  entriesThirdCountriesMhl: number;
  /** Opening stocks, wine made and every entry. */
  availabilityMhl: number;
  /** Went out within Spain, other than to distilleries and vinegar makers. */
  exitsDomesticMhl: number;
  exitsDistillationMhl: number;
  exitsVinegarMhl: number;
  exitsEuMhl: number;
  exitsThirdCountriesMhl: number;
  /**
   * Exits to the rest of the EU and to third countries by colour, bulk
   * then packaged; they add up to the two exits abroad. Null when a month
   * of the period lacks the split.
   */
  exitsAbroad: ExitsAbroadLine[] | null;
  /**
   * Taken out for the declarants' own operations. Null when a month of
   * the period has no such table: the ministry publishes it since July
   * 2021, and it is missing for March 2022.
   */
  exitsOwnOperationsMhl: number | null;
  /** Every exit, own operations included where declared. */
  exitsMhl: number;
  /** Availability minus exits. */
  computedClosingMhl: number;
  /** Held at the end of the last month, as declared. */
  closingMhl: number;
  /**
   * Declared minus computed closing stocks: losses, uses not declared as
   * exits, and later revisions of the monthly declarations.
   */
  unaccountedMhl: number;
  /**
   * Exits within Spain less entries from other operators in Spain. Trade
   * between declarants is counted both ways, so this is roughly the wine
   * that reached the Spanish market; it also nets off wine bought from
   * producers too small to declare monthly.
   */
  netDomesticExitsMhl: number;
}

/**
 * Spain's declared wine balance: the latest campaign to date against the
 * one before to the same month, and the campaigns completed before.
 */
export interface SpainBalance {
  /** Latest month with declared entries and exits, e.g. "2026-07". */
  latestMonth: string;
  latest: SpainCampaignBalance;
  /** The campaign before, to the same month; null when not fully declared. */
  previous: SpainCampaignBalance | null;
  /** Completed campaigns with every month's entries and exits, latest first. */
  history: SpainCampaignBalance[];
  sourceId: SourceId;
  /** When the ministry published the latest month. */
  publishedAt: string;
  /** When WineTerm last updated the figures. */
  updatedAt: string;
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
