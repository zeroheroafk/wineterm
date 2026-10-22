/**
 * DGDDI, stock declarations: the wine that French producers and traders
 * declare to customs at the end of each campaign, held at 31 July, which
 * the customs publish as open data: one workbook per campaign with the
 * producers' stocks by department, category and colour and the traders'
 * stocks by category and colour. WineTerm reads the national totals of
 * both. No database access here.
 */

import * as XLSX from "npm:xlsx@0.18.5";

export const SOURCE_ID = "douane-stocks";
const SITE = "https://www.douane.gouv.fr";
/** The "stocks de vins" category of the open data, five publications a page. */
const CATEGORY_PAGE = (page: number) =>
  `${SITE}/la-douane/opendata?f%5B0%5D=categorie_opendata_facet%3A468&page=${page}`;
const MAX_PAGES = 12;
const TIMEOUT_MS = 60_000;
/** First campaign whose workbook carries both the producers' and the traders' stocks. */
export const FIRST_CAMPAIGN = 2017;

const FRENCH_MONTHS = [
  "janvier",
  "fevrier",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "aout",
  "septembre",
  "octobre",
  "novembre",
  "decembre",
];

/**
 * Bounds of a plausible national total in hl. A value outside them means
 * the workbook changed shape, not that the market moved.
 */
const MIN_HOLDER_HL = 5_000_000;
const MAX_HOLDER_HL = 60_000_000;

export type Product = "wine" | "wine-pdo" | "wine-pgi" | "wine-other" | "wine-third-country";
export type Colour = "white" | "rose" | "red" | "all";
export type Holder = "producers" | "traders";

export interface Figure {
  /** The first day of July of the year the stocks are declared at 31 July. */
  period: string;
  measure: "closing-stocks";
  product: Product;
  colour: Colour;
  presentation: "all";
  holder: Holder;
  volume_hl: number;
}

/** One campaign's stock statement, as the open data listing offers it. */
export interface Publication {
  /** The year the campaign began, e.g. 2025 for 2025/2026. */
  campaignStart: number;
  title: string;
  fileUrl: string;
  /** The day the listing gives for the publication, e.g. "2026-10-15". */
  publishedOn: string | null;
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
    throw new Error(`The customs site answered ${response.status} for ${url}`);
  }
  return await response.text();
}

/** "Jeudi 15 octobre 2026" to "2026-10-15". */
function frenchDate(text: string | undefined): string | null {
  const match = plain(text).match(/(\d{1,2}) ([a-z]+) (\d{4})/);
  if (!match) return null;
  const month = FRENCH_MONTHS.indexOf(match[2]);
  if (month === -1) return null;
  return `${match[3]}-${String(month + 1).padStart(2, "0")}-${match[1].padStart(2, "0")}`;
}

/**
 * The stock statements a listing page offers: the publications titled
 * "Relevé des volumes des stocks de vins déclarés par les viticulteurs à
 * l'expiration de la campagne", one workbook each. The listing's other
 * publications, the producers' stocks by product, are left out.
 */
export function publicationsInListing(html: string): Publication[] {
  const publications: Publication[] = [];
  for (const card of html.split('<div class="card">').slice(1)) {
    const heading = card.match(/<h3[^>]*>([\s\S]*?)<\/h3>/);
    const title = plain((heading?.[1] ?? "").replace(/<[^>]+>/g, " "));
    const campaign = title.match(
      /^(\d{4})\/(\d{4}) - releve des volumes des stocks de vins declares par les viticulteurs/,
    );
    if (!campaign) continue;
    const file = card.match(/href="([^"]+\.xlsx?)"/i);
    if (!file) continue;
    const published = card.match(/Publié le\s*:?\s*<\/dt>\s*<dd[^>]*>([^<]+)<\/dd>/);
    publications.push({
      campaignStart: Number(campaign[1]),
      title,
      fileUrl: new URL(file[1].replace(/&amp;/g, "&"), SITE).toString(),
      publishedOn: frenchDate(published?.[1]),
    });
  }
  return publications;
}

/** How many publications a listing page shows, matching or not. */
function cardsInListing(html: string): number {
  return html.split('<div class="card">').length - 1;
}

/**
 * Every campaign's stock statement from the first one onward, newest
 * publication first where a campaign was published twice.
 */
export async function listPublications(): Promise<Publication[]> {
  const found = new Map<number, Publication>();
  for (let page = 0; page < MAX_PAGES; page++) {
    const html = await fetchText(CATEGORY_PAGE(page));
    if (cardsInListing(html) === 0) break;
    for (const publication of publicationsInListing(html)) {
      if (publication.campaignStart >= FIRST_CAMPAIGN && !found.has(publication.campaignStart)) {
        found.set(publication.campaignStart, publication);
      }
    }
  }
  return [...found.values()].sort((a, b) => a.campaignStart - b.campaignStart);
}

export interface Download {
  file: ArrayBuffer;
  /** When the customs uploaded the file, from its Last-Modified header. */
  uploadedAt: string | null;
}

export async function fetchWorkbook(url: string): Promise<Download> {
  const response = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!response.ok) {
    throw new Error(`The customs site answered ${response.status} for ${url}`);
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

/** A cell's figure, with an empty cell standing for none. */
function volume(cell: unknown, what: string): number {
  if (cell === null || cell === undefined || cell === "") return 0;
  if (!isNumber(cell)) throw new Error(`${what} is "${cell}", not a figure`);
  return cell;
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

/** Fails unless a cell of the sheet carries the expected title. */
function expectTitle(rows: Row[], pattern: RegExp, label: string): void {
  if (!rows.flat().map(plain).some((text) => pattern.test(text))) {
    throw new Error(`${label} has no title matching ${pattern}`);
  }
}

/**
 * Fails unless the parts add up to the total the customs printed, within
 * one hl or 0.01%: the 2023/2024 statement's TOTAL row is 94 hl short of
 * its parts, a rounding of the customs' own, while a misread column would
 * be off by millions.
 */
function expectSum(parts: number[], total: number, what: string): void {
  const sum = parts.reduce((a, b) => a + b, 0);
  if (Math.abs(sum - total) > Math.max(1, Math.abs(total) / 10_000)) {
    throw new Error(`${what}: the parts add up to ${sum} hl, the sheet says ${total}`);
  }
}

const COLOUR_WORDS: Record<string, Exclude<Colour, "all">> = {
  blanc: "white",
  rose: "rose",
  rouge: "red",
};

/** The three colours a header row names from a column, in its order. */
function colourOrder(row: Row, column: number, label: string): Exclude<Colour, "all">[] {
  const colours = row.slice(column, column + 3).map((cell) => COLOUR_WORDS[plain(cell)]);
  if (new Set(colours).size !== 3 || colours.includes(undefined)) {
    throw new Error(`${label} does not name the three colours in columns ${column + 1} to ${column + 3}`);
  }
  return colours as Exclude<Colour, "all">[];
}

function figure(
  holder: Holder,
  product: Product,
  colour: Colour,
  volumeHl: number,
  period: string,
): Figure {
  return {
    period,
    measure: "closing-stocks",
    product,
    colour,
    presentation: "all",
    holder,
    volume_hl: Math.round(volumeHl * 100) / 100,
  };
}

/** The producers' national stocks by category and colour, from the department table. */
function producerFigures(rows: Row[], year: number, period: string, label: string): Figure[] {
  expectTitle(
    rows,
    new RegExp(`^stocks de vins a la production au 31 juillet ${year}$`),
    label,
  );
  // The header names the categories over three colour columns each, then
  // the totals; the row below names the colours.
  let header = -1;
  let first = -1;
  for (let r = 0; r < rows.length && header === -1; r++) {
    const column = rows[r].findIndex((cell) => plain(cell) === "aop");
    if (column !== -1) {
      header = r;
      first = column;
    }
  }
  if (header === -1) throw new Error(`${label} has no AOP column`);
  const headings = ["igp avec cepage", "igp sans cepage", "vsig avec cepage", "vsig sans cepage", "totaux"];
  headings.forEach((heading, index) => {
    const column = first + 3 * (index + 1);
    if (plain(rows[header][column]) !== heading) {
      throw new Error(`${label} has "${rows[header][column]}" in column ${column + 1}, not ${heading}`);
    }
  });
  const colours = colourOrder(rows[header + 1], first, label);
  for (let block = 1; block < 5; block++) {
    const order = colourOrder(rows[header + 1], first + 3 * block, label);
    if (order.join() !== colours.join()) {
      throw new Error(`${label} orders the colours differently across its categories`);
    }
  }

  const totalRow = rows.find(
    (row, r) =>
      r > header + 1 &&
      row.slice(0, first).some((cell) => plain(cell) === "total") &&
      isNumber(row[first]),
  );
  if (!totalRow) throw new Error(`${label} has no TOTAL row`);
  const values = totalRow
    .slice(first, first + 16)
    .map((cell, index) => volume(cell, `${label}, TOTAL row, column ${first + index + 1}`));
  const total = values[15];
  expectSum(values.slice(0, 15), total, `${label}, TOTAL row`);
  if (total < MIN_HOLDER_HL || total > MAX_HOLDER_HL) {
    throw new Error(`${label} reads ${total} hl at the production`);
  }

  const byColour = (block: number) => values.slice(3 * block, 3 * block + 3);
  const pdo = byColour(0);
  const pgi = byColour(1).map((hl, i) => hl + byColour(2)[i]);
  const other = byColour(3).map((hl, i) => hl + byColour(4)[i]);
  return [
    ...colours.flatMap((colour, i) => [
      figure("producers", "wine-pdo", colour, pdo[i], period),
      figure("producers", "wine-pgi", colour, pgi[i], period),
      figure("producers", "wine-other", colour, other[i], period),
    ]),
    figure("producers", "wine", "all", total, period),
  ];
}

/** The traders' national stocks by category and colour. */
function traderFigures(rows: Row[], year: number, period: string, label: string): Figure[] {
  expectTitle(rows, new RegExp(`^stocks de vins au commerce au 31 juillet ${year}$`), label);
  // The header names the colours and the total; the rows below carry one
  // category each, split by the wine's origin (France, rest of the EU),
  // then wine from third countries, then the total.
  let header = -1;
  let first = -1;
  for (let r = 0; r < rows.length && header === -1; r++) {
    const column = rows[r].findIndex(
      (cell, index, row) =>
        plain(cell) in COLOUR_WORDS &&
        plain(row[index + 1]) in COLOUR_WORDS &&
        plain(row[index + 2]) in COLOUR_WORDS &&
        plain(row[index + 3]) === "total",
    );
    if (column !== -1) {
      header = r;
      first = column;
    }
  }
  if (header === -1 || first < 2) throw new Error(`${label} has no colour header`);
  const colours = colourOrder(rows[header], first, label);

  const categories: Record<string, Product> = {
    aop: "wine-pdo",
    igp: "wine-pgi",
    vsig: "wine-other",
  };
  const totals = new Map<Product, number[]>();
  let total: number[] | null = null;
  let current: Product | null = null;
  for (let r = header + 1; r < rows.length && total === null; r++) {
    const row = rows[r];
    const category = plain(row[first - 2]);
    const origin = plain(row[first - 1]);
    const values = row
      .slice(first, first + 4)
      .map((cell, index) => volume(cell, `${label}, row ${r + 1}, column ${first + index + 1}`));
    if (category in categories) current = categories[category];
    let product: Product | null = null;
    if (origin === "fr" || origin === "ue") {
      if (!current) throw new Error(`${label} has an origin row before a category in row ${r + 1}`);
      product = current;
    } else if (category.startsWith("vins origine pays tiers")) {
      product = "wine-third-country";
    } else if (category === "total") {
      total = values;
    } else {
      continue;
    }
    if (values.some((hl) => hl > 0)) {
      expectSum(values.slice(0, 3), values[3], `${label}, row ${r + 1}`);
    }
    if (product) {
      const sum = totals.get(product) ?? [0, 0, 0, 0];
      totals.set(product, sum.map((hl, i) => hl + values[i]));
    }
  }
  if (!total) throw new Error(`${label} has no total row`);
  for (let i = 0; i < 4; i++) {
    expectSum([...totals.values()].map((sum) => sum[i]), total[i], `${label}, column ${first + i + 1}`);
  }
  if (total[3] < MIN_HOLDER_HL || total[3] > MAX_HOLDER_HL) {
    throw new Error(`${label} reads ${total[3]} hl at the trade`);
  }

  return [
    ...[...totals].flatMap(([product, sum]) =>
      colours.map((colour, i) => figure("traders", product, colour, sum[i], period))
    ),
    figure("traders", "wine", "all", total[3], period),
  ];
}

/** The national stocks of one campaign's workbook, at 31 July after it. */
export function figures(file: ArrayBuffer, campaignStart: number): Figure[] {
  const workbook = XLSX.read(new Uint8Array(file), { type: "array" });
  const year = campaignStart + 1;
  const period = `${year}-07-01`;
  const label = `The ${campaignStart}/${campaignStart + 1} statement`;
  return [
    ...producerFigures(
      sheetRows(workbook, /production/i, label),
      year,
      period,
      `${label}, production sheet`,
    ),
    ...traderFigures(sheetRows(workbook, /commerce/i, label), year, period, `${label}, trade sheet`),
  ];
}
