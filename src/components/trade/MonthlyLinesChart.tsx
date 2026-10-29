"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";

import { ChartBox } from "@/components/charts/ChartBox";
import type { MonthlyLinesPlot as Plot } from "@/components/trade/MonthlyLinesPlot";

export type { MonthlyPoint } from "@/components/trade/MonthlyLinesPlot";

/**
 * Recharts draws in the browser only, so its plot is loaded apart from
 * the page, when its ChartBox comes near the screen.
 */
const MonthlyLinesPlot = dynamic(
  () => import("@/components/trade/MonthlyLinesPlot").then((m) => m.MonthlyLinesPlot),
  { ssr: false },
);

/**
 * Monthly line chart with compact month ticks. A single series needs no
 * legend: the chart's title names it.
 */
export function MonthlyLinesChart({ height = 300, ...props }: ComponentProps<typeof Plot>) {
  return (
    <ChartBox height={height}>
      <MonthlyLinesPlot {...props} height={height} />
    </ChartBox>
  );
}
