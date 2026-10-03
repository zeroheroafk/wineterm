/**
 * The Weekly Briefing is written from the series: an edition reads each
 * series as it stood on its Friday, counts the regional markets quoted
 * that week, and lists the monthly prices published in the week. Its
 * headline and summary repeat those figures. Samples never make an
 * edition.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildBriefing,
  buildEditions,
  editionDates,
  fridayOnOrBefore,
} from "@/services/briefing/service";
import type { CatalogueEntry } from "@/services/markets/service";
import type { MarketSeries, SeriesObservation } from "@/services/markets/types";
import type { DataStatus } from "@/services/types";

function series(partial: Partial<MarketSeries> & { code: string }): MarketSeries {
  return {
    kind: "bulk-wine",
    name: partial.code,
    country: "ES",
    region: "Castilla-La Mancha",
    product: "Wine",
    unit: "EUR/hl",
    currency: "EUR",
    campaign: "2026/27",
    sourceId: "mapa-isc",
    sourceType: "official",
    verification: "verified",
    methodology: "",
    ...partial,
  };
}

function history(
  points: [string, number][],
  status: DataStatus = "final",
  publishedDaysAfter = 4,
): SeriesObservation[] {
  return points.map(([date, value]) => {
    const published = new Date(Date.parse(`${date}T00:00:00Z`) + publishedDaysAfter * 86400000);
    return {
      date,
      value,
      status,
      publishedAt: published.toISOString(),
      updatedAt: published.toISOString(),
      revised: false,
    };
  });
}

const weeks = ["2026-08-30", "2026-09-06", "2026-09-13", "2026-09-20"];
const weekly = (values: number[]) =>
  history(weeks.map((date, index) => [date, values[index]]));

const entries: CatalogueEntry[] = [
  {
    series: series({
      code: "ES-NAT-RED-NGI",
      region: "National average",
      colour: "red",
      sourceId: "mapa-pmn",
    }),
    history: weekly([47, 47.5, 47.86, 49.48]),
  },
  {
    series: series({
      code: "ES-NAT-WHT-NGI",
      region: "National average",
      colour: "white",
      sourceId: "mapa-pmn",
    }),
    history: weekly([42, 42.2, 42.45, 44.12]),
  },
  {
    series: series({ code: "ES-ALB-RED-NGI", appellation: "Albacete", colour: "red" }),
    history: weekly([48, 48, 48, 50]),
  },
  {
    series: series({ code: "ES-TOL-RED-NGI", appellation: "Toledo", colour: "red" }),
    history: weekly([49, 49, 49.5, 49]),
  },
  {
    series: series({ code: "ES-CUE-WHT-NGI", appellation: "Cuenca", colour: "white" }),
    history: weekly([40, 40, 40, 40]),
  },
  {
    // Not quoted since 30 August.
    series: series({ code: "ES-BAD-RED-NGI", appellation: "Badajoz", colour: "red" }),
    history: history([
      ["2026-08-09", 56],
      ["2026-08-16", 56],
      ["2026-08-23", 56.5],
      ["2026-08-30", 56.55],
    ]),
  },
  {
    // Monthly, July published on 1 October.
    series: series({
      code: "FR-LR-RED-NGI",
      country: "FR",
      region: "Occitanie",
      appellation: "Languedoc-Roussillon",
      colour: "red",
      classification: "no-gi",
      sourceId: "draaf-occitanie",
    }),
    history: [
      ...history(
        [
          ["2026-03-31", 70],
          ["2026-04-30", 70.5],
          ["2026-05-31", 71],
          ["2026-06-30", 71.2],
        ],
        "final",
        40,
      ),
      {
        date: "2026-07-31",
        value: 71.8,
        status: "final",
        publishedAt: "2026-10-01T06:43:00Z",
        updatedAt: "2026-10-01T06:43:00Z",
        revised: false,
      },
    ],
  },
  {
    series: series({ code: "ES-CLM-RED-GEN", sourceId: "sample-official-bulletin-es" }),
    history: weekly([40, 41, 42, 43]).map((obs) => ({ ...obs, status: "illustrative" })),
  },
];

describe("edition dates", () => {
  it("fall on Fridays", () => {
    assert.equal(fridayOnOrBefore("2026-10-03"), "2026-10-02");
    assert.equal(fridayOnOrBefore("2026-10-02"), "2026-10-02");
    assert.equal(fridayOnOrBefore("2026-10-01"), "2026-09-25");
    assert.deepEqual(editionDates("2026-10-02", 3), [
      "2026-10-02",
      "2026-09-25",
      "2026-09-18",
    ]);
  });
});

describe("an edition", () => {
  const edition = buildBriefing(entries, "2026-09-25")!;

  it("reads the national averages as they stood that Friday", () => {
    assert.deepEqual(
      edition.national.map((p) => [p.name, p.value, Math.round(p.changePercent! * 10) / 10]),
      [
        ["Spain white", 44.12, 3.9],
        ["Spain red", 49.48, 3.4],
      ],
    );
    assert.equal(edition.weekEnding, "2026-09-20");
  });

  it("counts the regional markets quoted this week and the movers", () => {
    assert.equal(edition.regional.quoted, 3);
    assert.equal(edition.regional.unquoted, 1);
    assert.equal(edition.regional.rose, 1);
    assert.equal(edition.regional.fell, 1);
    assert.equal(edition.regional.unchanged, 1);
    assert.equal(edition.regional.risers[0].name, "Albacete red");
    assert.equal(edition.regional.fallers[0].name, "Toledo red");
  });

  it("lists monthly prices only in the week they were published", () => {
    assert.equal(edition.monthly.length, 0);
    const later = buildBriefing(entries, "2026-10-02")!;
    assert.deepEqual(
      later.monthly.map((p) => [p.name, p.value, p.period]),
      [["Languedoc-Roussillon red without GI", 71.8, "July 2026"]],
    );
  });

  it("writes its headline and summary from the figures", () => {
    assert.equal(
      edition.headline,
      "Spanish bulk prices firm: white +3.9%, red +3.4%",
    );
    assert.match(edition.summary, /^White wine without PDO\/PGI averaged 44\.12 EUR\/hl ex-winery in Spain in the week to 20 September, \+3\.9% on the week; red 49\.48 EUR\/hl, \+3\.4% on the week\./);
    assert.match(edition.summary, /Of the 4 regional markets, 3 were quoted: 1 rose, 1 fell, 1 was unchanged\. Albacete red led the rises at \+4\.2%; Toledo red fell most, −1\.0%\./);
  });

  it("names every source once", () => {
    assert.deepEqual(
      edition.sources.map((s) => s.name),
      ["MAPA, Precios Medios Nacionales", "MAPA, Informe Semanal de Coyuntura"],
    );
  });

  it("ignores samples and has nothing to say before the first price", () => {
    const samples = entries.filter((e) => e.series.sourceId.startsWith("sample"));
    assert.equal(buildBriefing(samples, "2026-09-25"), null);
    assert.equal(buildBriefing(entries, "2026-01-02"), null);
  });
});

describe("the archive", () => {
  it("runs back from the latest Friday, the first edition current", () => {
    const editions = buildEditions(entries, "2026-10-03", 4);
    assert.deepEqual(
      editions.map((e) => e.date),
      ["2026-10-02", "2026-09-25", "2026-09-18", "2026-09-11"],
    );
    assert.deepEqual(
      editions.map((e) => e.isCurrent),
      [true, false, false, false],
    );
    // The week to 27 September had no new weekly price in these series,
    // so the 2 October edition carries the week before and the new month.
    assert.equal(editions[0].weekEnding, "2026-09-20");
    assert.equal(editions[0].monthly.length, 1);
  });
});
