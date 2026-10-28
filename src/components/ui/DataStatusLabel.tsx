import type { DataStatus } from "@/services/types";

const STATUS_STYLES: Record<DataStatus, { label: string; className: string }> = {
  final: { label: "Final", className: "border-rule text-ink-soft" },
  provisional: { label: "Provisional", className: "border-ochre text-ochre-deep" },
  estimate: { label: "Estimate", className: "border-ochre text-ochre-deep" },
  forecast: { label: "Forecast", className: "border-wine text-wine" },
};

/** Plain status names, for editorial layouts that state status in text. */
export const DATA_STATUS_LABELS = Object.fromEntries(
  Object.entries(STATUS_STYLES).map(([status, style]) => [status, style.label]),
) as Record<DataStatus, string>;

/**
 * One-sentence disclosure for a block whose figures share a status, or
 * null when they are final and need none.
 */
export function sharedStatusNote(status: DataStatus): string | null {
  if (status === "final") return null;
  return `${DATA_STATUS_LABELS[status]} figures.`;
}

/** Small bordered tag naming the lifecycle status of a figure or series. */
export function DataStatusLabel({ status }: { status: DataStatus }) {
  const style = STATUS_STYLES[status];
  return (
    <span
      className={`wt-label inline-flex items-center border px-1.5 py-0.5 ${style.className}`}
    >
      {style.label}
    </span>
  );
}
