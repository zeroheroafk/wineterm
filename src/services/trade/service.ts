/**
 * Trade service: category summaries, ranked partners, relationships and
 * monthly evolution. Categories are never combined. Fixture-backed.
 */

import {
  monthlyExportVolumes,
  tradeCategoryDetails,
  tradePeriod,
} from "@/fixtures/trade";
import type {
  TradeCategory,
  TradeCategoryDetail,
  TradeCategorySummary,
  TradeMonthlyPoint,
  TradePeriod,
} from "@/services/trade/types";

export interface TradeService {
  getPeriod(): Promise<TradePeriod>;
  getCategorySummaries(): Promise<TradeCategorySummary[]>;
  getCategoryDetail(category: TradeCategory): Promise<TradeCategoryDetail | null>;
  getAllCategoryDetails(): Promise<TradeCategoryDetail[]>;
  getMonthlyExportVolumes(category: TradeCategory): Promise<TradeMonthlyPoint[]>;
}

class FixtureTradeService implements TradeService {
  async getPeriod(): Promise<TradePeriod> {
    return tradePeriod;
  }

  async getCategorySummaries(): Promise<TradeCategorySummary[]> {
    return tradeCategoryDetails.map((d) => d.summary);
  }

  async getCategoryDetail(
    category: TradeCategory,
  ): Promise<TradeCategoryDetail | null> {
    return tradeCategoryDetails.find((d) => d.category === category) ?? null;
  }

  async getAllCategoryDetails(): Promise<TradeCategoryDetail[]> {
    return tradeCategoryDetails;
  }

  async getMonthlyExportVolumes(
    category: TradeCategory,
  ): Promise<TradeMonthlyPoint[]> {
    return monthlyExportVolumes(category);
  }
}

let service: TradeService | null = null;

export function getTradeService(): TradeService {
  service ??= new FixtureTradeService();
  return service;
}
