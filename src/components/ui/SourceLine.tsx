import type { ReactNode } from "react";

import { formatDateTime } from "@/lib/format";
import type { DataSource } from "@/services/types";

/** "Updated 21 Aug 2026, 09:30 UTC" in the monospace meta style. */
export function UpdatedAt({ iso }: { iso: string }) {
  return (
    <time dateTime={iso} className="wt-label text-ink-soft">
      Updated {formatDateTime(iso)}
    </time>
  );
}

function SourceName({ source }: { source: DataSource }) {
  return source.url ? (
    <a
      href={source.url}
      className="underline decoration-rule underline-offset-2 hover:text-wine"
    >
      {source.name}
    </a>
  ) : (
    <>{source.name}</>
  );
}

/**
 * Source attribution line shown under every table and chart, optionally
 * combined with the last-updated timestamp.
 */
export function SourceLine({
  source,
  updatedAt,
}: {
  source: DataSource;
  updatedAt?: string;
}) {
  return (
    <p className="wt-label flex flex-wrap items-center gap-x-3 gap-y-1 text-ink-soft">
      <span>
        Source: <SourceName source={source} />
      </span>
      {updatedAt ? (
        <>
          <span aria-hidden="true" className="text-rule">
            &middot;
          </span>
          <UpdatedAt iso={updatedAt} />
        </>
      ) : null}
    </p>
  );
}

/**
 * Sentence-case data note for editorial layouts: an optional lead (such as
 * a sample-data disclosure, set in the primary ink so it cannot be
 * missed), optional further text, then the source and the update time.
 */
export function DataNote({
  lead,
  children,
  source,
  updatedAt,
  className = "",
}: {
  lead?: ReactNode;
  children?: ReactNode;
  source?: DataSource;
  updatedAt?: string;
  className?: string;
}) {
  return (
    <p
      className={`text-[0.8125rem] leading-relaxed text-pretty text-ink-soft ${className}`}
    >
      {lead ? <span className="font-medium text-ink">{lead} </span> : null}
      {children ? <>{children} </> : null}
      {source ? (
        <>
          Source: <SourceName source={source} />.{" "}
        </>
      ) : null}
      {updatedAt ? (
        <time dateTime={updatedAt}>Updated {formatDateTime(updatedAt)}.</time>
      ) : null}
    </p>
  );
}
