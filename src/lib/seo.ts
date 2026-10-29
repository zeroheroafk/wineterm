/**
 * What search engines and link previews read beyond a page's title and
 * description: share cards, structured data, and the robots of pages
 * kept out of the index.
 */

import type { Metadata } from "next";

import { SITE_URL } from "@/lib/site";
import type { ArticleDetail } from "@/services/types";

export const SITE_NAME = "WineTerm";

/**
 * Robots of a page that answers but is kept out of the menus and the
 * sitemap (see navigation.ts): out of search results even once the site
 * is indexable, its links still followed. Drop it when the page is listed.
 */
export const UNLISTED_ROBOTS: Metadata["robots"] = { index: false, follow: true };

/**
 * Open Graph fields every page shares. A page that sets its own
 * openGraph replaces the layout's whole, so it spreads these first.
 */
export const SITE_OPEN_GRAPH = {
  siteName: SITE_NAME,
  locale: "en_GB",
} as const;

/**
 * The site's share card, app/opengraph-image.png. A page that sets its
 * own openGraph loses the file's card, so it names it when it has no
 * picture of its own.
 */
const SITE_SHARE_IMAGE = {
  url: "/opengraph-image.png",
  width: 1200,
  height: 630,
  alt: SITE_NAME,
};

/** A path on the canonical origin, as structured data needs it. */
export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path}`;
}

/** WineTerm as the author and publisher in structured data. */
export function organizationJsonLd() {
  return {
    "@type": "Organization",
    name: SITE_NAME,
    url: absoluteUrl("/"),
    logo: absoluteUrl("/apple-icon.png"),
  };
}

/**
 * Metadata of an Insights article: its canonical address, and a share
 * card of the article type that shows its photograph, or the site's card
 * when it has none.
 */
export function articleMetadata(article: ArticleDetail): Metadata {
  return {
    title: article.headline,
    description: article.standfirst,
    alternates: { canonical: article.href },
    openGraph: {
      ...SITE_OPEN_GRAPH,
      type: "article",
      url: article.href,
      title: article.headline,
      description: article.standfirst,
      publishedTime: article.publishedAt,
      section: article.section,
      images: [
        article.hero
          ? {
              url: article.hero.src,
              width: article.hero.width,
              height: article.hero.height,
              alt: article.hero.alt,
            }
          : SITE_SHARE_IMAGE,
      ],
    },
  };
}

/** NewsArticle structured data for an Insights article. */
export function articleJsonLd(article: ArticleDetail) {
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.headline,
    description: article.standfirst,
    datePublished: article.publishedAt,
    articleSection: article.section,
    image: absoluteUrl(article.hero?.src ?? SITE_SHARE_IMAGE.url),
    url: absoluteUrl(article.href),
    mainEntityOfPage: absoluteUrl(article.href),
    isAccessibleForFree: true,
    author: organizationJsonLd(),
    publisher: organizationJsonLd(),
  };
}
