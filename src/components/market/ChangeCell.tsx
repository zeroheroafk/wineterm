import { formatChange, formatPercent, movementDirection } from "@/lib/format";
import { TrendIndicator } from "@/components/market/TrendIndicator";

const DIRECTION_TEXT = {
  up: "text-up",
  down: "text-down",
  flat: "text-ink-soft",
} as const;

/** Percentage movement with trend glyph, in the movement colours. */
export function PercentChange({
  value,
  withIndicator = true,
}: {
  value: number;
  withIndicator?: boolean;
}) {
  const direction = movementDirection(value);
  return (
    <span
      className={`tnum inline-flex items-center gap-1.5 font-mono text-sm ${DIRECTION_TEXT[direction]}`}
    >
      {withIndicator ? <TrendIndicator value={value} /> : null}
      {formatPercent(value)}
    </span>
  );
}

/** Absolute movement in the series unit, in the movement colours. */
export function AbsoluteChange({
  value,
  decimals = 2,
}: {
  value: number;
  decimals?: number;
}) {
  const direction = movementDirection(value);
  return (
    <span className={`tnum font-mono text-sm ${DIRECTION_TEXT[direction]}`}>
      {formatChange(value, decimals)}
    </span>
  );
}
