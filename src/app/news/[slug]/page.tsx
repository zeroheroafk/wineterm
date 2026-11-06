import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DevContentNotice } from "@/components/editorial/DevContentNotice";
import {
  NewsList,
  TopicTags,
  topicHref,
} from "@/components/editorial/NewsList";
import { NewsletterSignup } from "@/components/editorial/NewsletterSignup";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { formatDate } from "@/lib/format";
import { getNewsService } from "@/services/news";
import { NEWS_TOPIC_LABELS, type StoryImage } from "@/services/types";

export async function generateStaticParams() {
  const stories = await getNewsService().getLatestStories(Infinity);
  return stories.map((story) => ({ slug: story.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const story = await getNewsService().getStory(slug);
  if (!story) return { title: "Story not found" };
  return {
    title: story.headline,
    description: story.standfirst,
    openGraph: {
      images: [
        {
          url: story.image.src,
          width: story.image.width,
          height: story.image.height,
          alt: story.image.alt,
        },
      ],
    },
  };
}

/** "Photo: name, source (licence)", the source linked to the original. */
function PhotoCredit({ credit }: { credit: StoryImage["credit"] }) {
  return (
    <>
      Photo: {credit.creator ? `${credit.creator}, ` : null}
      <a
        href={credit.url}
        className="underline decoration-rule underline-offset-2 hover:text-wine"
      >
        {credit.source}
      </a>{" "}
      ({credit.licence})
    </>
  );
}

export default async function NewsStoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const news = getNewsService();
  const story = await news.getStory(slug);
  if (!story) notFound();
  const related = await news.getRelatedStories(story.id);
  const [mainTopic] = story.topics;

  return (
    <Container className="pb-16">
      <Breadcrumbs
        items={[
          { label: "News", href: "/news" },
          { label: NEWS_TOPIC_LABELS[mainTopic], href: topicHref(mainTopic) },
          { label: story.headline },
        ]}
      />

      <div className="mt-4 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <article className="min-w-0">
          <header>
            <p className="wt-kicker text-wine">
              <Link href={topicHref(mainTopic)} className="hover:text-wine-deep">
                {NEWS_TOPIC_LABELS[mainTopic]}
              </Link>
            </p>
            <h1 className="wt-headline mt-2 text-4xl leading-tight font-semibold text-balance text-ink sm:text-5xl">
              {story.headline}
            </h1>
            <p className="wt-headline mt-4 max-w-2xl text-xl leading-snug text-pretty text-ink-soft italic">
              {story.standfirst}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
              <time
                dateTime={story.publishedAt}
                className="tnum font-mono text-xs font-medium text-wine"
              >
                {formatDate(story.publishedAt)}
              </time>
              <TopicTags topics={story.topics} />
            </div>
          </header>

          <figure className="mt-6">
            <Image
              src={story.image.src}
              alt={story.image.alt}
              width={story.image.width}
              height={story.image.height}
              sizes="(min-width: 1280px) 760px, (min-width: 1024px) 60vw, 100vw"
              loading="eager"
              fetchPriority="high"
              className="aspect-[3/2] w-full bg-wine-wash object-cover"
            />
            <figcaption className="mt-2 text-[0.8125rem] text-ink-soft">
              <PhotoCredit credit={story.image.credit} />
            </figcaption>
          </figure>

          <div className="mt-6 max-w-2xl">
            <DevContentNotice text="Development content: this story is an illustrative placeholder demonstrating the news format, not published reporting. The photograph is real and credited above." />
          </div>

          <div className="mt-6 max-w-2xl space-y-5">
            {story.body.map((paragraph, index) => (
              <p
                key={index}
                className="text-[1.0625rem] leading-[1.7] text-pretty text-ink"
              >
                {paragraph}
              </p>
            ))}
          </div>

          {related.length > 0 ? (
            <section
              aria-labelledby="related-news"
              className="mt-12 border-t border-ink pt-4"
            >
              <h2
                id="related-news"
                className="wt-headline text-[1.625rem] leading-tight font-semibold text-ink"
              >
                Related news
              </h2>
              <div className="mt-5">
                <NewsList stories={related} />
              </div>
            </section>
          ) : null}

          <p className="mt-8">
            <ArrowLink href="/news">All news</ArrowLink>
          </p>
        </article>

        <aside className="min-w-0">
          <NewsletterSignup />
        </aside>
      </div>
    </Container>
  );
}
