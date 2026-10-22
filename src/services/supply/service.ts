/**
 * Supply service: the stocks each country declares, and Spain's wine
 * production and declared balance, read from the supply figures the
 * imports store in the database. Spain's come from the Ministry of
 * Agriculture's monthly INFOVI declarations, Italy's month-end stocks
 * from the ICQRF's Cantina Italia reports, and France's and Portugal's
 * stocks at 31 July from the customs' and the wine institute's
 * declarations. Without a database every method answers null and the
 * pages say that no figures are connected.
 */

import { cacheLife, cacheTag } from "next/cache";
import { cache } from "react";

import type { Database } from "@/lib/database.types";
import { getSupabase } from "@/lib/supabase";
import type { SourceId } from "@/services/markets/sources";
import type {
  AnnualStocks,
  CampaignPath,
  JulyStockPoint,
  JulyStocksRow,
  MonthlyStocks,
  SpainBalance,
  SpainCampaignBalance,
  SpainProduction,
  YearOnYearRow,
} from "@/services/supply/types";
import { PRODUCER_COUNTRIES, type ProducerCountry } from "@/services/types";

export interface SupplyService {
  /** Spain's month-end stocks in detail; null without figures. */
  getSpainMonthlyStocks(): Promise<MonthlyStocks | null>;
  /** Italy's month-end stocks in detail; null without figures. */
  getItalyMonthlyStocks(): Promise<MonthlyStocks | null>;
  /** France's stocks declared at 31 July; null without figures. */
  getFranceAnnualStocks(): Promise<AnnualStocks | null>;
  /** Portugal's stocks declared at 31 July; null without figures. */
  getPortugalAnnualStocks(): Promise<AnnualStocks | null>;
  /** Each country's stocks at its latest 31 July, for comparison; empty without figures. */
  getJulyStocks(): Promise<JulyStocksRow[]>;
  /** Spain's declared wine production; null without figures. */
  getSpainProduction(): Promise<SpainProduction | null>;
  /** Spain's declared wine balance; null without figures. */
  getSpainBalance(): Promise<SpainBalance | null>;
}

export type FigureRow = Database["public"]["Tables"]["supply_figures"]["Row"];

const INFOVI: SourceId = "mapa-infovi";
const CANTINA_ITALIA: SourceId = "icqrf-cantina-italia";
const DOUANE: SourceId = "douane-stocks";
const IVV: SourceId = "ivv-existencias";
/** The Data API returns at most this many rows per request. */
const PAGE_SIZE = 1000;
const HL_PER_MHL = 1_000_000;

/** Every country's supply figures, oldest first. Read at most hourly: they change monthly. */
async function loadSupplyFigures(): Promise<FigureRow[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("supply-data");

  const supabase = getSupabase();
  if (!supabase) return [];
  const rows: FigureRow[] = [];
  for (;;) {
    const page = await supabase
      .from("supply_figures")
      .select("*", { count: "exact" })
      .order("country")
      .order("period")
      .order("measure")
      .order("product")
      .order("colour")
      .order("presentation")
      .order("holder")
      .range(rows.length, rows.length + PAGE_SIZE - 1);
    if (page.error) {
      throw new Error(`Reading supply figures failed: ${page.error.message}`);
    }
    rows.push(...page.data);
    if (page.data.length === 0 || rows.length >= (page.count ?? 0)) break;
  }
  return rows;
}

const supplyFigures = cache(
  async (): Promise<FigureRow[]> => (getSupabase() ? loadSupplyFigures() : []),
);

/** One country's figures from one source. */
async function figuresOf(country: ProducerCountry, sourceId: SourceId): Promise<FigureRow[]> {
  return (await supplyFigures()).filter(
    (row) => row.country === country && row.source_id === sourceId,
  );
}

type Match = Partial<
  Pick<FigureRow, "measure" | "product" | "colour" | "presentation" | "holder">
>;

/** Hectolitres of the figures matching a month and filter, or null when none. */
function volume(rows: FigureRow[], month: string, match: Match): number | null {
  const found = rows.filter(
    (row) =>
      row.period.startsWith(month) &&
      Object.entries(match).every(
        ([field, value]) => row[field as keyof Match] === value,
      ),
  );
  return found.length > 0 ? found.reduce((sum, row) => sum + row.volume_hl, 0) : null;
}

/**
 * Wine of one measure, hl, by month ("2026-07"): held at its end, made up
 * to it, or moved during it. A month's total, stored with colour and
 * presentation "all", stands for its parts; without one the parts add up.
 * France's totals are stored per holder and add up across them.
 */
function wineByMonth(rows: FigureRow[], measure: FigureRow["measure"]): Map<string, number> {
  const parts = new Map<string, number>();
  const totals = new Map<string, number>();
  for (const row of rows) {
    if (row.measure !== measure || row.product !== "wine") continue;
    const month = row.period.slice(0, 7);
    const byMonth = row.colour === "all" && row.presentation === "all" ? totals : parts;
    byMonth.set(month, (byMonth.get(month) ?? 0) + row.volume_hl);
  }
  return new Map([...parts, ...totals]);
}

function wineStocksByMonth(rows: FigureRow[]): Map<string, number> {
  return wineByMonth(rows, "closing-stocks");
}

/** The same month a year earlier: "2026-07" to "2025-07". */
function yearBefore(month: string): string {
  return `${Number(month.slice(0, 4)) - 1}${month.slice(4)}`;
}

/** Marketing campaign (August to July) of a month, e.g. "2025/26". */
function campaignOfMonth(month: string): string {
  const year = Number(month.slice(0, 4));
  const start = Number(month.slice(5, 7)) >= 8 ? year : year - 1;
  return `${start}/${String((start + 1) % 100).padStart(2, "0")}`;
}

/** The campaign before, "2025/26" to "2024/25". */
function campaignBefore(campaign: string): string {
  const start = Number(campaign.slice(0, 4)) - 1;
  return `${start}/${String((start + 1) % 100).padStart(2, "0")}`;
}

/** The months of a campaign in order: "2025/26" to "2025-08" ... "2026-07". */
function campaignMonths(campaign: string): string[] {
  const start = Number(campaign.slice(0, 4));
  return Array.from({ length: 12 }, (_, index) => {
    const month = ((index + 7) % 12) + 1;
    return `${month >= 8 ? start : start + 1}-${String(month).padStart(2, "0")}`;
  });
}

/** A campaign's months from a month map, in order, as far as declared. */
function campaignPath(byMonth: Map<string, number>, campaign: string): CampaignPath {
  return {
    campaign,
    points: [...byMonth]
      .filter(([month]) => campaignOfMonth(month) === campaign)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, hl]) => ({ month, wineMhl: hl / HL_PER_MHL })),
  };
}

/** A line of a breakdown table: what it is called and which figures it adds up. */
interface Line {
  label: string;
  match: Match;
  isTotal?: boolean;
}

/**
 * The lines of a breakdown for one period against the same period a year
 * earlier, leaving out the lines the period has no figure for.
 */
function yearOnYear(
  rows: FigureRow[],
  period: string,
  earlier: string,
  lines: Line[],
): YearOnYearRow[] {
  return lines.flatMap(({ label, match, isTotal = false }) => {
    const latest = volume(rows, period, { measure: "closing-stocks", ...match });
    const before = volume(rows, earlier, { measure: "closing-stocks", ...match });
    return latest === null
      ? []
      : [{
          label,
          latestMhl: latest / HL_PER_MHL,
          yearEarlierMhl: before === null ? null : before / HL_PER_MHL,
          isTotal,
        }];
  });
}

/** When the source published the figures of a period, and when WineTerm last updated any. */
function timestamps(rows: FigureRow[], period: string): { publishedAt: string; updatedAt: string } {
  const periodRows = rows.filter((row) => row.period.startsWith(period));
  return {
    publishedAt: periodRows.map((row) => row.published_at).sort().at(-1)!,
    updatedAt: rows.map((row) => row.updated_at).sort().at(-1)!,
  };
}

/**
 * A country's month-end stocks: the latest month's lines against a year
 * earlier, and the monthly path of wine stocks through the latest two
 * campaigns. Null without figures.
 */
function monthlyStocks(
  country: ProducerCountry,
  sourceId: SourceId,
  rows: FigureRow[],
  lines: Line[],
): MonthlyStocks | null {
  const stocks = wineStocksByMonth(rows);
  const latestMonth = [...stocks.keys()].sort().at(-1);
  if (!latestMonth) return null;
  const latestCampaign = campaignOfMonth(latestMonth);
  return {
    country,
    latestMonth,
    breakdown: yearOnYear(rows, latestMonth, yearBefore(latestMonth), lines),
    campaigns: [latestCampaign, campaignBefore(latestCampaign)].map((campaign) =>
      campaignPath(stocks, campaign)
    ),
    sourceId,
    ...timestamps(
      rows.filter((row) => row.measure === "closing-stocks"),
      latestMonth,
    ),
  };
}

const SPAIN_LINES: Line[] = [
  { label: "Red and rosé, bulk", match: { product: "wine", colour: "red-rose", presentation: "bulk" } },
  { label: "Red and rosé, packaged", match: { product: "wine", colour: "red-rose", presentation: "packaged" } },
  { label: "White, bulk", match: { product: "wine", colour: "white", presentation: "bulk" } },
  { label: "White, packaged", match: { product: "wine", colour: "white", presentation: "packaged" } },
  { label: "All wine", match: { product: "wine" }, isTotal: true },
  { label: "Grape must, not concentrated", match: { product: "must" } },
];

const ITALY_LINES: Line[] = [
  { label: "PDO wine, white", match: { product: "wine-pdo", colour: "white" } },
  { label: "PDO wine, rosé", match: { product: "wine-pdo", colour: "rose" } },
  { label: "PDO wine, red", match: { product: "wine-pdo", colour: "red" } },
  { label: "All PDO wine", match: { product: "wine-pdo" } },
  { label: "PGI wine, white", match: { product: "wine-pgi", colour: "white" } },
  { label: "PGI wine, rosé", match: { product: "wine-pgi", colour: "rose" } },
  { label: "PGI wine, red", match: { product: "wine-pgi", colour: "red" } },
  { label: "All PGI wine", match: { product: "wine-pgi" } },
  { label: "Varietal wine without GI", match: { product: "wine-varietal" } },
  { label: "Other wine without GI", match: { product: "wine-other" } },
  { label: "All wine", match: { product: "wine" }, isTotal: true },
  { label: "Grape must, not concentrated", match: { product: "must" } },
  { label: "Concentrated grape must", match: { product: "must-concentrated" } },
  { label: "Rectified concentrated grape must", match: { product: "must-rcgm" } },
  { label: "New wine still in fermentation", match: { product: "new-wine" } },
];

const FRANCE_LINES: Line[] = [
  { label: "At producers: PDO wine", match: { product: "wine-pdo", holder: "producers" } },
  { label: "At producers: PGI wine", match: { product: "wine-pgi", holder: "producers" } },
  { label: "At producers: wine without GI", match: { product: "wine-other", holder: "producers" } },
  { label: "All wine at producers", match: { product: "wine", holder: "producers" }, isTotal: true },
  { label: "At traders: PDO wine", match: { product: "wine-pdo", holder: "traders" } },
  { label: "At traders: PGI wine", match: { product: "wine-pgi", holder: "traders" } },
  { label: "At traders: wine without GI", match: { product: "wine-other", holder: "traders" } },
  { label: "At traders: wine from third countries", match: { product: "wine-third-country", holder: "traders" } },
  { label: "All wine at traders", match: { product: "wine", holder: "traders" }, isTotal: true },
  { label: "All wine, producers and traders", match: { product: "wine" }, isTotal: true },
];

const PORTUGAL_LINES: Line[] = [
  { label: "PDO wine", match: { product: "wine-pdo" } },
  { label: "PDO liqueur wine", match: { product: "wine-pdo-liqueur" } },
  { label: "PGI wine", match: { product: "wine-pgi" } },
  { label: "Varietal wine without GI", match: { product: "wine-varietal" } },
  { label: "Wine without certification", match: { product: "wine-other" } },
  { label: "Red, all categories", match: { colour: "red" } },
  { label: "Rosé, all categories", match: { colour: "rose" } },
  { label: "White, all categories", match: { colour: "white" } },
  { label: "All wine and must", match: { product: "wine-and-must" }, isTotal: true },
];

/** The years a country's figures give stocks at 31 July for, oldest first. */
function julyYears(rows: FigureRow[], match: Match): number[] {
  return [
    ...new Set(
      rows
        .filter(
          (row) =>
            row.measure === "closing-stocks" &&
            row.period.slice(5, 7) === "07" &&
            Object.entries(match).every(
              ([field, value]) => row[field as keyof Match] === value,
            ),
        )
        .map((row) => Number(row.period.slice(0, 4))),
    ),
  ].sort((a, b) => a - b);
}

/**
 * A country's stocks declared at 31 July: the latest year's lines against
 * the year before, and every year's totals. Null without figures.
 */
function annualStocks(
  country: ProducerCountry,
  sourceId: SourceId,
  rows: FigureRow[],
  lines: Line[],
  total: Match,
): AnnualStocks | null {
  const years = julyYears(rows, total);
  const latestYear = years.at(-1);
  if (latestYear === undefined) return null;
  const at = (year: number, match: Match) =>
    volume(rows, `${year}-07`, { measure: "closing-stocks", ...match });
  const mhl = (hl: number | null) => (hl === null ? null : hl / HL_PER_MHL);
  const history: JulyStockPoint[] = years.map((year) => ({
    year,
    totalMhl: (at(year, total) ?? 0) / HL_PER_MHL,
    producersMhl: mhl(at(year, { product: "wine", holder: "producers" })),
    tradersMhl: mhl(at(year, { product: "wine", holder: "traders" })),
  }));
  return {
    country,
    latestYear,
    breakdown: yearOnYear(rows, `${latestYear}-07`, `${latestYear - 1}-07`, lines),
    history,
    sourceId,
    ...timestamps(rows, `${latestYear}-07`),
  };
}

/** How each source counts the stocks it declares at 31 July. */
const JULY_SCOPES: Record<ProducerCountry, string> = {
  ES: "Wine held by producers of 1,000 hl or more and by warehouse holders, as declared each month to the Ministry of Agriculture; smaller producers' stocks are not included.",
  PT: "Wine and must declared by every operator but retailers to the wine institute, products with a PDO or PGI including those eligible for one.",
  FR: "Wine declared by producers and by traders to customs at the end of the campaign, wine of third-country origin included.",
  IT: "Wine in the telematic wine register, which holds at least 95% of the wine kept in Italy; musts and new wine still in fermentation are counted apart.",
};

/** Figures from the supply declarations and registers in the database. */
class DatabaseSupplyService implements SupplyService {
  async getSpainMonthlyStocks(): Promise<MonthlyStocks | null> {
    return monthlyStocks("ES", INFOVI, await figuresOf("ES", INFOVI), SPAIN_LINES);
  }

  async getItalyMonthlyStocks(): Promise<MonthlyStocks | null> {
    return monthlyStocks("IT", CANTINA_ITALIA, await figuresOf("IT", CANTINA_ITALIA), ITALY_LINES);
  }

  async getFranceAnnualStocks(): Promise<AnnualStocks | null> {
    return annualStocks("FR", DOUANE, await figuresOf("FR", DOUANE), FRANCE_LINES, {
      product: "wine",
    });
  }

  async getPortugalAnnualStocks(): Promise<AnnualStocks | null> {
    return annualStocks("PT", IVV, await figuresOf("PT", IVV), PORTUGAL_LINES, {
      product: "wine-and-must",
    });
  }

  async getJulyStocks(): Promise<JulyStocksRow[]> {
    const sources: Record<ProducerCountry, { sourceId: SourceId; total: Match }> = {
      ES: { sourceId: INFOVI, total: { product: "wine" } },
      PT: { sourceId: IVV, total: { product: "wine-and-must" } },
      FR: { sourceId: DOUANE, total: { product: "wine" } },
      IT: { sourceId: CANTINA_ITALIA, total: { product: "wine" } },
    };
    const rows: JulyStocksRow[] = [];
    for (const country of PRODUCER_COUNTRIES) {
      const { sourceId, total } = sources[country];
      const figures = await figuresOf(country, sourceId);
      // Spain's and Italy's July stocks are their July month-end stocks.
      const byMonth =
        total.product === "wine" ? wineStocksByMonth(figures) : new Map<string, number>();
      const julys =
        total.product === "wine"
          ? [...byMonth.keys()].filter((month) => month.endsWith("-07")).sort()
          : julyYears(figures, total).map((year) => `${year}-07`);
      const latest = julys.at(-1);
      if (!latest) continue;
      const stock = (month: string) =>
        total.product === "wine"
          ? (byMonth.get(month) ?? null)
          : volume(figures, month, { measure: "closing-stocks", ...total });
      const latestHl = stock(latest);
      if (latestHl === null) continue;
      const earlierHl = stock(yearBefore(latest));
      rows.push({
        country,
        year: Number(latest.slice(0, 4)),
        latestMhl: latestHl / HL_PER_MHL,
        yearEarlierMhl: earlierHl === null ? null : earlierHl / HL_PER_MHL,
        scope: JULY_SCOPES[country],
        sourceId,
      });
    }
    return rows;
  }

  async getSpainProduction(): Promise<SpainProduction | null> {
    const rows = await figuresOf("ES", INFOVI);
    const made = wineByMonth(rows, "production-to-date");
    const latestMonth = [...made.keys()].sort().at(-1);
    if (!latestMonth) return null;
    const earlierMonth = yearBefore(latestMonth);

    const line = (label: string, match: Match, isTotal = false) => {
      const latest = volume(rows, latestMonth, { measure: "production-to-date", ...match });
      const earlier = volume(rows, earlierMonth, { measure: "production-to-date", ...match });
      return latest === null
        ? []
        : [{
            label,
            latestMhl: latest / HL_PER_MHL,
            yearEarlierMhl: earlier === null ? null : earlier / HL_PER_MHL,
            isTotal,
          }];
    };

    // A campaign is complete once its July is declared: wine made from
    // 1 August to 31 July.
    const history = [...made.keys()]
      .filter((month) => month.endsWith("-07"))
      .sort((a, b) => b.localeCompare(a))
      .map((july) => {
        const red = volume(rows, july, { measure: "production-to-date", colour: "red-rose" }) ?? 0;
        const white = volume(rows, july, { measure: "production-to-date", colour: "white" }) ?? 0;
        return {
          campaign: campaignOfMonth(july),
          redRoseMhl: red / HL_PER_MHL,
          whiteMhl: white / HL_PER_MHL,
          totalMhl: (red + white) / HL_PER_MHL,
        };
      });

    const campaign = campaignOfMonth(latestMonth);
    return {
      latestMonth,
      campaign,
      toDate: [
        ...line("Red and rosé", { colour: "red-rose" }),
        ...line("White", { colour: "white" }),
        ...line("All wine", {}, true),
      ],
      campaigns: [campaign, campaignBefore(campaign)].map((c) => campaignPath(made, c)),
      history,
      sourceId: INFOVI,
      ...timestamps(
        rows.filter((row) => row.measure === "production-to-date"),
        latestMonth,
      ),
    };
  }

  async getSpainBalance(): Promise<SpainBalance | null> {
    return spainBalance(await figuresOf("ES", INFOVI));
  }
}

/** Entries and exits that every month of a balance needs, in this order. */
const BALANCE_FLOWS = [
  "entries-domestic",
  "entries-eu",
  "entries-third-countries",
  "exits-domestic",
  "exits-distillation",
  "exits-vinegar",
  "exits-eu",
  "exits-third-countries",
] as const;

/** Colours and presentations of the exits abroad, in display order. */
const ABROAD_KINDS = [
  ["red-rose", "bulk"],
  ["white", "bulk"],
  ["red-rose", "packaged"],
  ["white", "packaged"],
] as const;

/**
 * Spain's declared wine balance from its INFOVI figures: the latest
 * campaign to date, the one before to the same month and the completed
 * campaigns. Null until a campaign's entries and exits are all declared.
 */
export function spainBalance(rows: FigureRow[]): SpainBalance | null {
  const stocks = wineStocksByMonth(rows);
  const made = wineByMonth(rows, "production-to-date");
  const flows = BALANCE_FLOWS.map((measure) => wineByMonth(rows, measure));
  const ownOperations = wineByMonth(rows, "exits-own-operations");
  const latestMonth = [...flows[0].keys()].sort().at(-1);
  if (!latestMonth) return null;

  // From 1 August to the end of `throughMonth`, or null unless the
  // stocks at both ends and every month's entries and exits are declared.
  const balance = (campaign: string, throughMonth: string): SpainCampaignBalance | null => {
    const months = campaignMonths(campaign).filter((month) => month <= throughMonth);
    const sum = (byMonth: Map<string, number>) =>
      months.every((month) => byMonth.has(month))
        ? months.reduce((total, month) => total + byMonth.get(month)!, 0)
        : null;
    const opening = stocks.get(`${campaign.slice(0, 4)}-07`);
    const closing = stocks.get(throughMonth);
    const madeToDate = made.get(throughMonth);
    const sums = flows.map(sum);
    if (
      opening === undefined ||
      closing === undefined ||
      madeToDate === undefined ||
      sums.includes(null)
    ) {
      return null;
    }
    const [
      entriesDomestic,
      entriesEu,
      entriesThirdCountries,
      exitsDomestic,
      exitsDistillation,
      exitsVinegar,
      exitsEu,
      exitsThirdCountries,
    ] = sums as number[];
    const own = sum(ownOperations);
    const abroad = ABROAD_KINDS.map(([colour, presentation]) => {
      const kind = (measure: FigureRow["measure"]) => {
        const volumes = months.map((month) =>
          volume(rows, month, { measure, product: "wine", colour, presentation })
        );
        return volumes.includes(null)
          ? null
          : (volumes as number[]).reduce((a, b) => a + b, 0);
      };
      return { colour, presentation, eu: kind("exits-eu"), thirdCountries: kind("exits-third-countries") };
    });
    const availability =
      opening + madeToDate + entriesDomestic + entriesEu + entriesThirdCountries;
    const exits =
      exitsDomestic +
      exitsDistillation +
      exitsVinegar +
      exitsEu +
      exitsThirdCountries +
      (own ?? 0);
    const mhl = (hl: number) => hl / HL_PER_MHL;
    return {
      campaign,
      throughMonth,
      openingMhl: mhl(opening),
      madeMhl: mhl(madeToDate),
      entriesDomesticMhl: mhl(entriesDomestic),
      entriesEuMhl: mhl(entriesEu),
      entriesThirdCountriesMhl: mhl(entriesThirdCountries),
      availabilityMhl: mhl(availability),
      exitsDomesticMhl: mhl(exitsDomestic),
      exitsDistillationMhl: mhl(exitsDistillation),
      exitsVinegarMhl: mhl(exitsVinegar),
      exitsEuMhl: mhl(exitsEu),
      exitsThirdCountriesMhl: mhl(exitsThirdCountries),
      exitsAbroad: abroad.every(({ eu, thirdCountries }) => eu !== null && thirdCountries !== null)
        ? abroad.map(({ colour, presentation, eu, thirdCountries }) => ({
            colour,
            presentation,
            euMhl: mhl(eu!),
            thirdCountriesMhl: mhl(thirdCountries!),
          }))
        : null,
      exitsOwnOperationsMhl: own === null ? null : mhl(own),
      exitsMhl: mhl(exits),
      computedClosingMhl: mhl(availability - exits),
      closingMhl: mhl(closing),
      unaccountedMhl: mhl(closing - (availability - exits)),
      netDomesticExitsMhl: mhl(exitsDomestic - entriesDomestic),
    };
  };

  const campaign = campaignOfMonth(latestMonth);
  const latest = balance(campaign, latestMonth);
  if (!latest) return null;
  const history = [...flows[0].keys()]
    .filter((month) => month.endsWith("-07"))
    .sort((a, b) => b.localeCompare(a))
    .map((july) => balance(campaignOfMonth(july), july))
    .filter((row): row is SpainCampaignBalance => row !== null);
  const latestRows = rows.filter(
    (row) =>
      row.period.startsWith(latestMonth) &&
      (row.measure.startsWith("entries-") || row.measure.startsWith("exits-")),
  );
  return {
    latestMonth,
    latest,
    previous: balance(campaignBefore(campaign), yearBefore(latestMonth)),
    history,
    sourceId: INFOVI,
    publishedAt: latestRows.map((row) => row.published_at).sort().at(-1)!,
    updatedAt: rows.map((row) => row.updated_at).sort().at(-1)!,
  };
}

let service: SupplyService | null = null;

/** The declared figures when Supabase is configured; nothing otherwise. */
export function getSupplyService(): SupplyService {
  service ??= new DatabaseSupplyService();
  return service;
}
