/**
 * Spain's declared balance from INFOVI rows: exits abroad are stored both
 * as the totals of table 4.0 and split by colour and presentation from
 * tables 4.3 and 4.4, and the totals must not be counted twice.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { type FigureRow, spainBalance } from "@/services/supply/service";

function row(
  period: string,
  measure: string,
  volume_hl: number,
  colour = "all",
  presentation = "all",
): FigureRow {
  return {
    country: "ES",
    period: `${period}-01`,
    measure,
    product: "wine",
    colour,
    presentation,
    volume_hl,
    source_id: "mapa-infovi",
    published_at: "2026-09-29T00:00:00Z",
    updated_at: "2026-09-29T00:00:00Z",
    revised: false,
  };
}

/** One August with stocks either side, every flow declared, exits abroad split or not. */
function august(split: boolean): FigureRow[] {
  const rows = [
    row("2026-07", "closing-stocks", 30_000_000, "red-rose", "bulk"),
    row("2026-08", "closing-stocks", 29_000_000, "red-rose", "bulk"),
    row("2026-08", "production-to-date", 500_000, "red-rose"),
    ...[
      "entries-domestic",
      "entries-eu",
      "entries-third-countries",
      "exits-domestic",
      "exits-distillation",
      "exits-vinegar",
    ].map((measure) => row("2026-08", measure, 100_000)),
    row("2026-08", "exits-eu", 750_000),
    row("2026-08", "exits-third-countries", 320_000),
  ];
  if (!split) return rows;
  return [
    ...rows,
    row("2026-08", "exits-eu", 190_000, "red-rose", "bulk"),
    row("2026-08", "exits-eu", 100_000, "red-rose", "packaged"),
    row("2026-08", "exits-eu", 340_000, "white", "bulk"),
    row("2026-08", "exits-eu", 120_000, "white", "packaged"),
    row("2026-08", "exits-third-countries", 80_000, "red-rose", "bulk"),
    row("2026-08", "exits-third-countries", 120_000, "red-rose", "packaged"),
    row("2026-08", "exits-third-countries", 30_000, "white", "bulk"),
    row("2026-08", "exits-third-countries", 90_000, "white", "packaged"),
  ];
}

describe("Spain's declared balance", () => {
  it("reads exits abroad once when they are also split", () => {
    const split = spainBalance(august(true))!.latest;
    const totals = spainBalance(august(false))!.latest;
    assert.equal(split.exitsEuMhl, 0.75);
    assert.equal(split.exitsThirdCountriesMhl, 0.32);
    assert.deepEqual({ ...split, exitsAbroad: null }, totals);
  });

  it("splits exits abroad by colour, bulk first", () => {
    const { exitsAbroad } = spainBalance(august(true))!.latest;
    assert.deepEqual(exitsAbroad, [
      { colour: "red-rose", presentation: "bulk", euMhl: 0.19, thirdCountriesMhl: 0.08 },
      { colour: "white", presentation: "bulk", euMhl: 0.34, thirdCountriesMhl: 0.03 },
      { colour: "red-rose", presentation: "packaged", euMhl: 0.1, thirdCountriesMhl: 0.12 },
      { colour: "white", presentation: "packaged", euMhl: 0.12, thirdCountriesMhl: 0.09 },
    ]);
  });

  it("has no split until every month of the period has one", () => {
    assert.equal(spainBalance(august(false))!.latest.exitsAbroad, null);
  });
});
