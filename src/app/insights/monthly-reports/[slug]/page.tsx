import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticleView } from "@/components/editorial/ArticleView";
import { getEditorialService } from "@/services/editorial";
import type { ArticleDetail } from "@/services/types";

export async function generateStaticParams() {
  const reports = await getEditorialService().getArticlesByKind("monthly-report");
  return reports.map((report) => ({ slug: report.id }));
}

async function getReport(slug: string): Promise<ArticleDetail | null> {
  const article = await getEditorialService().getArticle(slug);
  return article?.kind === "monthly-report" ? article : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const report = await getReport(slug);
  if (!report) return { title: "Report not found" };
  return {
    title: report.headline,
    description: report.standfirst,
  };
}

export default async function MonthlyReportPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const report = await getReport(slug);
  if (!report) notFound();

  return (
    <ArticleView
      article={report}
      section={{
        label: "Monthly Reports",
        href: "/insights/monthly-reports",
        back: "All monthly reports",
      }}
    />
  );
}
