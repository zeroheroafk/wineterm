import type { Metadata } from "next";
import { cacheLife } from "next/cache";

import { ForecastRangeTable } from "@/components/harvest/ForecastRangeTable";
import { Container } from "@/components/layout/Container";
import { SectionPageHeader } from "@/components/layout/SectionPageHeader";
import { TradeFlowsPanel } from "@/components/market/TradeFlowsPanel";
import { SpainBalanceTable } from "@/components/supply/SpainBalanceTables";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SourceLine } from "@/components/ui/SourceLine";
import { EmptyState } from "@/components/ui/states";
import { formatDate, formatMonthYear } from "@/lib/format";
import { primaryNavigation } from "@/lib/navigation";
import { getHarvestService } from "@/services/harvest/service";
import { getSource } from "@/services/markets/sources";
import { getSupplyService } from "@/services/supply/service";
import { getTradeService } from "@/services/trade/service";

export const metadata: Metadata = {
  title: "Market data",
  description:
    "Supply, harvest and trade at a glance: Spain's declared wine balance, the official harvest estimates for Spain, Portugal, France and Italy, and their wine exports.",
};

/**
 * The Market data tab: Spain's declared balance, the official harvest
 * estimates and the trade snapshot on one page, each linking to its full
 * section. The homepage keeps to prices and editorial. The balance and
 * the trade snapshot read the database, so the page is regenerated at
 * most hourly.
 */
export default async function MarketDataPage() {
  "use cache";
  cacheLife("hours");

  const harvest = getHarvestService();
  const trade = getTradeService();
  const [spain, campaign, forecasts, overview] = await Promise.all([
    getSupplyService().getSpainBalance(),
    harvest.getCampaign(),
    harvest.getCountryForecasts(),
    trade ? trade.getOverview() : null,
  ]);
  const spainSource = spain ? getSource(spain.sourceId) : null;

  return (
    <Container className="pb-16">
      <SectionPageHeader
        section={primaryNavigation[1]}
        crumbs={[{ label: "Market data" }]}
        kicker="Market data"
        title="Supply, harvest and trade"
        description="The wine market at a glance: how much wine Spain's declarants hold and move, what each country's harvest is estimated at, and where the exports of Spain, Portugal, France and Italy go. Each panel links to its full section."
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
          title="Spain's declared wine balance"
          description={
            spain
              ? `From 1 August to the end of ${formatMonthYear(spain.latestMonth)}, as declared to the Ministry of Agriculture by producers of 1,000 hl or more and by warehouse holders, against the campaign before to the same month.`
              : undefined
          }
          action={{ label: "Full supply balance", href: "/supply" }}
        />
        <div className="mt-5 max-w-3xl">
          {spain && spainSource ? (
            <>
              <SpainBalanceTable latest={spain.latest} previous={spain.previous} />
              <div className="mt-3">
                <SourceLine
                  source={{ name: spainSource.name, url: spainSource.url }}
                  updatedAt={spain.updatedAt}
                />
              </div>
              <p className="wt-label mt-2 leading-relaxed text-ink-soft">
                {formatMonthYear(spain.latestMonth)} was published on{" "}
                {formatDate(spain.publishedAt)}. Wine only; producers of less
                than 1,000 hl a year do not declare monthly.
              </p>
            </>
          ) : (
            <EmptyState
              title="No declarations to show"
              detail="Spain's balance is read from the database, which this build is not connected to."
            />
          )}
        </div>
      </section>

      <section
        id="harvest"
        aria-labelledby="data-harvest"
        className="mt-14 scroll-mt-6"
      >
        <SectionHeader
          variant="editorial"
          id="data-harvest"
          kicker="Harvest"
          title="Official production estimates"
          description="Each country's latest official estimate for the vintage against the previous campaign, as the same source counts it."
          action={{ label: "Full harvest page", href: "/harvest" }}
        />
        <div className="mt-5">
          <ForecastRangeTable
            forecasts={forecasts}
            campaign={campaign}
            withCommentary
            note="Each source counts its own scope: France all wine, including wine for brandy; Portugal wine; Spain wine and must. Figures are revised as the harvest declarations come in."
          />
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
          description={
            overview
              ? `Exports from Spain, Portugal, France and Italy in million hectolitres, ${overview.period}. Year-on-year changes compare with the same period a year earlier.`
              : undefined
          }
          action={{ label: "Explore trade data", href: "/trade" }}
        />
        <div className="mt-5">
          {overview ? (
            <TradeFlowsPanel overview={overview} />
          ) : (
            <EmptyState
              title="No trade figures to show"
              detail="Trade figures are read from the database, which this build is not connected to."
              action={<ArrowLink href="/trade">Trade page</ArrowLink>}
            />
          )}
        </div>
      </section>
    </Container>
  );
}
