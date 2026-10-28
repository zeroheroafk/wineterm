/**
 * Industry coverage service: the published stories in src/content by
 * topic, shown as Insights > News, swappable for a CMS later.
 */

import { industryStories } from "@/content/industry";
import type { IndustryStory, IndustryTopic } from "@/services/types";

export interface IndustryService {
  /** The newest stories first; every story without a limit. */
  getLatestStories(limit?: number): Promise<IndustryStory[]>;
  getStoriesByTopic(topic: IndustryTopic): Promise<IndustryStory[]>;
}

class StaticIndustryService implements IndustryService {
  async getLatestStories(limit?: number): Promise<IndustryStory[]> {
    return [...industryStories]
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
      .slice(0, limit);
  }

  async getStoriesByTopic(topic: IndustryTopic): Promise<IndustryStory[]> {
    return industryStories
      .filter((s) => s.topic === topic)
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  }
}

let service: IndustryService | null = null;

export function getIndustryService(): IndustryService {
  service ??= new StaticIndustryService();
  return service;
}
