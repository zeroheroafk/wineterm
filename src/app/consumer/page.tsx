import type { Metadata } from "next";
import { cacheLife } from "next/cache";

import { BottleOriginsTable } from "@/components/consumer/BottleTables";
import { PriceIndexTable } from "@/components/consumer/PriceIndexTable";
import { Container } from "@/components/layout/Container";
import { SectionPageHeader } from "@/components/layout/SectionPageHeader";
import { InlinePercentChange } from "@/components/market/ChangeCell";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { DataNote, SourceLine } from "@/components/ui/SourceLine";
import { EmptyState } from "@/components/ui/states";
import { formatMonthYear, formatPrice } from "@/lib/format";
import { primaryNavigation } from "@/lib/navigation";
import { getConsumerService } from "@/services/consumer/service";
import { PRODUCER_COUNTRIES } from "@/services/types";

export const metadata: Metadata = {
  title: "Consumer Wine Prices",
  description:
    "Wine prices from the border to the shelf: what a bottle is worth as it leaves Spain, Portugal, France and Italy, and how shop prices move by country.",
  alternates: { canonical: "/consumer" },
};

const header = (
  <SectionPageHeader
    section={primaryNavigation[4]}
    crumbs={[{ label: "Consumer" }]}
    kicker="Consumer"
    title="From the border to the shelf"
    description="What a bottle of wine is worth when it leaves Spain, Portugal, France and Italy, and how the price of wine in the shops moves, country by country. Between the two come freight, duties and excise, the importer's and the retailer's margins, and VAT."
    activeHref="/consumer"
  />
);

/**
 * The Consumer tab: the value of a bottle at the border by origin, and
 * the latest consumer prices of wine for the EU, the producer countries
 * and the United States, each linking to its full page. Its figures
 * change monthly, so the page is regenerated at most hourly.
 */
export default async function ConsumerPage() {
  "use cache";
  cacheLife("hours");

  const consumer = getConsumerService();
  if (!consumer) {
    return (
      <Container className="pb-16">
        {header}
        <div className="mt-10">
          <EmptyState
            title="No prices to show"
            detail="Bottle and shop prices are read from the database, which this build is not connected to."
          />
        </div>
      </Container>
    );
  }

  const [bottles, indices, us] = await Promise.all([
    consumer.getBottleValues(),
    consumer.getWinePriceIndices(),
    consumer.getUsWinePrice(),
  ]);
  const shown = new Set<string>(["EU", ...PRODUCER_COUNTRIES]);

  return (
    <Container className="pb-16">
      {header}

      <section aria-labelledby="consumer-bottles" className="mt-10">
        <SectionHeader
          variant="editorial"
          id="consumer-bottles"
          kicker="At the border"
          title="What a bottle is worth when it leaves"
          description={`The average value of a 75 cl bottle of the wine each country exports, ${bottles.period.label}, against the twelve months before.`}
          action={{ label: "Bottle prices by destination", href: "/consumer/bottle-prices" }}
        />
        <div className="mt-5">
          <BottleOriginsTable values={bottles} />
        </div>
        <div className="mt-2">
          <SourceLine source={bottles.source} updatedAt={bottles.updatedAt} />
        </div>
      </section>

      <section aria-labelledby="consumer-shops" className="mt-14">
        <SectionHeader
          variant="editorial"
          id="consumer-shops"
          kicker="In the shops"
          title="How the price of wine is moving"
          description={
            indices
              ? `The consumer price index of wine from grapes in ${formatMonthYear(indices.latestMonth)}: its change on a year earlier and over five years.`
              : undefined
          }
          action={{ label: "Shop prices by country", href: "/consumer/shop-prices" }}
        />
        <div className="mt-5 grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]">
          <div className="min-w-0">
            {indices ? (
              <>
                <PriceIndexTable
                  rows={indices.rows.filter((row) => shown.has(row.country))}
                  caption={`Consumer price index of wine from grapes in the EU, Spain, Portugal, France and Italy, 2025 = 100, in ${formatMonthYear(indices.latestMonth)}, with its change on a year earlier and over five years`}
                />
                <div className="mt-2">
                  <SourceLine source={indices.source} updatedAt={indices.updatedAt} />
                </div>
              </>
            ) : (
              <EmptyState
                title="No price indices to show"
                detail="The database holds no consumer price index of wine yet."
              />
            )}
          </div>
          {us ? (
            <aside className="border border-rule bg-paper px-4 py-4">
              <p className="wt-label text-wine">United States</p>
              <p className="wt-headline mt-2 text-3xl font-semibold text-ink">
                ${formatPrice(us.usdPerBottle)}
              </p>
              <p className="mt-1 text-sm text-ink-soft">
                the average 75 cl bottle of table wine in US shops,{" "}
                {formatMonthYear(us.month)}
                {us.yoyPercent !== null ? (
                  <>
                    , <InlinePercentChange value={us.yoyPercent} /> on a year earlier
                  </>
                ) : null}
                .
              </p>
              <DataNote className="mt-3" source={us.source} />
              <div className="mt-2">
                <ArrowLink href="/consumer/shop-prices">US prices since 2015</ArrowLink>
              </div>
            </aside>
          ) : null}
        </div>
      </section>
    </Container>
  );
}
