"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";

import { ChartBox } from "@/components/charts/ChartBox";
import type { CountryLinesPlot as Plot } from "@/components/consumer/CountryLinesPlot";

export type { CountryLine, CountryMonth } from "@/components/consumer/CountryLinesPlot";

/**
 * Recharts draws in the browser only, so its plot is loaded apart from
 * the page, when its ChartBox comes near the screen.
 */
const CountryLinesPlot = dynamic(
  () => import("@/components/consumer/CountryLinesPlot").then((m) => m.CountryLinesPlot),
  { ssr: false },
);

/**
 * Monthly lines, one per country, each in its own colour wherever it
 * appears. Two or more lines carry a legend and a label at their end;
 * a single line is named by the chart's title and labelled with its
 * latest value. Months without a figure leave a gap.
 */
export function CountryLinesChart({ height = 300, ...props }: ComponentProps<typeof Plot>) {
  return (
    <ChartBox height={height}>
      <CountryLinesPlot {...props} height={height} />
    </ChartBox>
  );
}
