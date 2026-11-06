import Image from "next/image";
import Link from "next/link";

import { formatDate } from "@/lib/format";
import {
  NEWS_TOPIC_LABELS,
  NEWS_TOPICS,
  type NewsStory,
  type NewsTopic,
} from "@/services/types";

/** The notice every page listing the sample stories shows once. */
export const NEWS_DEV_NOTICE =
  "Development content: these stories are illustrative placeholders demonstrating the news format, not published reporting. The photographs are real and credited on each story.";

/** Topic page address, e.g. "/news/topic/brands". */
export function topicHref(topic: NewsTopic): string {
  return `/news/topic/${topic}`;
}

/**
 * A story's tags: small outlined chips, each linking to its topic. The
 * one rounded shape on the site, as the tokens reserve the radius for
 * tags.
 */
export function TopicTags({
  topics,
  className = "",
}: {
  topics: NewsTopic[];
  className?: string;
}) {
  return (
    <ul aria-label="Topics" className={`flex flex-wrap gap-1.5 ${className}`}>
      {topics.map((topic) => (
        <li key={topic}>
          <Link
            href={topicHref(topic)}
            className="inline-flex items-center rounded-hairline border border-wine/35 bg-paper px-2 py-0.5 text-[0.8125rem] leading-5 text-wine transition-colors hover:border-wine hover:bg-wine-wash hover:text-wine-deep"
          >
            {NEWS_TOPIC_LABELS[topic]}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function StoryDate({
  story,
  className = "",
}: {
  story: NewsStory;
  className?: string;
}) {
  return (
    <time
      dateTime={story.publishedAt}
      className={`tnum font-mono text-xs font-medium whitespace-nowrap text-wine ${className}`}
    >
      {formatDate(story.publishedAt)}
    </time>
  );
}

/**
 * The story's photograph as a link to the story. The headline carries the
 * same link for keyboard and screen reader users, so this one is taken
 * out of the tab order and the accessibility tree.
 */
function StoryImageLink({
  story,
  sizes,
  priority = false,
  className = "",
}: {
  story: NewsStory;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={story.href}
      tabIndex={-1}
      aria-hidden="true"
      className={`relative block aspect-[3/2] overflow-hidden bg-wine-wash ${className}`}
    >
      <Image
        src={story.image.src}
        alt=""
        fill
        sizes={sizes}
        loading={priority ? "eager" : undefined}
        fetchPriority={priority ? "high" : undefined}
        className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
      />
    </Link>
  );
}

/**
 * The top story: its photograph large beside the headline on wide
 * screens, above it on narrow ones.
 */
export function NewsLead({
  story,
  headingLevel = 2,
}: {
  story: NewsStory;
  headingLevel?: 2 | 3;
}) {
  const Headline = headingLevel === 2 ? "h2" : "h3";
  const [mainTopic] = story.topics;

  return (
    <article className="group grid grid-cols-1 gap-5 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] md:gap-8 lg:gap-10">
      <StoryImageLink
        story={story}
        priority
        sizes="(min-width: 1280px) 700px, (min-width: 768px) 56vw, 100vw"
      />
      <div className="md:pt-1">
        <p className="wt-kicker text-wine">
          <Link href={topicHref(mainTopic)} className="hover:text-wine-deep">
            {NEWS_TOPIC_LABELS[mainTopic]}
          </Link>
        </p>
        <Headline className="wt-headline mt-2 text-[1.875rem] leading-[1.1] font-semibold text-balance text-ink sm:text-[2.25rem]">
          <Link
            href={story.href}
            className="decoration-2 underline-offset-4 group-hover:text-wine-deep hover:underline"
          >
            {story.headline}
          </Link>
        </Headline>
        <p className="mt-3 text-[1.0625rem] leading-[1.6] text-pretty text-ink-soft">
          {story.standfirst}
        </p>
        <StoryDate story={story} className="mt-4 block" />
        <TopicTags topics={story.topics} className="mt-3" />
      </div>
    </article>
  );
}

/**
 * Stacked news rows: a small photograph beside the headline and
 * standfirst, with the tags and the date beneath, rows separated by
 * rules. On phones the standfirst and tags run the full width under the
 * photograph and headline.
 */
export function NewsList({
  stories,
  headingLevel = 3,
}: {
  stories: NewsStory[];
  /** 3 (default) under a section heading; 2 directly under the page title. */
  headingLevel?: 2 | 3;
}) {
  const Headline = headingLevel === 2 ? "h2" : "h3";

  return (
    <div>
      {stories.map((story) => (
        <article
          key={story.id}
          className="group grid grid-cols-[5.5rem_minmax(0,1fr)] gap-x-4 gap-y-2 border-t border-rule py-5 first:border-t-0 first:pt-0 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-x-5 lg:grid-cols-[11rem_minmax(0,1fr)]"
        >
          <StoryImageLink
            story={story}
            sizes="(min-width: 1024px) 176px, (min-width: 640px) 160px, 88px"
            className="self-start sm:row-span-3"
          />
          <Headline className="wt-headline self-center text-[1.125rem] leading-[1.25] font-semibold text-balance text-wine sm:self-start sm:text-[1.3125rem]">
            <Link
              href={story.href}
              className="underline-offset-4 group-hover:text-wine-deep hover:underline"
            >
              {story.headline}
            </Link>
          </Headline>
          <p className="col-span-2 text-[0.9375rem] leading-[1.55] text-pretty text-ink sm:col-span-1 sm:col-start-2">
            {story.standfirst}
          </p>
          <div className="col-span-2 flex flex-wrap items-center gap-x-4 gap-y-2 sm:col-span-1 sm:col-start-2">
            <TopicTags topics={story.topics} />
            <StoryDate story={story} className="ml-auto" />
          </div>
        </article>
      ))}
    </div>
  );
}

/**
 * Every news topic with its number of stories, linking to the topic
 * pages; topics without stories yet are left out.
 */
export function TopicIndex({
  counts,
  title = "Topics",
  titleId,
  activeTopic,
}: {
  counts: Record<NewsTopic, number>;
  title?: string;
  titleId: string;
  activeTopic?: NewsTopic;
}) {
  const topics = NEWS_TOPICS.filter((topic) => counts[topic] > 0);

  return (
    <nav aria-labelledby={titleId}>
      <h2 id={titleId} className="wt-kicker border-b border-ink pb-2 text-wine">
        {title}
      </h2>
      <ul>
        {topics.map((topic) => {
          const active = topic === activeTopic;
          return (
            <li key={topic} className="border-b border-rule">
              <Link
                href={topicHref(topic)}
                aria-current={active ? "page" : undefined}
                className={`flex items-baseline justify-between gap-4 py-2.5 text-[0.9375rem] hover:text-wine-deep ${
                  active ? "font-semibold text-wine-deep" : "text-ink"
                }`}
              >
                {NEWS_TOPIC_LABELS[topic]}
                <span className="tnum font-mono text-xs text-ink-soft">
                  {counts[topic]}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
