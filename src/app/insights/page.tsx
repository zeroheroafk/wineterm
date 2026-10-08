import type { Metadata } from "next";
import Link from "next/link";

import { ArticlePreview } from "@/components/editorial/ArticlePreview";
import { NewsletterSignup } from "@/components/editorial/NewsletterSignup";
import { Container } from "@/components/layout/Container";
import { SectionPageHeader } from "@/components/layout/SectionPageHeader";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { formatDate } from "@/lib/format";
import { primaryNavigation } from "@/lib/navigation";
import { getEditorialService } from "@/services/editorial";

export const metadata: Metadata = {
  title: "Insights",
  description:
    "WineTerm editorial: the Market Outlook, analysis, news, the Weekly Briefing and monthly reports for the professional wine trade.",
};

export default async function InsightsPage() {
  const editorial = getEditorialService();
  const [analysis, news, briefings, reports] = await Promise.all([
    editorial.getArticlesByKind("analysis", 4),
    editorial.getArticlesByKind("news", 5),
    editorial.getArticlesByKind("weekly-briefing", 1),
    editorial.getArticlesByKind("monthly-report", 3),
  ]);
  const [briefing] = briefings;
  const [report] = reports;

  return (
    <Container className="pb-16">
      <SectionPageHeader
        section={primaryNavigation[4]}
        crumbs={[{ label: "Insights" }]}
        kicker="Insights"
        title="Insights"
        description="Interpretation over the platform's data: analysis and news, the Weekly Briefing and monthly reports."
        activeHref="/insights"
      />

      <section className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        {briefing ? (
          <Link
            href={briefing.href}
            className="group block border border-rule border-t-2 border-t-wine bg-paper px-5 py-4"
          >
            <p className="wt-label text-wine">
              Weekly Briefing
              <span aria-hidden="true" className="mx-2 text-rule">
                &middot;
              </span>
              {formatDate(briefing.publishedAt)}
            </p>
            <h2 className="wt-headline mt-2 text-2xl leading-snug font-semibold text-ink group-hover:text-wine-deep">
              {briefing.headline}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              {briefing.standfirst}
            </p>
            <p className="wt-label mt-3 text-wine">Read the briefing &rarr;</p>
          </Link>
        ) : null}

        {report ? (
          <Link
            href={report.href}
            className="group block border border-rule bg-paper px-5 py-4"
          >
            <p className="wt-label text-wine">
              Monthly Report
              <span aria-hidden="true" className="mx-2 text-rule">
                &middot;
              </span>
              {formatDate(report.publishedAt)}
            </p>
            <h2 className="wt-headline mt-2 text-2xl leading-snug font-semibold text-ink group-hover:text-wine-deep">
              {report.headline}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              {report.standfirst}
            </p>
            <p className="wt-label mt-3 text-wine">Read the report &rarr;</p>
          </Link>
        ) : null}
      </section>

      <section className="mt-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
          <div>
            <SectionHeader
              kicker="Analysis"
              title="Latest analysis"
              action={{ label: "All analysis", href: "/insights/analysis" }}
            />
            <div className="mt-5">
              {analysis[0] ? (
                <ArticlePreview article={analysis[0]} variant="lead" />
              ) : null}
              {analysis.length > 1 ? (
                <div className="mt-6 border-t-2 border-ink pt-4">
                  {analysis.slice(1).map((article) => (
                    <ArticlePreview key={article.id} article={article} />
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <div className="space-y-10">
            <div>
              <SectionHeader
                kicker="News"
                title="News"
                action={{ label: "All news", href: "/insights/news" }}
              />
              {news.length > 0 ? (
                <ul className="mt-5">
                  {news.map((article) => (
                    <li
                      key={article.id}
                      className="border-t border-rule py-2.5 first:border-t-0 first:pt-0"
                    >
                      <p className="wt-label text-wine">{article.section}</p>
                      <p className="mt-0.5 text-sm leading-snug font-medium text-ink">
                        <Link href={article.href} className="hover:text-wine-deep">
                          {article.headline}
                        </Link>
                      </p>
                      <time
                        dateTime={article.publishedAt}
                        className="wt-label mt-1 block text-ink-soft"
                      >
                        {formatDate(article.publishedAt)}
                      </time>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-5 text-sm text-ink-soft">
                  No news published yet. Reporting starts at launch.
                </p>
              )}
            </div>

            <div>
              <SectionHeader
                kicker="Reports"
                title="Monthly reports"
                action={{ label: "All reports", href: "/insights/monthly-reports" }}
              />
              <ul className="mt-5">
                {reports.map((report) => (
                  <li
                    key={report.id}
                    className="border-t border-rule py-2.5 first:border-t-0 first:pt-0"
                  >
                    <Link
                      href={report.href}
                      className="text-sm font-medium text-ink hover:text-wine"
                    >
                      {report.headline}
                    </Link>
                    <p className="wt-label mt-1 text-ink-soft">
                      <time dateTime={report.publishedAt}>{formatDate(report.publishedAt)}</time>
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-12">
        <NewsletterSignup variant="inline" />
        <p className="wt-label mt-4 text-ink-soft">
          How the series behind these pages are collected and defined:{" "}
          <Link
            href="/insights/methodology"
            className="text-wine underline decoration-rule underline-offset-2 hover:text-wine-deep"
          >
            WineTerm methodology
          </Link>
        </p>
      </section>
    </Container>
  );
}
