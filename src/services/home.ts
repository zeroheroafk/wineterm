/**
 * Homepage data service.
 *
 * Aggregates what the homepage needs behind one typed interface. Figures
 * that exist in another domain are read from that domain's service and
 * never copied: the key prices are the national series of the markets
 * catalogue, the lead article and the analysis are the latest published
 * by the editorial service, and the industry headlines the latest stories.
 */

import { getEditorialService } from "@/services/editorial";
import { getIndustryService } from "@/services/industry";
import { getMarketsService } from "@/services/markets/service";
import { getSource } from "@/services/markets/sources";
import {
  NATIONAL_AVERAGE,
  type MarketRow,
  type SeriesObservation,
} from "@/services/markets/types";
import {
  COUNTRY_NAMES,
  type Article,
  type ArticleDetail,
  type DataSource,
  INDUSTRY_TOPIC_LABELS,
  type IndustryItem,
  type LeadArticle,
  type PriceQuote,
  type PriceUnit,
} from "@/services/types";

export interface HomeService {
  /**
   * The latest published article, of any kind, and its photograph, when
   * one is published.
   */
  getLeadArticle(): Promise<LeadArticle | null>;
  /** One price per national bulk wine series. */
  getKeyPrices(): Promise<PriceQuote[]>;
  /**
   * The latest analysis with its full text, when one is published, after
   * the lead article: an analysis that leads the page is not shown twice.
   */
  getLeadAnalysis(): Promise<ArticleDetail | null>;
  /** The two analyses after the lead analysis. */
  getSecondaryAnalysis(): Promise<Article[]>;
  /** The latest industry stories, each linked to its row on News. */
  getIndustryHeadlines(limit: number): Promise<IndustryItem[]>;
  /** When the key prices were last updated; null without any. */
  getLastUpdated(): Promise<string | null>;
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

/**
 * The market a price is for: the country for a national average, which
 * every country has, otherwise the appellation or region.
 */
function marketName(row: MarketRow): string {
  const { series } = row;
  if (series.region === NATIONAL_AVERAGE) return COUNTRY_NAMES[series.country];
  return series.appellation ?? series.region;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function sourceOf(row: MarketRow): DataSource {
  const source = getSource(row.series.sourceId);
  return { name: source.name, url: source.url };
}

/**
 * A key price from a catalogue series: the latest observation with its
 * change on the previous one and on a year earlier, and the recorded
 * figures of a series recorded per hectolitre-degree. Null when the
 * series is priced in a unit the key prices do not show.
 */
function keyPrice({ row, previous }: CataloguePrice): PriceQuote | null {
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
    source: sourceOf(row),
    perDegree: recorded,
  };
}

/**
 * Each country's national bulk wine prices, each with its previous
 * observation: a week earlier for weekly series, a month earlier for
 * monthly ones. Regional prices are on the Markets pages.
 */
async function nationalPrices(): Promise<CataloguePrice[]> {
  const markets = getMarketsService();
  const rows = (await markets.getRows("bulk-wine")).filter(
    (row) => row.series.region === NATIONAL_AVERAGE,
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
 * The latest analyses, leaving out the one that leads the homepage when
 * the latest article of all is an analysis.
 */
async function analysisAfterLead(limit: number): Promise<Article[]> {
  const editorial = getEditorialService();
  const [[lead], analyses] = await Promise.all([
    editorial.getLatestArticles(1),
    editorial.getArticlesByKind("analysis", limit + 1),
  ]);
  return analyses.filter((article) => article.id !== lead?.id).slice(0, limit);
}

class EditorialHomeService implements HomeService {
  async getLeadArticle(): Promise<LeadArticle | null> {
    const editorial = getEditorialService();
    const [latest] = await editorial.getLatestArticles(1);
    const article = latest ? await editorial.getArticle(latest.id) : null;
    return article
      ? {
          kind: article.kind,
          headline: article.headline,
          summary: article.standfirst,
          publishedAt: article.publishedAt,
          readingMinutes: article.readingMinutes,
          href: article.href,
          hero: article.hero,
        }
      : null;
  }

  async getKeyPrices(): Promise<PriceQuote[]> {
    return (await nationalPrices()).flatMap((price) => keyPrice(price) ?? []);
  }

  async getLeadAnalysis(): Promise<ArticleDetail | null> {
    const [lead] = await analysisAfterLead(1);
    return lead ? getEditorialService().getArticle(lead.id) : null;
  }

  async getSecondaryAnalysis(): Promise<Article[]> {
    return (await analysisAfterLead(3)).slice(1);
  }

  async getIndustryHeadlines(limit: number): Promise<IndustryItem[]> {
    const stories = await getIndustryService().getLatestStories(limit);
    return stories.map((story) => ({
      id: story.id,
      headline: story.headline,
      publishedAt: story.publishedAt,
      href: `/insights/news#${story.id}`,
      topic: INDUSTRY_TOPIC_LABELS[story.topic],
    }));
  }

  async getLastUpdated(): Promise<string | null> {
    const updates = (await nationalPrices()).map(({ row }) => row.latest.updatedAt);
    return updates.sort().at(-1) ?? null;
  }
}

let service: HomeService | null = null;

export function getHomeService(): HomeService {
  service ??= new EditorialHomeService();
  return service;
}
