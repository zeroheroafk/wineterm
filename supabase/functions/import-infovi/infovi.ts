/**
 * MAPA, INFOVI: the Spanish Ministry of Agriculture's monthly summary of
 * the compulsory declarations of the wine sector, one workbook per month
 * listed on one page per year. WineTerm reads the national totals of its
 * tables of stocks at the end of the month (table 5), wine made from
 * 1 August to the end of the month (table 2.2), wine that came in during
 * the month from Spain and from other countries (tables 3.1 and 3.2) and
 * wine that went out, by destination (tables 4.0 and 4.6), the exits
 * abroad also by colour and presentation (tables 4.3 and 4.4). No
 * database access here.
 */

import * as XLSX from "npm:xlsx@0.18.5";

export const SOURCE_ID = "mapa-infovi";
const SECTOR_PAGE =
  "https://www.mapa.gob.es/es/agricultura/temas/producciones-agricolas/vitivinicultura";
/**
 * Pages that link the yearly INFOVI pages: the sector page links the
 * current year, the archive the years before it.
 */
const INDEX_PAGES = [SECTOR_PAGE, `${SECTOR_PAGE}/datos_infovi_anteriores`];
const TIMEOUT_MS = 60_000;
/** First year whose twelve monthly workbooks share the current layout. */
export const FIRST_YEAR = 2018;

const MONTHS = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

/**
 * Bounds of a plausible national total in hl. A value outside them means
 * the workbook changed shape, not that the market moved.
 */
const MAX_STOCKS_HL = 100_000_000;
const MIN_WINE_STOCKS_HL = 5_000_000;
const MAX_PRODUCTION_HL = 60_000_000;
const MAX_MONTH_FLOW_HL = 20_000_000;

/**
 * Months whose flow tables contradict one another, so that only their
 * stocks and production are read. In September 2018 the summary of exits
 * (table 4.0) disagrees with the detailed exit tables 4.1 to 4.4, and one
 * figure turns up in cells of unrelated regions in tables 3.2 and 4.0.
 */
const INCONSISTENT_FLOWS = new Set(["2018-09"]);

/**
 * Wine that came in during the month, by origin, or went out, by
 * destination. Domestic entries come from other operators in Spain;
 * domestic exits are those other than to distilleries and vinegar makers;
 * own operations are wine declarants took out for their own operations
 * ("operaciones propias"), a table published since July 2021.
 */
export type Flow =
  | "entries-domestic"
  | "entries-eu"
  | "entries-third-countries"
  | "exits-domestic"
  | "exits-distillation"
  | "exits-vinegar"
  | "exits-eu"
  | "exits-third-countries"
  | "exits-own-operations";

export interface Figure {
  /** First day of the month the figure refers to, e.g. "2026-07-01". */
  period: string;
  /** Stocks on the last day of the month, wine made since 1 August, or a flow in the month. */
  measure: "closing-stocks" | "production-to-date" | Flow;
  product: "wine" | "must";
  /** "all" for the totals of flows; exits abroad also come by colour. */
  colour: "red-rose" | "white" | "all";
  /** Bulk or packaged, for wine stocks and exits abroad; "all" for totals and where the table has no split. */
  presentation: "bulk" | "packaged" | "all";
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

/** A month name as the ministry writes it; September also as "setiembre". */
function monthPattern(month: number): string {
  return month === 9 ? "se(?:p)?tiembre" : MONTHS[month - 1];
}

async function fetchPage(url: string): Promise<string> {
  const response = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!response.ok) {
    throw new Error(`MAPA answered ${response.status} for ${url}`);
  }
  return await response.text();
}

function links(html: string, base: string): { url: string; label: string }[] {
  return [...html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)]
    .map(([, href, inner]) => ({
      url: new URL(href, base).toString(),
      label: plain(inner.replace(/<[^>]+>/g, " ")),
    }));
}

/** The page listing a year's workbooks, or null when no index links one. */
export async function yearPageUrl(year: number): Promise<string | null> {
  for (const index of INDEX_PAGES) {
    const found = links(await fetchPage(index), index).find(({ url }) =>
      new URL(url).pathname.endsWith(`/infovi_${year}`)
    );
    if (found) return found.url;
  }
  return null;
}

export interface WorkbookLink {
  month: number;
  url: string;
}

/**
 * The monthly workbooks a year's page lists, by month. Their links read
 * "Datos INFOVI julio 2018", "Informe INFOVI junio 2026" or "INFOVI julio
 * 2026"; the extended and corrected declarations beside them are other
 * tables and are left out. File names carry typos, so labels decide.
 */
export async function monthlyWorkbooks(
  year: number,
  pageUrl: string,
): Promise<WorkbookLink[]> {
  const found = new Map<number, string>();
  for (const { url, label } of links(await fetchPage(pageUrl), pageUrl)) {
    if (!/\.xlsx$/i.test(url)) continue;
    for (let month = 1; month <= 12; month++) {
      const pattern = new RegExp(
        `^(?:datos |informe )?infovi ${monthPattern(month)} ${year}$`,
      );
      if (!pattern.test(label)) continue;
      if (found.has(month)) {
        throw new Error(`The ${year} page lists two workbooks for ${MONTHS[month - 1]}`);
      }
      found.set(month, url);
    }
  }
  return [...found]
    .sort(([a], [b]) => a - b)
    .map(([month, url]) => ({ month, url }));
}

export interface Workbook {
  file: ArrayBuffer;
  /** When the ministry uploaded the file, from its Last-Modified header. */
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

type Row = unknown[];

/** A table's national TOTAL row, where it sits and the figures to its right. */
interface Totals {
  rows: Row[];
  row: number;
  column: number;
  values: number[];
}

/**
 * The first TOTAL row followed by figures: the national line of the
 * sheet's main table. Tables do not always start in the first column, so
 * the TOTAL cell anchors every other position.
 */
function totals(rows: Row[], table: string): Totals {
  for (let row = 0; row < rows.length; row++) {
    const cells = rows[row];
    const column = cells.findIndex(
      (cell, index) => plain(cell) === "total" && typeof cells[index + 1] === "number",
    );
    if (column === -1) continue;
    const values: number[] = [];
    for (let c = column + 1; typeof cells[c] === "number"; c++) {
      values.push(cells[c] as number);
    }
    return { rows, row, column, values };
  }
  throw new Error(`${table} has no TOTAL row`);
}

/** Whether a heading above the totals, `offset` columns right of TOTAL, matches. */
function hasHeading(totals: Totals, offset: number, pattern: RegExp): boolean {
  for (let row = totals.row - 1; row >= Math.max(0, totals.row - 30); row--) {
    if (pattern.test(plain(totals.rows[row][totals.column + offset]))) return true;
  }
  return false;
}

/** Fails unless a heading above the totals, `offset` columns right of TOTAL, matches. */
function expectHeading(
  totals: Totals,
  offset: number,
  pattern: RegExp,
  table: string,
): void {
  if (!hasHeading(totals, offset, pattern)) {
    throw new Error(
      `${table} has no heading matching ${pattern} in column ${totals.column + offset + 1}`,
    );
  }
}

/** The title of a sheet's first table, "cuadro 5. existencias finales a 31 de ...". */
function title(rows: Row[]): string {
  return rows.flat().map(plain).find((text) => text.startsWith("cuadro")) ?? "";
}

/** Fails unless the sheet's title is the table's, so a misplaced sheet is not read. */
function expectTitle(rows: Row[], pattern: RegExp, table: string): void {
  if (!pattern.test(title(rows))) {
    throw new Error(`${table} is titled "${title(rows)}"`);
  }
}

/**
 * Fails unless a title names the workbook's month and year, even when
 * typed without a space before the month ("28 defebrero de 2019") or with
 * a dash before the year ("septiembre - 2023").
 */
function expectPeriod(rows: Row[], table: string, month: number, year: number): void {
  const pattern = new RegExp(`${monthPattern(month)} (?:de |- )?${year}\\b`);
  if (!pattern.test(title(rows))) {
    throw new Error(`${table} is titled "${title(rows)}", not ${MONTHS[month - 1]} ${year}`);
  }
}

/** Fails unless the parts add up to the total the ministry printed. */
function expectSum(parts: number[], total: number, what: string): void {
  const sum = parts.reduce((a, b) => a + b, 0);
  if (Math.abs(sum - total) > 1) {
    throw new Error(`${what}: the parts add up to ${sum} hl, the table says ${total}`);
  }
}

function sheet(workbook: XLSX.WorkBook, pattern: RegExp): Row[] | null {
  const name = workbook.SheetNames.find((n) => pattern.test(n.trim()));
  return name
    ? XLSX.utils.sheet_to_json<Row>(workbook.Sheets[name], {
      header: 1,
      raw: true,
      defval: null,
    })
    : null;
}

const RED = /^tinto\s*\/\s*rosado$/;
/** Wine by colour, bulk then packaged, from the first column after TOTAL. */
const BY_COLOUR_AND_PRESENTATION = [
  [1, RED],
  [1, /^granel$/],
  [2, /^envasado$/],
  [3, /^blanco$/],
  [3, /^granel$/],
  [4, /^envasado$/],
] as const;
const STOCKS_SHEET = /^5\s*\./;
const MONTH_PRODUCTION_SHEET = /^2\s*[.,]\s*1\b/;
const CAMPAIGN_PRODUCTION_SHEET = /^2\s*[.,]\s*2\b/;
const DOMESTIC_ENTRIES_SHEET = /^3\s*[.,]\s*1\b/;
const FOREIGN_ENTRIES_SHEET = /^3\s*[.,]\s*2\b/;
const EXITS_SHEET = /^4\s*\.\s*(?:resumen|salidas)\b/i;
const EU_EXITS_SHEET = /^4\s*[.,]\s*3\b/;
const THIRD_COUNTRY_EXITS_SHEET = /^4\s*[.,]\s*4\b/;
const OWN_OPERATIONS_SHEET = /^4\s*[.,]\s*6\b/;

/**
 * The national totals of a table of one month's flows, after checking
 * its title, its period unless `period` is null, and the headings above
 * them. Null when the workbook has no such table.
 */
function flowTotals(
  workbook: XLSX.WorkBook,
  sheetPattern: RegExp,
  titlePattern: RegExp,
  headings: readonly (readonly [number, RegExp])[],
  table: string,
  period: { month: number; year: number } | null,
): Totals | null {
  const rows = sheet(workbook, sheetPattern);
  if (!rows) return null;
  expectTitle(rows, titlePattern, table);
  if (period) expectPeriod(rows, table, period.month, period.year);
  const found = totals(rows, table);
  for (const [offset, pattern] of headings) {
    expectHeading(found, offset, pattern, table);
  }
  const outlier = found.values.find((value) => value < 0 || value > MAX_MONTH_FLOW_HL);
  if (outlier !== undefined) throw new Error(`${table} reads ${outlier} hl`);
  return found;
}

/** The national stocks, production and flows of one month's workbook. */
export function figures(file: ArrayBuffer, year: number, month: number): Figure[] {
  const data = new Uint8Array(file);
  const names = XLSX.read(data, { type: "array", bookSheets: true }).SheetNames;
  const wanted = names.filter((name) =>
    [
      STOCKS_SHEET,
      MONTH_PRODUCTION_SHEET,
      CAMPAIGN_PRODUCTION_SHEET,
      DOMESTIC_ENTRIES_SHEET,
      FOREIGN_ENTRIES_SHEET,
      EXITS_SHEET,
      EU_EXITS_SHEET,
      THIRD_COUNTRY_EXITS_SHEET,
      OWN_OPERATIONS_SHEET,
    ].some((p) => p.test(name.trim()))
  );
  const workbook = XLSX.read(data, { type: "array", sheets: wanted });
  const label = `${MONTHS[month - 1]} ${year}`;
  const period = `${year}-${String(month).padStart(2, "0")}-01`;
  const dated = { month, year };

  // Table 5: wine by colour and presentation, then must that is not
  // concentrated, by colour, then the total of wine and, in most months,
  // the total of must.
  const stockRows = sheet(workbook, STOCKS_SHEET);
  if (!stockRows) throw new Error(`The ${label} workbook has no table 5`);
  const stockTable = `Table 5 of ${label}`;
  expectPeriod(stockRows, stockTable, month, year);
  const stocks = totals(stockRows, stockTable);
  for (
    const [offset, pattern] of [
      ...BY_COLOUR_AND_PRESENTATION,
      [5, /mosto/],
      [5, RED],
      [6, /^blanco$/],
      [7, /^total vino$/],
    ] as const
  ) {
    expectHeading(stocks, offset, pattern, stockTable);
  }
  const [redBulk, redPackaged, whiteBulk, whitePackaged, mustRed, mustWhite, wine] =
    stocks.values;
  expectSum([redBulk, redPackaged, whiteBulk, whitePackaged], wine, `${stockTable}, wine`);
  if (hasHeading(stocks, 8, /^total mosto/)) {
    expectSum([mustRed, mustWhite], stocks.values[7], `${stockTable}, must`);
  }
  if (
    wine < MIN_WINE_STOCKS_HL || wine > MAX_STOCKS_HL ||
    mustRed + mustWhite > MAX_STOCKS_HL
  ) {
    throw new Error(`${stockTable} reads ${wine} hl of wine and ${mustRed + mustWhite} of must`);
  }

  // Table 2.2: grapes taken in, then wine made, from 1 August to the end
  // of the month. Its title is often left over from an earlier month, so
  // only the start of the period is checked; table 5 dates the workbook.
  // August workbooks up to 2019 carry only the month's table 2.1, which
  // then covers the same period.
  let productionRows = sheet(workbook, CAMPAIGN_PRODUCTION_SHEET);
  let productionTable = `Table 2.2 of ${label}`;
  if (productionRows) {
    expectTitle(productionRows, /^cuadro 2\.2\b.* del? 1 de agosto\b/, productionTable);
  } else if (month === 8) {
    productionRows = sheet(workbook, MONTH_PRODUCTION_SHEET);
    productionTable = `Table 2.1 of ${label}`;
    if (!productionRows) throw new Error(`The ${label} workbook has no table 2.1`);
    expectPeriod(productionRows, productionTable, month, year);
  } else {
    throw new Error(`The ${label} workbook has no table 2.2`);
  }
  const production = totals(productionRows, productionTable);
  for (
    const [offset, pattern] of [
      [1, /entrada de uva/],
      [1, /^tinta$/],
      [2, /^blanca$/],
      [4, /^vino$/],
      [4, RED],
      [5, /^blanco$/],
      [6, /^total vino$/],
    ] as const
  ) {
    expectHeading(production, offset, pattern, productionTable);
  }
  const [, , , redWine, whiteWine, madeWine] = production.values;
  expectSum([redWine, whiteWine], madeWine, `${productionTable}, wine`);
  if (madeWine > MAX_PRODUCTION_HL) {
    throw new Error(`${productionTable} reads ${madeWine} hl of wine`);
  }

  const figure = (
    measure: Figure["measure"],
    product: Figure["product"],
    colour: Figure["colour"],
    presentation: Figure["presentation"],
    volume_hl: number,
  ): Figure => ({ period, measure, product, colour, presentation, volume_hl });
  const stocksAndProduction = [
    figure("closing-stocks", "wine", "red-rose", "bulk", redBulk),
    figure("closing-stocks", "wine", "red-rose", "packaged", redPackaged),
    figure("closing-stocks", "wine", "white", "bulk", whiteBulk),
    figure("closing-stocks", "wine", "white", "packaged", whitePackaged),
    figure("closing-stocks", "must", "red-rose", "all", mustRed),
    figure("closing-stocks", "must", "white", "all", mustWhite),
    figure("production-to-date", "wine", "red-rose", "all", redWine),
    figure("production-to-date", "wine", "white", "all", whiteWine),
  ];
  if (INCONSISTENT_FLOWS.has(period.slice(0, 7))) return stocksAndProduction;

  // Table 3.1: wine that came in from other operators in Spain, by colour
  // and presentation, then the total.
  const domesticTable = `Table 3.1 of ${label}`;
  const domestic = flowTotals(
    workbook,
    DOMESTIC_ENTRIES_SHEET,
    /^cuadro 3\.1 entradas de vino procedentes de espana\b/,
    [...BY_COLOUR_AND_PRESENTATION, [5, /^total vino$/]],
    domesticTable,
    dated,
  );
  if (!domestic) throw new Error(`The ${label} workbook has no table 3.1`);
  const domesticEntries = domestic.values[4];
  expectSum(domestic.values.slice(0, 4), domesticEntries, domesticTable);

  // Table 3.2: wine that came in from other countries, by colour and
  // presentation, then from the rest of the EU and from third countries,
  // then the total.
  const foreignTable = `Table 3.2 of ${label}`;
  const foreign = flowTotals(
    workbook,
    FOREIGN_ENTRIES_SHEET,
    /^cuadro 3\.2 entradas de vino procedentes de otros paises\b/,
    [
      ...BY_COLOUR_AND_PRESENTATION,
      [5, /^total del resto de la ue$/],
      [6, /^total de terceros paises$/],
      [7, /^total entradas de vino$/],
    ],
    foreignTable,
    dated,
  );
  if (!foreign) throw new Error(`The ${label} workbook has no table 3.2`);
  const [, , , , euEntries, thirdCountryEntries, foreignEntries] = foreign.values;
  expectSum(foreign.values.slice(0, 4), foreignEntries, `${foreignTable}, by colour`);
  expectSum([euEntries, thirdCountryEntries], foreignEntries, `${foreignTable}, by origin`);

  // Table 4.0: wine that went out within Spain, to other uses than
  // distilleries and vinegar makers, to distilleries and to vinegar makers,
  // with their total; then to the rest of the EU and to third countries,
  // with their total; then, except in March 2019, the grand total.
  const exitsTable = `Table 4.0 of ${label}`;
  const exits = flowTotals(
    workbook,
    EXITS_SHEET,
    /^cuadro 4\.0? salidas de vino por ccaa y destino\b/,
    [
      [1, /^salidas interiores$/],
      [1, /^distintas de destileria\s*\/\s*vinagreria$/],
      [2, /^destileria$/],
      [3, /^vinagreria$/],
      [4, /^total$/],
      [5, /^salidas exteriores\b/],
      [5, /^ue$/],
      [6, /^terceros paises$/],
      [7, /^total$/],
    ],
    exitsTable,
    dated,
  );
  if (!exits) throw new Error(`The ${label} workbook has no table 4.0`);
  const [domesticExits, distillation, vinegar, withinSpain, euExits, thirdCountryExits, abroad] =
    exits.values;
  expectSum([domesticExits, distillation, vinegar], withinSpain, `${exitsTable}, within Spain`);
  expectSum([euExits, thirdCountryExits], abroad, `${exitsTable}, abroad`);
  if (hasHeading(exits, 8, /^total salidas$/)) {
    expectSum([withinSpain, abroad], exits.values[7], exitsTable);
  }

  // Tables 4.3 and 4.4: wine that went out to the rest of the EU and to
  // third countries, by colour and presentation, then the total. Their
  // titles are sometimes left over from the month before or misspelt
  // ("pebrero 2019"), so the total must be table 4.0's instead.
  const abroadByKind = (
    sheetPattern: RegExp,
    titlePattern: RegExp,
    number: string,
    total: number,
  ): number[] => {
    const table = `Table ${number} of ${label}`;
    const found = flowTotals(
      workbook,
      sheetPattern,
      titlePattern,
      [...BY_COLOUR_AND_PRESENTATION, [5, /^total vino$/]],
      table,
      null,
    );
    if (!found) throw new Error(`The ${label} workbook has no table ${number}`);
    const parts = found.values.slice(0, 4);
    expectSum(parts, found.values[4], table);
    expectSum(parts, total, `${table}, against table 4.0`);
    return parts;
  };
  const euByKind = abroadByKind(
    EU_EXITS_SHEET,
    /^cuadro 4\.3\.? salidas de vino a paises de la ue\b/,
    "4.3",
    euExits,
  );
  const thirdCountriesByKind = abroadByKind(
    THIRD_COUNTRY_EXITS_SHEET,
    /^cuadro 4\.4\.? salidas de vino a terceros paises\b/,
    "4.4",
    thirdCountryExits,
  );

  // Table 4.6: wine taken out for the declarants' own operations, red and
  // rosé, white, then the total. Published since July 2021, and missing
  // from some workbooks since.
  const ownTable = `Table 4.6 of ${label}`;
  const own = flowTotals(
    workbook,
    OWN_OPERATIONS_SHEET,
    /^cuadro 4\.6\.? salidas operaciones propias\b/,
    [
      [1, /^salidas operaciones propias$/],
      [1, RED],
      [2, /^blanco$/],
      [3, /^total vino$/],
    ],
    ownTable,
    dated,
  );
  if (own) expectSum(own.values.slice(0, 2), own.values[2], ownTable);

  return [
    ...stocksAndProduction,
    figure("entries-domestic", "wine", "all", "all", domesticEntries),
    figure("entries-eu", "wine", "all", "all", euEntries),
    figure("entries-third-countries", "wine", "all", "all", thirdCountryEntries),
    figure("exits-domestic", "wine", "all", "all", domesticExits),
    figure("exits-distillation", "wine", "all", "all", distillation),
    figure("exits-vinegar", "wine", "all", "all", vinegar),
    figure("exits-eu", "wine", "all", "all", euExits),
    figure("exits-third-countries", "wine", "all", "all", thirdCountryExits),
    ...([["exits-eu", euByKind], ["exits-third-countries", thirdCountriesByKind]] as const)
      .flatMap(([measure, [redBulk, redPackaged, whiteBulk, whitePackaged]]) => [
        figure(measure, "wine", "red-rose", "bulk", redBulk),
        figure(measure, "wine", "red-rose", "packaged", redPackaged),
        figure(measure, "wine", "white", "bulk", whiteBulk),
        figure(measure, "wine", "white", "packaged", whitePackaged),
      ]),
    ...(own ?[figure("exits-own-operations", "wine", "all", "all", own.values[2])] : []),
  ];
}
