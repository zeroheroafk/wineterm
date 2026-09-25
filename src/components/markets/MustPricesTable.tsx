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
import { DataClassificationTag } from "@/components/markets/tags";
import { CountryLabel } from "@/components/ui/CountryLabel";
import { DataStatusLabel } from "@/components/ui/DataStatusLabel";
import { EmptyState } from "@/components/ui/states";
import { formatDate } from "@/lib/format";
import { getSource } from "@/services/markets/sources";
import {
  MUST_PRODUCT_LABELS,
  type MarketRow,
} from "@/services/markets/types";

const COLOUR_SHORT = { red: "Red", white: "White", rose: "Rose" } as const;

/**
 * Must and concentrates table. The default view stays readable: product,
 * origin, the technical specification in one compact column, then price
 * and provenance. Volume and mass quotations keep their original units
 * and are never converted into each other.
 */
export function MustPricesTable({ rows }: { rows: MarketRow[] }) {
  if (rows.length === 0) {
    return (
      <EmptyState
        title="No must or concentrate series match these filters"
        detail="Reset the filters or widen the selection."
      />
    );
  }

  return (
    <div className="overflow-x-auto border border-rule bg-paper">
      <table className="w-full border-collapse text-left">
        <caption className="sr-only">
          Must and concentrate quotations with product form, specification,
          origin and provenance
        </caption>
        <thead>
          <tr className="border-b-2 border-ink">
            <th scope="col" className={TH}>
              Product
            </th>
            <th scope="col" className={TH}>
              Origin
            </th>
            <th scope="col" className={`${TH} hidden md:table-cell`}>
              Specification
            </th>
            <th scope="col" className={TH_RIGHT}>
              Price
            </th>
            <th scope="col" className={`${TH_RIGHT} hidden lg:table-cell`}>
              Range
            </th>
            <th scope="col" className={TH_RIGHT}>
              Wk %
            </th>
            <th scope="col" className={TH}>
              Date
            </th>
            <th scope="col" className={`${TH} hidden sm:table-cell`}>
              Source
            </th>
            <th scope="col" className={`${TH} hidden lg:table-cell`}>
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const source = getSource(row.series.sourceId);
            return (
              <tr
                key={row.series.code}
                className="border-b border-rule transition-colors last:border-b-0 hover:bg-ground/70"
              >
                <td className={TD}>
                  <Link
                    href={`/markets/series/${row.series.code}`}
                    className="text-sm font-medium text-ink hover:text-wine-deep"
                  >
                    {row.series.mustProduct
                      ? MUST_PRODUCT_LABELS[row.series.mustProduct]
                      : row.series.name}
                  </Link>
                  {row.series.colour ? (
                    <span className="text-sm text-ink-soft">
                      {" "}
                      &middot; {COLOUR_SHORT[row.series.colour]}
                    </span>
                  ) : null}
                </td>
                <td className={TD}>
                  <span className="flex items-center gap-2">
                    <CountryLabel code={row.series.country} />
                    <span className="text-sm text-ink-soft">
                      {row.series.region}
                    </span>
                  </span>
                </td>
                <td
                  className={`${TD} hidden font-mono text-xs text-ink-soft md:table-cell`}
                >
                  {row.series.spec ?? "-"}
                </td>
                <td className={TD_RIGHT}>
                  <PriceCell value={row.latest.value} unit={row.series.unit} />
                </td>
                <td className={`${TD_RIGHT} hidden lg:table-cell`}>
                  <RangeCell observation={row.latest} />
                </td>
                <td className={TD_RIGHT}>
                  <MaybePercent value={row.changes.weekPercent} />
                </td>
                <td className={`${TD} tnum font-mono text-xs text-ink-soft`}>
                  {formatDate(row.latest.date)}
                </td>
                <td className={`${TD} hidden sm:table-cell`}>
                  <span title={source.name}>
                    <DataClassificationTag
                      classification={source.classification}
                    />
                  </span>
                </td>
                <td className={`${TD} hidden lg:table-cell`}>
                  <DataStatusLabel status={row.latest.status} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
