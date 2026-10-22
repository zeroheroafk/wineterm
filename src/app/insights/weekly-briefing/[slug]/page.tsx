import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticleView } from "@/components/editorial/ArticleView";
import { getEditorialService } from "@/services/editorial";
import type { ArticleDetail } from "@/services/types";

export async function generateStaticParams() {
  const editions = await getEditorialService().getArticlesByKind("weekly-briefing");
  return editions.map((edition) => ({ slug: edition.id }));
}

async function getEdition(slug: string): Promise<ArticleDetail | null> {
  const article = await getEditorialService().getArticle(slug);
  return article?.kind === "weekly-briefing" ? article : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const edition = await getEdition(slug);
  if (!edition) return { title: "Briefing not found" };
  return {
    title: edition.headline,
    description: edition.standfirst,
  };
}

export default async function WeeklyBriefingEditionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const edition = await getEdition(slug);
  if (!edition) notFound();

  return (
    <ArticleView
      article={edition}
      section={{
        label: "Weekly Briefing",
        href: "/insights/weekly-briefing",
        back: "All editions",
      }}
    />
  );
}
