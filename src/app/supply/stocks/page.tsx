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
  title: "Stocks",
  description:
    "Spain's wine stocks at the end of each month, by colour and presentation, as declared to the Ministry of Agriculture, in million hectolitres.",
};

function percentChange(current: number, previous: number | null): number | null {
  return previous === null || previous === 0 ? null : (current / previous - 1) * 100;
}

/** Spain's stocks are read from the database; regenerated at most hourly. */
export default async function StocksPage() {
  "use cache";
  cacheLife("hours");

  const spain = await getSupplyService().getSpainMonthlyStocks();
  const spainSource = spain ? getSource(spain.sourceId) : null;
  const [latestCampaign, previousCampaign] = spain?.campaigns ?? [];
  const yearEarlierMonth = spain
    ? `${Number(spain.latestMonth.slice(0, 4)) - 1}${spain.latestMonth.slice(4)}`
    : null;

  return (
    <Container className="pb-16">
      <SectionPageHeader
        section={primaryNavigation[2]}
        crumbs={[
          { label: "Crop & Supply", href: "/supply" },
          { label: "Stocks" },
        ]}
        kicker="Crop & Supply"
        title="Stocks"
        description="Wine held in Spain at the end of each month by producers of 1,000 hl or more and by warehouse holders, as declared to the Ministry of Agriculture (INFOVI). The other countries' stocks follow once a source publishes declarations WineTerm may republish."
        activeHref="/supply/stocks"
      />

      {spain && spainSource && latestCampaign ? (
        <section className="mt-10">
          <SectionHeader
            kicker="Spain"
            title="Monthly wine stocks"
            description="Wine held at the end of each month by producers of 1,000 hl or more and by warehouse holders, as declared to the Ministry of Agriculture. Stocks peak after the harvest and fall to their low at the end of July, when the campaign closes."
          />
          <figure className="mt-5 border border-rule bg-paper">
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-rule px-4 py-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-ink">
                Wine stocks at the end of each month
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
                  Spain&apos;s stocks at the end of {formatMonthYear(spain.latestMonth)} by
                  colour and presentation, against a year earlier
                </caption>
                <thead>
                  <tr className="border-b-2 border-ink">
                    <th scope="col" className={TH}>
                      Month-end stocks, Mhl
                    </th>
                    <th scope="col" className={TH_RIGHT}>
                      {formatMonthYear(spain.latestMonth)}
                    </th>
                    <th scope="col" className={`${TH_RIGHT} hidden sm:table-cell`}>
                      {yearEarlierMonth ? formatMonthYear(yearEarlierMonth) : "Year earlier"}
                    </th>
                    <th scope="col" className={TH_RIGHT}>
                      YoY
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {spain.breakdown.map((row) => (
                    <tr
                      key={row.label}
                      className={
                        row.isTotal
                          ? "border-y-2 border-ink"
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
                  Spain&apos;s month-end wine stocks in {latestCampaign.campaign}
                  {previousCampaign ? ` and ${previousCampaign.campaign}` : ""}, the
                  figures behind the chart
                </caption>
                <thead>
                  <tr className="border-b-2 border-ink">
                    <th scope="col" className={TH}>
                      Month
                    </th>
                    <th scope="col" className={TH_RIGHT}>
                      {latestCampaign.campaign}
                    </th>
                    {previousCampaign ? (
                      <th scope="col" className={TH_RIGHT}>
                        {previousCampaign.campaign}
                      </th>
                    ) : null}
                    <th scope="col" className={TH_RIGHT}>
                      YoY
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(previousCampaign ?? latestCampaign).points.map((earlier, index) => {
                    const current = latestCampaign.points.find(
                      (point) => point.month.slice(5) === earlier.month.slice(5),
                    );
                    const previous = previousCampaign ? earlier : null;
                    return (
                      <tr key={index} className="border-b border-rule last:border-b-0">
                        <th scope="row" className={`${TD} font-mono text-xs font-normal text-ink-soft`}>
                          {formatMonthYear(current?.month ?? earlier.month).split(" ")[0]}
                        </th>
                        <td className={`${TD_RIGHT} tnum font-mono text-sm text-ink`}>
                          {current ? formatPrice(current.wineMhl, 2) : "–"}
                        </td>
                        {previous ? (
                          <td className={`${TD_RIGHT} tnum font-mono text-sm text-ink-soft`}>
                            {formatPrice(previous.wineMhl, 2)}
                          </td>
                        ) : null}
                        <td className={TD_RIGHT}>
                          {current && previous ? (
                            <MaybePercent value={percentChange(current.wineMhl, previous.wineMhl)} />
                          ) : (
                            <span className="wt-label text-ink-soft">–</span>
                          )}
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
            {formatDate(spain.publishedAt)}. Figures are the national totals
            of the monthly declarations; producers making less than 1,000 hl
            a year do not declare every month and are not included.
          </p>
        </section>
      ) : (
        <div className="mt-10 max-w-3xl">
          <EmptyState
            title="No declarations to show"
            detail="Spain's stocks are read from the database, which this build is not connected to."
          />
        </div>
      )}

      <div className="mt-10 max-w-3xl">
        <MethodologyNotes title="Reporting dates and coverage">
          <p>
            Month-end stocks declared to the Ministry of Agriculture (INFOVI)
            by producers of 1,000 hl or more and by warehouse holders,
            published about six weeks after the month ends. Smaller producers
            do not declare monthly: at 31 July 2024 the annual declaration
            counted another 1.5 Mhl in their hands. Opening stocks at 1
            August are the stocks declared at 31 July.
          </p>
          <p className="mt-3 border-t border-rule pt-3">
            Stock declarations are compared within a country against the
            same reference a year earlier. Cross-country comparisons would
            need the other countries&apos; declarations, whose reference
            dates and coverage differ, and are added as sources are
            connected.
          </p>
        </MethodologyNotes>
      </div>
    </Container>
  );
}
