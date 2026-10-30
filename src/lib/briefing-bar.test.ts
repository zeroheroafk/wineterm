/**
 * Checks on where the briefing bar shows and how long a closed bar stays
 * away.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  DISMISS_DAYS,
  barHiddenOn,
  dismissedRecently,
} from "@/lib/briefing-bar";

const DAY_MS = 86_400_000;

describe("barHiddenOn", () => {
  it("shows on the homepage, the sections and the reading pages", () => {
    for (const path of [
      "/",
      "/markets",
      "/markets/bulk-wine",
      "/insights",
      "/insights/weekly-briefing",
      "/insights/analysis/some-article",
      "/trade",
    ]) {
      assert.equal(barHiddenOn(path), false, path);
    }
  });

  it("stays off the briefing page, which is itself the signup", () => {
    assert.equal(barHiddenOn("/briefing"), true);
    assert.equal(barHiddenOn("/briefing/anything"), true);
    assert.equal(barHiddenOn("/briefings"), false);
  });
});

describe("dismissedRecently", () => {
  const now = Date.UTC(2026, 9, 30);

  it("keeps a closed bar away for DISMISS_DAYS, then lets it ask again", () => {
    assert.equal(dismissedRecently(String(now - DAY_MS), now), true);
    assert.equal(
      dismissedRecently(String(now - (DISMISS_DAYS * DAY_MS - 1)), now),
      true,
    );
    assert.equal(
      dismissedRecently(String(now - DISMISS_DAYS * DAY_MS), now),
      false,
    );
  });

  it("treats a missing or unreadable value as never closed", () => {
    assert.equal(dismissedRecently(null, now), false);
    assert.equal(dismissedRecently("", now), false);
    assert.equal(dismissedRecently("yes", now), false);
  });
});
