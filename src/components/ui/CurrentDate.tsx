"use client";

const LOCALE = "en-GB";

/**
 * Formats with fixed punctuation ("Friday, 25 September 2026"): engines
 * ship different CLDR versions and disagree on the comma after the
 * weekday. The inline script below repeats this logic; keep them in step.
 */
function formatDate(date: Date, options: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(LOCALE, options)
    .formatToParts(date)
    .filter((part) => part.type !== "literal")
    .map((part) => (part.type === "weekday" ? `${part.value},` : part.value))
    .join(" ");
}

/** Calendar day as YYYY-MM-DD, for the machine-readable dateTime. */
function isoDay(date: Date, utc: boolean): string {
  const year = utc ? date.getUTCFullYear() : date.getFullYear();
  const month = utc ? date.getUTCMonth() : date.getMonth();
  const day = utc ? date.getUTCDate() : date.getDate();
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/**
 * Script that runs once, while the HTML is parsed. On the client it is
 * inert text, which also keeps React from warning about script tags.
 */
function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/**
 * Today's date on a prerendered page. Static HTML freezes whatever the
 * server computed at build time, so the server value is only a fallback:
 * on a full page load the inline script rewrites it in the reader's time
 * zone before first paint, and on client navigations the component
 * renders the date in the browser. suppressHydrationWarning lets React
 * keep the corrected DOM instead of the prerendered text.
 */
export function CurrentDate({
  id,
  options,
  className,
}: {
  /** Unique DOM id the inline script targets. */
  id: string;
  options: Intl.DateTimeFormatOptions;
  className?: string;
}) {
  const onServer = typeof window === "undefined";
  const now = new Date();

  return (
    <>
      <time
        id={id}
        dateTime={isoDay(now, onServer)}
        className={className}
        suppressHydrationWarning
      >
        {formatDate(now, onServer ? { ...options, timeZone: "UTC" } : options)}
      </time>
      <InlineScript
        html={`(function(){var n=document.getElementById(${JSON.stringify(id)});if(!n)return;var d=new Date();function p(v){return String(v).padStart(2,"0")}n.textContent=new Intl.DateTimeFormat(${JSON.stringify(LOCALE)},${JSON.stringify(options)}).formatToParts(d).filter(function(x){return x.type!=="literal"}).map(function(x){return x.type==="weekday"?x.value+",":x.value}).join(" ");n.setAttribute("datetime",d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate()))})()`}
      />
    </>
  );
}
