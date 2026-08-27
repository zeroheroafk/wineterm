import Link from "next/link";

import { PriceCell } from "@/components/market/PriceCell";
import { MaybePercent, RangeCell } from "@/components/markets/cells";
import { DataClassificationTag } from "@/components/markets/tags";
import { CountryLabel } from "@/components/ui/CountryLabel";
import { DataStatusLabel } from "@/components/ui/DataStatusLabel";
import { formatDateTime, formatPrice } from "@/lib/format";
import { getSource } from "@/services/markets/sources";
import {
  referenceUnit,
  type MarketRow,
  type WineClassification,
} from "@/services/markets/types";
import { EmptyState } from "@/components/ui/states";

const CLASSIFICATION_SHORT: Record<WineClassification, string> = {
  "no-gi": "No GI",
  pgi: "PGI",
  pdo: "PDO",
};

const COLOUR_SHORT = { red: "Red", white: "White", rose: "Rose" } as const;

/** Two-digit-year date to keep the widest table inside its frame. */
function shortDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "2-digit",
    timeZone: "UTC",
  }).format(new Date(iso));
}

// Denser cells than the shared defaults: this is the widest table on the
// platform and must fit the content column at desktop widths.
const TH = "wt-label px-2 py-2 font-normal text-ink-soft";
const TH_RIGHT = `${TH} text-right`;
const TD = "px-2 py-2.5 whitespace-nowrap";
const TD_RIGHT = `${TD} text-right`;

function categoryLabel(row: MarketRow): string {
  const parts: string[] = [];
  if (row.series.classification)
    parts.push(CLASSIFICATION_SHORT[row.series.classification]);
  if (row.series.category === "varietal") parts.push("Varietal");
  if (row.series.category === "organic") parts.push("Organic");
  return parts.join(" ");
}

/**
 * The bulk wine price table: original observation first, labelled
 * normalisation alongside, movements over three horizons, then
 * provenance. Secondary columns yield below lg; the full table scrolls
 * inside its frame rather than the page.
 */
export function BulkPricesTable({ rows }: { rows: MarketRow[] }) {
  if (rows.length === 0) {
    return (
      <EmptyState
        title="No series match these filters"
        detail="Reset the filters or widen the selection; series are added as sources are connected."
      />
    );
  }

  return (
    <div className="overflow-x-auto border border-rule bg-paper">
      <table className="w-full border-collapse text-left">
        <caption className="sr-only">
          Bulk wine reference prices with original units, labelled EUR/hl
          normalisation, movements and provenance
        </caption>
        <thead>
          <tr className="border-b-2 border-ink">
            <th scope="col" className={TH}>
              Market
            </th>
            <th scope="col" className={`${TH} hidden sm:table-cell`}>
              Category
            </th>
            <th scope="col" className={TH_RIGHT}>
              Price
            </th>
            <th scope="col" className={`${TH_RIGHT} hidden lg:table-cell`}>
              Range
            </th>
            <th scope="col" className={`${TH_RIGHT} hidden lg:table-cell`}>
              <abbr title="Normalised to EUR/hl" className="no-underline">
                Norm.
              </abbr>
            </th>
            <th scope="col" className={TH_RIGHT}>
              Wk %
            </th>
            <th scope="col" className={`${TH_RIGHT} hidden md:table-cell`}>
              1M %
            </th>
            <th scope="col" className={`${TH_RIGHT} hidden md:table-cell`}>
              YoY %
            </th>
            <th scope="col" className={TH}>
              Date
            </th>
            <th scope="col" className={`${TH} hidden lg:table-cell`}>
              Source
            </th>
            <th scope="col" className={TH}>
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const source = getSource(row.series.sourceId);
            return (
              <tr
                key={row.series.code}
                className="border-b border-rule transition-colors last:border-b-0 hover:bg-ground/70"
              >
                <td className={TD}>
                  <span className="flex items-center gap-1.5">
                    <CountryLabel code={row.series.country} />
                    <Link
                      href={`/markets/series/${row.series.code}`}
                      className="text-sm font-medium text-ink hover:text-wine-deep"
                    >
                      {row.series.appellation ?? row.series.region}
                    </Link>
                  </span>
                </td>
                <td className={`${TD} hidden text-sm text-ink-soft sm:table-cell`}>
                  {categoryLabel(row)}
                  {row.series.colour ? (
                    <span className="text-ink">
                      {" "}
                      {COLOUR_SHORT[row.series.colour]}
                    </span>
                  ) : null}
                </td>
                <td className={TD_RIGHT}>
                  <PriceCell value={row.latest.value} unit={row.series.unit} />
                </td>
                <td className={`${TD_RIGHT} hidden lg:table-cell`}>
                  <RangeCell observation={row.latest} />
                </td>
                <td className={`${TD_RIGHT} hidden lg:table-cell`}>
                  {row.normalisedValue !== null ? (
                    <span
                      className="tnum font-mono text-sm text-ink-soft"
                      title={`Normalised from ${row.series.unit} to ${referenceUnit(row.series.unit)}`}
                    >
                      {formatPrice(row.normalisedValue)}
                      <sup className="ml-0.5 text-[0.6rem] text-ochre">n</sup>
                    </span>
                  ) : (
                    <span className="wt-label text-ink-soft">&middot;</span>
                  )}
                </td>
                <td className={TD_RIGHT}>
                  <MaybePercent value={row.changes.weekPercent} />
                </td>
                <td className={`${TD_RIGHT} hidden md:table-cell`}>
                  <MaybePercent value={row.changes.monthPercent} />
                </td>
                <td className={`${TD_RIGHT} hidden md:table-cell`}>
                  <MaybePercent value={row.changes.yoyPercent} />
                </td>
                <td
                  className={`${TD} tnum font-mono text-xs text-ink-soft`}
                  title={`Last updated ${formatDateTime(row.latest.updatedAt)}`}
                >
                  {shortDate(row.latest.date)}
                </td>
                <td className={`${TD} hidden lg:table-cell`}>
                  <span title={source.name}>
                    <DataClassificationTag
                      classification={source.classification}
                    />
                  </span>
                </td>
                <td className={TD}>
                  <DataStatusLabel status={row.latest.status} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
