import Link from "next/link";

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

      <section className="wt-hero overflow-hidden border-b border-rule bg-paper">
        <Container className="relative">
          <div className="grid grid-cols-1 gap-9 py-10 sm:py-14 lg:grid-cols-[minmax(0,1.2fr)_minmax(22rem,0.8fr)] lg:items-center lg:gap-16 lg:py-18">
            <div className="relative z-10 max-w-2xl">
              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-wine" aria-hidden="true" />
                <p className="wt-label text-wine">European wine market desk</p>
              </div>
              <h1 className="wt-headline mt-5 text-[2.8rem] font-semibold leading-[0.98] tracking-[-0.035em] text-ink sm:text-6xl lg:text-[4.35rem]">
                Clarity for a market
                <span className="block font-normal italic text-wine">
                  in motion.
                </span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-soft sm:text-lg">
                Prices, production, stocks, trade and crop intelligence for
                wineries, growers and the global wine trade.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <ButtonLink href="/markets" className="h-10 px-5">
                  Explore market data <span aria-hidden="true">&rarr;</span>
                </ButtonLink>
                <ButtonLink
                  href="/briefing"
                  variant="secondary"
                  className="h-10 px-5"
                >
                  Get the weekly briefing
                </ButtonLink>
              </div>
              <div className="mt-9 grid max-w-xl grid-cols-2 border-y border-rule sm:grid-cols-4">
                {[
                  ["04", "Markets"],
                  ["05", "Data series"],
                  ["Weekly", "Analysis"],
                  ["EU", "Coverage"],
                ].map(([value, label]) => (
                  <div
                    key={label}
                    className="border-l border-rule px-3 py-3 first:border-l-0 [&:nth-child(odd)]:border-l-0 sm:[&:nth-child(odd)]:border-l sm:first:border-l-0"
                  >
                    <p className="tnum font-mono text-sm font-medium text-ink">
                      {value}
                    </p>
                    <p className="wt-label mt-1 text-ink-soft">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative z-10 lg:py-3">
              <p className="wt-label mb-2 flex items-center justify-between text-ink-soft">
                <span>This week at a glance</span>
                <span className="text-wine">WT / 01</span>
              </p>
              <div className="shadow-[12px_12px_0_var(--wt-wine-wash)]">
                <LeadBriefing briefing={briefing} />
              </div>
            </div>
          </div>
        </Container>
      </section>

      <Container className="pt-12 sm:pt-16">
        <aside
          aria-label="WineTerm data principles"
          className="grid border-y border-rule md:grid-cols-[1fr_1fr_1fr_auto] md:items-stretch"
        >
          {[
            ["01", "Source-led", "Every figure keeps its provenance."],
            ["02", "Unit-exact", "Original market units stay visible."],
            ["03", "Decision-ready", "Signals are separated from noise."],
          ].map(([number, title, description]) => (
            <div
              key={number}
              className="grid grid-cols-[2rem_1fr] gap-2 border-b border-rule py-3 last:border-b-0 md:border-r md:border-b-0 md:px-4 md:first:pl-0"
            >
              <span className="wt-label pt-0.5 text-wine">{number}</span>
              <div>
                <p className="text-sm font-semibold text-ink">{title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-ink-soft">
                  {description}
                </p>
              </div>
            </div>
          ))}
          <Link
            href="/insights/methodology"
            className="wt-label flex items-center py-3 text-wine transition-colors hover:text-wine-deep md:pl-5"
          >
            Our methodology
            <span className="ml-2" aria-hidden="true">
              &rarr;
            </span>
          </Link>
        </aside>

        <section className="mt-14">
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
            action={{ label: "Production and stocks", href: "/supply" }}
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
            action={{ label: "Harvest outlook", href: "/harvest" }}
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
