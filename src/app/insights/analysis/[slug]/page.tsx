import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Fragment } from "react";

import { ShareChart } from "@/components/charts/ShareChart";
import { NewsletterSignup } from "@/components/editorial/NewsletterSignup";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { JsonLd } from "@/components/ui/JsonLd";
import { formatDate } from "@/lib/format";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { getEditorialService } from "@/services/editorial";
import type { ArticleDetail, CitationText } from "@/services/types";

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
    openGraph: {
      type: "article",
      title: article.headline,
      description: article.standfirst,
      publishedTime: article.publishedAt,
      section: article.section,
      authors: [SITE_NAME],
    },
  };
}

/** Bracketed source numbers after a paragraph, each linked to its source. */
function Citations({ numbers }: { numbers: number[] }) {
  return (
    <sup className="ml-0.5 font-mono">
      {numbers.map((number) => (
        <a
          key={number}
          href={`#source-${number}`}
          aria-label={`Source ${number}`}
          className="text-wine hover:text-wine-deep"
        >
          [{number}]
        </a>
      ))}
    </sup>
  );
}

function Citation({ parts }: { parts: CitationText[] }) {
  return parts.map((part, index) =>
    typeof part === "string" ? (
      part
    ) : (
      <cite key={index} className="italic">
        {part.title}
      </cite>
    ),
  );
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
    <Container className="pb-16">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: article.headline,
          description: article.standfirst,
          articleSection: article.section,
          datePublished: article.publishedAt,
          inLanguage: "en-GB",
          mainEntityOfPage: `${SITE_URL}${article.href}`,
          image: `${SITE_URL}/opengraph-image`,
          author: { "@id": `${SITE_URL}/#organization` },
          publisher: { "@id": `${SITE_URL}/#organization` },
        }}
      />
      <Breadcrumbs
        items={[
          { label: "Insights", href: "/insights" },
          { label: "Analysis", href: "/insights/analysis" },
          { label: article.headline },
        ]}
      />

      <div className="mt-4 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <article className="min-w-0">
          <header className="border-b border-rule pb-6">
            <p className="wt-label text-wine">{article.section}</p>
            <h1 className="wt-headline mt-2 text-4xl leading-tight font-semibold text-balance text-ink sm:text-5xl">
              {article.headline}
            </h1>
            <p className="wt-headline mt-4 max-w-2xl text-xl leading-snug text-pretty text-ink-soft italic">
              {article.standfirst}
            </p>
            <p className="wt-label mt-4 flex items-center gap-2 text-ink-soft">
              <time dateTime={article.publishedAt}>
                {formatDate(article.publishedAt)}
              </time>
              <span aria-hidden="true" className="text-rule">
                &middot;
              </span>
              <span>{article.readingMinutes} min read</span>
            </p>
          </header>

          <div className="mt-8 max-w-2xl space-y-5">
            {article.body.map((paragraph, index) => (
              <Fragment key={index}>
                <p className="text-[1.0625rem] leading-[1.7] text-pretty text-ink">
                  {paragraph.text}
                  {paragraph.cites ? (
                    <Citations numbers={paragraph.cites} />
                  ) : null}
                </p>
                {article.chart?.afterParagraph === index ? (
                  <ShareChart
                    chart={article.chart}
                    titleId={`${article.id}-chart`}
                    className="border-y border-rule py-5"
                  />
                ) : null}
              </Fragment>
            ))}
          </div>

          <section
            aria-labelledby="article-sources"
            className="mt-10 max-w-2xl border-t border-rule pt-5"
          >
            <h2
              id="article-sources"
              className="wt-headline text-xl font-semibold text-ink"
            >
              Sources
            </h2>
            <ol className="mt-3 space-y-2.5">
              {article.sources.map((source, index) => (
                <li
                  key={source.url}
                  id={`source-${index + 1}`}
                  className="grid scroll-mt-6 grid-cols-[1.75rem_minmax(0,1fr)] text-sm leading-relaxed text-ink-soft"
                >
                  <span className="tnum font-mono text-xs leading-[1.6rem] text-wine">
                    {index + 1}.
                  </span>
                  <span>
                    <a
                      href={source.url}
                      className="underline decoration-rule underline-offset-2 hover:text-wine"
                    >
                      <Citation parts={source.citation} />
                    </a>
                    .{source.note ? ` ${source.note}` : null}
                  </span>
                </li>
              ))}
            </ol>
          </section>

          <p className="mt-8">
            <ArrowLink href="/insights/analysis">All analysis</ArrowLink>
          </p>
        </article>

        <aside className="min-w-0">
          <NewsletterSignup />
        </aside>
      </div>
    </Container>
  );
}
