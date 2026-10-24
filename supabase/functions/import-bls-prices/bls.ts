/**
 * US Bureau of Labor Statistics, average prices of the consumer price
 * index: WineTerm reads the monthly average price of a litre of red,
 * white and rosé table wine, of every size and origin, in US cities
 * (series APU0000720311), through the BLS public data API, version 1,
 * which needs no registration key. No database access here.
 */

export const SOURCE_ID = "bls-average-prices";
export const SERIES_ID = "APU0000720311";
/**
 * Asked by POST, the API answers the years requested; a GET of the series
 * answers the latest three years, whatever years it names.
 */
const API = "https://api.bls.gov/publicAPI/v1/timeseries/data/";
/** Version 1 answers at most ten years per request. */
const YEARS_PER_REQUEST = 10;
const TIMEOUT_MS = 60_000;

/**
 * Bounds of a plausible price in USD per litre. A value outside them
 * means the series changed, not that the market moved.
 */
const MIN_PRICE = 2;
const MAX_PRICE = 60;

export interface Price {
  /** First day of the month, e.g. "2026-09-01". */
  period: string;
  /** USD per litre, as published. */
  value: number;
  status: "final" | "provisional";
}

interface Footnote {
  code?: string;
  text?: string;
}

interface Answer {
  status?: string;
  message?: string[];
  Results?: {
    series?: {
      seriesID?: string;
      data?: {
        year?: string;
        period?: string;
        value?: string;
        footnotes?: Footnote[];
      }[];
    }[];
  };
}

/** The years of a run in spans of at most ten, oldest first. */
export function yearSpans(fromYear: number, toYear: number): [number, number][] {
  const spans: [number, number][] = [];
  for (let start = fromYear; start <= toYear; start += YEARS_PER_REQUEST) {
    spans.push([start, Math.min(start + YEARS_PER_REQUEST - 1, toYear)]);
  }
  return spans;
}

/**
 * The monthly prices in an answer. A month the BLS did not collect, such
 * as October 2025, during the lapse in US federal appropriations, reads
 * "-" with a footnote and is left out; a preliminary figure is marked
 * "P".
 */
export function answerPrices(body: unknown): Price[] {
  const answer = body as Answer;
  if (answer?.status !== "REQUEST_SUCCEEDED") {
    const reason = answer?.message?.join(" ") || answer?.status || "no status";
    throw new Error(`The BLS did not answer the request: ${reason}`);
  }
  const series = answer.Results?.series?.find((s) => s.seriesID === SERIES_ID);
  if (!series) throw new Error(`The BLS answer has no series ${SERIES_ID}`);

  const prices: Price[] = [];
  for (const row of series.data ?? []) {
    const year = row.year ?? "";
    const period = row.period ?? "";
    if (!/^\d{4}$/.test(year)) throw new Error(`The BLS answer has a year "${year}"`);
    // M13 would be the annual average, which average prices do not carry.
    if (period === "M13") continue;
    const month = period.match(/^M(0[1-9]|1[0-2])$/)?.[1];
    if (!month) throw new Error(`The BLS answer has a period "${period}" in ${year}`);
    const text = (row.value ?? "").trim();
    if (text === "-" || text === "") continue;
    if (!/^\d+(\.\d+)?$/.test(text)) {
      throw new Error(`The BLS answer reads "${text}" for ${year}-${month}`);
    }
    const value = Number(text);
    if (value < MIN_PRICE || value > MAX_PRICE) {
      throw new Error(`The BLS answer reads ${value} USD a litre for ${year}-${month}`);
    }
    const preliminary = (row.footnotes ?? []).some((note) => note.code === "P");
    prices.push({
      period: `${year}-${month}-01`,
      value,
      status: preliminary ? "provisional" : "final",
    });
  }
  return prices.sort((a, b) => a.period.localeCompare(b.period));
}

/**
 * The monthly prices from the start of fromYear to the end of toYear,
 * oldest first, one per month.
 */
export async function fetchPrices(fromYear: number, toYear: number): Promise<Price[]> {
  const prices = new Map<string, Price>();
  for (const [start, end] of yearSpans(fromYear, toYear)) {
    const response = await fetch(API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "WineTerm data import",
      },
      body: JSON.stringify({
        seriesid: [SERIES_ID],
        startyear: String(start),
        endyear: String(end),
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!response.ok) {
      throw new Error(`The BLS answered ${response.status} for ${start} to ${end}`);
    }
    for (const price of answerPrices(await response.json())) {
      prices.set(price.period, price);
    }
  }
  return [...prices.values()].sort((a, b) => a.period.localeCompare(b.period));
}
