import { ArticlePreview } from "@/components/editorial/ArticlePreview";
import { BriefingBand } from "@/components/editorial/BriefingBand";
import { IndustryHeadlineList } from "@/components/editorial/IndustryHeadlineList";
import { Container } from "@/components/layout/Container";
import { HarvestMonitor } from "@/components/market/HarvestMonitor";
import { KeyPricesTable } from "@/components/market/KeyPricesTable";
import { LeadBriefing } from "@/components/market/LeadBriefing";
import { MarketStatusStrip } from "@/components/market/MarketStatusStrip";
import { SupplyComparison } from "@/components/market/SupplyComparison";
import { TradeFlowsPanel } from "@/components/market/TradeFlowsPanel";
import { ButtonLink } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getHomeService } from "@/services/home";

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

  return (
    <>
      <MarketStatusStrip quotes={strip} />

      <Container>
        <section className="grid grid-cols-1 gap-8 py-9 lg:grid-cols-[minmax(0,1fr)_minmax(0,27rem)] lg:gap-12">
          <div className="max-w-xl">
            <p className="wt-label text-wine">European wine market desk</p>
            <h1 className="wt-headline mt-3 text-4xl font-semibold leading-tight text-ink sm:text-5xl">
              Market intelligence for the wine industry.
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-ink-soft">
              Prices, production, stocks, trade and crop intelligence for
              wineries, growers and the global wine trade.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <ButtonLink href="/markets">Explore markets</ButtonLink>
              <ButtonLink href="/briefing" variant="secondary">
                Get the weekly briefing
              </ButtonLink>
            </div>
            <p className="wt-label mt-6 text-ink-soft">
              Coverage: Spain and Portugal first, with comparative data for
              France and Italy
            </p>
          </div>
          <LeadBriefing briefing={briefing} />
        </section>

        <section className="mt-2">
          <SectionHeader
            kicker="Markets"
            title="Key bulk wine prices"
            action={{
              label: "All bulk wine prices",
              href: "/markets/bulk-wine",
            }}
          />
          <div className="mt-5">
            <KeyPricesTable quotes={keyPrices} updatedAt={updatedAt} />
          </div>
        </section>

        <section className="mt-14">
          <SectionHeader
            kicker="Crop & Supply"
            title="European supply snapshot"
            action={{ label: "Production and stocks", href: "/crop-supply" }}
          />
          <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] lg:gap-10">
            <div>
              <p className="wt-label text-ink">{supply.campaign}</p>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                {supply.note}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                France and Iberia carry the downside this season, while Italy
                opens near its five-year norm.
              </p>
            </div>
            <SupplyComparison snapshot={supply} />
          </div>
        </section>

        <section className="mt-14">
          <SectionHeader
            kicker="Crop & Supply"
            title="Harvest monitor"
            description="Stage, vineyard condition and expected crop for representative regions, updated as campaigns progress."
            action={{ label: "Harvest outlook", href: "/crop-supply/harvest" }}
          />
          <div className="mt-5">
            <HarvestMonitor regions={harvest} />
          </div>
        </section>

        <section className="mt-14">
          <SectionHeader
            kicker="Trade"
            title="Trade flows"
            action={{ label: "Full trade section", href: "/trade" }}
          />
          <div className="mt-5">
            <TradeFlowsPanel overview={trade} />
          </div>
        </section>

        <section className="mt-14">
          <SectionHeader
            kicker="Insights"
            title="Analysis and industry"
            action={{ label: "All insights", href: "/insights" }}
          />
          <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
            <div>
              <ArticlePreview article={leadAnalysis} variant="lead" />
              <div className="mt-6 border-t-2 border-ink pt-4">
                {secondaryAnalysis.map((article) => (
                  <ArticlePreview key={article.id} article={article} />
                ))}
              </div>
            </div>
            <div className="space-y-8">
              <IndustryHeadlineList
                title="Industry news"
                href="/insights/news"
                items={digest.news}
              />
              <IndustryHeadlineList
                title="Companies and deals"
                href="/industry/deals"
                items={digest.deals}
              />
              <IndustryHeadlineList
                title="Regulation"
                href="/industry/regulation"
                items={digest.regulation}
              />
            </div>
          </div>
        </section>

        <div className="mt-14">
          <BriefingBand />
        </div>
      </Container>
    </>
  );
}
