import type { Metadata } from "next";
import { cacheLife } from "next/cache";

import { Container } from "@/components/layout/Container";
import { SectionPageHeader } from "@/components/layout/SectionPageHeader";
import { MaybePercent, TD, TD_RIGHT, TH, TH_RIGHT } from "@/components/markets/cells";
import { CampaignLinesChart } from "@/components/supply/CampaignLinesChart";
import { MethodologyNotes } from "@/components/supply/MethodologyNotes";
import { DataStatusLabel } from "@/components/ui/DataStatusLabel";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SourceLine } from "@/components/ui/SourceLine";
import { EmptyState } from "@/components/ui/states";
import { formatDate, formatMonthYear, formatPrice } from "@/lib/format";
import { primaryNavigation } from "@/lib/navigation";
import { getSource } from "@/services/markets/sources";
import { getSupplyService } from "@/services/supply/service";

export const metadata: Metadata = {
  title: "Production",
  description:
    "Spain's wine production as declared every month to the Ministry of Agriculture: wine made since 1 August by colour, against the campaign before, and the totals of completed campaigns.",
};

function percentChange(current: number, previous: number | null): number | null {
  return previous === null || previous === 0 ? null : (current / previous - 1) * 100;
}

/** Spain's production is read from the database; regenerated at most hourly. */
export default async function ProductionPage() {
  "use cache";
  cacheLife("hours");

  const spain = await getSupplyService().getSpainProduction();
  const spainSource = spain ? getSource(spain.sourceId) : null;
  const [latestCampaign, previousCampaign] = spain?.campaigns ?? [];

  return (
    <Container className="pb-16">
      <SectionPageHeader
        section={primaryNavigation[2]}
        crumbs={[
          { label: "Crop & Supply", href: "/supply" },
          { label: "Production" },
        ]}
        kicker="Crop & Supply"
        title="Production"
        description="Wine made in Spain, in million hectolitres, as declared to the Ministry of Agriculture every month by producers of 1,000 hl or more (INFOVI). The other countries' production follows once a source publishes figures WineTerm may republish; their harvest estimates are on the Harvest page."
        activeHref="/supply/production"
      />

      {spain && spainSource && latestCampaign ? (
        <section className="mt-10">
          <SectionHeader
            kicker="Spain"
            title="Wine made since 1 August"
            description="Wine made from the start of the campaign to the end of each month, as declared every month to the Ministry of Agriculture by producers of 1,000 hl or more. It climbs through the harvest, from August to November, and barely moves after December; the July figure is the campaign's total."
          />
          <figure className="mt-5 border border-rule bg-paper">
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-rule px-4 py-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-ink">
                Wine made since 1 August
                <DataStatusLabel status="provisional" />
              </h3>
              <p className="wt-label text-ink-soft">
                Mhl, {latestCampaign.campaign}
                {previousCampaign ? ` against ${previousCampaign.campaign}` : null}
              </p>
            </div>
            <div className="px-2 py-3">
              <CampaignLinesChart
                lines={spain.campaigns.map((line) => ({
                  campaign: line.campaign,
                  points: line.points.map((point) => ({
                    month: point.month,
                    value: point.wineMhl,
                  })),
                }))}
                unit="Mhl"
                decimals={2}
              />
            </div>
            <figcaption className="border-t border-rule px-4 py-2.5">
              <SourceLine
                source={{ name: spainSource.name, url: spainSource.url }}
                updatedAt={spain.updatedAt}
              />
            </figcaption>
          </figure>

          <div className="mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
            <div className="overflow-x-auto border border-rule bg-paper">
              <table className="w-full border-collapse text-left">
                <caption className="sr-only">
                  Wine made in Spain from 1 August to the end of{" "}
                  {formatMonthYear(spain.latestMonth)} by colour, against the same
                  point a campaign earlier
                </caption>
                <thead>
                  <tr className="border-b-2 border-ink">
                    <th scope="col" className={TH}>
                      Made since 1 August, Mhl
                    </th>
                    <th scope="col" className={TH_RIGHT}>
                      To {formatMonthYear(spain.latestMonth)}
                    </th>
                    <th scope="col" className={`${TH_RIGHT} hidden sm:table-cell`}>
                      A campaign earlier
                    </th>
                    <th scope="col" className={TH_RIGHT}>
                      YoY
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {spain.toDate.map((row) => (
                    <tr
                      key={row.label}
                      className={
                        row.isTotal
                          ? "border-t-2 border-ink"
                          : "border-b border-rule last:border-b-0"
                      }
                    >
                      <th
                        scope="row"
                        className={`${TD} !whitespace-normal text-sm ${row.isTotal ? "font-semibold text-ink" : "font-normal text-ink"}`}
                      >
                        {row.label}
                      </th>
                      <td className={`${TD_RIGHT} tnum font-mono text-sm text-ink`}>
                        {formatPrice(row.latestMhl, 2)}
                      </td>
                      <td className={`${TD_RIGHT} tnum hidden font-mono text-sm text-ink-soft sm:table-cell`}>
                        {row.yearEarlierMhl === null ? "n/a" : formatPrice(row.yearEarlierMhl, 2)}
                      </td>
                      <td className={TD_RIGHT}>
                        <MaybePercent value={percentChange(row.latestMhl, row.yearEarlierMhl)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="overflow-x-auto border border-rule bg-paper">
              <table className="w-full border-collapse text-left">
                <caption className="sr-only">
                  Wine made in Spain in each completed campaign, by colour
                </caption>
                <thead>
                  <tr className="border-b-2 border-ink">
                    <th scope="col" className={TH}>
                      Campaign
                    </th>
                    <th scope="col" className={`${TH_RIGHT} hidden sm:table-cell`}>
                      Red and rosé
                    </th>
                    <th scope="col" className={`${TH_RIGHT} hidden sm:table-cell`}>
                      White
                    </th>
                    <th scope="col" className={TH_RIGHT}>
                      All wine
                    </th>
                    <th scope="col" className={TH_RIGHT}>
                      vs prev
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {spain.history.map((row, index) => {
                    const before = spain.history[index + 1];
                    return (
                      <tr key={row.campaign} className="border-b border-rule last:border-b-0">
                        <th scope="row" className={`${TD} tnum font-mono text-sm font-normal text-ink`}>
                          {row.campaign}
                        </th>
                        <td className={`${TD_RIGHT} tnum hidden font-mono text-sm text-ink-soft sm:table-cell`}>
                          {formatPrice(row.redRoseMhl, 2)}
                        </td>
                        <td className={`${TD_RIGHT} tnum hidden font-mono text-sm text-ink-soft sm:table-cell`}>
                          {formatPrice(row.whiteMhl, 2)}
                        </td>
                        <td className={`${TD_RIGHT} tnum font-mono text-sm font-medium text-ink`}>
                          {formatPrice(row.totalMhl, 2)}
                        </td>
                        <td className={TD_RIGHT}>
                          <MaybePercent
                            value={before ? percentChange(row.totalMhl, before.totalMhl) : null}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <p className="wt-label mt-2 max-w-3xl leading-relaxed text-ink-soft">
            {formatMonthYear(spain.latestMonth)} was published on{" "}
            {formatDate(spain.publishedAt)}. Wine only: must, and wine made
            by producers of less than 1,000 hl a year, are not included, so
            these totals sit below Spain&apos;s headline production of wine
            and must.
          </p>
        </section>
      ) : (
        <div className="mt-10 max-w-3xl">
          <EmptyState
            title="No declarations to show"
            detail="Spain's production is read from the database, which this build is not connected to."
          />
        </div>
      )}

      <div className="mt-10 max-w-3xl">
        <MethodologyNotes>
          <p>
            Wine made, without must, as declared every month by producers of
            1,000 hl or more. Each month&apos;s figure counts the wine they
            declared from 1 August to its end, and a campaign&apos;s July
            figure is its total. National definitions of production differ
            on juice, must set aside for concentrate and wine for
            distillation, so these totals are not comparable with other
            countries&apos; headline figures.
            {spainSource
              ? ` Source: ${spainSource.name}, ${spainSource.cadence.toLowerCase()}.`
              : null}
          </p>
        </MethodologyNotes>
      </div>
    </Container>
  );
}
