import type { Metadata } from "next";

import { GroupedBarChart } from "@/components/charts/GroupedBarChart";
import { Container } from "@/components/layout/Container";
import { SectionPageHeader } from "@/components/layout/SectionPageHeader";
import { MaybePercent, TD, TD_RIGHT, TH, TH_RIGHT } from "@/components/markets/cells";
import { CampaignLinesChart } from "@/components/supply/CampaignLinesChart";
import { MethodologyNotes } from "@/components/supply/MethodologyNotes";
import { CountryLabel } from "@/components/ui/CountryLabel";
import { DataStatusLabel } from "@/components/ui/DataStatusLabel";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SourceLine } from "@/components/ui/SourceLine";
import { formatDate, formatMonthYear, formatPrice } from "@/lib/format";
import { primaryNavigation } from "@/lib/navigation";
import { getSource } from "@/services/markets/sources";
import { getSupplyService } from "@/services/supply/service";
import {
  COUNTRY_NAMES,
  PRODUCER_COUNTRIES,
  type DataSource,
} from "@/services/types";

export const metadata: Metadata = {
  title: "Stocks",
  description:
    "Declared wine stocks by country: latest references, year-on-year direction and opening stocks across campaigns, in million hectolitres.",
};

// Spain's stocks are read from the database; regenerate at most hourly.
export const revalidate = 3600;

function percentChange(current: number, previous: number | null): number | null {
  return previous === null || previous === 0 ? null : (current / previous - 1) * 100;
}

export default async function StocksPage() {
  const supply = getSupplyService();
  const [stocks, history, spain] = await Promise.all([
    supply.getStocks(),
    supply.getOpeningStocksHistory(),
    supply.getSpainMonthlyStocks(),
  ]);

  const samples = new Set(
    stocks.filter((row) => row.status === "illustrative").map((row) => row.country),
  );
  const mixed = samples.size > 0 && samples.size < stocks.length;
  const sources: DataSource[] = [
    ...new Map(
      stocks.map((row) => {
        const source = getSource(row.sourceId);
        return [source.id, { name: source.name, url: source.url }] as const;
      }),
    ).values(),
  ];
  const seriesName = (country: (typeof PRODUCER_COUNTRIES)[number]) =>
    mixed && samples.has(country)
      ? `${COUNTRY_NAMES[country]} (illustrative)`
      : COUNTRY_NAMES[country];

  const campaignsInHistory = [
    ...new Set(
      PRODUCER_COUNTRIES.flatMap((country) => history[country].map((row) => row.campaign)),
    ),
  ].sort();
  const chartPoints = campaignsInHistory.map((campaign) => {
    const point: { label: string; [key: string]: string | number } = {
      label: campaign,
    };
    for (const country of PRODUCER_COUNTRIES) {
      const entry = history[country].find((row) => row.campaign === campaign);
      if (entry) point[country] = Math.round(entry.stocksMhl * 10) / 10;
    }
    return point;
  });

  const spainSource = spain ? getSource(spain.sourceId) : null;
  const [latestCampaign, previousCampaign] = spain?.campaigns ?? [];
  const yearEarlierMonth = spain
    ? `${Number(spain.latestMonth.slice(0, 4)) - 1}${spain.latestMonth.slice(4)}`
    : null;

  return (
    <Container className="pb-16">
      <SectionPageHeader
        section={primaryNavigation[1]}
        crumbs={[
          { label: "Crop & Supply", href: "/supply" },
          { label: "Stocks" },
        ]}
        kicker="Crop & Supply"
        title="Stocks"
        description={
          mixed
            ? "Declared wine stocks by country: the latest reference alongside the year-earlier position, and opening stocks across campaigns. Spain's stocks are the Ministry of Agriculture's monthly INFOVI declarations; Portugal, France and Italy are illustrative samples, marked as such."
            : "Declared wine stocks by country: the latest reference alongside the year-earlier position, each country's share of the four-country total, and stocks expressed in months of use. Development figures are illustrative samples."
        }
        activeHref="/supply/stocks"
      />

      <section className="mt-10">
        <SectionHeader
          kicker="Latest declarations"
          title="Reported stocks"
          description="Reference dates differ by country; the table shows each declaration as reported, without alignment."
        />
        <div className="mt-5 overflow-x-auto border border-rule bg-paper">
          <table className="w-full border-collapse text-left">
            <caption className="sr-only">
              Latest declared stocks by country with direction, share and
              months of use
            </caption>
            <thead>
              <tr className="border-b-2 border-ink">
                <th scope="col" className={TH}>
                  Country
                </th>
                <th scope="col" className={TH}>
                  Reference
                </th>
                <th scope="col" className={TH_RIGHT}>
                  Stocks (Mhl)
                </th>
                <th scope="col" className={`${TH_RIGHT} hidden sm:table-cell`}>
                  Year earlier
                </th>
                <th scope="col" className={TH_RIGHT}>
                  YoY
                </th>
                <th scope="col" className={`${TH_RIGHT} hidden md:table-cell`}>
                  Share of EU4
                </th>
                <th scope="col" className={`${TH_RIGHT} hidden md:table-cell`}>
                  Months of use
                </th>
                <th scope="col" className={TH}>
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {stocks.map((row) => (
                <tr
                  key={row.country}
                  className="border-b border-rule transition-colors last:border-b-0 hover:bg-ground/70"
                >
                  <td className={TD}>
                    <CountryLabel code={row.country} withName />
                  </td>
                  <td className={`${TD} tnum font-mono text-xs text-ink-soft`}>
                    {formatDate(row.referenceDate)}
                  </td>
                  <td className={`${TD_RIGHT} tnum font-mono text-sm font-medium text-ink`}>
                    {formatPrice(row.stocksMhl, 1)}
                  </td>
                  <td
                    className={`${TD_RIGHT} tnum hidden font-mono text-sm text-ink-soft sm:table-cell`}
                  >
                    {formatPrice(row.yearEarlierMhl, 1)}
                  </td>
                  <td className={TD_RIGHT}>
                    <MaybePercent value={row.yoyPercent} />
                  </td>
                  <td
                    className={`${TD_RIGHT} tnum hidden font-mono text-xs text-ink-soft md:table-cell`}
                  >
                    {row.shareOfTotalPercent === null
                      ? "n/a"
                      : `${formatPrice(row.shareOfTotalPercent, 1)}%`}
                  </td>
                  <td
                    className={`${TD_RIGHT} tnum hidden font-mono text-xs text-ink md:table-cell`}
                  >
                    {row.monthsOfUse === null
                      ? "n/a"
                      : formatPrice(row.monthsOfUse, 1)}
                  </td>
                  <td className={TD}>
                    <DataStatusLabel status={row.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-2">
          <SourceLine source={sources} />
        </div>
        <p className="wt-label mt-2 max-w-3xl leading-relaxed text-ink-soft">
          Months of use divides the latest declared stocks by the previous
          campaign&apos;s average monthly disappearance (domestic use plus
          exports). It is a rough coverage indicator, valid only where the
          balance data uses comparable definitions; it is not a forecast.
          {mixed
            ? " While some countries are illustrative, shares of the four-country total are not shown, and months of use only for the samples."
            : null}
        </p>
      </section>

      {spain && spainSource && latestCampaign ? (
        <section className="mt-12">
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
      ) : null}

      <section className="mt-12">
        <SectionHeader
          kicker="History"
          title="Opening stocks by campaign"
          description={
            mixed
              ? "Stocks declared at 1 August, the start of each marketing campaign. Spain's are the INFOVI stocks at 31 July; the other countries are illustrative samples."
              : "Stocks declared at 1 August, the start of each marketing campaign. The four-country position has eased for three consecutive campaigns."
          }
        />
        <figure className="mt-5 border border-rule bg-paper">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-rule px-4 py-3">
            <h3 className="text-sm font-semibold text-ink">
              Opening stocks at 1 August
            </h3>
            <p className="wt-label text-ink-soft">Mhl</p>
          </div>
          <div className="px-2 py-3">
            <GroupedBarChart
              points={chartPoints}
              series={PRODUCER_COUNTRIES.map((country) => ({
                key: country,
                name: seriesName(country),
              }))}
              unit="Mhl"
            />
          </div>
          <figcaption className="border-t border-rule px-4 py-2.5">
            <SourceLine source={sources} />
          </figcaption>
        </figure>
      </section>

      <div className="mt-10 max-w-3xl">
        <MethodologyNotes title="Reporting dates and country methodologies">
          <ul className="space-y-2">
            {stocks.map((row) => (
              <li key={row.country} className="flex gap-3">
                <CountryLabel code={row.country} />
                <span>
                  {row.methodology}
                  {mixed && samples.has(row.country) ? " Illustrative sample." : null}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 border-t border-rule pt-3">
            Because reference dates and coverage differ, cross-country
            comparisons are indicative. Within-country comparisons against
            the same reference a year earlier are the more reliable signal.
            {sources.length > 1 ? " Sources: " : " Source: "}
            {sources.map((source) => source.name).join("; ")}.
          </p>
        </MethodologyNotes>
      </div>
    </Container>
  );
}
