/**
 * Editorial content service.
 *
 * Typed interface, swappable for a CMS later. Serves the published
 * articles in src/content for the Insights section, and the Weekly
 * Briefing editions, which are still fixtures.
 */

import { publishedArticles } from "@/content/articles";
import { briefingEditions } from "@/fixtures/insights";
import type {
  Article,
  ArticleDetail,
  ArticleKind,
  BriefingEdition,
} from "@/services/types";

export interface EditorialService {
  getLatestArticles(limit?: number): Promise<Article[]>;
  getArticlesByKind(kind: ArticleKind, limit?: number): Promise<Article[]>;
  /** One article with its full text, by id. */
  getArticle(id: string): Promise<ArticleDetail | null>;
  getBriefingEditions(): Promise<BriefingEdition[]>;
}

class StaticEditorialService implements EditorialService {
  async getLatestArticles(limit = 10): Promise<Article[]> {
    return [...publishedArticles]
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
      .slice(0, limit);
  }

  async getArticlesByKind(kind: ArticleKind, limit = 20): Promise<Article[]> {
    return publishedArticles
      .filter((a) => a.kind === kind)
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
      .slice(0, limit);
  }

  async getArticle(id: string): Promise<ArticleDetail | null> {
    return publishedArticles.find((a) => a.id === id) ?? null;
  }

  async getBriefingEditions(): Promise<BriefingEdition[]> {
    return [...briefingEditions].sort((a, b) => b.date.localeCompare(a.date));
  }
}

let service: EditorialService | null = null;

export function getEditorialService(): EditorialService {
  service ??= new StaticEditorialService();
  return service;
}
