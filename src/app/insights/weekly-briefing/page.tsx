import type { Metadata } from "next";

import { DevContentNotice } from "@/components/editorial/DevContentNotice";
import { NewsletterSignup } from "@/components/editorial/NewsletterSignup";
import { WeeklyBriefingEdition } from "@/components/editorial/WeeklyBriefingEdition";
import { Container } from "@/components/layout/Container";
import { SectionPageHeader } from "@/components/layout/SectionPageHeader";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { formatDate } from "@/lib/format";
import { primaryNavigation } from "@/lib/navigation";
import { getBriefingService } from "@/services/briefing/service";
import { getEditorialService } from "@/services/editorial";

export const metadata: Metadata = {
  title: "Weekly Briefing",
  description:
    "The wine market, once a week: the national bulk wine averages, the regional markets and the monthly prices published in the week, written from the figures every Friday.",
};

// The editions read the price series; regenerate at most hourly.
export const revalidate = 3600;

export default async function WeeklyBriefingPage() {
  const editions = await getBriefingService().getEditions();
  const [current, ...past] = editions;

  // Without real series (no database configured) the page shows the
  // illustrative sample editions, labelled as such.
  const samples = current ? [] : await getEditorialService().getBriefingEditions();

  return (
    <Container className="pb-16">
      <SectionPageHeader
        section={primaryNavigation[3]}
        crumbs={[
          { label: "Insights", href: "/insights" },
          { label: "Weekly Briefing" },
        ]}
        kicker="Insights"
        title="Weekly Briefing"
        description="The week in bulk wine prices, every Friday: the national averages, the regional markets quoted and the monthly prices published, written from the series themselves."
        activeHref="/insights/weekly-briefing"
      />

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div>
          {current ? (
            <WeeklyBriefingEdition edition={current} />
          ) : (
            <>
              <DevContentNotice text="Development content: no price series is connected in this build, so the editions below are illustrative placeholders demonstrating the briefing format." />
              {samples[0] ? (
                <article className="mt-6 border border-rule border-t-2 border-t-wine bg-paper px-5 py-4">
                  <p className="wt-label text-wine">
                    Sample edition
                    <span aria-hidden="true" className="mx-2 text-rule">
                      &middot;
                    </span>
                    {formatDate(samples[0].date)}
                  </p>
                  <h2 className="wt-headline mt-2 text-2xl leading-snug font-semibold text-ink">
                    {samples[0].headline}
                  </h2>
                  <p className="mt-2.5 text-sm leading-relaxed text-ink-soft">
                    {samples[0].summary}
                  </p>
                </article>
              ) : null}
            </>
          )}

          {past.length > 0 ? (
            <section className="mt-10">
              <SectionHeader
                kicker="Archive"
                title="Past editions"
                description="Each edition as it would have read on its Friday, from the series as they stood that day."
              />
              <ul className="mt-5 border border-rule bg-paper">
                {past.map((edition) => (
                  <li
                    key={edition.id}
                    className="border-b border-rule px-4 py-3.5 last:border-b-0"
                  >
                    <p className="wt-label text-ink-soft">
                      <time dateTime={edition.date}>{formatDate(edition.date)}</time>
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
          ) : null}
        </div>

        <aside>
          <NewsletterSignup />
          <p className="mt-4 text-sm leading-relaxed text-ink-soft">
            Each edition is written from the price series on Friday, so the
            web edition and the e-mail say the same. E-mail delivery starts
            with the launch; the archive above is live now.
          </p>
        </aside>
      </div>
    </Container>
  );
}
