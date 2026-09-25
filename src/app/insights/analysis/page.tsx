import type { Metadata } from "next";
import Link from "next/link";

import { ArticlePreview } from "@/components/editorial/ArticlePreview";
import { DevContentNotice } from "@/components/editorial/DevContentNotice";
import { Container } from "@/components/layout/Container";
import { SectionPageHeader } from "@/components/layout/SectionPageHeader";
import { primaryNavigation } from "@/lib/navigation";
import { getEditorialService } from "@/services/editorial";
import { getOutlookService } from "@/services/outlook/service";

export const metadata: Metadata = {
  title: "Analysis",
  description:
    "Interpretation of prices, supply, harvest and trade for the professional wine market.",
};

export default async function AnalysisPage() {
  const [articles, edition] = await Promise.all([
    getEditorialService().getArticlesByKind("analysis"),
    getOutlookService().getCurrentEdition(),
  ]);
  const [lead, ...rest] = articles;

  return (
    <Container className="pb-16">
      <SectionPageHeader
        section={primaryNavigation[4]}
        crumbs={[
          { label: "Insights", href: "/insights" },
          { label: "Analysis" },
        ]}
        kicker="Insights"
        title="Analysis"
        description="Interpretation of what the data means: prices, supply, stocks, harvest and trade, written against the platform's own series."
        activeHref="/insights/analysis"
      />

      <div className="mt-8">
        <DevContentNotice />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <div>
          {lead ? <ArticlePreview article={lead} variant="lead" /> : null}
          <div className="mt-6 border-t-2 border-ink pt-4">
            {rest.map((article) => (
              <ArticlePreview key={article.id} article={article} />
            ))}
          </div>
        </div>
        <aside>
          <Link
            href="/outlook"
            className="group block border border-rule border-t-2 border-t-wine bg-paper px-5 py-4"
          >
            <p className="wt-label text-wine">
              Market Outlook
              <span aria-hidden="true" className="mx-2 text-rule">
                &middot;
              </span>
              {edition.edition}
            </p>
            <p className="wt-headline mt-2 text-xl leading-snug font-semibold text-ink group-hover:text-wine-deep">
              {edition.headline}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              The desk&apos;s structured view over the next one to three
              months, with the data each conclusion rests on.
            </p>
            <p className="wt-label mt-3 text-wine">Read the outlook &rarr;</p>
          </Link>
        </aside>
      </div>
    </Container>
  );
}
