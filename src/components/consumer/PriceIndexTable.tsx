import { MaybePercent, TD, TD_RIGHT, TH, TH_RIGHT } from "@/components/markets/cells";
import { CountryLabel } from "@/components/ui/CountryLabel";
import { DataStatusLabel } from "@/components/ui/DataStatusLabel";
import { ScrollRegion } from "@/components/ui/ScrollRegion";
import { formatMonthYear, formatPrice } from "@/lib/format";
import type { WinePriceIndexRow } from "@/services/consumer/types";

/**
 * Consumer price indices of wine by country: each country's latest month,
 * its index, the annual change as published and the change over five
 * years. The EU's row is set apart as the reference. A figure that is not
 * final says so beside its month.
 */
export function PriceIndexTable({
  rows,
  caption,
}: {
  rows: WinePriceIndexRow[];
  caption: string;
}) {
  return (
    <ScrollRegion className="border border-rule bg-paper">
      <table className="w-full border-collapse text-left">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b-2 border-ink">
            <th scope="col" className={TH}>
              Country
            </th>
            <th scope="col" className={TH}>
              Month
            </th>
            <th scope="col" className={`${TH_RIGHT} hidden sm:table-cell`}>
              Index, 2025 = 100
            </th>
            <th scope="col" className={TH_RIGHT}>
              Year on year
            </th>
            <th scope="col" className={TH_RIGHT}>
              Five years
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const reference = row.country === "EU";
            return (
              <tr
                key={row.country}
                className={
                  reference
                    ? "border-b-2 border-ink/30"
                    : "border-b border-rule last:border-b-0"
                }
              >
                <th
                  scope="row"
                  className={`${TD} ${reference ? "font-semibold" : "font-normal"}`}
                >
                  <CountryLabel code={row.country} withName />
                </th>
                <td className={`${TD} tnum font-mono text-xs text-ink-soft`}>
                  <span className="inline-flex items-center gap-2">
                    {formatMonthYear(row.month)}
                    {row.status !== "final" ? <DataStatusLabel status={row.status} /> : null}
                  </span>
                </td>
                <td
                  className={`${TD_RIGHT} tnum hidden font-mono text-sm text-ink-soft sm:table-cell`}
                >
                  {formatPrice(row.index)}
                </td>
                <td className={TD_RIGHT}>
                  <MaybePercent value={row.annualRate} />
                </td>
                <td className={TD_RIGHT}>
                  <MaybePercent value={row.fiveYearPercent} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </ScrollRegion>
  );
}
