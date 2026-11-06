/**
 * Regression checks for the key bulk wine prices: they are the markets
 * catalogue's own figures, changes included, and the samples show the
 * changes the sample market text was written against. Without Supabase
 * configured the services read the fixtures, so the checks run offline.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { keyPriceCodes } from "@/fixtures/key-prices";
import {
  getIllustrativeKeyPricesService,
  getKeyPricesService,
} from "@/services/markets/key-prices";
import { getMarketsService } from "@/services/markets/service";

describe("key prices", () => {
  it("are the markets catalogue's figures, changes included", async () => {
    const markets = getMarketsService();
    const quotes = await getKeyPricesService().getKeyPrices();
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
      // The change on the previous price: for the weekly samples, the
      // Markets pages' Wk % too.
      assert.ok(
        Math.abs(quote.changePercent - (row.latest.value / previous.value - 1) * 100) <
          1e-9,
        quote.code,
      );
      if (row.changes.weekPercent !== null) {
        assert.ok(
          Math.abs(quote.changePercent - row.changes.weekPercent) < 1e-9,
          quote.code,
        );
      }
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
    const quotes = await getIllustrativeKeyPricesService().getKeyPrices();
    assert.equal(quotes.length, Object.keys(expected).length);
    for (const quote of quotes) {
      const [week, year] = expected[quote.code];
      assert.equal(Math.round(quote.changePercent * 10) / 10, week, quote.code);
      assert.equal(Math.round(quote.yoyPercent! * 10) / 10, year, quote.code);
    }
  });
});
