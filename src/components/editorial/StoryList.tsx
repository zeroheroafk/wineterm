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
}: {
  stories: IndustryStory[];
  withTopic?: boolean;
}) {
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
          <h3 className="wt-headline mt-1.5 text-xl leading-snug font-semibold text-ink">
            {story.headline}
          </h3>
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
