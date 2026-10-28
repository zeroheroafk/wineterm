import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticleView } from "@/components/editorial/ArticleView";
import { getEditorialService } from "@/services/editorial";
import type { ArticleDetail } from "@/services/types";

export async function generateStaticParams() {
  const articles = await getEditorialService().getArticlesByKind("analysis");
  return articles.map((article) => ({ slug: article.id }));
}

async function getAnalysis(slug: string): Promise<ArticleDetail | null> {
  const article = await getEditorialService().getArticle(slug);
  return article?.kind === "analysis" ? article : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getAnalysis(slug);
  if (!article) return { title: "Article not found" };
  return {
    title: article.headline,
    description: article.standfirst,
  };
}

export default async function AnalysisArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getAnalysis(slug);
  if (!article) notFound();

  return (
    <ArticleView
      article={article}
      section={{ label: "Analysis", href: "/insights/analysis", back: "All analysis" }}
    />
  );
}
