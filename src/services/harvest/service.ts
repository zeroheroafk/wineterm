/**
 * Harvest service: executive summary, country forecasts, regional
 * reports and the campaign timeline. Fixture-backed.
 */

import {
  countryForecasts,
  harvestRegions,
  harvestSummary,
  harvestTimeline,
} from "@/fixtures/harvest";
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

let service: HarvestService | null = null;

export function getHarvestService(): HarvestService {
  service ??= new FixtureHarvestService();
  return service;
}
