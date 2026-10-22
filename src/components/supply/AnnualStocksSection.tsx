import type { ReactNode } from "react";

import { MaybePercent, TD, TD_RIGHT, TH, TH_RIGHT } from "@/components/markets/cells";
import { DataStatusLabel } from "@/components/ui/DataStatusLabel";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SourceLine } from "@/components/ui/SourceLine";
import { formatPrice } from "@/lib/format";
import { getSource } from "@/services/markets/sources";
import type { AnnualStocks } from "@/services/supply/types";

function percentChange(current: number, previous: number | null): number | null {
  return previous === null || previous === 0 ? null : (current / previous - 1) * 100;
}

/**
 * One country's stocks declared at 31 July: the latest year's breakdown
 * against the year before, and every year's totals, with the producers'
 * and the traders' parts where the source keeps them apart. The note
 * under the tables says how the source counts.
 */
export function AnnualStocksSection({
  stocks,
  kicker,
  title,
  description,
  note,
}: {
  stocks: AnnualStocks;
  kicker: string;
  title: string;
  description: string;
  note: ReactNode;
}) {
  const source = getSource(stocks.sourceId);
  const byHolder = stocks.history.some(
    (point) => point.producersMhl !== null || point.tradersMhl !== null,
  );
  const history = [...stocks.history].reverse();

  return (
    <section className="mt-12">
      <SectionHeader kicker={kicker} title={title} description={description} />
      <div className="mt-5 grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
        <div className="overflow-x-auto border border-rule bg-paper">
          <table className="w-full border-collapse text-left">
            <caption className="sr-only">
              Stocks at 31 July {stocks.latestYear} by category, against 31 July{" "}
              {stocks.latestYear - 1}
            </caption>
            <thead>
              <tr className="border-b-2 border-ink">
                <th scope="col" className={TH}>
                  <span className="flex items-center gap-2">
                    Stocks at 31 July, Mhl
                    <DataStatusLabel status="final" />
                  </span>
                </th>
                <th scope="col" className={TH_RIGHT}>
                  {stocks.latestYear}
                </th>
                <th scope="col" className={`${TH_RIGHT} hidden sm:table-cell`}>
                  {stocks.latestYear - 1}
                </th>
                <th scope="col" className={TH_RIGHT}>
                  Change
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
              Stocks at 31 July of every year declared, million hectolitres
            </caption>
            <thead>
              <tr className="border-b-2 border-ink">
                <th scope="col" className={TH}>
                  31 July
                </th>
                {byHolder ? (
                  <>
                    <th scope="col" className={`${TH_RIGHT} hidden sm:table-cell`}>
                      Producers
                    </th>
                    <th scope="col" className={`${TH_RIGHT} hidden sm:table-cell`}>
                      Traders
                    </th>
                  </>
                ) : null}
                <th scope="col" className={TH_RIGHT}>
                  All, Mhl
                </th>
                <th scope="col" className={TH_RIGHT}>
                  YoY
                </th>
              </tr>
            </thead>
            <tbody>
              {history.map((point, index) => {
                const previous = history[index + 1] ?? null;
                return (
                  <tr key={point.year} className="border-b border-rule last:border-b-0">
                    <th scope="row" className={`${TD} font-mono text-xs font-normal text-ink-soft`}>
                      {point.year}
                    </th>
                    {byHolder ? (
                      <>
                        <td className={`${TD_RIGHT} tnum hidden font-mono text-sm text-ink-soft sm:table-cell`}>
                          {point.producersMhl === null ? "n/a" : formatPrice(point.producersMhl, 2)}
                        </td>
                        <td className={`${TD_RIGHT} tnum hidden font-mono text-sm text-ink-soft sm:table-cell`}>
                          {point.tradersMhl === null ? "n/a" : formatPrice(point.tradersMhl, 2)}
                        </td>
                      </>
                    ) : null}
                    <td className={`${TD_RIGHT} tnum font-mono text-sm text-ink`}>
                      {formatPrice(point.totalMhl, 2)}
                    </td>
                    <td className={TD_RIGHT}>
                      <MaybePercent
                        value={percentChange(point.totalMhl, previous ? previous.totalMhl : null)}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <div className="mt-3">
        <SourceLine source={{ name: source.name, url: source.url }} updatedAt={stocks.updatedAt} />
      </div>
      <p className="wt-label mt-2 max-w-3xl leading-relaxed text-ink-soft">{note}</p>
    </section>
  );
}
