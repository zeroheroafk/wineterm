import Link from "next/link";

import { JsonLd } from "@/components/ui/JsonLd";
import type { BreadcrumbItem } from "@/lib/navigation";
import { absoluteUrl } from "@/lib/seo";

/**
 * The trail as BreadcrumbList structured data, which search results show
 * in place of the address. Every crumb but the current page needs an
 * address, so a crumb without a link before it is left out.
 */
function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  const crumbs = [
    { label: "WineTerm", href: "/" },
    ...items.filter((item, index) => item.href || index === items.length - 1),
  ];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.label,
      ...(crumb.href ? { item: absoluteUrl(crumb.href) } : {}),
    })),
  };
}

/**
 * Monospace breadcrumb trail used at the top of every inner page. A page
 * showing a second trail, such as an example, gives it its own label so
 * the two navigation landmarks stay distinguishable, and only the page's
 * own trail is given to search engines.
 */
export function Breadcrumbs({
  items,
  label = "Breadcrumb",
}: {
  items: BreadcrumbItem[];
  label?: string;
}) {
  return (
    <nav aria-label={label} className="py-3">
      {label === "Breadcrumb" ? <JsonLd data={breadcrumbJsonLd(items)} /> : null}
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
