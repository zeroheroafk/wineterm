import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import Link from "next/link";

import { BottleDestinationsTable, BottleOriginsTable } from "@/components/consumer/BottleTables";
import { PRODUCER_LINES } from "@/components/consumer/colours";
import { CountryLinesChart } from "@/components/consumer/CountryLinesChart";
import { Container } from "@/components/layout/Container";
import { SectionPageHeader } from "@/components/layout/SectionPageHeader";
import { MethodologyNotes } from "@/components/supply/MethodologyNotes";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SourceLine } from "@/components/ui/SourceLine";
import { EmptyState } from "@/components/ui/states";
import { primaryNavigation } from "@/lib/navigation";
import { getConsumerService } from "@/services/consumer/service";
import { BOTTLE_CATEGORY_LABELS, type BottleCategory } from "@/services/consumer/types";

export const metadata: Metadata = {
  title: "Wine Bottle Prices at the Border",
  description:
    "What a 75 cl bottle of still or sparkling wine is worth when it leaves Spain, Portugal, France and Italy, by destination, from official trade statistics.",
  alternates: { canonical: "/consumer/bottle-prices" },
};

const header = (
  <SectionPageHeader
    section={primaryNavigation[4]}
    crumbs={[{ label: "Consumer", href: "/consumer" }, { label: "Bottle Prices" }]}
    kicker="Consumer"
    title="Bottle prices at the border"
    description="What a 75 cl bottle of wine is worth when it leaves Spain, Portugal, France and Italy: the value of each country's exports divided by their volume, from the official trade statistics. It is the price at which the wine crosses the border, before freight, duties and excise, the importer's and the retailer's margins, and VAT."
    activeHref="/consumer/bottle-prices"
  />
);

const DESTINATION_NOTES: Record<BottleCategory, string> = {
  bottled:
    "Still wine in containers of up to 2 litres: mostly 75 cl bottles, with litre bottles, magnums and cartons among them. Destinations are ranked by volume.",
  sparkling:
    "Sparkling wine, from cava and prosecco to champagne. Portugal sells little of it abroad, so its figures move more than a market would.",
};

/**
 * The trade figures behind the page change monthly; it is regenerated at
 * most hourly so a new month shows up soon after the import.
 */
export default async function BottlePricesPage() {
  "use cache";
  cacheLife("hours");

  const consumer = getConsumerService();
  if (!consumer) {
    return (
      <Container className="pb-16">
        {header}
        <div className="mt-10">
          <EmptyState
            title="No bottle prices to show"
            detail="Bottle prices are computed from the trade figures in the database, which this build is not connected to."
          />
        </div>
      </Container>
    );
  }

  const values = await consumer.getBottleValues();
  const chartPoints = values.monthly.bottled.map((point) => ({
    month: point.month,
    ...point.values,
  }));

  return (
    <Container className="pb-16">
      {header}

      <section className="mt-10">
        <SectionHeader
          kicker="By origin"
          title="A bottle at the border"
          description={`The average value of a 75 cl bottle of each country's exports to every destination, ${values.period.label}, against the twelve months before.`}
          action={{ label: "Prices in the shops", href: "/consumer/shop-prices" }}
        />
        <div className="mt-5">
          <BottleOriginsTable values={values} />
        </div>
        <div className="mt-2">
          <SourceLine source={values.source} updatedAt={values.updatedAt} />
        </div>
      </section>

      <section className="mt-12">
        <SectionHeader
          kicker="Evolution"
          title="Still wine, month by month"
          description="The value of a 75 cl bottle of the still wine each country exports, over the last 36 months. Single months move with the mix of wines shipped as well as with prices."
        />
        <figure className="mt-5 border border-rule bg-paper">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-rule px-4 py-3">
            <h3 className="text-sm font-semibold text-ink">
              Value per bottle of still wine exports
            </h3>
            <p className="wt-label text-ink-soft">EUR per 75 cl</p>
          </div>
          <div className="px-2 py-3">
            <CountryLinesChart points={chartPoints} lines={PRODUCER_LINES} unit="EUR/75 cl" />
          </div>
          <figcaption className="border-t border-rule px-4 py-2.5">
            <SourceLine source={values.source} updatedAt={values.updatedAt} />
          </figcaption>
        </figure>
      </section>

      {(["bottled", "sparkling"] as const).map((category) => (
        <section key={category} id={category} className="mt-14 scroll-mt-6">
          <SectionHeader
            kicker="By destination"
            title={BOTTLE_CATEGORY_LABELS[category]}
            description={DESTINATION_NOTES[category]}
          />
          <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
            {values.origins[category].map((origin) => (
              <BottleDestinationsTable
                key={origin.origin}
                origin={origin}
                category={category}
                period={values.period.label}
              />
            ))}
          </div>
        </section>
      ))}

      <div className="mt-10 max-w-3xl">
        <MethodologyNotes title="How the value per bottle is computed">
          <p>
            WineTerm divides the statistical value of each country&apos;s
            exports by their volume in litres, both as Eurostat publishes them
            from customs and intra-EU trade declarations, and multiplies by
            0.75: the value of a 75 cl bottle. Still wine is the customs
            subheading for containers of up to 2 litres (CN 2204 21), and
            sparkling wine its own (CN 2204 10).
          </p>
          <p className="mt-3">
            It is an average, not a price on a label: it covers every colour,
            category and price point a country sells, valued at its border, so
            it moves with the mix of wines as well as with prices. A bottle
            reaches the shelf only after freight, import duties and excise,
            the margins of the importer, the distributor and the retailer, and
            VAT, each of which adds to the price the shopper pays.
          </p>
          <p className="mt-3">
            The period ends at the latest month all four countries have
            published; changes compare it with the twelve months before. The
            full trade figures are on the{" "}
            <Link href="/trade#bottled" className="text-wine underline underline-offset-2">
              trade page
            </Link>
            , and the method on the{" "}
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
