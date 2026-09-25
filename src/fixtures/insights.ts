/**
 * ILLUSTRATIVE FIXTURE DATA: editorial content for the Insights section.
 *
 * Development placeholders demonstrating the editorial surfaces. None of
 * these articles, briefings or reports is published journalism; pages
 * that render them carry a visible development-content notice. Headlines
 * reference no real company, transaction or person. See
 * src/fixtures/README.md.
 */

import {
  homeLeadAnalysis,
  homeSecondaryAnalysis,
} from "@/fixtures/home";
import type { Article, BriefingEdition, MonthlyReport } from "@/services/types";

export const newsArticles: Article[] = [
  {
    id: "nw-1",
    kind: "news",
    section: "Bulk Market",
    headline: "Early cover buying meets thin spot availability in generic red",
    standfirst:
      "Buyers brought forward campaign cover this week while old-vintage parcels grew scarce across the Iberian trading centres.",
    publishedAt: "2026-08-21T06:30:00Z",
    readingMinutes: 3,
    href: "/insights/news",
  },
  {
    id: "nw-2",
    kind: "news",
    section: "Crop & Supply",
    headline: "Spain's first estimate points above last campaign",
    standfirst:
      "The opening national estimate places the crop above 2025, with white varieties carrying the increase and dryland reds limiting the upside.",
    publishedAt: "2026-08-20T15:00:00Z",
    readingMinutes: 3,
    href: "/insights/news",
  },
  {
    id: "nw-3",
    kind: "news",
    section: "Regulation",
    headline: "Crisis distillation criteria for 2026/27 under committee review",
    standfirst:
      "Member state representatives weighed eligibility rules ahead of the new campaign, with volumes and reference prices still open.",
    publishedAt: "2026-08-20T11:00:00Z",
    readingMinutes: 4,
    href: "/insights/news",
  },
  {
    id: "nw-4",
    kind: "news",
    section: "Harvest",
    headline: "Heat spike stresses unirrigated plots on the Iberian plateau",
    standfirst:
      "Field reports describe reduced berry size in dryland reds after the mid-August episode; irrigated vineyards remain in good condition.",
    publishedAt: "2026-08-19T09:00:00Z",
    readingMinutes: 2,
    href: "/insights/news",
  },
  {
    id: "nw-5",
    kind: "news",
    section: "Trade",
    headline: "Bulk shipments run behind last season for a second year",
    standfirst:
      "Twelve-month volumes declined again across the main origins, with value roughly held by higher unit values.",
    publishedAt: "2026-08-18T14:00:00Z",
    readingMinutes: 3,
    href: "/insights/news",
  },
  {
    id: "nw-6",
    kind: "news",
    section: "Must & Concentrates",
    headline: "RCGM quotations steady into the new campaign",
    standfirst:
      "Concentrate demand is described as routine ahead of the first must availability, with quotations unchanged for a fourth week.",
    publishedAt: "2026-08-17T10:00:00Z",
    readingMinutes: 2,
    href: "/insights/news",
  },
];

export const analysisArticles: Article[] = [
  homeLeadAnalysis,
  ...homeSecondaryAnalysis,
  {
    id: "an-4",
    kind: "analysis",
    section: "Stocks",
    headline: "Why the stock rebuild is smaller than it looks",
    standfirst:
      "Reported stocks rose in Spain, but the increase reflects weak exports as much as supply, and coverage in months of use remains below the recent norm.",
    publishedAt: "2026-08-14T07:00:00Z",
    readingMinutes: 5,
    href: "/insights/analysis",
  },
  {
    id: "an-5",
    kind: "analysis",
    section: "Grapes",
    headline: "What buyer announcements do and do not tell you about grape prices",
    standfirst:
      "Opening announcements anchor negotiations but settle differently by region and variety; provenance matters more than the headline number.",
    publishedAt: "2026-08-12T07:00:00Z",
    readingMinutes: 4,
    href: "/insights/analysis",
  },
];

export const briefingEditions: BriefingEdition[] = [
  {
    id: "wb-2026-08-21",
    date: "2026-08-21",
    headline: "Firm into the vintage",
    summary:
      "Generic red firmed on early cover buying, first estimates left no margin for a weather setback in Iberia, and whites stayed comfortable. Plus: the harvest map at opening week.",
    isCurrent: true,
  },
  {
    id: "wb-2026-08-14",
    date: "2026-08-14",
    headline: "Estimates season opens",
    summary:
      "The first private crop estimates set the range for the campaign, stocks closed 2025/26 at a five-campaign low, and bulk trade volumes kept contracting.",
    isCurrent: false,
  },
  {
    id: "wb-2026-08-07",
    date: "2026-08-07",
    headline: "Quiet close to the old campaign",
    summary:
      "Spot business thinned ahead of the balance turn, PDO bulk ranges held on light volume, and the south prepared for an early start in whites.",
    isCurrent: false,
  },
  {
    id: "wb-2026-07-31",
    date: "2026-07-31",
    headline: "Campaign close: the balance sheet",
    summary:
      "A closing review of 2025/26: what moved, what did not, and the positions the market carries into the new campaign.",
    isCurrent: false,
  },
];

export const monthlyReports: MonthlyReport[] = [
  {
    id: "mr-2026-07",
    month: "July 2026",
    title: "Market Report, July 2026",
    summary:
      "Campaign closing review: prices by market and category, the supply balance as declared, trade by customs heading, and the setup for 2026/27.",
    status: "scheduled",
  },
  {
    id: "mr-2026-06",
    month: "June 2026",
    title: "Market Report, June 2026",
    summary:
      "Late-campaign conditions: stock coverage by country, export performance at eleven months, and early vineyard indicators for the coming harvest.",
    status: "scheduled",
  },
];
