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
        Source:{" "}
        {source.url ? (
          <a
            href={source.url}
            className="underline decoration-rule underline-offset-2 hover:text-wine"
          >
            {source.name}
          </a>
        ) : (
          source.name
        )}
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
