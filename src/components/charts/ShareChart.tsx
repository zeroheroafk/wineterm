import { Fragment } from "react";

import { DataNote } from "@/components/ui/SourceLine";
import { formatShare } from "@/lib/format";
import type { ArticleChart } from "@/services/types";

/**
 * One part's share of several wholes, on one 0 to 100% scale: a bar per
 * whole, the part in burgundy and the rest of the whole in a lighter
 * step of it, split by a 2px gap in the surface colour. Each share is
 * printed beside its bar, and a key names the two segments. The bars are
 * hidden from assistive technology, which reads the same figures from a
 * table.
 */
export function ShareChart({
  chart,
  titleId,
  className = "",
}: {
  chart: ArticleChart;
  titleId: string;
  className?: string;
}) {
  return (
    <figure aria-labelledby={titleId} className={className}>
      <p
        id={titleId}
        className="text-[0.9375rem] leading-snug font-semibold text-ink"
      >
        {chart.title}
      </p>
      <p className="mt-0.5 text-[0.8125rem] leading-snug text-ink-soft">
        {chart.description}
      </p>

      <div aria-hidden="true" className="mt-3">
        <p className="flex flex-wrap gap-x-4 gap-y-1 text-[0.8125rem] text-ink-soft">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 bg-wine" />
            {chart.part}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 bg-wine/45" />
            {chart.rest}
          </span>
        </p>
        <div className="mt-2.5 grid grid-cols-[3.75rem_minmax(0,1fr)_2.75rem] items-center gap-x-3 gap-y-2.5">
          {chart.bars.map((bar) => (
            <Fragment key={bar.label}>
              <span className="text-[0.8125rem] leading-snug text-ink">
                {bar.label}
              </span>
              <span className="relative h-3.5">
                <span
                  className="absolute inset-y-0 left-0 bg-wine"
                  style={{ width: `${bar.percent}%` }}
                />
                <span
                  className="absolute inset-y-0 right-0 bg-wine/45"
                  style={{ left: `calc(${bar.percent}% + 2px)` }}
                />
              </span>
              <span className="tnum text-right text-[0.8125rem] font-medium text-ink">
                {formatShare(bar.percent)}
              </span>
            </Fragment>
          ))}
        </div>
      </div>

      {/* A table ignores the 1px box of sr-only, so a block wraps it. */}
      <div className="sr-only">
        <table>
          <caption>
            {chart.title}: {chart.description}
          </caption>
          <thead>
            <tr>
              <th scope="col">Share of</th>
              <th scope="col">{chart.part}</th>
              <th scope="col">{chart.rest}</th>
            </tr>
          </thead>
          <tbody>
            {chart.bars.map((bar) => (
              <tr key={bar.label}>
                <th scope="row">{bar.label}</th>
                <td>{formatShare(bar.percent)}</td>
                <td>{formatShare(100 - bar.percent)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <figcaption className="mt-2.5">
        <DataNote source={chart.source} />
      </figcaption>
    </figure>
  );
}
