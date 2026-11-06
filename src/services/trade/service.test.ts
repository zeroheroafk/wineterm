/**
 * Regression checks for the trade overview, which adds up the wine
 * categories: no grape must in wine totals, year-on-year changes derived
 * from last year's volumes, and shares stated without rescaling. Without
 * Supabase configured the service reads the fixtures, so the checks run
 * offline.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildTradeOverview, getTradeService } from "@/services/trade/service";
import type {
  TradeCategoryDetail,
  TradePartnerRow,
} from "@/services/trade/types";

describe("trade overview", () => {
  it("adds the wine categories and leaves grape must out", async () => {
    const trade = getTradeService();
    const details = await trade.getAllCategoryDetails();
    const overview = await getTradeService().getOverview();
    const wine = details.filter((detail) => detail.category !== "must");

    for (const row of overview.exporters) {
      const sum = wine
        .flatMap((detail) => detail.exporters)
        .filter((exporter) => exporter.country === row.country)
        .reduce((total, exporter) => total + exporter.volumeMhl, 0);
      assert.equal(row.volumeMhl, Math.round(sum * 10) / 10, row.country);
    }
    // Spain: bulk 10.9 + bottled 9.2 + bag-in-box 0.6 + sparkling 0.4;
    // its 0.5 of grape must is left out.
    assert.equal(overview.exporters[0].country, "ES");
    assert.equal(overview.exporters[0].volumeMhl, 21.1);
  });

  it("never counts must, even when it is the only change", () => {
    const row = (country: string, volumeMhl: number): TradePartnerRow => ({
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
        status: "illustrative",
      },
      exporters: [row("ES", volumeMhl)],
      destinations: [{ ...row("DE", volumeMhl), direction: "import" }],
      topFlows: [],
      note: "",
      sourceId: "sample-customs",
      updatedAt: "2026-08-21T09:30:00Z",
    });
    const period = { label: "12 months", latestMonth: "2026-06" };
    const wineOnly = [
      detail("bulk", 1),
      detail("bottled", 2),
      detail("bag-in-box", 0.5),
      detail("sparkling", 3),
    ];
    const withMust = [...wineOnly, detail("must", 40)];

    const overview = buildTradeOverview(period, withMust);
    assert.deepEqual(overview, buildTradeOverview(period, wineOnly));
    assert.equal(overview.exporters[0].volumeMhl, 6.5);
    assert.equal(overview.splitTotalMhl, 6.5);
  });

  it("derives the year-on-year change from last year's volumes", async () => {
    const overview = await getTradeService().getOverview();
    const spain = overview.exporters.find((row) => row.country === "ES")!;
    // 10.9 / 0.97 + 9.2 / 1.004 + 0.6 / 1.028 + 0.4 / 1.02 a year earlier.
    const previous = 10.9 / 0.97 + 9.2 / 1.004 + 0.6 / 1.028 + 0.4 / 1.02;
    const current = 10.9 + 9.2 + 0.6 + 0.4;
    assert.ok(spain.yoyPercent !== null);
    assert.ok(Math.abs(spain.yoyPercent - (current / previous - 1) * 100) < 1e-9);
  });

  it("states shares of the wine forms without rescaling them", async () => {
    const overview = await getTradeService().getOverview();
    const summaries = await getTradeService().getCategorySummaries();
    const wineMhl = summaries
      .filter((summary) => summary.category !== "must")
      .reduce((total, summary) => total + summary.exportVolumeMhl, 0);

    assert.equal(overview.splitTotalMhl, Math.round(wineMhl * 10) / 10);
    assert.deepEqual(
      overview.split.map((segment) => segment.label),
      ["Bulk", "Bottled", "Bag-in-box", "Sparkling"],
    );
    for (const segment of overview.split) {
      assert.ok(
        Math.abs(segment.sharePercent - (segment.volumeMhl / wineMhl) * 100) <
          1e-9,
      );
    }
  });
});
