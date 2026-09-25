import Link from "next/link";

import { TIME_RANGES, type TimeRangeKey } from "@/services/markets/types";

/**
 * Time range selector for a series chart, as plain links so the chosen
 * range lives in the URL. Only ranges the series' history supports are
 * rendered.
 */
export function TimeRangeControls({
  basePath,
  available,
  active,
}: {
  basePath: string;
  available: TimeRangeKey[];
  active: TimeRangeKey;
}) {
  return (
    <nav aria-label="Chart time range" className="flex items-center">
      {TIME_RANGES.filter((range) => available.includes(range.key)).map(
        (range) => {
          const isActive = range.key === active;
          return (
            <Link
              key={range.key}
              href={`${basePath}?r=${range.key}`}
              replace
              scroll={false}
              aria-current={isActive ? "true" : undefined}
              className={`wt-label border-y border-l border-rule px-2.5 py-1.5 last:border-r ${
                isActive
                  ? "bg-wine text-paper"
                  : "bg-paper text-ink-soft hover:text-wine-deep"
              }`}
            >
              {range.label}
            </Link>
          );
        },
      )}
    </nav>
  );
}
