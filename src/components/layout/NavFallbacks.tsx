import Link from "next/link";

import { menuNavigation } from "@/lib/navigation";

/**
 * The navigation reads the pathname to mark the current section, which
 * suspends while the static shell of a route with dynamic params is
 * prerendered. Until it renders, the same links stand in without a
 * current mark or dropdown panels.
 */
export function MainNavFallback() {
  return (
    <nav
      aria-label="Primary"
      className="hidden border-t border-rule lg:block"
    >
      <ul className="-mx-3 flex items-stretch">
        {menuNavigation.map((section) => (
          <li key={section.label}>
            <Link
              href={section.href}
              className="flex h-11 items-center gap-1.5 border-b-2 border-transparent px-3 text-[0.9375rem] font-medium text-ink hover:border-wine/40 hover:text-wine-deep"
            >
              {section.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** The mobile menu button's outline, so the header row keeps its height. */
export function MobileNavFallback() {
  return (
    <div className="lg:hidden">
      <span className="flex h-9 items-center gap-2 border border-rule bg-paper px-3 text-sm font-medium text-ink">
        Menu
      </span>
    </div>
  );
}
