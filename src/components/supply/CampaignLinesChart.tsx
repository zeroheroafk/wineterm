"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";

import { ChartBox } from "@/components/charts/ChartBox";
import type { CampaignLinesPlot as Plot } from "@/components/supply/CampaignLinesPlot";

export type { CampaignLine } from "@/components/supply/CampaignLinesPlot";

/**
 * Recharts draws in the browser only, so its plot is loaded apart from
 * the page, when its ChartBox comes near the screen.
 */
const CampaignLinesPlot = dynamic(
  () => import("@/components/supply/CampaignLinesPlot").then((m) => m.CampaignLinesPlot),
  { ssr: false },
);

/**
 * Month-by-month lines of whole campaigns, August to July, laid over one
 * another so each month reads against the same month a year earlier. The
 * first campaign is the one the chart is about: accent colour and its
 * latest value labelled, above or below its end away from the other
 * lines; the others are grey context. All carry an end dot and appear in
 * the legend.
 */
export function CampaignLinesChart({ height = 300, ...props }: ComponentProps<typeof Plot>) {
  return (
    <ChartBox height={height}>
      <CampaignLinesPlot {...props} height={height} />
    </ChartBox>
  );
}
