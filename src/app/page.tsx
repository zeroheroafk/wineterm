import { ShareChart } from "@/components/charts/ShareChart";
import { ArticlePreview } from "@/components/editorial/ArticlePreview";
import { BriefingBand } from "@/components/editorial/BriefingBand";
import {
  IndustryHeadlineList,
  latestIndustryHeadlines,
} from "@/components/editorial/IndustryHeadlineList";
import { Container } from "@/components/layout/Container";
import {
  HarvestMonitor,
  representativeRegions,
} from "@/components/market/HarvestMonitor";
import { KeyPricesTable } from "@/components/market/KeyPricesTable";
import { LeadBriefing } from "@/components/market/LeadBriefing";
import { MarketStatusStrip } from "@/components/market/MarketStatusStrip";
import { SupplyComparison } from "@/components/market/SupplyComparison";
import { TradeFlowsPanel } from "@/components/market/TradeFlowsPanel";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { ButtonLink } from "@/components/ui/Button";
import { sharedStatusNote } from "@/components/ui/DataStatusLabel";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { DataNote } from "@/components/ui/SourceLine";
import { formatDateRange } from "@/lib/format";
import { getHomeService } from "@/services/home";

// The prices and the trade panel read the database; regenerate at most
// hourly.
export const revalidate = 3600;

/** Headlines in the industry rail; the Industry section carries the rest. */
const INDUSTRY_HEADLINES = 5;

export default async function Home() {
  const home = getHomeService();
  const [
    strip,
    briefing,
    keyPrices,
    supply,
    harvest,
    trade,
    leadAnalysis,
    secondaryAnalysis,
    digest,
    updatedAt,
  ] = await Promise.all([
    home.getMarketStrip(),
    home.getLeadBriefing(),
    home.getKeyPrices(),
    home.getSupplySnapshot(),
    home.getHarvestRegions(),
    home.getTradeOverview(),
    home.getLeadAnalysis(),
    home.getSecondaryAnalysis(),
    home.getIndustryDigest(),
    home.getLastUpdated(),
  ]);

  const regions = representativeRegions(harvest);
  const reportDates = regions.map((region) => region.updatedAt).sort();
  const harvestStatus = regions.every(
    (region) => region.status === regions[0]?.status,
  )
    ? regions[0]?.status
    : undefined;

  return (
    <>
      <MarketStatusStrip quotes={strip} />

      <Container>
        <section
          aria-labelledby="home-intro"
          className="grid grid-cols-1 items-start gap-8 pt-7 pb-9 sm:pt-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] lg:gap-12 lg:pb-10 xl:grid-cols-[minmax(0,1fr)_minmax(0,31rem)] xl:gap-16"
        >
          {/* The top padding sets the headline's first line level with the
              first line of the briefing beside it. */}
          <div className="max-w-xl lg:pt-[1.0625rem]">
            <h1
              id="home-intro"
              className="wt-headline text-[2.25rem] leading-[1.08] font-semibold tracking-[-0.02em] text-balance text-ink sm:text-[2.625rem] lg:text-[2.875rem]"
            >
              Market intelligence for the wine industry.
            </h1>
            <p className="mt-4 max-w-lg text-[1.0625rem] leading-[1.6] text-pretty text-ink-soft sm:text-lg">
              Prices, supply and trade intelligence for wineries, growers and
              the international wine trade.
            </p>
            <div className="mt-6">
              <ButtonLink href="/markets" className="h-10 px-5">
                Explore markets
              </ButtonLink>
            </div>
          </div>
          <LeadBriefing briefing={briefing} />
        </section>

        <section aria-labelledby="home-prices">
          <SectionHeader
            variant="editorial"
            id="home-prices"
            kicker="Markets"
            title="Key bulk wine prices"
            action={{
              label: "All bulk wine prices",
              href: "/markets/bulk-wine",
            }}
          />
          <div className="mt-4">
            <KeyPricesTable
              variant="editorial"
              quotes={keyPrices}
              updatedAt={updatedAt}
              methodologyHref="/insights/methodology"
            />
          </div>
        </section>

        <section aria-labelledby="home-analysis" className="mt-14">
          <SectionHeader
            variant="editorial"
            id="home-analysis"
            kicker="Insights"
            title="Analysis and industry"
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
                items={latestIndustryHeadlines(digest, INDUSTRY_HEADLINES)}
                action={{ label: "All industry news", href: "/industry" }}
              />
            </aside>
          </div>
          <p className="mt-6 text-[0.8125rem] leading-relaxed text-ink-soft">
            Development content: the industry headlines above are illustrative
            placeholders demonstrating the editorial format, not published
            reporting.
          </p>
        </section>

        <section aria-labelledby="home-supply" className="mt-14">
          <SectionHeader
            variant="editorial"
            id="home-supply"
            kicker="Crop & Supply"
            title="Supply and harvest"
          />

          <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,19rem)_minmax(0,1fr)] lg:gap-14">
            <div>
              <h3 className="wt-headline text-[1.375rem] leading-tight font-semibold text-ink">
                European supply snapshot
              </h3>
              <p className="mt-1 text-[0.8125rem] text-ink-soft">
                {supply.campaign} campaign
              </p>
              <p className="wt-headline mt-3 text-lg leading-snug text-pretty text-ink">
                {supply.takeaway}
              </p>
              <p className="mt-3 text-[0.9375rem] leading-[1.55] text-pretty text-ink-soft">
                {supply.note}
              </p>
              <ul className="mt-4 space-y-1.5">
                <li>
                  <ArrowLink href="/supply">Full supply balance</ArrowLink>
                </li>
                <li>
                  <ArrowLink href="/insights/methodology#supply-balance">
                    How availability is calculated
                  </ArrowLink>
                </li>
              </ul>
            </div>
            <SupplyComparison snapshot={supply} />
          </div>

          <div className="mt-12">
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
              <h3 className="wt-headline text-[1.375rem] leading-tight font-semibold text-ink">
                Harvest monitor
              </h3>
              <ArrowLink href="/harvest">Full harvest monitor</ArrowLink>
            </div>
            <p className="mt-1 text-[0.8125rem] text-ink-soft">
              One representative region per country: stage, vineyard condition
              and expected crop.
            </p>
            <div className="mt-4">
              <HarvestMonitor regions={regions} />
            </div>
            {reportDates.length > 0 ? (
              <DataNote
                className="mt-3"
                lead={harvestStatus ? sharedStatusNote(harvestStatus) : null}
              >
                Field reports dated{" "}
                <span className="whitespace-nowrap">
                  {formatDateRange(
                    reportDates[0],
                    reportDates[reportDates.length - 1],
                  )}
                  .
                </span>
              </DataNote>
            ) : null}
          </div>
        </section>

        <section aria-labelledby="home-trade" className="mt-14">
          <SectionHeader
            variant="editorial"
            id="home-trade"
            kicker="Trade"
            title="Trade snapshot"
            description={`Exports from Spain, Portugal, France and Italy in million hectolitres, ${trade.period}. Year-on-year changes compare with the same period a year earlier.`}
            action={{ label: "Explore trade data", href: "/trade" }}
          />
          <div className="mt-5">
            <TradeFlowsPanel overview={trade} />
          </div>
        </section>

        <div className="mt-16">
          <BriefingBand />
        </div>
      </Container>
    </>
  );
}
