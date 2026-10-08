import Link from "next/link";

import { ArrowLink } from "@/components/ui/ArrowLink";
import { formatDate } from "@/lib/format";
import type { IndustryItem } from "@/services/types";

/**
 * Compact dated headline list for the industry rail: one selective list
 * with the topic and date under each headline, closed by a descriptive
 * link to the full section. Plainer than ArticlePreview so the rail
 * reads as a digest, not cards.
 */
export function IndustryHeadlineList({
  title,
  titleId,
  items,
  action,
}: {
  title: string;
  titleId: string;
  items: IndustryItem[];
  action: { label: string; href: string };
}) {
  return (
    <div>
      <h3 id={titleId} className="wt-kicker text-wine">
        {title}
      </h3>
      <ul className="mt-2">
        {items.map((item) => (
          <li
            key={item.id}
            className="border-t border-rule py-3 first:border-t-0 first:pt-1"
          >
            <Link href={item.href} className="group block">
              <span className="wt-headline block text-[1.125rem] leading-[1.3] font-semibold text-balance text-ink underline-offset-4 group-hover:text-wine-deep group-hover:underline">
                {item.headline}
              </span>
              <span className="mt-1 block text-[0.8125rem] text-ink-soft">
                {item.topic}
                <span aria-hidden="true" className="mx-1.5">
                  &middot;
                </span>
                <time dateTime={item.publishedAt}>
                  {formatDate(item.publishedAt)}
                </time>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-2 border-t border-rule pt-3">
        <ArrowLink href={action.href}>{action.label}</ArrowLink>
      </div>
    </div>
  );
}
