/**
 * ILLUSTRATIVE FIXTURE DATA for the homepage.
 *
 * Development-only sample records demonstrating the homepage sections.
 * Values are plausible orders of magnitude, not real observations, and
 * every record carries the illustrative status. No real or
 * invented companies, transactions or people appear. See
 * src/fixtures/README.md for the rules this file follows.
 */

import type {
  DataSource,
  HarvestCondition,
  StripQuote,
} from "@/services/types";

/**
 * Where the homepage cites the sample bulk prices. They are recorded per
 * hectolitre-degree, the usual basis of bulk quotations, and shown in
 * EUR/hl so that they read in the unit of the official prices beside
 * them; the note travels with every citation of the source.
 */
export const ILLUSTRATIVE_PRICE_SOURCE: DataSource = {
  name: "Regional market bulletin (sample)",
  note: "The sample prices are recorded per hectolitre-degree and shown in EUR/hl at each wine's strength: as stated, the midpoint of a stated range, or an assumed 12% vol where none is stated.",
};

export const HOME_UPDATED_AT = "2026-08-21T09:30:00Z";

/**
 * Key prices repeated in the market strip, in strip order, with their
 * short strip names. The strip reads value, unit, change, date and status
 * from the key prices, so the two displays cannot disagree.
 */
export const stripPriceCodes: { code: string; name: string }[] = [
  { code: "ES-CLM-RED-GEN", name: "CLM bulk red" },
  { code: "ES-CLM-WHT-GEN", name: "CLM bulk white" },
  { code: "PT-ALE-RED-GEN", name: "Alentejo bulk red" },
  { code: "FR-LAN-RED-NGI", name: "Languedoc bulk red" },
  { code: "IT-PUG-RED-GEN", name: "Puglia bulk red" },
];

/** Strip quotes for markets outside the key prices table. */
export const stripOtherQuotes: StripQuote[] = [
  {
    id: "st-clm-grape",
    name: "CLM white grapes",
    country: "ES",
    value: 0.28,
    unit: "EUR/kg",
    changePercent: 0,
    observedAt: "2026-08-17",
    status: "illustrative",
  },
  {
    id: "st-must",
    name: "Rectified must",
    country: "ES",
    value: 1.02,
    unit: "EUR/kg",
    changePercent: 1.1,
    observedAt: "2026-08-14",
    status: "illustrative",
  },
];

/**
 * The sample series shown as key bulk wine prices, in table order. Their
 * figures are read from the markets catalogue (src/fixtures/markets/series.ts),
 * as the real prices are, so the homepage and the Markets pages agree.
 */
export const keyPriceCodes: string[] = [
  "ES-CLM-RED-GEN",
  "ES-CLM-WHT-GEN",
  "ES-EXT-RED-GEN",
  "PT-ALE-RED-GEN",
  "PT-LIS-WHT-GEN",
  "FR-LAN-RED-NGI",
  "IT-PUG-RED-GEN",
];

/**
 * The desk's reading of the supply snapshot. The figures themselves come
 * from the supply balances (src/fixtures/supply.ts) through the supply
 * service; this sentence must be revised whenever they change.
 */
export const supplySnapshotText = {
  takeaway:
    "Spain and Italy start 2026/27 with more wine available than a year earlier; France has less, and Portugal about the same.",
  note: "Availability is opening stocks plus production plus imports, each as stated in the country's supply balance. First estimates are revised through the autumn.",
};

/**
 * The harvest monitor: one representative region per producer country,
 * by its report on the Harvest page (src/fixtures/harvest.ts), with the
 * desk's rating of the vineyard's condition. Stage, field note,
 * expected crop and date are read from the report, so the two pages
 * cannot disagree.
 */
export const harvestMonitorRegions: {
  reportId: string;
  condition: HarvestCondition;
}[] = [
  { reportId: "hr-clm", condition: "stressed" },
  { reportId: "hr-ale", condition: "good" },
  { reportId: "hr-lan", condition: "mixed" },
  { reportId: "hr-pug", condition: "good" },
];
