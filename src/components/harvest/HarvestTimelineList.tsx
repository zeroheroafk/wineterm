import { formatDate } from "@/lib/format";
import type { HarvestTimelineEvent } from "@/services/harvest/types";

const KIND_LABELS: Record<HarvestTimelineEvent["kind"], string> = {
  start: "Start",
  weather: "Weather",
  estimate: "Estimate",
  progress: "Progress",
};

const KIND_STYLES: Record<HarvestTimelineEvent["kind"], string> = {
  start: "text-wine",
  weather: "text-ochre",
  estimate: "text-ink",
  progress: "text-ink-soft",
};

/** Dated campaign timeline, most recent first, on a single left rule. */
export function HarvestTimelineList({
  events,
}: {
  events: HarvestTimelineEvent[];
}) {
  return (
    <ol className="border-l-2 border-rule">
      {events.map((event) => (
        <li key={event.id} className="relative pb-5 pl-5 last:pb-0">
          <span
            aria-hidden="true"
            className="absolute top-1.5 -left-[5px] h-2 w-2 bg-wine"
          />
          <p className="wt-label flex flex-wrap items-center gap-x-2 text-ink-soft">
            <time dateTime={event.date} className="text-ink">
              {formatDate(event.date)}
            </time>
            <span aria-hidden="true" className="text-rule">
              &middot;
            </span>
            <span>{event.scope}</span>
            <span aria-hidden="true" className="text-rule">
              &middot;
            </span>
            <span className={KIND_STYLES[event.kind]}>
              {KIND_LABELS[event.kind]}
            </span>
          </p>
          <p className="mt-1 text-sm leading-relaxed text-ink">{event.text}</p>
        </li>
      ))}
    </ol>
  );
}
