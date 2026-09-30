/**
 * Homepage data service.
 *
 * Aggregates everything the homepage needs behind one typed interface.
 * The fixture-backed implementation is development-only; a production
 * implementation composes real market, supply, trade and editorial
 * sources without any component changes.
 */

import {
  HOME_UPDATED_AT,
  harvestRegions,
  homeLeadAnalysis,
  homeSecondaryAnalysis,
  industryDigest,
  keyPrices,
  leadBriefing,
  stripQuotes,
  supplySnapshot,
  tradeOverview,
} from "@/fixtures/home";
import { getMarketDataService } from "@/services/market-data";
import type {
  Article,
  HarvestRegion,
  IndustryDigest,
  MarketBriefing,
  PriceQuote,
  PriceSeries,
  StripQuote,
  SupplySnapshot,
  TradeOverview,
} from "@/services/types";

export interface HomeService {
  getMarketStrip(): Promise<StripQuote[]>;
  getLeadBriefing(): Promise<MarketBriefing>;
  getKeyPrices(): Promise<PriceQuote[]>;
  getSupplySnapshot(): Promise<SupplySnapshot>;
  getHarvestRegions(): Promise<HarvestRegion[]>;
  getTradeOverview(): Promise<TradeOverview>;
  getLeadAnalysis(): Promise<Article>;
  /**
   * History of the series the lead analysis discusses, or null when the
   * article names none or the series has no history to chart.
   */
  getLeadAnalysisSeries(): Promise<PriceSeries | null>;
  getSecondaryAnalysis(): Promise<Article[]>;
  getIndustryDigest(): Promise<IndustryDigest>;
  getLastUpdated(): Promise<string>;
}

class FixtureHomeService implements HomeService {
  async getMarketStrip(): Promise<StripQuote[]> {
    return stripQuotes;
  }

  async getLeadBriefing(): Promise<MarketBriefing> {
    return leadBriefing;
  }

  async getKeyPrices(): Promise<PriceQuote[]> {
    return keyPrices;
  }

  async getSupplySnapshot(): Promise<SupplySnapshot> {
    return supplySnapshot;
  }

  async getHarvestRegions(): Promise<HarvestRegion[]> {
    return harvestRegions;
  }

  async getTradeOverview(): Promise<TradeOverview> {
    return tradeOverview;
  }

  async getLeadAnalysis(): Promise<Article> {
    return homeLeadAnalysis;
  }

  async getLeadAnalysisSeries(): Promise<PriceSeries | null> {
    const code = homeLeadAnalysis.seriesCode;
    if (!code) return null;
    // The market data fixtures carry the history behind the homepage key
    // prices: the same latest value, observation date and source.
    return getMarketDataService().getPriceSeries(code);
  }

  async getSecondaryAnalysis(): Promise<Article[]> {
    return homeSecondaryAnalysis;
  }

  async getIndustryDigest(): Promise<IndustryDigest> {
    return industryDigest;
  }

  async getLastUpdated(): Promise<string> {
    return HOME_UPDATED_AT;
  }
}

let service: HomeService | null = null;

export function getHomeService(): HomeService {
  service ??= new FixtureHomeService();
  return service;
}
