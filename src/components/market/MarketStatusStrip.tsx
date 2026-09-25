import { PercentChange } from "@/components/market/ChangeCell";
import { Container } from "@/components/layout/Container";
import { formatDate, formatPrice } from "@/lib/format";
import type { StripQuote } from "@/services/types";

/**
 * Compact market status strip under the global header. A static,
 * horizontally scrollable row of representative quotes in the terminal
 * idiom: mono figures, thin dividers, no animation.
 */
export function MarketStatusStrip({ quotes }: { quotes: StripQuote[] }) {
  return (
    <div className="border-b border-rule bg-paper">
      <Container>
        <div className="flex items-stretch overflow-x-auto">
          {quotes.map((quote) => (
            <div
              key={quote.id}
              className="flex shrink-0 flex-col justify-center gap-0.5 border-l border-rule py-2 pl-4 pr-5 first:border-l-0 first:pl-0"
            >
              <p className="wt-label whitespace-nowrap text-ink-soft">
                <span className="text-wine">{quote.country}</span>
                <span aria-hidden="true" className="mx-1.5 text-rule">
                  &middot;
                </span>
                {quote.name}
              </p>
              <p className="tnum flex items-baseline gap-2 whitespace-nowrap font-mono text-sm text-ink">
                {formatPrice(quote.value)}
                <span className="text-[0.65rem] text-ink-soft">
                  {quote.unit}
                </span>
                <PercentChange value={quote.changePercent} />
              </p>
              <p className="wt-label whitespace-nowrap text-ink-soft">
                {formatDate(quote.observedAt)}
              </p>
            </div>
          ))}
          <div className="flex shrink-0 flex-col justify-center border-l border-rule py-2 pl-4">
            <p className="wt-label whitespace-nowrap text-ochre">
              Illustrative
            </p>
            <p className="wt-label whitespace-nowrap text-ink-soft">
              development data,
              <br />
              not live quotes
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}
