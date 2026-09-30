import type { Metadata } from "next";

import { HarvestSummaryPanel } from "@/components/harvest/HarvestSummaryPanel";
import { ForecastRangeTable } from "@/components/harvest/ForecastRangeTable";
import { HarvestTimelineList } from "@/components/harvest/HarvestTimelineList";
import { RegionalStatusTable } from "@/components/harvest/RegionalStatusTable";
import { Container } from "@/components/layout/Container";
import { SectionPageHeader } from "@/components/layout/SectionPageHeader";
import { CountryLabel } from "@/components/ui/CountryLabel";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SourceLine } from "@/components/ui/SourceLine";
import { formatDate } from "@/lib/format";
import { primaryNavigation } from "@/lib/navigation";
import { getHarvestService } from "@/services/harvest/service";
import { getSource } from "@/services/markets/sources";

export const metadata: Metadata = {
  title: "Harvest",
  description:
    "The 2026 European harvest: official production forecasts for Spain, Portugal, France and Italy, with regional stages, progress, weather and yield expectations.",
};

export default async function HarvestPage() {
  const harvest = getHarvestService();
  const [summary, forecasts, regions, timeline] = await Promise.all([
    harvest.getSummary(),
    harvest.getCountryForecasts(),
    harvest.getRegionReports(),
    harvest.getTimeline(),
  ]);
  const fieldSource = getSource("sample-harvest-network");

  return (
    <Container className="pb-16">
      <SectionPageHeader
        section={primaryNavigation[1]}
        crumbs={[
          { label: "Crop & Supply", href: "/supply" },
          { label: "Harvest" },
        ]}
        kicker="Crop & Supply"
        title="Harvest monitor"
        description="The 2026 campaign in Spain, Portugal, France and Italy. Production forecasts are the official ones, as each country's forecasters published them; the summary, regional reports and timeline are illustrative samples."
        activeHref="/harvest"
      />

      <section className="mt-10">
        <SectionHeader
          kicker="Forecasts"
          title="Country production forecasts"
          description="The latest official forecast for each country against the previous campaign, as the same source counts it. France revises its estimate every month until November; Spain estimates wine only once the harvest is in; Italy reports results only after it."
        />
        <div className="mt-5">
          <ForecastRangeTable
            forecasts={forecasts}
            note="Each source counts its own scope: France all wine, including wine for brandy; Portugal wine; Spain wine and must. Forecasts are revised as the harvest goes on."
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

      <div className="mt-12">
        <HarvestSummaryPanel summary={summary} />
      </div>

      <section id="weather" className="mt-12 scroll-mt-6">
        <SectionHeader
          kicker="Regional status"
          title="Regions in detail"
          description="Illustrative samples of field reporting: stage, start, approximate progress, weather, quality and yield outlook, region by region. Direction triangles compare the expected crop with the previous campaign."
          action={{ label: "Supply balance", href: "/supply" }}
        />
        <div className="mt-5">
          <RegionalStatusTable reports={regions} />
        </div>
        <div className="mt-2">
          <SourceLine
            source={{ name: fieldSource.name }}
            updatedAt={summary.updatedAt}
          />
        </div>
      </section>

      <section className="mt-12 max-w-3xl">
        <SectionHeader
          kicker="Campaign diary"
          title="Timeline"
          description="Illustrative sample of the dated events the desk records through the season."
        />
        <div className="mt-5">
          <HarvestTimelineList events={timeline} />
        </div>
      </section>
    </Container>
  );
}
