import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Bulletin-style section header: a heavy rule over a thin rule, a small
 * monospace kicker, an editorial serif title and an optional action link.
 */
export function SectionHeader({
  kicker,
  title,
  description,
  action,
}: {
  kicker?: string;
  title: string;
  description?: string;
  action?: { label: string; href: string };
}) {
  return (
    <header className="border-t-2 border-ink">
      <div className="border-t border-rule pt-3">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <div>
            {kicker ? <p className="wt-label text-wine">{kicker}</p> : null}
            <h2 className="wt-headline mt-1 text-2xl font-semibold text-ink">
              {title}
            </h2>
          </div>
          {action ? (
            <Link
              href={action.href}
              className="wt-label text-ink-soft transition-colors hover:text-wine"
            >
              {action.label} &rarr;
            </Link>
          ) : null}
        </div>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
            {description}
          </p>
        ) : null}
      </div>
    </header>
  );
}

/** Page-level variant with the serif display size, used at the top of routes. */
export function PageHeader({
  kicker,
  title,
  description,
  children,
}: {
  kicker?: string;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <header className="border-b border-rule pb-6">
      {kicker ? <p className="wt-label text-wine">{kicker}</p> : null}
      <h1 className="wt-headline mt-2 text-4xl font-semibold text-ink sm:text-5xl">
        {title}
      </h1>
      {description ? (
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink-soft">
          {description}
        </p>
      ) : null}
      {children}
    </header>
  );
}
