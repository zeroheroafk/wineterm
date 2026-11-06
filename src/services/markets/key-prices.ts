/**
 * Key bulk wine prices.
 *
 * One price per real national series, then the illustrative samples still
 * on the site, shown at the head of the Markets overview. Every figure is
 * the markets catalogue's own, never copied: the latest observation with
 * its change on the previous one and on a year earlier. The sample Market
 * Outlook reads the samples alone, as its text was written against them.
 */

import {
  ILLUSTRATIVE_PRICE_SOURCE,
  SAMPLE_PRICES_UPDATED_AT,
  keyPriceCodes,
} from "@/fixtures/key-prices";
import {
  getIllustrativeMarketsService,
  getMarketsService,
  isIllustrative,
  type MarketsService,
} from "@/services/markets/service";
import { getSource } from "@/services/markets/sources";
import {
  NATIONAL_AVERAGE,
  type MarketRow,
  type SeriesObservation,
} from "@/services/markets/types";
import type { DataSource, PriceQuote, PriceUnit } from "@/services/types";

export interface KeyPricesService {
  /** One price per real series, then the samples still shown. */
  getKeyPrices(): Promise<PriceQuote[]>;
  /** When the key prices were last updated. */
  getLastUpdated(): Promise<string>;
}

const PRICE_UNITS: PriceUnit[] = ["EUR/hl", "EUR/kg", "EUR/tonne"];

/** A catalogue price series with the observation before its latest. */
interface CataloguePrice {
  row: MarketRow;
  previous: SeriesObservation;
}

function priceUnit(row: MarketRow): PriceUnit | null {
  const unit = row.series.unit as PriceUnit;
  return PRICE_UNITS.includes(unit) ? unit : null;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * A key price from a catalogue series: the latest observation with its
 * change on the previous one and on a year earlier, and the recorded
 * figures of a series recorded per hectolitre-degree. Null when the
 * series is priced in a unit the key prices do not show.
 */
function keyPrice(
  { row, previous }: CataloguePrice,
  source: DataSource,
): PriceQuote | null {
  const unit = priceUnit(row);
  if (!unit) return null;
  const { series, latest } = row;
  const recorded =
    series.perDegree &&
    latest.perDegreeValue !== undefined &&
    previous.perDegreeValue !== undefined
      ? {
          ...series.perDegree,
          price: latest.perDegreeValue,
          change: round2(latest.perDegreeValue - previous.perDegreeValue),
        }
      : undefined;
  return {
    id: `kp-${series.code.toLowerCase()}`,
    code: series.code,
    market: series.appellation ?? series.region,
    country: series.country,
    colour: series.colour,
    product: series.product,
    price: latest.value,
    unit,
    change: round2(latest.value - previous.value),
    changePercent: (latest.value / previous.value - 1) * 100,
    yoyPercent: row.changes.yoyPercent ?? undefined,
    observedAt: latest.date,
    status: latest.status,
    source,
    perDegree: recorded,
  };
}

/** Sample series shown as key prices, read from a catalogue by code. */
async function sampleKeyPrices(
  markets: MarketsService,
  codes: string[],
): Promise<PriceQuote[]> {
  const prices = await Promise.all(
    codes.map(async (code) => {
      const row = await markets.getRow(code);
      const previous = (await markets.getHistory(code, "3m")).at(-2);
      if (!row || !isIllustrative(row) || !previous) {
        throw new Error(`No sample series ${code} for the key prices`);
      }
      return { row, previous };
    }),
  );
  return prices.flatMap((price) => keyPrice(price, ILLUSTRATIVE_PRICE_SOURCE) ?? []);
}

/** The key prices as written against the illustrative series. */
class FixtureKeyPricesService implements KeyPricesService {
  async getKeyPrices(): Promise<PriceQuote[]> {
    return sampleKeyPrices(getIllustrativeMarketsService(), keyPriceCodes);
  }

  async getLastUpdated(): Promise<string> {
    return SAMPLE_PRICES_UPDATED_AT;
  }
}

/**
 * Each country's real national bulk wine prices, each with its previous
 * observation: a week earlier for weekly series, a month earlier for
 * monthly ones. Regional prices are on the bulk wine page.
 */
async function importedPrices(): Promise<CataloguePrice[]> {
  const markets = getMarketsService();
  const rows = (await markets.getRows("bulk-wine")).filter(
    (row) => !isIllustrative(row) && row.series.region === NATIONAL_AVERAGE,
  );
  const prices = await Promise.all(
    rows.map(async (row) => {
      const history = await markets.getHistory(row.series.code, "3m");
      return { row, previous: history.at(-2) };
    }),
  );
  return prices.filter(
    (price): price is CataloguePrice => price.previous !== undefined,
  );
}

function sourceOf(row: MarketRow): DataSource {
  const source = getSource(row.series.sourceId);
  return { name: source.name, url: source.url };
}

/** Real prices first, then the illustrative series still on the site. */
class LiveKeyPricesService implements KeyPricesService {
  async getKeyPrices(): Promise<PriceQuote[]> {
    const markets = getMarketsService();
    const imported = (await importedPrices()).flatMap(
      (price) => keyPrice(price, sourceOf(price.row)) ?? [],
    );
    // A sample withdrawn for a real series covering it is not shown.
    const rows = await Promise.all(keyPriceCodes.map((code) => markets.getRow(code)));
    const samples = await sampleKeyPrices(
      markets,
      keyPriceCodes.filter((_, index) => rows[index] !== null),
    );
    return [...imported, ...samples];
  }

  async getLastUpdated(): Promise<string> {
    const updates = (await importedPrices()).map(({ row }) => row.latest.updatedAt);
    return [SAMPLE_PRICES_UPDATED_AT, ...updates].sort().at(-1)!;
  }
}

let service: KeyPricesService | null = null;
let illustrative: KeyPricesService | null = null;

/** The key prices as published: real sources where connected. */
export function getKeyPricesService(): KeyPricesService {
  service ??= new LiveKeyPricesService();
  return service;
}

/**
 * Always the illustrative series, for sample publications such as the
 * Market Outlook, whose text was written against them.
 */
export function getIllustrativeKeyPricesService(): KeyPricesService {
  illustrative ??= new FixtureKeyPricesService();
  return illustrative;
}
