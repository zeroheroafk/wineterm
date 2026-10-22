import { InlinePercentChange } from "@/components/market/ChangeCell";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { CountryLabel } from "@/components/ui/CountryLabel";
import { ScrollRegion } from "@/components/ui/ScrollRegion";
import { DataNote } from "@/components/ui/SourceLine";
import { EmptyState } from "@/components/ui/states";
import { formatDate, formatPrice } from "@/lib/format";
import type { DataSource, PriceQuote } from "@/services/types";

const COLOUR_LABELS = { red: "Red", white: "White", rose: "Rose" } as const;

const TH =
  "px-2 py-2 align-bottom text-[0.8125rem] leading-tight font-medium text-ink-soft first:pl-0 last:pr-0 sm:px-3";
const TD = "px-2 py-2.5 first:pl-0 last:pr-0 sm:px-3";

/** Every source in the table, once each, in row order. */
function sourcesOf(quotes: PriceQuote[]): DataSource[] {
  return [
    ...new Map(quotes.map((quote) => [quote.source.name, quote.source])).values(),
  ];
}

/**
 * The key bulk wine prices of the homepage. Market names and prices
 * lead, each after its country's flag; a unit shared by every row moves
 * into the column heading. Columns that yield on narrow screens reappear
 * as a line under the market name, so no figure is lost. Changes are signed and coloured
 * like every other movement on the page, without glyphs. A change is on
 * the previous price: a week earlier for weekly series, a month earlier
 * for monthly ones. How each price is established is on the methodology
 * page, which the note links.
 */
export function KeyPricesTable({
  quotes,
  updatedAt,
  methodologyHref,
}: {
  quotes: PriceQuote[];
  updatedAt?: string;
  /** Where the note links to explain the sourcing. */
  methodologyHref?: string;
}) {
  const first = quotes[0];
  if (!first) {
    return (
      <EmptyState
        title="No prices to show"
        detail="Prices are read from the database, which this build is not connected to."
      />
    );
  }
  const sharedUnit = quotes.every((quote) => quote.unit === first.unit)
    ? first.unit
    : undefined;
  // The wine column shows when any price is for one colour; estimates
  // that span every colour read "All" in it.
  const showWineColumn = quotes.some((quote) => quote.colour);

  return (
    <figure>
      <ScrollRegion>
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">
            Key bulk wine prices{sharedUnit ? ` in ${sharedUnit}` : ""}, with
            the change on the previous price and on a year earlier
          </caption>
          <thead>
            <tr className="border-b border-ink/30">
              <th scope="col" className={TH}>
                Market
              </th>
              {showWineColumn ? (
                <th scope="col" className={`${TH} hidden md:table-cell`}>
                  Wine
                </th>
              ) : null}
              <th scope="col" className={`${TH} text-right`}>
                Price
                {sharedUnit ? (
                  <span className="block font-normal sm:inline">
                    <span className="hidden sm:inline">, </span>
                    {sharedUnit}
                  </span>
                ) : null}
              </th>
              <th scope="col" className={`${TH} text-right`}>
                Change
              </th>
              <th scope="col" className={`${TH} pr-0 text-right sm:pr-0 lg:pr-3`}>
                <span className="sm:hidden">Year</span>
                <span className="hidden sm:inline">Year on year</span>
              </th>
              <th scope="col" className={`${TH} hidden text-right lg:table-cell`}>
                Observed
              </th>
            </tr>
          </thead>
          <tbody>
            {quotes.map((quote) => {
              const colour = quote.colour ? COLOUR_LABELS[quote.colour] : null;
              return (
                <tr key={quote.id} className="border-b border-rule">
                  <th scope="row" className={`${TD} font-normal`}>
                    <span className="flex items-baseline gap-2">
                      <CountryLabel code={quote.country} variant="plain" />
                      <span className="min-w-0">
                        <span className="block text-[0.9375rem] leading-snug font-semibold text-ink">
                          {quote.market}
                        </span>
                        <span className="block text-xs leading-snug text-ink-soft lg:hidden">
                          {colour ? (
                            <span className="md:hidden">{colour} &middot; </span>
                          ) : null}
                          <time
                            dateTime={quote.observedAt}
                            className="whitespace-nowrap"
                          >
                            {formatDate(quote.observedAt)}
                          </time>
                        </span>
                      </span>
                    </span>
                  </th>
                  {showWineColumn ? (
                    <td className={`${TD} hidden text-sm text-ink-soft md:table-cell`}>
                      {colour ?? "All"}
                    </td>
                  ) : null}
                  <td className={`${TD} text-right whitespace-nowrap`}>
                    <span className="tnum text-[0.9375rem] font-semibold text-ink">
                      {formatPrice(quote.price)}
                    </span>
                    {sharedUnit ? null : (
                      <span className="ml-1 text-xs text-ink-soft">
                        {quote.unit}
                      </span>
                    )}
                  </td>
                  <td className={`${TD} text-right text-sm`}>
                    <InlinePercentChange value={quote.changePercent} />
                  </td>
                  <td className={`${TD} pr-0 text-right text-sm sm:pr-0 lg:pr-3`}>
                    {typeof quote.yoyPercent === "number" ? (
                      <InlinePercentChange value={quote.yoyPercent} />
                    ) : (
                      <span className="text-ink-soft">n/a</span>
                    )}
                  </td>
                  <td
                    className={`${TD} tnum hidden text-right text-sm whitespace-nowrap text-ink-soft lg:table-cell`}
                  >
                    <time dateTime={quote.observedAt}>
                      {formatDate(quote.observedAt)}
                    </time>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </ScrollRegion>
      <figcaption className="mt-3">
        <DataNote
          source={sourcesOf(quotes)}
          updatedAt={updatedAt}
          action={
            methodologyHref ? (
              <ArrowLink
                href={methodologyHref}
                className="text-[0.8125rem] whitespace-nowrap"
              >
                How we source our data
              </ArrowLink>
            ) : null
          }
        />
      </figcaption>
    </figure>
  );
}
