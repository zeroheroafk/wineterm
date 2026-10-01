import { ArrowLink } from "@/components/ui/ArrowLink";
import { DATA_STATUS_LABELS } from "@/components/ui/DataStatusLabel";
import { formatDate } from "@/lib/format";
import type { MarketBriefing } from "@/services/types";

/** Supporting developments shown on the homepage; the outlook has all. */
const MAX_DEVELOPMENTS = 2;

/**
 * The editorial market briefing beside the homepage introduction: the
 * desk's status phrase, one headline, a short summary and at most two
 * supporting developments, closed by the update date and a link to the
 * full Market Outlook. One flat surface, no internal compartments.
 */
export function LeadBriefing({ briefing }: { briefing: MarketBriefing }) {
  const developments = briefing.observations.slice(0, MAX_DEVELOPMENTS);

  return (
    <article
      aria-labelledby="market-briefing-headline"
      className="border-t-2 border-wine bg-paper px-5 pt-4 pb-5 sm:px-6"
    >
      <p className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <span className="wt-kicker text-wine">Market briefing</span>
        <span aria-hidden="true" className="text-ink-soft">
          &middot;
        </span>
        <span className="text-sm text-ink-soft">{briefing.statusLabel}</span>
      </p>

      <h2
        id="market-briefing-headline"
        className="wt-headline mt-2 text-[1.5rem] leading-[1.2] font-semibold text-balance text-ink"
      >
        {briefing.headline}
      </h2>
      <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-pretty text-ink-soft">
        {briefing.summary}
      </p>

      {developments.length > 0 ? (
        <ul className="mt-4 space-y-2 border-t border-rule pt-3.5">
          {developments.map((development) => (
            <li
              key={development.id}
              className="relative pl-3.5 text-sm leading-snug text-ink"
            >
              <span
                aria-hidden="true"
                className="absolute top-[0.45em] left-0 h-1.5 w-1.5 bg-wine/70"
              />
              {development.text}
            </li>
          ))}
        </ul>
      ) : null}

      <footer className="mt-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
        <p className="text-[0.8125rem] text-ink-soft">
          <time dateTime={briefing.updatedAt}>
            Updated {formatDate(briefing.updatedAt)}
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
        <ArrowLink href={briefing.outlookHref}>Read the market outlook</ArrowLink>
      </footer>
    </article>
  );
}
