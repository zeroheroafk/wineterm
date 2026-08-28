"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatPrice } from "@/lib/format";

export interface BarPoint {
  label: string;
  [seriesKey: string]: string | number | undefined;
}

export interface BarSeriesMeta {
  key: string;
  name: string;
}

/** Flat categorical bar colours from the design tokens. */
const BAR_COLOURS = [
  "var(--wt-wine)",
  "var(--wt-ochre)",
  "var(--wt-ink-soft)",
  "var(--wt-wine-deep)",
];

/**
 * Restrained grouped bar chart in the WineTerm chart idiom: flat token
 * colours, thin rules, mono ticks, no gradients or animation.
 */
export function GroupedBarChart({
  points,
  series,
  unit,
  height = 300,
}: {
  points: BarPoint[];
  series: BarSeriesMeta[];
  unit: string;
  height?: number;
}) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={points}
          margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
          barCategoryGap="24%"
          barGap={2}
        >
          <CartesianGrid stroke="var(--wt-rule)" strokeWidth={1} vertical={false} />
          <XAxis
            dataKey="label"
            tick={{
              fill: "var(--wt-ink)",
              fontSize: 11,
              fontFamily: "var(--font-mono)",
            }}
            tickLine={false}
            axisLine={{ stroke: "var(--wt-rule)" }}
          />
          <YAxis
            width={40}
            tickFormatter={(value: number) => formatPrice(value, 0)}
            tick={{
              fill: "var(--wt-ink-soft)",
              fontSize: 10,
              fontFamily: "var(--font-mono)",
            }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            cursor={{ fill: "var(--wt-wine-wash)", opacity: 0.35 }}
            contentStyle={{
              background: "var(--wt-paper)",
              border: "1px solid var(--wt-rule)",
              borderRadius: 0,
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--wt-ink)",
            }}
            formatter={(value, name) => [
              `${formatPrice(Number(value), 1)} ${unit}`,
              String(name),
            ]}
          />
          <Legend
            wrapperStyle={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
            iconType="square"
          />
          {series.map((s, index) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              name={s.name}
              fill={BAR_COLOURS[index % BAR_COLOURS.length]}
              isAnimationActive={false}
              maxBarSize={42}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
