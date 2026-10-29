import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import Link from "next/link";

import { PRODUCER_LINES } from "@/components/consumer/colours";
import { CountryLinesChart } from "@/components/consumer/CountryLinesChart";
import { PriceIndexTable } from "@/components/consumer/PriceIndexTable";
import { Container } from "@/components/layout/Container";
import { SectionPageHeader } from "@/components/layout/SectionPageHeader";
import { InlinePercentChange } from "@/components/market/ChangeCell";
import { MethodologyNotes } from "@/components/supply/MethodologyNotes";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SourceLine } from "@/components/ui/SourceLine";
import { EmptyState } from "@/components/ui/states";
import { formatDate, formatMonthYear, formatPrice } from "@/lib/format";
import { primaryNavigation } from "@/lib/navigation";
import { getConsumerService } from "@/services/consumer/service";

export const metadata: Metadata = {
  title: "Wine Prices in the Shops",
  description:
    "How the price of wine in the shops moves, country by country: the official consumer price index of wine for the EU, its 27 countries and Switzerland, and the average price of table wine in the United States.",
  alternates: { canonical: "/consumer/shop-prices" },
};

const header = (
  <SectionPageHeader
    section={primaryNavigation[4]}
    crumbs={[{ label: "Consumer", href: "/consumer" }, { label: "Shop Prices" }]}
    kicker="Consumer"
    title="Wine prices in the shops"
    description="How the price of wine to the consumer moves, country by country: the official index of the prices households pay for wine, every month, for the EU, its 27 countries and Switzerland, and the average price of a bottle of table wine in the United States."
    activeHref="/consumer/shop-prices"
  />
);

/** The month the index chart starts from: before the inflation of 2022. */
const CHART_FROM = "2019-01";

/**
 * The prices behind the page change monthly; it is regenerated at most
 * hourly so a new month shows up soon after the import.
 */
export default async function ShopPricesPage() {
  "use cache";
  cacheLife("hours");

  const consumer = getConsumerService();
  const [indices, us] = consumer
    ? await Promise.all([consumer.getWinePriceIndices(), consumer.getUsWinePrice()])
    : [null, null];

  if (!indices && !us) {
    return (
      <Container className="pb-16">
        {header}
        <div className="mt-10">
          <EmptyState
            title="No shop prices to show"
            detail="Shop prices are read from the database, which this build is not connected to or which holds none yet."
          />
        </div>
      </Container>
    );
  }

  const indexLines = [
    ...PRODUCER_LINES,
    { key: "EU", name: "European Union", colour: "var(--wt-ink-soft)", reference: true },
  ];
  const indexPoints = (indices?.history ?? [])
    .filter((point) => point.month >= CHART_FROM)
    .map((point) => ({ month: point.month, ...point.values }));

  return (
    <Container className="pb-16">
      {header}

      {indices ? (
        <>
          <section className="mt-10">
            <SectionHeader
              kicker="Europe"
              title="The price of wine by country"
              description={`The consumer price index of wine from grapes in ${formatMonthYear(indices.latestMonth)}, its change on a year earlier and over five years. An index of 103 means the same wines cost 3% more than on average in 2025.`}
              action={{ label: "Bottle prices at the border", href: "/consumer/bottle-prices" }}
            />
            <div className="mt-5">
              <PriceIndexTable
                rows={indices.rows}
                caption={`Consumer price index of wine from grapes by country, 2025 = 100, in ${formatMonthYear(indices.latestMonth)}, with its change on a year earlier and over five years`}
              />
            </div>
            <div className="mt-2">
              <SourceLine source={indices.source} updatedAt={indices.updatedAt} />
            </div>
            <p className="wt-label mt-2 max-w-3xl leading-relaxed text-ink-soft">
              {formatMonthYear(indices.latestMonth)} was published on{" "}
              {formatDate(indices.publishedAt)}. The change on a year earlier
              is Eurostat&apos;s; the change over five years is computed by
              WineTerm from the indices.
            </p>
          </section>

          <section className="mt-12">
            <SectionHeader
              kicker="Evolution"
              title="Spain, Portugal, France and Italy"
              description="The consumer price index of wine from grapes in the four producer countries since 2019, read against the European Union. Each country's index is 100 on average in 2025, so the lines show how prices moved within each country, not which country is dearer."
            />
            <figure className="mt-5 border border-rule bg-paper">
              <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-rule px-4 py-3">
                <h3 className="text-sm font-semibold text-ink">
                  Consumer price index of wine from grapes
                </h3>
                <p className="wt-label text-ink-soft">2025 = 100</p>
              </div>
              <div className="px-2 py-3">
                <CountryLinesChart
                  points={indexPoints}
                  lines={indexLines}
                  unit=""
                  decimals={1}
                  fromZero={false}
                />
              </div>
              <figcaption className="border-t border-rule px-4 py-2.5">
                <SourceLine source={indices.source} updatedAt={indices.updatedAt} />
              </figcaption>
            </figure>
          </section>
        </>
      ) : null}

      {us ? (
        <section className="mt-12">
          <SectionHeader
            kicker="United States"
            title="A bottle of table wine in US shops"
            description="The average price of a litre of red, white and rosé table wine of every size and origin in US cities, expressed per 75 cl bottle. The United States is the largest export market by value for the wine of France and Italy, and among the largest for Spain and Portugal."
          />
          <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
            <div className="border border-rule bg-paper px-4 py-4">
              <p className="wt-label text-ink-soft">{formatMonthYear(us.month)}</p>
              <p className="wt-headline mt-2 text-4xl font-semibold text-ink">
                ${formatPrice(us.usdPerBottle)}
              </p>
              <p className="mt-1 text-sm text-ink-soft">
                a 75 cl bottle, ${formatPrice(us.usdPerLitre)} a litre
              </p>
              {us.yoyPercent !== null ? (
                <p className="mt-3 text-sm text-ink">
                  <InlinePercentChange value={us.yoyPercent} withIndicator /> on a year
                  earlier
                </p>
              ) : null}
            </div>
            <figure className="min-w-0 border border-rule bg-paper">
              <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-rule px-4 py-3">
                <h3 className="text-sm font-semibold text-ink">
                  Average price of a bottle of table wine
                </h3>
                <p className="wt-label text-ink-soft">USD per 75 cl</p>
              </div>
              <div className="px-2 py-3">
                <CountryLinesChart
                  points={us.history.map((point) => ({
                    month: point.month,
                    US: point.usdPerBottle ?? undefined,
                  }))}
                  lines={[{ key: "US", name: "United States", colour: "var(--wt-wine)" }]}
                  unit="USD/75 cl"
                  fromZero={false}
                  height={240}
                />
              </div>
            </figure>
          </div>
          <div className="mt-2">
            <SourceLine source={us.source} updatedAt={us.updatedAt} />
          </div>
          <p className="wt-label mt-2 max-w-3xl leading-relaxed text-ink-soft">
            The BLS publishes average prices as price levels; the change on a
            year earlier compares them. October 2025 is missing: the BLS did
            not collect prices during the lapse in US federal appropriations.
          </p>
        </section>
      ) : null}

      <div className="mt-10 max-w-3xl">
        <MethodologyNotes title="What these prices cover">
          <p>
            The harmonised index of consumer prices measures the change in
            the prices households pay for the same goods, month after month,
            taxes included, in the same way in every EU country. Wine from
            grapes is wine bought to take home, in shops and online; wine
            served in restaurants and bars is priced with catering and is not
            covered. Eurostat publishes each month&apos;s index in the middle
            of the following month, on the second version of the European
            classification of consumption, with 2025 as the reference year.
          </p>
          <p className="mt-3">
            An index compares a country with itself, not with another: two
            countries at 103 have both seen prices rise 3% since 2025, not
            reached the same price. The average price in the United States is
            a level, in dollars, from the prices the Bureau of Labor
            Statistics collects for its consumer price index. More on the{" "}
            <Link
              href="/insights/methodology#consumer"
              className="text-wine underline underline-offset-2"
            >
              methodology page
            </Link>
            .
          </p>
        </MethodologyNotes>
      </div>
    </Container>
  );
}
