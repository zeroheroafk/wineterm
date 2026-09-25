import { PercentChange } from "@/components/market/ChangeCell";
import { CountryLabel } from "@/components/ui/CountryLabel";
import { DataStatusLabel } from "@/components/ui/DataStatusLabel";
import { SourceLine } from "@/components/ui/SourceLine";
import { formatPrice } from "@/lib/format";
import type { SupplySnapshot } from "@/services/types";

const HEAD_CELL = "wt-label px-3 py-2 font-normal text-ink-soft";

function Mhl({ value }: { value: number }) {
  return (
    <span className="tnum font-mono text-sm text-ink">
      {formatPrice(value, 1)}
    </span>
  );
}

/**
 * Structured availability comparison: one horizontal bar per country
 * (production plus opening stocks on a shared scale) beside the exact
 * figures and the position against the five-year average.
 */
export function SupplyComparison({ snapshot }: { snapshot: SupplySnapshot }) {
  const maxAvailability = Math.max(
    ...snapshot.rows.map((row) => row.availabilityMhl),
  );

  return (
    <figure>
      <div className="flex flex-wrap items-center justify-between gap-2 border border-b-0 border-rule bg-paper px-3 py-2">
        <p className="wt-label text-ink">
          {snapshot.campaign}
          <span aria-hidden="true" className="mx-2 text-rule">
            &middot;
          </span>
          <span className="text-ink-soft">million hl</span>
        </p>
        <div className="flex items-center gap-4">
          <span className="wt-label flex items-center gap-1.5 text-ink-soft">
            <span aria-hidden="true" className="h-2 w-2 bg-wine" /> Production
          </span>
          <span className="wt-label flex items-center gap-1.5 text-ink-soft">
            <span aria-hidden="true" className="h-2 w-2 bg-ochre" /> Opening
            stocks
          </span>
          <DataStatusLabel status={snapshot.status} />
        </div>
      </div>

      <div className="overflow-x-auto border border-rule bg-paper">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">
            Estimated availability by country: production, opening stocks and
            comparison with the five-year average
          </caption>
          <thead>
            <tr className="border-b-2 border-ink">
              <th scope="col" className={HEAD_CELL}>
                Country
              </th>
              <th scope="col" className={`${HEAD_CELL} w-2/5 min-w-40`}>
                Availability
              </th>
              <th
                scope="col"
                className={`${HEAD_CELL} hidden text-right md:table-cell`}
              >
                Prod
              </th>
              <th
                scope="col"
                className={`${HEAD_CELL} hidden text-right md:table-cell`}
              >
                Stocks
              </th>
              <th scope="col" className={`${HEAD_CELL} text-right`}>
                Total
              </th>
              <th scope="col" className={`${HEAD_CELL} text-right`}>
                vs 5-yr
              </th>
            </tr>
          </thead>
          <tbody>
            {snapshot.rows.map((row) => {
              const productionWidth =
                (row.productionMhl / maxAvailability) * 100;
              const stocksWidth =
                (row.openingStocksMhl / maxAvailability) * 100;
              return (
                <tr
                  key={row.country}
                  className="border-b border-rule last:border-b-0"
                >
                  <td className="px-3 py-3 whitespace-nowrap">
                    <CountryLabel code={row.country} withName />
                  </td>
                  <td className="px-3 py-3">
                    <div
                      aria-hidden="true"
                      className="flex h-3.5 w-full items-stretch bg-ground"
                    >
                      <span
                        className="bg-wine"
                        style={{ width: `${productionWidth}%` }}
                      />
                      <span
                        className="bg-ochre"
                        style={{ width: `${stocksWidth}%` }}
                      />
                    </div>
                  </td>
                  <td className="hidden px-3 py-3 text-right whitespace-nowrap md:table-cell">
                    <Mhl value={row.productionMhl} />
                  </td>
                  <td className="hidden px-3 py-3 text-right whitespace-nowrap md:table-cell">
                    <Mhl value={row.openingStocksMhl} />
                  </td>
                  <td className="px-3 py-3 text-right whitespace-nowrap">
                    <Mhl value={row.availabilityMhl} />
                  </td>
                  <td className="px-3 py-3 text-right whitespace-nowrap">
                    <PercentChange value={row.vsFiveYearPercent} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <figcaption className="mt-2">
        <SourceLine source={snapshot.source} updatedAt={snapshot.updatedAt} />
      </figcaption>
    </figure>
  );
}
