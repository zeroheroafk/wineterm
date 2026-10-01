"use client";

import { useId, useSyncExternalStore } from "react";

import { InlineScript } from "@/components/ui/InlineScript";

/** Today's date in UTC as an ISO day, e.g. "2026-10-01". */
function utcDay(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Pages are prerendered at build time, so the server knows no current
 * date: its HTML carries an empty slot rather than a stale one.
 */
function prerenderedDay(): string {
  return "";
}

/** Check once a minute, so a page left open rolls over at midnight UTC. */
function subscribe(onChange: () => void): () => void {
  const timer = window.setInterval(onChange, 60_000);
  return () => window.clearInterval(timer);
}

/**
 * Today's date in UTC on statically prerendered pages, such as the edition
 * date in the header or the copyright year in the footer.
 *
 * An inline script fills the empty prerendered slot while the HTML is
 * parsed, so the date is there at first paint and nothing shifts;
 * suppressHydrationWarning lets React keep that DOM. After hydration the
 * store supplies the same day, also if the script was blocked, and moves
 * it on at midnight. `unit` sets the machine-readable dateTime: the full
 * day, or only the year.
 */
export function CurrentDate({
  options,
  unit = "day",
}: {
  options: Intl.DateTimeFormatOptions;
  unit?: "day" | "year";
}) {
  const id = useId();
  const day = useSyncExternalStore(subscribe, utcDay, prerenderedDay);
  const format = { ...options, timeZone: "UTC" };
  const isoLength = unit === "year" ? 4 : 10;

  // Always a string child, even when empty: React then treats the
  // script's text as a text-content difference, which
  // suppressHydrationWarning covers, rather than an unexpected node.
  return (
    <>
      <time
        id={id}
        dateTime={day ? day.slice(0, isoLength) : undefined}
        suppressHydrationWarning
      >
        {day
          ? new Intl.DateTimeFormat("en-GB", format).format(
              new Date(`${day}T00:00:00Z`),
            )
          : ""}
      </time>
      <InlineScript
        html={`(function(){var t=document.getElementById(${JSON.stringify(id)});if(!t)return;var d=new Date();t.dateTime=d.toISOString().slice(0,${isoLength});t.textContent=new Intl.DateTimeFormat("en-GB",${JSON.stringify(format)}).format(d)})()`}
      />
    </>
  );
}
