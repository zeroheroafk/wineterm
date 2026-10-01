import { InlinePercentChange } from "@/components/market/ChangeCell";
import { sharedStatusNote } from "@/components/ui/DataStatusLabel";
import { DataNote } from "@/components/ui/SourceLine";
import { formatPrice } from "@/lib/format";
import {
  COUNTRY_NAMES,
  type SupplyCountryRow,
  type SupplySnapshot,
} from "@/services/types";

/**
 * Bar segments in balance order after production, the figure the new
 * campaign changes most. Burgundy carries production; opening stocks are
 * a tint of the same hue; imports a neutral, since they are small.
 */
const SEGMENTS: {
  key: keyof Pick<
    SupplyCountryRow,
    "productionMhl" | "openingStocksMhl" | "importsMhl"
  >;
  label: string;
  className: string;
}[] = [
  { key: "productionMhl", label: "Production", className: "bg-wine" },
  { key: "openingStocksMhl", label: "Opening stocks", className: "bg-wine/35" },
  { key: "importsMhl", label: "Imports", className: "bg-ink-soft" },
];

/**
 * Country, bar, availability, five-year comparison. Fixed figure columns
 * keep the header grid and every row grid aligned. Below sm the bar
 * leaves the first line and spans the row underneath.
 */
const ROW_GRID =
  "grid grid-cols-[minmax(0,1fr)_5rem_5.5rem] gap-x-4 sm:grid-cols-[6.5rem_minmax(0,1fr)_5.5rem_7rem] sm:gap-x-5";

function mhl(value: number): string {
  return formatPrice(value, 1);
}

/**
 * Availability comparison by producer country. Each bar is the full
 * availability of the supply balance, split into production, opening
 * stocks and imports on a shared scale, with the exact figures written
 * underneath and the position against the five-year average beside it.
 * On narrow screens the bar drops below the country line.
 */
export function SupplyComparison({ snapshot }: { snapshot: SupplySnapshot }) {
  const scaleMax = Math.max(...snapshot.rows.map((row) => row.availabilityMhl));

  return (
    <figure>
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1.5">
        <p className="text-[0.8125rem] text-ink-soft">
          Availability by country, million hectolitres
        </p>
        <ul
          aria-label="Bar segments"
          className="flex flex-wrap gap-x-4 gap-y-1 text-[0.8125rem] text-ink-soft"
        >
          {SEGMENTS.map((segment) => (
            <li key={segment.key} className="flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className={`h-2.5 w-2.5 ${segment.className}`}
              />
              {segment.label}
            </li>
          ))}
        </ul>
      </div>

      <div
        aria-hidden="true"
        className={`${ROW_GRID} mt-3 items-end border-b border-ink/30 pb-1.5 text-[0.8125rem] leading-tight font-medium text-ink-soft`}
      >
        <span>Country</span>
        <span className="hidden sm:block">
          Production, opening stocks and imports
        </span>
        <span className="text-right">Availability</span>
        <span className="text-right">
          <span className="sm:hidden">vs 5-yr avg</span>
          <span className="hidden sm:inline">vs five-year average</span>
        </span>
      </div>

      <ul>
        {snapshot.rows.map((row) => (
          <li
            key={row.country}
            className={`${ROW_GRID} gap-y-2 border-b border-rule py-3 sm:items-center`}
          >
            <p className="text-[0.9375rem] font-semibold text-ink">
              {COUNTRY_NAMES[row.country]}
            </p>
            <div className="col-span-3 row-start-2 min-w-0 sm:col-span-1 sm:col-start-2 sm:row-start-1">
              <div aria-hidden="true" className="flex h-3 w-full bg-rule/45">
                {SEGMENTS.map((segment) => (
                  <span
                    key={segment.key}
                    className={segment.className}
                    style={{ width: `${(row[segment.key] / scaleMax) * 100}%` }}
                  />
                ))}
              </div>
              <p className="tnum mt-1.5 text-xs text-ink-soft">
                {SEGMENTS.map((segment, index) => (
                  <span key={segment.key}>
                    {index > 0 ? (
                      <span aria-hidden="true" className="mx-1.5">
                        &middot;
                      </span>
                    ) : null}
                    <span className="whitespace-nowrap">
                      {segment.label} {mhl(row[segment.key])}
                    </span>
                    <span className="sr-only">.</span>
                  </span>
                ))}
              </p>
            </div>
            <p className="tnum col-start-2 row-start-1 text-right text-[0.9375rem] font-semibold text-ink sm:col-start-3">
              <span className="sr-only">Availability </span>
              {mhl(row.availabilityMhl)}
            </p>
            <p className="col-start-3 row-start-1 text-right text-sm sm:col-start-4">
              <span className="sr-only">Against the five-year average </span>
              <InlinePercentChange value={row.vsFiveYearPercent} />
            </p>
          </li>
        ))}
      </ul>

      <figcaption className="mt-3">
        <DataNote
          lead={sharedStatusNote(snapshot.status)}
          source={snapshot.source}
          updatedAt={snapshot.updatedAt}
        />
      </figcaption>
    </figure>
  );
}
