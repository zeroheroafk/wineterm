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
        <span className="wt-label shrink-0 border-r border-rule px-3 py-2.5 text-wine">
          {section.code}
        </span>
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
