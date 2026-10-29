"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";

import { ChartBox } from "@/components/charts/ChartBox";
import type { ComparePlot as Plot } from "@/components/markets/ComparePlot";

export type { ComparePoint, CompareSeriesMeta } from "@/components/markets/ComparePlot";

/**
 * Recharts draws in the browser only, so its plot is loaded apart from
 * the page, when its ChartBox comes near the screen.
 */
const ComparePlot = dynamic(
  () => import("@/components/markets/ComparePlot").then((m) => m.ComparePlot),
  { ssr: false },
);

/**
 * Multi-series comparison chart in the restrained WineTerm chart idiom:
 * thin flat lines, mono ticks, one shared unit axis.
 */
export function CompareChart({ height = 320, ...props }: ComponentProps<typeof Plot>) {
  return (
    <ChartBox height={height}>
      <ComparePlot {...props} height={height} />
    </ChartBox>
  );
}
