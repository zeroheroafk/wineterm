import type { ReactNode } from "react";

import { MaybePercent, TD, TD_RIGHT, TH, TH_RIGHT } from "@/components/markets/cells";
import { CampaignLinesChart } from "@/components/supply/CampaignLinesChart";
import { DataStatusLabel } from "@/components/ui/DataStatusLabel";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SourceLine } from "@/components/ui/SourceLine";
import { formatMonthYear, formatPrice } from "@/lib/format";
import { getSource } from "@/services/markets/sources";
import type { MonthlyStocks } from "@/services/supply/types";

function percentChange(current: number, previous: number | null): number | null {
  return previous === null || previous === 0 ? null : (current / previous - 1) * 100;
}

/**
 * One country's month-end wine stocks: the monthly path of the latest two
 * campaigns as a chart, the latest month's breakdown against a year
 * earlier, and the figures behind the chart. The note under the tables
 * says how the source counts.
 */
export function MonthlyStocksSection({
  stocks,
  kicker,
  title,
  description,
  note,
}: {
  stocks: MonthlyStocks;
  kicker: string;
  title: string;
  description: string;
  note: ReactNode;
}) {
  const source = getSource(stocks.sourceId);
  const [latestCampaign, previousCampaign] = stocks.campaigns;
  const yearEarlierMonth = `${Number(stocks.latestMonth.slice(0, 4)) - 1}${stocks.latestMonth.slice(4)}`;

  return (
    <section className="mt-12">
      <SectionHeader kicker={kicker} title={title} description={description} />
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
            lines={stocks.campaigns.map((line) => ({
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
          <SourceLine source={{ name: source.name, url: source.url }} updatedAt={stocks.updatedAt} />
        </figcaption>
      </figure>

      <div className="mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
        <div className="overflow-x-auto border border-rule bg-paper">
          <table className="w-full border-collapse text-left">
            <caption className="sr-only">
              Stocks at the end of {formatMonthYear(stocks.latestMonth)} by category, against a
              year earlier
            </caption>
            <thead>
              <tr className="border-b-2 border-ink">
                <th scope="col" className={TH}>
                  Month-end stocks, Mhl
                </th>
                <th scope="col" className={TH_RIGHT}>
                  {formatMonthYear(stocks.latestMonth)}
                </th>
                <th scope="col" className={`${TH_RIGHT} hidden sm:table-cell`}>
                  {formatMonthYear(yearEarlierMonth)}
                </th>
                <th scope="col" className={TH_RIGHT}>
                  YoY
                </th>
              </tr>
            </thead>
            <tbody>
              {stocks.breakdown.map((row) => (
                <tr
                  key={row.label}
                  className={
                    row.isTotal ? "border-y-2 border-ink" : "border-b border-rule last:border-b-0"
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
              Month-end wine stocks in {latestCampaign.campaign}
              {previousCampaign ? ` and ${previousCampaign.campaign}` : ""}, the figures
              behind the chart
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
      <p className="wt-label mt-2 max-w-3xl leading-relaxed text-ink-soft">{note}</p>
    </section>
  );
}
