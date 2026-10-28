import { MaybePercent, TD, TD_RIGHT, TH, TH_RIGHT } from "@/components/markets/cells";
import { CountryLabel } from "@/components/ui/CountryLabel";
import { SourceLine } from "@/components/ui/SourceLine";
import { formatPrice } from "@/lib/format";
import { getSource } from "@/services/markets/sources";
import type { JulyStocksRow } from "@/services/supply/types";
import type { DataSource } from "@/services/types";

function percentChange(current: number, previous: number | null): number | null {
  return previous === null || previous === 0 ? null : (current / previous - 1) * 100;
}

/**
 * Each country's stocks at its latest 31 July against a year earlier,
 * with what each source counts, since the four declarations differ in
 * who declares and what. The comparison is indicative, never a ranking
 * on one basis.
 */
export function JulyStocksTable({ rows }: { rows: JulyStocksRow[] }) {
  const sources = [
    ...new Map(
      rows.map((row): [string, DataSource] => {
        const source = getSource(row.sourceId);
        return [source.id, { name: source.name, url: source.url }];
      }),
    ).values(),
  ];

  return (
    <div>
      <div className="overflow-x-auto border border-rule bg-paper">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">
            Each country&apos;s stocks at its latest 31 July against a year earlier, million
            hectolitres, with what each source counts
          </caption>
          <thead>
            <tr className="border-b-2 border-ink">
              <th scope="col" className={TH}>
                Country
              </th>
              <th scope="col" className={TH}>
                At 31 July
              </th>
              <th scope="col" className={TH_RIGHT}>
                Mhl
              </th>
              <th scope="col" className={`${TH_RIGHT} hidden sm:table-cell`}>
                A year earlier
              </th>
              <th scope="col" className={TH_RIGHT}>
                Change
              </th>
              <th scope="col" className={`${TH} hidden lg:table-cell`}>
                What is counted
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.country} className="border-b border-rule last:border-b-0">
                <th scope="row" className={`${TD} font-normal`}>
                  <CountryLabel code={row.country} withName />
                </th>
                <td className={`${TD} font-mono text-xs text-ink-soft`}>{row.year}</td>
                <td className={`${TD_RIGHT} tnum font-mono text-sm text-ink`}>
                  {formatPrice(row.latestMhl, 2)}
                </td>
                <td className={`${TD_RIGHT} tnum hidden font-mono text-sm text-ink-soft sm:table-cell`}>
                  {row.yearEarlierMhl === null ? "n/a" : formatPrice(row.yearEarlierMhl, 2)}
                </td>
                <td className={TD_RIGHT}>
                  <MaybePercent value={percentChange(row.latestMhl, row.yearEarlierMhl)} />
                </td>
                <td className={`${TD} hidden !whitespace-normal text-xs leading-relaxed text-ink-soft lg:table-cell`}>
                  {row.scope}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3">
        <SourceLine source={sources} />
      </div>
    </div>
  );
}
