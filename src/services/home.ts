/**
 * Homepage data service.
 *
 * Aggregates everything the homepage needs behind one typed interface.
 * Figures that exist in another domain are read from that domain's
 * service and never copied: the market strip repeats the key price
 * records, the supply snapshot is the current campaign's supply balance
 * and the trade snapshot is built from the trade categories. The
 * fixture-backed implementation is development-only; a production
 * implementation composes real sources without any component changes.
 */

import {
  HOME_UPDATED_AT,
  harvestRegions,
  homeLeadAnalysis,
  homeSecondaryAnalysis,
  industryDigest,
  keyPrices,
  leadBriefing,
  stripOtherQuotes,
  stripPriceCodes,
  supplySnapshotText,
} from "@/fixtures/home";
import { getSource, type SourceId } from "@/services/markets/sources";
import { getSupplyService } from "@/services/supply/service";
import type { SupplyBalanceComputed } from "@/services/supply/types";
import { getTradeService } from "@/services/trade/service";
import {
  TRADE_CATEGORY_LABELS,
  type TradeCategoryDetail,
  type TradePeriod,
} from "@/services/trade/types";
import type {
  Article,
  CountryCode,
  DataStatus,
  HarvestRegion,
  IndustryDigest,
  MarketBriefing,
  PriceQuote,
  StripQuote,
  SupplySnapshot,
  TradeOverview,
  TradeRankRow,
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
  getLastUpdated(): Promise<string>;
}

/**
 * Strip entries for key prices, read from the key price records by code
 * and placed before the quotes the table does not carry. Values are
 * passed through unconverted.
 */
export function buildMarketStrip(
  quotes: PriceQuote[],
  codes: { code: string; name: string }[],
  others: StripQuote[],
): StripQuote[] {
  const fromKeyPrices = codes.map(({ code, name }) => {
    const quote = quotes.find((candidate) => candidate.code === code);
    if (!quote) throw new Error(`No key price record for strip code ${code}`);
    return {
      id: `st-${quote.id}`,
      name,
      country: quote.country,
      value: quote.price,
      unit: quote.unit,
      changePercent: quote.changePercent,
      observedAt: quote.observedAt,
      status: quote.status,
    };
  });
  return [...fromKeyPrices, ...others];
}

const round1 = (value: number) => Math.round(value * 10) / 10;

/** Sample sources stand in for real ones, so their figures are illustrative. */
function statusFor(sourceId: SourceId, status: DataStatus): DataStatus {
  return getSource(sourceId).isSample ? "illustrative" : status;
}

/**
 * Supply snapshot rows: each country's balance for the campaign, compared
 * with its balance for the previous campaign. Imports are the balance's
 * own stated figure, never a residual.
 */
export function buildSupplySnapshot(
  campaign: string,
  previousCampaign: string,
  current: SupplyBalanceComputed[],
  previous: SupplyBalanceComputed[],
): SupplySnapshot {
  const first = current[0];
  if (!first) throw new Error(`No supply balance for ${campaign}`);
  return {
    campaign,
    previousCampaign,
    rows: current.map((balance) => {
      const before = previous.find((row) => row.country === balance.country);
      if (!before) {
        throw new Error(`No ${previousCampaign} balance for ${balance.country}`);
      }
      return {
        country: balance.country,
        productionMhl: balance.productionMhl,
        openingStocksMhl: balance.openingStocksMhl,
        importsMhl: balance.importsMhl,
        availabilityMhl: balance.availabilityMhl,
        vsPreviousPercent:
          (balance.availabilityMhl / before.availabilityMhl - 1) * 100,
      };
    }),
    takeaway: supplySnapshotText.takeaway,
    note: supplySnapshotText.note,
    status: statusFor(first.sourceId, first.status),
    source: { name: getSource(first.sourceId).name },
    updatedAt: first.updatedAt,
  };
}

/**
 * The customs categories that are wine. Their volumes are hectolitres of
 * wine and add up; must and concentrates are shipped at very different
 * concentrations and are never added to them.
 */
export const WINE_TRADE_CATEGORIES = ["bulk", "bottled", "sparkling"] as const;

type WineTradeCategory = (typeof WINE_TRADE_CATEGORIES)[number];

/** Product form names for the composition list. */
const FORM_LABELS: Record<WineTradeCategory, string> = {
  bulk: "Bulk",
  bottled: "Bottled",
  sparkling: "Sparkling",
};

/** The category whose leading destinations the snapshot lists. */
const DESTINATIONS_CATEGORY: WineTradeCategory = "bottled";

/**
 * The trade snapshot, built from the trade categories:
 *
 * - exporters: each country's wine exports, summed across the three wine
 *   categories; the year-on-year change compares that sum with the sum
 *   of the same rows' volumes a year earlier;
 * - destinations: one category's ranked list as published, because the
 *   destination lists are top-five rankings and cannot be summed across
 *   categories without missing partners;
 * - split: each wine category's share of their combined volume. Still
 *   wine in containers of 2 to 10 litres belongs to none of the sample
 *   categories, so the shares cover only the forms shown.
 */
export function buildTradeOverview(
  period: TradePeriod,
  details: TradeCategoryDetail[],
): TradeOverview {
  const wine = WINE_TRADE_CATEGORIES.map((category) => {
    const detail = details.find((d) => d.category === category);
    if (!detail) throw new Error(`No trade data for ${category}`);
    return { category, detail };
  });

  const totals = new Map<CountryCode, { current: number; previous: number }>();
  for (const { detail } of wine) {
    for (const row of detail.exporters) {
      const total = totals.get(row.country) ?? { current: 0, previous: 0 };
      total.current += row.volumeMhl;
      total.previous += row.volumeMhl / (1 + row.yoyPercent / 100);
      totals.set(row.country, total);
    }
  }
  const exporters: TradeRankRow[] = [...totals.entries()]
    .map(([country, total]) => ({
      country,
      volumeMhl: round1(total.current),
      yoyPercent: (total.current / total.previous - 1) * 100,
    }))
    .sort((a, b) => b.volumeMhl - a.volumeMhl)
    .map((row, index) => ({ rank: index + 1, ...row }));

  const destinations: TradeRankRow[] = wine
    .find(({ category }) => category === DESTINATIONS_CATEGORY)!
    .detail.destinations.map((row) => ({
      rank: row.rank,
      country: row.country,
      volumeMhl: row.volumeMhl,
      yoyPercent: row.yoyPercent,
    }));

  const splitTotalMhl = round1(
    wine.reduce((sum, { detail }) => sum + detail.summary.exportVolumeMhl, 0),
  );
  const split = wine.map(({ category, detail }) => ({
    label: FORM_LABELS[category],
    volumeMhl: detail.summary.exportVolumeMhl,
    sharePercent: (detail.summary.exportVolumeMhl / splitTotalMhl) * 100,
  }));

  const { detail: first } = wine[0];
  return {
    period: period.label,
    exporters,
    destinations,
    destinationsLabel: TRADE_CATEGORY_LABELS[DESTINATIONS_CATEGORY],
    split,
    splitTotalMhl,
    scopeNote:
      "Wine adds the bulk, bottled and sparkling categories; grape must is a separate heading and is not included. Still wine in containers of 2 to 10 litres, such as bag-in-box, is not covered by these categories.",
    status: statusFor(first.sourceId, first.summary.status),
    source: { name: getSource(first.sourceId).name },
    updatedAt: wine
      .map(({ detail }) => detail.updatedAt)
      .sort()
      .at(-1)!,
  };
}

class FixtureHomeService implements HomeService {
  async getMarketStrip(): Promise<StripQuote[]> {
    return buildMarketStrip(keyPrices, stripPriceCodes, stripOtherQuotes);
  }

  async getLeadBriefing(): Promise<MarketBriefing> {
    return leadBriefing;
  }

  async getKeyPrices(): Promise<PriceQuote[]> {
    return keyPrices;
  }

  async getSupplySnapshot(): Promise<SupplySnapshot> {
    const supply = getSupplyService();
    const campaigns = await supply.getCampaigns();
    const campaign = await supply.getCurrentCampaign();
    const index = campaigns.findIndex((c) => c.code === campaign);
    const previousCampaign = campaigns[index - 1]?.code;
    if (!previousCampaign) throw new Error(`No campaign before ${campaign}`);
    const [current, previous] = await Promise.all([
      supply.getBalances(campaign),
      supply.getBalances(previousCampaign),
    ]);
    return buildSupplySnapshot(campaign, previousCampaign, current, previous);
  }

  async getHarvestRegions(): Promise<HarvestRegion[]> {
    return harvestRegions;
  }

  async getTradeOverview(): Promise<TradeOverview> {
    const trade = getTradeService();
    const [period, details] = await Promise.all([
      trade.getPeriod(),
      trade.getAllCategoryDetails(),
    ]);
    return buildTradeOverview(period, details);
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

let service: HomeService | null = null;

export function getHomeService(): HomeService {
  service ??= new FixtureHomeService();
  return service;
}
