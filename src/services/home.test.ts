/**
 * Regression checks for the homepage figures that are read from other
 * domains: no conversion between the price displays, key prices that are
 * the markets catalogue's own figures, no grape must in wine trade
 * totals, and supply rows equal to the supply balances. Without Supabase
 * configured the services read the fixtures, so the checks run offline.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { keyPriceCodes } from "@/fixtures/home";
import { getHarvestService } from "@/services/harvest/service";
import { getHomeService, getIllustrativeHomeService } from "@/services/home";
import { getMarketsService } from "@/services/markets/service";
import { getSupplyService } from "@/services/supply/service";
import { buildTradeOverview, getTradeService } from "@/services/trade/service";
import type {
  TradeCategoryDetail,
  TradePartnerRow,
} from "@/services/trade/types";

const home = getHomeService();

describe("key prices", () => {
  it("repeat the key prices in the strip without converting them", async () => {
    const strip = await home.getMarketStrip();
    for (const quote of await home.getKeyPrices()) {
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

  it("are the markets catalogue's figures, changes included", async () => {
    const markets = getMarketsService();
    const quotes = await home.getKeyPrices();
    const samples = quotes.filter((quote) => quote.status === "illustrative");
    assert.deepEqual(
      samples.map((quote) => quote.code),
      keyPriceCodes,
    );

    for (const quote of quotes) {
      const row = await markets.getRow(quote.code);
      assert.ok(row, quote.code);
      const previous = (await markets.getHistory(quote.code, "3m")).at(-2)!;
      assert.equal(quote.price, row.latest.value, quote.code);
      assert.equal(quote.unit, row.series.unit, quote.code);
      assert.equal(quote.observedAt, row.latest.date, quote.code);
      assert.equal(
        quote.change,
        Math.round((row.latest.value - previous.value) * 100) / 100,
        quote.code,
      );
      // The table's weekly change and the Markets pages' Wk % alike.
      assert.ok(row.changes.weekPercent !== null, quote.code);
      assert.ok(
        Math.abs(quote.changePercent - row.changes.weekPercent) < 1e-9,
        quote.code,
      );
      assert.equal(quote.yoyPercent, row.changes.yoyPercent ?? undefined, quote.code);
      assert.equal(quote.perDegree?.price, row.latest.perDegreeValue, quote.code);
      assert.equal(
        quote.perDegree?.alcoholPercent,
        row.series.perDegree?.alcoholPercent,
        quote.code,
      );
    }
  });

  it("show the changes the sample market text was written against", async () => {
    // Weekly and annual changes as displayed, to one decimal: reds firm
    // across Iberia on early cover buying, whites easier, Lisboa most.
    const expected: Record<string, [week: number, year: number]> = {
      "ES-CLM-RED-GEN": [2.5, 7.9],
      "ES-CLM-WHT-GEN": [-1.3, -3.7],
      "ES-EXT-RED-GEN": [0, 5.3],
      "PT-ALE-RED-GEN": [2.9, 6.1],
      "PT-LIS-WHT-GEN": [-4.2, -2.3],
      "FR-LAN-RED-NGI": [0.6, -1.1],
      "IT-PUG-RED-GEN": [-1.7, 2.8],
    };
    const quotes = await getIllustrativeHomeService().getKeyPrices();
    assert.equal(quotes.length, Object.keys(expected).length);
    for (const quote of quotes) {
      const [week, year] = expected[quote.code];
      assert.equal(Math.round(quote.changePercent * 10) / 10, week, quote.code);
      assert.equal(Math.round(quote.yoyPercent! * 10) / 10, year, quote.code);
    }
  });
});

describe("lead briefing", () => {
  it("places the first estimates where its summary does", async () => {
    // "first estimates put the new crop above the five-year average in
    // Spain and below it in Portugal"
    const comparisons = await getSupplyService().getProductionComparisons();
    const spain = comparisons.find((row) => row.country === "ES")!;
    const portugal = comparisons.find((row) => row.country === "PT")!;
    assert.ok(spain.vsFiveYearPercent > 0, `Spain ${spain.vsFiveYearPercent}`);
    assert.ok(
      portugal.vsFiveYearPercent < 0,
      `Portugal ${portugal.vsFiveYearPercent}`,
    );
  });
});

describe("harvest monitor", () => {
  it("shows the Harvest page's report for each region", async () => {
    const reports = await getHarvestService().getRegionReports();
    const regions = await home.getHarvestRegions();
    assert.deepEqual(
      regions.map((region) => region.country),
      ["ES", "PT", "FR", "IT"],
    );
    for (const region of regions) {
      const report = reports.find((candidate) => candidate.id === region.id);
      assert.ok(report, region.id);
      assert.equal(region.region, report.region, region.id);
      assert.equal(region.stage, report.stage, region.id);
      assert.equal(region.conditionNote, report.weather, region.id);
      assert.equal(region.expected, report.direction, region.id);
      assert.equal(region.updatedAt, report.updatedAt.slice(0, 10), region.id);
    }
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
    const overview = await home.getTradeOverview();
    const spain = overview.exporters.find((row) => row.country === "ES")!;
    // 10.9 / 0.97 + 9.2 / 1.004 + 0.6 / 1.028 + 0.4 / 1.02 a year earlier.
    const previous = 10.9 / 0.97 + 9.2 / 1.004 + 0.6 / 1.028 + 0.4 / 1.02;
    const current = 10.9 + 9.2 + 0.6 + 0.4;
    assert.ok(spain.yoyPercent !== null);
    assert.ok(Math.abs(spain.yoyPercent - (current / previous - 1) * 100) < 1e-9);
  });

  it("states shares of the wine forms without rescaling them", async () => {
    const overview = await home.getTradeOverview();
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
