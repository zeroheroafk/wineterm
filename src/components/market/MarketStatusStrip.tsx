import { PercentChange } from "@/components/market/ChangeCell";
import { Container } from "@/components/layout/Container";
import { formatDate, formatPrice } from "@/lib/format";
import type { DataSource, StripQuote } from "@/services/types";

const CELL =
  "flex shrink-0 flex-col justify-center gap-0.5 border-l border-rule py-2 pl-4 pr-5 first:border-l-0 first:pl-0";

function Quote({ quote }: { quote: StripQuote }) {
  return (
    <div className={CELL}>
      <p className="wt-label whitespace-nowrap text-ink-soft">
        <span className="text-wine">{quote.country}</span>
        <span aria-hidden="true" className="mx-1.5 text-rule">
          &middot;
        </span>
        {quote.name}
      </p>
      <p className="tnum flex items-baseline gap-2 whitespace-nowrap font-mono text-sm text-ink">
        {formatPrice(quote.value)}
        <span className="text-[0.65rem] text-ink-soft">{quote.unit}</span>
        <PercentChange value={quote.changePercent} />
      </p>
      <p className="wt-label whitespace-nowrap text-ink-soft">
        {formatDate(quote.observedAt)}
      </p>
    </div>
  );
}

/**
 * Compact market status strip under the global header. A static,
 * horizontally scrollable row of representative quotes in the terminal
 * idiom: mono figures, thin dividers, no animation. Real quotes lead,
 * after a cell naming their source; illustrative ones follow a cell that
 * says so.
 */
export function MarketStatusStrip({ quotes }: { quotes: StripQuote[] }) {
  const real = quotes.filter((quote) => quote.status !== "illustrative");
  const illustrative = quotes.filter((quote) => quote.status === "illustrative");
  const sources = [
    ...new Map(
      real.flatMap((quote): [string, DataSource][] =>
        quote.source ? [[quote.source.name, quote.source]] : [],
      ),
    ).values(),
  ];

  return (
    <div className="border-b border-rule bg-paper">
      <Container>
        <div className="flex items-stretch overflow-x-auto">
          {sources.length > 0 ? (
            <div className={CELL}>
              <p className="wt-label whitespace-nowrap text-wine">Source</p>
              {sources.map((source) => (
                <p key={source.name} className="wt-label whitespace-nowrap text-ink-soft">
                  {source.url ? (
                    <a
                      href={source.url}
                      className="underline decoration-rule underline-offset-2 hover:text-wine"
                    >
                      {source.name}
                    </a>
                  ) : (
                    source.name
                  )}
                </p>
              ))}
            </div>
          ) : null}
          {real.map((quote) => (
            <Quote key={quote.id} quote={quote} />
          ))}
          {illustrative.length > 0 ? (
            <div className={CELL}>
              <p className="wt-label whitespace-nowrap text-ochre">Illustrative</p>
              <p className="wt-label whitespace-nowrap text-ink-soft">
                development data,
                <br />
                not live quotes
              </p>
            </div>
          ) : null}
          {illustrative.map((quote) => (
            <Quote key={quote.id} quote={quote} />
          ))}
        </div>
      </Container>
    </div>
  );
}
