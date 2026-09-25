import { DataStatusLabel } from "@/components/ui/DataStatusLabel";
import { formatPrice } from "@/lib/format";
import type { SupplyBalanceComputed } from "@/services/supply/types";

const round1 = (v: number) => Math.round(v * 10) / 10;

const TH = "wt-label px-3 py-2 text-right font-normal text-ink-soft";
const TD = "tnum px-3 py-2 text-right font-mono text-sm whitespace-nowrap";

interface BalanceLine {
  label: string;
  value: (row: SupplyBalanceComputed) => number | null;
  /** Subtotal lines get heavier rules and weight. */
  emphasis?: boolean;
  /** Marker for derived or caveated lines. */
  marker?: string;
  decimals?: number;
}

const LINES: BalanceLine[] = [
  { label: "Opening stocks", value: (r) => r.openingStocksMhl },
  { label: "Production", value: (r) => r.productionMhl },
  { label: "Imports", value: (r) => r.importsMhl },
  {
    label: "Total availability",
    value: (r) => r.availabilityMhl,
    emphasis: true,
  },
  { label: "Domestic use", value: (r) => r.domesticUseMhl, marker: "a" },
  { label: "Exports", value: (r) => r.exportsMhl },
  {
    label: "Estimated closing stocks",
    value: (r) => r.closingStocksMhl,
    emphasis: true,
    marker: "b",
  },
  {
    label: "Residual vs declared opening",
    value: (r) => r.residualMhl,
    marker: "b",
  },
];

const MEMO_LINES: BalanceLine[] = [
  { label: "Vineyard area (kha)", value: (r) => r.vineyardKha, decimals: 0 },
  { label: "Yield (hl/ha)", value: (r) => r.yieldHlHa },
];

/**
 * The supply balance sheet: countries as columns, balance items as
 * rows, with an EU4 aggregate. All volume lines in Mhl. The balance
 * identity is indicative; residuals against declared stocks are shown,
 * not smoothed away.
 */
export function BalanceTable({
  rows,
  campaign,
}: {
  rows: SupplyBalanceComputed[];
  campaign: string;
}) {
  const total = (pick: (r: SupplyBalanceComputed) => number | null) => {
    const values = rows.map(pick);
    if (values.some((v) => v === null)) return null;
    return round1((values as number[]).reduce((sum, v) => sum + v, 0));
  };

  const eu4Yield = round1(
    (rows.reduce((s, r) => s + r.productionMhl, 0) * 1000) /
      rows.reduce((s, r) => s + r.vineyardKha, 0),
  );

  const renderLine = (line: BalanceLine, isMemo = false) => (
    <tr
      key={line.label}
      className={
        line.emphasis
          ? "border-y border-ink bg-ground/60"
          : "border-b border-rule last:border-b-0"
      }
    >
      <th
        scope="row"
        className={`px-3 py-2 text-left text-sm whitespace-nowrap ${
          line.emphasis ? "font-semibold text-ink" : "font-normal text-ink"
        }`}
      >
        {line.label}
        {line.marker ? (
          <sup className="ml-1 text-[0.6rem] text-ochre">{line.marker}</sup>
        ) : null}
      </th>
      {rows.map((row) => {
        const value = line.value(row);
        return (
          <td
            key={row.country}
            className={`${TD} ${line.emphasis ? "font-medium text-ink" : "text-ink"}`}
          >
            {value === null ? (
              <span className="wt-label text-ink-soft">n/a</span>
            ) : (
              formatPrice(value, line.decimals ?? 1)
            )}
          </td>
        );
      })}
      <td className={`${TD} ${line.emphasis ? "font-medium" : ""} text-ink-soft`}>
        {isMemo && line.label.startsWith("Yield")
          ? formatPrice(eu4Yield, 1)
          : (() => {
              const t = total(line.value);
              return t === null ? (
                <span className="wt-label">n/a</span>
              ) : (
                formatPrice(t, line.decimals ?? 1)
              );
            })()}
      </td>
    </tr>
  );

  return (
    <figure>
      <div className="overflow-x-auto border border-rule bg-paper">
        <table className="w-full border-collapse">
          <caption className="sr-only">
            Supply balance for the {campaign} campaign by country, million
            hectolitres
          </caption>
          <thead>
            <tr className="border-b-2 border-ink">
              <th scope="col" className="wt-label px-3 py-2 text-left font-normal text-ink-soft">
                {campaign} (Mhl)
              </th>
              {rows.map((row) => (
                <th key={row.country} scope="col" className={TH}>
                  <span className="text-ink">{row.country}</span>
                  <span className="mt-1 block">
                    <DataStatusLabel status={row.status} />
                  </span>
                </th>
              ))}
              <th scope="col" className={TH}>
                EU4
              </th>
            </tr>
          </thead>
          <tbody>
            {LINES.filter(
              (line) =>
                !line.label.startsWith("Residual") ||
                rows.some((row) => row.residualMhl !== null),
            ).map((line) => renderLine(line))}
          </tbody>
          <tbody className="border-t-2 border-ink">
            {MEMO_LINES.map((line) => renderLine(line, true))}
          </tbody>
        </table>
      </div>
      <figcaption className="wt-label mt-2 max-w-3xl leading-relaxed text-ink-soft">
        <sup className="text-ochre">a</sup> Domestic use includes industrial
        uses, distillation and losses.{" "}
        <sup className="text-ochre">b</sup> Closing stocks are derived from
        the balance identity, which is indicative only: source definitions,
        reference dates and revisions differ, so the residual against the
        next campaign&apos;s declared opening stocks is shown rather than
        forced to zero.
      </figcaption>
    </figure>
  );
}
