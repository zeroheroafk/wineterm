import type { Metadata } from "next";

import { ArticlePreview } from "@/components/editorial/ArticlePreview";
import { DevContentNotice } from "@/components/editorial/DevContentNotice";
import { NewsletterSignup } from "@/components/editorial/NewsletterSignup";
import { Container } from "@/components/layout/Container";
import { SectionPageHeader } from "@/components/layout/SectionPageHeader";
import { primaryNavigation } from "@/lib/navigation";
import { getEditorialService } from "@/services/editorial";

export const metadata: Metadata = {
  title: "News",
  description:
    "Reporting for the professional wine trade: markets, supply, harvest, trade and regulation.",
};

export default async function NewsPage() {
  const articles = await getEditorialService().getArticlesByKind("news");

  return (
    <Container className="pb-16">
      <SectionPageHeader
        section={primaryNavigation[4]}
        crumbs={[{ label: "Insights", href: "/insights" }, { label: "News" }]}
        kicker="Insights"
        title="News"
        description="Short reporting for the professional trade: what moved, where and why, across markets, supply, harvest, trade and regulation."
        activeHref="/insights/news"
      />

      <div className="mt-8">
        <DevContentNotice />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <div>
          {articles.map((article) => (
            <ArticlePreview key={article.id} article={article} />
          ))}
        </div>
        <aside>
          <NewsletterSignup />
        </aside>
      </div>
    </Container>
  );
}
