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

export interface CountryLine {
  /** Data key, also the label at the line's end, e.g. "PT" or "EU". */
  key: string;
  /** Name in the legend and tooltip, e.g. "Portugal". */
  name: string;
  colour: string;
  /** A line to read the others against, such as the EU: dashed and grey. */
  reference?: boolean;
}

export interface CountryMonth {
  month: string; // "2026-07"
  [key: string]: string | number | undefined;
}

const MARGIN = { top: 12, right: 48, bottom: 0, left: 0 };
/** What the month axis and the legend take of the chart's height. */
const AXIS_HEIGHT = 30;
const LEGEND_HEIGHT = 28;
/** Least distance between two end labels, px. */
const LABEL_GAP = 13;
const TICK = {
  fill: "var(--wt-ink-soft)",
  fontSize: 10,
  fontFamily: "var(--font-mono)",
};

/** A round step for about four intervals across a range. */
function niceStep(range: number): number {
  const raw = range / 4;
  const power = 10 ** Math.floor(Math.log10(raw));
  const fraction = raw / power;
  const nice = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 2.5 ? 2.5 : fraction <= 5 ? 5 : 10;
  return nice * power;
}

/**
 * The value axis' bounds and ticks, set here rather than by the chart so
 * the end labels can be placed against them: from zero, or around the
 * values, on round steps, with as many decimals as the step needs.
 */
function valueAxis(
  values: number[],
  fromZero: boolean,
): { domain: [number, number]; ticks: number[]; decimals: number } {
  if (values.length === 0) return { domain: [0, 1], ticks: [0, 1], decimals: 0 };
  const max = Math.max(...values);
  const min = fromZero ? 0 : Math.min(...values);
  const step = niceStep(max - min || Math.abs(max) || 1);
  const low = fromZero ? 0 : Math.floor(min / step) * step;
  const high = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let tick = low; tick <= high + step / 2; tick += step) {
    ticks.push(Math.round(tick * 1e6) / 1e6);
  }
  const decimals = String(Math.round(step * 1e6) / 1e6).split(".")[1]?.length ?? 0;
  return { domain: [low, high], ticks, decimals };
}

interface End {
  key: string;
  index: number;
  value: number;
}

/**
 * Vertical offsets, px, that keep the end labels apart: each label starts
 * level with its line's end, and one that would touch the label above it
 * moves down.
 */
function labelOffsets(ends: End[], domain: [number, number], plotHeight: number): Map<string, number> {
  const perUnit = plotHeight / (domain[1] - domain[0] || 1);
  const placed: { key: string; y: number; label: number }[] = [];
  for (const end of [...ends].sort((a, b) => b.value - a.value)) {
    const y = (domain[1] - end.value) * perUnit;
    const above = placed[placed.length - 1];
    placed.push({ key: end.key, y, label: above ? Math.max(y, above.label + LABEL_GAP) : y });
  }
  return new Map(placed.map((item) => [item.key, item.label - item.y]));
}

interface DotProps {
  cx?: number;
  cy?: number;
  index?: number;
}

interface LabelProps {
  x?: number | string;
  y?: number | string;
  index?: number;
}

/**
 * The Recharts plot of CountryLinesChart, drawn in the browser only: see
 * CountryLinesChart.tsx.
 */
export function CountryLinesPlot({
  points,
  lines,
  unit,
  decimals = 2,
  fromZero = true,
  height = 300,
}: {
  points: CountryMonth[];
  lines: CountryLine[];
  unit: string;
  /** Decimals in the tooltip and the end label; the axis takes its step's. */
  decimals?: number;
  /** Start the value axis at zero; otherwise it fits the values. */
  fromZero?: boolean;
  height?: number;
}) {
  const several = lines.length > 1;
  const values = points.flatMap((point) =>
    lines.flatMap((line) => {
      const value = point[line.key];
      return typeof value === "number" ? [value] : [];
    }),
  );
  const axis = valueAxis(values, fromZero);
  const { domain, ticks } = axis;

  const ends: End[] = lines.flatMap((line) => {
    for (let index = points.length - 1; index >= 0; index--) {
      const value = points[index][line.key];
      if (typeof value === "number") return [{ key: line.key, index, value }];
    }
    return [];
  });
  const endOf = new Map(ends.map((end) => [end.key, end]));
  const plotHeight =
    height - MARGIN.top - MARGIN.bottom - AXIS_HEIGHT - (several ? LEGEND_HEIGHT : 0);
  const offsets = labelOffsets(ends, domain, plotHeight);
  const order = lines.map((line) => line.name);

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points} margin={MARGIN}>
          <CartesianGrid stroke="var(--wt-rule)" strokeWidth={1} vertical={false} />
          <XAxis
            dataKey="month"
            tickFormatter={(value: string) => formatMonth(value)}
            tick={TICK}
            tickLine={false}
            axisLine={{ stroke: "var(--wt-rule)" }}
            minTickGap={40}
          />
          <YAxis
            width={44}
            domain={domain}
            ticks={ticks}
            tickFormatter={(value: number) => formatPrice(value, axis.decimals)}
            tick={TICK}
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
              `${formatPrice(Number(value), decimals)} ${unit}`,
              String(name),
            ]}
            itemSorter={(item) => order.indexOf(String(item.name))}
          />
          {several ? (
            <Legend
              wrapperStyle={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "var(--wt-ink)",
              }}
              iconType="plainline"
              itemSorter={(item) => order.indexOf(String(item.value))}
              // Names in the text colour; the line beside each carries its colour.
              formatter={(value) => <span style={{ color: "var(--wt-ink)" }}>{value}</span>}
            />
          ) : null}
          {/* Reference lines first, so the countries are drawn over them. */}
          {[...lines]
            .sort((a, b) => Number(Boolean(b.reference)) - Number(Boolean(a.reference)))
            .map((line) => {
              const colour = line.reference ? "var(--wt-ink-soft)" : line.colour;
              const end = endOf.get(line.key);
              return (
                <Line
                  key={line.key}
                  type="linear"
                  dataKey={line.key}
                  name={line.name}
                  stroke={colour}
                  strokeWidth={2}
                  strokeDasharray={line.reference ? "4 3" : undefined}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  isAnimationActive={false}
                  activeDot={{ r: 4, fill: colour, stroke: "var(--wt-paper)", strokeWidth: 2 }}
                  dot={({ cx, cy, index }: DotProps) =>
                    end && index === end.index && cx !== undefined && cy !== undefined ? (
                      <circle
                        key={`end-${line.key}`}
                        cx={cx}
                        cy={cy}
                        r={4}
                        fill={colour}
                        stroke="var(--wt-paper)"
                        strokeWidth={2}
                      />
                    ) : (
                      <g key={`dot-${line.key}-${index}`} />
                    )
                  }
                  label={({ x, y, index }: LabelProps) =>
                    end && index === end.index && x !== undefined && y !== undefined ? (
                      <text
                        key={`label-${line.key}`}
                        x={Number(x) + 8}
                        y={Number(y) + (offsets.get(line.key) ?? 0)}
                        dy="0.35em"
                        fill="var(--wt-ink)"
                        fontSize={11}
                        fontFamily="var(--font-mono)"
                      >
                        {several ? line.key : formatPrice(end.value, decimals)}
                      </text>
                    ) : (
                      <g key={`label-${line.key}-${index}`} />
                    )
                  }
                />
              );
            })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
