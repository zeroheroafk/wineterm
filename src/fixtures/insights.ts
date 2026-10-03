/**
 * ILLUSTRATIVE FIXTURE DATA: Weekly Briefing editions for the Insights
 * section.
 *
 * Development placeholders demonstrating the editorial surfaces. None of
 * these briefings is published journalism; pages that render
 * them carry a visible development-content notice. Headlines reference no
 * real company, transaction or person. Published articles live in
 * src/content. See src/fixtures/README.md.
 */

import type { BriefingEdition } from "@/services/types";

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
