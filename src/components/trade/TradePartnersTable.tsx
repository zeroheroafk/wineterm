import { MaybePercent, TD, TD_RIGHT, TH, TH_RIGHT } from "@/components/markets/cells";
import { CountryLabel } from "@/components/ui/CountryLabel";
import { formatPrice } from "@/lib/format";
import type { TradePartnerRow } from "@/services/trade/types";

/**
 * Ranked partner table within one customs category: exporters or import
 * destinations, with volume, value, unit value, changes and share.
 */
export function TradePartnersTable({
  title,
  rows,
  period,
}: {
  title: string;
  rows: TradePartnerRow[];
  period: string;
}) {
  return (
    <div className="min-w-0 border border-rule bg-paper">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b-2 border-ink px-3 py-2">
        <h4 className="text-sm font-semibold text-ink">{title}</h4>
        <p className="wt-label text-ink-soft">{period}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">
            {title}, {period}: volume, value, unit value, monthly and annual
            change, and share of the category
          </caption>
          <thead>
            <tr className="border-b border-rule">
              <th scope="col" className={`${TH} w-8`}>
                #
              </th>
              <th scope="col" className={TH}>
                Country
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
              <th scope="col" className={`${TH_RIGHT} hidden lg:table-cell`}>
                MoM
              </th>
              <th scope="col" className={TH_RIGHT}>
                YoY
              </th>
              <th scope="col" className={`${TH_RIGHT} hidden sm:table-cell`}>
                Share
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.country} className="border-b border-rule last:border-b-0">
                <td className={`${TD} tnum font-mono text-xs text-ink-soft`}>
                  {row.rank}
                </td>
                <td className={TD}>
                  <CountryLabel code={row.country} withName />
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
                <td className={`${TD_RIGHT} hidden lg:table-cell`}>
                  <MaybePercent value={row.momPercent} />
                </td>
                <td className={TD_RIGHT}>
                  <MaybePercent value={row.yoyPercent} />
                </td>
                <td
                  className={`${TD_RIGHT} tnum hidden font-mono text-xs text-ink-soft sm:table-cell`}
                >
                  {formatPrice(row.sharePercent, 1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
