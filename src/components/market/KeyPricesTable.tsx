import {
  InlinePercentChange,
  PercentChange,
} from "@/components/market/ChangeCell";
import { PriceCell } from "@/components/market/PriceCell";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { CountryLabel } from "@/components/ui/CountryLabel";
import {
  DATA_STATUS_LABELS,
  DataStatusLabel,
} from "@/components/ui/DataStatusLabel";
import { ScrollRegion } from "@/components/ui/ScrollRegion";
import { DataNote, SourceLine } from "@/components/ui/SourceLine";
import { formatDate, formatPrice } from "@/lib/format";
import type { DataStatus, PriceQuote } from "@/services/types";

const COLOUR_LABELS = { red: "Red", white: "White", rose: "Rose" } as const;

const HEAD_CELL = "wt-label px-3 py-2 font-normal text-ink-soft";

/** Table-level note when every row shares one non-final status. */
const SHARED_STATUS_NOTES: Record<DataStatus, string | null> = {
  final: null,
  provisional: "All prices are provisional and subject to revision.",
  estimate: "All prices are estimates.",
  forecast: "All prices are forecasts.",
  illustrative: "Illustrative sample prices, not live market data.",
};

/**
 * Key bulk wine prices with weekly and year-on-year change, denser than
 * the full MarketTable.
 *
 * "dense" (default): the ruled terminal table used in the Market Outlook.
 * Category and YoY columns yield on narrow screens so price, movement,
 * date and status stay in view.
 *
 * "editorial": the homepage table. Market names and prices lead; a unit
 * shared by every row moves into the column heading; a status shared by
 * every row becomes one table-level note instead of a badge per row.
 * Columns that yield on narrow screens reappear as a line under the
 * market name, so no figure is lost. Changes are signed and coloured
 * like every other movement on the page, without glyphs.
 */
export function KeyPricesTable({
  quotes,
  updatedAt,
  variant = "dense",
  methodologyHref,
}: {
  quotes: PriceQuote[];
  updatedAt?: string;
  variant?: "dense" | "editorial";
  /** Editorial only: where the note links to explain the sourcing. */
  methodologyHref?: string;
}) {
  if (variant === "editorial") {
    return (
      <EditorialKeyPrices
        quotes={quotes}
        updatedAt={updatedAt}
        methodologyHref={methodologyHref}
      />
    );
  }

  const tableSource = quotes[0]?.source;

  return (
    <figure>
      <ScrollRegion className="border border-rule bg-paper">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">
            Key bulk wine reference prices with weekly and year-on-year change
          </caption>
          <thead>
            <tr className="border-b-2 border-ink">
              <th scope="col" className={HEAD_CELL}>
                Market
              </th>
              <th scope="col" className={`${HEAD_CELL} hidden sm:table-cell`}>
                Cat
              </th>
              <th scope="col" className={`${HEAD_CELL} text-right`}>
                Price
              </th>
              <th scope="col" className={`${HEAD_CELL} text-right`}>
                Wk %
              </th>
              <th
                scope="col"
                className={`${HEAD_CELL} hidden text-right md:table-cell`}
              >
                YoY %
              </th>
              <th scope="col" className={HEAD_CELL}>
                Date
              </th>
              <th scope="col" className={HEAD_CELL}>
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {quotes.map((quote) => (
              <tr
                key={quote.id}
                className="border-b border-rule transition-colors last:border-b-0 hover:bg-ground/70"
              >
                <td className="px-3 py-2.5">
                  <span className="flex items-center gap-2 whitespace-nowrap">
                    <CountryLabel code={quote.country} />
                    <span className="text-sm font-medium text-ink">
                      {quote.market}
                    </span>
                  </span>
                </td>
                <td className="hidden px-3 py-2.5 text-sm text-ink-soft sm:table-cell">
                  {quote.colour ? COLOUR_LABELS[quote.colour] : "-"}
                </td>
                <td className="px-3 py-2.5 text-right whitespace-nowrap">
                  <PriceCell value={quote.price} unit={quote.unit} />
                </td>
                <td className="px-3 py-2.5 text-right whitespace-nowrap">
                  <PercentChange value={quote.changePercent} />
                </td>
                <td className="hidden px-3 py-2.5 text-right whitespace-nowrap md:table-cell">
                  {typeof quote.yoyPercent === "number" ? (
                    <PercentChange value={quote.yoyPercent} withIndicator={false} />
                  ) : (
                    <span className="wt-label text-ink-soft">n/a</span>
                  )}
                </td>
                <td className="tnum px-3 py-2.5 font-mono text-xs whitespace-nowrap text-ink-soft">
                  {formatDate(quote.observedAt)}
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <DataStatusLabel status={quote.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollRegion>
      {tableSource ? (
        <figcaption className="mt-2">
          <SourceLine source={tableSource} updatedAt={updatedAt} />
        </figcaption>
      ) : null}
    </figure>
  );
}

const TH =
  "px-2 py-2 align-bottom text-[0.8125rem] leading-tight font-medium text-ink-soft first:pl-0 last:pr-0 sm:px-3";
const TD = "px-2 py-2.5 first:pl-0 last:pr-0 sm:px-3";

function EditorialKeyPrices({
  quotes,
  updatedAt,
  methodologyHref,
}: {
  quotes: PriceQuote[];
  updatedAt?: string;
  methodologyHref?: string;
}) {
  const first = quotes[0];
  const sharedUnit = quotes.every((quote) => quote.unit === first?.unit)
    ? first?.unit
    : undefined;
  const sharedStatus = quotes.every((quote) => quote.status === first?.status)
    ? first?.status
    : undefined;
  const showStatusColumn = sharedStatus === undefined;
  const statusNote = sharedStatus ? SHARED_STATUS_NOTES[sharedStatus] : null;
  // The annual column ends the visible row until the observed (and status)
  // columns appear; it then drops its right padding to keep the table
  // flush with the grid.
  const annualEdge = showStatusColumn
    ? "pr-0 sm:pr-3"
    : "pr-0 sm:pr-0 lg:pr-3";

  return (
    <figure>
      <ScrollRegion>
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">
            Key bulk wine reference prices
            {sharedUnit ? ` in ${sharedUnit}` : ""}, with the change on the
            week and on the same week a year earlier
          </caption>
          <thead>
            <tr className="border-b border-ink/30">
              <th scope="col" className={TH}>
                Market
              </th>
              <th scope="col" className={`${TH} hidden md:table-cell`}>
                Wine
              </th>
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
                <span className="sm:hidden">Week</span>
                <span className="hidden sm:inline">Week on week</span>
              </th>
              <th scope="col" className={`${TH} ${annualEdge} text-right`}>
                <span className="sm:hidden">Year</span>
                <span className="hidden sm:inline">Year on year</span>
              </th>
              <th scope="col" className={`${TH} hidden text-right lg:table-cell`}>
                Observed
              </th>
              {showStatusColumn ? (
                <th scope="col" className={`${TH} hidden sm:table-cell`}>
                  Status
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {quotes.map((quote) => {
              const colour = quote.colour ? COLOUR_LABELS[quote.colour] : null;
              return (
                <tr key={quote.id} className="border-b border-rule">
                  <th scope="row" className={`${TD} font-normal`}>
                    <span className="flex items-baseline gap-2">
                      <span className="hidden sm:inline-flex">
                        <CountryLabel code={quote.country} variant="plain" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[0.9375rem] leading-snug font-semibold text-ink">
                          {quote.market}
                        </span>
                        <span className="block text-xs leading-snug text-ink-soft lg:hidden">
                          <span className="sm:hidden">
                            <CountryLabel code={quote.country} variant="plain" />{" "}
                            &middot;{" "}
                          </span>
                          {colour ? (
                            <span className="md:hidden">{colour} &middot; </span>
                          ) : null}
                          <time
                            dateTime={quote.observedAt}
                            className="whitespace-nowrap"
                          >
                            {formatDate(quote.observedAt)}
                          </time>
                          {showStatusColumn ? (
                            <span className="sm:hidden">
                              {" "}
                              &middot; {DATA_STATUS_LABELS[quote.status]}
                            </span>
                          ) : null}
                        </span>
                      </span>
                    </span>
                  </th>
                  <td className={`${TD} hidden text-sm text-ink-soft md:table-cell`}>
                    {colour ?? "-"}
                  </td>
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
                  <td className={`${TD} ${annualEdge} text-right text-sm`}>
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
                  {showStatusColumn ? (
                    <td
                      className={`${TD} hidden text-sm text-ink-soft sm:table-cell`}
                    >
                      {DATA_STATUS_LABELS[quote.status]}
                    </td>
                  ) : null}
                </tr>
              );
            })}
          </tbody>
        </table>
      </ScrollRegion>
      {first ? (
        <figcaption className="mt-3">
          <DataNote
            lead={statusNote}
            source={first.source}
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
      ) : null}
    </figure>
  );
}
