/**
 * Editorial content service.
 *
 * Same pattern as the market data service: a typed interface with a
 * fixture-backed implementation, swappable for a CMS or database later.
 */

import { sampleArticles } from "@/fixtures/editorial";
import type { Article, ArticleKind } from "@/services/types";

export interface EditorialService {
  getLatestArticles(limit?: number): Promise<Article[]>;
  getArticlesByKind(kind: ArticleKind, limit?: number): Promise<Article[]>;
}

class FixtureEditorialService implements EditorialService {
  async getLatestArticles(limit = 10): Promise<Article[]> {
    return [...sampleArticles]
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
      .slice(0, limit);
  }

  async getArticlesByKind(kind: ArticleKind, limit = 10): Promise<Article[]> {
    return sampleArticles.filter((a) => a.kind === kind).slice(0, limit);
  }
}

let service: EditorialService | null = null;

export function getEditorialService(): EditorialService {
  service ??= new FixtureEditorialService();
  return service;
}
