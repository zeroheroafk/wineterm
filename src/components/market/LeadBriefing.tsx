import Link from "next/link";

import { TrendIndicator } from "@/components/market/TrendIndicator";
import { DataStatusLabel } from "@/components/ui/DataStatusLabel";
import { UpdatedAt } from "@/components/ui/SourceLine";
import type { MarketBriefing } from "@/services/types";

const DIRECTION_VALUE = { up: 1, down: -1, flat: 0 } as const;

/**
 * The editorial market briefing that leads the homepage: status phrase,
 * one headline, a short summary and the key observations of the week,
 * closed by the update time and a link to the full Market Outlook.
 */
export function LeadBriefing({ briefing }: { briefing: MarketBriefing }) {
  return (
    <article className="border border-rule border-t-2 border-t-wine bg-paper">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-rule px-5 py-2.5">
        <p className="wt-label flex items-center gap-2 text-wine">
          <span aria-hidden="true" className="h-2 w-2 bg-wine" />
          Market status: {briefing.statusLabel}
        </p>
        <DataStatusLabel status={briefing.status} />
      </div>

      <div className="px-5 py-4">
        <h2 className="wt-headline text-2xl font-semibold leading-snug text-ink">
          {briefing.headline}
        </h2>
        <p className="mt-2.5 text-sm leading-relaxed text-ink-soft">
          {briefing.summary}
        </p>

        <ul className="mt-4 space-y-2.5 border-t border-rule pt-4">
          {briefing.observations.map((observation) => (
            <li key={observation.id} className="flex gap-2.5 text-sm leading-snug text-ink">
              <span className="mt-1 shrink-0">
                <TrendIndicator value={DIRECTION_VALUE[observation.direction]} />
              </span>
              {observation.text}
            </li>
          ))}
        </ul>
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-rule px-5 py-2.5">
        <UpdatedAt iso={briefing.updatedAt} />
        <Link
          href={briefing.outlookHref}
          className="wt-label text-wine transition-colors hover:text-wine-deep"
        >
          Full Market Outlook &rarr;
        </Link>
      </footer>
    </article>
  );
}
