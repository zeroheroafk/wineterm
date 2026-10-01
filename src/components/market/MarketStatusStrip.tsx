import { InlinePercentChange } from "@/components/market/ChangeCell";
import { Container } from "@/components/layout/Container";
import { DATA_STATUS_LABELS } from "@/components/ui/DataStatusLabel";
import { formatDate, formatPrice } from "@/lib/format";
import { COUNTRY_NAMES, type StripQuote } from "@/services/types";

/**
 * Compact market price strip under the global header: a static row of
 * representative quotes, market name above price, unit and weekly move,
 * the move signed and coloured. No animation. Values are shown exactly as
 * the service supplies them, unconverted. Market names already carry
 * their region, so the country is given in the tooltip and to assistive
 * technology rather than as a code on every item. When every quote is
 * illustrative the strip opens with one disclosure, pinned so it stays in
 * view while the row scrolls on narrow screens; otherwise non-final
 * quotes carry their own status.
 */
export function MarketStatusStrip({ quotes }: { quotes: StripQuote[] }) {
  const allIllustrative = quotes.every(
    (quote) => quote.status === "illustrative",
  );

  return (
    <div className="border-b border-rule bg-paper">
      <Container>
        {/* A focusable region so keyboard users can scroll it on narrow
            screens; relative so visually hidden text inside stays clipped. */}
        <div
          role="region"
          aria-label="Market prices"
          tabIndex={0}
          className="relative flex items-stretch overflow-x-auto [scrollbar-width:thin]"
        >
          {allIllustrative ? (
            <p className="sticky left-0 z-10 flex shrink-0 flex-col justify-center border-r border-rule bg-paper py-2 pr-3 text-xs leading-snug">
              <span className="font-semibold text-ink">Illustrative</span>
              <span className="text-ink-soft">not live prices</span>
            </p>
          ) : null}
          <ul className="flex grow">
            {quotes.map((quote) => (
              <li
                key={quote.id}
                className="flex shrink-0 grow flex-col justify-center gap-0.5 border-l border-rule px-3 py-2 first:border-l-0"
              >
                <span
                  title={COUNTRY_NAMES[quote.country]}
                  className="whitespace-nowrap text-xs text-ink-soft"
                >
                  {quote.name}
                  <span className="sr-only">, {COUNTRY_NAMES[quote.country]}</span>
                </span>
                <span className="flex items-baseline gap-1 whitespace-nowrap text-xs">
                  <span className="tnum text-sm font-semibold text-ink">
                    {formatPrice(quote.value)}
                  </span>
                  <span className="text-ink-soft">{quote.unit}</span>
                  <span className="ml-1">
                    <InlinePercentChange value={quote.changePercent} />
                  </span>
                  {!allIllustrative && quote.status !== "final" ? (
                    <span className="text-ink-soft">
                      {DATA_STATUS_LABELS[quote.status]}
                    </span>
                  ) : null}
                </span>
                <span className="sr-only">
                  Observed {formatDate(quote.observedAt)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </div>
  );
}
