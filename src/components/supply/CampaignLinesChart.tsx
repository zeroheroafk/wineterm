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

import { formatPrice } from "@/lib/format";

export interface CampaignLine {
  /** e.g. "2025/26" */
  campaign: string;
  /** Month ("2026-07") and value, in the chart's unit. */
  points: { month: string; value: number }[];
}

const MONTH_LABELS = ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];

/** The emphasised campaign in the accent, the one it is read against in grey. */
const ACCENT = "var(--wt-wine)";
const CONTEXT = "var(--wt-ink-soft)";

/** Position of a month in the marketing campaign: August 0 to July 11. */
function campaignIndex(month: string): number {
  return (Number(month.slice(5, 7)) + 4) % 12;
}

interface DotProps {
  cx?: number;
  cy?: number;
  index?: number;
}

/**
 * Month-by-month lines of whole campaigns, August to July, laid over one
 * another so each month reads against the same month a year earlier. The
 * first campaign is the one the chart is about: accent colour and its
 * latest value labelled; the others are grey context. Both carry an end
 * dot and appear in the legend.
 */
export function CampaignLinesChart({
  lines,
  unit,
  decimals = 1,
  height = 300,
}: {
  lines: CampaignLine[];
  unit: string;
  decimals?: number;
  height?: number;
}) {
  const data = MONTH_LABELS.map((label, index) => {
    const row: { label: string; [campaign: string]: string | number } = { label };
    for (const line of lines) {
      const point = line.points.find((p) => campaignIndex(p.month) === index);
      if (point) row[line.campaign] = point.value;
    }
    return row;
  });

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 22, right: 24, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="var(--wt-rule)" strokeWidth={1} vertical={false} />
          <XAxis
            dataKey="label"
            tick={{
              fill: "var(--wt-ink-soft)",
              fontSize: 10,
              fontFamily: "var(--font-mono)",
            }}
            tickLine={false}
            axisLine={{ stroke: "var(--wt-rule)" }}
            interval="preserveStartEnd"
          />
          <YAxis
            width={40}
            domain={[0, "auto"]}
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
            cursor={{ stroke: "var(--wt-ink-soft)", strokeWidth: 1 }}
            contentStyle={{
              background: "var(--wt-paper)",
              border: "1px solid var(--wt-rule)",
              borderRadius: 0,
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--wt-ink)",
            }}
            formatter={(value, name) => [
              `${formatPrice(Number(value), decimals)} ${unit}`,
              String(name),
            ]}
          />
          <Legend
            wrapperStyle={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "var(--wt-ink)",
            }}
            iconType="plainline"
            // The campaign the chart is about first, not alphabetical order.
            itemSorter={null}
          />
          {lines.map((line, order) => {
            const colour = order === 0 ? ACCENT : CONTEXT;
            const last = line.points.at(-1);
            const lastIndex = last ? campaignIndex(last.month) : -1;
            return (
              <Line
                key={line.campaign}
                type="linear"
                dataKey={line.campaign}
                name={line.campaign}
                stroke={colour}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                isAnimationActive={false}
                activeDot={{ r: 4, fill: colour, stroke: "var(--wt-paper)", strokeWidth: 2 }}
                dot={({ cx, cy, index }: DotProps) =>
                  index === lastIndex && cx !== undefined && cy !== undefined ? (
                    <circle
                      key={`end-${line.campaign}`}
                      cx={cx}
                      cy={cy}
                      r={4}
                      fill={colour}
                      stroke="var(--wt-paper)"
                      strokeWidth={2}
                    />
                  ) : (
                    <g key={`dot-${line.campaign}-${index}`} />
                  )
                }
                label={
                  order === 0
                    ? ({ x, y, index }: { x?: number | string; y?: number | string; index?: number }) =>
                        index === lastIndex && x !== undefined && y !== undefined && last ? (
                          <text
                            key={`label-${line.campaign}`}
                            x={Number(x)}
                            y={Number(y) - 12}
                            textAnchor="middle"
                            fill="var(--wt-ink)"
                            fontSize={11}
                            fontFamily="var(--font-mono)"
                          >
                            {formatPrice(last.value, decimals)}
                          </text>
                        ) : (
                          <g key={`label-${line.campaign}-${index}`} />
                        )
                    : false
                }
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
