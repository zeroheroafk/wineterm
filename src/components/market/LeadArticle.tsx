import Image from "next/image";
import Link from "next/link";

import { PhotoCredit } from "@/components/editorial/PhotoCredit";
import { Container } from "@/components/layout/Container";
import { ButtonLink } from "@/components/ui/Button";
import { formatDate } from "@/lib/format";
import type { ArticleKind, LeadArticle as Lead } from "@/services/types";

/** The label over the headline and the way to the full text, by kind. */
const KIND_COPY: Record<ArticleKind, { label: string; action: string }> = {
  analysis: { label: "Analysis", action: "Read the analysis" },
  "weekly-briefing": { label: "Weekly briefing", action: "Read the briefing" },
  "monthly-report": { label: "Monthly report", action: "Read the report" },
  news: { label: "News", action: "Read the story" },
};

/**
 * The latest article across the full width of the homepage, whether an
 * analysis, a Weekly Briefing or a monthly report: its photograph darkened
 * behind the label, the headline, the summary and the way to the article,
 * with the photograph's caption and credit at the foot of the band. An
 * article without a photograph sits on the dark burgundy surface instead.
 */
export function LeadArticle({ article }: { article: Lead }) {
  const { hero } = article;
  const copy = KIND_COPY[article.kind];
  return (
    <article
      aria-labelledby="lead-article-headline"
      className={`wt-on-dark relative overflow-hidden text-paper ${hero ? "bg-ink" : "bg-wine-deep"}`}
    >
      {hero ? (
        // Narrower than a laptop the photograph takes a 3:2 frame at the top
        // of the band, the shape the articles' photographs are cropped to,
        // and fades into the dark under the text; wider, it fills the band,
        // darkened from the left where the text runs.
        <div className="absolute inset-x-0 top-0 aspect-[3/2] lg:inset-0 lg:aspect-auto">
          <Image
            src={hero.src}
            alt={hero.alt}
            fill
            sizes="100vw"
            loading="eager"
            fetchPriority="high"
            className="object-cover"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-linear-to-b from-ink/0 from-25% via-ink/65 via-65% to-ink lg:bg-linear-to-r lg:from-ink/90 lg:from-0% lg:via-ink/75 lg:via-55% lg:to-ink/20"
          />
        </div>
      ) : null}

      <Container
        className={`relative flex flex-col ${hero ? "pt-[44vw] pb-5 lg:min-h-[32rem] lg:pt-20" : "pt-12 pb-12 sm:pt-16 sm:pb-16 lg:pt-20 lg:pb-20"}`}
      >
        <div className="max-w-3xl">
          <p className="wt-kicker inline-block bg-wine px-2 py-1 text-paper">
            {copy.label}
          </p>
          <h2
            id="lead-article-headline"
            className="wt-headline mt-4 text-[2rem] leading-[1.1] font-semibold tracking-[-0.015em] text-balance sm:text-[2.625rem] lg:text-[3.25rem]"
          >
            <Link
              href={article.href}
              className="decoration-2 underline-offset-[6px] hover:underline"
            >
              {article.headline}
            </Link>
          </h2>
          <p className="mt-4 max-w-2xl text-[1.0625rem] leading-[1.6] text-pretty text-paper/85 sm:text-lg">
            {article.summary}
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
            <ButtonLink
              href={article.href}
              variant="secondary"
              className="h-10 px-5"
            >
              {copy.action}
            </ButtonLink>
            <p className="text-[0.8125rem] text-paper/75">
              <time dateTime={article.publishedAt}>
                {formatDate(article.publishedAt)}
              </time>
              <span aria-hidden="true" className="mx-1.5">
                &middot;
              </span>
              {article.readingMinutes} min read
            </p>
          </div>
        </div>

        {hero ? (
          <p className="mt-12 text-xs leading-relaxed text-paper/80 sm:mt-14 lg:mt-auto lg:pt-12">
            {hero.caption ? `${hero.caption} ` : null}
            <PhotoCredit
              hero={hero}
              changes={hero.changes ? `${hero.changes} and darkened` : "darkened"}
              onDark
            />
          </p>
        ) : null}
      </Container>
    </article>
  );
}
