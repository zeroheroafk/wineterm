import type { NextConfig } from "next";

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
    ];
  },
};

export default nextConfig;
