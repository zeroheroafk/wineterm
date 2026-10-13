"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatDate, formatPercent, formatPrice } from "@/lib/format";
import type { PricePoint } from "@/services/types";

export interface TerminalSeries {
  code: string;
  label: string;
  country: string;
  price: number;
  unit: string;
  weekly: number | null;
  annual: number | null;
  date: string;
  source: string;
  sample: boolean;
  points: PricePoint[];
}

const FLAGS: Record<string, string> = { ES: "🇪🇸", PT: "🇵🇹", FR: "🇫🇷", IT: "🇮🇹" };
const PERIODS = [{ label: "1M", days: 31 }, { label: "6M", days: 183 }, { label: "1Y", days: 366 }];

function Movement({ value }: { value: number | null }) {
  return <span className={value === null || value === 0 ? "text-ink-soft" : value < 0 ? "text-down" : "text-up"}>{value === null ? "—" : formatPercent(value)}</span>;
}

export function PriceTerminal({ series }: { series: TerminalSeries[] }) {
  const [code, setCode] = useState(series[0]?.code);
  const [days, setDays] = useState(183);
  const gradientId = useId().replaceAll(":", "");
  const selected = series.find((item) => item.code === code) ?? series[0];
  if (!selected) return <p className="p-6 text-sm text-ink-soft">No price series available.</p>;
  const end = new Date(selected.points.at(-1)?.date ?? selected.date).getTime();
  const points = selected.points.filter((point) => new Date(point.date).getTime() >= end - days * 86400000);
  const falling = points.length > 1 && points[points.length - 1].value < points[0].value;
  const stroke = falling ? "var(--wt-down)" : "var(--wt-up)";
  const monthLabel = (date: string) => new Intl.DateTimeFormat("en-GB", { month: "short", year: "2-digit", timeZone: "UTC" }).format(new Date(date));

  return (
    <div className="grid min-w-0 md:grid-cols-[1.3fr_1fr]">
      <section aria-labelledby="terminal-prices" className="flex min-w-0 flex-col md:border-r md:border-rule">
        <div className="flex min-h-8 items-center justify-between border-b border-rule bg-ground px-3">
          <h2 id="terminal-prices" className="wt-desk-meta font-medium">Bulk wine prices</h2>
          <span className="wt-desk-meta text-wine">{selected.sample ? "Sample data" : "Reference prices"}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <caption className="sr-only">Wine reference prices. Select a market to display its price history.</caption>
            <thead className="wt-desk-meta text-ink-soft">
              <tr className="border-b border-rule">
                <th scope="col" className="px-3 py-2 font-normal">Market / wine</th>
                <th scope="col" className="px-2 py-2 text-right font-normal">Price</th>
                <th scope="col" className="px-2 py-2 text-right font-normal">1W %</th>
                <th scope="col" className="px-3 py-2 text-right font-normal">1Y %</th>
              </tr>
            </thead>
            <tbody>
              {series.map((item) => (
                <tr key={item.code} className={`border-b border-rule/70 ${item.code === selected.code ? "bg-wine-wash/60" : "hover:bg-ground"}`}>
                  <th scope="row" className={`border-l-2 font-normal ${item.code === selected.code ? "border-wine" : "border-transparent"}`}>
                    <button type="button" onClick={() => setCode(item.code)} aria-pressed={item.code === selected.code} className="flex min-h-9 w-full items-center gap-2 px-3 py-2 text-left">
                      <span aria-hidden="true">{FLAGS[item.country]}</span>
                      <span className="whitespace-nowrap">{item.country} · {item.label}</span>
                    </button>
                  </th>
                  <td className="tnum whitespace-nowrap px-2 text-right font-mono font-medium">{formatPrice(item.price)}<span className="ml-1 text-[9px] font-normal text-ink-soft">{item.unit}</span></td>
                  <td className="tnum whitespace-nowrap px-2 text-right font-mono text-[11px]"><Movement value={item.weekly} /></td>
                  <td className="tnum whitespace-nowrap px-3 text-right font-mono text-[11px]"><Movement value={item.annual} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="px-3 py-3 text-[11px] leading-relaxed text-ink-soft">{selected.sample ? "Illustrative prices, not live market data. " : ""}Weekly and annual changes compare matching periods. Each series retains its original unit.</p>
        <div className="mt-auto flex border-t border-rule bg-ground text-xs">
          <Link href="/markets/bulk-wine" className="flex grow items-center justify-between px-3 py-3 hover:text-wine">All wine prices <span aria-hidden="true">›</span></Link>
          <Link href="/insights/methodology#bulk-prices" className="border-l border-rule px-3 py-3 text-ink-soft hover:text-wine">Methodology</Link>
        </div>
      </section>

      <section aria-labelledby="terminal-chart" className="flex min-w-0 flex-col border-t border-rule md:border-t-0">
        <h2 id="terminal-chart" className="wt-desk-meta flex min-h-8 items-center border-b border-rule bg-ground px-3">{selected.country} · {selected.label} · {selected.unit}</h2>
        <div className="m-3 rounded-lg border border-rule p-3">
          <div className="mb-3 flex items-center justify-between gap-2">
            <span className="tnum font-mono text-sm font-medium">{formatPrice(selected.price)} <span className="text-[10px] text-ink-soft">{selected.unit}</span></span>
            <div className="flex gap-1" aria-label="Chart period">
              {PERIODS.map((period) => <button key={period.label} type="button" aria-pressed={days === period.days} onClick={() => setDays(period.days)} className={`min-h-8 rounded px-2.5 text-[11px] font-semibold ${days === period.days ? "bg-wine text-paper" : "text-ink-soft hover:bg-ground"}`}>{period.label}</button>)}
            </div>
          </div>
          <div className="h-[235px]" role="img" aria-label={`${selected.label} price history over the last ${days} days. ${selected.sample ? "Illustrative sample data." : `Source: ${selected.source}.`} Historical values are available from the series detail link below.`}>
            {points.length > 1 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={points} margin={{ top: 12, right: 5, bottom: 0, left: -15 }}>
                  <defs><linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={stroke} stopOpacity={0.09} /><stop offset="100%" stopColor={stroke} stopOpacity={0} /></linearGradient></defs>
                  <XAxis dataKey="date" tickFormatter={monthLabel} axisLine={false} tickLine={false} minTickGap={35} tick={{ fontSize: 9, fill: "var(--wt-ink-soft)" }} />
                  <YAxis domain={["auto", "auto"]} tickFormatter={(value: number) => formatPrice(value)} axisLine={false} tickLine={false} width={55} tick={{ fontSize: 9, fill: "var(--wt-ink-soft)" }} />
                  <Tooltip labelFormatter={(value) => formatDate(String(value))} formatter={(value) => [`${formatPrice(Number(value))} ${selected.unit}`, "Price"]} contentStyle={{ fontSize: 11, border: "1px solid var(--wt-rule)", borderRadius: 4 }} />
                  <Area dataKey="value" type="linear" stroke={stroke} strokeWidth={1.5} fill={`url(#${gradientId})`} isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            ) : <p className="flex h-full items-center justify-center text-xs text-ink-soft">Not enough observations for this period.</p>}
          </div>
        </div>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 px-3 pb-3 text-[10px] text-ink-soft">
          <span>{selected.source} · {formatDate(selected.date)}</span>
          <Link href={`/markets/series/${selected.code}`} className="text-wine hover:underline">Series details →</Link>
        </div>
      </section>
    </div>
  );
}
