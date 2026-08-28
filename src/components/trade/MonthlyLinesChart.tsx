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

import { formatMonth, formatPrice } from "@/lib/format";

export interface MonthlyPoint {
  month: string;
  [key: string]: string | number | undefined;
}

const LINE_COLOURS = [
  "var(--wt-wine)",
  "var(--wt-ochre)",
  "var(--wt-up)",
  "var(--wt-ink-soft)",
];

/** Multi-series monthly line chart with compact month ticks. */
export function MonthlyLinesChart({
  points,
  series,
  unit,
  height = 300,
}: {
  points: MonthlyPoint[];
  series: { key: string; name: string }[];
  unit: string;
  height?: number;
}) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="var(--wt-rule)" strokeWidth={1} vertical={false} />
          <XAxis
            dataKey="month"
            tickFormatter={(value: string) => formatMonth(value)}
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
            width={40}
            domain={[0, "auto"]}
            tickFormatter={(value: number) => formatPrice(value, 1)}
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
            labelFormatter={(value) => formatMonth(String(value))}
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
              key={s.key}
              type="linear"
              dataKey={s.key}
              name={s.name}
              stroke={LINE_COLOURS[index % LINE_COLOURS.length]}
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 3 }}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
