import type { Metadata } from "next";
import { cacheLife } from "next/cache";

import { Container } from "@/components/layout/Container";
import { SectionPageHeader } from "@/components/layout/SectionPageHeader";
import { TradeFlowsPanel } from "@/components/market/TradeFlowsPanel";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { EmptyState } from "@/components/ui/states";
import { primaryNavigation } from "@/lib/navigation";
import { getTradeService } from "@/services/trade/service";

export const metadata: Metadata = {
  title: "Market data",
  description:
    "Wine trade at a glance: the leading exporters among Spain, Portugal, France and Italy, where their wine goes, and in what form.",
};

/**
 * The Market data tab: the trade snapshot, linking to the full trade
 * section. Spain's declared balance and the official harvest estimates
 * are hidden with the rest of Crop & Supply for now (see
 * src/lib/navigation.ts). The homepage keeps to prices and editorial.
 * The trade snapshot reads the database, so the page is regenerated at
 * most hourly.
 */
export default async function MarketDataPage() {
  "use cache";
  cacheLife("hours");

  const trade = getTradeService();
  const overview = trade ? await trade.getOverview() : null;

  return (
    <Container className="pb-16">
      <SectionPageHeader
        section={primaryNavigation[1]}
        crumbs={[{ label: "Market data" }]}
        kicker="Market data"
        title="Trade"
        description="Wine trade at a glance: which of Spain, Portugal, France and Italy export the most, where their wine goes, and in what form. The full figures by customs category are on the trade page."
        activeHref="/data"
      />

      <section
        id="trade"
        aria-labelledby="data-trade"
        className="mt-10 scroll-mt-6"
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
