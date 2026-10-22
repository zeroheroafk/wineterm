import Link from "next/link";

import { NewsletterSignup } from "@/components/editorial/NewsletterSignup";
import { StoryList } from "@/components/editorial/StoryList";
import {
  INDUSTRY_TOPIC_LABELS,
  type IndustryStory,
  type IndustryTopic,
} from "@/services/types";

export const NEWS_TOPICS = Object.keys(INDUSTRY_TOPIC_LABELS) as IndustryTopic[];

/**
 * The body of the News pages: the topic filters, every story or one
 * topic's, and the newsletter signup beside them. A filter is a page of
 * its own, /insights/news/<topic>, so each topic can be linked.
 */
export function NewsStories({
  stories,
  topic,
}: {
  stories: IndustryStory[];
  /** The topic shown, or none for every story. */
  topic?: IndustryTopic;
}) {
  const filters = [
    { href: "/insights/news", label: "All", active: !topic },
    ...NEWS_TOPICS.map((key) => ({
      href: `/insights/news/${key}`,
      label: INDUSTRY_TOPIC_LABELS[key],
      active: key === topic,
    })),
  ];

  return (
    <>
      <nav aria-label="News topics" className="mt-6">
        <ul className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <li key={filter.href}>
              <Link
                href={filter.href}
                aria-current={filter.active ? "page" : undefined}
                className={`block border px-3 py-1.5 text-sm whitespace-nowrap ${
                  filter.active
                    ? "border-wine bg-paper font-medium text-wine-deep"
                    : "border-rule text-ink-soft hover:border-ink-soft hover:text-ink"
                }`}
              >
                {filter.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <div>
          <StoryList stories={stories} withTopic={!topic} headingLevel={2} />
          <p className="wt-label mt-8 leading-relaxed text-ink-soft">
            Each story is WineTerm&apos;s summary of a report published
            elsewhere, linked to its source. For the market figures behind
            them, see the{" "}
            <Link
              href="/insights/monthly-reports"
              className="text-wine underline decoration-rule underline-offset-2 hover:text-wine-deep"
            >
              monthly reports
            </Link>
            .
          </p>
        </div>
        <aside>
          <NewsletterSignup />
        </aside>
      </div>
    </>
  );
}
