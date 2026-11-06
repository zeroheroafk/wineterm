import Link from "next/link";

import { formatDate } from "@/lib/format";
import type { Article } from "@/services/types";

/**
 * Editorial article preview in three densities: "lead" for the top slot
 * of a section and "list" for stacked rows separated by rules, both in
 * the bulletin style of the section pages; "compact" for the homepage
 * rail, where hierarchy comes from headline scale and the meta line is
 * set in sentence case.
 */
export function ArticlePreview({
  article,
  variant = "list",
  headingLevel = 3,
}: {
  article: Article;
  variant?: "lead" | "list" | "compact";
  /**
   * 3 (default) under a section heading; 2 when the previews sit directly
   * under the page title, as on the Analysis page.
   */
  headingLevel?: 2 | 3;
}) {
  const Headline = headingLevel === 2 ? "h2" : "h3";

  if (variant === "compact") {
    return (
      <article className="group">
        <p className="wt-kicker text-wine">{article.section}</p>
        <Headline className="wt-headline mt-1.5 text-[1.25rem] leading-[1.25] font-semibold text-balance text-ink">
          <Link
            href={article.href}
            className="underline-offset-4 group-hover:text-wine-deep hover:underline"
          >
            {article.headline}
          </Link>
        </Headline>
        <p className="mt-2 text-[0.9375rem] leading-[1.55] text-pretty text-ink-soft">
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

/** Date and reading time in sentence case, for the homepage rail. */
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
