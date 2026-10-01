/**
 * Published Insights articles. Unlike src/fixtures, this is real
 * editorial content: each article is one file, listed here, and its
 * figures are cited to the sources it lists.
 *
 * Newest first. Lists sort by publication date and keep this order for
 * articles published the same day, so the first of them leads.
 */

import { whyASmallerHarvestMayNotLiftWinePrices } from "@/content/articles/why-a-smaller-harvest-may-not-lift-wine-prices";
import { wineTradeYouNeverSeeOnALabel } from "@/content/articles/wine-trade-you-never-see-on-a-label";
import type { ArticleDetail } from "@/services/types";

export const publishedArticles: ArticleDetail[] = [
  whyASmallerHarvestMayNotLiftWinePrices,
  wineTradeYouNeverSeeOnALabel,
];
