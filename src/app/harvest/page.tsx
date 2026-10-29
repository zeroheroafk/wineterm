import type { Metadata } from "next";

import { ForecastRangeTable } from "@/components/harvest/ForecastRangeTable";
import { Container } from "@/components/layout/Container";
import { SectionPageHeader } from "@/components/layout/SectionPageHeader";
import { MethodologyNotes } from "@/components/supply/MethodologyNotes";
import { CountryLabel } from "@/components/ui/CountryLabel";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SourceLine } from "@/components/ui/SourceLine";
import { formatDate } from "@/lib/format";
import { primaryNavigation } from "@/lib/navigation";
import { UNLISTED_ROBOTS } from "@/lib/seo";
import { getHarvestService } from "@/services/harvest/service";
import { getSource } from "@/services/markets/sources";

/** The year of the harvest that opens a campaign: "2026" for 2026/27. */
function harvestYear(campaign: string): string {
  return campaign.slice(0, 4);
}

export async function generateMetadata(): Promise<Metadata> {
  const campaign = await getHarvestService().getCampaign();
  return {
    title: "Harvest",
    description: `The ${harvestYear(campaign)} European harvest: the official production estimates for Spain, Portugal, France and Italy, as each country's statistical body publishes them.`,
    alternates: { canonical: "/harvest" },
    robots: UNLISTED_ROBOTS,
  };
}

export default async function HarvestPage() {
  const harvest = getHarvestService();
  const [campaign, forecasts] = await Promise.all([
    harvest.getCampaign(),
    harvest.getCountryForecasts(),
  ]);

  return (
    <Container className="pb-16">
      <SectionPageHeader
        section={primaryNavigation[2]}
        crumbs={[
          { label: "Crop & Supply", href: "/supply" },
          { label: "Harvest" },
        ]}
        kicker="Crop & Supply"
        title="Harvest estimates"
        description={`The ${harvestYear(campaign)} harvest in Spain, Portugal, France and Italy: each country's official production estimate, as its statistical body publishes it, against the previous campaign.`}
        activeHref="/harvest"
      />

      <section className="mt-10">
        <SectionHeader
          kicker="Estimates"
          title="Country production estimates"
          description="The latest official estimate for each country against the previous campaign, as the same source counts it. France revises its estimate every month until November; Spain estimates wine only once the harvest is in; Italy reports results only after it."
        />
        <div className="mt-5">
          <ForecastRangeTable
            forecasts={forecasts}
            campaign={campaign}
            note="Each source counts its own scope: France all wine, including wine for brandy; Portugal wine; Spain wine and must. Figures are revised as the harvest declarations come in."
          />
        </div>
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {forecasts.map((forecast) => {
            const source = getSource(forecast.sourceId);
            return (
              <article
                key={forecast.country}
                className="border-l-2 border-wine bg-wine-wash/30 py-3 pr-4 pl-5"
              >
                <CountryLabel code={forecast.country} withName />
                <p className="mt-2 text-sm leading-relaxed text-ink">
                  {forecast.commentary}
                </p>
                <p className="wt-label mt-2 text-ink-soft">
                  {forecast.publishedAt
                    ? `Published ${formatDate(forecast.publishedAt)}`
                    : null}
                </p>
                <div className="mt-1">
                  <SourceLine source={{ name: source.name, url: source.url }} />
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <div className="mt-10 max-w-3xl">
        <MethodologyNotes title="How to read the estimates">
          <p>
            Before the harvest the figures are forecasts: each body&apos;s
            expectation for the crop, published once, as the IVV does, or
            monthly, as Agreste does. From the first estimate after picking
            starts they are provisional figures of the crop that is in,
            revised until the harvest declarations close in the winter.
            WineTerm enters each release by hand with its date, keeps the
            scope each source counts, and adds no precision the sources do
            not carry.
          </p>
        </MethodologyNotes>
      </div>
    </Container>
  );
}
