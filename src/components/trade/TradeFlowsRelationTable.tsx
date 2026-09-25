import { MaybePercent, TD, TD_RIGHT, TH, TH_RIGHT } from "@/components/markets/cells";
import { CountryLabel } from "@/components/ui/CountryLabel";
import { formatPrice } from "@/lib/format";
import type { TradeFlowRow } from "@/services/trade/types";

/** Top origin-to-destination relationships within one category. */
export function TradeFlowsRelationTable({
  rows,
  period,
}: {
  rows: TradeFlowRow[];
  period: string;
}) {
  return (
    <div className="min-w-0 border border-rule bg-paper">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b-2 border-ink px-3 py-2">
        <h4 className="text-sm font-semibold text-ink">Largest flows</h4>
        <p className="wt-label text-ink-soft">{period}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">
            Largest origin to destination flows in this category
          </caption>
          <thead>
            <tr className="border-b border-rule">
              <th scope="col" className={TH}>
                Flow
              </th>
              <th scope="col" className={TH_RIGHT}>
                Vol (Mhl)
              </th>
              <th scope="col" className={`${TH_RIGHT} hidden sm:table-cell`}>
                Value (M EUR)
              </th>
              <th scope="col" className={`${TH_RIGHT} hidden md:table-cell`}>
                EUR/l
              </th>
              <th scope="col" className={TH_RIGHT}>
                YoY
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={`${row.origin}-${row.destination}`}
                className="border-b border-rule last:border-b-0"
              >
                <td className={TD}>
                  <span className="flex items-center gap-2">
                    <CountryLabel code={row.origin} />
                    <span aria-hidden="true" className="text-xs text-ink-soft">
                      &rarr;
                    </span>
                    <CountryLabel code={row.destination} />
                  </span>
                </td>
                <td className={`${TD_RIGHT} tnum font-mono text-sm text-ink`}>
                  {formatPrice(row.volumeMhl, 1)}
                </td>
                <td
                  className={`${TD_RIGHT} tnum hidden font-mono text-sm text-ink sm:table-cell`}
                >
                  {formatPrice(row.valueMeur, 0)}
                </td>
                <td
                  className={`${TD_RIGHT} tnum hidden font-mono text-sm text-ink-soft md:table-cell`}
                >
                  {formatPrice(row.unitValueEurL)}
                </td>
                <td className={TD_RIGHT}>
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
