import { InlinePercentChange } from "@/components/market/ChangeCell";
import { sharedStatusNote } from "@/components/ui/DataStatusLabel";
import { DataNote } from "@/components/ui/SourceLine";
import { formatPrice } from "@/lib/format";
import {
  COUNTRY_NAMES,
  type TradeOverview,
  type TradeRankRow,
  type TradeSplitSegment,
} from "@/services/types";

const TH = "py-1.5 text-[0.8125rem] leading-tight font-medium text-ink-soft";
const TD = "py-2";

function ListTitle({ children }: { children: string }) {
  return (
    <h3 className="text-[0.9375rem] font-semibold text-ink">{children}</h3>
  );
}

function RankedList({
  title,
  rows,
  period,
}: {
  title: string;
  rows: TradeRankRow[];
  period: string;
}) {
  return (
    <div className="min-w-0">
      <ListTitle>{title}</ListTitle>
      <table className="mt-2 w-full border-collapse text-left text-sm">
        <caption className="sr-only">
          {title}: volume in million hectolitres, {period}, and change
          against the same period a year earlier
        </caption>
        <thead>
          <tr className="border-b border-ink/30">
            <th scope="col" className={`${TH} w-7`}>
              <span className="sr-only">Rank</span>
            </th>
            <th scope="col" className={TH}>
              Country
            </th>
            <th scope="col" className={`${TH} text-right`}>
              Mhl
            </th>
            <th scope="col" className={`${TH} w-24 text-right`}>
              Year on year
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.country} className="border-b border-rule">
              <td className={`${TD} tnum text-ink-soft`}>{row.rank}</td>
              <th scope="row" className={`${TD} font-medium text-ink`}>
                {COUNTRY_NAMES[row.country]}
              </th>
              <td className={`${TD} tnum text-right font-semibold text-ink`}>
                {formatPrice(row.volumeMhl, 1)}
              </td>
              <td className={`${TD} text-right`}>
                <InlinePercentChange value={row.yoyPercent} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CompositionList({ split }: { split: TradeSplitSegment[] }) {
  return (
    <div className="min-w-0">
      <ListTitle>Export volume by product form</ListTitle>
      <table className="mt-2 w-full border-collapse text-left text-sm">
        <caption className="sr-only">
          Share of export volume by product form, percent
        </caption>
        <thead>
          <tr className="border-b border-ink/30">
            <th scope="col" className={TH}>
              Product
            </th>
            <th scope="col" className={`${TH} w-2/5`}>
              <span className="sr-only">Share, as a bar</span>
            </th>
            <th scope="col" className={`${TH} w-24 text-right`}>
              Share
            </th>
          </tr>
        </thead>
        <tbody>
          {split.map((segment) => (
            <tr key={segment.label} className="border-b border-rule">
              <th scope="row" className={`${TD} font-medium text-ink`}>
                {segment.label}
              </th>
              <td className={TD}>
                <span aria-hidden="true" className="block h-2.5 w-full bg-rule/45">
                  <span
                    className="block h-full bg-wine"
                    style={{ width: `${segment.sharePercent}%` }}
                  />
                </span>
              </td>
              <td className={`${TD} tnum text-right font-semibold text-ink`}>
                {formatPrice(segment.sharePercent, 0)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Trade snapshot: leading exporters and import destinations as compact
 * ranked lists, and export composition by product form as a single
 * burgundy bar series. Detailed rankings live on the Trade page.
 */
export function TradeFlowsPanel({ overview }: { overview: TradeOverview }) {
  return (
    <figure>
      <div className="grid grid-cols-1 gap-x-10 gap-y-8 md:grid-cols-2 lg:grid-cols-3">
        <RankedList
          title="Leading exporters"
          rows={overview.exporters}
          period={overview.period}
        />
        <RankedList
          title="Leading import destinations"
          rows={overview.importers}
          period={overview.period}
        />
        <CompositionList split={overview.split} />
      </div>
      <figcaption className="mt-4">
        <DataNote
          lead={sharedStatusNote(overview.status)}
          source={overview.source}
          updatedAt={overview.updatedAt}
        />
      </figcaption>
    </figure>
  );
}
