import { TrendIndicator } from "@/components/market/TrendIndicator";
import { DataStatusLabel } from "@/components/ui/DataStatusLabel";
import { CountryLabel } from "@/components/ui/CountryLabel";
import { formatPrice } from "@/lib/format";
import type { CountryHarvestForecast } from "@/services/harvest/types";

const DIRECTION_VALUE = { up: 1, down: -1, flat: 0 } as const;
const DIRECTION_TEXT = {
  up: "Above previous",
  down: "Below previous",
  flat: "Near previous",
} as const;

/**
 * Country production forecasts as ranges on a shared scale, with the
 * previous campaign marked. Ranges, not points: first estimates carry
 * real uncertainty and are shown that way.
 */
export function ForecastRangeTable({
  forecasts,
  withCommentary = false,
}: {
  forecasts: CountryHarvestForecast[];
  withCommentary?: boolean;
}) {
  const scaleMax = Math.max(
    ...forecasts.map((f) => Math.max(f.maxMhl, f.previousMhl)),
  );

  return (
    <figure>
      <div className="border border-rule bg-paper">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-ink px-4 py-2">
          <p className="wt-label text-ink">
            2026/27 production forecast ranges
            <span aria-hidden="true" className="mx-2 text-rule">
              &middot;
            </span>
            <span className="text-ink-soft">Mhl</span>
          </p>
          <span className="wt-label flex items-center gap-4 text-ink-soft">
            <span className="flex items-center gap-1.5">
              <span aria-hidden="true" className="h-2 w-4 bg-wine" /> Forecast
              range
            </span>
            <span className="flex items-center gap-1.5">
              <span aria-hidden="true" className="h-3 w-0.5 bg-ochre" /> 2025/26
            </span>
          </span>
        </div>
        <ul>
          {forecasts.map((forecast) => (
            <li
              key={forecast.country}
              className="grid grid-cols-1 items-center gap-x-5 gap-y-2 border-b border-rule px-4 py-3.5 last:border-b-0 md:grid-cols-[7.5rem_minmax(0,1fr)_11rem_8rem]"
            >
              <span className="flex items-center gap-2">
                <CountryLabel code={forecast.country} withName />
              </span>
              <span
                aria-hidden="true"
                className="relative block h-4 w-full bg-ground"
              >
                <span
                  className="absolute inset-y-1 bg-wine"
                  style={{
                    left: `${(forecast.minMhl / scaleMax) * 100}%`,
                    width: `${((forecast.maxMhl - forecast.minMhl) / scaleMax) * 100}%`,
                  }}
                />
                <span
                  className="absolute inset-y-0 w-0.5 bg-ochre"
                  style={{ left: `${(forecast.previousMhl / scaleMax) * 100}%` }}
                />
              </span>
              <span className="tnum font-mono text-sm whitespace-nowrap text-ink">
                {formatPrice(forecast.minMhl, 1)} to{" "}
                {formatPrice(forecast.maxMhl, 1)}
                <span className="ml-1.5 text-[0.65rem] text-ink-soft">Mhl</span>
              </span>
              <span className="flex items-center gap-1.5 text-xs whitespace-nowrap text-ink">
                <TrendIndicator value={DIRECTION_VALUE[forecast.direction]} />
                {DIRECTION_TEXT[forecast.direction]}
              </span>
              {withCommentary ? (
                <p className="text-xs leading-relaxed text-ink-soft md:col-span-4 md:-mt-1">
                  {forecast.commentary}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
      <figcaption className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
        <DataStatusLabel status="forecast" />
        <span className="wt-label text-ink-soft">
          First estimates precede official declarations and are revised
          through the autumn. Source: National harvest estimates (sample).
        </span>
      </figcaption>
    </figure>
  );
}
