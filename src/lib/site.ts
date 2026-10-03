export const SITE_NAME = "WineTerm";

export const SITE_DESCRIPTION =
  "Prices, production, stocks, trade and crop intelligence for wineries, growers and the global wine trade.";

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

/**
 * Search engines may index the site only once SITE_INDEXABLE=true is set
 * in the production environment. Until then every page carries noindex,
 * so preview and development builds never surface in search results.
 */
export const SITE_INDEXABLE = process.env.SITE_INDEXABLE === "true";
