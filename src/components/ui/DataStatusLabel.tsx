import type { DataStatus } from "@/services/types";

const STATUS_STYLES: Record<DataStatus, { label: string; className: string }> = {
  final: { label: "Final", className: "border-rule text-ink-soft" },
  provisional: { label: "Provisional", className: "border-ochre text-ochre" },
  estimate: { label: "Estimate", className: "border-ochre text-ochre" },
  forecast: { label: "Forecast", className: "border-wine text-wine" },
  illustrative: {
    label: "Illustrative",
    className: "border-ochre bg-ochre/10 text-ochre",
  },
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
  if (status === "illustrative") return "Illustrative sample data.";
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
