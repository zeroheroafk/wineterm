import type { Metadata } from "next";

import { ShareChart } from "@/components/charts/ShareChart";
import { ArticlePreview } from "@/components/editorial/ArticlePreview";
import { BriefingBand } from "@/components/editorial/BriefingBand";
import { IndustryHeadlineList } from "@/components/editorial/IndustryHeadlineList";
import { Container } from "@/components/layout/Container";
import { KeyPricesTable } from "@/components/market/KeyPricesTable";
import { LeadArticle } from "@/components/market/LeadArticle";
import { ButtonLink } from "@/components/ui/Button";
import { JsonLd } from "@/components/ui/JsonLd";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { absoluteUrl, organizationJsonLd, SITE_NAME } from "@/lib/seo";
import { getHomeService } from "@/services/home";
import { cacheLife } from "next/cache";

/** Headlines in the news rail; Insights > News carries the rest. */
const INDUSTRY_HEADLINES = 5;

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

/**
 * The site and its publisher, which search results draw on for the site
 * name and logo. Google reads them from the homepage.
 */
const SITE_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "WebSite", name: SITE_NAME, url: absoluteUrl("/") },
    organizationJsonLd(),
  ],
};

/**
 * The homepage, kept to four blocks: the introduction over the latest
 * article, whether an analysis, a Weekly Briefing or a monthly report, set
 * across the full width on its photograph, the key bulk wine prices, the
 * latest analysis and industry news, and the newsletter signup. The trade snapshot has its own tab, Market data
 * (/data). The key prices read the database, so the page is regenerated
 * at most hourly.
 */
export default async function Home() {
  "use cache";
  cacheLife("hours");

  const home = getHomeService();
  const [
    lead,
    keyPrices,
    leadAnalysis,
    secondaryAnalysis,
    industry,
    updatedAt,
  ] = await Promise.all([
    home.getLeadArticle(),
    home.getKeyPrices(),
    home.getLeadAnalysis(),
    home.getSecondaryAnalysis(),
    home.getIndustryHeadlines(INDUSTRY_HEADLINES),
    home.getLastUpdated(),
  ]);

  return (
    <>
      <JsonLd data={SITE_JSON_LD} />
      <Container>
        <section
          aria-labelledby="home-intro"
          className="grid grid-cols-1 gap-x-12 gap-y-4 pt-8 pb-9 sm:pt-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] lg:items-end lg:pb-10 xl:grid-cols-[minmax(0,1fr)_minmax(0,31rem)] xl:gap-x-16"
        >
          <h1
            id="home-intro"
            className="wt-headline max-w-xl text-[2.25rem] leading-[1.08] font-semibold tracking-[-0.02em] text-balance text-ink sm:text-[2.625rem] lg:text-[2.875rem]"
          >
            Wine sector news and market intelligence.
          </h1>
          <div>
            <p className="max-w-lg text-[1.0625rem] leading-[1.6] text-pretty text-ink-soft sm:text-lg">
              Industry stories, bulk wine prices, supply and trade figures for
              wineries, growers and the international wine trade.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <ButtonLink href="/markets" className="h-10 px-5">
                Explore markets
              </ButtonLink>
              <ButtonLink
                href="/insights/news"
                variant="secondary"
                className="h-10 px-5"
              >
                Latest news
              </ButtonLink>
            </div>
          </div>
        </section>
      </Container>

      {lead ? <LeadArticle article={lead} /> : null}

      <Container>
        <section aria-labelledby="home-prices" className="mt-12">
          <SectionHeader
            variant="editorial"
            id="home-prices"
            kicker="Markets"
            title="Bulk wine prices"
            action={{
              label: "All prices",
              href: "/markets/bulk-wine",
            }}
          />
          <div className="mt-4">
            <KeyPricesTable
              quotes={keyPrices}
              updatedAt={updatedAt ?? undefined}
              methodologyHref="/insights/methodology#bulk-prices"
            />
          </div>
        </section>

        <section aria-labelledby="home-analysis" className="mt-16">
          <SectionHeader
            variant="editorial"
            id="home-analysis"
            kicker="Insights"
            title="Latest analysis"
            action={{ label: "All analysis", href: "/insights/analysis" }}
          />
          <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,3fr)] lg:gap-0">
            <div className="min-w-0 lg:pr-10">
              {leadAnalysis ? (
                <ArticlePreview
                  article={leadAnalysis}
                  variant="feature"
                  visual={
                    leadAnalysis.chart ? (
                      <ShareChart
                        chart={leadAnalysis.chart}
                        titleId="lead-analysis-chart"
                      />
                    ) : undefined
                  }
                />
              ) : null}
              {secondaryAnalysis.length > 0 ? (
                <div className="mt-8 grid grid-cols-1 gap-7 border-t border-rule pt-6 sm:grid-cols-2 sm:gap-8">
                  {secondaryAnalysis.map((article) => (
                    <ArticlePreview
                      key={article.id}
                      article={article}
                      variant="compact"
                    />
                  ))}
                </div>
              ) : null}
            </div>
            <aside
              aria-labelledby="home-industry"
              className="min-w-0 border-t border-rule pt-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8"
            >
              <IndustryHeadlineList
                title="Industry news"
                titleId="home-industry"
                items={industry}
                action={{ label: "All news", href: "/insights/news" }}
              />
            </aside>
          </div>
        </section>

        <div className="mt-16">
          <BriefingBand />
        </div>
      </Container>
    </>
  );
}
