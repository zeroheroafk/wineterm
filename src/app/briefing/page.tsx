import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { NewsletterSignup } from "@/components/editorial/NewsletterSignup";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { formatDate } from "@/lib/format";
import { getEditorialService } from "@/services/editorial";

export const metadata: Metadata = {
  title: "Get the briefing",
  description:
    "The WineTerm Weekly Briefing: prices, supply signals and trade developments across the European wine market, every Friday.",
  alternates: { canonical: "/briefing" },
};

/** What the editions report on, part by part, as the published ones do. */
const CONTENTS: { label: string; description: string }[] = [
  {
    label: "Prices",
    description:
      "The week's official ex-winery prices for bulk wine, against the weeks and the year before.",
  },
  {
    label: "Supply",
    description:
      "Wine made, stocks and harvest estimates in Spain, Portugal, France and Italy, as each country publishes them.",
  },
  {
    label: "Trade",
    description:
      "Export figures as they are released: volumes, values and the bulk share.",
  },
  {
    label: "Brussels",
    description: "The EU rules and decisions that move the wine market.",
  },
  {
    label: "Coming up",
    description: "The figures and dates due in the weeks ahead.",
  },
];

/** Editions shown under the signup; the Weekly Briefing page has them all. */
const LATEST_EDITIONS = 3;

/**
 * Landing route for the newsletter call to action across the shell: the
 * signup, what an edition covers, and the latest editions to read.
 */
export default async function BriefingPage() {
  const editions = await getEditorialService().getArticlesByKind(
    "weekly-briefing",
    LATEST_EDITIONS,
  );

  return (
    <Container className="pb-12">
      <Breadcrumbs items={[{ label: "Briefing" }]} />
      <div className="mx-auto max-w-xl py-8">
        <NewsletterSignup titleAs="h1" />
        <p className="mt-4 text-sm leading-relaxed text-ink-soft">
          Sign up to receive the next edition. Past editions are published
          under Insights.
        </p>

        <section aria-labelledby="briefing-contents" className="mt-10">
          <h2
            id="briefing-contents"
            className="wt-headline text-xl font-semibold text-ink"
          >
            What the briefing covers
          </h2>
          <dl className="mt-3 border-t border-rule">
            {CONTENTS.map((part) => (
              <div
                key={part.label}
                className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-3 border-b border-rule py-2.5"
              >
                <dt className="wt-label pt-0.5 text-wine">{part.label}</dt>
                <dd className="text-sm leading-relaxed text-ink">
                  {part.description}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {editions.length > 0 ? (
          <section aria-labelledby="briefing-latest" className="mt-10">
            <h2
              id="briefing-latest"
              className="wt-headline text-xl font-semibold text-ink"
            >
              Latest editions
            </h2>
            <ul className="mt-3 border-t border-rule">
              {editions.map((edition) => (
                <li key={edition.id} className="border-b border-rule py-3.5">
                  <p className="wt-label text-ink-soft">
                    <time dateTime={edition.publishedAt}>
                      {formatDate(edition.publishedAt)}
                    </time>
                  </p>
                  <p className="mt-1 text-base font-medium text-ink">
                    <Link href={edition.href} className="hover:text-wine-deep">
                      {edition.headline}
                    </Link>
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                    {edition.standfirst}
                  </p>
                </li>
              ))}
            </ul>
            <p className="mt-4">
              <ArrowLink href="/insights/weekly-briefing">All editions</ArrowLink>
            </p>
          </section>
        ) : null}
      </div>
    </Container>
  );
}
