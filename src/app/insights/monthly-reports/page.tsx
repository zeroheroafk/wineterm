import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/layout/Container";
import { SectionPageHeader } from "@/components/layout/SectionPageHeader";
import { formatDate } from "@/lib/format";
import { primaryNavigation } from "@/lib/navigation";
import { getEditorialService } from "@/services/editorial";

export const metadata: Metadata = {
  title: "Monthly Reports",
  description:
    "Structured monthly reviews of the wine market: prices, supply, stocks and trade in one dated document.",
};

export default async function MonthlyReportsPage() {
  const reports = await getEditorialService().getArticlesByKind("monthly-report");

  return (
    <Container className="pb-16">
      <SectionPageHeader
        section={primaryNavigation[4]}
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

      <p className="wt-label mt-6 max-w-3xl leading-relaxed text-ink-soft">
        Between reports, the{" "}
        <Link
          href="/outlook"
          className="text-wine underline decoration-rule underline-offset-2 hover:text-wine-deep"
        >
          Market Outlook
        </Link>{" "}
        carries the desk&apos;s structured view, and the{" "}
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
