import type { Metadata } from "next";

import { NewsStories } from "@/components/editorial/NewsStories";
import { Container } from "@/components/layout/Container";
import { SectionPageHeader } from "@/components/layout/SectionPageHeader";
import { primaryNavigation } from "@/lib/navigation";
import { getIndustryService } from "@/services/industry";

export const metadata: Metadata = {
  title: "Wine Industry News",
  description:
    "Industry news for the professional wine trade: companies, deals and investments, regulation, technology, packaging and logistics.",
  alternates: { canonical: "/insights/news" },
};

export default async function NewsPage() {
  const stories = await getIndustryService().getLatestStories();

  return (
    <Container className="pb-16">
      <SectionPageHeader
        section={primaryNavigation[6]}
        crumbs={[{ label: "Insights", href: "/insights" }, { label: "News" }]}
        kicker="Insights"
        title="News"
        description="The business side of the wine market: who is investing, consolidating, regulating and shipping. Filter by topic: companies, deals, regulation, technology, packaging and logistics."
        activeHref="/insights/news"
      />
      <NewsStories stories={stories} />
    </Container>
  );
}
