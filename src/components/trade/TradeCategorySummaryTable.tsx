import Link from "next/link";

import { MaybePercent, TD, TD_RIGHT, TH, TH_RIGHT } from "@/components/markets/cells";
import { DataStatusLabel } from "@/components/ui/DataStatusLabel";
import { formatPrice } from "@/lib/format";
import {
  TRADE_CATEGORY_LABELS,
  type TradeCategorySummary,
} from "@/services/trade/types";

const CATEGORY_ANCHORS: Record<string, string> = {
  bulk: "#bulk",
  bottled: "#bottled",
  sparkling: "#sparkling",
  must: "#must",
};

/**
 * Category overview: one row per customs category, EU4 external trade.
 * Categories are separate headings; no combined total row exists,
 * because volumes and unit values are not comparable across them.
 */
export function TradeCategorySummaryTable({
  summaries,
  period,
}: {
  summaries: TradeCategorySummary[];
  period: string;
}) {
  return (
    <figure>
      <div className="overflow-x-auto border border-rule bg-paper">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">
            Trade by customs category, {period}: export and import volumes and
            values, unit values and annual change
          </caption>
          <thead>
            <tr className="border-b-2 border-ink">
              <th scope="col" className={TH}>
                Category
              </th>
              <th scope="col" className={TH_RIGHT}>
                Exp vol (Mhl)
              </th>
              <th scope="col" className={TH_RIGHT}>
                Exp value (M EUR)
              </th>
              <th scope="col" className={`${TH_RIGHT} hidden md:table-cell`}>
                Unit value (EUR/l)
              </th>
              <th scope="col" className={`${TH_RIGHT} hidden lg:table-cell`}>
                Imp vol (Mhl)
              </th>
              <th scope="col" className={`${TH_RIGHT} hidden lg:table-cell`}>
                Imp value (M EUR)
              </th>
              <th scope="col" className={TH_RIGHT}>
                Vol YoY
              </th>
              <th scope="col" className={`${TH_RIGHT} hidden sm:table-cell`}>
                Value YoY
              </th>
              <th scope="col" className={TH}>
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {summaries.map((summary) => (
              <tr
                key={summary.category}
                className="border-b border-rule transition-colors last:border-b-0 hover:bg-ground/70"
              >
                <td className={TD}>
                  <Link
                    href={`/trade${CATEGORY_ANCHORS[summary.category]}`}
                    className="text-sm font-medium text-ink hover:text-wine-deep"
                  >
                    {TRADE_CATEGORY_LABELS[summary.category]}
                  </Link>
                </td>
                <td className={`${TD_RIGHT} tnum font-mono text-sm text-ink`}>
                  {formatPrice(summary.exportVolumeMhl, 1)}
                </td>
                <td className={`${TD_RIGHT} tnum font-mono text-sm text-ink`}>
                  {formatPrice(summary.exportValueMeur, 0)}
                </td>
                <td
                  className={`${TD_RIGHT} tnum hidden font-mono text-sm text-ink md:table-cell`}
                >
                  {formatPrice(summary.exportUnitValueEurL)}
                </td>
                <td
                  className={`${TD_RIGHT} tnum hidden font-mono text-sm text-ink-soft lg:table-cell`}
                >
                  {formatPrice(summary.importVolumeMhl, 1)}
                </td>
                <td
                  className={`${TD_RIGHT} tnum hidden font-mono text-sm text-ink-soft lg:table-cell`}
                >
                  {formatPrice(summary.importValueMeur, 0)}
                </td>
                <td className={TD_RIGHT}>
                  <MaybePercent value={summary.volumeYoYPercent} />
                </td>
                <td className={`${TD_RIGHT} hidden sm:table-cell`}>
                  <MaybePercent value={summary.valueYoYPercent} />
                </td>
                <td className={TD}>
                  <DataStatusLabel status={summary.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <figcaption className="wt-label mt-2 max-w-3xl leading-relaxed text-ink-soft">
        External trade of ES, PT, FR and IT combined, {period}. Categories are
        distinct customs headings and are never summed: bulk, bottled and
        sparkling volumes are wine; must and concentrate volumes are product
        as shipped at varying concentration.
      </figcaption>
    </figure>
  );
}
