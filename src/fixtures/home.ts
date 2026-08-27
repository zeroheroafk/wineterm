/**
 * ILLUSTRATIVE FIXTURE DATA for the homepage.
 *
 * Development-only sample records demonstrating the homepage sections.
 * Values are plausible orders of magnitude, not real observations, and
 * every record carries an illustrative or forecast status. No real or
 * invented companies, transactions or people appear. See
 * src/fixtures/README.md for the rules this file follows.
 */

import type {
  Article,
  HarvestRegion,
  IndustryDigest,
  MarketBriefing,
  PriceQuote,
  StripQuote,
  SupplySnapshot,
  TradeOverview,
} from "@/services/types";

const ILLUSTRATIVE_SOURCE = { name: "Regional market bulletin (sample)" };
const TRADE_SOURCE = { name: "Customs statistics (sample)" };

export const HOME_UPDATED_AT = "2026-08-21T09:30:00Z";

export const stripQuotes: StripQuote[] = [
  {
    id: "st-clm-red",
    name: "CLM bulk red",
    country: "ES",
    value: 4.1,
    unit: "EUR/hl",
    changePercent: 2.5,
    observedAt: "2026-08-20",
    status: "illustrative",
  },
  {
    id: "st-clm-white",
    name: "CLM bulk white",
    country: "ES",
    value: 3.85,
    unit: "EUR/hl",
    changePercent: -1.3,
    observedAt: "2026-08-20",
    status: "illustrative",
  },
  {
    id: "st-ale-red",
    name: "Alentejo bulk red",
    country: "PT",
    value: 5.4,
    unit: "EUR/hl",
    changePercent: 2.9,
    observedAt: "2026-08-20",
    status: "illustrative",
  },
  {
    id: "st-lan-red",
    name: "Languedoc bulk red",
    country: "FR",
    value: 7.8,
    unit: "EUR/hl",
    changePercent: 0.6,
    observedAt: "2026-08-18",
    status: "illustrative",
  },
  {
    id: "st-pug-red",
    name: "Puglia bulk red",
    country: "IT",
    value: 5.9,
    unit: "EUR/hl",
    changePercent: -1.7,
    observedAt: "2026-08-19",
    status: "illustrative",
  },
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

export const leadBriefing: MarketBriefing = {
  statusLabel: "Firm into the vintage",
  headline: "Old-vintage cover tightens as a short Iberian crop comes into view",
  summary:
    "Buyers moved earlier than usual this week to cover generic red positions ahead of the harvest, while first estimates for the new campaign point below the five-year average in Spain and Portugal. Whites remain comfortable for now.",
  observations: [
    {
      id: "ob-1",
      text: "Generic red firmed in Castilla-La Mancha on pre-harvest cover buying against thin availability.",
      direction: "up",
    },
    {
      id: "ob-2",
      text: "White availability stays comfortable; Lisboa whites eased on quiet export demand.",
      direction: "down",
    },
    {
      id: "ob-3",
      text: "First 2026/27 estimates point to a below-average Iberian crop after a dry summer.",
      direction: "down",
    },
    {
      id: "ob-4",
      text: "Bulk export volumes continue to run behind last season across the main origins.",
      direction: "down",
    },
  ],
  updatedAt: HOME_UPDATED_AT,
  status: "illustrative",
  outlookHref: "/insights/analysis",
};

/** Key bulk wine reference prices with weekly and year-on-year change. */
export const keyPrices: PriceQuote[] = [
  {
    id: "kp-es-clm-red",
    code: "ES-CLM-RED-GEN",
    market: "Castilla-La Mancha",
    country: "ES",
    colour: "red",
    product: "Generic red, 12 to 13 percent vol",
    price: 4.1,
    unit: "EUR/hl",
    change: 0.1,
    changePercent: 2.5,
    yoyPercent: 7.9,
    observedAt: "2026-08-20",
    status: "illustrative",
    source: ILLUSTRATIVE_SOURCE,
  },
  {
    id: "kp-es-clm-white",
    code: "ES-CLM-WHT-GEN",
    market: "Castilla-La Mancha",
    country: "ES",
    colour: "white",
    product: "Generic white, 11 to 12 percent vol",
    price: 3.85,
    unit: "EUR/hl",
    change: -0.05,
    changePercent: -1.3,
    yoyPercent: -3.8,
    observedAt: "2026-08-20",
    status: "illustrative",
    source: ILLUSTRATIVE_SOURCE,
  },
  {
    id: "kp-es-ext-red",
    code: "ES-EXT-RED-GEN",
    market: "Extremadura",
    country: "ES",
    colour: "red",
    product: "Generic red, 12 percent vol",
    price: 3.95,
    unit: "EUR/hl",
    change: 0,
    changePercent: 0,
    yoyPercent: 5.3,
    observedAt: "2026-08-19",
    status: "illustrative",
    source: ILLUSTRATIVE_SOURCE,
  },
  {
    id: "kp-pt-ale-red",
    code: "PT-ALE-RED-GEN",
    market: "Alentejo",
    country: "PT",
    colour: "red",
    product: "Generic red, 13 percent vol",
    price: 5.4,
    unit: "EUR/hl",
    change: 0.15,
    changePercent: 2.9,
    yoyPercent: 6.1,
    observedAt: "2026-08-20",
    status: "illustrative",
    source: ILLUSTRATIVE_SOURCE,
  },
  {
    id: "kp-pt-lis-white",
    code: "PT-LIS-WHT-GEN",
    market: "Lisboa",
    country: "PT",
    colour: "white",
    product: "Generic white, 11.5 percent vol",
    price: 4.6,
    unit: "EUR/hl",
    change: -0.2,
    changePercent: -4.2,
    yoyPercent: -2.4,
    observedAt: "2026-08-20",
    status: "illustrative",
    source: ILLUSTRATIVE_SOURCE,
  },
  {
    id: "kp-fr-lan-red",
    code: "FR-LAN-RED-GEN",
    market: "Languedoc",
    country: "FR",
    colour: "red",
    product: "Vin de France red, without GI",
    price: 7.8,
    unit: "EUR/hl",
    change: 0.05,
    changePercent: 0.6,
    yoyPercent: -1.2,
    observedAt: "2026-08-18",
    status: "illustrative",
    source: ILLUSTRATIVE_SOURCE,
  },
  {
    id: "kp-it-pug-red",
    code: "IT-PUG-RED-GEN",
    market: "Puglia",
    country: "IT",
    colour: "red",
    product: "Generic red, 12.5 percent vol",
    price: 5.9,
    unit: "EUR/hl",
    change: -0.1,
    changePercent: -1.7,
    yoyPercent: 2.8,
    observedAt: "2026-08-19",
    status: "illustrative",
    source: ILLUSTRATIVE_SOURCE,
  },
];

export const supplySnapshot: SupplySnapshot = {
  campaign: "2026/27 campaign, first estimates",
  rows: [
    {
      country: "ES",
      productionMhl: 34.5,
      openingStocksMhl: 30.2,
      availabilityMhl: 64.7,
      vsFiveYearPercent: -3.2,
    },
    {
      country: "PT",
      productionMhl: 6.9,
      openingStocksMhl: 7.4,
      availabilityMhl: 14.3,
      vsFiveYearPercent: 1.8,
    },
    {
      country: "FR",
      productionMhl: 42.0,
      openingStocksMhl: 37.5,
      availabilityMhl: 79.5,
      vsFiveYearPercent: -6.5,
    },
    {
      country: "IT",
      productionMhl: 47.3,
      openingStocksMhl: 38.9,
      availabilityMhl: 86.2,
      vsFiveYearPercent: 0.9,
    },
  ],
  note: "Availability is estimated production plus opening stocks. First estimates precede official harvest declarations and are revised through the autumn.",
  status: "forecast",
  source: { name: "National harvest estimates (sample)" },
  updatedAt: HOME_UPDATED_AT,
};

export const harvestRegions: HarvestRegion[] = [
  {
    id: "hv-clm",
    region: "Castilla-La Mancha",
    country: "ES",
    stage: "Early picking in whites",
    condition: "stressed",
    conditionNote: "Dry; heat stress in unirrigated plots",
    expected: "down",
    updatedAt: "2026-08-20",
  },
  {
    id: "hv-rioja",
    region: "Rioja",
    country: "ES",
    stage: "Veraison complete",
    condition: "good",
    conditionNote: "Healthy canopy, moderate temperatures",
    expected: "flat",
    updatedAt: "2026-08-19",
  },
  {
    id: "hv-alentejo",
    region: "Alentejo",
    country: "PT",
    stage: "Whites being picked",
    condition: "good",
    conditionNote: "Clean fruit, good acidity retention",
    expected: "up",
    updatedAt: "2026-08-20",
  },
  {
    id: "hv-douro",
    region: "Douro",
    country: "PT",
    stage: "Final ripening",
    condition: "mixed",
    conditionNote: "Sound, but rain needed in upper valley",
    expected: "down",
    updatedAt: "2026-08-18",
  },
  {
    id: "hv-languedoc",
    region: "Languedoc",
    country: "FR",
    stage: "Harvest starting in early zones",
    condition: "mixed",
    conditionNote: "Uneven ripening after summer heat spikes",
    expected: "down",
    updatedAt: "2026-08-19",
  },
  {
    id: "hv-puglia",
    region: "Puglia",
    country: "IT",
    stage: "Harvest under way",
    condition: "good",
    conditionNote: "Good sanitary state, average yields",
    expected: "up",
    updatedAt: "2026-08-20",
  },
  {
    id: "hv-veneto",
    region: "Veneto",
    country: "IT",
    stage: "Pre-harvest sampling",
    condition: "good",
    conditionNote: "Regular season, normal disease pressure",
    expected: "flat",
    updatedAt: "2026-08-17",
  },
];

export const tradeOverview: TradeOverview = {
  period: "12 months to Jun 2026",
  exporters: [
    { rank: 1, country: "ES", volumeMhl: 21.0, yoyPercent: -2.1 },
    { rank: 2, country: "IT", volumeMhl: 17.4, yoyPercent: 1.2 },
    { rank: 3, country: "FR", volumeMhl: 12.6, yoyPercent: -4.0 },
    { rank: 4, country: "PT", volumeMhl: 3.2, yoyPercent: 3.5 },
  ],
  importers: [
    { rank: 1, country: "DE", volumeMhl: 12.9, yoyPercent: -1.5 },
    { rank: 2, country: "GB", volumeMhl: 10.5, yoyPercent: 0.8 },
    { rank: 3, country: "US", volumeMhl: 8.7, yoyPercent: -3.9 },
    { rank: 4, country: "NL", volumeMhl: 4.4, yoyPercent: 2.2 },
    { rank: 5, country: "BE", volumeMhl: 3.0, yoyPercent: -0.6 },
  ],
  split: [
    { label: "Bulk", sharePercent: 38 },
    { label: "Bottled", sharePercent: 54 },
    { label: "Sparkling", sharePercent: 8 },
  ],
  status: "illustrative",
  source: TRADE_SOURCE,
  updatedAt: HOME_UPDATED_AT,
};

/** Homepage editorial: one lead analysis and secondary stories. */
export const homeLeadAnalysis: Article = {
  id: "ha-lead",
  kind: "analysis",
  section: "Analysis",
  headline: "What a short Iberian crop would mean for generic red prices",
  standfirst:
    "Illustrative analysis preview. A below-average vintage against thin opening stocks would leave the generic red market unusually exposed to early-campaign demand.",
  publishedAt: "2026-08-21T07:00:00Z",
  readingMinutes: 6,
  href: "/insights/analysis",
};

export const homeSecondaryAnalysis: Article[] = [
  {
    id: "ha-2",
    kind: "analysis",
    section: "Trade",
    headline: "Bulk shipments keep sliding while bottled trade holds its value",
    standfirst:
      "Illustrative analysis preview on the widening gap between bulk volumes and bottled values across the main export markets.",
    publishedAt: "2026-08-19T07:00:00Z",
    readingMinutes: 5,
    href: "/insights/analysis",
  },
  {
    id: "ha-3",
    kind: "analysis",
    section: "Crop & Supply",
    headline: "Reading the first harvest estimates, and how far to trust them",
    standfirst:
      "Illustrative analysis preview on how early estimates are built and how much they typically move before final declarations.",
    publishedAt: "2026-08-18T07:00:00Z",
    readingMinutes: 4,
    href: "/insights/analysis",
  },
];

export const industryDigest: IndustryDigest = {
  news: [
    {
      id: "in-1",
      headline: "Glass and dry goods costs stabilise after two volatile years",
      publishedAt: "2026-08-20T10:00:00Z",
      href: "/industry/packaging-logistics",
    },
    {
      id: "in-2",
      headline: "Flexitank availability improves on the main Atlantic routes",
      publishedAt: "2026-08-19T09:00:00Z",
      href: "/industry/packaging-logistics",
    },
    {
      id: "in-3",
      headline: "Vineyard labour costs keep rising across southern Europe",
      publishedAt: "2026-08-18T08:00:00Z",
      href: "/industry",
    },
  ],
  deals: [
    {
      id: "id-1",
      headline: "Cooperative consolidation continues across central Spain",
      publishedAt: "2026-08-20T12:00:00Z",
      href: "/industry/deals",
    },
    {
      id: "id-2",
      headline: "Bottling capacity investment shifts closer to export ports",
      publishedAt: "2026-08-17T11:00:00Z",
      href: "/industry/deals",
    },
  ],
  regulation: [
    {
      id: "ir-1",
      headline: "EU committee weighs crisis distillation criteria for 2026/27",
      publishedAt: "2026-08-20T14:00:00Z",
      href: "/industry/regulation",
    },
    {
      id: "ir-2",
      headline: "Vineyard planting authorisations under review in two regions",
      publishedAt: "2026-08-16T09:00:00Z",
      href: "/industry/regulation",
    },
  ],
};
