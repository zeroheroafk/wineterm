/**
 * Checks on prices recorded per hectolitre-degree and shown in EUR/hl:
 * the conversion itself and how each strength is described.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { describeDegreeBasis, perHectolitre } from "@/services/types";

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
