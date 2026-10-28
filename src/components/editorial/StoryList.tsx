import { formatDate } from "@/lib/format";
import {
  INDUSTRY_TOPIC_LABELS,
  type IndustryStory,
} from "@/services/types";

/**
 * Industry story list: dated rows with kicker, headline and summary,
 * separated by rules, each closed by a link to the report it summarises.
 * Rows carry their story's id, so a headline elsewhere can link to them.
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
  if (stories.length === 0) {
    return <p className="text-sm text-ink-soft">No stories published here yet.</p>;
  }

  return (
    <div>
      {stories.map((story) => (
        <article
          key={story.id}
          id={story.id}
          className="scroll-mt-6 border-t border-rule py-4 first:border-t-0 first:pt-0"
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
          <p className="wt-label mt-2 text-ink-soft">
            <time dateTime={story.publishedAt}>
              {formatDate(story.publishedAt)}
            </time>
            <span aria-hidden="true" className="mx-1.5 text-rule">
              &middot;
            </span>
            <a
              href={story.source.url}
              className="text-wine underline decoration-rule underline-offset-2 hover:text-wine-deep"
            >
              {story.source.name}
            </a>
          </p>
        </article>
      ))}
    </div>
  );
}
