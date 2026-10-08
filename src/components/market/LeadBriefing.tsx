import { ArrowLink } from "@/components/ui/ArrowLink";
import { DATA_STATUS_LABELS } from "@/components/ui/DataStatusLabel";
import { formatDate } from "@/lib/format";
import type { MarketBriefing } from "@/services/types";

/**
 * The latest Weekly Briefing beside the homepage introduction: a small
 * label, one headline, a short summary and at most one further
 * development, closed by the date, any data status and a link to the full
 * edition. One flat surface under a burgundy rule, no internal
 * compartments.
 */
export function LeadBriefing({ briefing }: { briefing: MarketBriefing }) {
  return (
    <article
      aria-labelledby="market-briefing-headline"
      className="border-t-2 border-wine bg-paper px-5 pt-4 pb-5 sm:px-6"
    >
      <p className="wt-kicker text-wine">Weekly briefing</p>

      <h2
        id="market-briefing-headline"
        className="wt-headline mt-2 max-w-[34rem] text-[1.5rem] leading-[1.2] font-semibold text-balance text-ink"
      >
        {briefing.headline}
      </h2>
      <p className="mt-2.5 max-w-[36rem] text-base leading-[1.55] text-pretty text-ink-soft">
        {briefing.summary}
      </p>

      {briefing.development ? (
        <div className="mt-3.5 border-t border-rule pt-3">
          <p className="max-w-[36rem] text-[0.9375rem] leading-normal text-pretty text-ink">
            {briefing.development}
          </p>
        </div>
      ) : null}

      <footer className="mt-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
        <p className="text-[0.8125rem] text-ink-soft">
          <time dateTime={briefing.updatedAt}>
            {formatDate(briefing.updatedAt)}
          </time>
          {briefing.status !== "final" ? (
            <>
              <span aria-hidden="true" className="mx-1.5">
                &middot;
              </span>
              {briefing.status === "illustrative"
                ? "Illustrative sample"
                : DATA_STATUS_LABELS[briefing.status]}
            </>
          ) : null}
        </p>
        <ArrowLink href={briefing.href}>Read the briefing</ArrowLink>
      </footer>
    </article>
  );
}
