/**
 * Checks on the generated development histories: deterministic output,
 * the anchored latest value, and pinned earlier observations.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { generateHistory, type HistoryConfig } from "@/fixtures/markets/history";

const WEEKLY: HistoryConfig = {
  latestValue: 4.1,
  points: 80,
  stepDays: 7,
  volatility: 0.012,
  drift: 0.16,
  seasonality: 0.03,
  rangeSpread: 0.04,
};

describe("generated histories", () => {
  it("are the same on every call", () => {
    assert.deepEqual(
      generateHistory("TEST-SERIES", WEEKLY),
      generateHistory("TEST-SERIES", WEEKLY),
    );
  });

  it("end on the anchor", () => {
    const history = generateHistory("TEST-SERIES", WEEKLY);
    assert.equal(history.length, WEEKLY.points);
    assert.equal(history.at(-1)!.value, 4.1);
  });

  it("pass through the pinned previous and year-ago observations", () => {
    const history = generateHistory("TEST-SERIES", {
      ...WEEKLY,
      previousValue: 4.0,
      yearAgoValue: 3.8,
    });
    assert.equal(history.at(-1)!.value, 4.1);
    assert.equal(history.at(-2)!.value, 4.0);
    // 52 weekly steps: the observation the year-on-year change reads.
    const yearAgo = history.at(-53)!;
    assert.equal(yearAgo.value, 3.8);
    assert.equal(yearAgo.date, "2025-08-21");
    // Ranges follow the bent values.
    assert.equal(yearAgo.min, Math.round(3.8 * 0.96 * 100) / 100);
  });

  it("bend the walk only as far as the pins require", () => {
    const plain = generateHistory("TEST-SERIES", WEEKLY);
    const pinnedToItself = generateHistory("TEST-SERIES", {
      ...WEEKLY,
      previousValue: plain.at(-2)!.value,
    });
    // Pinning the previous observation to its own rounded value moves
    // nothing by more than that rounding: a cent at most.
    for (const [index, observation] of pinnedToItself.entries()) {
      assert.ok(
        Math.abs(observation.value - plain[index].value) <= 0.01 + 1e-9,
        `${index}`,
      );
    }
  });

  it("refuse a year-ago pin on a history shorter than a year", () => {
    assert.throws(() =>
      generateHistory("TEST-SERIES", { ...WEEKLY, points: 20, yearAgoValue: 3.8 }),
    );
  });
});
