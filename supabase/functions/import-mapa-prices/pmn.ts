/**
 * MAPA, Precios Medios Nacionales: the Spanish Ministry of Agriculture's
 * weekly national average prices of agricultural products, one workbook
 * per year. WineTerm reads its two wine rows. No database access here.
 */

import * as XLSX from "npm:xlsx@0.18.5";

export const SOURCE_ID = "mapa-pmn";
const PAGE =
  "https://www.mapa.gob.es/es/estadistica/temas/estadisticas-agrarias/economia/precios-medios-nacionales";
const TIMEOUT_MS = 60_000;
/** First year the ministry publishes as a workbook on the page. */
export const FIRST_YEAR = 2019;

/** The rows WineTerm imports, found by the label that opens them. */
export const SERIES = [
  { code: "ES-NAT-WHT-NGI", label: /^Vino blanco sin DOP\/IGP\b/i },
  { code: "ES-NAT-RED-NGI", label: /^Vino tinto sin DOP\/IGP\b/i },
] as const;

/**
 * Bounds of a plausible national average in EUR/hl. A value outside them
 * means the workbook changed shape, not that the market moved.
 */
const MIN_PRICE = 5;
const MAX_PRICE = 500;

export interface Observation {
  series_code: string;
  /** Sunday that ends the price's week, e.g. "2026-09-20". */
  observed_on: string;
  /** EUR/hl, as published. */
  value: number;
}

function text(value: unknown): string {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
}

/**
 * The workbook link for a year, or null when the page does not list one.
 * The link reads "Precios Medios Nacionales 2026"; its file name changes
 * as weeks are added, so it is looked up on every run.
 */
export async function workbookUrl(year: number): Promise<string | null> {
  const response = await fetch(PAGE, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!response.ok) {
    throw new Error(`MAPA answered ${response.status} for the price page`);
  }
  const html = await response.text();
  for (const [, href, inner] of html.matchAll(
    /<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi,
  )) {
    const label = text(inner.replace(/<[^>]+>/g, " "));
    if (
      label.toLowerCase() === `precios medios nacionales ${year}` &&
      /\.xlsx$/i.test(href)
    ) {
      return new URL(href, PAGE).toString();
    }
  }
  return null;
}

export interface Workbook {
  file: ArrayBuffer;
  /**
   * When the ministry uploaded the file, from its Last-Modified header.
   * The current year's workbook is replaced every week, so for it this is
   * when the latest week was published.
   */
  uploadedAt: string | null;
}

export async function fetchWorkbook(url: string): Promise<Workbook> {
  const response = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!response.ok) {
    throw new Error(`MAPA answered ${response.status} for ${url}`);
  }
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
  const sunday = new Date(firstMonday + ((week - 1) * 7 + 6) * 86_400_000);
  return sunday.toISOString().slice(0, 10);
}

function price(cell: unknown): number | null {
  if (typeof cell === "number") return cell;
  // Some weeks are typed as text with a decimal comma, e.g. "50,32".
  const value = text(cell);
  if (/^\d+(,\d+)?$/.test(value)) return Number(value.replace(",", "."));
  return null;
}

/** The wine prices of one year's workbook, one per series and week. */
export function observations(file: ArrayBuffer, year: number): Observation[] {
  const workbook = XLSX.read(new Uint8Array(file), { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    raw: true,
    defval: null,
  });

  const headerIndex = rows.findIndex((row) =>
    row.some((cell) => /^Semana 0?1$/i.test(text(cell)))
  );
  if (headerIndex === -1) {
    throw new Error(`The ${year} workbook has no week header`);
  }
  const header = rows[headerIndex];
  const ranges = rows[headerIndex + 1] ?? [];

  // Week columns, dated by ISO week. The printed range under each week is
  // typed by hand ("29/12- 04/01", "02-08/01", "25/02-3-03"), so it only
  // has to name that week's Monday or Sunday somewhere; a shifted column
  // would name neither.
  const weeks: { column: number; end: string }[] = [];
  header.forEach((cell, column) => {
    const match = text(cell).match(/^Semana (\d{1,2})$/i);
    if (!match) return;
    const end = isoWeekEnd(year, Number(match[1]));
    const start = new Date(Date.parse(end) - 6 * 86_400_000).toISOString();
    const printed = [...text(ranges[column]).matchAll(/(\d{1,2}) ?\/ ?(\d{1,2})/g)];
    const names = (date: string) =>
      printed.some(
        ([, day, month]) =>
          Number(day) === Number(date.slice(8, 10)) &&
          Number(month) === Number(date.slice(5, 7)),
      );
    if (printed.length > 0 && !names(start) && !names(end)) {
      throw new Error(
        `${year} week ${match[1]} reads "${text(ranges[column])}", not the week ending ${end}`,
      );
    }
    weeks.push({ column, end });
  });
  if (weeks.length === 0) throw new Error(`The ${year} workbook lists no weeks`);

  const result: Observation[] = [];
  for (const { code, label } of SERIES) {
    const row = rows.find((cells) => cells.some((cell) => label.test(text(cell))));
    if (!row) throw new Error(`The ${year} workbook has no row for ${code}`);
    for (const { column, end } of weeks) {
      const value = price(row[column]);
      if (value === null) continue;
      if (value < MIN_PRICE || value > MAX_PRICE) {
        throw new Error(`${code} reads ${value} EUR/hl in the week ending ${end}`);
      }
      result.push({ series_code: code, observed_on: end, value });
    }
  }
  return result;
}
