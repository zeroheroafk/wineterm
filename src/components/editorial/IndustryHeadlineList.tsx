import Link from "next/link";

import { formatDate } from "@/lib/format";
import type { IndustryItem } from "@/services/types";

/**
 * Compact dated headline list for the industry rail: a labelled group of
 * two or three stories with a link to the full section. Deliberately
 * plainer than ArticlePreview so the rail reads as a digest, not cards.
 */
export function IndustryHeadlineList({
  title,
  href,
  items,
}: {
  title: string;
  href: string;
  items: IndustryItem[];
}) {
  return (
    <section>
      <div className="flex items-baseline justify-between gap-4 border-b-2 border-ink pb-1.5">
        <h3 className="wt-label text-wine">{title}</h3>
        <Link
          href={href}
          className="wt-label text-ink-soft transition-colors hover:text-wine"
        >
          All &rarr;
        </Link>
      </div>
      <ul>
        {items.map((item) => (
          <li key={item.id} className="border-b border-rule py-2.5 last:border-b-0">
            <Link href={item.href} className="group block">
              <p className="text-sm leading-snug font-medium text-ink group-hover:text-wine-deep">
                {item.headline}
              </p>
              <time
                dateTime={item.publishedAt}
                className="wt-label mt-1 block text-ink-soft"
              >
                {formatDate(item.publishedAt)}
              </time>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
