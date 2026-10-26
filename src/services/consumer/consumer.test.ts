/**
 * The consumer pages' figures: values per 75 cl bottle from the trade
 * aggregates, the wine price indices by country and the US average price
 * of table wine, from rows as the database returns them.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  bottleValues,
  type BottleSnapshot,
  type PriceRow,
  usWinePrice,
  winePriceIndices,
} from "@/services/consumer/service";
import { perBottle } from "@/services/consumer/types";

type DestinationRow = BottleSnapshot["destinations"][number];

function destination(
  reporter: string,
  partner: string,
  place: number,
  litres: number,
  valueEur: number,
  litresPriorYear: number,
  valueEurPriorYear: number,
  product = "220421",
): DestinationRow {
  return {
    product,
    reporter,
    partner,
    place,
    litres,
    value_eur: valueEur,
    litres_prior_year: litresPriorYear,
    value_eur_prior_year: valueEurPriorYear,
    litres_complete: true,
  };
}

function price(
  country: string,
  period: string,
  value: number,
  annualRate: number | null = null,
  source = "eurostat-hicp",
): PriceRow {
  const bls = source === "bls-average-prices";
  return {
    country,
    product: bls ? "table-wine" : "wine-from-grapes",
    measure: bls ? "average-price" : "index",
    period: `${period}-01`,
    value,
    unit: bls ? "USD/litre" : "2025=100",
    annual_rate: annualRate,
    status: "final",
    source_id: source,
    published_at: `${period}-28T09:00:00Z`,
    updated_at: "2026-10-23T16:30:00Z",
    revised: false,
  };
}

describe("perBottle", () => {
  it("expresses a value per litre per 75 cl bottle", () => {
    assert.equal(perBottle(9, 3), 2.25);
  });

  it("has no value without litres", () => {
    assert.equal(perBottle(9, 0), null);
  });
});

describe("bottleValues", () => {
  const snapshot: BottleSnapshot = {
    endMonth: "2026-07-01",
    updatedAt: "2026-09-20T05:40:00Z",
    destinations: [
      destination("PT", "GB", 2, 22_000_000, 84_000_000, 21_000_000, 84_000_000),
      destination("PT", "WORLD", 0, 236_000_000, 811_000_000, 230_000_000, 794_000_000),
      destination("PT", "BR", 1, 27_000_000, 84_000_000, 26_000_000, 80_000_000),
      // A destination whose exports all fell in the year before has no litres.
      destination("PT", "XK", 3, 0, 0, 1_000, 3_000),
      destination("ES", "BR", 1, 6_000_000, 16_000_000, 6_000_000, 15_000_000),
      destination("PT", "WORLD", 0, 2_200_000, 13_500_000, 2_000_000, 9_500_000, "220410"),
    ],
    monthly: [
      { product: "220421", reporter: "PT", period: "2026-07-01", litres: 20_000_000, value_eur: 70_000_000, litres_complete: true },
      { product: "220421", reporter: "FR", period: "2026-06-01", litres: 70_000_000, value_eur: 530_000_000, litres_complete: true },
      { product: "220421", reporter: "PT", period: "2023-07-01", litres: 19_000_000, value_eur: 60_000_000, litres_complete: true },
    ],
  };
  const values = bottleValues(snapshot);

  it("lists an origin with its world total and its destinations in rank order", () => {
    const [portugal] = values.origins.bottled;
    assert.equal(portugal.origin, "PT");
    assert.equal(portugal.world.destination, "WORLD");
    assert.ok(Math.abs(portugal.world.eurPerBottle - (811 / 236) * 0.75) < 1e-9);
    assert.ok(Math.abs(portugal.world.bottlesM - 236 / 0.75) < 1e-9);
    assert.deepEqual(
      portugal.destinations.map((row) => row.destination),
      ["BR", "GB"],
    );
  });

  it("compares the value per bottle with the twelve months before", () => {
    const britain = values.origins.bottled[0].destinations[1];
    assert.ok(Math.abs(britain.yoyPercent! - ((84 / 22) / (84 / 21) - 1) * 100) < 1e-9);
  });

  it("leaves out an origin without a world total", () => {
    assert.deepEqual(values.origins.bottled.map((row) => row.origin), ["PT"]);
    assert.deepEqual(values.origins.sparkling.map((row) => row.origin), ["PT"]);
  });

  it("charts 36 months to the end of the period, values per bottle by origin", () => {
    const months = values.monthly.bottled;
    assert.equal(months.length, 36);
    assert.equal(months[0].month, "2023-08");
    assert.equal(months[35].month, "2026-07");
    assert.equal(months[35].values.PT, 2.625);
    assert.ok(Math.abs(months[34].values.FR! - (530 / 70) * 0.75) < 1e-9);
    assert.deepEqual(values.period, {
      label: "12 months to Jul 2026",
      latestMonth: "2026-07",
    });
  });
});

describe("winePriceIndices", () => {
  const rows = [
    price("DE", "2021-09", 90),
    price("DE", "2026-09", 100.24, 0),
    price("AT", "2026-09", 100.97, 1.8),
    price("PT", "2021-09", 85),
    price("PT", "2026-08", 98.5, -1.2),
    price("PT", "2026-09", 97.9, -1.5),
    price("EU", "2026-09", 100.34, 0.3),
    price("US", "2026-09", 13.769, null, "bls-average-prices"),
  ];
  const indices = winePriceIndices(rows)!;

  it("lists the EU, then the producer countries, then the others by name", () => {
    assert.deepEqual(
      indices.rows.map((row) => row.country),
      ["EU", "PT", "AT", "DE"],
    );
  });

  it("keeps the published annual rate and computes the change over five years", () => {
    const portugal = indices.rows[1];
    assert.equal(portugal.month, "2026-09");
    assert.equal(portugal.annualRate, -1.5);
    assert.ok(Math.abs(portugal.fiveYearPercent! - (97.9 / 85 - 1) * 100) < 1e-9);
    assert.equal(indices.rows[0].fiveYearPercent, null);
  });

  it("charts the EU and the producer countries only", () => {
    assert.deepEqual(
      indices.history.map((point) => point.month),
      ["2021-09", "2026-08", "2026-09"],
    );
    assert.deepEqual(indices.history[2].values, { PT: 97.9, EU: 100.34 });
    assert.equal(indices.latestMonth, "2026-09");
  });

  it("has nothing to show without indices", () => {
    assert.equal(winePriceIndices([]), null);
  });
});

describe("usWinePrice", () => {
  const rows = [
    price("US", "2025-09", 13.97, null, "bls-average-prices"),
    // October 2025 was not collected, during the lapse in appropriations.
    price("US", "2025-11", 14.106, null, "bls-average-prices"),
    price("US", "2026-09", 13.769, null, "bls-average-prices"),
    price("PT", "2026-09", 97.9, -1.5),
  ];

  it("gives the latest price per litre and per bottle against a year earlier", () => {
    const us = usWinePrice(rows)!;
    assert.equal(us.month, "2026-09");
    assert.equal(us.usdPerLitre, 13.769);
    assert.ok(Math.abs(us.usdPerBottle - 13.769 * 0.75) < 1e-9);
    assert.ok(Math.abs(us.yoyPercent! - (13.769 / 13.97 - 1) * 100) < 1e-9);
  });

  it("charts every month, leaving a gap where the BLS published none", () => {
    const { history } = usWinePrice(rows)!;
    assert.equal(history.length, 13);
    assert.equal(history[0].month, "2025-09");
    assert.deepEqual(history[1], { month: "2025-10", usdPerBottle: null });
    assert.ok(Math.abs(history[2].usdPerBottle! - 14.106 * 0.75) < 1e-9);
    assert.equal(history[3].usdPerBottle, null);
    assert.equal(history[12].month, "2026-09");
  });

  it("has nothing to show without prices", () => {
    assert.equal(usWinePrice(rows.slice(3)), null);
  });
});
