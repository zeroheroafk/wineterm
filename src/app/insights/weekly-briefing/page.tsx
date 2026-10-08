import type { Metadata } from "next";
import Link from "next/link";

import { NewsletterSignup } from "@/components/editorial/NewsletterSignup";
import { Container } from "@/components/layout/Container";
import { SectionPageHeader } from "@/components/layout/SectionPageHeader";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { formatDate } from "@/lib/format";
import { primaryNavigation } from "@/lib/navigation";
import { getEditorialService } from "@/services/editorial";

export const metadata: Metadata = {
  title: "Weekly Briefing",
  description:
    "The wine market, once a week: prices, harvest conditions, supply and trade for professionals.",
};

export default async function WeeklyBriefingPage() {
  const [current, ...past] = await getEditorialService().getArticlesByKind("weekly-briefing");

  return (
    <Container className="pb-16">
      <SectionPageHeader
        section={primaryNavigation[4]}
        crumbs={[
          { label: "Insights", href: "/insights" },
          { label: "Weekly Briefing" },
        ]}
        kicker="Insights"
        title="Weekly Briefing"
        description="The week in wine markets: prices, supply signals, harvest conditions and trade developments, written for professionals."
        activeHref="/insights/weekly-briefing"
      />

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div>
          {current ? (
            <article className="border border-rule border-t-2 border-t-wine bg-paper px-5 py-4">
              <p className="wt-label text-wine">
                Current edition
                <span aria-hidden="true" className="mx-2 text-rule">
                  &middot;
                </span>
                <time dateTime={current.publishedAt}>{formatDate(current.publishedAt)}</time>
              </p>
              <h2 className="wt-headline mt-2 text-2xl leading-snug font-semibold text-ink">
                <Link href={current.href} className="hover:text-wine-deep">
                  {current.headline}
                </Link>
              </h2>
              <p className="mt-2.5 text-sm leading-relaxed text-ink-soft">
                {current.standfirst}
              </p>
              <p className="mt-4 border-t border-rule pt-3">
                <ArrowLink href={current.href}>Read the briefing</ArrowLink>
              </p>
            </article>
          ) : (
            <p className="text-sm text-ink-soft">No edition published yet.</p>
          )}

          {past.length > 0 ? (
            <section className="mt-10">
              <SectionHeader kicker="Archive" title="Past editions" />
              <ul className="mt-5 border border-rule bg-paper">
                {past.map((edition) => (
                  <li
                    key={edition.id}
                    className="border-b border-rule px-4 py-3.5 last:border-b-0"
                  >
                    <p className="wt-label text-ink-soft">
                      <time dateTime={edition.publishedAt}>{formatDate(edition.publishedAt)}</time>
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
            </section>
          ) : null}
        </div>

        <aside>
          <NewsletterSignup />
        </aside>
      </div>
    </Container>
  );
}
