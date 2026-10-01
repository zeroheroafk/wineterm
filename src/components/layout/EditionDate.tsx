"use client";

import { useId, useSyncExternalStore } from "react";

import { InlineScript } from "@/components/ui/InlineScript";

const EDITION_FORMAT: Intl.DateTimeFormatOptions = {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
};

/** Today's date in UTC as an ISO day, e.g. "2026-10-01". */
function utcDay(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Pages are prerendered at build time, so the server knows no current
 * date: its HTML carries an empty slot rather than a stale day.
 */
function prerenderedDay(): string {
  return "";
}

/** Check once a minute, so a page left open rolls over at midnight UTC. */
function subscribe(onChange: () => void): () => void {
  const timer = window.setInterval(onChange, 60_000);
  return () => window.clearInterval(timer);
}

function formatDay(day: string): string {
  return new Intl.DateTimeFormat("en-GB", EDITION_FORMAT).format(
    new Date(`${day}T00:00:00Z`),
  );
}

/**
 * The edition date in the utility strip, always the reader's current UTC
 * day. An inline script fills the empty prerendered slot while the HTML
 * is parsed, so the date is there at first paint and nothing shifts;
 * suppressHydrationWarning lets React keep that DOM. After hydration the
 * store supplies the same day, also if the script was blocked, and moves
 * it on at midnight.
 */
export function EditionDate() {
  const id = useId();
  const day = useSyncExternalStore(subscribe, utcDay, prerenderedDay);

  // Always a string child, even when empty: React then treats the
  // script's text as a text-content difference, which
  // suppressHydrationWarning covers, rather than an unexpected node.
  return (
    <>
      <time id={id} dateTime={day || undefined} suppressHydrationWarning>
        {day ? formatDay(day) : ""}
      </time>
      <InlineScript
        html={`(function(){var t=document.getElementById(${JSON.stringify(id)});if(!t)return;var d=new Date();t.dateTime=d.toISOString().slice(0,10);t.textContent=new Intl.DateTimeFormat("en-GB",${JSON.stringify(EDITION_FORMAT)}).format(d)})()`}
      />
    </>
  );
}
