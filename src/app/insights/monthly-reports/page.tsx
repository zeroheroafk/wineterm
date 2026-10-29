import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/layout/Container";
import { SectionPageHeader } from "@/components/layout/SectionPageHeader";
import { formatDate } from "@/lib/format";
import { primaryNavigation } from "@/lib/navigation";
import { getEditorialService } from "@/services/editorial";

export const metadata: Metadata = {
  title: "Monthly Wine Market Reports",
  description:
    "Structured monthly reviews of the wine market: prices, supply, stocks and trade in one dated document.",
  alternates: { canonical: "/insights/monthly-reports" },
};

/** The parts every report runs through, as the published ones do. */
const CONTENTS: { label: string; description: string }[] = [
  {
    label: "Prices",
    description:
      "Where the month closed in the official ex-winery prices for bulk wine, against a year earlier.",
  },
  {
    label: "Stocks",
    description:
      "Wine made and wine in the cellars, from the official monthly declarations.",
  },
  {
    label: "Trade",
    description:
      "Exports of Spain, Portugal, France and Italy to date: volumes, values and the bulk share.",
  },
  {
    label: "Harvest",
    description: "The official production estimates of the new crop, country by country.",
  },
  {
    label: "What to watch",
    description: "The figures and decisions due in the month ahead.",
  },
];

export default async function MonthlyReportsPage() {
  const reports = await getEditorialService().getArticlesByKind("monthly-report");

  return (
    <Container className="pb-16">
      <SectionPageHeader
        section={primaryNavigation[6]}
        crumbs={[
          { label: "Insights", href: "/insights" },
          { label: "Monthly Reports" },
        ]}
        kicker="Insights"
        title="Monthly Reports"
        description="A structured review of each month: prices by market and category, the supply balance, stocks and trade, in one dated document professionals can file and cite."
        activeHref="/insights/monthly-reports"
      />

      <ul className="mt-8 max-w-3xl border border-rule bg-paper">
        {reports.map((report) => (
          <li
            key={report.id}
            className="border-b border-rule px-5 py-4 last:border-b-0"
          >
            <p className="wt-label text-wine">
              <time dateTime={report.publishedAt}>{formatDate(report.publishedAt)}</time>
            </p>
            <h2 className="wt-headline mt-1 text-xl font-semibold text-ink">
              <Link href={report.href} className="hover:text-wine">
                {report.headline}
              </Link>
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
              {report.standfirst}
            </p>
          </li>
        ))}
      </ul>

      <section aria-labelledby="report-contents" className="mt-10 max-w-3xl">
        <h2
          id="report-contents"
          className="wt-headline text-xl font-semibold text-ink"
        >
          What each report covers
        </h2>
        <dl className="mt-3 border-t border-rule">
          {CONTENTS.map((part) => (
            <div
              key={part.label}
              className="grid grid-cols-[7.5rem_minmax(0,1fr)] gap-3 border-b border-rule py-2.5"
            >
              <dt className="wt-label pt-0.5 text-wine">{part.label}</dt>
              <dd className="text-sm leading-relaxed text-ink">{part.description}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="wt-label mt-6 max-w-3xl leading-relaxed text-ink-soft">
        Between reports, the{" "}
        <Link
          href="/insights/weekly-briefing"
          className="text-wine underline decoration-rule underline-offset-2 hover:text-wine-deep"
        >
          Weekly Briefing
        </Link>{" "}
        covers the week to week.
      </p>
    </Container>
  );
}
