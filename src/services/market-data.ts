/**
 * Market data service.
 *
 * The interface below is the seam where real data sources plug in later.
 * Today the only implementation is fixture-backed; a future implementation
 * can call an API or database and be swapped in `getMarketDataService`
 * without touching components.
 */

import {
  FIXTURE_UPDATED_AT,
  bulkWineQuotes,
  sampleCommentary,
  sampleSeries,
} from "@/fixtures/market-data";
import type {
  CountryCode,
  MarketCommentary,
  PriceQuote,
  PriceSeries,
} from "@/services/types";

export interface QuoteFilter {
  countries?: CountryCode[];
  colour?: PriceQuote["colour"];
}

export interface MarketDataService {
  getBulkWineQuotes(filter?: QuoteFilter): Promise<PriceQuote[]>;
  getPriceSeries(code: string): Promise<PriceSeries | null>;
  getMarketCommentary(market: string): Promise<MarketCommentary | null>;
  /** Timestamp of the most recent update across the dataset. */
  getLastUpdated(): Promise<string>;
}

class FixtureMarketDataService implements MarketDataService {
  async getBulkWineQuotes(filter?: QuoteFilter): Promise<PriceQuote[]> {
    let quotes = bulkWineQuotes;
    if (filter?.countries?.length) {
      quotes = quotes.filter((q) => filter.countries!.includes(q.country));
    }
    if (filter?.colour) {
      quotes = quotes.filter((q) => q.colour === filter.colour);
    }
    return quotes;
  }

  async getPriceSeries(code: string): Promise<PriceSeries | null> {
    return sampleSeries.code === code ? sampleSeries : null;
  }

  async getMarketCommentary(): Promise<MarketCommentary | null> {
    return sampleCommentary;
  }

  async getLastUpdated(): Promise<string> {
    return FIXTURE_UPDATED_AT;
  }
}

let service: MarketDataService | null = null;

export function getMarketDataService(): MarketDataService {
  service ??= new FixtureMarketDataService();
  return service;
}
