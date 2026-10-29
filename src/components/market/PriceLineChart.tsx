"use client";

import dynamic from "next/dynamic";

import { ChartBox } from "@/components/charts/ChartBox";
import type { PricePoint } from "@/services/types";

/**
 * Recharts draws in the browser only, so its plot is loaded apart from
 * the page, when its ChartBox comes near the screen.
 */
const PriceLinePlot = dynamic(
  () => import("@/components/market/PriceLinePlot").then((m) => m.PriceLinePlot),
  { ssr: false },
);

/**
 * Restrained single-series line chart. Flat colours from the design
 * tokens, thin rules, monospace ticks; no gradients or decoration.
 * Rendered inside a ChartFrame.
 */
export function PriceLineChart({
  points,
  unit,
  height = 260,
}: {
  points: PricePoint[];
  unit: string;
  height?: number;
}) {
  return (
    <ChartBox height={height}>
      <PriceLinePlot points={points} unit={unit} />
    </ChartBox>
  );
}
