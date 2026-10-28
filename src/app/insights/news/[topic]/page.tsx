import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { NEWS_TOPICS, NewsStories } from "@/components/editorial/NewsStories";
import { Container } from "@/components/layout/Container";
import { SectionPageHeader } from "@/components/layout/SectionPageHeader";
import { primaryNavigation } from "@/lib/navigation";
import { getIndustryService } from "@/services/industry";
import {
  INDUSTRY_TOPIC_LABELS,
  type IndustryTopic,
} from "@/services/types";

const TOPIC_INTROS: Record<IndustryTopic, string> = {
  companies:
    "Wineries, cooperatives, bottlers, traders and suppliers: structure, strategy and the operators shaping each market.",
  deals:
    "Transactions, capacity investment and consolidation across production, bottling, logistics and distribution.",
  regulation:
    "EU and national rules that move the market: planting rights, crisis measures, labelling and trade policy.",
  technology:
    "Winemaking, vineyard and data technology with commercial relevance for professional operators.",
  "packaging-logistics":
    "Glass, closures, cartons, flexitanks and freight: the cost and capacity layer between cellar and shelf.",
};

export function generateStaticParams() {
  return NEWS_TOPICS.map((topic) => ({ topic }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ topic: string }>;
}): Promise<Metadata> {
  const { topic } = await params;
  if (!NEWS_TOPICS.includes(topic as IndustryTopic)) return { title: "News" };
  const key = topic as IndustryTopic;
  return {
    title: INDUSTRY_TOPIC_LABELS[key],
    description: TOPIC_INTROS[key],
  };
}

export default async function NewsTopicPage({
  params,
}: {
  params: Promise<{ topic: string }>;
}) {
  const { topic } = await params;
  if (!NEWS_TOPICS.includes(topic as IndustryTopic)) notFound();
  const key = topic as IndustryTopic;

  const stories = await getIndustryService().getStoriesByTopic(key);

  return (
    <Container className="pb-16">
      <SectionPageHeader
        section={primaryNavigation[6]}
        crumbs={[
          { label: "Insights", href: "/insights" },
          { label: "News", href: "/insights/news" },
          { label: INDUSTRY_TOPIC_LABELS[key] },
        ]}
        kicker="News"
        title={INDUSTRY_TOPIC_LABELS[key]}
        description={TOPIC_INTROS[key]}
        activeHref="/insights/news"
      />
      <NewsStories stories={stories} topic={key} />
    </Container>
  );
}
