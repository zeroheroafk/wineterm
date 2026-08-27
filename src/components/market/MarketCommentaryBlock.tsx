import { formatDateTime } from "@/lib/format";
import type { MarketCommentary } from "@/services/types";

/**
 * Short dated note from the market desk, set apart from data panels by a
 * burgundy left rule and the editorial serif.
 */
export function MarketCommentaryBlock({
  commentary,
}: {
  commentary: MarketCommentary;
}) {
  return (
    <aside className="border-l-2 border-wine bg-wine-wash/30 py-4 pl-5 pr-4">
      <p className="wt-label text-wine">Desk commentary</p>
      <p className="wt-headline mt-2 text-lg leading-relaxed text-ink">
        {commentary.body}
      </p>
      <footer className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="text-xs font-medium text-ink">
          {commentary.author}
        </span>
        <span aria-hidden="true" className="text-rule">
          &middot;
        </span>
        <time
          dateTime={commentary.publishedAt}
          className="wt-label text-ink-soft"
        >
          {formatDateTime(commentary.publishedAt)}
        </time>
      </footer>
    </aside>
  );
}
