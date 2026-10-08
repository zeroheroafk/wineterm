import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { StoryList } from "@/components/editorial/StoryList";
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

const TOPICS = Object.keys(TOPIC_INTROS) as IndustryTopic[];

export function generateStaticParams() {
  return TOPICS.map((topic) => ({ topic }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ topic: string }>;
}): Promise<Metadata> {
  const { topic } = await params;
  if (!TOPICS.includes(topic as IndustryTopic)) return { title: "Industry" };
  const key = topic as IndustryTopic;
  return {
    title: INDUSTRY_TOPIC_LABELS[key],
    description: TOPIC_INTROS[key],
  };
}

export default async function IndustryTopicPage({
  params,
}: {
  params: Promise<{ topic: string }>;
}) {
  const { topic } = await params;
  if (!TOPICS.includes(topic as IndustryTopic)) notFound();
  const key = topic as IndustryTopic;

  const stories = await getIndustryService().getStoriesByTopic(key);

  return (
    <Container className="pb-16">
      <SectionPageHeader
        section={primaryNavigation[3]}
        crumbs={[
          { label: "Industry", href: "/industry" },
          { label: INDUSTRY_TOPIC_LABELS[key] },
        ]}
        kicker="Industry"
        title={INDUSTRY_TOPIC_LABELS[key]}
        description={TOPIC_INTROS[key]}
        activeHref={`/industry/${key}`}
      />

      <div className="mt-8 max-w-3xl">
        <StoryList stories={stories} headingLevel={2} />
      </div>

      <p className="wt-label mt-8 max-w-3xl leading-relaxed text-ink-soft">
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
    </Container>
  );
}
