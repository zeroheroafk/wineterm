/**
 * MAPA, Informe Semanal de Coyuntura: the Spanish Ministry of
 * Agriculture's weekly market report, one workbook a week. WineTerm reads
 * its table 2.2, the ex-winery prices of white and red wine without
 * PDO/PGI in the representative markets Spain notifies to the Commission
 * (Regulation (EU) 2017/1185). No database access here.
 */

import * as XLSX from "npm:xlsx@0.18.5";

export const SOURCE_ID = "mapa-isc";
const PAGE =
  "https://www.mapa.gob.es/es/estadistica/temas/publicaciones/informe-semanal-coyuntura";
const TIMEOUT_MS = 60_000;
/** First year whose workbooks carry table 2.2 in its current layout. */
export const FIRST_YEAR = 2019;
/** First ISO week of FIRST_YEAR whose workbook carries table 2.2. */
const FIRST_WEEK = 12;

/**
 * Whether a workbook's link dates it before table 2.2 began, so it need
 * not be downloaded: weeks 1 to 11 of 2019 have no such table, and one of
 * them is an old .xls file, which takes too long to read.
 */
export function beforeTable(year: number, week: number | null): boolean {
  return year < FIRST_YEAR || (year === FIRST_YEAR && week !== null && week < FIRST_WEEK);
}

type Colour = "WHT" | "RED";

/**
 * The markets WineTerm imports, by the name the table gives them. Others
 * appeared for a few weeks only (Cádiz, Huelva and Córdoba whites in
 * 2023 and 2024, a Valencia white once) and are reported as unknown.
 */
export const MARKETS: Record<string, string> = {
  Albacete: "ALB",
  Badajoz: "BAD",
  "Ciudad Real": "CRE",
  Cuenca: "CUE",
  Murcia: "MUR",
  Toledo: "TOL",
  Valencia: "VAL",
};

/** Series codes, e.g. ES-CRE-RED-NGI; the migration creates each one. */
export const SERIES_CODES = [
  "ES-ALB-WHT-NGI",
  "ES-BAD-WHT-NGI",
  "ES-CRE-WHT-NGI",
  "ES-CUE-WHT-NGI",
  "ES-TOL-WHT-NGI",
  "ES-ALB-RED-NGI",
  "ES-BAD-RED-NGI",
  "ES-CRE-RED-NGI",
  "ES-CUE-RED-NGI",
  "ES-MUR-RED-NGI",
  "ES-TOL-RED-NGI",
  "ES-VAL-RED-NGI",
];

/**
 * Bounds of a plausible market price in EUR/hl. A value outside them
 * means the workbook changed shape, not that the market moved.
 */
const MIN_PRICE = 5;
const MAX_PRICE = 500;

const DAY_MS = 86_400_000;

export interface Observation {
  series_code: string;
  /** Sunday that ends the price's week, e.g. "2026-09-27". */
  observed_on: string;
  /** EUR/hl, as published. */
  value: number;
}

/** One week's workbook, as the page lists it. */
export interface WorkbookLink {
  url: string;
  label: string;
}

function text(value: unknown): string {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
}

async function page(url: string): Promise<string | null> {
  const response = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`MAPA answered ${response.status} for ${url}`);
  return await response.text();
}

/** The workbook links on a page, in page order. */
export function workbookLinks(html: string, base: string): WorkbookLink[] {
  const links: WorkbookLink[] = [];
  for (const [, href, inner] of html.matchAll(
    /<a\b[^>]*href="([^"]+\.xlsx)"[^>]*>([\s\S]*?)<\/a>/gi,
  )) {
    const label = text(inner.replace(/<[^>]+>/g, " "));
    if (/informe semanal de coyuntura/i.test(label)) {
      links.push({ url: new URL(href, base).toString(), label });
    }
  }
  return links;
}

/**
 * A year's weekly workbooks: those on the year's page, and for the
 * current year the latest weeks, listed on the main page until they move
 * to the year's page.
 */
export async function yearWorkbooks(year: number): Promise<WorkbookLink[]> {
  const yearPage = `${PAGE}/${year}`;
  const html = await page(yearPage);
  const links = html ? workbookLinks(html, yearPage) : [];
  if (year === new Date().getUTCFullYear()) {
    const main = await page(PAGE);
    if (main) {
      for (const link of workbookLinks(main, PAGE)) {
        if (labelYear(link.label) === year) links.push(link);
      }
    }
  }
  return [...new Map(links.map((link) => [link.url, link])).values()];
}

/** The year a link label names after its week, e.g. "semana 39-2026". */
export function labelYear(label: string): number | null {
  const match = label.match(/semana \d{1,2}\s*-\s*(\d{4})/i) ??
    label.match(/\(\s*\d{1,2}\/\d{1,2}\/(\d{4})/);
  return match ? Number(match[1]) : null;
}

/** The ISO week a link label names, e.g. 39 for "semana 39-2026 (...)". */
export function labelWeek(label: string): number | null {
  const match = label.match(/semana\s+0?(\d{1,2})\b/i);
  return match ? Number(match[1]) : null;
}

export interface Workbook {
  file: ArrayBuffer;
  /** When the ministry uploaded the file, from its Last-Modified header. */
  uploadedAt: string | null;
}

export async function fetchWorkbook(url: string): Promise<Workbook> {
  const response = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!response.ok) throw new Error(`MAPA answered ${response.status} for ${url}`);
  const uploaded = Date.parse(response.headers.get("last-modified") ?? "");
  return {
    file: await response.arrayBuffer(),
    uploadedAt: Number.isNaN(uploaded) ? null : new Date(uploaded).toISOString(),
  };
}

/** Sunday ending ISO week `week` of `year`, the weeks the ministry uses. */
export function isoWeekEnd(year: number, week: number): string {
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const weekday = jan4.getUTCDay() || 7;
  const firstMonday = Date.UTC(year, 0, 4 - (weekday - 1));
  return new Date(firstMonday + ((week - 1) * 7 + 6) * DAY_MS).toISOString().slice(0, 10);
}

function iso(year: number, month: number, day: number): string | null {
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return date.toISOString().slice(0, 10);
}

function isSunday(date: string): boolean {
  return new Date(`${date}T00:00:00Z`).getUTCDay() === 0;
}

/**
 * The Sunday a week heading's printed dates end on: the last day and
 * month in it, in the year it gives, or else `year`, or the next one for
 * a week ending in January. Null when no reading of it is a Sunday.
 */
export function printedWeekEnd(heading: string, year: number): string | null {
  const dates = [...heading.matchAll(/(\d{1,2})\s*\/\s*(\d{1,2})(?:\s*\/\s*(\d{2,4}))?/g)];
  const last = dates.at(-1);
  if (!last) return null;
  const day = Number(last[1]);
  const month = Number(last[2]);
  const years: number[] = [];
  if (last[3]) {
    years.push(last[3].length === 2 ? 2000 + Number(last[3]) : Number(last[3]));
  } else {
    const printed = heading.match(/\b(20\d{2})\b/);
    if (printed) years.push(Number(printed[1]));
    years.push(year, year + 1);
  }
  for (const candidate of years) {
    const date = iso(candidate, month, day);
    if (date && isSunday(date)) return date;
  }
  return null;
}

/** The week number a heading opens with, e.g. 39 for "Semana 39 21/09-27/09". */
function headingWeek(heading: string): number | null {
  const match = heading.match(/^semana\s+0?(\d{1,2})\b/i);
  const week = match ? Number(match[1]) : 0;
  return week >= 1 && week <= 53 ? week : null;
}

/**
 * The Sunday ending the week a workbook reports. Headings and link labels
 * are typed by hand and each is wrong somewhere: a heading with last
 * week's dates under this week's number ("Semana 24 01-07/06 2020"), two
 * columns headed with the same week, early 2019 headings that print the
 * first day where the week number goes ("Semana 24 - 30/06 2019"), links
 * to another week's workbook. Comparing the prices with the neighbouring
 * weeks' shows the heading's week number is right whenever the link
 * agrees with it or the two columns head different weeks; otherwise the
 * heading's printed dates, when the link agrees with them. Null when
 * nothing settles it.
 */
export function reportedWeek(
  previousHeading: string,
  heading: string,
  year: number,
  linkWeek: number | null,
): string | null {
  const numbered = headingWeek(heading);
  const fromNumber = numbered ? isoWeekEnd(year, numbered) : null;
  const previousNumber = headingWeek(previousHeading);
  const printed = printedWeekEnd(heading, year);
  const fromLink = linkWeek ? isoWeekEnd(year, linkWeek) : null;
  if (fromNumber && fromNumber === fromLink) return fromNumber;
  if (printed && printed === fromLink) return printed;
  // Two columns headed with one week number: the heading was not updated.
  if (numbered && numbered === previousNumber) return fromLink;
  if (fromNumber && fromNumber === printed) return fromNumber;
  return null;
}

function price(cell: unknown): number | null {
  if (typeof cell === "number") return cell;
  // Some weeks are typed as text with a decimal comma, e.g. "25,17".
  const value = text(cell);
  if (/^\d+(,\d+)?$/.test(value)) return Number(value.replace(",", "."));
  return null;
}

export interface WeekPrices {
  /** Sunday ending the week the workbook reports. */
  week: string;
  /** Sunday ending the week its link names, if it names one. */
  linkWeek: string | null;
  /**
   * Its prices. The column for the week before is not read: some
   * workbooks restate an older week there.
   */
  observations: Observation[];
  /** Markets in the table that WineTerm does not import. */
  unknownMarkets: string[];
  /** When the ministry uploaded the workbook; set by the caller. */
  uploadedAt?: string | null;
}

/**
 * The wine market prices of one weekly workbook. `year` is the ISO year
 * of the week the link names, or of the page that lists it; `week` the
 * ISO week its link names, when it names one.
 */
export function weekPrices(
  file: ArrayBuffer,
  year: number,
  week: number | null,
): WeekPrices {
  const table = findTable(file);
  if (!table) throw new Error(`Sheet "${TABLE_SHEET}" does not hold table 2.2`);
  const { rows, titleIndex } = table;

  // The heading row names the market column and two weeks, the earlier
  // first.
  const headerIndex = rows.findIndex(
    (row, index) =>
      index > titleIndex && row.some((cell) => /^mercado representativo$/i.test(text(cell))),
  );
  if (headerIndex === -1) throw new Error("Table 2.2 has no heading row");
  const header = rows[headerIndex];
  const marketColumn = header.findIndex((cell) => /^mercado representativo$/i.test(text(cell)));
  const weekColumns = header
    .map((cell, column) => ({ heading: text(cell), column }))
    .filter(({ heading }) => /^semana\b/i.test(heading));
  if (weekColumns.length !== 2) {
    throw new Error(`Table 2.2 heads ${weekColumns.length} weeks, not two`);
  }
  const [previousColumn, currentColumn] = weekColumns;
  const end = reportedWeek(previousColumn.heading, currentColumn.heading, year, week);
  if (!end) {
    throw new Error(
      `Table 2.2 heads "${previousColumn.heading}" and "${currentColumn.heading}", and its link names week ${week}: no week fits all`,
    );
  }

  const observations: Observation[] = [];
  const unknownMarkets: string[] = [];
  let colour: Colour | null = null;
  const colours = new Set<Colour>();
  for (let index = headerIndex + 1; index < rows.length; index++) {
    const row = rows[index];
    const product = text(row[marketColumn - 1]);
    if (/^vino blanco sin dop/i.test(product)) colour = "WHT";
    else if (/^vino tinto sin dop/i.test(product)) colour = "RED";
    else if (product !== "") break; // The next table, of PDO/PGI wines.
    const market = text(row[marketColumn]);
    if (!colour || market === "" || /puntos de color/i.test(market)) continue;
    if (/subdirecci[oó]n general/i.test(market)) break;
    const code = MARKETS[market];
    const value = price(row[currentColumn.column]);
    if (!code) {
      if (value !== null) unknownMarkets.push(`${market} (${colour})`);
      continue;
    }
    const seriesCode = `ES-${code}-${colour}-NGI`;
    if (!SERIES_CODES.includes(seriesCode)) {
      unknownMarkets.push(`${market} (${colour})`);
      continue;
    }
    colours.add(colour);
    if (value === null) continue;
    if (value < MIN_PRICE || value > MAX_PRICE) {
      throw new Error(`${seriesCode} reads ${value} EUR/hl in the week ending ${end}`);
    }
    observations.push({ series_code: seriesCode, observed_on: end, value });
  }
  if (!colours.has("WHT") || !colours.has("RED")) {
    throw new Error(`Table 2.2 of the week ending ${end} lacks white or red wine`);
  }
  return {
    week: end,
    linkWeek: week ? isoWeekEnd(year, week) : null,
    observations,
    unknownMarkets,
  };
}

/**
 * Where table 2.2 has been in every workbook since it began. Only this
 * sheet is read: that takes a third of the time of reading them all, and
 * Edge Functions have little CPU time. A workbook that moves the table
 * fails its run, naming it, rather than running out of time.
 */
const TABLE_SHEET = "Pág. 12";

/** The rows of TABLE_SHEET and the row of table 2.2's title, if it is there. */
function findTable(file: ArrayBuffer): { rows: unknown[][]; titleIndex: number } | null {
  const workbook = XLSX.read(new Uint8Array(file), {
    type: "array",
    sheets: [TABLE_SHEET],
    cellHTML: false,
    cellText: false,
    cellStyles: false,
    cellNF: false,
  });
  const sheet = workbook.Sheets[TABLE_SHEET];
  if (!sheet) return null;
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    raw: true,
    defval: null,
  });
  const titleIndex = rows.findIndex((row) =>
    row.some((cell) =>
      /^2\.2\.?\s*precios (medios )?en mercados representativos de vinos/i.test(text(cell))
    )
  );
  return titleIndex === -1 ? null : { rows, titleIndex };
}

function sameValues(a: WeekPrices, b: WeekPrices): boolean {
  const values = (report: WeekPrices) =>
    report.observations
      .map((row) => `${row.series_code} ${row.value.toFixed(2)}`)
      .sort()
      .join();
  return values(a) === values(b);
}

/**
 * One report per week from a year's workbooks. A workbook whose link
 * names the week it reports holds that week. Another that reports a week
 * already held is a copy when its prices are the same, and otherwise a
 * workbook whose headings were not updated, which then holds the week
 * its link names. Notes say what was moved or left out.
 */
export function settleWeeks(reports: WeekPrices[]): {
  observations: Observation[];
  /** When the workbook holding each week was uploaded, by week. */
  uploads: Map<string, string | null>;
  notes: string[];
} {
  const held = new Map<string, WeekPrices>();
  for (const report of reports) {
    if (report.linkWeek === report.week && !held.has(report.week)) {
      held.set(report.week, report);
    }
  }
  const notes: string[] = [];
  const others = reports
    .filter((report) => held.get(report.week) !== report)
    .sort((a, b) => a.week.localeCompare(b.week));
  for (const report of others) {
    let week = report.week;
    const holder = held.get(week);
    if (holder) {
      if (sameValues(holder, report)) continue;
      if (!report.linkWeek || held.has(report.linkWeek)) {
        notes.push(`A second, different report of the week ending ${week} was left out.`);
        continue;
      }
      week = report.linkWeek;
      notes.push(`A report headed with the week ending ${report.week} was taken as its link's week ending ${week}.`);
    }
    held.set(week, {
      ...report,
      week,
      observations: report.observations.map((row) => ({ ...row, observed_on: week })),
    });
  }
  return {
    observations: [...held.values()].flatMap((report) => report.observations),
    uploads: new Map(
      [...held.entries()].map(([week, report]) => [week, report.uploadedAt ?? null]),
    ),
    notes,
  };
}
