import Link from "next/link";

import { PercentChange } from "@/components/market/ChangeCell";
import { formatPrice } from "@/lib/format";
import type { SeriesObservation } from "@/services/markets/types";

/** Percentage movement that renders "n/a" when history is too short. */
export function MaybePercent({ value }: { value: number | null }) {
  if (value === null) {
    return <span className="wt-label text-ink-soft">n/a</span>;
  }
  return <PercentChange value={value} />;
}

/** Published price range, "3.94 - 4.26", or a dash when none exists. */
export function RangeCell({ observation }: { observation: SeriesObservation }) {
  if (observation.min === undefined || observation.max === undefined) {
    return (
      <span aria-label="no published range" className="wt-label text-ink-soft">
        -
      </span>
    );
  }
  return (
    <span className="tnum font-mono text-xs whitespace-nowrap text-ink-soft">
      {formatPrice(observation.min)}-{formatPrice(observation.max)}
    </span>
  );
}

/** Series code as a link into the reusable market detail route. */
export function SeriesCodeLink({ code }: { code: string }) {
  return (
    <Link
      href={`/markets/series/${code}`}
      className="wt-label whitespace-nowrap text-wine underline decoration-rule underline-offset-2 hover:text-wine-deep"
    >
      {code}
    </Link>
  );
}

export const TH = "wt-label px-3 py-2 font-normal text-ink-soft";
export const TH_RIGHT = `${TH} text-right`;
export const TD = "px-3 py-2.5 whitespace-nowrap";
export const TD_RIGHT = `${TD} text-right`;
