/**
 * IVV, declarações de existências: the wine and must that Portuguese
 * operators declare to the wine institute at 31 July each year, which the
 * institute publishes as a series workbook of the national totals by
 * category and colour, one file for the last six years, kept among its
 * documents. WineTerm reads the totals of every year it carries. No
 * database access here.
 */

import * as XLSX from "npm:xlsx@0.18.5";

export const SOURCE_ID = "ivv-existencias";
const SITEMAP_URL = "https://www.ivv.gov.pt/documentos-sitemap.xml";
/** The institute's site answers slowly to some requests. */
const TIMEOUT_MS = 120_000;
/** The site stalls requests without a browser's headers. */
const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36 WineTerm/1.0",
  Accept: "*/*",
  "Accept-Language": "pt-PT,pt;q=0.9,en;q=0.8",
};

/**
 * Bounds of a plausible national total in hl. A value outside them means
 * the workbook changed shape, not that the market moved.
 */
const MIN_TOTAL_HL = 5_000_000;
const MAX_TOTAL_HL = 30_000_000;

export type Product =
  | "wine-and-must"
  | "wine-pdo"
  | "wine-pdo-liqueur"
  | "wine-pgi"
  | "wine-varietal"
  | "wine-other";
export type Colour = "white" | "rose" | "red" | "all";

export interface Figure {
  /** The first day of July of the year the stocks are declared at 31 July. */
  period: string;
  measure: "closing-stocks";
  product: Product;
  colour: Colour;
  presentation: "all";
  holder: "all";
  volume_hl: number;
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

/** A response from the institute's site, naming the address when it fails or stalls. */
async function fetchFromSite(url: string): Promise<Response> {
  let response: Response;
  try {
    response = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(TIMEOUT_MS) });
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new Error(`Fetching ${url} failed: ${reason}`);
  }
  if (!response.ok) {
    throw new Error(`The IVV site answered ${response.status} for ${url}`);
  }
  return response;
}

async function fetchText(url: string): Promise<string> {
  return await (await fetchFromSite(url)).text();
}

/**
 * The page of the latest stock series among the institute's documents,
 * named "existencias-serie-<first year>-a-<last year>", or null when the
 * sitemap lists none.
 */
export function seriesPageInSitemap(xml: string): string | null {
  const pages = [
    ...xml.matchAll(
      /<loc>\s*(https:\/\/www\.ivv\.gov\.pt\/documentos\/existencias-serie-(\d{4})-a-(\d{4})\/?)\s*<\/loc>/g,
    ),
  ]
    .map((match) => ({ url: match[1], lastYear: Number(match[3]) }))
    .sort((a, b) => b.lastYear - a.lastYear);
  return pages[0]?.url ?? null;
}

export async function seriesPageUrl(): Promise<string | null> {
  return seriesPageInSitemap(await fetchText(SITEMAP_URL));
}

/** The workbook a document page links, or null when it links none. */
export function workbookInPage(html: string, pageUrl: string): string | null {
  const match = html.match(/href="([^"]+\.xlsx)"/i);
  return match ? new URL(match[1].replace(/&amp;/g, "&"), pageUrl).toString() : null;
}

const PORTUGUESE_MONTHS = [
  "janeiro",
  "fevereiro",
  "marco",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

/** The day a document page gives after its date label, "Data: 30 de Março de 2025". */
export function dateInPage(html: string): string | null {
  const text = plain(html.replace(/<[^>]+>/g, " "));
  const match = text.match(/\bdata: (\d{1,2}) de ([a-z]+) de (\d{4})\b/);
  if (!match) return null;
  const month = PORTUGUESE_MONTHS.indexOf(match[2]);
  if (month === -1) return null;
  return `${match[3]}-${String(month + 1).padStart(2, "0")}-${match[1].padStart(2, "0")}`;
}

export async function seriesWorkbook(
  pageUrl: string,
): Promise<{ url: string; publishedOn: string | null } | null> {
  const html = await fetchText(pageUrl);
  const url = workbookInPage(html, pageUrl);
  return url ? { url, publishedOn: dateInPage(html) } : null;
}

export interface Download {
  file: ArrayBuffer;
  /** When the institute uploaded the file, from its Last-Modified header. */
  uploadedAt: string | null;
}

export async function fetchWorkbook(url: string): Promise<Download> {
  const response = await fetchFromSite(url);
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

/** A cell's figure, with an empty cell standing for none. */
function volume(cell: unknown, what: string): number {
  if (cell === null || cell === undefined || cell === "") return 0;
  if (!isNumber(cell)) throw new Error(`${what} is "${cell}", not a figure`);
  return cell;
}

/** Fails unless the parts add up to the total the institute printed. */
function expectSum(parts: number[], total: number, what: string): void {
  const sum = parts.reduce((a, b) => a + b, 0);
  if (Math.abs(sum - total) > 1) {
    throw new Error(`${what}: the parts add up to ${sum} hl, the sheet says ${total}`);
  }
}

const CATEGORIES: Record<string, Product> = {
  dop: "wine-pdo",
  "licoroso dop": "wine-pdo-liqueur",
  igp: "wine-pgi",
  "ano/casta": "wine-varietal",
  "sem certificacao": "wine-other",
};

const COLOUR_WORDS: Record<string, Exclude<Colour, "all">> = {
  tinto: "red",
  rosado: "rose",
  branco: "white",
};

function figure(product: Product, colour: Colour, volumeHl: number, period: string): Figure {
  return {
    period,
    measure: "closing-stocks",
    product,
    colour,
    presentation: "all",
    holder: "all",
    volume_hl: Math.round(volumeHl * 100) / 100,
  };
}

/**
 * The national stocks at 31 July of every year the series workbook
 * carries, by category and colour, from its first table.
 */
export function figures(file: ArrayBuffer): { figures: Figure[]; years: number[] } {
  const workbook = XLSX.read(new Uint8Array(file), { type: "array" });
  const name = workbook.SheetNames.find((n) => n.trim() === "1");
  if (!name) throw new Error("The series workbook has no sheet 1");
  const rows = XLSX.utils.sheet_to_json<Row>(workbook.Sheets[name], {
    header: 1,
    raw: true,
    defval: null,
  });
  const label = "The stock series, table 1";

  // The header names each year's four columns: three colours and the
  // total. One year is typed with a space before it, "31-07- 2020".
  const heading = /^existencias a 31-07- ?(\d{4})/;
  const header = rows.findIndex((row) => row.some((cell) => heading.test(plain(cell))));
  if (header === -1) throw new Error(`${label} has no year headings`);
  const years = rows[header].flatMap((cell, column) => {
    const match = plain(cell).match(heading);
    return match ? [{ year: Number(match[1]), column }] : [];
  });
  const colourRow = rows[header + 1];
  for (const { year, column } of years) {
    const words = colourRow.slice(column, column + 4).map(plain);
    if (words.slice(0, 3).some((word) => !(word in COLOUR_WORDS)) || words[3] !== "total") {
      throw new Error(`${label} does not name the colours and the total for ${year}`);
    }
  }

  const found: Figure[] = [];
  for (const { year, column } of years) {
    const period = `${year}-07-01`;
    const colours = colourRow.slice(column, column + 3).map((cell) => COLOUR_WORDS[plain(cell)]);
    const categories = new Map<Product, number[]>();
    let total: number | null = null;
    for (let r = header + 2; r < rows.length; r++) {
      const row = rows[r];
      const category = plain(row[0]);
      if (!(category in CATEGORIES) && category !== "total") continue;
      const values = row
        .slice(column, column + 4)
        .map((cell, index) => volume(cell, `${label}, ${year}, row ${r + 1}, column ${column + index + 1}`));
      if (category === "total") {
        total = values[3];
        break;
      }
      // Each category's colours add up to its total; the total row's
      // colour cells are not checked, since the institute's 2024 white
      // total misses a category, while its overall total is right.
      expectSum(values.slice(0, 3), values[3], `${label}, ${year}, row ${r + 1}`);
      categories.set(CATEGORIES[category], values);
    }
    if (total === null) throw new Error(`${label} has no total row for ${year}`);
    if (categories.size !== Object.keys(CATEGORIES).length) {
      throw new Error(`${label} lists ${categories.size} categories for ${year}`);
    }
    expectSum(
      [...categories.values()].map((values) => values[3]),
      total,
      `${label}, ${year}, categories`,
    );
    if (total < MIN_TOTAL_HL || total > MAX_TOTAL_HL) {
      throw new Error(`${label} reads ${total} hl for ${year}`);
    }
    for (const [product, values] of categories) {
      colours.forEach((colour, i) => found.push(figure(product, colour, values[i], period)));
    }
    found.push(figure("wine-and-must", "all", total, period));
  }
  return { figures: found, years: years.map(({ year }) => year).sort() };
}
