/**
 * Eurostat, harmonised index of consumer prices (HICP), in the second
 * version of the European classification of consumption (ECOICOP ver. 2,
 * dataset prc_hicp_minr): WineTerm reads wine from grapes (02.1.2.1), the
 * monthly index, 2025 = 100, and the annual rate of change Eurostat
 * publishes with it, for the EU, its 27 countries and Switzerland, through
 * Eurostat's dissemination API in JSON-stat 2.0. No database access here.
 */

export const SOURCE_ID = "eurostat-hicp";
const DATASET = "prc_hicp_minr";
const COICOP = "CP02121";
const INDEX_UNIT = "I25";
const RATE_UNIT = "RCH_A";
const API = `https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/${DATASET}`;
const TIMEOUT_MS = 60_000;

/**
 * Eurostat's geo codes, each with the ISO 3166-1 code WineTerm stores it
 * under: Eurostat writes Greece EL, and the EU of 27 countries is EU.
 */
const GEOS: Record<string, string> = {
  EU27_2020: "EU",
  AT: "AT",
  BE: "BE",
  BG: "BG",
  CY: "CY",
  CZ: "CZ",
  DE: "DE",
  DK: "DK",
  EE: "EE",
  EL: "GR",
  ES: "ES",
  FI: "FI",
  FR: "FR",
  HR: "HR",
  HU: "HU",
  IE: "IE",
  IT: "IT",
  LT: "LT",
  LU: "LU",
  LV: "LV",
  MT: "MT",
  NL: "NL",
  PL: "PL",
  PT: "PT",
  RO: "RO",
  SE: "SE",
  SI: "SI",
  SK: "SK",
  CH: "CH",
};

/**
 * Bounds of a plausible index and annual rate. A value outside them means
 * the dataset changed, such as a new reference year, not that prices did.
 */
const MIN_INDEX = 20;
const MAX_INDEX = 500;
const MAX_RATE = 100;

export interface Figure {
  /** ISO 3166-1 alpha-2, or EU. */
  country: string;
  /** First day of the month, e.g. "2026-09-01". */
  period: string;
  /** Index, 2025 = 100, as published. */
  value: number;
  /** Percentage change on a year earlier, as published; null where none is. */
  annual_rate: number | null;
  status: "final" | "provisional" | "estimate";
}

export interface Release {
  figures: Figure[];
  /** When Eurostat last updated the dataset, as an ISO timestamp. */
  updatedAt: string | null;
}

/** Both units of wine from grapes, for every country above and every month. */
export function datasetUrl(): string {
  const params = new URLSearchParams({ format: "JSON", lang: "EN", coicop18: COICOP });
  params.append("unit", INDEX_UNIT);
  params.append("unit", RATE_UNIT);
  for (const geo of Object.keys(GEOS)) params.append("geo", geo);
  return `${API}?${params}`;
}

interface Category {
  /** Code to position, or the codes in order. */
  index: Record<string, number> | string[];
}

interface JsonStat {
  class?: string;
  id?: string[];
  size?: number[];
  dimension?: Record<string, { category?: Category }>;
  value?: Record<string, number | null> | (number | null)[];
  status?: Record<string, string> | string[];
  updated?: string;
}

/** A dimension's positions by code. */
function positions(category: Category | undefined): Map<string, number> {
  if (!category) return new Map();
  if (Array.isArray(category.index)) {
    return new Map(category.index.map((code, position) => [code, position]));
  }
  return new Map(Object.entries(category.index));
}

/** A cell of a sparse or dense JSON-stat array. */
function cell<T>(store: Record<string, T> | T[] | undefined, position: number): T | undefined {
  if (!store) return undefined;
  return Array.isArray(store) ? store[position] : store[String(position)];
}

/**
 * The lifecycle status of a flagged value: Eurostat marks estimates "e"
 * and provisional figures "p"; its other flags, such as a break in the
 * series, leave a value final.
 */
function statusOf(flag: string | undefined): Figure["status"] {
  if (flag?.includes("e")) return "estimate";
  if (flag?.includes("p")) return "provisional";
  return "final";
}

/** Every figure in a JSON-stat response to datasetUrl(). */
export function releaseFigures(body: unknown): Release {
  const data = body as JsonStat;
  if (data?.class !== "dataset" || !data.id || !data.size || !data.dimension) {
    throw new Error("Eurostat's answer is not a JSON-stat dataset");
  }
  const { id, size, dimension } = data;
  for (const name of ["unit", "coicop18", "geo", "time"]) {
    if (!id.includes(name)) throw new Error(`The dataset has no ${name} dimension`);
  }

  // A cell's position: each dimension's position times the product of the
  // sizes after it.
  const strides = id.map((_, i) => size.slice(i + 1).reduce((product, n) => product * n, 1));
  const dims = new Map(id.map((name, i) => [name, positions(dimension[name]?.category)]));
  const fixed = (name: string, code: string): number => {
    const position = dims.get(name)?.get(code);
    if (position === undefined) {
      throw new Error(`The dataset has no ${name} ${code}; Eurostat may have changed it`);
    }
    return position;
  };
  for (const name of id) {
    if (!["unit", "coicop18", "geo", "time"].includes(name) && size[id.indexOf(name)] !== 1) {
      throw new Error(`The dataset's ${name} dimension has ${size[id.indexOf(name)]} values, not one`);
    }
  }

  const coicop = fixed("coicop18", COICOP);
  const units = { index: fixed("unit", INDEX_UNIT), rate: fixed("unit", RATE_UNIT) };
  const times = [...(dims.get("time") ?? new Map())].sort(([a], [b]) => a.localeCompare(b));
  const flat = (unit: number, geo: number, time: number): number =>
    id.reduce((sum, name, i) => {
      const position =
        name === "unit" ? unit
        : name === "coicop18" ? coicop
        : name === "geo" ? geo
        : name === "time" ? time
        : 0;
      return sum + position * strides[i];
    }, 0);

  const figures: Figure[] = [];
  for (const [geoCode, country] of Object.entries(GEOS)) {
    const geo = fixed("geo", geoCode);
    let found = 0;
    for (const [month, time] of times) {
      if (!/^\d{4}-\d{2}$/.test(month)) throw new Error(`The dataset has a month "${month}"`);
      const indexAt = flat(units.index, geo, time);
      const rateAt = flat(units.rate, geo, time);
      const value = cell(data.value, indexAt);
      const rate = cell(data.value, rateAt);
      if (value === undefined || value === null) {
        if (rate !== undefined && rate !== null) {
          throw new Error(`${geoCode} has an annual rate for ${month} but no index`);
        }
        continue;
      }
      if (value < MIN_INDEX || value > MAX_INDEX) {
        throw new Error(`${geoCode} reads an index of ${value} for ${month}`);
      }
      const annualRate = rate === undefined || rate === null ? null : rate;
      if (annualRate !== null && Math.abs(annualRate) > MAX_RATE) {
        throw new Error(`${geoCode} reads an annual rate of ${annualRate}% for ${month}`);
      }
      figures.push({
        country,
        period: `${month}-01`,
        value,
        annual_rate: annualRate,
        status: statusOf(cell(data.status, indexAt)),
      });
      found++;
    }
    if (found === 0) throw new Error(`The dataset holds no index for ${geoCode}`);
  }

  const updated = data.updated ? new Date(data.updated) : null;
  return {
    figures,
    updatedAt: updated && !Number.isNaN(updated.getTime()) ? updated.toISOString() : null,
  };
}

export async function fetchRelease(): Promise<Release> {
  const url = datasetUrl();
  const response = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Eurostat answered ${response.status} for ${DATASET}: ${text.slice(0, 300)}`);
  }
  return releaseFigures(JSON.parse(text));
}
