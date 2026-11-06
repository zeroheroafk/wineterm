import type { Metadata } from "next";

import { DevContentNotice } from "@/components/editorial/DevContentNotice";
import {
  NEWS_DEV_NOTICE,
  NewsLead,
  NewsList,
  TopicIndex,
} from "@/components/editorial/NewsList";
import { NewsletterSignup } from "@/components/editorial/NewsletterSignup";
import { Container } from "@/components/layout/Container";
import { SectionPageHeader } from "@/components/layout/SectionPageHeader";
import { navSection } from "@/lib/navigation";
import { getNewsService } from "@/services/news";

export const metadata: Metadata = {
  title: "News",
  description:
    "Wine news: brands, consumption, culture and lifestyle, with the markets, trade and regulation behind them.",
};

export default async function NewsPage() {
  const news = getNewsService();
  const [stories, counts] = await Promise.all([
    news.getLatestStories(),
    news.getTopicCounts(),
  ]);
  const [lead, ...rest] = stories;

  return (
    <Container className="pb-16">
      <SectionPageHeader
        section={navSection("/news")}
        crumbs={[{ label: "News" }]}
        kicker="News"
        title="News"
        description="The brands, drinking habits, culture and lifestyle of wine, with the markets, trade and regulation behind them."
        activeHref="/news"
      />

      <div className="mt-8">
        <DevContentNotice text={NEWS_DEV_NOTICE} />
      </div>

      {lead ? (
        <div className="mt-8">
          <NewsLead story={lead} />
        </div>
      ) : null}

      <div className="mt-10 grid grid-cols-1 gap-10 border-t border-ink pt-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-12">
        <NewsList stories={rest} headingLevel={2} />
        <aside className="space-y-10">
          <TopicIndex counts={counts} titleId="news-topics" />
          <NewsletterSignup />
        </aside>
      </div>
    </Container>
  );
}
