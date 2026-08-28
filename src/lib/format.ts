/**
 * Formatting helpers for market data.
 *
 * All numeric output on WineTerm goes through these helpers so units,
 * decimal conventions and sign handling stay consistent everywhere.
 */

const EN_GB = "en-GB";

export function formatPrice(value: number, decimals = 2): string {
  return new Intl.NumberFormat(EN_GB, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/** Signed percentage, e.g. "+2.4%" / "-1.8%" / "0.0%". */
export function formatPercent(value: number, decimals = 1): string {
  const formatted = new Intl.NumberFormat(EN_GB, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(Math.abs(value));
  if (value > 0) return `+${formatted}%`;
  if (value < 0) return `-${formatted}%`;
  return `${formatted}%`;
}

/** Signed absolute change in the series unit, e.g. "+0.15". */
export function formatChange(value: number, decimals = 2): string {
  const formatted = formatPrice(Math.abs(value), decimals);
  if (value > 0) return `+${formatted}`;
  if (value < 0) return `-${formatted}`;
  return formatted;
}

/** Volume with thousands separators, e.g. "12,400". */
export function formatVolume(value: number): string {
  return new Intl.NumberFormat(EN_GB, { maximumFractionDigits: 0 }).format(
    value,
  );
}

/** Editorial date, e.g. "21 Aug 2026". */
export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat(EN_GB, {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}

/** Timestamp for update lines, e.g. "21 Aug 2026, 09:30 UTC". */
export function formatDateTime(iso: string): string {
  const formatted = new Intl.DateTimeFormat(EN_GB, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }).format(new Date(iso));
  return `${formatted} UTC`;
}

/** Month label for compact chart ticks, e.g. "Jun 26" from "2026-06". */
export function formatMonth(isoMonth: string): string {
  const [year, month] = isoMonth.split("-").map(Number);
  return `${new Intl.DateTimeFormat("en-GB", { month: "short", timeZone: "UTC" }).format(new Date(Date.UTC(year, month - 1, 1)))} ${String(year).slice(2)}`;
}

export type MovementDirection = "up" | "down" | "flat";

export function movementDirection(value: number): MovementDirection {
  if (value > 0) return "up";
  if (value < 0) return "down";
  return "flat";
}
