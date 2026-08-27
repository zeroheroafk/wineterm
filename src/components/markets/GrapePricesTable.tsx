import Link from "next/link";

import { PriceCell } from "@/components/market/PriceCell";
import {
  MaybePercent,
  RangeCell,
  TD,
  TD_RIGHT,
  TH,
  TH_RIGHT,
} from "@/components/markets/cells";
import { SourceTypeTag, VerificationTag } from "@/components/markets/tags";
import { CountryLabel } from "@/components/ui/CountryLabel";
import { EmptyState } from "@/components/ui/states";
import { formatDate, formatPrice } from "@/lib/format";
import { referenceUnit, type MarketRow } from "@/services/markets/types";

const COLOUR_SHORT = { red: "Red", white: "White", rose: "Rose" } as const;

/**
 * Grape price table. Provenance leads: every row carries its source type
 * and verification state, and fragmented regional observations are shown
 * as such; WineTerm publishes no aggregate grape index.
 */
export function GrapePricesTable({ rows }: { rows: MarketRow[] }) {
  if (rows.length === 0) {
    return (
      <EmptyState
        title="No grape series match these filters"
        detail="Reset the filters or widen the selection; settlement prices arrive through the campaign."
      />
    );
  }

  return (
    <div className="overflow-x-auto border border-rule bg-paper">
      <table className="w-full border-collapse text-left">
        <caption className="sr-only">
          Grape prices by region, variety and harvest, with source type and
          verification status
        </caption>
        <thead>
          <tr className="border-b-2 border-ink">
            <th scope="col" className={TH}>
              Market
            </th>
            <th scope="col" className={TH}>
              Variety
            </th>
            <th scope="col" className={`${TH} hidden md:table-cell`}>
              Quality
            </th>
            <th scope="col" className={TH}>
              Harvest
            </th>
            <th scope="col" className={TH_RIGHT}>
              Price
            </th>
            <th scope="col" className={`${TH_RIGHT} hidden lg:table-cell`}>
              Range
            </th>
            <th scope="col" className={`${TH_RIGHT} hidden lg:table-cell`}>
              Norm. EUR/kg
            </th>
            <th scope="col" className={`${TH_RIGHT} hidden md:table-cell`}>
              YoY %
            </th>
            <th scope="col" className={TH}>
              Source type
            </th>
            <th scope="col" className={`${TH} hidden sm:table-cell`}>
              Verification
            </th>
            <th scope="col" className={TH}>
              Date
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.series.code}
              className="border-b border-rule transition-colors last:border-b-0 hover:bg-ground/70"
            >
              <td className={TD}>
                <span className="flex items-center gap-2">
                  <CountryLabel code={row.series.country} />
                  <Link
                    href={`/markets/series/${row.series.code}`}
                    className="text-sm font-medium text-ink hover:text-wine-deep"
                  >
                    {row.series.appellation ?? row.series.region}
                  </Link>
                </span>
              </td>
              <td className={`${TD} text-sm text-ink`}>
                {row.series.variety}
                {row.series.colour ? (
                  <span className="text-ink-soft">
                    {" "}
                    &middot; {COLOUR_SHORT[row.series.colour]}
                  </span>
                ) : null}
              </td>
              <td className={`${TD} hidden text-sm text-ink-soft md:table-cell`}>
                {row.series.qualityCategory ?? "-"}
              </td>
              <td className={`${TD} tnum font-mono text-xs text-ink`}>
                {row.series.harvestYear}
              </td>
              <td className={TD_RIGHT}>
                <PriceCell value={row.latest.value} unit={row.series.unit} />
              </td>
              <td className={`${TD_RIGHT} hidden lg:table-cell`}>
                <RangeCell observation={row.latest} />
              </td>
              <td className={`${TD_RIGHT} hidden lg:table-cell`}>
                {row.normalisedValue !== null ? (
                  <span
                    className="tnum font-mono text-sm text-ink-soft"
                    title={`Normalised from ${row.series.unit} to ${referenceUnit(row.series.unit)}`}
                  >
                    {formatPrice(row.normalisedValue)}
                    <sup className="ml-0.5 text-[0.6rem] text-ochre">n</sup>
                  </span>
                ) : (
                  <span className="wt-label text-ink-soft">&middot;</span>
                )}
              </td>
              <td className={`${TD_RIGHT} hidden md:table-cell`}>
                <MaybePercent value={row.changes.yoyPercent} />
              </td>
              <td className={TD}>
                <SourceTypeTag type={row.series.sourceType} />
              </td>
              <td className={`${TD} hidden sm:table-cell`}>
                <VerificationTag status={row.series.verification} />
              </td>
              <td className={`${TD} tnum font-mono text-xs text-ink-soft`}>
                {formatDate(row.latest.date)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
