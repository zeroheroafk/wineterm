import Link from "next/link";
import type { ReactNode } from "react";

import { ArrowLink } from "@/components/ui/ArrowLink";

/**
 * Section header in two treatments.
 *
 * "bulletin" (default): a heavy rule over a thin rule, a small monospace
 * kicker, an editorial serif title and an optional action link.
 *
 * "editorial": a single fine rule, a sans kicker, the serif title and a
 * descriptive link sharing the title's baseline. Used where hierarchy
 * should come from type and spacing rather than stacked rules.
 */
export function SectionHeader({
  kicker,
  title,
  description,
  action,
  id,
  variant = "bulletin",
}: {
  kicker?: string;
  title: string;
  description?: string;
  action?: { label: string; href: string };
  /** Id for the title, so a section can reference it with aria-labelledby. */
  id?: string;
  variant?: "bulletin" | "editorial";
}) {
  if (variant === "editorial") {
    return (
      <header className="border-t border-ink pt-3">
        {kicker ? <p className="wt-kicker text-wine">{kicker}</p> : null}
        <div className="mt-1 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <h2
            id={id}
            className="wt-headline text-[1.625rem] leading-tight font-semibold text-balance text-ink sm:text-[1.75rem]"
          >
            {title}
          </h2>
          {action ? (
            <ArrowLink href={action.href}>{action.label}</ArrowLink>
          ) : null}
        </div>
        {description ? (
          <p className="mt-1.5 max-w-2xl text-base leading-[1.55] text-pretty text-ink-soft">
            {description}
          </p>
        ) : null}
      </header>
    );
  }

  return (
    <header className="border-t-2 border-ink">
      <div className="border-t border-rule pt-3">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <div>
            {kicker ? <p className="wt-label text-wine">{kicker}</p> : null}
            <h2 id={id} className="wt-headline mt-1 text-2xl font-semibold text-ink">
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
    <header className="relative border-b-2 border-ink pb-7 pt-2">
      <span
        aria-hidden="true"
        className="absolute bottom-[-2px] left-0 h-0.5 w-20 bg-wine"
      />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(18rem,0.75fr)] lg:items-end lg:gap-12">
        <div>
          {kicker ? (
            <p className="wt-label flex items-center gap-3 text-wine">
              <span className="h-px w-6 bg-wine" aria-hidden="true" />
              {kicker}
            </p>
          ) : null}
          <h1 className="wt-headline mt-3 max-w-3xl text-4xl font-semibold leading-[1.02] tracking-[-0.025em] text-ink sm:text-5xl lg:text-[3.5rem]">
            {title}
          </h1>
        </div>
        {description ? (
          <p className="border-l border-wine pl-4 text-sm leading-relaxed text-ink-soft sm:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {children ? <div className="mt-5">{children}</div> : null}
    </header>
  );
}
