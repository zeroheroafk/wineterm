import type { MetadataRoute } from "next";

/**
 * Public sitemap. Only launched routes are listed; /design-system is
 * internal and is deliberately excluded (and disallowed in robots.ts).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://wineterm.example";
  return [
    { url: `${base}/`, changeFrequency: "daily", priority: 1 },
    { url: `${base}/briefing`, changeFrequency: "monthly", priority: 0.6 },
  ];
}
