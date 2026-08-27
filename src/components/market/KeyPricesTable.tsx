import { PercentChange } from "@/components/market/ChangeCell";
import { PriceCell } from "@/components/market/PriceCell";
import { CountryLabel } from "@/components/ui/CountryLabel";
import { DataStatusLabel } from "@/components/ui/DataStatusLabel";
import { SourceLine } from "@/components/ui/SourceLine";
import { formatDate } from "@/lib/format";
import type { PriceQuote } from "@/services/types";

const COLOUR_LABELS = { red: "Red", white: "White", rose: "Rose" } as const;

const HEAD_CELL = "wt-label px-3 py-2 font-normal text-ink-soft";

/**
 * Homepage key prices: denser than the full MarketTable, with weekly and
 * year-on-year change side by side. Category and YoY columns yield on
 * narrow screens so price, movement, date and status stay in view.
 */
export function KeyPricesTable({
  quotes,
  updatedAt,
}: {
  quotes: PriceQuote[];
  updatedAt?: string;
}) {
  const tableSource = quotes[0]?.source;

  return (
    <figure>
      <div className="overflow-x-auto border border-rule bg-paper">
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
      </div>
      {tableSource ? (
        <figcaption className="mt-2">
          <SourceLine source={tableSource} updatedAt={updatedAt} />
        </figcaption>
      ) : null}
    </figure>
  );
}
