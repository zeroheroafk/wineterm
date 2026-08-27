"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { primaryNavigation } from "@/lib/navigation";

/**
 * Mobile navigation: a toggle button in the header row and a full-width
 * panel with per-section accordions. Closes on route change.
 */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const pathname = usePathname();

  // Close the panel when the route changes.
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setOpen(false);
    setExpanded(null);
  }

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="wt-mobile-nav"
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 items-center gap-2 border border-rule bg-paper px-3 text-sm font-medium text-ink"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 16 12"
          className="h-3 w-4 stroke-current"
          strokeWidth={1.5}
        >
          {open ? (
            <path d="M2 1l12 10M14 1L2 11" fill="none" />
          ) : (
            <path d="M0 1h16M0 6h16M0 11h16" fill="none" />
          )}
        </svg>
        Menu
      </button>

      {open ? (
        <nav
          id="wt-mobile-nav"
          aria-label="Primary"
          className="absolute inset-x-0 top-full z-40 max-h-[75vh] overflow-y-auto border-b-2 border-t border-b-wine border-t-rule bg-paper"
        >
          <ul className="divide-y divide-rule">
            {primaryNavigation.map((section) => {
              const isExpanded = expanded === section.label;
              const hasItems = section.items.length > 0;

              return (
                <li key={section.label}>
                  <div className="flex items-stretch">
                    <Link
                      href={section.href}
                      className="flex grow items-center gap-3 px-4 py-3 text-base font-medium text-ink"
                    >
                      <span className="wt-label w-9 text-ink-soft">
                        {section.code}
                      </span>
                      {section.label}
                    </Link>
                    {hasItems ? (
                      <button
                        type="button"
                        aria-expanded={isExpanded}
                        aria-label={`${isExpanded ? "Collapse" : "Expand"} ${section.label}`}
                        onClick={() =>
                          setExpanded((current) =>
                            current === section.label ? null : section.label,
                          )
                        }
                        className="flex w-12 items-center justify-center border-l border-rule text-ink-soft"
                      >
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 8 6"
                          className={`h-1.5 w-2 fill-current transition-transform ${isExpanded ? "rotate-180" : ""}`}
                        >
                          <path d="M0 0h8L4 6Z" />
                        </svg>
                      </button>
                    ) : null}
                  </div>
                  {hasItems && isExpanded ? (
                    <ul className="border-t border-rule bg-ground/60 py-1">
                      {section.items.map((item) => (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            className="block py-2 pl-16 pr-4 text-sm text-ink hover:text-wine-deep"
                          >
                            {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              );
            })}
          </ul>
          <div className="border-t border-rule px-4 py-4">
            <Link
              href="/briefing"
              className="block bg-wine px-4 py-2.5 text-center text-sm font-medium text-paper hover:bg-wine-deep"
            >
              Get the briefing
            </Link>
          </div>
        </nav>
      ) : null}
    </div>
  );
}
