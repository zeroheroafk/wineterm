/**
 * Checks on the prices recorded per hectolitre-degree and shown in
 * EUR/hl: the conversion itself, the recorded figures every converted
 * record keeps, and strengths that follow each product's description.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { keyPrices } from "@/fixtures/home";
import { getMarketsService } from "@/services/markets/service";
import {
  describeDegreeBasis,
  perHectolitre,
  type DegreeBasis,
} from "@/services/types";

/**
 * The strength a product description supports: the stated figure, the
 * midpoint of a stated range, or none.
 */
function statedStrength(text: string): { value: number; range: boolean } | null {
  const match = /(\d+(?:\.\d+)?)(?: to (\d+(?:\.\d+)?))? (?:percent|potential) vol/.exec(
    text,
  );
  if (!match) return null;
  const low = Number(match[1]);
  if (match[2] === undefined) return { value: low, range: false };
  return { value: (low + Number(match[2])) / 2, range: true };
}

function assertStrengthFollows(text: string, basis: DegreeBasis, label: string) {
  const stated = statedStrength(text);
  if (basis.strengthBasis === "assumed") {
    assert.equal(stated, null, `${label}: assumed, yet "${text}" states one`);
    return;
  }
  assert.ok(stated, `${label}: "${text}" states no strength`);
  assert.equal(basis.alcoholPercent, stated.value, label);
  assert.equal(basis.strengthBasis === "range-midpoint", stated.range, label);
}

describe("per-degree conversion", () => {
  it("multiplies by the strength and rounds to the cent", () => {
    assert.equal(perHectolitre(4.1, 12.5), 51.25);
    assert.equal(perHectolitre(3.85, 11.5), 44.28);
    assert.equal(perHectolitre(3.2, 11), 35.2);
  });

  it("rounds a fall like the equal rise", () => {
    assert.equal(perHectolitre(0.05, 11.5), 0.58);
    assert.equal(perHectolitre(-0.05, 11.5), -0.58);
    assert.ok(Object.is(perHectolitre(-0, 12), 0));
  });

  it("says where each strength comes from", () => {
    assert.equal(
      describeDegreeBasis({ alcoholPercent: 13, strengthBasis: "stated" }),
      "13% vol, the stated strength",
    );
    assert.equal(
      describeDegreeBasis({ alcoholPercent: 12.5, strengthBasis: "range-midpoint" }),
      "12.5% vol, the midpoint of the stated range",
    );
    assert.equal(
      describeDegreeBasis({ alcoholPercent: 12, strengthBasis: "assumed" }),
      "an assumed 12% vol, as none is stated",
    );
  });
});

describe("sample key prices", () => {
  it("keep the recorded figures beside their EUR/hl conversion", () => {
    const samples = keyPrices.filter((quote) => quote.status === "illustrative");
    assert.ok(samples.length > 0);
    for (const quote of samples) {
      const recorded = quote.perDegree;
      assert.ok(recorded, `${quote.code} keeps no recorded figures`);
      assert.equal(quote.unit, "EUR/hl", quote.code);
      assert.equal(
        quote.price,
        perHectolitre(recorded.price, recorded.alcoholPercent),
        quote.code,
      );
      assert.equal(
        quote.change,
        perHectolitre(recorded.change, recorded.alcoholPercent),
        quote.code,
      );
      assertStrengthFollows(quote.product, recorded, quote.code);
    }
  });
});

describe("catalogue series recorded per degree", () => {
  it("give every observation in EUR/hl at the series strength", async () => {
    const markets = getMarketsService();
    const series = [
      ...(await markets.listSeries("bulk-wine")),
      ...(await markets.listSeries("must")),
    ].filter((item) => item.perDegree);
    assert.ok(series.length >= 12, `only ${series.length} series converted`);

    for (const item of series) {
      const basis = item.perDegree!;
      assert.equal(item.unit, "EUR/hl", item.code);
      assertStrengthFollows(
        [item.product, item.spec].filter(Boolean).join(", "),
        basis,
        item.code,
      );
      const history = await markets.getHistory(item.code);
      assert.ok(history.length > 0, item.code);
      for (const observation of history) {
        assert.ok(observation.perDegreeValue !== undefined, item.code);
        assert.equal(
          observation.value,
          perHectolitre(observation.perDegreeValue, basis.alcoholPercent),
          `${item.code} ${observation.date}`,
        );
      }
    }
  });

  it("leave series without a per-degree basis as recorded", async () => {
    const markets = getMarketsService();
    for (const item of await markets.listSeries()) {
      if (item.perDegree) continue;
      const history = await markets.getHistory(item.code);
      assert.ok(
        history.every((observation) => observation.perDegreeValue === undefined),
        item.code,
      );
    }
  });
});
