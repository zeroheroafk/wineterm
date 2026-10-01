import { sharedStatusNote } from "@/components/ui/DataStatusLabel";
import { DataNote } from "@/components/ui/SourceLine";
import { formatDateRange, formatPercent } from "@/lib/format";
import type { PriceQuote } from "@/services/types";

/** Room beyond the end of a bar for its value label. */
const LABEL_ROOM = "2.75rem";

type ChangeRow = PriceQuote & { yoyPercent: number };

/**
 * Change on a year earlier, one bar per market, drawn from the same price
 * records as the key prices table, so the two can never disagree. A
 * percent change does not depend on the price unit. Bars run right of
 * the zero line in the rising colour and left of it in the falling
 * colour; each carries its signed value, so neither colour nor length is
 * the only cue. The bars are hidden from assistive technology, which
 * reads the same figures from a table.
 */
export function AnnualChangeChart({
  title,
  titleId,
  quotes,
}: {
  title: string;
  titleId: string;
  quotes: PriceQuote[];
}) {
  const rows = quotes
    .filter((quote): quote is ChangeRow => typeof quote.yoyPercent === "number")
    .sort((a, b) => b.yoyPercent - a.yoyPercent);
  const first = rows[0];
  if (!first) return null;

  const values = rows.map((row) => row.yoyPercent);
  const min = Math.min(0, ...values);
  const max = Math.max(0, ...values);
  const span = max - min || 1;
  const at = (value: number) => ((value - min) / span) * 100;
  const zero = at(0);

  const dates = rows.map((row) => row.observedAt).sort();
  const observed = formatDateRange(dates[0], dates[dates.length - 1]);
  const status = rows.every((row) => row.status === first.status)
    ? first.status
    : undefined;

  return (
    <figure aria-labelledby={titleId} className="@container">
      <p id={titleId} className="text-[0.9375rem] leading-snug font-semibold text-ink">
        {title}
      </p>
      <p className="mt-0.5 text-[0.8125rem] leading-snug text-ink-soft">
        Percent change on the same week a year earlier; latest prices
        observed {observed}
      </p>

      <div
        aria-hidden="true"
        className="mt-3 [--name:6.5rem] @xs:[--name:8.5rem]"
      >
        {rows.map((row) => {
          const end = at(row.yoyPercent);
          const rising = row.yoyPercent > 0;
          return (
            <div
              key={row.id}
              className="grid grid-cols-[var(--name)_minmax(0,1fr)] gap-x-3"
            >
              <span className="py-1.5 text-[0.8125rem] leading-snug text-ink">
                {row.market}
              </span>
              <span
                className="relative min-h-7 self-stretch"
                style={{
                  marginLeft: min < 0 ? LABEL_ROOM : 0,
                  marginRight: max > 0 ? LABEL_ROOM : 0,
                }}
              >
                <span
                  className={`absolute top-1/2 h-3 -translate-y-1/2 ${rising ? "bg-up" : "bg-down"}`}
                  style={{
                    left: `${Math.min(end, zero)}%`,
                    width: `${Math.abs(end - zero)}%`,
                  }}
                />
                <span
                  className="absolute inset-y-0 w-px bg-ink/50"
                  style={{ left: `${zero}%` }}
                />
                <span
                  className="tnum absolute top-1/2 -translate-y-1/2 text-[0.8125rem] font-medium whitespace-nowrap text-ink"
                  style={
                    row.yoyPercent < 0
                      ? { right: `calc(${100 - end}% + 0.375rem)` }
                      : { left: `calc(${end}% + 0.375rem)` }
                  }
                >
                  {formatPercent(row.yoyPercent)}
                </span>
              </span>
            </div>
          );
        })}
      </div>

      {/* A table ignores the 1px box of sr-only, so a block wraps it. */}
      <div className="sr-only">
        <table>
          <caption>
            {title}: percent change on the same week a year earlier, latest
            prices observed {observed}
          </caption>
          <thead>
            <tr>
              <th scope="col">Market</th>
              <th scope="col">Wine</th>
              <th scope="col">Change on a year earlier</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <th scope="row">{row.market}</th>
                <td>{row.product}</td>
                <td>{formatPercent(row.yoyPercent)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <figcaption className="mt-2.5">
        {/* Percent changes do not depend on the price unit, so the
            source's unit caveat stays with the price table. */}
        <DataNote
          lead={status ? sharedStatusNote(status) : null}
          source={{ name: first.source.name, url: first.source.url }}
        />
      </figcaption>
    </figure>
  );
}
