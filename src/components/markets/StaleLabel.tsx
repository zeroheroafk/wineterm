import { formatDate } from "@/lib/format";
import type { SeriesStaleness } from "@/services/markets/types";

/** "5 weeks" or "4 months", the age of an overdue price in round units. */
export function describeStaleness(staleness: SeriesStaleness): string {
  const { days, cadence } = staleness;
  if (cadence === "weekly") {
    const weeks = Math.floor(days / 7);
    return `${weeks} week${weeks === 1 ? "" : "s"}`;
  }
  const months = Math.max(1, Math.floor(days / 30));
  return `${months} month${months === 1 ? "" : "s"}`;
}

/**
 * Why a price is overdue, in a sentence: the source still publishes, but
 * this series has had no new quotation for longer than its cadence
 * allows.
 */
export function stalenessNote(
  staleness: SeriesStaleness,
  latestDate: string,
): string {
  const source =
    staleness.cadence === "weekly"
      ? "The source publishes weekly"
      : "The source publishes monthly";
  return `No new price since ${formatDate(latestDate)}, ${describeStaleness(staleness)} ago. ${source}; this series has not been quoted since, so the price shown may no longer reflect the market.`;
}

/**
 * Small ochre tag beside the date of an overdue price. The full sentence
 * is in the tooltip and read out to assistive technology.
 */
export function StaleLabel({
  staleness,
  latestDate,
}: {
  staleness: SeriesStaleness;
  latestDate: string;
}) {
  return (
    <span
      title={stalenessNote(staleness, latestDate)}
      className="wt-label inline-flex items-center border border-ochre px-1.5 py-0.5 text-ochre-deep"
    >
      {describeStaleness(staleness)} old
      <span className="sr-only">. {stalenessNote(staleness, latestDate)}</span>
    </span>
  );
}
