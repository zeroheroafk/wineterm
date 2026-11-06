import { ArticlePreview } from "@/components/editorial/ArticlePreview";
import { BriefingBand } from "@/components/editorial/BriefingBand";
import { DevContentNotice } from "@/components/editorial/DevContentNotice";
import {
  NEWS_DEV_NOTICE,
  NewsLead,
  NewsList,
  TopicIndex,
} from "@/components/editorial/NewsList";
import { Container } from "@/components/layout/Container";
import { SectionNav } from "@/components/layout/SectionNav";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { navSection } from "@/lib/navigation";
import { getEditorialService } from "@/services/editorial";
import { getNewsService } from "@/services/news";

/** Stories on the homepage: the lead, then the list; News has the rest. */
const HOME_STORIES = 12;

/** Where the figures live, now that the homepage leads with the news. */
const MARKET_DATA_LINKS = [
  { label: "Bulk wine, grape and must prices", href: "/markets" },
  { label: "Production, stocks and supply", href: "/supply" },
  { label: "Harvest outlook", href: "/harvest" },
  { label: "Imports and exports", href: "/trade" },
];

/**
 * The homepage leads with the news: the top story with its photograph
 * large, then the latest stories as rows with a small photograph, their
 * tags and date. The rail carries the analysis, the way into the market
 * data and the topics. Prices, supply and trade figures live in their
 * own sections.
 */
export default async function Home() {
  const news = getNewsService();
  const [stories, counts, analysis] = await Promise.all([
    news.getLatestStories(HOME_STORIES),
    news.getTopicCounts(),
    getEditorialService().getArticlesByKind("analysis", 2),
  ]);
  const [lead, ...rest] = stories;

  return (
    <Container className="pb-16">
      <section aria-labelledby="home-title" className="pt-7 sm:pt-9">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-2">
          <h1
            id="home-title"
            className="wt-headline text-[2.25rem] leading-[1.05] font-semibold tracking-[-0.02em] text-ink sm:text-[2.75rem]"
          >
            <span className="sr-only">WineTerm: </span>Latest news
          </h1>
          <p className="max-w-md text-[0.9375rem] leading-snug text-pretty text-ink-soft sm:text-right">
            Brands, consumption, culture and lifestyle, with the markets
            behind them.
          </p>
        </div>
        <div className="mt-4">
          <SectionNav section={navSection("/news")} />
        </div>
        <div className="mt-6">
          <DevContentNotice text={NEWS_DEV_NOTICE} />
        </div>
        {lead ? (
          <div className="mt-7">
            <NewsLead story={lead} />
          </div>
        ) : null}
      </section>

      <div className="mt-10 grid grid-cols-1 gap-12 border-t border-ink pt-5 lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-14">
        <section aria-labelledby="home-more-news" className="min-w-0">
          <h2 id="home-more-news" className="wt-kicker mb-5 text-wine">
            More news
          </h2>
          <NewsList stories={rest} />
          <p className="mt-2 border-t border-rule pt-4">
            <ArrowLink href="/news">All news</ArrowLink>
          </p>
        </section>

        <aside className="min-w-0 space-y-10">
          {analysis.length > 0 ? (
            <section aria-labelledby="home-analysis">
              <h2
                id="home-analysis"
                className="wt-kicker border-b border-ink pb-2 text-wine"
              >
                Analysis
              </h2>
              <ul>
                {analysis.map((article) => (
                  <li key={article.id} className="border-b border-rule py-4">
                    <ArticlePreview article={article} variant="compact" />
                  </li>
                ))}
              </ul>
              <p className="mt-3">
                <ArrowLink href="/insights/analysis">All analysis</ArrowLink>
              </p>
            </section>
          ) : null}

          <section
            aria-labelledby="home-market-data"
            className="border-t-2 border-wine bg-paper px-4 pt-3 pb-4"
          >
            <h2 id="home-market-data" className="wt-kicker text-wine">
              Market data
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-pretty text-ink-soft">
              Prices, supply, harvest and trade figures for Spain, Portugal,
              France and Italy, with the source of every observation.
            </p>
            <ul className="mt-3 space-y-1.5">
              {MARKET_DATA_LINKS.map((link) => (
                <li key={link.href}>
                  <ArrowLink href={link.href}>{link.label}</ArrowLink>
                </li>
              ))}
            </ul>
          </section>

          <TopicIndex counts={counts} titleId="home-topics" />
        </aside>
      </div>

      <div className="mt-16">
        <BriefingBand />
      </div>
    </Container>
  );
}
