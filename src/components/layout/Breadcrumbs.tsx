import Link from "next/link";

import type { BreadcrumbItem } from "@/lib/navigation";

/** Monospace breadcrumb trail used at the top of every inner page. */
export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="py-3">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <li className="flex items-center gap-2">
          <Link href="/" className="wt-label text-ink-soft hover:text-wine">
            WineTerm
          </Link>
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              <span aria-hidden="true" className="wt-label text-rule">
                /
              </span>
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="wt-label text-ink-soft hover:text-wine"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className="wt-label text-wine"
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
