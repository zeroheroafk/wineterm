/**
 * ILLUSTRATIVE FIXTURE DATA.
 *
 * Sample editorial items used only to demonstrate article components.
 * Headlines are generic and reference no real company, transaction or
 * event. See src/fixtures/README.md.
 */

import type { Article } from "@/services/types";

export const sampleArticles: Article[] = [
  {
    id: "a-sample-1",
    kind: "analysis",
    section: "Bulk Market",
    headline: "Sample headline: what a short harvest would mean for generic red prices",
    standfirst:
      "Illustrative standfirst text showing how a two line summary sits under an analysis headline in the editorial preview component.",
    publishedAt: "2026-08-21T07:00:00Z",
    readingMinutes: 6,
    href: "/insights/analysis",
  },
  {
    id: "a-sample-2",
    kind: "news",
    section: "Regulation",
    headline: "Sample headline: reading an EU vineyard measure in five paragraphs",
    standfirst:
      "Illustrative standfirst text for a news item, kept to a single sentence so list layouts stay compact.",
    publishedAt: "2026-08-20T16:30:00Z",
    readingMinutes: 3,
    href: "/insights/news",
  },
  {
    id: "a-sample-3",
    kind: "weekly-briefing",
    section: "Weekly Briefing",
    headline: "Sample headline: the week in wine markets",
    standfirst:
      "Illustrative standfirst text for the weekly briefing preview, which links to the full dated edition.",
    publishedAt: "2026-08-15T06:00:00Z",
    readingMinutes: 9,
    href: "/insights/weekly-briefing",
  },
];
