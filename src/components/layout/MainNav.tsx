"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { primaryNavigation } from "@/lib/navigation";

const ITEM_BASE =
  "flex h-11 items-center gap-1.5 border-b-2 px-3 text-[0.9375rem] font-medium transition-colors";

/** Current section: solid burgundy rule. */
const ITEM_CURRENT = "border-wine text-wine-deep";
/** Open panel or pointer hover: a lighter rule in the same colour. */
const ITEM_OPEN = "border-wine/40 text-wine-deep";
const ITEM_IDLE =
  "border-transparent text-ink hover:border-wine/40 hover:text-wine-deep";

/**
 * Desktop primary navigation with dropdown panels.
 *
 * Buttons toggle on click, panels also open on hover, and everything
 * closes on Escape, outside click or route change.
 */
export function MainNav() {
  const [open, setOpen] = useState<string | null>(null);
  const pathname = usePathname();
  const rootRef = useRef<HTMLElement>(null);

  // Close any open panel when the route changes.
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setOpen(null);
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(null);
    }
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(null);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, []);

  return (
    <nav
      ref={rootRef}
      aria-label="Primary"
      className="hidden border-t border-rule lg:block"
    >
      <ul className="-mx-3 flex items-stretch">
        {primaryNavigation.map((section) => {
          const active = pathname.startsWith(section.href);
          const expanded = open === section.label;
          const hasItems = section.items.length > 0;

          return (
            <li
              key={section.label}
              className="relative"
              onMouseEnter={() => hasItems && setOpen(section.label)}
              onMouseLeave={() =>
                setOpen((current) =>
                  current === section.label ? null : current,
                )
              }
            >
              {hasItems ? (
                <button
                  type="button"
                  aria-expanded={expanded}
                  aria-current={active ? "true" : undefined}
                  onClick={() =>
                    setOpen((current) =>
                      current === section.label ? null : section.label,
                    )
                  }
                  className={`${ITEM_BASE} ${
                    active ? ITEM_CURRENT : expanded ? ITEM_OPEN : ITEM_IDLE
                  }`}
                >
                  {section.label}
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 8 6"
                    className={`h-1.5 w-2 fill-current transition-transform ${expanded ? "rotate-180" : ""}`}
                  >
                    <path d="M0 0h8L4 6Z" />
                  </svg>
                </button>
              ) : (
                <Link
                  href={section.href}
                  aria-current={active ? "page" : undefined}
                  className={`${ITEM_BASE} ${active ? ITEM_CURRENT : ITEM_IDLE}`}
                >
                  {section.label}
                </Link>
              )}

              {hasItems && expanded ? (
                <div className="absolute left-0 top-full z-40 w-80 border border-rule border-t-2 border-t-wine bg-paper">
                  <div className="border-b border-rule px-4 py-2.5">
                    <Link
                      href={section.href}
                      className="text-sm font-semibold text-wine underline-offset-4 hover:text-wine-deep hover:underline"
                    >
                      {section.label} overview{" "}
                      <span aria-hidden="true">&rarr;</span>
                    </Link>
                  </div>
                  <ul className="py-1.5">
                    {section.items.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className="block px-4 py-2 hover:bg-ground"
                        >
                          <span className="block text-sm font-medium text-ink">
                            {item.label}
                          </span>
                          {item.description ? (
                            <span className="mt-0.5 block text-xs leading-snug text-ink-soft">
                              {item.description}
                            </span>
                          ) : null}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
