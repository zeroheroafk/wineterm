"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isNavigationActive, primaryNavigation } from "@/lib/navigation";

/** A single compact publication rail; sub-navigation lives on section pages. */
export function MainNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Primary" className="hidden xl:block">
      <ul className="flex items-center gap-5">
        {primaryNavigation.map((section) => (
          <li key={section.href}>
            <Link href={section.href}
              aria-current={isNavigationActive(section, pathname) ? "page" : undefined}
              className={`inline-flex min-h-11 items-center text-[0.6875rem] font-semibold uppercase tracking-[0.025em] transition-colors hover:text-wine ${isNavigationActive(section, pathname) ? "text-wine" : "text-ink-soft"}`}>
              {section.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
