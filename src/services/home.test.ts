/**
 * Regression checks for the homepage figures that are read from other
 * domains: no conversion between the price displays, no grape must in
 * wine trade totals, and supply rows equal to the supply balances.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { keyPrices } from "@/fixtures/home";
import { buildTradeOverview, getHomeService } from "@/services/home";
import { getSupplyService } from "@/services/supply/service";
import { getTradeService } from "@/services/trade/service";
import type {
  TradeCategoryDetail,
  TradePartnerRow,
} from "@/services/trade/types";

const home = getHomeService();

describe("market strip", () => {
  it("repeats the key price records without converting them", async () => {
    const strip = await home.getMarketStrip();
    for (const quote of keyPrices) {
      const entry = strip.find((item) => item.id === `st-${quote.id}`);
      if (!entry) continue;
      assert.equal(entry.value, quote.price, quote.code);
      assert.equal(entry.unit, quote.unit, quote.code);
      assert.equal(entry.changePercent, quote.changePercent, quote.code);
      assert.equal(entry.observedAt, quote.observedAt, quote.code);
      assert.equal(entry.status, quote.status, quote.code);
    }
    assert.equal(strip.filter((item) => item.id.startsWith("st-kp-")).length, 5);
  });
});

describe("trade snapshot", () => {
  it("adds the wine categories and leaves grape must out", async () => {
    const trade = getTradeService();
    const details = await trade.getAllCategoryDetails();
    const overview = await home.getTradeOverview();
    const wine = details.filter((detail) => detail.category !== "must");

    for (const row of overview.exporters) {
      const sum = wine
        .flatMap((detail) => detail.exporters)
        .filter((exporter) => exporter.country === row.country)
        .reduce((total, exporter) => total + exporter.volumeMhl, 0);
      assert.equal(row.volumeMhl, Math.round(sum * 10) / 10, row.country);
    }
    // Spain: bulk 10.9 + bottled 9.2 + sparkling 0.4; must 0.5 excluded.
    assert.equal(overview.exporters[0].country, "ES");
    assert.equal(overview.exporters[0].volumeMhl, 20.5);
  });

  it("never counts must, even when it is the only change", () => {
    const row = (country: "ES", volumeMhl: number): TradePartnerRow => ({
      rank: 1,
      country,
      direction: "export",
      volumeMhl,
      valueMeur: 1,
      unitValueEurL: 1,
      yoyPercent: 0,
      momPercent: 0,
      sharePercent: 100,
    });
    const detail = (
      category: TradeCategoryDetail["category"],
      volumeMhl: number,
    ): TradeCategoryDetail => ({
      category,
      summary: {
        category,
        exportVolumeMhl: volumeMhl,
        exportValueMeur: 1,
        importVolumeMhl: 0,
        importValueMeur: 0,
        exportUnitValueEurL: 1,
        volumeYoYPercent: 0,
        valueYoYPercent: 0,
        status: "provisional",
      },
      exporters: [row("ES", volumeMhl)],
      destinations: [{ ...row("ES", volumeMhl), direction: "import" }],
      topFlows: [],
      note: "",
      sourceId: "sample-customs",
      updatedAt: "2026-08-21T09:30:00Z",
    });
    const period = { label: "12 months", latestMonth: "2026-06" };
    const wineOnly = [detail("bulk", 1), detail("bottled", 2), detail("sparkling", 3)];
    const withMust = [...wineOnly, detail("must", 40)];

    const overview = buildTradeOverview(period, withMust);
    assert.deepEqual(overview, buildTradeOverview(period, wineOnly));
    assert.equal(overview.exporters[0].volumeMhl, 6);
    assert.equal(overview.splitTotalMhl, 6);
  });

  it("derives the year-on-year change from last year's volumes", async () => {
    const overview = await home.getTradeOverview();
    const spain = overview.exporters.find((row) => row.country === "ES")!;
    // 10.9 / 0.97 + 9.2 / 1.004 + 0.4 / 1.02 a year earlier.
    const previous = 10.9 / 0.97 + 9.2 / 1.004 + 0.4 / 1.02;
    assert.ok(Math.abs(spain.yoyPercent - (20.5 / previous - 1) * 100) < 1e-9);
  });

  it("states shares of the three wine forms without rescaling them", async () => {
    const overview = await home.getTradeOverview();
    const summaries = await getTradeService().getCategorySummaries();
    const volume = (category: string) =>
      summaries.find((summary) => summary.category === category)!
        .exportVolumeMhl;
    const total = volume("bulk") + volume("bottled") + volume("sparkling");

    assert.equal(overview.splitTotalMhl, Math.round(total * 10) / 10);
    assert.deepEqual(
      overview.split.map((segment) => segment.label),
      ["Bulk", "Bottled", "Sparkling"],
    );
    for (const segment of overview.split) {
      assert.ok(
        Math.abs(
          segment.sharePercent -
            (segment.volumeMhl / overview.splitTotalMhl) * 100,
        ) < 1e-9,
      );
    }
  });
});

describe("supply snapshot", () => {
  it("shows each balance's own figures, imports included", async () => {
    const supply = getSupplyService();
    const balances = await supply.getBalances(await supply.getCurrentCampaign());
    const snapshot = await home.getSupplySnapshot();

    assert.equal(snapshot.rows.length, balances.length);
    for (const row of snapshot.rows) {
      const balance = balances.find((b) => b.country === row.country)!;
      assert.equal(row.productionMhl, balance.productionMhl, row.country);
      assert.equal(row.openingStocksMhl, balance.openingStocksMhl, row.country);
      assert.equal(row.importsMhl, balance.importsMhl, row.country);
      assert.equal(row.availabilityMhl, balance.availabilityMhl, row.country);
      assert.equal(
        row.availabilityMhl,
        Math.round(
          (row.openingStocksMhl + row.productionMhl + row.importsMhl) * 10,
        ) / 10,
        row.country,
      );
    }
  });
});
