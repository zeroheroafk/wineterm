import { TrendIndicator } from "@/components/market/TrendIndicator";
import { DataStatusLabel } from "@/components/ui/DataStatusLabel";
import { CountryLabel } from "@/components/ui/CountryLabel";
import { SourceLine } from "@/components/ui/SourceLine";
import { formatPercent, formatPrice } from "@/lib/format";
import type { CountryHarvestForecast } from "@/services/harvest/types";
import { getSource } from "@/services/markets/sources";
import type { DataSource } from "@/services/types";

const DIRECTION_VALUE = { up: 1, down: -1, flat: 0 } as const;
const DIRECTION_TEXT = {
  up: "Above previous",
  down: "Below previous",
  flat: "Near previous",
} as const;

/**
 * Country production forecasts on a shared scale, with the previous
 * campaign marked. A range shows as a bar and a single figure as a dot:
 * first estimates carry real uncertainty and are shown as published. A
 * country without a forecast says so.
 */
export function ForecastRangeTable({
  forecasts,
  withCommentary = false,
  note = "First estimates precede the harvest declarations and are revised through the autumn.",
}: {
  forecasts: CountryHarvestForecast[];
  withCommentary?: boolean;
  /** What the reader should know about the figures, under the table. */
  note?: string;
}) {
  const scaleMax = Math.max(
    1,
    ...forecasts.flatMap((f) => [f.maxMhl ?? 0, f.previousMhl ?? 0]),
  );
  const hasRanges = forecasts.some(
    (f) => f.minMhl !== null && f.maxMhl !== null && f.maxMhl > f.minMhl,
  );
  const hasPoints = forecasts.some(
    (f) => f.minMhl !== null && f.maxMhl !== null && f.maxMhl === f.minMhl,
  );
  const statuses = [...new Set(forecasts.map((f) => f.status))];
  const sources: DataSource[] = [
    ...new Map(
      forecasts.map((f) => {
        const source = getSource(f.sourceId);
        return [source.id, { name: source.name, url: source.url }] as const;
      }),
    ).values(),
  ];

  return (
    <figure>
      <div className="border border-rule bg-paper">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-ink px-4 py-2">
          <p className="wt-label text-ink">
            2026/27 production forecasts
            <span aria-hidden="true" className="mx-2 text-rule">
              &middot;
            </span>
            <span className="text-ink-soft">Mhl</span>
          </p>
          <span className="wt-label flex items-center gap-4 text-ink-soft">
            {hasRanges ? (
              <span className="flex items-center gap-1.5">
                <span aria-hidden="true" className="h-2 w-4 bg-wine" /> Forecast
                range
              </span>
            ) : null}
            {hasPoints ? (
              <span className="flex items-center gap-1.5">
                <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-wine" />{" "}
                Forecast
              </span>
            ) : null}
            <span className="flex items-center gap-1.5">
              <span aria-hidden="true" className="h-3 w-0.5 bg-ochre" /> Previous
              campaign
            </span>
          </span>
        </div>
        <ul>
          {forecasts.map((forecast) => {
            const { minMhl, maxMhl, previousMhl, direction } = forecast;
            const hasForecast = minMhl !== null && maxMhl !== null;
            const isRange = hasForecast && maxMhl > minMhl;
            const change =
              hasForecast && previousMhl !== null && previousMhl > 0
                ? ((minMhl + maxMhl) / 2 / previousMhl - 1) * 100
                : null;
            return (
              <li
                key={forecast.country}
                className="grid grid-cols-1 items-center gap-x-5 gap-y-2 border-b border-rule px-4 py-3.5 last:border-b-0 md:grid-cols-[7.5rem_minmax(0,1fr)_11rem_10rem]"
              >
                <span className="flex items-center gap-2">
                  <CountryLabel code={forecast.country} withName />
                </span>
                <span
                  aria-hidden="true"
                  className="relative block h-4 w-full bg-ground"
                >
                  {hasForecast ? (
                    isRange ? (
                      <span
                        className="absolute inset-y-1 bg-wine"
                        style={{
                          left: `${(minMhl / scaleMax) * 100}%`,
                          width: `${((maxMhl - minMhl) / scaleMax) * 100}%`,
                        }}
                      />
                    ) : (
                      <span
                        className="absolute top-1/2 z-10 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-wine ring-2 ring-paper"
                        style={{ left: `${(minMhl / scaleMax) * 100}%` }}
                      />
                    )
                  ) : null}
                  {previousMhl !== null ? (
                    <span
                      className="absolute inset-y-0 w-0.5 bg-ochre"
                      style={{ left: `${(previousMhl / scaleMax) * 100}%` }}
                    />
                  ) : null}
                </span>
                <span className="tnum font-mono text-sm whitespace-nowrap text-ink">
                  {hasForecast ? (
                    <>
                      {isRange
                        ? `${formatPrice(minMhl, 1)} to ${formatPrice(maxMhl, 1)}`
                        : formatPrice(minMhl, 1)}
                      <span className="ml-1.5 text-[0.65rem] text-ink-soft">Mhl</span>
                    </>
                  ) : (
                    <span className="wt-label text-ink-soft">No forecast yet</span>
                  )}
                </span>
                <span className="flex items-center gap-1.5 text-xs whitespace-nowrap text-ink">
                  {direction ? <TrendIndicator value={DIRECTION_VALUE[direction]} /> : null}
                  {change !== null
                    ? `${formatPercent(change)} on previous`
                    : direction
                      ? DIRECTION_TEXT[direction]
                      : null}
                </span>
                {withCommentary ? (
                  <p className="text-xs leading-relaxed text-ink-soft md:col-span-4 md:-mt-1">
                    {forecast.commentary}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>
      <figcaption className="mt-2 space-y-1">
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {statuses.map((status) => (
            <DataStatusLabel key={status} status={status} />
          ))}
          <span className="wt-label text-ink-soft">{note}</span>
        </p>
        <SourceLine source={sources} />
      </figcaption>
    </figure>
  );
}
