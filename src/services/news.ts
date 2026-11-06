/**
 * News service.
 *
 * Typed interface, swappable for a CMS later. Serves the news stories
 * that lead the homepage and the News section: for now the illustrative
 * fixtures in src/fixtures/news.ts, each with its hero image and tags.
 */

import { newsStories } from "@/fixtures/news";
import {
  NEWS_TOPICS,
  type NewsStory,
  type NewsTopic,
} from "@/services/types";

export interface NewsService {
  /** Newest first; stories published at the same time keep their order. */
  getLatestStories(limit?: number): Promise<NewsStory[]>;
  getStoriesByTopic(topic: NewsTopic): Promise<NewsStory[]>;
  getStory(id: string): Promise<NewsStory | null>;
  /**
   * Other stories sharing a topic with the given one, those sharing the
   * most first, then the newest.
   */
  getRelatedStories(id: string, limit?: number): Promise<NewsStory[]>;
  getTopicCounts(): Promise<Record<NewsTopic, number>>;
}

function newestFirst(stories: NewsStory[]): NewsStory[] {
  // Array.prototype.sort is stable, so equal times keep fixture order.
  return [...stories].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

class FixtureNewsService implements NewsService {
  async getLatestStories(limit = 20): Promise<NewsStory[]> {
    return newestFirst(newsStories).slice(0, limit);
  }

  async getStoriesByTopic(topic: NewsTopic): Promise<NewsStory[]> {
    return newestFirst(newsStories.filter((s) => s.topics.includes(topic)));
  }

  async getStory(id: string): Promise<NewsStory | null> {
    return newsStories.find((s) => s.id === id) ?? null;
  }

  async getRelatedStories(id: string, limit = 3): Promise<NewsStory[]> {
    const story = await this.getStory(id);
    if (!story) return [];
    const shared = (other: NewsStory) =>
      other.topics.filter((topic) => story.topics.includes(topic)).length;
    return newestFirst(newsStories)
      .filter((other) => other.id !== id && shared(other) > 0)
      .sort((a, b) => shared(b) - shared(a))
      .slice(0, limit);
  }

  async getTopicCounts(): Promise<Record<NewsTopic, number>> {
    const counts = Object.fromEntries(
      NEWS_TOPICS.map((topic) => [topic, 0]),
    ) as Record<NewsTopic, number>;
    for (const story of newsStories) {
      for (const topic of story.topics) counts[topic] += 1;
    }
    return counts;
  }
}

let service: NewsService | null = null;

export function getNewsService(): NewsService {
  service ??= new FixtureNewsService();
  return service;
}
