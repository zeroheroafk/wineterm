import type { Metadata } from "next";

import { GroupedBarChart } from "@/components/charts/GroupedBarChart";
import { Container } from "@/components/layout/Container";
import { SectionPageHeader } from "@/components/layout/SectionPageHeader";
import { MaybePercent, TD, TD_RIGHT, TH, TH_RIGHT } from "@/components/markets/cells";
import { CampaignLinesChart } from "@/components/supply/CampaignLinesChart";
import { MethodologyNotes } from "@/components/supply/MethodologyNotes";
import { CountryLabel } from "@/components/ui/CountryLabel";
import { DataStatusLabel } from "@/components/ui/DataStatusLabel";
import { ScrollRegion } from "@/components/ui/ScrollRegion";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SourceLine } from "@/components/ui/SourceLine";
import { formatDate, formatMonthYear, formatPrice } from "@/lib/format";
import { primaryNavigation } from "@/lib/navigation";
import { getSupplyService } from "@/services/supply/service";
import { getSource } from "@/services/markets/sources";
import { COUNTRY_NAMES, PRODUCER_COUNTRIES } from "@/services/types";

export const metadata: Metadata = {
  title: "Production",
  description:
    "Wine production by campaign and country: current estimates against the previous campaign and the five-year average, in million hectolitres.",
};

// Spain's production is read from the database; regenerate at most hourly.
export const revalidate = 3600;

function percentChange(current: number, previous: number | null): number | null {
  return previous === null || previous === 0 ? null : (current / previous - 1) * 100;
}

export default async function ProductionPage() {
  const supply = getSupplyService();
  const [comparisons, history, campaigns, spain] = await Promise.all([
    supply.getProductionComparisons(),
    supply.getProductionByCampaign(),
    supply.getCampaigns(),
    supply.getSpainProduction(),
  ]);
  const source = getSource("sample-supply-stats");
  const spainSource = spain ? getSource(spain.sourceId) : null;
  const [latestCampaign, previousCampaign] = spain?.campaigns ?? [];

  const chartPoints = comparisons.map((row) => ({
    label: row.country,
    current: row.currentMhl,
    previous: row.previousMhl,
    fiveYear: row.fiveYearAvgMhl,
  }));

  return (
    <Container className="pb-16">
      <SectionPageHeader
        section={primaryNavigation[1]}
        crumbs={[
          { label: "Crop & Supply", href: "/supply" },
          { label: "Production" },
        ]}
        kicker="Crop & Supply"
        title="Production"
        description={
          spain
            ? "Campaign production by country, in million hectolitres. Spain's wine made since 1 August is declared to the Ministry of Agriculture every month (INFOVI) and leads the page; the country estimates and history below are illustrative samples."
            : "Campaign production by country: the 2026/27 first estimates against the previous campaign and the five-year average of completed campaigns. All volumes in million hectolitres; development figures are illustrative samples."
        }
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
      ) : null}

      <section className="mt-10">
        <SectionHeader
          kicker="Comparison"
          title="2026/27 estimates in context"
          description={
            spain
              ? "Illustrative samples: first estimates for each country against the previous campaign and the five-year average."
              : undefined
          }
        />
        <figure className="mt-5 border border-rule bg-paper">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-rule px-4 py-3">
            <h3 className="text-sm font-semibold text-ink">
              Production by country
            </h3>
            <p className="wt-label text-ink-soft">Mhl</p>
          </div>
          <div className="px-2 py-3">
            <GroupedBarChart
              points={chartPoints}
              series={[
                { key: "current", name: "2026/27 est" },
                { key: "previous", name: "2025/26" },
                { key: "fiveYear", name: "5-yr avg" },
              ]}
              unit="Mhl"
            />
          </div>
          <figcaption className="border-t border-rule px-4 py-2.5">
            <SourceLine source={{ name: source.name }} />
          </figcaption>
        </figure>

        <ScrollRegion className="mt-6 border border-rule bg-paper">
          <table className="w-full border-collapse text-left">
            <caption className="sr-only">
              Production by country: current estimate, previous campaign,
              five-year average, changes and colour split
            </caption>
            <thead>
              <tr className="border-b-2 border-ink">
                <th scope="col" className={TH}>
                  Country
                </th>
                <th scope="col" className={TH_RIGHT}>
                  2026/27 est (Mhl)
                </th>
                <th scope="col" className={TH_RIGHT}>
                  2025/26
                </th>
                <th scope="col" className={`${TH_RIGHT} hidden sm:table-cell`}>
                  5-yr avg
                </th>
                <th scope="col" className={TH_RIGHT}>
                  vs prev
                </th>
                <th scope="col" className={`${TH_RIGHT} hidden sm:table-cell`}>
                  vs 5-yr
                </th>
                <th scope="col" className={`${TH_RIGHT} hidden lg:table-cell`}>
                  Red and rose
                </th>
                <th scope="col" className={`${TH_RIGHT} hidden lg:table-cell`}>
                  White
                </th>
                <th scope="col" className={TH}>
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisons.map((row) => (
                <tr
                  key={row.country}
                  className="border-b border-rule transition-colors last:border-b-0 hover:bg-ground/70"
                >
                  <td className={TD}>
                    <CountryLabel code={row.country} withName />
                  </td>
                  <td className={`${TD_RIGHT} tnum font-mono text-sm font-medium text-ink`}>
                    {formatPrice(row.currentMhl, 1)}
                  </td>
                  <td className={`${TD_RIGHT} tnum font-mono text-sm text-ink`}>
                    {formatPrice(row.previousMhl, 1)}
                  </td>
                  <td
                    className={`${TD_RIGHT} tnum hidden font-mono text-sm text-ink-soft sm:table-cell`}
                  >
                    {formatPrice(row.fiveYearAvgMhl, 1)}
                  </td>
                  <td className={TD_RIGHT}>
                    <MaybePercent value={row.vsPreviousPercent} />
                  </td>
                  <td className={`${TD_RIGHT} hidden sm:table-cell`}>
                    <MaybePercent value={row.vsFiveYearPercent} />
                  </td>
                  <td
                    className={`${TD_RIGHT} tnum hidden font-mono text-xs text-ink-soft lg:table-cell`}
                  >
                    {formatPrice(row.redRoseShare, 0)}%
                  </td>
                  <td
                    className={`${TD_RIGHT} tnum hidden font-mono text-xs text-ink-soft lg:table-cell`}
                  >
                    {formatPrice(row.whiteShare, 0)}%
                  </td>
                  <td className={TD}>
                    <DataStatusLabel status={row.currentStatus} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollRegion>
        <p className="wt-label mt-2 max-w-3xl leading-relaxed text-ink-soft">
          Colour shares are first estimates for the current campaign and can
          shift materially as declarations arrive. Rose is grouped with red
          where national sources do not separate it.
        </p>
      </section>

      <section className="mt-12">
        <SectionHeader
          kicker="History"
          title="Production by campaign"
          description={
            spain
              ? "Illustrative samples, six campaigns per country. Spain's declared figures are in the section above."
              : "Six campaigns per country. The current campaign is an estimate; the five-year average covers completed campaigns only."
          }
        />
        <ScrollRegion className="mt-5 border border-rule bg-paper">
          <table className="w-full border-collapse text-left">
            <caption className="sr-only">
              Production by campaign and country, million hectolitres
            </caption>
            <thead>
              <tr className="border-b-2 border-ink">
                <th scope="col" className={TH}>
                  Campaign
                </th>
                {PRODUCER_COUNTRIES.map((country) => (
                  <th key={country} scope="col" className={TH_RIGHT}>
                    <abbr title={COUNTRY_NAMES[country]} className="no-underline">
                      {country}
                    </abbr>
                  </th>
                ))}
                <th scope="col" className={TH_RIGHT}>
                  EU4
                </th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign) => {
                const values = PRODUCER_COUNTRIES.map(
                  (country) =>
                    history.find(
                      (r) =>
                        r.campaign === campaign.code && r.country === country,
                    )?.volumeMhl ?? null,
                );
                if (values.every((v) => v === null)) return null;
                const total = values.reduce<number>(
                  (sum, v) => sum + (v ?? 0),
                  0,
                );
                return (
                  <tr
                    key={campaign.code}
                    className="border-b border-rule last:border-b-0"
                  >
                    <td className={`${TD} tnum font-mono text-sm text-ink`}>
                      {campaign.code}
                      {campaign.isEstimate ? (
                        <span className="wt-label ml-2 text-ochre-deep">est</span>
                      ) : null}
                    </td>
                    {values.map((value, index) => (
                      <td
                        key={PRODUCER_COUNTRIES[index]}
                        className={`${TD_RIGHT} tnum font-mono text-sm text-ink`}
                      >
                        {value === null ? "-" : formatPrice(value, 1)}
                      </td>
                    ))}
                    <td
                      className={`${TD_RIGHT} tnum font-mono text-sm text-ink-soft`}
                    >
                      {formatPrice(total, 1)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </ScrollRegion>
      </section>

      <div className="mt-10 max-w-3xl">
        <MethodologyNotes>
          <p>
            Production covers vinified wine and must by campaign of harvest.
            National definitions differ on juice, must set aside for
            concentrate and wine for distillation; the series here follow
            each country&apos;s own headline definition, so cross-country
            totals are indicative. Source: {source.name}, {source.cadence}.
          </p>
          {spain && spainSource ? (
            <p className="mt-2">
              Spain&apos;s section is different: wine made, without must, as
              declared every month by producers of 1,000 hl or more. Each
              month&apos;s figure counts the wine they declared from 1 August
              to its end, and a campaign&apos;s July figure is its total.
              Source: {spainSource.name}, {spainSource.cadence}.
            </p>
          ) : null}
        </MethodologyNotes>
      </div>
    </Container>
  );
}
