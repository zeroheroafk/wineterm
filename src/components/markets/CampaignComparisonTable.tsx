import { MaybePercent, TD, TD_RIGHT, TH, TH_RIGHT } from "@/components/markets/cells";
import { formatPrice } from "@/lib/format";
import type { CampaignAverage, SeriesUnit } from "@/services/markets/types";

/**
 * Average observed price per marketing campaign (August to July), with
 * the change against the previous campaign. Averages are computed from
 * the series' own observations only.
 */
export function CampaignComparisonTable({
  averages,
  unit,
}: {
  averages: CampaignAverage[];
  unit: SeriesUnit;
}) {
  return (
    <div className="overflow-x-auto border border-rule bg-paper">
      <table className="w-full border-collapse text-left">
        <caption className="sr-only">
          Campaign average prices and change against the previous campaign
        </caption>
        <thead>
          <tr className="border-b-2 border-ink">
            <th scope="col" className={TH}>
              Campaign
            </th>
            <th scope="col" className={TH_RIGHT}>
              Average ({unit})
            </th>
            <th scope="col" className={`${TH_RIGHT} hidden sm:table-cell`}>
              Observations
            </th>
            <th scope="col" className={TH_RIGHT}>
              vs previous
            </th>
          </tr>
        </thead>
        <tbody>
          {averages.map((row) => (
            <tr key={row.campaign} className="border-b border-rule last:border-b-0">
              <td className={`${TD} tnum font-mono text-sm text-ink`}>
                {row.campaign}
              </td>
              <td className={`${TD_RIGHT} tnum font-mono text-sm text-ink`}>
                {formatPrice(row.average)}
              </td>
              <td
                className={`${TD_RIGHT} tnum hidden font-mono text-xs text-ink-soft sm:table-cell`}
              >
                {row.observations}
              </td>
              <td className={TD_RIGHT}>
                <MaybePercent value={row.changePercent} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
