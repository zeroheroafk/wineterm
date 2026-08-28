import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
