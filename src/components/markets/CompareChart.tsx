"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatDate, formatPrice } from "@/lib/format";

export interface ComparePoint {
  date: string;
  [code: string]: string | number | undefined;
}

export interface CompareSeriesMeta {
  code: string;
  name: string;
}

/** Categorical line colours drawn from the design tokens. */
const LINE_COLOURS = [
  "var(--wt-wine)",
  "var(--wt-ochre)",
  "var(--wt-up)",
  "var(--wt-ink-soft)",
];

/**
 * Multi-series comparison chart in the restrained WineTerm chart idiom:
 * thin flat lines, mono ticks, one shared unit axis.
 */
export function CompareChart({
  points,
  series,
  unit,
  height = 320,
}: {
  points: ComparePoint[];
  series: CompareSeriesMeta[];
  unit: string;
  height?: number;
}) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="var(--wt-rule)" strokeWidth={1} vertical={false} />
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
            minTickGap={48}
          />
          <YAxis
            width={48}
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
            formatter={(value, name) => [
              `${formatPrice(Number(value))} ${unit}`,
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
            iconType="plainline"
          />
          {series.map((s, index) => (
            <Line
              key={s.code}
              type="linear"
              dataKey={s.code}
              name={s.code}
              stroke={LINE_COLOURS[index % LINE_COLOURS.length]}
              strokeWidth={1.5}
              dot={false}
              connectNulls
              activeDot={{ r: 3 }}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
