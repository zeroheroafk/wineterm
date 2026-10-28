/**
 * ICQRF, Cantina Italia: the report of the wine, must and new wine held in
 * Italy by the operators that keep the telematic wine register, which the
 * Ministry of Agriculture (MASAF) publishes after the end of each month
 * with a spreadsheet of the figures by region and province. WineTerm
 * reads the national totals: wine with a PDO and with a PGI by colour,
 * varietal wine, other wine, must that is not concentrated, concentrated
 * must, rectified concentrated must and new wine still in fermentation.
 * No database access here.
 */

import * as XLSX from "npm:xlsx@0.18.5";

export const SOURCE_ID = "icqrf-cantina-italia";
const LISTING_URL =
  "https://www.masaf.gov.it/flex/cm/pages/ServeBLOB.php/L/IT/IDPagina/7817";
const TIMEOUT_MS = 60_000;
/**
 * First closing month whose report carries the spreadsheet in its
 * current layout: the bulletins up to the autumn of 2018 lay the figures
 * out in other sheets, which are not read.
 */
export const FIRST_MONTH = "2018-12";

const MONTHS = [
  "gennaio",
  "febbraio",
  "marzo",
  "aprile",
  "maggio",
  "giugno",
  "luglio",
  "agosto",
  "settembre",
  "ottobre",
  "novembre",
  "dicembre",
];

/**
 * Bounds of a plausible national total in hl. A value outside them means
 * the spreadsheet changed shape, not that the market moved.
 */
const MIN_WINE_HL = 20_000_000;
const MAX_HL = 100_000_000;
/** The regions a sheet lists; a sheet with fewer has changed shape. */
const REGIONS = 20;

export type Product =
  | "wine"
  | "wine-pdo"
  | "wine-pgi"
  | "wine-varietal"
  | "wine-other"
  | "must"
  | "must-concentrated"
  | "must-rcgm"
  | "new-wine";

export type Colour = "white" | "rose" | "red" | "all";

export interface Figure {
  /** First day of the month whose closing stocks the figure gives. */
  period: string;
  measure: "closing-stocks";
  product: Product;
  colour: Colour;
  presentation: "all";
  holder: "all";
  volume_hl: number;
}

/** One report as the ministry's listing names it. */
export interface Report {
  /** The report's page, which links its spreadsheet. */
  pageUrl: string;
  /** The day the stocks are counted at, e.g. "2026-01-31". */
  referenceDate: string;
  /** The day the listing gives for the report, e.g. "2026-02-09". */
  publishedOn: string | null;
  title: string;
}

/** Lower case, without accents or repeated spaces, for matching labels. */
function plain(value: unknown): string {
  return typeof value === "string"
    ? value
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase()
    : "";
}

async function fetchText(url: string): Promise<string> {
  const response = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!response.ok) {
    throw new Error(`MASAF answered ${response.status} for ${url}`);
  }
  return await response.text();
}

/** "dati al 31 gennaio 2026" or "dati al 15/12/2018" to an ISO date. */
function referenceDate(title: string): string | null {
  const words = title.match(/\bal (\d{1,2}) ([a-z]+) (\d{4})\b/);
  if (words) {
    const month = MONTHS.indexOf(words[2]);
    if (month === -1) return null;
    return `${words[3]}-${String(month + 1).padStart(2, "0")}-${words[1].padStart(2, "0")}`;
  }
  const digits = title.match(/\bal (\d{1,2})\/(\d{1,2})\/(\d{4})\b/);
  return digits
    ? `${digits[3]}-${digits[2].padStart(2, "0")}-${digits[1].padStart(2, "0")}`
    : null;
}

/**
 * The Cantina Italia reports a listing page names, newest first. Each
 * entry shows its publication date above a link to the report's page,
 * whose text dates the figures: "Report n. 2/2026; dati al 31 gennaio
 * 2026 ...". Entries on other subjects, such as the olive oil report, are
 * left out, as is a report whose title does not date its figures.
 */
export function reportsInListing(html: string): Report[] {
  const reports: Report[] = [];
  let publishedOn: string | null = null;
  const tokens = html.matchAll(
    /<span class="u-text-s[^"]*">\s*(\d{2})\/(\d{2})\/(\d{4})\s*<\/span>|<a class="u-textClean[^"]*" href="([^"]+\/IDPagina\/\d+)">([\s\S]*?)<\/a>/g,
  );
  for (const token of tokens) {
    if (token[1]) {
      publishedOn = `${token[3]}-${token[2]}-${token[1]}`;
      continue;
    }
    const title = plain(token[5].replace(/<[^>]+>/g, " "));
    if (!title.includes("cantina italia")) continue;
    const date = referenceDate(title);
    if (date) {
      reports.push({ pageUrl: token[4], referenceDate: date, publishedOn, title });
    }
    publishedOn = null;
  }
  return reports;
}

/** The reports the ministry listed in a year: the year they were published. */
export async function listReports(year: number): Promise<Report[]> {
  return reportsInListing(await fetchText(`${LISTING_URL}?YY=${year}`));
}

/**
 * The month whose closing stocks a report gives: a report dated the 28th
 * or later counts its month; one dated the 1st, as the bulletins of 2018
 * and 2019 often were, the month before; a mid-month report none.
 */
export function closingMonth(referenceDate: string): string | null {
  const day = Number(referenceDate.slice(8, 10));
  if (day >= 28) return referenceDate.slice(0, 7);
  if (day === 1) {
    const date = new Date(`${referenceDate}T00:00:00Z`);
    date.setUTCDate(0);
    return date.toISOString().slice(0, 7);
  }
  return null;
}

/**
 * The year of the listing that names the report closing a month: the
 * ministry lists the reports by the year they came out, and December's
 * comes out the next January.
 */
export function listingYear(closingMonth: string): number {
  const [year, month] = closingMonth.split("-").map(Number);
  return month === 12 ? year + 1 : year;
}

/**
 * The report closing a month ("2024-03"): the latest dated within the
 * month, failing that the one dated the first day after it; null when
 * the listing names none, as for most Augusts.
 */
export function reportClosing(reports: Report[], month: string): Report | null {
  const rank = (report: Report) => {
    const day = Number(report.referenceDate.slice(8, 10));
    return day === 1 ? 0 : day;
  };
  let chosen: Report | null = null;
  for (const report of reports) {
    if (closingMonth(report.referenceDate) !== month) continue;
    if (!chosen || rank(report) > rank(chosen)) chosen = report;
  }
  return chosen;
}

/** The spreadsheet a report's page links, or null when it has none. */
export async function spreadsheetUrl(pageUrl: string): Promise<string | null> {
  const html = await fetchText(pageUrl);
  const match = html.match(/href="([^"]*ServeAttachment\.php[^"]*\/E\/ods\b[^"]*)"/);
  return match ? new URL(match[1].replace(/&amp;/g, "&"), pageUrl).toString() : null;
}

export interface Download {
  file: ArrayBuffer;
  /** When the ministry uploaded the file, from its Last-Modified header. */
  uploadedAt: string | null;
}

export async function fetchSpreadsheet(url: string): Promise<Download> {
  const response = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!response.ok) {
    throw new Error(`MASAF answered ${response.status} for ${url}`);
  }
  const uploaded = Date.parse(response.headers.get("last-modified") ?? "");
  return {
    file: await response.arrayBuffer(),
    uploadedAt: Number.isNaN(uploaded) ? null : new Date(uploaded).toISOString(),
  };
}

type Row = unknown[];

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function sheetRows(workbook: XLSX.WorkBook, pattern: RegExp, label: string): Row[] {
  const name = workbook.SheetNames.find((n) => pattern.test(n.trim()));
  if (!name) throw new Error(`${label} has no sheet matching ${pattern}`);
  return XLSX.utils.sheet_to_json<Row>(workbook.Sheets[name], {
    header: 1,
    raw: true,
    defval: null,
  });
}

/** Patterns a sheet title dates its figures with: "al 31 gennaio 2026" or "al 31/01/2026". */
function datePatterns(isoDate: string): RegExp[] {
  const [year, month, day] = isoDate.split("-");
  return [
    new RegExp(`\\bal ${Number(day)} ${MONTHS[Number(month) - 1]} ${year}\\b`),
    new RegExp(`\\bal 0?${Number(day)}/0?${Number(month)}/${year}\\b`),
  ];
}

/**
 * Fails unless a sheet's title dates its figures to the report's day. A
 * report dated the 1st may title its sheets with the day before, the
 * month's end, as the bulletin of 1 November 2019 does.
 */
function expectDate(rows: Row[], referenceDate: string, label: string): void {
  const accepted = datePatterns(referenceDate);
  if (referenceDate.endsWith("-01")) {
    const before = new Date(`${referenceDate}T00:00:00Z`);
    before.setUTCDate(0);
    accepted.push(...datePatterns(before.toISOString().slice(0, 10)));
  }
  const title = rows
    .flat()
    .map(plain)
    .find((text) => text.includes("presenti in italia al")) ?? "";
  if (!accepted.some((pattern) => pattern.test(title))) {
    throw new Error(`${label} is titled "${title}", not ${referenceDate}`);
  }
}

/**
 * Fails unless a row of the sheet carries the headings in this order,
 * one per non-empty cell, so that the columns are read as expected.
 */
function expectHeadings(rows: Row[], patterns: RegExp[], label: string): void {
  const found = rows.some((row) => {
    const texts = row.map(plain).filter((text) => text !== "");
    return texts.some((_, start) =>
      patterns.every((pattern, index) => pattern.test(texts[start + index] ?? ""))
    );
  });
  if (!found) {
    throw new Error(`${label} has no heading row matching ${patterns.join(", ")}`);
  }
}

/** Fails unless the parts add up to the total the ministry printed. */
function expectSum(parts: number[], total: number, what: string): void {
  const sum = parts.reduce((a, b) => a + b, 0);
  if (Math.abs(sum - total) > 1) {
    throw new Error(`${what}: the parts add up to ${sum} hl, the sheet says ${total}`);
  }
}

/**
 * A sheet's national total: the row without a region or province, or
 * labelled as the total, carrying `width` figures. The regions (named in
 * capitals; their provinces are two-letter codes) must add up to it.
 */
function nationalTotal(rows: Row[], width: number, label: string): number[] {
  const regions: number[][] = [];
  let total: number[] | null = null;
  for (const row of rows) {
    const cells = row.slice(1, 1 + width);
    if (!cells.some(isNumber)) continue;
    const values = cells.map((cell) => (cell === null || cell === "" ? 0 : cell));
    if (!values.every(isNumber)) continue;
    const name = typeof row[0] === "string" ? row[0].trim() : "";
    if (name === "" || plain(name).startsWith("totale")) {
      total = values;
    } else if (name.length > 2 && name === name.toUpperCase()) {
      regions.push(values);
    }
  }
  if (!total) throw new Error(`${label} has no total row`);
  if (regions.length < REGIONS) {
    throw new Error(`${label} lists ${regions.length} regions, not ${REGIONS}`);
  }
  total.forEach((value, column) => {
    expectSum(regions.map((region) => region[column]), value, `${label}, column ${column + 2}`);
  });
  return total;
}

function figure(product: Product, colour: Colour, volume: number, period: string): Figure {
  return {
    period,
    measure: "closing-stocks",
    product,
    colour,
    presentation: "all",
    holder: "all",
    volume_hl: Math.round(volume * 100) / 100,
  };
}

/**
 * More rows than the sheets read have, so that a longer one, such as the
 * 500 denominations, is cut there rather than parsed whole.
 */
const MAX_ROWS = 400;

/** The national stocks of one report's spreadsheet, as the month's closing stocks. */
export function figures(file: ArrayBuffer, referenceDate: string, period: string): Figure[] {
  // Parsed once, densely and no further down than the tables reach:
  // SheetJS reads an ODS file whole whatever sheets are asked for, so
  // a second pass, even for the sheet names, costs as much again, and
  // the function's CPU time is short.
  const workbook = XLSX.read(new Uint8Array(file), {
    type: "array",
    dense: true,
    sheetRows: MAX_ROWS,
  });
  const label = `The report of ${referenceDate}`;

  // Wine with a PDO and with a PGI, by colour, with their totals.
  const gi = sheetRows(workbook, /^vino_do-ig$/i, label);
  const giLabel = `${label}, DOP-IGP sheet`;
  expectDate(gi, referenceDate, giLabel);
  expectHeadings(
    gi,
    [/^bianco$/, /^rosato$/, /^rosso$/, /^totale dop/, /^bianco$/, /^rosato$/, /^rosso$/, /^totale igp/],
    giLabel,
  );
  const [pdoWhite, pdoRose, pdoRed, pdo, pgiWhite, pgiRose, pgiRed, pgi] = nationalTotal(
    gi,
    8,
    giLabel,
  );
  expectSum([pdoWhite, pdoRose, pdoRed], pdo, `${giLabel}, DOP`);
  expectSum([pgiWhite, pgiRose, pgiRed], pgi, `${giLabel}, IGP`);

  // Other wine without a PDO or PGI, and varietal wine.
  const plainWine = sheetRows(workbook, /^vini_varietali/i, label);
  const plainLabel = `${label}, varietal and other wine sheet`;
  expectDate(plainWine, referenceDate, plainLabel);
  expectHeadings(plainWine, [/^altri vini/, /^varietali/, /^totale/], plainLabel);
  const [other, varietal, plainTotal] = nationalTotal(plainWine, 3, plainLabel);
  expectSum([other, varietal], plainTotal, plainLabel);

  // Must that is not concentrated, concentrated must, rectified
  // concentrated must and new wine still in fermentation.
  // The sheet was named "Mosti_" in 2019.
  const musts = sheetRows(workbook, /^mosti/i, label);
  const mustLabel = `${label}, must sheet`;
  expectDate(musts, referenceDate, mustLabel);
  expectHeadings(
    musts,
    [/^altri mosti/, /^mosto di uve concentrato in/, /^mosto di uve concentrato rettificato/, /^vino nuovo/],
    mustLabel,
  );
  const [must, concentrated, rectified, newWine] = nationalTotal(musts, 4, mustLabel);

  const wine = pdo + pgi + varietal + other;
  if (wine < MIN_WINE_HL || wine > MAX_HL) {
    throw new Error(`${label} reads ${wine} hl of wine`);
  }
  if (must + concentrated + rectified + newWine > MAX_HL) {
    throw new Error(`${label} reads ${must + concentrated + rectified + newWine} hl of must`);
  }

  return [
    figure("wine-pdo", "white", pdoWhite, period),
    figure("wine-pdo", "rose", pdoRose, period),
    figure("wine-pdo", "red", pdoRed, period),
    figure("wine-pgi", "white", pgiWhite, period),
    figure("wine-pgi", "rose", pgiRose, period),
    figure("wine-pgi", "red", pgiRed, period),
    figure("wine-varietal", "all", varietal, period),
    figure("wine-other", "all", other, period),
    figure("wine", "all", wine, period),
    figure("must", "all", must, period),
    figure("must-concentrated", "all", concentrated, period),
    figure("must-rcgm", "all", rectified, period),
    figure("new-wine", "all", newWine, period),
  ];
}
