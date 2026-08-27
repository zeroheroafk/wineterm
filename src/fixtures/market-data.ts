/**
 * ILLUSTRATIVE FIXTURE DATA.
 *
 * Sample records used only to demonstrate components. Values are
 * plausible in shape but are not real market observations. See
 * src/fixtures/README.md for the rules this file follows.
 */

import type {
  MarketCommentary,
  PriceQuote,
  PriceSeries,
} from "@/services/types";

const ILLUSTRATIVE_SOURCE = { name: "Regional market bulletin (sample)" };

export const FIXTURE_UPDATED_AT = "2026-08-21T09:30:00Z";

export const bulkWineQuotes: PriceQuote[] = [
  {
    id: "q-es-clm-red-gen",
    code: "ES-CLM-RED-GEN",
    market: "Castilla-La Mancha",
    country: "ES",
    colour: "red",
    product: "Generic red, 12 to 13 percent vol",
    price: 4.1,
    unit: "EUR/hl",
    change: 0.1,
    changePercent: 2.5,
    observedAt: "2026-08-20",
    status: "illustrative",
    source: ILLUSTRATIVE_SOURCE,
  },
  {
    id: "q-es-clm-white-gen",
    code: "ES-CLM-WHT-GEN",
    market: "Castilla-La Mancha",
    country: "ES",
    colour: "white",
    product: "Generic white, 11 to 12 percent vol",
    price: 3.85,
    unit: "EUR/hl",
    change: -0.05,
    changePercent: -1.3,
    observedAt: "2026-08-20",
    status: "illustrative",
    source: ILLUSTRATIVE_SOURCE,
  },
  {
    id: "q-es-ext-red-gen",
    code: "ES-EXT-RED-GEN",
    market: "Extremadura",
    country: "ES",
    colour: "red",
    product: "Generic red, 12 percent vol",
    price: 3.95,
    unit: "EUR/hl",
    change: 0,
    changePercent: 0,
    observedAt: "2026-08-19",
    status: "illustrative",
    source: ILLUSTRATIVE_SOURCE,
  },
  {
    id: "q-pt-ale-red-gen",
    code: "PT-ALE-RED-GEN",
    market: "Alentejo",
    country: "PT",
    colour: "red",
    product: "Generic red, 13 percent vol",
    price: 5.4,
    unit: "EUR/hl",
    change: 0.15,
    changePercent: 2.9,
    observedAt: "2026-08-20",
    status: "illustrative",
    source: ILLUSTRATIVE_SOURCE,
  },
  {
    id: "q-pt-lis-white-gen",
    code: "PT-LIS-WHT-GEN",
    market: "Lisboa",
    country: "PT",
    colour: "white",
    product: "Generic white, 11.5 percent vol",
    price: 4.6,
    unit: "EUR/hl",
    change: -0.2,
    changePercent: -4.2,
    observedAt: "2026-08-20",
    status: "illustrative",
    source: ILLUSTRATIVE_SOURCE,
  },
  {
    id: "q-fr-lan-red-gen",
    code: "FR-LAN-RED-GEN",
    market: "Languedoc",
    country: "FR",
    colour: "red",
    product: "Vin de France red, without GI",
    price: 7.8,
    unit: "EUR/hl",
    change: 0.05,
    changePercent: 0.6,
    observedAt: "2026-08-18",
    status: "illustrative",
    source: ILLUSTRATIVE_SOURCE,
  },
  {
    id: "q-it-pug-red-gen",
    code: "IT-PUG-RED-GEN",
    market: "Puglia",
    country: "IT",
    colour: "red",
    product: "Generic red, 12.5 percent vol",
    price: 5.9,
    unit: "EUR/hl",
    change: -0.1,
    changePercent: -1.7,
    observedAt: "2026-08-19",
    status: "illustrative",
    source: ILLUSTRATIVE_SOURCE,
  },
];

export const sampleSeries: PriceSeries = {
  id: "s-es-clm-red-gen",
  code: "ES-CLM-RED-GEN",
  name: "Castilla-La Mancha generic red",
  unit: "EUR/hl",
  country: "ES",
  status: "illustrative",
  source: ILLUSTRATIVE_SOURCE,
  updatedAt: FIXTURE_UPDATED_AT,
  points: [
    { date: "2026-05-01", value: 3.7 },
    { date: "2026-05-15", value: 3.75 },
    { date: "2026-05-29", value: 3.72 },
    { date: "2026-06-12", value: 3.8 },
    { date: "2026-06-26", value: 3.9 },
    { date: "2026-07-10", value: 3.88 },
    { date: "2026-07-24", value: 3.95 },
    { date: "2026-08-07", value: 4.0 },
    { date: "2026-08-20", value: 4.1 },
  ],
};

export const sampleCommentary: MarketCommentary = {
  id: "c-sample-bulk",
  market: "Bulk market (sample)",
  body: "Sample commentary text used to demonstrate the commentary component. In production this block carries a short dated note from the market desk explaining the week's movement in one paragraph.",
  author: "WineTerm Market Desk",
  publishedAt: "2026-08-21T08:00:00Z",
};
