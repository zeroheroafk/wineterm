import { formatDate } from "@/lib/format";
import {
  INDUSTRY_TOPIC_LABELS,
  type IndustryStory,
} from "@/services/types";

/**
 * Industry story list: dated rows with kicker, headline and summary,
 * separated by rules. Stories have no detail pages yet, so rows are
 * plain entries rather than links.
 */
export function StoryList({
  stories,
  withTopic = false,
  headingLevel = 3,
}: {
  stories: IndustryStory[];
  withTopic?: boolean;
  /** 3 (default) under a section heading; 2 directly under the page title. */
  headingLevel?: 2 | 3;
}) {
  const Headline = headingLevel === 2 ? "h2" : "h3";

  return (
    <div>
      {stories.map((story) => (
        <article
          key={story.id}
          className="border-t border-rule py-4 first:border-t-0 first:pt-0"
        >
          {withTopic ? (
            <p className="wt-label text-wine">
              {INDUSTRY_TOPIC_LABELS[story.topic]}
            </p>
          ) : null}
          <Headline className="wt-headline mt-1.5 text-xl leading-snug font-semibold text-ink">
            {story.headline}
          </Headline>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink-soft">
            {story.summary}
          </p>
          <time
            dateTime={story.publishedAt}
            className="wt-label mt-2 block text-ink-soft"
          >
            {formatDate(story.publishedAt)}
          </time>
        </article>
      ))}
    </div>
  );
}
