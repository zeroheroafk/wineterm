import { sharedStatusNote } from "@/components/ui/DataStatusLabel";
import { DataNote } from "@/components/ui/SourceLine";
import { formatDate, formatPrice } from "@/lib/format";
import type { PriceSeries } from "@/services/types";

const MONTH = new Intl.DateTimeFormat("en-GB", {
  month: "short",
  timeZone: "UTC",
});

function toTime(isoDate: string): number {
  return Date.parse(`${isoDate}T00:00:00Z`);
}

/** Step of 1, 2, 2.5 or 5 x 10^n giving roughly three intervals. */
function niceStep(range: number): number {
  const rough = range / 3;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const normalised = rough / magnitude;
  const factor =
    normalised <= 1 ? 1 : normalised <= 2 ? 2 : normalised <= 2.5 ? 2.5 : 5;
  return factor * magnitude;
}

/** First days of the months after the series start, up to its end. */
function monthStarts(start: number, end: number): number[] {
  const date = new Date(start);
  const starts = [start];
  let cursor = Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1);
  while (cursor <= end) {
    starts.push(cursor);
    const next = new Date(cursor);
    cursor = Date.UTC(next.getUTCFullYear(), next.getUTCMonth() + 1, 1);
  }
  return starts;
}

/**
 * Compact single-series line chart for an editorial slot, rendered on the
 * server as SVG. Gridlines and value labels sit on a shared nice scale,
 * the latest observation is marked and labelled, and the observations
 * are repeated in a visually hidden table for assistive technology.
 */
export function PriceTrendChart({
  series,
  titleId,
}: {
  series: PriceSeries;
  titleId: string;
}) {
  const points = series.points;
  if (points.length < 2) return null;

  const times = points.map((point) => toTime(point.date));
  const values = points.map((point) => point.value);
  const tMin = times[0];
  const tMax = times[times.length - 1];
  const step = niceStep(Math.max(...values) - Math.min(...values) || 1);
  const low = Math.floor(Math.min(...values) / step);
  const high = Math.ceil(Math.max(...values) / step);
  const yMin = low * step;
  const yMax = high * step;
  const ticks = Array.from(
    { length: high - low + 1 },
    (_, index) => Math.round((low + index) * step * 1000) / 1000,
  );

  const x = (time: number) => ((time - tMin) / (tMax - tMin)) * 100;
  const y = (value: number) => (1 - (value - yMin) / (yMax - yMin)) * 100;
  const path = points
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"}${x(times[index]).toFixed(2)} ${y(point.value).toFixed(2)}`,
    )
    .join(" ");

  const first = points[0];
  const last = points[points.length - 1];
  const lastY = y(last.value);

  return (
    <figure aria-labelledby={titleId}>
      <p id={titleId} className="text-sm font-semibold text-ink">
        {series.name}
      </p>
      <p className="text-[0.8125rem] text-ink-soft">
        {series.unit}, {formatDate(first.date)} to {formatDate(last.date)}
      </p>

      <div aria-hidden="true" className="mt-3">
        <div className="relative h-36 pr-9">
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="h-full w-full overflow-visible"
          >
            {ticks.map((tick) => (
              <line
                key={tick}
                x1="0"
                x2="100"
                y1={y(tick)}
                y2={y(tick)}
                stroke="var(--wt-rule)"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            ))}
            <path
              d={path}
              fill="none"
              stroke="var(--wt-wine)"
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          {ticks.map((tick) => (
            <span
              key={tick}
              className="tnum absolute right-0 -translate-y-1/2 text-[0.6875rem] leading-none text-ink-soft"
              style={{ top: `${y(tick)}%` }}
            >
              {formatPrice(tick)}
            </span>
          ))}
          <span
            className="absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 border-2 border-paper bg-wine box-content"
            style={{ left: "calc(100% - 2.25rem)", top: `${lastY}%` }}
          />
          <span
            className="tnum absolute -translate-x-full text-xs font-semibold text-wine"
            style={{
              left: "calc(100% - 2.75rem)",
              top: `calc(${lastY}% - 1.35rem)`,
            }}
          >
            {formatPrice(last.value)}
          </span>
        </div>
        <div className="relative mt-1.5 mr-9 h-4">
          {monthStarts(tMin, tMax).map((time, index) => (
            <span
              key={time}
              className={`absolute text-[0.6875rem] leading-none text-ink-soft ${index === 0 ? "" : "-translate-x-1/2"}`}
              style={{ left: `${x(time)}%` }}
            >
              {MONTH.format(time)}
            </span>
          ))}
        </div>
      </div>

      <table className="sr-only">
        <caption>
          {series.name}, {series.unit}
        </caption>
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">Price</th>
          </tr>
        </thead>
        <tbody>
          {points.map((point) => (
            <tr key={point.date}>
              <td>{formatDate(point.date)}</td>
              <td>{formatPrice(point.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <figcaption className="mt-2">
        <DataNote lead={sharedStatusNote(series.status)} source={series.source} />
      </figcaption>
    </figure>
  );
}
