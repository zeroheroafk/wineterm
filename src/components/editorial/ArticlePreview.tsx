import Link from "next/link";

import { formatDate } from "@/lib/format";
import type { Article } from "@/services/types";

/**
 * Editorial article preview in two densities: "lead" for the top slot of
 * a section, "list" for stacked rows separated by rules.
 */
export function ArticlePreview({
  article,
  variant = "list",
}: {
  article: Article;
  variant?: "lead" | "list";
}) {
  if (variant === "lead") {
    return (
      <article className="group">
        <p className="wt-label text-wine">{article.section}</p>
        <h3 className="wt-headline mt-2 text-3xl font-semibold leading-tight text-ink">
          <Link href={article.href} className="group-hover:text-wine-deep">
            {article.headline}
          </Link>
        </h3>
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
      <h3 className="wt-headline mt-1.5 text-xl font-semibold leading-snug text-ink">
        <Link href={article.href} className="group-hover:text-wine-deep">
          {article.headline}
        </Link>
      </h3>
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
