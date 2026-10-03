import type { Metadata } from "next";
import Link from "next/link";

import { ArticlePreview } from "@/components/editorial/ArticlePreview";
import { DevContentNotice } from "@/components/editorial/DevContentNotice";
import { NewsletterSignup } from "@/components/editorial/NewsletterSignup";
import { Container } from "@/components/layout/Container";
import { SectionPageHeader } from "@/components/layout/SectionPageHeader";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { formatDate } from "@/lib/format";
import { primaryNavigation } from "@/lib/navigation";
import { getBriefingService } from "@/services/briefing/service";
import { getEditorialService } from "@/services/editorial";
import { getOutlookService } from "@/services/outlook/service";

export const metadata: Metadata = {
  title: "Insights",
  description:
    "WineTerm editorial: the Market Outlook, analysis, news and the Weekly Briefing for the professional wine trade.",
};

export default async function InsightsPage() {
  const editorial = getEditorialService();
  const outlook = getOutlookService();
  const [edition, analysis, news, liveBriefing, sampleBriefings] = await Promise.all([
    outlook.getCurrentEdition(),
    editorial.getArticlesByKind("analysis", 4),
    editorial.getArticlesByKind("news", 5),
    getBriefingService().getCurrentEdition(),
    editorial.getBriefingEditions(),
  ]);
  const currentBriefing =
    liveBriefing ??
    sampleBriefings.find((b) => b.isCurrent) ??
    sampleBriefings[0];

  return (
    <Container className="pb-16">
      <SectionPageHeader
        section={primaryNavigation[3]}
        crumbs={[{ label: "Insights" }]}
        kicker="Insights"
        title="Insights"
        description="Interpretation over the platform's data: the Market Outlook, analysis and news, and the Weekly Briefing."
        activeHref="/insights"
      />

      <div className="mt-8">
        <DevContentNotice
          text={
            liveBriefing
              ? "Development content: the Market Outlook below is an illustrative placeholder demonstrating the editorial format, not published reporting. The Weekly Briefing is written from the price series."
              : "Development content: the Market Outlook and Weekly Briefing editions below are illustrative placeholders demonstrating the editorial format, not published reporting."
          }
        />
      </div>

      <section className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Link
          href="/outlook"
          className="group block border border-rule border-t-2 border-t-wine bg-paper px-5 py-4"
        >
          <p className="wt-label text-wine">
            Market Outlook
            <span aria-hidden="true" className="mx-2 text-rule">
              &middot;
            </span>
            {edition.edition}
          </p>
          <h2 className="wt-headline mt-2 text-2xl leading-snug font-semibold text-ink group-hover:text-wine-deep">
            {edition.headline}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            {edition.summaryParagraphs[0]}
          </p>
          <p className="wt-label mt-3 text-wine">Read the outlook &rarr;</p>
        </Link>

        <Link
          href="/insights/weekly-briefing"
          className="group block border border-rule bg-paper px-5 py-4"
        >
          <p className="wt-label text-wine">
            Weekly Briefing
            <span aria-hidden="true" className="mx-2 text-rule">
              &middot;
            </span>
            {formatDate(currentBriefing.date)}
          </p>
          <h2 className="wt-headline mt-2 text-2xl leading-snug font-semibold text-ink group-hover:text-wine-deep">
            {currentBriefing.headline}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            {currentBriefing.summary}
          </p>
          <p className="wt-label mt-3 text-wine">All editions &rarr;</p>
        </Link>
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
