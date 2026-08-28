import type { ReactNode } from "react";

/**
 * Collapsible methodology block. Secondary by design: collapsed by
 * default so tables lead, but always present and one tap away, on
 * mobile and desktop alike.
 */
export function MethodologyNotes({
  title = "Methodology and reporting differences",
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <details className="group border border-rule bg-paper">
      <summary className="flex cursor-pointer items-center justify-between gap-3 px-4 py-3 marker:content-none">
        <span className="wt-label text-wine">{title}</span>
        <svg
          aria-hidden="true"
          viewBox="0 0 8 6"
          className="h-1.5 w-2 fill-ink-soft transition-transform group-open:rotate-180"
        >
          <path d="M0 0h8L4 6Z" />
        </svg>
      </summary>
      <div className="border-t border-rule px-4 py-3 text-sm leading-relaxed text-ink-soft">
        {children}
      </div>
    </details>
  );
}
