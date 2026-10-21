import type { Metadata } from "next";

import { Container } from "@/components/layout/Container";
import { SectionPageHeader } from "@/components/layout/SectionPageHeader";
import {
  HarvestMonitor,
  representativeRegions,
} from "@/components/market/HarvestMonitor";
import { SupplyComparison } from "@/components/market/SupplyComparison";
import { TradeFlowsPanel } from "@/components/market/TradeFlowsPanel";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { sharedStatusNote } from "@/components/ui/DataStatusLabel";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { DataNote } from "@/components/ui/SourceLine";
import { formatDateRange } from "@/lib/format";
import { primaryNavigation } from "@/lib/navigation";
import { getHomeService } from "@/services/home";
import { cacheLife } from "next/cache";

export const metadata: Metadata = {
  title: "Market data",
  description:
    "Supply, harvest and trade in Spain, Portugal, France and Italy at a glance: availability by country, harvest conditions and wine exports.",
};

/**
 * The Market data tab: the supply snapshot, the harvest monitor and the
 * trade snapshot on one page, each linking to its full section. The
 * homepage keeps to prices and editorial. The trade snapshot reads the
 * database, so the page is regenerated at most hourly.
 */
export default async function MarketDataPage() {
  "use cache";
  cacheLife("hours");

  const home = getHomeService();
  const [supply, harvest, trade] = await Promise.all([
    home.getSupplySnapshot(),
    home.getHarvestRegions(),
    home.getTradeOverview(),
  ]);

  const regions = representativeRegions(harvest);
  const reportDates = regions.map((region) => region.updatedAt).sort();
  const harvestStatus = regions.every(
    (region) => region.status === regions[0]?.status,
  )
    ? regions[0]?.status
    : undefined;

  return (
    <Container className="pb-16">
      <SectionPageHeader
        section={primaryNavigation[1]}
        crumbs={[{ label: "Market data" }]}
        kicker="Market data"
        title="Supply, harvest and trade"
        description="The wine market of Spain, Portugal, France and Italy at a glance: how much wine is available, how the harvest is going and where exports go. Each panel links to its full section."
        activeHref="/data"
      />

      <section
        id="supply"
        aria-labelledby="data-supply"
        className="mt-10 scroll-mt-6"
      >
        <SectionHeader
          variant="editorial"
          id="data-supply"
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

        <div id="harvest" className="mt-12 scroll-mt-6">
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

      <section
        id="trade"
        aria-labelledby="data-trade"
        className="mt-14 scroll-mt-6"
      >
        <SectionHeader
          variant="editorial"
          id="data-trade"
          kicker="Trade"
          title="Trade snapshot"
          description={`Exports from Spain, Portugal, France and Italy in million hectolitres, ${trade.period}. Year-on-year changes compare with the same period a year earlier.`}
          action={{ label: "Explore trade data", href: "/trade" }}
        />
        <div className="mt-5">
          <TradeFlowsPanel overview={trade} />
        </div>
      </section>
    </Container>
  );
}
