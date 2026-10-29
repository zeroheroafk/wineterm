import type { NextConfig } from "next";

import { SITE_URL } from "./src/lib/site";

/**
 * The project's vercel.app address, which serves the production site as
 * well as the custom domain. It redirects to the canonical origin, so
 * search engines find one copy of each page.
 */
const VERCEL_APP_HOST = "wineterm.vercel.app";

const nextConfig: NextConfig = {
  // Pages are prerendered as static shells; the database reads behind
  // them are cached with "use cache" and refreshed hourly (cacheLife).
  cacheComponents: true,
  async headers() {
    // The headers a public site is expected to send. A Content Security
    // Policy is left for a pass of its own: the inline scripts of the
    // framework and the chart styles need allowing one by one.
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
        ],
      },
    ];
  },
  async redirects() {
    // Early information architecture used /crop-supply/*; the built
    // sections live at /supply, /harvest and /trade.
    return [
      ...(new URL(SITE_URL).host === VERCEL_APP_HOST
        ? []
        : [
            {
              source: "/:path*",
              has: [{ type: "host" as const, value: VERCEL_APP_HOST }],
              destination: `${SITE_URL}/:path*`,
              permanent: true,
            },
          ]),
      { source: "/crop-supply", destination: "/supply", permanent: true },
      {
        source: "/crop-supply/production",
        destination: "/supply/production",
        permanent: true,
      },
      {
        source: "/crop-supply/stocks",
        destination: "/supply/stocks",
        permanent: true,
      },
      {
        source: "/crop-supply/availability",
        destination: "/supply",
        permanent: true,
      },
      { source: "/crop-supply/harvest", destination: "/harvest", permanent: true },
      { source: "/crop-supply/weather", destination: "/harvest", permanent: true },
      { source: "/markets/comparison", destination: "/markets/compare", permanent: true },
      { source: "/trade/flows", destination: "/trade", permanent: true },
      { source: "/trade/bulk", destination: "/trade", permanent: true },
      { source: "/trade/bottled", destination: "/trade", permanent: true },
      { source: "/trade/sparkling", destination: "/trade", permanent: true },
      // Industry's stories became Insights > News, its topics the news
      // filters, and the directory the Companies tab.
      { source: "/industry", destination: "/insights/news", permanent: true },
      {
        source: "/industry/:topic",
        destination: "/insights/news/:topic",
        permanent: true,
      },
      { source: "/directory", destination: "/companies", permanent: true },
    ];
  },
};

export default nextConfig;
