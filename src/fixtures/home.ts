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
  Article,
  DataSource,
  HarvestRegion,
  IndustryDigest,
  MarketBriefing,
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

export const leadBriefing: MarketBriefing = {
  headline: "Old-vintage cover tightens as a short Iberian crop comes into view",
  summary:
    "Buyers moved earlier than usual this week to cover generic red positions ahead of the harvest, while first estimates for the new campaign point below the five-year average in Spain and Portugal.",
  development:
    "White availability stays comfortable for now; Lisboa whites eased on quiet export demand.",
  updatedAt: HOME_UPDATED_AT,
  status: "illustrative",
  outlookHref: "/outlook",
};

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
    status: "illustrative",
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
    status: "illustrative",
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
    status: "illustrative",
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
    status: "illustrative",
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
    status: "illustrative",
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
    status: "illustrative",
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
    status: "illustrative",
  },
];

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
