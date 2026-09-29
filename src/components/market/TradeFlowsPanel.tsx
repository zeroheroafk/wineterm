import { MaybePercent } from "@/components/markets/cells";
import { CountryLabel } from "@/components/ui/CountryLabel";
import { DataStatusLabel } from "@/components/ui/DataStatusLabel";
import { SourceLine } from "@/components/ui/SourceLine";
import { formatPrice } from "@/lib/format";
import type { TradeOverview, TradeRankRow } from "@/services/types";

function RankedTable({
  title,
  rows,
  period,
}: {
  title: string;
  rows: TradeRankRow[];
  period: string;
}) {
  return (
    <div className="min-w-0 border border-rule bg-paper">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b-2 border-ink px-3 py-2">
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
        <p className="wt-label text-ink-soft">Volume, {period}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">
            {title}: volume in million hl and year-on-year change, {period}
          </caption>
        <thead className="sr-only">
          <tr>
            <th scope="col">Rank</th>
            <th scope="col">Country</th>
            <th scope="col">Volume, million hl</th>
            <th scope="col">Year-on-year change</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.country}
              className="border-b border-rule last:border-b-0"
            >
              <td className="tnum w-8 py-2.5 pl-3 font-mono text-xs text-ink-soft">
                {row.rank}
              </td>
              <td className="px-2 py-2.5 whitespace-nowrap">
                <CountryLabel code={row.country} withName />
              </td>
              <td className="tnum px-2 py-2.5 text-right font-mono text-sm whitespace-nowrap text-ink">
                {formatPrice(row.volumeMhl, 1)}
                <span className="ml-1.5 text-[0.65rem] text-ink-soft">Mhl</span>
              </td>
              <td className="py-2.5 pr-3 pl-2 text-right whitespace-nowrap">
                <MaybePercent value={row.yoyPercent} />
              </td>
            </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Trade flow overview: leading exporters and import destinations as
 * ranked tables, plus the export volume split by product form as one
 * labelled bar per form. Wine only: grape must is never added to wine.
 */
export function TradeFlowsPanel({ overview }: { overview: TradeOverview }) {
  return (
    <figure>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <RankedTable
          title="Leading exporters"
          rows={overview.exporters}
          period={overview.period}
        />
        <RankedTable
          title="Leading import destinations"
          rows={overview.importers}
          period={overview.period}
        />
      </div>

      <div className="mt-5 border border-rule bg-paper px-4 py-3.5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-sm font-semibold text-ink">
            Export volume by product form
          </h3>
          <DataStatusLabel status={overview.status} />
        </div>
        <dl className="mt-3 space-y-2">
          {overview.split.map((segment) => (
            <div
              key={segment.label}
              className="grid grid-cols-[6.5rem_minmax(0,1fr)_2.5rem] items-center gap-3"
            >
              <dt className="wt-label text-ink-soft">{segment.label}</dt>
              <dd aria-hidden="true" className="h-2.5 bg-ground">
                <span
                  className="block h-full bg-wine"
                  style={{ width: `${segment.sharePercent}%` }}
                />
              </dd>
              <dd className="tnum text-right font-mono text-sm text-ink">
                {formatPrice(segment.sharePercent, 0)}%
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <figcaption className="mt-2 space-y-1">
        <p className="wt-label text-ink-soft">
          Wine exported by Spain, Portugal, France and Italy to all partners:
          bulk, bottled, bag-in-box and sparkling. Grape must is left out.
        </p>
        <SourceLine source={overview.source} updatedAt={overview.updatedAt} />
      </figcaption>
    </figure>
  );
}
