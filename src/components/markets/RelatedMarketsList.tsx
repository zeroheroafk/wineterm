import Link from "next/link";

import { MaybePercent } from "@/components/markets/cells";
import { PriceCell } from "@/components/market/PriceCell";
import { CountryLabel } from "@/components/ui/CountryLabel";
import type { MarketRow } from "@/services/markets/types";

/** Compact list of related series for the market detail sidebar. */
export function RelatedMarketsList({ rows }: { rows: MarketRow[] }) {
  if (rows.length === 0) return null;
  return (
    <ul className="border border-rule bg-paper">
      {rows.map((row) => (
        <li key={row.series.code} className="border-b border-rule last:border-b-0">
          <Link
            href={`/markets/series/${row.series.code}`}
            className="flex items-center justify-between gap-3 px-3 py-2.5 hover:bg-ground/70"
          >
            <span className="min-w-0">
              <span className="flex items-center gap-2">
                <CountryLabel code={row.series.country} />
                <span className="truncate text-sm font-medium text-ink">
                  {row.series.name}
                </span>
              </span>
              <span className="wt-label mt-0.5 block text-ink-soft">
                {row.series.code}
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-3">
              <PriceCell value={row.latest.value} unit={row.series.unit} />
              <MaybePercent value={row.changes.weekPercent} />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
