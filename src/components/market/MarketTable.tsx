import { AbsoluteChange, PercentChange } from "@/components/market/ChangeCell";
import { PriceCell } from "@/components/market/PriceCell";
import { CountryLabel } from "@/components/ui/CountryLabel";
import { DataStatusLabel } from "@/components/ui/DataStatusLabel";
import { SourceLine } from "@/components/ui/SourceLine";
import { formatDate } from "@/lib/format";
import type { DataSource, PriceQuote } from "@/services/types";

/**
 * The primary data interface of WineTerm: a dense, ruled price table.
 * Rows are PriceQuote records; the caption and source line make every
 * table self-describing.
 */
export function MarketTable({
  caption,
  quotes,
  source,
  updatedAt,
}: {
  caption: string;
  quotes: PriceQuote[];
  /** Table-level source; falls back to the first quote's source. */
  source?: DataSource;
  updatedAt?: string;
}) {
  const tableSource = source ?? quotes[0]?.source;

  return (
    <figure>
      <div className="overflow-x-auto border border-rule bg-paper">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="border-b-2 border-ink">
              <th scope="col" className="wt-label px-3 py-2 font-normal text-ink-soft">
                Code
              </th>
              <th scope="col" className="wt-label px-3 py-2 font-normal text-ink-soft">
                Market
              </th>
              <th scope="col" className="wt-label px-3 py-2 font-normal text-ink-soft">
                Product
              </th>
              <th
                scope="col"
                className="wt-label px-3 py-2 text-right font-normal text-ink-soft"
              >
                Price
              </th>
              <th
                scope="col"
                className="wt-label px-3 py-2 text-right font-normal text-ink-soft"
              >
                Chg
              </th>
              <th
                scope="col"
                className="wt-label px-3 py-2 text-right font-normal text-ink-soft"
              >
                Chg %
              </th>
              <th scope="col" className="wt-label px-3 py-2 font-normal text-ink-soft">
                Date
              </th>
              <th scope="col" className="wt-label px-3 py-2 font-normal text-ink-soft">
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
                <td className="wt-label px-3 py-2.5 whitespace-nowrap text-wine">
                  {quote.code}
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <span className="inline-flex items-center gap-2">
                    <CountryLabel code={quote.country} />
                    <span className="text-sm font-medium text-ink">
                      {quote.market}
                    </span>
                  </span>
                </td>
                <td className="px-3 py-2.5 text-sm text-ink-soft">
                  {quote.product}
                </td>
                <td className="px-3 py-2.5 text-right whitespace-nowrap">
                  <PriceCell value={quote.price} unit={quote.unit} />
                </td>
                <td className="px-3 py-2.5 text-right whitespace-nowrap">
                  <AbsoluteChange value={quote.change} />
                </td>
                <td className="px-3 py-2.5 text-right whitespace-nowrap">
                  <PercentChange value={quote.changePercent} />
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
