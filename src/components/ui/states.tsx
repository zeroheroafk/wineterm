import type { ReactNode } from "react";

/**
 * Empty, loading and error states share one restrained bordered frame so
 * data panels degrade consistently across the platform.
 */

function StateFrame({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "error";
}) {
  return (
    <div
      className={`flex min-h-40 flex-col items-center justify-center gap-2 border px-6 py-10 text-center ${
        tone === "error"
          ? "border-down/40 bg-down/5"
          : "border-dashed border-rule bg-paper"
      }`}
    >
      {children}
    </div>
  );
}

export function EmptyState({
  title = "No data for this selection",
  detail = "Adjust the filters or widen the date range.",
  action,
}: {
  title?: string;
  detail?: string;
  action?: ReactNode;
}) {
  return (
    <StateFrame>
      <p className="wt-label text-ink-soft">No results</p>
      <p className="text-sm font-medium text-ink">{title}</p>
      <p className="max-w-sm text-sm text-ink-soft">{detail}</p>
      {action ? <div className="mt-2">{action}</div> : null}
    </StateFrame>
  );
}

export function LoadingState({
  label = "Loading market data",
}: {
  label?: string;
}) {
  return (
    <StateFrame>
      <span
        aria-hidden="true"
        className="h-4 w-4 animate-spin border-2 border-rule border-t-wine"
      />
      <p role="status" className="wt-label text-ink-soft">
        {label}
      </p>
    </StateFrame>
  );
}

export function ErrorState({
  title = "This data could not be loaded",
  detail = "The request failed. Try again shortly; if the problem persists, contact WineTerm.",
  action,
}: {
  title?: string;
  detail?: string;
  action?: ReactNode;
}) {
  return (
    <StateFrame tone="error">
      <p className="wt-label text-down">Error</p>
      <p className="text-sm font-medium text-ink">{title}</p>
      <p className="max-w-sm text-sm text-ink-soft">{detail}</p>
      {action ? <div className="mt-2">{action}</div> : null}
    </StateFrame>
  );
}

/** Shimmerless skeleton row block for table placeholders. */
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div aria-hidden="true" className="border border-rule bg-paper">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 border-b border-rule px-3 py-3 last:border-b-0"
        >
          <span className="h-3 w-24 bg-ground" />
          <span className="h-3 grow bg-ground" />
          <span className="h-3 w-16 bg-ground" />
          <span className="h-3 w-12 bg-ground" />
        </div>
      ))}
    </div>
  );
}
