"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatDate, formatPrice } from "@/lib/format";
import type { PricePoint } from "@/services/types";

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
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={points}
          margin={{ top: 8, right: 12, bottom: 0, left: 0 }}
        >
          <CartesianGrid
            stroke="var(--wt-rule)"
            strokeWidth={1}
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tickFormatter={(value: string) => formatDate(value)}
            tick={{
              fill: "var(--wt-ink-soft)",
              fontSize: 10,
              fontFamily: "var(--font-mono)",
            }}
            tickLine={false}
            axisLine={{ stroke: "var(--wt-rule)" }}
            minTickGap={40}
          />
          <YAxis
            width={44}
            domain={["auto", "auto"]}
            tickFormatter={(value: number) => formatPrice(value)}
            tick={{
              fill: "var(--wt-ink-soft)",
              fontSize: 10,
              fontFamily: "var(--font-mono)",
            }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            cursor={{ stroke: "var(--wt-ink-soft)", strokeDasharray: "3 3" }}
            contentStyle={{
              background: "var(--wt-paper)",
              border: "1px solid var(--wt-rule)",
              borderRadius: 0,
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--wt-ink)",
            }}
            labelFormatter={(value) => formatDate(String(value))}
            formatter={(value) => [
              `${formatPrice(Number(value))} ${unit}`,
              undefined,
            ]}
          />
          <Line
            type="linear"
            dataKey="value"
            stroke="var(--wt-wine)"
            strokeWidth={1.5}
            dot={false}
            activeDot={{
              r: 3,
              fill: "var(--wt-wine)",
              stroke: "var(--wt-paper)",
            }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
