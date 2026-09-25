/**
 * ILLUSTRATIVE FIXTURE DATA: industry coverage stories.
 *
 * Development placeholders for the Industry section. Headlines describe
 * generic sector developments and reference no real or invented company,
 * transaction or person. Pages rendering them carry a visible
 * development-content notice. See src/fixtures/README.md.
 */

import type { IndustryStory } from "@/services/types";

export const industryStories: IndustryStory[] = [
  // Companies
  {
    id: "co-1",
    topic: "companies",
    headline: "Cooperative consolidation continues across central Spain",
    summary:
      "Mergers between neighbouring cooperatives keep reducing the number of first-stage processors while raising average winery scale.",
    publishedAt: "2026-08-20T12:00:00Z",
  },
  {
    id: "co-2",
    topic: "companies",
    headline: "Bulk specialists widen their sourcing footprint",
    summary:
      "Trading houses active in bulk report broader multi-origin sourcing as buyers hedge a short Iberian campaign.",
    publishedAt: "2026-08-18T10:00:00Z",
  },
  {
    id: "co-3",
    topic: "companies",
    headline: "Contract bottling capacity tightens near export ports",
    summary:
      "Utilisation at port-adjacent bottling sites is running high ahead of the autumn shipping season.",
    publishedAt: "2026-08-13T09:00:00Z",
  },
  // Deals & Investments
  {
    id: "de-1",
    topic: "deals",
    headline: "Bottling capacity investment shifts closer to export ports",
    summary:
      "New filling lines are being sited for logistics rather than production geography, following the bulk-then-bottle model.",
    publishedAt: "2026-08-17T11:00:00Z",
  },
  {
    id: "de-2",
    topic: "deals",
    headline: "Vineyard transactions slow while buyers wait on the harvest",
    summary:
      "Land agents report a pause in vineyard deals until first campaign prices settle the income outlook.",
    publishedAt: "2026-08-12T10:00:00Z",
  },
  {
    id: "de-3",
    topic: "deals",
    headline: "Private capital keeps probing wine logistics assets",
    summary:
      "Interest concentrates on storage and flexitank operations, where volumes are contracted rather than consumed.",
    publishedAt: "2026-08-08T09:00:00Z",
  },
  // Regulation
  {
    id: "re-1",
    topic: "regulation",
    headline: "EU committee weighs crisis distillation criteria for 2026/27",
    summary:
      "Eligibility rules, volumes and reference prices remain open ahead of the new campaign; member states differ on scope.",
    publishedAt: "2026-08-20T14:00:00Z",
  },
  {
    id: "re-2",
    topic: "regulation",
    headline: "Vineyard planting authorisations under review in two regions",
    summary:
      "Regional authorities are reassessing authorisation volumes against structural surplus in generic segments.",
    publishedAt: "2026-08-16T09:00:00Z",
  },
  {
    id: "re-3",
    topic: "regulation",
    headline: "Labelling requirements move toward digital ingredient lists",
    summary:
      "Implementation guidance continues to firm up around on-pack codes linking to ingredient and nutrition data.",
    publishedAt: "2026-08-11T08:00:00Z",
  },
  // Technology
  {
    id: "te-1",
    topic: "technology",
    headline: "Vineyard sensor networks move from pilots to contracts",
    summary:
      "Water-status monitoring is the first application reaching commercial scale in irrigated Iberian vineyards.",
    publishedAt: "2026-08-19T10:00:00Z",
  },
  {
    id: "te-2",
    topic: "technology",
    headline: "Wineries automate intake analytics for the new campaign",
    summary:
      "Grape reception lines add inline analysis to settle quality bands at delivery rather than after fermentation.",
    publishedAt: "2026-08-14T09:00:00Z",
  },
  {
    id: "te-3",
    topic: "technology",
    headline: "Registry data opens the door to faster stock statistics",
    summary:
      "Electronic wine registries are shortening the lag between declarations and usable stock figures.",
    publishedAt: "2026-08-09T08:00:00Z",
  },
  // Packaging & Logistics
  {
    id: "pa-1",
    topic: "packaging-logistics",
    headline: "Glass and dry goods costs stabilise after two volatile years",
    summary:
      "Input quotes for bottles, closures and cartons are flat on the quarter, easing pressure on bottled margins.",
    publishedAt: "2026-08-20T10:00:00Z",
  },
  {
    id: "pa-2",
    topic: "packaging-logistics",
    headline: "Flexitank availability improves on the main Atlantic routes",
    summary:
      "Carriers report normalised equipment supply into northern Europe ahead of the post-harvest shipping peak.",
    publishedAt: "2026-08-19T09:00:00Z",
  },
  {
    id: "pa-3",
    topic: "packaging-logistics",
    headline: "Lightweight bottle share keeps climbing in export ranges",
    summary:
      "Weight reduction continues across entry and mid segments, driven by freight and emissions accounting.",
    publishedAt: "2026-08-10T09:00:00Z",
  },
];
