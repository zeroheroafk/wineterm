/**
 * Canonical origin for absolute URLs: metadataBase, the sitemap and
 * robots.txt. SITE_URL sets it once the production domain exists; until
 * then Vercel builds use the project's production domain and local
 * builds use localhost. No trailing slash.
 */
export const SITE_URL = (
  process.env.SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000")
).replace(/\/+$/, "");
