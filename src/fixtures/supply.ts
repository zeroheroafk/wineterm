/**
 * ILLUSTRATIVE FIXTURE DATA: supply balances, production and stocks.
 *
 * Development stand-ins with plausible magnitudes, marked by status and
 * sample sources. Values agree with the homepage supply snapshot where
 * they overlap. Nothing here is a real declaration. See
 * src/fixtures/README.md.
 */

import type {
  Campaign,
  ProductionRecord,
  StockRecord,
  SupplyBalance,
} from "@/services/supply/types";
import type { ProducerCountry } from "@/services/types";

export const SUPPLY_UPDATED_AT = "2026-08-21T09:30:00Z";

export const campaigns: Campaign[] = [
  { code: "2021/22", startYear: 2021, isEstimate: false },
  { code: "2022/23", startYear: 2022, isEstimate: false },
  { code: "2023/24", startYear: 2023, isEstimate: false },
  { code: "2024/25", startYear: 2024, isEstimate: false },
  { code: "2025/26", startYear: 2025, isEstimate: false },
  { code: "2026/27", startYear: 2026, isEstimate: true },
];

export const CURRENT_CAMPAIGN = "2026/27";
export const PREVIOUS_CAMPAIGN = "2025/26";

const b = (
  campaign: string,
  country: ProducerCountry,
  openingStocksMhl: number,
  productionMhl: number,
  importsMhl: number,
  domesticUseMhl: number,
  exportsMhl: number,
  vineyardKha: number,
  status: SupplyBalance["status"],
): SupplyBalance => ({
  campaign,
  country,
  openingStocksMhl,
  productionMhl,
  importsMhl,
  domesticUseMhl,
  exportsMhl,
  vineyardKha,
  status,
  sourceId: "sample-supply-stats",
  updatedAt: SUPPLY_UPDATED_AT,
});

/**
 * Domestic use includes industrial uses, distillation and losses, which
 * is one reason the balance identity does not close exactly against the
 * next campaign's declared opening stocks.
 */
export const supplyBalances: SupplyBalance[] = [
  // 2024/25, final
  b("2024/25", "ES", 31.4, 31.2, 0.6, 12.9, 20.6, 935, "final"),
  b("2024/25", "PT", 7.7, 6.9, 1.3, 5.4, 3.0, 191, "final"),
  b("2024/25", "FR", 41.0, 36.1, 0.9, 27.0, 12.5, 755, "final"),
  b("2024/25", "IT", 40.0, 41.1, 0.4, 25.2, 17.0, 672, "final"),
  // 2025/26, provisional
  b("2025/26", "ES", 28.9, 32.0, 0.7, 12.0, 20.9, 932, "provisional"),
  b("2025/26", "PT", 7.5, 7.0, 1.4, 5.6, 3.1, 190, "provisional"),
  b("2025/26", "FR", 38.6, 44.0, 0.8, 30.6, 13.0, 752, "provisional"),
  b("2025/26", "IT", 39.5, 44.0, 0.3, 26.0, 17.3, 671, "provisional"),
  // 2026/27, first estimates
  b("2026/27", "ES", 30.2, 34.5, 0.8, 12.1, 21.0, 930, "forecast"),
  b("2026/27", "PT", 7.4, 6.9, 1.5, 5.5, 3.0, 190, "forecast"),
  b("2026/27", "FR", 37.5, 42.0, 0.7, 30.0, 12.8, 750, "forecast"),
  b("2026/27", "IT", 38.9, 47.3, 0.3, 25.6, 17.5, 670, "forecast"),
];

const p = (
  campaign: string,
  country: ProducerCountry,
  colour: ProductionRecord["colour"],
  volumeMhl: number,
  status: ProductionRecord["status"],
): ProductionRecord => ({
  campaign,
  country,
  colour,
  volumeMhl,
  status,
  sourceId: "sample-supply-stats",
});

export const productionRecords: ProductionRecord[] = [
  // Totals per campaign
  p("2021/22", "ES", "total", 35.5, "final"),
  p("2021/22", "PT", "total", 7.3, "final"),
  p("2021/22", "FR", "total", 37.8, "final"),
  p("2021/22", "IT", "total", 50.2, "final"),
  p("2022/23", "ES", "total", 35.7, "final"),
  p("2022/23", "PT", "total", 6.8, "final"),
  p("2022/23", "FR", "total", 45.6, "final"),
  p("2022/23", "IT", "total", 49.8, "final"),
  p("2023/24", "ES", "total", 28.3, "final"),
  p("2023/24", "PT", "total", 7.4, "final"),
  p("2023/24", "FR", "total", 47.9, "final"),
  p("2023/24", "IT", "total", 38.3, "final"),
  p("2024/25", "ES", "total", 31.2, "final"),
  p("2024/25", "PT", "total", 6.9, "final"),
  p("2024/25", "FR", "total", 36.1, "final"),
  p("2024/25", "IT", "total", 41.1, "final"),
  p("2025/26", "ES", "total", 32.0, "provisional"),
  p("2025/26", "PT", "total", 7.0, "provisional"),
  p("2025/26", "FR", "total", 44.0, "provisional"),
  p("2025/26", "IT", "total", 44.0, "provisional"),
  p("2026/27", "ES", "total", 34.5, "forecast"),
  p("2026/27", "PT", "total", 6.9, "forecast"),
  p("2026/27", "FR", "total", 42.0, "forecast"),
  p("2026/27", "IT", "total", 47.3, "forecast"),
  // Colour breakdown, current campaign estimates
  p("2026/27", "ES", "red-rose", 13.6, "forecast"),
  p("2026/27", "ES", "white", 20.9, "forecast"),
  p("2026/27", "PT", "red-rose", 4.3, "forecast"),
  p("2026/27", "PT", "white", 2.6, "forecast"),
  p("2026/27", "FR", "red-rose", 18.5, "forecast"),
  p("2026/27", "FR", "white", 23.5, "forecast"),
  p("2026/27", "IT", "red-rose", 21.3, "forecast"),
  p("2026/27", "IT", "white", 26.0, "forecast"),
];

export const stockRecords: StockRecord[] = [
  {
    country: "ES",
    referenceDate: "2026-07-31",
    stocksMhl: 30.2,
    yearEarlierMhl: 28.9,
    status: "provisional",
    sourceId: "sample-supply-stats",
    methodology:
      "Monthly operator declarations covering wineries and storage holders, published about three weeks after the reference date.",
  },
  {
    country: "PT",
    referenceDate: "2026-07-31",
    stocksMhl: 7.4,
    yearEarlierMhl: 7.5,
    status: "provisional",
    sourceId: "sample-supply-stats",
    methodology:
      "End-of-campaign declarations by all holders, provisional until the campaign closure is validated in the autumn.",
  },
  {
    country: "FR",
    referenceDate: "2026-07-31",
    stocksMhl: 37.5,
    yearEarlierMhl: 38.6,
    status: "provisional",
    sourceId: "sample-supply-stats",
    methodology:
      "Annual stock declaration at 31 July: one yearly reference point, not a monthly series, so intra-campaign comparisons are not available.",
  },
  {
    country: "IT",
    referenceDate: "2026-06-30",
    stocksMhl: 41.2,
    yearEarlierMhl: 41.8,
    status: "final",
    sourceId: "sample-supply-stats",
    methodology:
      "Monthly extract of the electronic wine registry; the latest available month runs one month behind the other countries.",
  },
];

/** Opening stocks at 1 August by campaign, Mhl, for the history chart. */
export const openingStocksHistory: Record<
  ProducerCountry,
  { campaign: string; stocksMhl: number }[]
> = {
  ES: [
    { campaign: "2022/23", stocksMhl: 32.9 },
    { campaign: "2023/24", stocksMhl: 33.9 },
    { campaign: "2024/25", stocksMhl: 31.4 },
    { campaign: "2025/26", stocksMhl: 28.9 },
    { campaign: "2026/27", stocksMhl: 30.2 },
  ],
  PT: [
    { campaign: "2022/23", stocksMhl: 7.6 },
    { campaign: "2023/24", stocksMhl: 7.9 },
    { campaign: "2024/25", stocksMhl: 7.7 },
    { campaign: "2025/26", stocksMhl: 7.5 },
    { campaign: "2026/27", stocksMhl: 7.4 },
  ],
  FR: [
    { campaign: "2022/23", stocksMhl: 40.1 },
    { campaign: "2023/24", stocksMhl: 39.3 },
    { campaign: "2024/25", stocksMhl: 41.0 },
    { campaign: "2025/26", stocksMhl: 38.6 },
    { campaign: "2026/27", stocksMhl: 37.5 },
  ],
  IT: [
    { campaign: "2022/23", stocksMhl: 42.5 },
    { campaign: "2023/24", stocksMhl: 43.8 },
    { campaign: "2024/25", stocksMhl: 40.0 },
    { campaign: "2025/26", stocksMhl: 39.5 },
    { campaign: "2026/27", stocksMhl: 38.9 },
  ],
};
