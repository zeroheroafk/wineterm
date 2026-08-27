import { formatPrice } from "@/lib/format";
import type { PriceUnit } from "@/services/types";

/** Monospace, tabular-numeral price with its unit. */
export function PriceCell({
  value,
  unit,
  decimals = 2,
}: {
  value: number;
  unit?: PriceUnit;
  decimals?: number;
}) {
  return (
    <span className="tnum inline-flex items-baseline gap-1.5 font-mono text-sm text-ink">
      {formatPrice(value, decimals)}
      {unit ? <span className="text-[0.65rem] text-ink-soft">{unit}</span> : null}
    </span>
  );
}
