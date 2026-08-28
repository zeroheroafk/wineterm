import type { Metadata } from "next";

import { GroupedBarChart } from "@/components/charts/GroupedBarChart";
import { Container } from "@/components/layout/Container";
import { SectionPageHeader } from "@/components/layout/SectionPageHeader";
import { MaybePercent, TD, TD_RIGHT, TH, TH_RIGHT } from "@/components/markets/cells";
import { MethodologyNotes } from "@/components/supply/MethodologyNotes";
import { CountryLabel } from "@/components/ui/CountryLabel";
import { DataStatusLabel } from "@/components/ui/DataStatusLabel";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SourceLine } from "@/components/ui/SourceLine";
import { formatDate, formatPrice } from "@/lib/format";
import { primaryNavigation } from "@/lib/navigation";
import { getSource } from "@/services/markets/sources";
import { getSupplyService } from "@/services/supply/service";
import { COUNTRY_NAMES, PRODUCER_COUNTRIES } from "@/services/types";

export const metadata: Metadata = {
  title: "Stocks",
  description:
    "Declared wine stocks by country: latest references, year-on-year direction and opening stocks across campaigns, in million hectolitres.",
};

export default async function StocksPage() {
  const supply = getSupplyService();
  const [stocks, history] = await Promise.all([
    supply.getStocks(),
    supply.getOpeningStocksHistory(),
  ]);
  const source = getSource("sample-supply-stats");

  const campaignsInHistory = history.ES.map((row) => row.campaign);
  const chartPoints = campaignsInHistory.map((campaign) => {
    const point: { label: string; [key: string]: string | number } = {
      label: campaign,
    };
    for (const country of PRODUCER_COUNTRIES) {
      const entry = history[country].find((row) => row.campaign === campaign);
      if (entry) point[country] = entry.stocksMhl;
    }
    return point;
  });

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
        description="Declared wine stocks by country: the latest reference alongside the year-earlier position, each country's share of the four-country total, and stocks expressed in months of use. Development figures are illustrative samples."
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
                    {formatPrice(row.shareOfTotalPercent, 1)}%
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
        <p className="wt-label mt-2 max-w-3xl leading-relaxed text-ink-soft">
          Months of use divides the latest declared stocks by the previous
          campaign&apos;s average monthly disappearance (domestic use plus
          exports). It is a rough coverage indicator, valid only where the
          balance data uses comparable definitions; it is not a forecast.
        </p>
      </section>

      <section className="mt-12">
        <SectionHeader
          kicker="History"
          title="Opening stocks by campaign"
          description="Stocks declared at 1 August, the start of each marketing campaign. The four-country position has eased for three consecutive campaigns."
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
                name: COUNTRY_NAMES[country],
              }))}
              unit="Mhl"
            />
          </div>
          <figcaption className="border-t border-rule px-4 py-2.5">
            <SourceLine source={{ name: source.name }} />
          </figcaption>
        </figure>
      </section>

      <div className="mt-10 max-w-3xl">
        <MethodologyNotes title="Reporting dates and country methodologies">
          <ul className="space-y-2">
            {stocks.map((row) => (
              <li key={row.country} className="flex gap-3">
                <CountryLabel code={row.country} />
                <span>{row.methodology}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 border-t border-rule pt-3">
            Because reference dates and coverage differ, cross-country
            comparisons are indicative. Within-country comparisons against
            the same reference a year earlier are the more reliable signal.
            Source: {source.name}.
          </p>
        </MethodologyNotes>
      </div>
    </Container>
  );
}
