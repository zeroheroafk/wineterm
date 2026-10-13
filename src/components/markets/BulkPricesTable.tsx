"use client";

import { useState } from "react";
import Link from "next/link";

import { PriceCell } from "@/components/market/PriceCell";
import { MaybePercent, RangeCell } from "@/components/markets/cells";
import { CountryLabel } from "@/components/ui/CountryLabel";
import { DataStatusLabel } from "@/components/ui/DataStatusLabel";
import { ScrollRegion } from "@/components/ui/ScrollRegion";
import { formatDateTime, formatPrice } from "@/lib/format";
import { isIllustrative } from "@/services/markets/service";
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

const COLOUR_SHORT = { red: "Red", white: "White", rose: "Rosé" } as const;

/** Two-digit-year date to keep the widest table inside its frame. */
function shortDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "2-digit",
    timeZone: "UTC",
  }).format(new Date(iso));
}

// Comfortable spacing in the summary table; extra columns expand on demand.
const TH = "wt-label px-3 py-3 font-medium text-ink-soft";
const TH_RIGHT = `${TH} text-right`;
const TD = "px-3 py-3.5 whitespace-nowrap";
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
 * normalisation alongside, movements over three horizons. Only samples
 * carry a status; the source is on each series page. Extra columns expand on demand; the full table scrolls
 * inside its frame rather than the page.
 */
export function BulkPricesTable({ rows }: { rows: MarketRow[] }) {
  const [showDetails, setShowDetails] = useState(false);
  if (rows.length === 0) {
    return (
      <EmptyState
        title="No series match these filters"
        detail="Reset the filters or widen the selection; series are added as sources are connected."
      />
    );
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-soft">Prices and weekly changes. Select a market for its history and source.</p>
        <button type="button" aria-pressed={showDetails} onClick={() => setShowDetails((value) => !value)} className="min-h-11 border border-rule bg-paper px-4 text-sm font-medium text-wine hover:border-wine">
          {showDetails ? "Hide extra columns" : "Show extra columns"}
        </button>
      </div>
      <ScrollRegion className="border border-rule bg-paper">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">
            Bulk wine reference prices with original units, labelled EUR/hl
            normalisation and movements
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
              <th scope="col" className={`${TH_RIGHT} ${showDetails ? "" : "hidden"}`}>
                Range
              </th>
              <th scope="col" className={`${TH_RIGHT} ${showDetails ? "" : "hidden"}`}>
                <abbr title="Normalised to EUR/hl" className="no-underline">
                  EUR/hl
                </abbr>
              </th>
              <th scope="col" className={TH_RIGHT}>
                Weekly %
              </th>
              <th scope="col" className={`${TH_RIGHT} ${showDetails ? "" : "hidden"}`}>
                Monthly %
              </th>
              <th scope="col" className={`${TH_RIGHT} ${showDetails ? "" : "hidden"}`}>
                Annual %
              </th>
              <th scope="col" className={TH}>
                Date
              </th>
              <th scope="col" className={`${TH} hidden sm:table-cell`}>
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
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
                  {/* A reference market names its town; its region goes
                      beneath, unless the market's name already gives it. */}
                  {row.series.appellation &&
                  !row.series.appellation.includes(row.series.region) ? (
                    <span className="mt-0.5 block text-xs text-ink-soft">
                      {row.series.region}
                    </span>
                  ) : null}
                  <span className="mt-1 block text-sm text-ink-soft sm:hidden">
                    {categoryLabel(row)} {row.series.colour ? COLOUR_SHORT[row.series.colour] : null}
                  </span>
                  {/* On phones the status column is out of view, so a
                      sample's label rides under the market name. */}
                  {isIllustrative(row) ? (
                    <span className="mt-1 block sm:hidden">
                      <DataStatusLabel status="illustrative" />
                    </span>
                  ) : null}
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
                <td className={`${TD_RIGHT} ${showDetails ? "" : "hidden"}`}>
                  <RangeCell observation={row.latest} />
                </td>
                <td className={`${TD_RIGHT} ${showDetails ? "" : "hidden"}`}>
                  {row.normalisedValue !== null ? (
                    <span
                      className="tnum font-mono text-sm text-ink-soft"
                      title={`Normalised from ${row.series.unit} to ${referenceUnit(row.series.unit)}`}
                    >
                      {formatPrice(row.normalisedValue)}
                      <sup className="ml-0.5 text-[0.6rem] text-ochre-deep">n</sup>
                    </span>
                  ) : (
                    <span className="wt-label text-ink-soft">&middot;</span>
                  )}
                </td>
                <td className={TD_RIGHT}>
                  <MaybePercent value={row.changes.weekPercent} />
                </td>
                <td className={`${TD_RIGHT} ${showDetails ? "" : "hidden"}`}>
                  <MaybePercent value={row.changes.monthPercent} />
                </td>
                <td className={`${TD_RIGHT} ${showDetails ? "" : "hidden"}`}>
                  <MaybePercent value={row.changes.yoyPercent} />
                </td>
                <td
                  className={`${TD} tnum font-mono text-xs text-ink-soft`}
                  title={`Last updated ${formatDateTime(row.latest.updatedAt)}`}
                >
                  {shortDate(row.latest.date)}
                </td>
                <td className={`${TD} hidden sm:table-cell`}>
                  {isIllustrative(row) ? (
                    <DataStatusLabel status="illustrative" />
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollRegion>
    </div>
  );
}
