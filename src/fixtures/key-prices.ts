/**
 * ILLUSTRATIVE FIXTURE DATA for the key bulk wine prices.
 *
 * The sample series shown beside the real national prices at the head of
 * the Markets overview, and alone in the sample Market Outlook. Their
 * figures are read from the markets catalogue (src/fixtures/markets/series.ts),
 * as the real prices are. See src/fixtures/README.md.
 */

import type { DataSource } from "@/services/types";

/**
 * Where the key prices cite the sample bulk prices. They are recorded per
 * hectolitre-degree, the usual basis of bulk quotations, and shown in
 * EUR/hl so that they read in the unit of the official prices beside
 * them; the note travels with every citation of the source.
 */
export const ILLUSTRATIVE_PRICE_SOURCE: DataSource = {
  name: "Regional market bulletin (sample)",
  note: "The sample prices are recorded per hectolitre-degree and shown in EUR/hl at each wine's strength: as stated, the midpoint of a stated range, or an assumed 12% vol where none is stated.",
};

/** When the sample key prices were last updated. */
export const SAMPLE_PRICES_UPDATED_AT = "2026-08-21T09:30:00Z";

/** The sample series shown as key bulk wine prices, in table order. */
export const keyPriceCodes: string[] = [
  "ES-CLM-RED-GEN",
  "ES-CLM-WHT-GEN",
  "ES-EXT-RED-GEN",
  "PT-ALE-RED-GEN",
  "PT-LIS-WHT-GEN",
  "FR-LAN-RED-NGI",
  "IT-PUG-RED-GEN",
];
