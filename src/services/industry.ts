/**
 * Industry coverage service: fixture-backed stories by topic, swappable
 * for a CMS later.
 */

import { industryStories } from "@/fixtures/industry";
import type { IndustryStory, IndustryTopic } from "@/services/types";

export interface IndustryService {
  getLatestStories(limit?: number): Promise<IndustryStory[]>;
  getStoriesByTopic(topic: IndustryTopic): Promise<IndustryStory[]>;
  getTopicCounts(): Promise<Record<IndustryTopic, number>>;
}

class FixtureIndustryService implements IndustryService {
  async getLatestStories(limit = 8): Promise<IndustryStory[]> {
    return [...industryStories]
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
      .slice(0, limit);
  }

  async getStoriesByTopic(topic: IndustryTopic): Promise<IndustryStory[]> {
    return industryStories
      .filter((s) => s.topic === topic)
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  }

  async getTopicCounts(): Promise<Record<IndustryTopic, number>> {
    const counts = {
      companies: 0,
      deals: 0,
      regulation: 0,
      technology: 0,
      "packaging-logistics": 0,
    } as Record<IndustryTopic, number>;
    for (const story of industryStories) counts[story.topic] += 1;
    return counts;
  }
}

let service: IndustryService | null = null;

export function getIndustryService(): IndustryService {
  service ??= new FixtureIndustryService();
  return service;
}
