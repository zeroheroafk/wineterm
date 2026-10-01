import Link from "next/link";
import type { ReactNode } from "react";

import { formatDate } from "@/lib/format";
import type { Article } from "@/services/types";

/**
 * Editorial article preview in four densities: "lead" for the top slot of
 * a section and "list" for stacked rows separated by rules, both in the
 * bulletin style of the section pages; "feature" and "compact" for the
 * homepage, where hierarchy comes from headline scale and the meta line
 * is set in sentence case. A feature's headline always runs the full
 * width; its one visual sits beside the summary on wide screens, where
 * both stay readable, and below it elsewhere.
 */
export function ArticlePreview({
  article,
  variant = "list",
  visual,
  headingLevel = 3,
}: {
  article: Article;
  variant?: "lead" | "list" | "feature" | "compact";
  /** Feature only: a chart built from data shown on the same page. */
  visual?: ReactNode;
  /**
   * 3 (default) under a section heading; 2 when the previews sit directly
   * under the page title, as on the Analysis and News pages.
   */
  headingLevel?: 2 | 3;
}) {
  const Headline = headingLevel === 2 ? "h2" : "h3";

  if (variant === "feature") {
    return (
      <article>
        <div className="group">
          <p className="wt-kicker text-wine">{article.section}</p>
          <Headline className="wt-headline mt-2 max-w-[46rem] text-[1.75rem] leading-[1.12] font-semibold text-balance text-ink sm:text-[2rem] lg:text-[2.125rem]">
            <Link
              href={article.href}
              className="decoration-2 underline-offset-4 group-hover:text-wine-deep hover:underline"
            >
              {article.headline}
            </Link>
          </Headline>
        </div>
        <div
          className={`mt-3 grid grid-cols-1 gap-6 ${visual ? "xl:grid-cols-[minmax(0,1fr)_minmax(0,21rem)] xl:gap-10" : ""}`}
        >
          <div>
            <p className="max-w-[38rem] text-[1.0625rem] leading-[1.6] text-pretty text-ink-soft">
              {article.standfirst}
            </p>
            <EditorialMeta article={article} className="mt-3" />
          </div>
          {visual ? (
            <div className="max-w-[34rem] min-w-0 xl:pt-1">{visual}</div>
          ) : null}
        </div>
      </article>
    );
  }

  if (variant === "compact") {
    return (
      <article className="group">
        <p className="wt-kicker text-wine">{article.section}</p>
        <Headline className="wt-headline mt-1.5 text-[1.375rem] leading-[1.22] font-semibold text-balance text-ink">
          <Link
            href={article.href}
            className="underline-offset-4 group-hover:text-wine-deep hover:underline"
          >
            {article.headline}
          </Link>
        </Headline>
        <p className="mt-2 text-base leading-[1.55] text-pretty text-ink-soft">
          {article.standfirst}
        </p>
        <EditorialMeta article={article} className="mt-2" />
      </article>
    );
  }

  if (variant === "lead") {
    return (
      <article className="group">
        <p className="wt-label text-wine">{article.section}</p>
        <Headline className="wt-headline mt-2 text-3xl font-semibold leading-tight text-ink">
          <Link href={article.href} className="group-hover:text-wine-deep">
            {article.headline}
          </Link>
        </Headline>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink-soft">
          {article.standfirst}
        </p>
        <ArticleMeta article={article} className="mt-3" />
      </article>
    );
  }

  return (
    <article className="group border-t border-rule py-4 first:border-t-0 first:pt-0">
      <p className="wt-label text-wine">{article.section}</p>
      <Headline className="wt-headline mt-1.5 text-xl font-semibold leading-snug text-ink">
        <Link href={article.href} className="group-hover:text-wine-deep">
          {article.headline}
        </Link>
      </Headline>
      <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
        {article.standfirst}
      </p>
      <ArticleMeta article={article} className="mt-2" />
    </article>
  );
}

function ArticleMeta({
  article,
  className = "",
}: {
  article: Article;
  className?: string;
}) {
  return (
    <p className={`wt-label flex items-center gap-2 text-ink-soft ${className}`}>
      <time dateTime={article.publishedAt}>
        {formatDate(article.publishedAt)}
      </time>
      <span aria-hidden="true" className="text-rule">
        &middot;
      </span>
      <span>{article.readingMinutes} min read</span>
    </p>
  );
}

/** Date and reading time in sentence case, for the homepage variants. */
function EditorialMeta({
  article,
  className = "",
}: {
  article: Article;
  className?: string;
}) {
  return (
    <p className={`text-[0.8125rem] text-ink-soft ${className}`}>
      <time dateTime={article.publishedAt}>
        {formatDate(article.publishedAt)}
      </time>
      <span aria-hidden="true" className="mx-1.5">
        &middot;
      </span>
      {article.readingMinutes} min read
    </p>
  );
}
