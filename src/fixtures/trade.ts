/**
 * ILLUSTRATIVE FIXTURE DATA: trade flows.
 *
 * Development stand-ins for customs aggregates covering the four
 * producer countries' external trade, 12 months to June 2026. Customs
 * categories are kept separate throughout; volumes are Mhl, values
 * million EUR. Values are plausible magnitudes, not real statistics.
 */

import type {
  TradeCategory,
  TradeCategoryDetail,
  TradeMonthlyPoint,
  TradePartnerRow,
  TradePeriod,
} from "@/services/trade/types";
import type { CountryCode } from "@/services/types";

export const TRADE_UPDATED_AT = "2026-08-21T09:30:00Z";

export const tradePeriod: TradePeriod = {
  label: "12 months to Jun 2026",
  latestMonth: "2026-06",
};

const exporter = (
  rank: number,
  country: CountryCode,
  volumeMhl: number,
  valueMeur: number,
  yoyPercent: number,
  momPercent: number,
  sharePercent: number,
): TradePartnerRow => ({
  rank,
  country,
  direction: "export",
  volumeMhl,
  valueMeur,
  unitValueEurL: Math.round((valueMeur / volumeMhl) / 100 * 100) / 100,
  yoyPercent,
  momPercent,
  sharePercent,
});

const destination = (
  rank: number,
  country: CountryCode,
  volumeMhl: number,
  valueMeur: number,
  yoyPercent: number,
  momPercent: number,
  sharePercent: number,
): TradePartnerRow => ({
  rank,
  country,
  direction: "import",
  volumeMhl,
  valueMeur,
  unitValueEurL: Math.round((valueMeur / volumeMhl) / 100 * 100) / 100,
  yoyPercent,
  momPercent,
  sharePercent,
});

const flow = (
  origin: CountryCode,
  dest: CountryCode,
  volumeMhl: number,
  valueMeur: number,
  yoyPercent: number,
) => ({
  origin,
  destination: dest,
  volumeMhl,
  valueMeur,
  unitValueEurL: Math.round((valueMeur / volumeMhl) / 100 * 100) / 100,
  yoyPercent,
});

export const tradeCategoryDetails: TradeCategoryDetail[] = [
  {
    category: "bulk",
    summary: {
      category: "bulk",
      exportVolumeMhl: 17.5,
      exportValueMeur: 1390,
      importVolumeMhl: 1.9,
      importValueMeur: 160,
      exportUnitValueEurL: 0.79,
      volumeYoYPercent: -2.9,
      valueYoYPercent: 0.8,
      status: "provisional",
    },
    exporters: [
      exporter(1, "ES", 10.9, 720, -3.0, 1.2, 62.3),
      exporter(2, "IT", 3.9, 340, -1.5, -0.8, 22.3),
      exporter(3, "FR", 1.6, 210, -6.0, -2.1, 9.1),
      exporter(4, "PT", 1.1, 120, 2.8, 0.5, 6.3),
    ],
    destinations: [
      destination(1, "DE", 3.6, 280, -1.8, 0.4, 20.6),
      destination(2, "FR", 3.3, 215, -3.5, 1.0, 18.9),
      destination(3, "PT", 1.9, 95, 1.2, 0.8, 10.9),
      destination(4, "GB", 1.6, 140, -0.9, -0.6, 9.1),
      destination(5, "IT", 1.2, 75, -5.4, -1.3, 6.9),
    ],
    topFlows: [
      flow("ES", "FR", 3.1, 205, -4.1),
      flow("ES", "DE", 2.3, 150, -2.0),
      flow("ES", "PT", 1.8, 90, 1.5),
      flow("IT", "DE", 1.2, 105, -0.9),
      flow("ES", "IT", 1.1, 70, -6.2),
    ],
    note: "Bulk wine covers still wine shipped in containers above 10 litres, including flexitanks. Intra-European flows dominate volume; unit values are not comparable with bottled trade.",
    sourceId: "sample-customs",
    updatedAt: TRADE_UPDATED_AT,
  },
  {
    category: "bottled",
    summary: {
      category: "bottled",
      exportVolumeMhl: 32.1,
      exportValueMeur: 13240,
      importVolumeMhl: 1.3,
      importValueMeur: 610,
      exportUnitValueEurL: 4.12,
      volumeYoYPercent: -0.8,
      valueYoYPercent: 2.1,
      status: "provisional",
    },
    exporters: [
      exporter(1, "IT", 11.2, 4480, -0.5, 0.6, 34.9),
      exporter(2, "FR", 9.7, 5650, -1.8, -0.4, 30.2),
      exporter(3, "ES", 9.2, 2290, 0.4, 0.9, 28.7),
      exporter(4, "PT", 2.0, 820, 1.9, 1.1, 6.2),
    ],
    destinations: [
      destination(1, "US", 5.9, 2950, -2.6, -1.5, 18.4),
      destination(2, "GB", 5.0, 1980, 0.6, 0.3, 15.6),
      destination(3, "DE", 4.6, 1470, -1.1, 0.2, 14.3),
      destination(4, "NL", 1.9, 610, 1.4, 0.6, 5.9),
      destination(5, "BE", 1.5, 540, -0.7, -0.2, 4.7),
    ],
    topFlows: [
      flow("IT", "US", 2.6, 1120, -1.2),
      flow("FR", "US", 2.2, 1760, -2.5),
      flow("IT", "DE", 2.0, 620, 0.3),
      flow("ES", "GB", 1.6, 390, 0.8),
      flow("FR", "GB", 1.4, 760, -1.0),
    ],
    note: "Bottled still wine covers containers of two litres or less. Value concentration is far higher than in bulk; average unit values differ widely by origin.",
    sourceId: "sample-customs",
    updatedAt: TRADE_UPDATED_AT,
  },
  {
    category: "sparkling",
    summary: {
      category: "sparkling",
      exportVolumeMhl: 3.9,
      exportValueMeur: 3730,
      importVolumeMhl: 0.3,
      importValueMeur: 190,
      exportUnitValueEurL: 9.56,
      volumeYoYPercent: 2.4,
      valueYoYPercent: 4.0,
      status: "provisional",
    },
    exporters: [
      exporter(1, "IT", 2.1, 1540, 3.1, 1.4, 53.8),
      exporter(2, "FR", 1.3, 1890, 0.9, 0.2, 33.3),
      exporter(3, "ES", 0.4, 210, 2.0, 0.7, 10.3),
      exporter(4, "PT", 0.1, 90, 4.5, 1.9, 2.6),
    ],
    destinations: [
      destination(1, "US", 1.0, 1050, 1.8, 0.9, 25.6),
      destination(2, "GB", 0.8, 690, 1.1, 0.4, 20.5),
      destination(3, "DE", 0.5, 330, 2.6, 1.0, 12.8),
    ],
    topFlows: [
      flow("IT", "US", 0.6, 420, 2.9),
      flow("IT", "GB", 0.5, 330, 1.5),
      flow("FR", "US", 0.4, 560, 0.4),
    ],
    note: "Sparkling wine is a distinct customs heading with its own price structure; volumes are small relative to still wine but value shares are large.",
    sourceId: "sample-customs",
    updatedAt: TRADE_UPDATED_AT,
  },
  {
    category: "must",
    summary: {
      category: "must",
      exportVolumeMhl: 0.7,
      exportValueMeur: 210,
      importVolumeMhl: 0.4,
      importValueMeur: 90,
      exportUnitValueEurL: 3.0,
      volumeYoYPercent: 1.0,
      valueYoYPercent: 3.2,
      status: "provisional",
    },
    exporters: [
      exporter(1, "ES", 0.5, 150, 1.5, 0.3, 71.4),
      exporter(2, "IT", 0.2, 60, 0.0, -0.5, 28.6),
    ],
    destinations: [
      destination(1, "DE", 0.2, 60, 1.2, 0.5, 28.6),
      destination(2, "US", 0.1, 35, 2.4, 0.9, 14.3),
      destination(3, "GB", 0.1, 30, 0.8, 0.2, 14.3),
    ],
    topFlows: [flow("ES", "DE", 0.15, 45, 1.9), flow("ES", "FR", 0.1, 28, 1.1)],
    note: "Grape must and concentrates are separate customs headings from wine. Volumes here are litres of product as shipped, at very different concentrations, and must never be added to wine volumes.",
    sourceId: "sample-customs",
    updatedAt: TRADE_UPDATED_AT,
  },
];

const MONTHLY_BASES: Record<
  TradeCategory,
  { base: number; seasonality: number; peakMonth: number; trend: number }
> = {
  bulk: { base: 1.46, seasonality: 0.1, peakMonth: 10, trend: -0.03 },
  bottled: { base: 2.68, seasonality: 0.16, peakMonth: 10, trend: -0.01 },
  sparkling: { base: 0.32, seasonality: 0.45, peakMonth: 11, trend: 0.03 },
  must: { base: 0.058, seasonality: 0.3, peakMonth: 9, trend: 0.01 },
};

/**
 * Deterministic 24-month export volume series per category (no random
 * component: a seasonal curve with a mild trend, rounded to 2 dp).
 */
export function monthlyExportVolumes(
  category: TradeCategory,
): TradeMonthlyPoint[] {
  const cfg = MONTHLY_BASES[category];
  const points: TradeMonthlyPoint[] = [];
  for (let i = 0; i < 24; i++) {
    // From Jul 2024 (i=0) to Jun 2026 (i=23).
    const year = 2024 + Math.floor((6 + i) / 12);
    const monthIndex = (6 + i) % 12; // 0-based month
    const seasonal =
      1 +
      cfg.seasonality *
        Math.cos(((monthIndex - cfg.peakMonth) / 12) * 2 * Math.PI);
    const trend = 1 + cfg.trend * (i / 24);
    points.push({
      month: `${year}-${String(monthIndex + 1).padStart(2, "0")}`,
      volumeMhl: Math.round(cfg.base * seasonal * trend * 100) / 100,
    });
  }
  return points;
}
