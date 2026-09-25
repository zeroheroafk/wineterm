/**
 * Supply service: balances, production comparisons and stocks with
 * derived context. Fixture-backed; the interface is the seam for real
 * declaration data later.
 */

import {
  CURRENT_CAMPAIGN,
  PREVIOUS_CAMPAIGN,
  campaigns,
  openingStocksHistory,
  productionRecords,
  stockRecords,
  supplyBalances,
} from "@/fixtures/supply";
import type {
  Campaign,
  ProductionComparison,
  ProductionRecord,
  StockComparison,
  SupplyBalanceComputed,
} from "@/services/supply/types";
import { PRODUCER_COUNTRIES, type ProducerCountry } from "@/services/types";

const round1 = (v: number) => Math.round(v * 10) / 10;

export interface SupplyService {
  getCampaigns(): Promise<Campaign[]>;
  getCurrentCampaign(): Promise<string>;
  /** Computed balances for a campaign, one row per country. */
  getBalances(campaign: string): Promise<SupplyBalanceComputed[]>;
  getProductionComparisons(): Promise<ProductionComparison[]>;
  getProductionByCampaign(): Promise<ProductionRecord[]>;
  getStocks(): Promise<StockComparison[]>;
  getOpeningStocksHistory(): Promise<
    Record<ProducerCountry, { campaign: string; stocksMhl: number }[]>
  >;
}

function computeBalance(
  campaign: string,
  country: ProducerCountry,
): SupplyBalanceComputed | null {
  const balance = supplyBalances.find(
    (row) => row.campaign === campaign && row.country === country,
  );
  if (!balance) return null;
  const availabilityMhl = round1(
    balance.openingStocksMhl + balance.productionMhl + balance.importsMhl,
  );
  const closingStocksMhl = round1(
    availabilityMhl - balance.domesticUseMhl - balance.exportsMhl,
  );

  const campaignIndex = campaigns.findIndex((c) => c.code === campaign);
  const next = campaigns[campaignIndex + 1];
  const nextBalance = next
    ? supplyBalances.find(
        (row) => row.campaign === next.code && row.country === country,
      )
    : undefined;

  return {
    ...balance,
    availabilityMhl,
    closingStocksMhl,
    yieldHlHa: round1((balance.productionMhl * 1000) / balance.vineyardKha),
    residualMhl: nextBalance
      ? round1(nextBalance.openingStocksMhl - closingStocksMhl)
      : null,
  };
}

class FixtureSupplyService implements SupplyService {
  async getCampaigns(): Promise<Campaign[]> {
    return campaigns;
  }

  async getCurrentCampaign(): Promise<string> {
    return CURRENT_CAMPAIGN;
  }

  async getBalances(campaign: string): Promise<SupplyBalanceComputed[]> {
    return PRODUCER_COUNTRIES.map((country) =>
      computeBalance(campaign, country),
    ).filter((row): row is SupplyBalanceComputed => row !== null);
  }

  async getProductionComparisons(): Promise<ProductionComparison[]> {
    const totals = productionRecords.filter((r) => r.colour === "total");
    const completed = campaigns
      .filter((c) => !c.isEstimate)
      .slice(-5)
      .map((c) => c.code);

    return PRODUCER_COUNTRIES.map((country) => {
      const byCampaign = (code: string) =>
        totals.find((r) => r.country === country && r.campaign === code);
      const current = byCampaign(CURRENT_CAMPAIGN);
      const previous = byCampaign(PREVIOUS_CAMPAIGN);
      const fiveYear = completed
        .map((code) => byCampaign(code)?.volumeMhl ?? 0)
        .filter((v) => v > 0);
      const fiveYearAvg =
        fiveYear.reduce((sum, v) => sum + v, 0) / fiveYear.length;

      const colour = (kind: "red-rose" | "white") =>
        productionRecords.find(
          (r) =>
            r.country === country &&
            r.campaign === CURRENT_CAMPAIGN &&
            r.colour === kind,
        )?.volumeMhl ?? 0;
      const currentVolume = current?.volumeMhl ?? 0;

      return {
        country,
        currentMhl: currentVolume,
        currentStatus: current?.status ?? "estimate",
        previousMhl: previous?.volumeMhl ?? 0,
        fiveYearAvgMhl: round1(fiveYearAvg),
        vsPreviousPercent:
          ((currentVolume - (previous?.volumeMhl ?? 0)) /
            (previous?.volumeMhl ?? 1)) *
          100,
        vsFiveYearPercent: ((currentVolume - fiveYearAvg) / fiveYearAvg) * 100,
        redRoseShare: (colour("red-rose") / currentVolume) * 100,
        whiteShare: (colour("white") / currentVolume) * 100,
      };
    });
  }

  async getProductionByCampaign(): Promise<ProductionRecord[]> {
    return productionRecords.filter((r) => r.colour === "total");
  }

  async getStocks(): Promise<StockComparison[]> {
    const total = stockRecords.reduce((sum, r) => sum + r.stocksMhl, 0);
    const previousBalances = await this.getBalances(PREVIOUS_CAMPAIGN);
    return stockRecords.map((record) => {
      const balance = previousBalances.find(
        (b) => b.country === record.country,
      );
      const monthlyUse = balance
        ? (balance.domesticUseMhl + balance.exportsMhl) / 12
        : null;
      return {
        ...record,
        yoyPercent:
          ((record.stocksMhl - record.yearEarlierMhl) / record.yearEarlierMhl) *
          100,
        shareOfTotalPercent: (record.stocksMhl / total) * 100,
        monthsOfUse: monthlyUse ? round1(record.stocksMhl / monthlyUse) : null,
      };
    });
  }

  async getOpeningStocksHistory() {
    return openingStocksHistory;
  }
}

let service: SupplyService | null = null;

export function getSupplyService(): SupplyService {
  service ??= new FixtureSupplyService();
  return service;
}
