/**
 * Harvest service: the official production estimates for the vintage,
 * entered in official.ts from each body's latest release.
 */

import { HARVEST_CAMPAIGN, officialForecasts } from "@/services/harvest/official";
import type { CountryHarvestForecast } from "@/services/harvest/types";

export interface HarvestService {
  /** The campaign the estimates are for, e.g. "2026/27". */
  getCampaign(): Promise<string>;
  getCountryForecasts(): Promise<CountryHarvestForecast[]>;
}

class OfficialHarvestService implements HarvestService {
  async getCampaign(): Promise<string> {
    return HARVEST_CAMPAIGN;
  }

  async getCountryForecasts(): Promise<CountryHarvestForecast[]> {
    return officialForecasts;
  }
}

let service: HarvestService | null = null;

export function getHarvestService(): HarvestService {
  service ??= new OfficialHarvestService();
  return service;
}
