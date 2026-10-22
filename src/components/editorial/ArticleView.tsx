import { Fragment } from "react";

import { ShareChart } from "@/components/charts/ShareChart";
import { NewsletterSignup } from "@/components/editorial/NewsletterSignup";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { TD, TD_RIGHT, TH, TH_RIGHT } from "@/components/markets/cells";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { formatDate } from "@/lib/format";
import type { ArticleDetail, ArticleTable, CitationText } from "@/services/types";

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

/** A table of figures in the article, with the sources it cites. */
function FiguresTable({ table, titleId }: { table: ArticleTable; titleId: string }) {
  return (
    <figure aria-labelledby={titleId} className="border-y border-rule py-5">
      <figcaption id={titleId} className="wt-label text-ink-soft">
        {table.title}
        <Citations numbers={table.cites} />
      </figcaption>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b-2 border-ink">
              <th scope="col" className={TH}>
                <span className="sr-only">Figure</span>
              </th>
              {table.columns.map((column) => (
                <th key={column} scope="col" className={TH_RIGHT}>
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row) => (
              <tr key={row.label} className="border-b border-rule last:border-b-0">
                <th scope="row" className={`${TD} !whitespace-normal text-sm font-normal text-ink`}>
                  {row.label}
                </th>
                {row.cells.map((cell, index) => (
                  <td key={index} className={`${TD_RIGHT} tnum font-mono text-sm text-ink`}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}

/**
 * A published article in full: header, text with its subheadings, chart
 * and tables, and the numbered sources it cites.
 */
export function ArticleView({
  article,
  section,
}: {
  article: ArticleDetail;
  /** The Insights section the article belongs to, for the trail and the way back. */
  section: { label: string; href: string; back: string };
}) {
  return (
    <Container className="pb-16">
      <Breadcrumbs
        items={[
          { label: "Insights", href: "/insights" },
          { label: section.label, href: section.href },
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
                {paragraph.heading ? (
                  <h2 className="wt-headline pt-3 text-2xl font-semibold text-ink">
                    {paragraph.heading}
                  </h2>
                ) : null}
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
                {article.tables
                  ?.filter((table) => table.afterParagraph === index)
                  .map((table) => (
                    <FiguresTable
                      key={table.title}
                      table={table}
                      titleId={`${article.id}-table-${article.tables!.indexOf(table) + 1}`}
                    />
                  ))}
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
            <ArrowLink href={section.href}>{section.back}</ArrowLink>
          </p>
        </article>

        <aside className="min-w-0">
          <NewsletterSignup />
        </aside>
      </div>
    </Container>
  );
}
