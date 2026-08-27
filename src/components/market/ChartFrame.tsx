import type { ReactNode } from "react";

import { DataStatusLabel } from "@/components/ui/DataStatusLabel";
import { SourceLine } from "@/components/ui/SourceLine";
import type { DataSource, DataStatus } from "@/services/types";

/**
 * Standard frame around every chart: title row with series code and unit,
 * the plot area, and the source and status line underneath. Charts
 * themselves are interchangeable children.
 */
export function ChartFrame({
  title,
  code,
  unit,
  status,
  source,
  updatedAt,
  children,
}: {
  title: string;
  code?: string;
  unit?: string;
  status?: DataStatus;
  source?: DataSource;
  updatedAt?: string;
  children: ReactNode;
}) {
  return (
    <figure className="border border-rule bg-paper">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-rule px-4 py-3">
        <div className="flex items-baseline gap-3">
          <h3 className="text-sm font-semibold text-ink">{title}</h3>
          {status ? <DataStatusLabel status={status} /> : null}
        </div>
        <p className="wt-label text-ink-soft">
          {code ? <span className="text-wine">{code}</span> : null}
          {code && unit ? (
            <span aria-hidden="true" className="mx-2 text-rule">
              &middot;
            </span>
          ) : null}
          {unit}
        </p>
      </div>
      <div className="px-2 py-3">{children}</div>
      {source ? (
        <figcaption className="border-t border-rule px-4 py-2.5">
          <SourceLine source={source} updatedAt={updatedAt} />
        </figcaption>
      ) : null}
    </figure>
  );
}
