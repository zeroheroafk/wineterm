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

/**
 * Negative sign for figures: the minus sign (U+2212) is as wide as the
 * plus sign in tabular figures, so signed columns line up; the hyphen is
 * narrower.
 */
const MINUS = "−";

/** Signed percentage, e.g. "+2.4%" / "−1.8%" / "0.0%". */
export function formatPercent(value: number, decimals = 1): string {
  const formatted = new Intl.NumberFormat(EN_GB, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(Math.abs(value));
  if (value > 0) return `+${formatted}%`;
  if (value < 0) return `${MINUS}${formatted}%`;
  return `${formatted}%`;
}

/** Signed absolute change in the series unit, e.g. "+0.15" / "−0.05". */
export function formatChange(value: number, decimals = 2): string {
  const formatted = formatPrice(Math.abs(value), decimals);
  if (value > 0) return `+${formatted}`;
  if (value < 0) return `${MINUS}${formatted}`;
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

/**
 * Compact date range, e.g. "19–20 Aug 2026", "31 Jul – 2 Aug 2026", or a
 * single date when both ends fall on the same day.
 */
export function formatDateRange(startIso: string, endIso: string): string {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const part = (date: Date, options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(EN_GB, { ...options, timeZone: "UTC" }).format(
      date,
    );
  const sameYear = start.getUTCFullYear() === end.getUTCFullYear();
  const sameMonth = sameYear && start.getUTCMonth() === end.getUTCMonth();

  if (sameMonth && start.getUTCDate() === end.getUTCDate()) {
    return formatDate(endIso);
  }
  if (sameMonth) {
    return `${start.getUTCDate()}–${formatDate(endIso)}`;
  }
  if (sameYear) {
    return `${part(start, { day: "numeric", month: "short" })} – ${formatDate(endIso)}`;
  }
  return `${formatDate(startIso)} – ${formatDate(endIso)}`;
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

/** Month and year for period labels, e.g. "Jun 2026" from "2026-06". */
export function formatMonthYear(isoMonth: string): string {
  const [year, month] = isoMonth.split("-").map(Number);
  return new Intl.DateTimeFormat(EN_GB, {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, 1)));
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
