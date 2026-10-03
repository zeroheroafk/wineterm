import type { CountryCode, DataSource } from "@/services/types";

/** One price in a briefing: a series' latest observation at the edition date. */
export interface BriefingPrice {
  code: string;
  /** Market and colour, e.g. "Albacete red" or "Spain white". */
  name: string;
  country: CountryCode;
  value: number;
  unit: string;
  /** Change on the previous observation, in percent; null for the first. */
  changePercent: number | null;
  /** Change on the observation a year earlier, in percent; null without one. */
  yoyPercent: number | null;
  /** The date the price refers to. */
  date: string;
  /** For a monthly price, the month it covers, e.g. "July 2026". */
  period?: string;
  source: DataSource;
}

/** The week's regional quotations, summarised. */
export interface RegionalRoundup {
  /** Series quoted this week. */
  quoted: number;
  /** Series the source publishes but did not quote this week. */
  unquoted: number;
  rose: number;
  fell: number;
  unchanged: number;
  /** Largest rises this week, most first. */
  risers: BriefingPrice[];
  /** Largest falls this week, most first. */
  fallers: BriefingPrice[];
}

/**
 * One edition of the Weekly Briefing, generated from the price series on
 * its date: the national averages, the regional markets and the monthly
 * prices published during the week, with a headline and a summary
 * written from the figures.
 */
export interface WeeklyBriefing {
  /** "wb-2026-09-25" */
  id: string;
  /** The Friday the edition is dated. */
  date: string;
  /** The Sunday ending the week the weekly prices refer to. */
  weekEnding: string;
  headline: string;
  summary: string;
  /** National weekly averages, white and red. */
  national: BriefingPrice[];
  regional: RegionalRoundup;
  /** Monthly prices whose month was published in the edition's week. */
  monthly: BriefingPrice[];
  /** Every source quoted in the edition, once. */
  sources: DataSource[];
  isCurrent: boolean;
}
