import type { Metadata } from "next";

import { DevContentNotice } from "@/components/editorial/DevContentNotice";
import { NewsletterSignup } from "@/components/editorial/NewsletterSignup";
import { Container } from "@/components/layout/Container";
import { SectionPageHeader } from "@/components/layout/SectionPageHeader";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { formatDate } from "@/lib/format";
import { primaryNavigation } from "@/lib/navigation";
import { getEditorialService } from "@/services/editorial";

export const metadata: Metadata = {
  title: "Weekly Briefing",
  description:
    "The wine market, once a week: prices, harvest conditions, supply and trade for professionals, every Friday.",
};

export default async function WeeklyBriefingPage() {
  const editions = await getEditorialService().getBriefingEditions();
  const current = editions.find((e) => e.isCurrent) ?? editions[0];
  const past = editions.filter((e) => e.id !== current.id);

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
        description="The week in wine markets, every Friday: prices, supply signals, harvest conditions and trade developments, written for professionals."
        activeHref="/insights/weekly-briefing"
      />

      <div className="mt-8">
        <DevContentNotice text="Development content: the editions below are illustrative placeholders demonstrating the briefing format, not sent newsletters." />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div>
          <article className="border border-rule border-t-2 border-t-wine bg-paper px-5 py-4">
            <p className="wt-label text-wine">
              Current edition
              <span aria-hidden="true" className="mx-2 text-rule">
                &middot;
              </span>
              {formatDate(current.date)}
            </p>
            <h2 className="wt-headline mt-2 text-2xl leading-snug font-semibold text-ink">
              {current.headline}
            </h2>
            <p className="mt-2.5 text-sm leading-relaxed text-ink-soft">
              {current.summary}
            </p>
            <p className="wt-label mt-4 border-t border-rule pt-3 text-ink-soft">
              Full editions are delivered by email. The web archive opens at
              launch.
            </p>
          </article>

          <section className="mt-10">
            <SectionHeader kicker="Archive" title="Past editions" />
            <ul className="mt-5 border border-rule bg-paper">
              {past.map((edition) => (
                <li
                  key={edition.id}
                  className="border-b border-rule px-4 py-3.5 last:border-b-0"
                >
                  <p className="wt-label text-ink-soft">
                    {formatDate(edition.date)}
                  </p>
                  <p className="mt-1 text-base font-medium text-ink">
                    {edition.headline}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                    {edition.summary}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside>
          <NewsletterSignup />
        </aside>
      </div>
    </Container>
  );
}
