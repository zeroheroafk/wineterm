/**
 * ILLUSTRATIVE FIXTURE DATA: market desk commentary per market kind.
 * Sample text demonstrating the commentary block; see fixtures/README.md.
 */

import type { MarketKind } from "@/services/markets/types";
import type { MarketCommentary } from "@/services/types";

export const marketCommentary: Record<MarketKind, MarketCommentary> = {
  "bulk-wine": {
    id: "cm-bulk",
    market: "Bulk wine",
    body: "Sample commentary for the bulk market. Generic red firmed across Iberia this week on pre-harvest cover buying, while whites stayed comfortable; PDO bulk ranges were stable on thin volume.",
    author: "WineTerm Market Desk",
    publishedAt: "2026-08-21T08:00:00Z",
  },
  grape: {
    id: "cm-grape",
    market: "Grapes",
    body: "Sample commentary for grape markets. First 2026 buyer announcements in Iberia opened above last year's settlements; official campaign averages for 2025 remain the reference until new settlements are published.",
    author: "WineTerm Market Desk",
    publishedAt: "2026-08-21T08:00:00Z",
  },
  must: {
    id: "cm-must",
    market: "Must and concentrates",
    body: "Sample commentary for must and concentrates. RCGM quotations held steady into the new campaign, with concentrate demand described as routine ahead of the first must availability.",
    author: "WineTerm Market Desk",
    publishedAt: "2026-08-21T08:00:00Z",
  },
};
