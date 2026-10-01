/**
 * Harvest service: executive summary, country forecasts, regional
 * reports and the campaign timeline. Country forecasts are the official
 * releases entered in official.ts; the summary, regional reports and
 * timeline are still illustrative fixtures.
 */

import {
  countryForecasts,
  harvestRegions,
  harvestSummary,
  harvestTimeline,
} from "@/fixtures/harvest";
import { officialForecasts } from "@/services/harvest/official";
import type {
  CountryHarvestForecast,
  HarvestRegionReport,
  HarvestSummary,
  HarvestTimelineEvent,
} from "@/services/harvest/types";

export interface HarvestService {
  getSummary(): Promise<HarvestSummary>;
  getCountryForecasts(): Promise<CountryHarvestForecast[]>;
  getRegionReports(): Promise<HarvestRegionReport[]>;
  getTimeline(): Promise<HarvestTimelineEvent[]>;
}

class FixtureHarvestService implements HarvestService {
  async getSummary(): Promise<HarvestSummary> {
    return harvestSummary;
  }

  async getCountryForecasts(): Promise<CountryHarvestForecast[]> {
    return countryForecasts;
  }

  async getRegionReports(): Promise<HarvestRegionReport[]> {
    return [...harvestRegions].sort((a, b) =>
      `${a.country}-${a.region}`.localeCompare(`${b.country}-${b.region}`),
    );
  }

  async getTimeline(): Promise<HarvestTimelineEvent[]> {
    return [...harvestTimeline].sort((a, b) => b.date.localeCompare(a.date));
  }
}

/** The fixtures, with the official country forecasts. */
class OfficialHarvestService extends FixtureHarvestService {
  async getCountryForecasts(): Promise<CountryHarvestForecast[]> {
    return officialForecasts;
  }
}

let service: HarvestService | null = null;
let illustrative: HarvestService | null = null;

export function getHarvestService(): HarvestService {
  service ??= new OfficialHarvestService();
  return service;
}

/**
 * Only the fixtures, for pages written against them, such as the sample
 * Market Outlook edition.
 */
export function getIllustrativeHarvestService(): HarvestService {
  illustrative ??= new FixtureHarvestService();
  return illustrative;
}
