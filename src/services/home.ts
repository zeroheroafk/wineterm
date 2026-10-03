/**
 * Homepage data service.
 *
 * Aggregates everything the homepage needs behind one typed interface.
 * Figures that exist in another domain are read from that domain's
 * service and never copied: the key prices are series of the markets
 * catalogue, the market strip repeats the key prices, the harvest
 * monitor shows the Harvest page's region reports, the supply snapshot
 * is the current campaign's supply balance, the trade snapshot comes
 * from the trade service and the analysis is the latest published by the
 * editorial service. Sections with a connected source read it:
 * trade from Eurostat, and the key prices and the market strip from the
 * real price series, listed before the illustrative series that complete
 * them.
 */

import {
  HOME_UPDATED_AT,
  ILLUSTRATIVE_PRICE_SOURCE,
  harvestMonitorRegions,
  keyPriceCodes,
  leadBriefing,
  stripOtherQuotes,
  stripPriceCodes,
  supplySnapshotText,
} from "@/fixtures/home";
import { getBriefingService } from "@/services/briefing/service";
import { getEditorialService } from "@/services/editorial";
import { getHarvestService } from "@/services/harvest/service";
import {
  getIllustrativeMarketsService,
  getMarketsService,
  isIllustrative,
  type MarketsService,
} from "@/services/markets/service";
import { getSource, type SourceId } from "@/services/markets/sources";
import {
  NATIONAL_AVERAGE,
  type MarketRow,
  type SeriesObservation,
} from "@/services/markets/types";
import { getSupplyService } from "@/services/supply/service";
import type { SupplyBalanceComputed } from "@/services/supply/types";
import {
  getIllustrativeTradeService,
  getTradeService,
} from "@/services/trade/service";
import {
  COUNTRY_NAMES,
  type Article,
  type ArticleDetail,
  type DataSource,
  type DataStatus,
  type HarvestRegion,
  type MarketBriefing,
  type PriceQuote,
  type PriceUnit,
  type StripQuote,
  type SupplySnapshot,
  type TradeOverview,
} from "@/services/types";

export interface HomeService {
  getMarketStrip(): Promise<StripQuote[]>;
  getLeadBriefing(): Promise<MarketBriefing>;
  /** One price per real series, then the samples still shown. */
  getKeyPrices(): Promise<PriceQuote[]>;
  getSupplySnapshot(): Promise<SupplySnapshot>;
  getHarvestRegions(): Promise<HarvestRegion[]>;
  getTradeOverview(): Promise<TradeOverview>;
  /** The latest analysis with its full text, when one is published. */
  getLeadAnalysis(): Promise<ArticleDetail | null>;
  getSecondaryAnalysis(): Promise<Article[]>;
  /** When the key prices were last updated. */
  getLastUpdated(): Promise<string>;
}

/**
 * Strip entries for key prices, read from the key price records by code
 * and placed before the quotes the table does not carry. Values are
 * passed through unconverted.
 */
export function buildMarketStrip(
  quotes: PriceQuote[],
  codes: { code: string; name: string }[],
  others: StripQuote[],
): StripQuote[] {
  const fromKeyPrices = codes.map(({ code, name }) => {
    const quote = quotes.find((candidate) => candidate.code === code);
    if (!quote) throw new Error(`No key price record for strip code ${code}`);
    return {
      id: `st-${quote.id}`,
      name,
      country: quote.country,
      value: quote.price,
      unit: quote.unit,
      changePercent: quote.changePercent,
      observedAt: quote.observedAt,
      status: quote.status,
    };
  });
  return [...fromKeyPrices, ...others];
}

/** Sample sources stand in for real ones, so their figures are illustrative. */
function statusFor(sourceId: SourceId, status: DataStatus): DataStatus {
  return getSource(sourceId).isSample ? "illustrative" : status;
}

/**
 * Supply snapshot rows: each country's balance for the campaign, compared
 * with its balance for the previous campaign. Imports are the balance's
 * own stated figure, never a residual.
 */
export function buildSupplySnapshot(
  campaign: string,
  previousCampaign: string,
  current: SupplyBalanceComputed[],
  previous: SupplyBalanceComputed[],
): SupplySnapshot {
  const first = current[0];
  if (!first) throw new Error(`No supply balance for ${campaign}`);
  return {
    campaign,
    previousCampaign,
    rows: current.map((balance) => {
      const before = previous.find((row) => row.country === balance.country);
      if (!before) {
        throw new Error(`No ${previousCampaign} balance for ${balance.country}`);
      }
      return {
        country: balance.country,
        productionMhl: balance.productionMhl,
        openingStocksMhl: balance.openingStocksMhl,
        importsMhl: balance.importsMhl,
        availabilityMhl: balance.availabilityMhl,
        vsPreviousPercent:
          (balance.availabilityMhl / before.availabilityMhl - 1) * 100,
      };
    }),
    takeaway: supplySnapshotText.takeaway,
    note: supplySnapshotText.note,
    status: statusFor(first.sourceId, first.status),
    source: { name: getSource(first.sourceId).name },
    updatedAt: first.updatedAt,
  };
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

function marketName(row: MarketRow): string {
  return row.series.appellation ?? row.series.region;
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
    market: marketName(row),
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

/** The homepage as written against the illustrative series. */
class FixtureHomeService implements HomeService {
  /** Every sample key price, as the sample publications were written. */
  protected async samplePrices(): Promise<PriceQuote[]> {
    return sampleKeyPrices(getIllustrativeMarketsService(), keyPriceCodes);
  }

  async getMarketStrip(): Promise<StripQuote[]> {
    const quotes = await this.samplePrices();
    return buildMarketStrip(
      quotes,
      stripPriceCodes.filter(({ code }) =>
        quotes.some((quote) => quote.code === code),
      ),
      stripOtherQuotes,
    );
  }

  async getLeadBriefing(): Promise<MarketBriefing> {
    return leadBriefing;
  }

  async getKeyPrices(): Promise<PriceQuote[]> {
    return this.samplePrices();
  }


  async getSupplySnapshot(): Promise<SupplySnapshot> {
    const supply = getSupplyService();
    const campaigns = await supply.getCampaigns();
    const campaign = await supply.getCurrentCampaign();
    const index = campaigns.findIndex((c) => c.code === campaign);
    const previousCampaign = campaigns[index - 1]?.code;
    if (!previousCampaign) throw new Error(`No campaign before ${campaign}`);
    const [current, previous] = await Promise.all([
      supply.getBalances(campaign),
      supply.getBalances(previousCampaign),
    ]);
    return buildSupplySnapshot(campaign, previousCampaign, current, previous);
  }

  async getHarvestRegions(): Promise<HarvestRegion[]> {
    const reports = await getHarvestService().getRegionReports();
    return harvestMonitorRegions.map(({ reportId, condition }) => {
      const report = reports.find((candidate) => candidate.id === reportId);
      if (!report) throw new Error(`No harvest report ${reportId}`);
      return {
        id: report.id,
        region: report.region,
        country: report.country,
        stage: report.stage,
        condition,
        conditionNote: report.weather,
        expected: report.direction,
        updatedAt: report.updatedAt.slice(0, 10),
        status: report.status,
      };
    });
  }

  async getTradeOverview(): Promise<TradeOverview> {
    return getIllustrativeTradeService().getOverview();
  }

  async getLeadAnalysis(): Promise<ArticleDetail | null> {
    const editorial = getEditorialService();
    const [lead] = await editorial.getArticlesByKind("analysis", 1);
    return lead ? editorial.getArticle(lead.id) : null;
  }

  async getSecondaryAnalysis(): Promise<Article[]> {
    const latest = await getEditorialService().getArticlesByKind("analysis", 3);
    return latest.slice(1);
  }

  async getLastUpdated(): Promise<string> {
    return HOME_UPDATED_AT;
  }
}

/**
 * Each country's real national bulk wine prices, each with its previous
 * observation: a week earlier for weekly series, a month earlier for
 * monthly ones. Regional prices are on the Markets pages.
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

/**
 * A real quote's strip name: the country for a national average, which
 * every country has, otherwise the market; then the colour, if any.
 */
function stripName(row: MarketRow): string {
  const { series } = row;
  const market =
    series.region === NATIONAL_AVERAGE
      ? COUNTRY_NAMES[series.country]
      : marketName(row);
  return [market, series.colour].filter(Boolean).join(" ");
}

function sourceOf(row: MarketRow): DataSource {
  const source = getSource(row.series.sourceId);
  return { name: source.name, url: source.url };
}

/** Real prices first, then the illustrative series still on the site. */
class LiveHomeService extends FixtureHomeService {
  /**
   * The sample key prices left on the live site: a sample withdrawn for a
   * real series covering it is not shown.
   */
  protected async samplePrices(): Promise<PriceQuote[]> {
    const markets = getMarketsService();
    const rows = await Promise.all(keyPriceCodes.map((code) => markets.getRow(code)));
    return sampleKeyPrices(
      markets,
      keyPriceCodes.filter((_, index) => rows[index] !== null),
    );
  }

  /**
   * The current Weekly Briefing, written from the real series: the
   * national averages as the summary, the rest as the development. The
   * sample while no real series exists.
   */
  async getLeadBriefing(): Promise<MarketBriefing> {
    const edition = await getBriefingService().getCurrentEdition();
    if (!edition) return super.getLeadBriefing();
    const [summary, ...rest] = edition.summary.split(/(?<=\.) (?=Of the |New monthly )/);
    return {
      headline: edition.headline,
      summary,
      development: rest.join(" ") || undefined,
      updatedAt: edition.date,
      status: "final",
      outlookHref: "/insights/weekly-briefing",
      outlookLabel: "Read the weekly briefing",
    };
  }

  async getMarketStrip(): Promise<StripQuote[]> {
    const imported = (await importedPrices()).flatMap(({ row, previous }) => {
      const unit = priceUnit(row);
      if (!unit) return [];
      return [
        {
          id: `st-${row.series.code.toLowerCase()}`,
          name: stripName(row),
          country: row.series.country,
          value: row.latest.value,
          unit,
          changePercent: (row.latest.value / previous.value - 1) * 100,
          observedAt: row.latest.date,
          status: row.latest.status,
          source: sourceOf(row),
        },
      ];
    });
    return [...imported, ...(await super.getMarketStrip())];
  }

  async getKeyPrices(): Promise<PriceQuote[]> {
    const imported = (await importedPrices()).flatMap(
      (price) => keyPrice(price, sourceOf(price.row)) ?? [],
    );
    return [...imported, ...(await super.getKeyPrices())];
  }

  async getTradeOverview(): Promise<TradeOverview> {
    // Eurostat when Supabase is configured.
    return getTradeService().getOverview();
  }

  async getLastUpdated(): Promise<string> {
    const updates = (await importedPrices()).map(({ row }) => row.latest.updatedAt);
    return [HOME_UPDATED_AT, ...updates].sort().at(-1)!;
  }
}

let service: HomeService | null = null;
let illustrative: HomeService | null = null;

/** The homepage as published: real sources where connected. */
export function getHomeService(): HomeService {
  service ??= new LiveHomeService();
  return service;
}

/**
 * Always the illustrative series, for sample publications such as the
 * Market Outlook, whose text was written against them.
 */
export function getIllustrativeHomeService(): HomeService {
  illustrative ??= new FixtureHomeService();
  return illustrative;
}
