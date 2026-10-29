import type { MetadataRoute } from "next";
import { cacheLife } from "next/cache";

import { publishedArticles } from "@/content/articles";
import { SITE_URL } from "@/lib/site";
import { getMarketsService } from "@/services/markets/service";

/**
 * Public sitemap. Only routes with content are listed: /design-system is
 * internal and is deliberately excluded (and disallowed in robots.ts),
 * and the pages navigation.ts keeps out of the menus are left out too.
 * Series pages are the markets catalogue's: the imported series, read at
 * most hourly.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  "use cache";
  cacheLife("hours");

  const base = SITE_URL;
  const markets = getMarketsService();
  const series = await markets.listSeries();
  const rows = await Promise.all(series.map((s) => markets.getRow(s.code)));
  // lastmod is the one field Google reads, and only when it is accurate:
  // when the latest price was recorded, when an article was published.
  const seriesEntries: MetadataRoute.Sitemap = series.map((s, index) => ({
    url: `${base}/markets/series/${s.code}`,
    lastModified: rows[index]?.latest.updatedAt,
    changeFrequency: "weekly",
    priority: 0.5,
  }));
  const articleEntries: MetadataRoute.Sitemap = publishedArticles.map((a) => ({
    url: `${base}${a.href}`,
    lastModified: a.publishedAt,
    changeFrequency: "monthly",
    priority: 0.6,
  }));
  return [
    { url: `${base}/`, changeFrequency: "daily", priority: 1 },
    { url: `${base}/markets`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/markets/bulk-wine`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/markets/compare`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/data`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/trade`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/consumer`, changeFrequency: "weekly", priority: 0.8 },
    {
      url: `${base}/consumer/bottle-prices`,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${base}/consumer/shop-prices`,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    { url: `${base}/insights`, changeFrequency: "daily", priority: 0.8 },
    {
      url: `${base}/insights/analysis`,
      changeFrequency: "daily",
      priority: 0.7,
    },
    ...articleEntries,
    {
      url: `${base}/insights/weekly-briefing`,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${base}/insights/monthly-reports`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${base}/insights/methodology`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    { url: `${base}/insights/news`, changeFrequency: "daily", priority: 0.7 },
    ...(
      [
        "companies",
        "deals",
        "regulation",
        "technology",
        "packaging-logistics",
      ] as const
    ).map((topic) => ({
      url: `${base}/insights/news/${topic}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    { url: `${base}/companies`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/contact`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/terms`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/briefing`, changeFrequency: "monthly", priority: 0.6 },
    ...seriesEntries,
  ];
}
