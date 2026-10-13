import Link from "next/link";

import type { NavSection } from "@/lib/navigation";

/**
 * Secondary navigation for one primary section, rendered as a bordered
 * rail under the page title. The active child is marked by the caller.
 */
export function SectionNav({
  section,
  activeHref,
}: {
  section: NavSection;
  activeHref?: string;
}) {
  return (
    <nav
      aria-label={`${section.label} sections`}
      className="border-y border-rule bg-paper"
    >
      <div className="flex items-center gap-1 overflow-x-auto">
        {!section.items.some((item) => item.href === section.href) ? (
          <Link href={section.href} aria-current={activeHref === section.href ? "page" : undefined}
            className={`shrink-0 border-b-2 px-3 py-3 text-sm ${activeHref === section.href ? "border-wine font-medium text-wine-deep" : "border-transparent text-ink-soft hover:text-ink"}`}>
            Overview
          </Link>
        ) : null}
        {section.items.map((item) => {
          const active = item.href === activeHref;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`shrink-0 border-b-2 px-3 py-2.5 text-sm whitespace-nowrap ${
                active
                  ? "border-wine font-medium text-wine-deep"
                  : "border-transparent text-ink-soft hover:text-ink"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
