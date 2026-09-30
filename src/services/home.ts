/**
 * Homepage data service.
 *
 * Aggregates everything the homepage needs behind one typed interface.
 * Sections with a connected source read it: trade from Eurostat, and the
 * key prices and the market strip from the imported price series, listed
 * before the illustrative fixtures that complete them. Everything else is
 * still illustrative.
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
} from "@/fixtures/home";
import { getMarketsService, isIllustrative } from "@/services/markets/service";
import { getSource } from "@/services/markets/sources";
import type { MarketRow, SeriesObservation } from "@/services/markets/types";
import {
  getIllustrativeTradeService,
  getTradeService,
} from "@/services/trade/service";
import type {
  Article,
  HarvestRegion,
  IndustryDigest,
  MarketBriefing,
  PriceQuote,
  PriceUnit,
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
  getSecondaryAnalysis(): Promise<Article[]>;
  getIndustryDigest(): Promise<IndustryDigest>;
  /** When the key prices were last updated. */
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
    return getIllustrativeTradeService().getOverview();
  }

  async getLeadAnalysis(): Promise<Article> {
    return homeLeadAnalysis;
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

const PRICE_UNITS: PriceUnit[] = ["EUR/hl", "EUR/kg", "EUR/tonne"];

interface ImportedPrice {
  row: MarketRow;
  previous: SeriesObservation;
}

/** Real bulk wine prices, each with its previous observation. */
async function importedPrices(): Promise<ImportedPrice[]> {
  const markets = getMarketsService();
  const rows = (await markets.getRows("bulk-wine")).filter(
    (row) => !isIllustrative(row),
  );
  const prices = await Promise.all(
    rows.map(async (row) => {
      const history = await markets.getHistory(row.series.code, "3m");
      return { row, previous: history.at(-2) };
    }),
  );
  return prices.filter(
    (price): price is ImportedPrice => price.previous !== undefined,
  );
}

function priceUnit(row: MarketRow): PriceUnit | null {
  const unit = row.series.unit as PriceUnit;
  return PRICE_UNITS.includes(unit) ? unit : null;
}

function marketName(row: MarketRow): string {
  return row.series.appellation ?? row.series.region;
}

/** Real prices first, then the illustrative fixtures. */
class LiveHomeService extends FixtureHomeService {
  async getMarketStrip(): Promise<StripQuote[]> {
    const imported = (await importedPrices()).flatMap(({ row, previous }) => {
      const unit = priceUnit(row);
      if (!unit) return [];
      const source = getSource(row.series.sourceId);
      return [
        {
          id: `st-${row.series.code.toLowerCase()}`,
          name: [marketName(row), row.series.colour].filter(Boolean).join(" "),
          country: row.series.country,
          value: row.latest.value,
          unit,
          changePercent: (row.latest.value / previous.value - 1) * 100,
          observedAt: row.latest.date,
          status: row.latest.status,
          source: { name: source.name, url: source.url },
        },
      ];
    });
    return [...imported, ...(await super.getMarketStrip())];
  }

  async getKeyPrices(): Promise<PriceQuote[]> {
    const imported = (await importedPrices()).flatMap(({ row, previous }) => {
      const unit = priceUnit(row);
      if (!unit) return [];
      const source = getSource(row.series.sourceId);
      return [
        {
          id: `kp-${row.series.code.toLowerCase()}`,
          code: row.series.code,
          market: marketName(row),
          country: row.series.country,
          colour: row.series.colour,
          product: row.series.product,
          price: row.latest.value,
          unit,
          change: Math.round((row.latest.value - previous.value) * 100) / 100,
          changePercent: (row.latest.value / previous.value - 1) * 100,
          yoyPercent: row.changes.yoyPercent ?? undefined,
          observedAt: row.latest.date,
          status: row.latest.status,
          source: { name: source.name, url: source.url },
        },
      ];
    });
    return [...imported, ...(await super.getKeyPrices())];
  }

  async getTradeOverview(): Promise<TradeOverview> {
    // Eurostat when Supabase is configured.
    return getTradeService().getOverview();
  }

  async getLastUpdated(): Promise<string> {
    const updates = (await importedPrices()).map(({ row }) => row.latest.updatedAt);
    return [HOME_UPDATED_AT, ...updates].sort().at(-1)!;
  }
}

let service: HomeService | null = null;
let illustrative: HomeService | null = null;

/** The homepage as published: real sources where connected. */
export function getHomeService(): HomeService {
  service ??= new LiveHomeService();
  return service;
}

/**
 * Always the illustrative fixtures, for sample publications such as the
 * Market Outlook, whose text was written against them.
 */
export function getIllustrativeHomeService(): HomeService {
  illustrative ??= new FixtureHomeService();
  return illustrative;
}
