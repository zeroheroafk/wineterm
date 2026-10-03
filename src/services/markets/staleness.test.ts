/**
 * A real series whose latest price is overdue is flagged, by its own
 * cadence: three weeks for a weekly source, a little over three months
 * for a monthly one. Samples never are.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { cadenceOf, stalenessOf } from "@/services/markets/service";
import type { SeriesObservation } from "@/services/markets/types";
import type { DataStatus } from "@/services/types";

function observations(
  dates: string[],
  status: DataStatus = "final",
): SeriesObservation[] {
  return dates.map((date) => ({
    date,
    value: 50,
    status,
    publishedAt: date,
    updatedAt: `${date}T06:00:00Z`,
    revised: false,
  }));
}

const weekly = observations([
  "2026-08-02",
  "2026-08-09",
  "2026-08-16",
  "2026-08-23",
  "2026-08-30",
]);
const monthly = observations([
  "2026-03-31",
  "2026-04-30",
  "2026-05-31",
  "2026-06-30",
]);
const at = (iso: string) => Date.parse(`${iso}T12:00:00Z`);

describe("series cadence", () => {
  it("reads weekly and monthly spacing", () => {
    assert.equal(cadenceOf(weekly), "weekly");
    assert.equal(cadenceOf(monthly), "monthly");
  });

  it("stays weekly when a market goes unquoted for some weeks", () => {
    const gappy = observations([
      "2026-05-03",
      "2026-05-10",
      "2026-05-31",
      "2026-06-07",
      "2026-06-14",
      "2026-07-12",
      "2026-07-19",
      "2026-08-30",
    ]);
    assert.equal(cadenceOf(gappy), "weekly");
    assert.equal(stalenessOf(gappy, at("2026-10-03"))?.days, 34);
  });

  it("is unknown for a single observation", () => {
    assert.equal(cadenceOf(weekly.slice(-1)), null);
  });
});

describe("overdue prices", () => {
  it("flags a weekly series after three weeks without a price", () => {
    assert.equal(stalenessOf(weekly, at("2026-09-20")), null);
    assert.deepEqual(stalenessOf(weekly, at("2026-10-03")), {
      cadence: "weekly",
      days: 34,
      allowedDays: 21,
    });
  });

  it("allows a monthly series its publication lag", () => {
    assert.equal(stalenessOf(monthly, at("2026-10-03")), null);
    assert.equal(stalenessOf(monthly, at("2026-10-19"))?.cadence, "monthly");
  });

  it("never flags a sample", () => {
    const sample = observations(
      weekly.map((o) => o.date),
      "illustrative",
    );
    assert.equal(stalenessOf(sample, at("2027-01-01")), null);
  });
});
