import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DevContentNotice } from "@/components/editorial/DevContentNotice";
import {
  NEWS_DEV_NOTICE,
  NewsList,
  TopicIndex,
  topicHref,
} from "@/components/editorial/NewsList";
import { Container } from "@/components/layout/Container";
import { SectionPageHeader } from "@/components/layout/SectionPageHeader";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { EmptyState } from "@/components/ui/states";
import { navSection } from "@/lib/navigation";
import { getNewsService } from "@/services/news";
import {
  NEWS_TOPIC_LABELS,
  NEWS_TOPICS,
  type NewsTopic,
} from "@/services/types";

const TOPIC_INTROS: Record<NewsTopic, string> = {
  brands:
    "Labels, launches and repositioning: how wineries, cooperatives and merchants build a name and keep it.",
  consumption:
    "What people drink, where and how often: volumes, styles, moderation and the habits of new generations of drinkers.",
  culture:
    "Grape varieties, heritage, festivals and the wine lists that carry them: the culture that gives wine its meaning.",
  lifestyle:
    "Wine at the table, at home and on the road: food, entertaining and the occasions that wine belongs to.",
  "wine-tourism":
    "Estates, tastings, harvest visits and the regions that open their cellars to visitors.",
  hospitality:
    "Restaurants, bars and hotels: wine lists, by-the-glass ranges and how venues buy and sell wine.",
  retail:
    "Shelves, ranges and promotions: how wine is sold in supermarkets, specialist shops and online.",
  packaging:
    "Glass, closures, cartons and new formats, and what they cost and say about a wine.",
  sustainability:
    "Lighter glass, vineyard practices and emissions reporting across the wine supply chain.",
  harvest:
    "The vintage from the vineyard to the cellar: picking, yields, quality and the festivals that follow.",
  markets:
    "Bulk wine, grape and must prices in the news. The price series themselves are on the Markets pages.",
  trade:
    "Exports, imports and the importers and merchants who move wine between markets.",
  regulation:
    "EU and national rules that shape the sector: crisis measures, planting, labelling and trade policy.",
};

function isTopic(value: string): value is NewsTopic {
  return (NEWS_TOPICS as string[]).includes(value);
}

export function generateStaticParams() {
  return NEWS_TOPICS.map((topic) => ({ topic }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ topic: string }>;
}): Promise<Metadata> {
  const { topic } = await params;
  if (!isTopic(topic)) return { title: "News" };
  return {
    title: `${NEWS_TOPIC_LABELS[topic]} news`,
    description: TOPIC_INTROS[topic],
  };
}

export default async function NewsTopicPage({
  params,
}: {
  params: Promise<{ topic: string }>;
}) {
  const { topic } = await params;
  if (!isTopic(topic)) notFound();

  const news = getNewsService();
  const [stories, counts] = await Promise.all([
    news.getStoriesByTopic(topic),
    news.getTopicCounts(),
  ]);

  return (
    <Container className="pb-16">
      <SectionPageHeader
        section={navSection("/news")}
        crumbs={[
          { label: "News", href: "/news" },
          { label: NEWS_TOPIC_LABELS[topic] },
        ]}
        kicker="News"
        title={NEWS_TOPIC_LABELS[topic]}
        description={TOPIC_INTROS[topic]}
        activeHref={topicHref(topic)}
      />

      {stories.length > 0 ? (
        <div className="mt-8">
          <DevContentNotice text={NEWS_DEV_NOTICE} />
        </div>
      ) : null}

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-12">
        <div>
          {stories.length > 0 ? (
            <NewsList stories={stories} headingLevel={2} />
          ) : (
            <EmptyState
              title={`No ${NEWS_TOPIC_LABELS[topic].toLowerCase()} stories yet`}
              detail="Coverage of this topic starts at launch."
              action={<ArrowLink href="/news">All news</ArrowLink>}
            />
          )}
          {topic === "markets" ? (
            <p className="mt-8 border-t border-rule pt-4">
              <ArrowLink href="/markets">
                Bulk wine, grape and must prices in Markets
              </ArrowLink>
            </p>
          ) : null}
        </div>
        <aside>
          <TopicIndex
            counts={counts}
            titleId="news-topics"
            activeTopic={topic}
          />
        </aside>
      </div>
    </Container>
  );
}
