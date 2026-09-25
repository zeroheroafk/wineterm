import type { Metadata } from "next";
import Link from "next/link";

import { DevContentNotice } from "@/components/editorial/DevContentNotice";
import { StoryList } from "@/components/editorial/StoryList";
import { Container } from "@/components/layout/Container";
import { SectionPageHeader } from "@/components/layout/SectionPageHeader";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { primaryNavigation } from "@/lib/navigation";
import { getIndustryService } from "@/services/industry";
import {
  INDUSTRY_TOPIC_LABELS,
  type IndustryTopic,
} from "@/services/types";

export const metadata: Metadata = {
  title: "Industry",
  description:
    "The business of wine: companies, deals and investments, regulation, technology, packaging and logistics.",
};

const TOPIC_DESCRIPTIONS: Record<IndustryTopic, string> = {
  companies: "Wineries, cooperatives, bottlers, traders and suppliers",
  deals: "Transactions, capacity investment and consolidation",
  regulation: "EU and national rules affecting the sector",
  technology: "Winemaking, vineyard and data technology",
  "packaging-logistics": "Glass, closures, flexitanks and freight",
};

const TOPICS: IndustryTopic[] = [
  "companies",
  "deals",
  "regulation",
  "technology",
  "packaging-logistics",
];

export default async function IndustryPage() {
  const industry = getIndustryService();
  const [latest, counts] = await Promise.all([
    industry.getLatestStories(7),
    industry.getTopicCounts(),
  ]);

  return (
    <Container className="pb-16">
      <SectionPageHeader
        section={primaryNavigation[3]}
        crumbs={[{ label: "Industry" }]}
        kicker="Industry"
        title="Industry"
        description="The business side of the wine market: who is investing, consolidating, regulating and shipping, and what it means for prices and supply."
        activeHref="/industry"
      />

      <div className="mt-8">
        <DevContentNotice />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <div>
          <SectionHeader kicker="Latest" title="Latest coverage" />
          <div className="mt-5">
            <StoryList stories={latest} withTopic />
          </div>
        </div>

        <aside>
          <h2 className="wt-label border-b-2 border-ink pb-1.5 text-wine">
            Coverage areas
          </h2>
          <ul className="border-b border-rule">
            {TOPICS.map((topic) => (
              <li key={topic} className="border-t border-rule first:border-t-0">
                <Link
                  href={`/industry/${topic}`}
                  className="group flex items-baseline justify-between gap-4 py-3"
                >
                  <span>
                    <span className="block text-sm font-medium text-ink group-hover:text-wine-deep">
                      {INDUSTRY_TOPIC_LABELS[topic]}
                    </span>
                    <span className="mt-0.5 block text-xs leading-snug text-ink-soft">
                      {TOPIC_DESCRIPTIONS[topic]}
                    </span>
                  </span>
                  <span className="wt-label shrink-0 text-ink-soft">
                    {counts[topic]}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="wt-label mt-4 leading-relaxed text-ink-soft">
            Company profiles and the professional directory open with the
            Directory section at launch.
          </p>
        </aside>
      </div>
    </Container>
  );
}
