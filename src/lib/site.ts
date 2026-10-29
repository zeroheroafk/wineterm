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
 * Search engines may index the site only once SITE_INDEXABLE=true is set,
 * at launch. Until then every page carries noindex, so pages still being
 * built never surface in search results.
 */
export const SITE_INDEXABLE = process.env.SITE_INDEXABLE === "true";

/**
 * Google Search Console's HTML tag token, the content of its
 * google-site-verification meta tag. Optional: a Domain property is
 * verified with a DNS record instead and needs no tag.
 */
export const GOOGLE_SITE_VERIFICATION =
  process.env.GOOGLE_SITE_VERIFICATION || undefined;
