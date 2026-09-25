/**
 * Editorial content service.
 *
 * Typed interface with a fixture-backed implementation, swappable for a
 * CMS later. Serves news, analysis, Weekly Briefing editions and
 * monthly reports for the Insights section.
 */

import {
  analysisArticles,
  briefingEditions,
  monthlyReports,
  newsArticles,
} from "@/fixtures/insights";
import type {
  Article,
  ArticleKind,
  BriefingEdition,
  MonthlyReport,
} from "@/services/types";

export interface EditorialService {
  getLatestArticles(limit?: number): Promise<Article[]>;
  getArticlesByKind(kind: ArticleKind, limit?: number): Promise<Article[]>;
  getBriefingEditions(): Promise<BriefingEdition[]>;
  getMonthlyReports(): Promise<MonthlyReport[]>;
}

const allArticles = [...newsArticles, ...analysisArticles];

class FixtureEditorialService implements EditorialService {
  async getLatestArticles(limit = 10): Promise<Article[]> {
    return [...allArticles]
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
      .slice(0, limit);
  }

  async getArticlesByKind(kind: ArticleKind, limit = 20): Promise<Article[]> {
    return allArticles
      .filter((a) => a.kind === kind)
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
      .slice(0, limit);
  }

  async getBriefingEditions(): Promise<BriefingEdition[]> {
    return [...briefingEditions].sort((a, b) => b.date.localeCompare(a.date));
  }

  async getMonthlyReports(): Promise<MonthlyReport[]> {
    return monthlyReports;
  }
}

let service: EditorialService | null = null;

export function getEditorialService(): EditorialService {
  service ??= new FixtureEditorialService();
  return service;
}
