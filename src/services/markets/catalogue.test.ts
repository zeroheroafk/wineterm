/**
 * Checks on how the illustrative samples give way to real series: a
 * sample leaves the live catalogue once its own code or a real series
 * covering it is imported, and only for series of its own country.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { seriesFixtures } from "@/fixtures/markets/series";
import { getHomeService } from "@/services/home";
import {
  getIllustrativeMarketsService,
  getMarketsService,
  mergeCatalogues,
  type CatalogueEntry,
} from "@/services/markets/service";
import type { MarketSeries } from "@/services/markets/types";

function entry(code: string, givesWayTo?: string[]): CatalogueEntry {
  return {
    series: { code } as MarketSeries,
    history: [],
    givesWayTo,
  };
}

const codes = (entries: CatalogueEntry[]) => entries.map((e) => e.series.code);

describe("samples beside real series", () => {
  it("give way to their own code and to the series they name", () => {
    const imported = [entry("PT-BULK-IMP"), entry("ES-NAT-RED-NGI")];
    const samples = [
      entry("ES-NAT-RED-NGI"),
      entry("PT-ALE-RED-GEN", ["PT-BULK-EXP", "PT-BULK-IMP"]),
      entry("FR-LAN-RED-NGI", ["FR-BULK-EXP", "FR-BULK-IMP"]),
      entry("ES-CLM-RED-GEN"),
    ];
    assert.deepEqual(codes(mergeCatalogues(imported, samples)), [
      "PT-BULK-IMP",
      "ES-NAT-RED-NGI",
      "FR-LAN-RED-NGI",
      "ES-CLM-RED-GEN",
    ]);
  });

  it("all stay when nothing is imported", () => {
    const samples = [entry("PT-ALE-RED-GEN", ["PT-BULK-EXP"]), entry("ES-CLM-RED-GEN")];
    assert.deepEqual(codes(mergeCatalogues([], samples)), codes(samples));
  });

  it("give way only to series of their own country", () => {
    const named = seriesFixtures.filter((fixture) => fixture.givesWayTo);
    assert.ok(named.length > 0);
    for (const { series, givesWayTo } of named) {
      for (const code of givesWayTo!) {
        assert.ok(code.startsWith(`${series.country}-`), `${series.code} > ${code}`);
        assert.ok(
          !seriesFixtures.some((fixture) => fixture.series.code === code),
          `${series.code} gives way to the sample ${code}`,
        );
      }
    }
  });

  it("stay whole in the catalogue sample publications read", async () => {
    const samples = await getIllustrativeMarketsService().listSeries();
    assert.deepEqual(
      samples.map((series) => series.code),
      seriesFixtures.map((fixture) => fixture.series.code),
    );
  });

  it("fill the live catalogue offline, with no estimates on the homepage", async () => {
    // Without Supabase configured nothing is imported, so no sample gives way.
    const live = await getMarketsService().listSeries();
    assert.equal(live.length, seriesFixtures.length);
    const estimates = await getHomeService().getPriceEstimates();
    assert.deepEqual(estimates, { quotes: [], updatedAt: null });
  });
});
