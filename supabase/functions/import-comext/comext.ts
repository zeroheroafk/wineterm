/**
 * Eurostat Comext, dataset DS-045409: the requests the import makes and the
 * conversion of the JSON-stat answers into trade_flows rows. No database
 * access here.
 */

import { CN8_CODES } from "./cn8.ts";

const DATASET =
  "https://ec.europa.eu/eurostat/api/comext/dissemination/statistics/1.0/data/DS-045409";
export const SOURCE_ID = "eurostat-comext";

const HEADING = "2204";
/**
 * Heading 2204 and its subheadings: sparkling wine; still wine in
 * containers up to 2 l, 2 to 10 l and over 10 l (bulk); other grape must.
 */
export const PRODUCTS = [HEADING, ...Object.keys(CN8_CODES)];
const REPORTERS = ["ES", "PT", "FR", "IT"];
const FLOW_CODES = { import: "1", export: "2" } as const;
/** Partner aggregates kept alongside the individual countries. */
const AGGREGATES = new Set(["WORLD", "EXT_EU27_2020", "INT_EU27_2020"]);
/** First year of monthly CN8 data in the dataset. */
const FIRST_YEAR = 2002;
/**
 * Comext takes longer to answer the more CN8 codes a request names (about
 * 20 seconds for 36 codes of a large reporter's year), so the largest
 * subheadings are asked for in parts.
 */
const CODES_PER_REQUEST = 36;
const TIMEOUT_MS = 60_000;
/** Comext answers 413 when it defers a large request, 429 or 5xx when busy. */
const RETRY_STATUSES = new Set([413, 429, 500, 502, 503, 504]);
const RETRY_DELAY_MS = 10_000;

export type Flow = keyof typeof FLOW_CODES;

export interface Job {
  reporter: string;
  flow: Flow;
  year: number;
}

export interface TradeRow {
  reporter: string;
  partner: string;
  product: string;
  flow: Flow;
  period: string;
  value_eur: number | null;
  quantity_kg: number | null;
  quantity_l: number | null;
  source_id: string;
  imported_at: string;
}

/** The parts of a JSON-stat 2.0 dataset this import reads. */
interface JsonStatDataset {
  id: string[];
  size: number[];
  dimension: Record<
    string,
    { category: { index: Record<string, number> | string[] } }
  >;
  value: Record<string, number | null> | (number | null)[];
}

/** One reporter, flow and year, as Comext publishes it. */
export interface YearData {
  /** Heading and subheadings: value in euros and net mass in 100 kg. */
  totals: JsonStatDataset;
  /** CN8 codes of the subheadings: value in euros and litres. */
  details: JsonStatDataset[];
}

interface Observation {
  partner: string;
  product: string;
  indicator: string;
  /** First day of the month, e.g. "2026-01-01". */
  period: string;
  value: number;
}

export function parseJob(value: unknown): Job | null {
  if (typeof value !== "object" || value === null) return null;
  const { reporter, flow, year } = value as Record<string, unknown>;
  if (typeof reporter !== "string" || !REPORTERS.includes(reporter)) {
    return null;
  }
  if (flow !== "import" && flow !== "export") return null;
  if (
    typeof year !== "number" ||
    !Number.isInteger(year) ||
    year < FIRST_YEAR ||
    year > new Date().getUTCFullYear()
  ) {
    return null;
  }
  return { reporter, flow, year };
}

/** A calendar year of the given products and indicators. */
async function request(
  job: Job,
  products: readonly string[],
  indicators: readonly string[],
): Promise<JsonStatDataset> {
  const query = new URLSearchParams({
    format: "JSON",
    lang: "EN",
    freq: "M",
    reporter: job.reporter,
    flow: FLOW_CODES[job.flow],
    // Months not yet published come back empty, a future year as an
    // empty dataset, so a whole calendar year is always safe to ask for.
    sinceTimePeriod: `${job.year}-01`,
    untilTimePeriod: `${job.year}-12`,
  });
  for (const product of products) query.append("product", product);
  for (const indicator of indicators) query.append("indicators", indicator);

  for (let attempt = 1; ; attempt++) {
    const response = await fetch(`${DATASET}?${query}`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (response.ok) return await response.json();
    const detail = (await response.text()).slice(0, 300);
    if (attempt === 1 && RETRY_STATUSES.has(response.status)) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      continue;
    }
    const asked = products.length === 1
      ? products[0]
      : `${products[0]} to ${products[products.length - 1]}`;
    throw new Error(
      `Comext answered ${response.status} for ${asked} in ${job.year}: ${detail}`,
    );
  }
}

/**
 * Everything one run needs: the heading and subheadings in one request and
 * the CN8 detail in a few more, all at once.
 */
export async function fetchYear(job: Job): Promise<YearData> {
  const detailRequests: string[][] = [];
  for (const codes of Object.values(CN8_CODES)) {
    for (let start = 0; start < codes.length; start += CODES_PER_REQUEST) {
      detailRequests.push(codes.slice(start, start + CODES_PER_REQUEST));
    }
  }
  const [totals, ...details] = await Promise.all([
    request(job, PRODUCTS, ["VALUE_IN_EUROS", "QUANTITY_IN_100KG"]),
    ...detailRequests.map((codes) =>
      request(job, codes, ["VALUE_IN_EUROS", "SUPPLEMENTARY_QUANTITY"])
    ),
  ]);
  return { totals, details };
}

/** Category codes of one dimension, in position order. */
function codesOf(data: JsonStatDataset, dimension: string): string[] {
  const index = data.dimension[dimension]?.category.index;
  if (!index) throw new Error(`Comext response has no ${dimension} dimension`);
  if (Array.isArray(index)) return index;
  const codes: string[] = [];
  for (const [code, position] of Object.entries(index)) codes[position] = code;
  return codes;
}

/** The numeric observations of a dataset, for the partners WineTerm keeps. */
function observations(data: JsonStatDataset, job: Job): Observation[] {
  const codes = data.id.map((dimension) => codesOf(data, dimension));
  const axisOf = (dimension: string) => {
    const axis = data.id.indexOf(dimension);
    if (axis === -1) throw new Error(`Comext response has no ${dimension} axis`);
    return axis;
  };
  const reporterAxis = axisOf("reporter");
  const flowAxis = axisOf("flow");
  const partnerAxis = axisOf("partner");
  const productAxis = axisOf("product");
  const indicatorAxis = axisOf("indicators");
  const timeAxis = axisOf("time");
  if (
    codes[reporterAxis].join() !== job.reporter ||
    codes[flowAxis].join() !== FLOW_CODES[job.flow]
  ) {
    throw new Error("Comext returned another reporter or flow than requested");
  }

  const result: Observation[] = [];
  for (const [key, value] of Object.entries(data.value)) {
    if (typeof value !== "number") continue;

    // A flat index is row-major over the dimensions, in data.id order.
    let rest = Number(key);
    const position = new Array<number>(data.size.length);
    for (let axis = data.size.length - 1; axis >= 0; axis--) {
      position[axis] = rest % data.size[axis];
      rest = Math.floor(rest / data.size[axis]);
    }

    const partner = codes[partnerAxis][position[partnerAxis]];
    if (!/^[A-Z]{2}$/.test(partner) && !AGGREGATES.has(partner)) continue;
    const month = codes[timeAxis][position[timeAxis]];
    if (!/^\d{4}-\d{2}$/.test(month)) {
      throw new Error(`Unexpected Comext period ${month}`);
    }
    result.push({
      partner,
      product: codes[productAxis][position[productAxis]],
      indicator: codes[indicatorAxis][position[indicatorAxis]],
      period: `${month}-01`,
      value,
    });
  }
  return result;
}

/**
 * One row per partner, product and month: value and net mass of the heading
 * and each subheading as Comext publishes them, and litres summed from the
 * CN8 codes below them. A row gets litres only when the CN8 codes that
 * carry litres add up exactly to its value, so it never shows the volume
 * of part of its trade.
 */
export function tradeRows(
  job: Job,
  data: YearData,
  importedAt: string,
): TradeRow[] {
  const rows = new Map<string, TradeRow>();
  for (const { partner, product, indicator, period, value } of observations(
    data.totals,
    job,
  )) {
    if (indicator !== "VALUE_IN_EUROS" && indicator !== "QUANTITY_IN_100KG") {
      continue;
    }
    const id = `${partner} ${product} ${period}`;
    let row = rows.get(id);
    if (!row) {
      row = {
        reporter: job.reporter,
        partner,
        product,
        flow: job.flow,
        period,
        value_eur: null,
        quantity_kg: null,
        quantity_l: null,
        source_id: SOURCE_ID,
        imported_at: importedAt,
      };
      rows.set(id, row);
    }
    if (indicator === "VALUE_IN_EUROS") row.value_eur = value;
    else row.quantity_kg = Math.round(value * 10_000) / 100;
  }

  const cells = new Map<string, { value?: number; litres?: number }>();
  for (const dataset of data.details) {
    for (const { partner, product, indicator, period, value } of observations(
      dataset,
      job,
    )) {
      const id = `${partner} ${product} ${period}`;
      const cell = cells.get(id) ?? {};
      if (indicator === "VALUE_IN_EUROS") cell.value = value;
      else if (indicator === "SUPPLEMENTARY_QUANTITY") cell.litres = value;
      cells.set(id, cell);
    }
  }

  // Value and litres of the CN8 cells that carry both, per subheading and
  // for the heading.
  const sums = new Map<string, { value: number; litres: number }>();
  for (const [id, cell] of cells) {
    if (cell.value === undefined || cell.litres === undefined) continue;
    const [partner, code, period] = id.split(" ");
    for (const product of [code.slice(0, 6), HEADING]) {
      const key = `${partner} ${product} ${period}`;
      const sum = sums.get(key) ?? { value: 0, litres: 0 };
      sum.value += cell.value;
      sum.litres += cell.litres;
      sums.set(key, sum);
    }
  }

  for (const [id, row] of rows) {
    const sum = sums.get(id);
    if (
      row.value_eur !== null &&
      sum !== undefined &&
      Math.abs(sum.value - row.value_eur) < 0.5
    ) {
      row.quantity_l = Math.round(sum.litres * 100) / 100;
    }
  }
  return [...rows.values()];
}
