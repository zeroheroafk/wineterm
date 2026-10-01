import { Fragment, type ReactNode } from "react";

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

function asList(source: DataSource | DataSource[] | undefined): DataSource[] {
  if (!source) return [];
  return Array.isArray(source) ? source : [source];
}

/** "Source: A" or "Sources: A; B", each linked when it has an address. */
function SourceNames({ sources }: { sources: DataSource[] }) {
  return (
    <>
      {sources.length > 1 ? "Sources: " : "Source: "}
      {sources.map((item, index) => (
        <span key={item.name}>
          {index > 0 ? "; " : null}
          <SourceName source={item} />
        </span>
      ))}
    </>
  );
}

/**
 * Source attribution line shown under every table and chart, optionally
 * combined with the last-updated timestamp. A table that mixes sources
 * names each of them, and each source's caveat follows the line.
 */
export function SourceLine({
  source,
  updatedAt,
}: {
  source: DataSource | DataSource[];
  updatedAt?: string;
}) {
  const sources = asList(source);
  const noted = sources.filter((item) => item.note);
  return (
    <>
      <p className="wt-label flex flex-wrap items-center gap-x-3 gap-y-1 text-ink-soft">
        <span>
          <SourceNames sources={sources} />
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
      {noted.map((item) => (
        <p key={item.name} className="mt-1 text-xs leading-relaxed text-ink-soft">
          {item.note}
        </p>
      ))}
    </>
  );
}

/**
 * Sentence-case data note for editorial layouts: an optional lead (such as
 * a sample-data disclosure, set in the primary ink so it cannot be
 * missed), optional further text, the sources with their caveats, the
 * update time and an optional closing link.
 */
export function DataNote({
  lead,
  children,
  source,
  updatedAt,
  action,
  className = "",
}: {
  lead?: ReactNode;
  children?: ReactNode;
  source?: DataSource | DataSource[];
  updatedAt?: string;
  /** A link set after the note, such as the methodology. */
  action?: ReactNode;
  className?: string;
}) {
  const sources = asList(source);
  return (
    <p
      className={`text-[0.8125rem] leading-relaxed text-pretty text-ink-soft ${className}`}
    >
      {lead ? <span className="font-medium text-ink">{lead} </span> : null}
      {children ? <>{children} </> : null}
      {sources.length > 0 ? (
        <>
          <SourceNames sources={sources} />.{" "}
          {sources
            .filter((item) => item.note)
            .map((item) => (
              <Fragment key={item.name}>{item.note} </Fragment>
            ))}
        </>
      ) : null}
      {updatedAt ? (
        <time dateTime={updatedAt}>Updated {formatDateTime(updatedAt)}.</time>
      ) : null}
      {action ? <> {action}</> : null}
    </p>
  );
}
