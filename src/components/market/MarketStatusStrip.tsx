import { InlinePercentChange } from "@/components/market/ChangeCell";
import { Container } from "@/components/layout/Container";
import { DATA_STATUS_LABELS } from "@/components/ui/DataStatusLabel";
import { formatDate, formatPrice } from "@/lib/format";
import {
  countryName,
  type DataSource,
  type StripQuote,
} from "@/services/types";

const LABEL_CELL =
  "flex shrink-0 flex-col justify-center border-rule bg-paper py-2 text-xs leading-snug";

function QuoteItem({ quote }: { quote: StripQuote }) {
  const country = countryName(quote.country);
  return (
    <li className="flex shrink-0 grow flex-col justify-center gap-0.5 border-l border-rule px-3 py-2 first:border-l-0">
      <span title={country} className="whitespace-nowrap text-xs text-ink-soft">
        {quote.name}
        <span className="sr-only">, {country}</span>
      </span>
      <span className="flex items-baseline gap-1 whitespace-nowrap text-xs">
        <span className="tnum text-sm font-semibold text-ink">
          {formatPrice(quote.value)}
        </span>
        <span className="text-ink-soft">{quote.unit}</span>
        <span className="ml-1">
          <InlinePercentChange value={quote.changePercent} />
        </span>
        {quote.status !== "final" && quote.status !== "illustrative" ? (
          <span className="text-ink-soft">
            {DATA_STATUS_LABELS[quote.status]}
          </span>
        ) : null}
      </span>
      <span className="sr-only">Observed {formatDate(quote.observedAt)}</span>
    </li>
  );
}

function SourceName({ source }: { source: DataSource }) {
  return source.url ? (
    <a
      href={source.url}
      className="underline decoration-rule underline-offset-2 hover:text-wine"
    >
      {source.name}
    </a>
  ) : (
    <>{source.name}</>
  );
}

/**
 * Compact market price strip under the global header: a static row of
 * representative quotes, market name above price, unit and weekly move,
 * the move signed and coloured. No animation. Values are shown exactly as
 * the service supplies them, unconverted. Market names already carry
 * their region, so the country is given in the tooltip and to assistive
 * technology rather than as a code on every item.
 *
 * Real quotes lead, after a cell naming their source; illustrative ones
 * follow a cell that says what they are. When every quote is
 * illustrative, that cell opens the strip and stays pinned while the row
 * scrolls on narrow screens.
 */
export function MarketStatusStrip({ quotes }: { quotes: StripQuote[] }) {
  const real = quotes.filter((quote) => quote.status !== "illustrative");
  const illustrative = quotes.filter(
    (quote) => quote.status === "illustrative",
  );
  const sources = [
    ...new Map(
      real.flatMap((quote): [string, DataSource][] =>
        quote.source ? [[quote.source.name, quote.source]] : [],
      ),
    ).values(),
  ];
  const onlyIllustrative = real.length === 0;

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
          {real.length > 0 ? (
            <>
              <p className={`${LABEL_CELL} border-r pr-3`}>
                <span className="font-semibold text-ink">Official prices</span>
                {sources.map((source) => (
                  <span key={source.name} className="whitespace-nowrap text-ink-soft">
                    <SourceName source={source} />
                  </span>
                ))}
              </p>
              <ul aria-label="Official prices" className="flex">
                {real.map((quote) => (
                  <QuoteItem key={quote.id} quote={quote} />
                ))}
              </ul>
            </>
          ) : null}
          {illustrative.length > 0 ? (
            <>
              <p
                className={`${LABEL_CELL} border-r pr-3 ${
                  onlyIllustrative ? "sticky left-0 z-10" : "border-l pl-3"
                }`}
              >
                <span className="font-semibold text-ink">Illustrative</span>
                <span className="text-ink-soft">not live prices</span>
              </p>
              <ul aria-label="Illustrative prices" className="flex grow">
                {illustrative.map((quote) => (
                  <QuoteItem key={quote.id} quote={quote} />
                ))}
              </ul>
            </>
          ) : null}
        </div>
      </Container>
    </div>
  );
}
