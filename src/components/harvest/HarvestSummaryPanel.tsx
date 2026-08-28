import { TrendIndicator } from "@/components/market/TrendIndicator";
import { DataStatusLabel } from "@/components/ui/DataStatusLabel";
import { UpdatedAt } from "@/components/ui/SourceLine";
import type { HarvestSummary } from "@/services/harvest/types";

const DIRECTION_VALUE = { up: 1, down: -1, flat: 0 } as const;

/** Executive summary of the harvest: interpretation first, then key points. */
export function HarvestSummaryPanel({ summary }: { summary: HarvestSummary }) {
  return (
    <article className="border border-rule border-t-2 border-t-wine bg-paper">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-rule px-5 py-2.5">
        <h2 className="wt-label text-wine">Executive summary</h2>
        <span className="flex items-center gap-3">
          <DataStatusLabel status="estimate" />
          <UpdatedAt iso={summary.updatedAt} />
        </span>
      </div>
      <div className="grid grid-cols-1 gap-6 px-5 py-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="space-y-3">
          {summary.paragraphs.map((paragraph, index) => (
            <p
              key={index}
              className={
                index === 0
                  ? "wt-headline text-lg leading-relaxed text-ink"
                  : "text-sm leading-relaxed text-ink-soft"
              }
            >
              {paragraph}
            </p>
          ))}
        </div>
        <ul className="space-y-2.5 border-t border-rule pt-4 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6">
          {summary.keyPoints.map((point) => (
            <li key={point.id} className="flex gap-2.5 text-sm leading-snug text-ink">
              <span className="mt-1 shrink-0">
                <TrendIndicator value={DIRECTION_VALUE[point.direction]} />
              </span>
              {point.text}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
