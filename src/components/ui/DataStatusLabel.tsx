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
