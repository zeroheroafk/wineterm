import { InlinePercentChange } from "@/components/market/ChangeCell";
import { sharedStatusNote } from "@/components/ui/DataStatusLabel";
import { DataNote } from "@/components/ui/SourceLine";
import { formatPrice } from "@/lib/format";
import {
  countryName,
  type TradeOverview,
  type TradeRankRow,
  type TradeSplitSegment,
} from "@/services/types";

const TH = "py-1.5 text-[0.8125rem] leading-tight font-medium text-ink-soft";
const TD = "py-2";

function ListTitle({ title, scope }: { title: string; scope: string }) {
  return (
    <>
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      <p className="text-[0.8125rem] text-ink-soft">{scope}</p>
    </>
  );
}

function RankedList({
  title,
  scope,
  rows,
  period,
}: {
  title: string;
  scope: string;
  rows: TradeRankRow[];
  period: string;
}) {
  return (
    <div className="min-w-0">
      <ListTitle title={title} scope={scope} />
      <table className="mt-2 w-full border-collapse text-left text-[0.9375rem]">
        <caption className="sr-only">
          {title}, {scope.toLowerCase()}: volume in million hectolitres,{" "}
          {period}, and change against the same period a year earlier
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
                {countryName(row.country)}
              </th>
              <td className={`${TD} tnum text-right font-semibold text-ink`}>
                {formatPrice(row.volumeMhl, 1)}
              </td>
              <td className={`${TD} text-right`}>
                {row.yoyPercent === null ? (
                  <span className="text-ink-soft">n/a</span>
                ) : (
                  <InlinePercentChange value={row.yoyPercent} />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CompositionList({
  split,
  totalMhl,
}: {
  split: TradeSplitSegment[];
  totalMhl: number;
}) {
  const scope = `Share of ${formatPrice(totalMhl, 1)} Mhl of wine exports`;
  return (
    <div className="min-w-0">
      <ListTitle title="Export volume by product form" scope={scope} />
      <table className="mt-2 w-full border-collapse text-left text-[0.9375rem]">
        <caption className="sr-only">
          Export volume by product form: million hectolitres and share of the{" "}
          {formatPrice(totalMhl, 1)} million hectolitres exported in these
          forms
        </caption>
        <thead>
          <tr className="border-b border-ink/30">
            <th scope="col" className={TH}>
              Product
            </th>
            <th scope="col" className={`${TH} w-[34%]`}>
              <span className="sr-only">Share, as a bar</span>
            </th>
            <th scope="col" className={`${TH} text-right`}>
              Mhl
            </th>
            <th scope="col" className={`${TH} w-16 text-right`}>
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
              <td className={`${TD} pl-3`}>
                <span aria-hidden="true" className="block h-2.5 w-full bg-rule/45">
                  <span
                    className="block h-full bg-wine"
                    style={{ width: `${segment.sharePercent}%` }}
                  />
                </span>
              </td>
              <td className={`${TD} tnum text-right text-ink`}>
                {formatPrice(segment.volumeMhl, 1)}
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
 * Trade snapshot: leading wine exporters, the leading destinations of one
 * category and export composition by product form, as three compact
 * lists. Each list states what it covers; the note states what the whole
 * snapshot leaves out. Detailed rankings live on the Trade page.
 */
export function TradeFlowsPanel({ overview }: { overview: TradeOverview }) {
  return (
    <figure>
      <div className="grid grid-cols-1 gap-x-10 gap-y-8 md:grid-cols-2 lg:grid-cols-3">
        <RankedList
          title="Leading exporters"
          scope={overview.exportersLabel}
          rows={overview.exporters}
          period={overview.period}
        />
        <RankedList
          title="Leading destinations"
          scope={overview.destinationsLabel}
          rows={overview.destinations}
          period={overview.period}
        />
        <CompositionList
          split={overview.split}
          totalMhl={overview.splitTotalMhl}
        />
      </div>
      <figcaption className="mt-4">
        <DataNote
          lead={sharedStatusNote(overview.status)}
          source={overview.source}
          updatedAt={overview.updatedAt}
        >
          {overview.scopeNote}
        </DataNote>
      </figcaption>
    </figure>
  );
}
