import type { Metadata } from "next";

import { HarvestSummaryPanel } from "@/components/harvest/HarvestSummaryPanel";
import { ForecastRangeTable } from "@/components/harvest/ForecastRangeTable";
import { HarvestTimelineList } from "@/components/harvest/HarvestTimelineList";
import { RegionalStatusTable } from "@/components/harvest/RegionalStatusTable";
import { Container } from "@/components/layout/Container";
import { SectionPageHeader } from "@/components/layout/SectionPageHeader";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SourceLine } from "@/components/ui/SourceLine";
import { primaryNavigation } from "@/lib/navigation";
import { getHarvestService } from "@/services/harvest/service";
import { getSource } from "@/services/markets/sources";

export const metadata: Metadata = {
  title: "Harvest",
  description:
    "The 2026 European harvest: regional stages, progress, weather, yield expectations and production forecasts for Spain, Portugal, France and Italy.",
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
        description="The 2026 campaign across representative regions of Spain, Portugal, France and Italy: stages, progress, weather, yield expectations and forecasts. Progress figures are approximate by design; development content is an illustrative sample."
        activeHref="/harvest"
      />

      <div className="mt-8">
        <HarvestSummaryPanel summary={summary} />
      </div>

      <section className="mt-12">
        <SectionHeader
          kicker="Forecasts"
          title="Country production forecasts"
          description="First estimates as ranges against the previous campaign. Point forecasts are not published at this stage of the season."
        />
        <div className="mt-5">
          <ForecastRangeTable forecasts={forecasts} />
        </div>
      </section>

      <section id="weather" className="mt-12 scroll-mt-6">
        <SectionHeader
          kicker="Regional status"
          title="Regions in detail"
          description="Stage, start, approximate progress, weather, quality and yield outlook, region by region. Direction triangles compare the expected crop with the previous campaign."
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

      <section className="mt-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
          <div>
            <SectionHeader kicker="Campaign diary" title="Timeline" />
            <div className="mt-5">
              <HarvestTimelineList events={timeline} />
            </div>
          </div>
          <div>
            <SectionHeader kicker="Desk" title="Regional commentary" />
            <div className="mt-5 space-y-4">
              {forecasts.map((forecast) => (
                <article
                  key={forecast.country}
                  className="border-l-2 border-wine bg-wine-wash/30 py-3 pr-4 pl-5"
                >
                  <p className="wt-label text-wine">{forecast.country}</p>
                  <p className="mt-1 text-sm leading-relaxed text-ink">
                    {forecast.commentary}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </Container>
  );
}
