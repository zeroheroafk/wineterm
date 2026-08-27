import type { MetadataRoute } from "next";

import { seriesFixtures } from "@/fixtures/markets/series";

/**
 * Public sitemap. Only launched routes are listed; /design-system is
 * internal and is deliberately excluded (and disallowed in robots.ts).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://wineterm.example";
  const seriesEntries: MetadataRoute.Sitemap = seriesFixtures.map((f) => ({
    url: `${base}/markets/series/${f.series.code}`,
    changeFrequency: "weekly",
    priority: 0.5,
  }));
  return [
    { url: `${base}/`, changeFrequency: "daily", priority: 1 },
    { url: `${base}/markets`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/markets/bulk-wine`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/markets/grapes`, changeFrequency: "daily", priority: 0.8 },
    {
      url: `${base}/markets/must-concentrates`,
      changeFrequency: "daily",
      priority: 0.8,
    },
    { url: `${base}/markets/compare`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/briefing`, changeFrequency: "monthly", priority: 0.6 },
    ...seriesEntries,
  ];
}
