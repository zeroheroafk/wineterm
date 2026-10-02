/**
 * Checks on how the illustrative samples give way to real series: a
 * sample leaves the live catalogue once its own code or a real series
 * covering it is imported, and only for series of its own country.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { seriesFixtures } from "@/fixtures/markets/series";
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
    const imported = [entry("PT-NAT-BULK"), entry("ES-NAT-RED-NGI")];
    const samples = [
      entry("ES-NAT-RED-NGI"),
      entry("PT-ALE-RED-GEN", ["PT-NAT-BULK"]),
      entry("FR-LAN-RED-NGI", ["FR-NAT-BULK"]),
      entry("ES-CLM-RED-GEN"),
    ];
    assert.deepEqual(codes(mergeCatalogues(imported, samples)), [
      "PT-NAT-BULK",
      "ES-NAT-RED-NGI",
      "FR-LAN-RED-NGI",
      "ES-CLM-RED-GEN",
    ]);
  });

  it("all stay when nothing is imported", () => {
    const samples = [entry("PT-ALE-RED-GEN", ["PT-NAT-BULK"]), entry("ES-CLM-RED-GEN")];
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

  it("fill the live catalogue offline", async () => {
    // Without Supabase configured nothing is imported, so no sample gives way.
    const live = await getMarketsService().listSeries();
    assert.equal(live.length, seriesFixtures.length);
  });
});
