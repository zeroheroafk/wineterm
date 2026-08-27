import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { Container } from "@/components/layout/Container";
import { PriceCell } from "@/components/market/PriceCell";
import {
  MaybePercent,
  SeriesCodeLink,
  TD,
  TD_RIGHT,
  TH,
  TH_RIGHT,
} from "@/components/markets/cells";
import { CompareChart, type ComparePoint } from "@/components/markets/CompareChart";
import {
  ComparePicker,
  type CompareOption,
} from "@/components/markets/ComparePicker";
import { MarketsPageHeader } from "@/components/markets/MarketsPageHeader";
import { formatDate, formatPrice } from "@/lib/format";
import { getMarketsService } from "@/services/markets/service";
import { firstParam, type SearchParams } from "@/services/markets/params";
import {
  FAMILY_REFERENCE_UNIT,
  MAX_COMPARE_SERIES,
  UNIT_FAMILY,
  UNIT_TO_REFERENCE,
  type MarketSeries,
} from "@/services/markets/types";

export const metadata: Metadata = {
  title: "Market Comparison",
  description:
    "Compare compatible wine market price series side by side, with explicit unit handling.",
};

const PRESETS: { label: string; codes: string[] }[] = [
  {
    label: "Iberian generic red",
    codes: ["ES-CLM-RED-GEN", "ES-EXT-RED-GEN", "PT-ALE-RED-GEN"],
  },
  {
    label: "Generic white, Spain and Portugal",
    codes: ["ES-CLM-WHT-GEN", "PT-LIS-WHT-GEN"],
  },
  {
    label: "PDO bulk red, quoted per litre",
    codes: ["ES-RIO-RED-PDO", "PT-DOU-RED-PDO"],
  },
  {
    label: "RCGM, Spain and Italy",
    codes: ["MU-ES-RCGM-WHT", "MU-IT-RCGM"],
  },
];

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const query = await searchParams;
  const markets = getMarketsService();
  const allSeries = await markets.listSeries();

  const options: CompareOption[] = allSeries.map((s) => ({
    code: s.code,
    label: s.name,
    kind: s.kind,
    unitFamily: UNIT_FAMILY[s.unit],
    unit: s.unit,
    currency: s.currency,
  }));

  const requested = (firstParam(query, "s") ?? "")
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean)
    .slice(0, MAX_COMPARE_SERIES);

  const selected: MarketSeries[] = [];
  const dropped: string[] = [];
  for (const code of requested) {
    const series = allSeries.find((s) => s.code === code);
    if (!series) {
      dropped.push(code);
      continue;
    }
    if (selected.length === 0) {
      selected.push(series);
      continue;
    }
    const first = selected[0];
    const compatible =
      series.kind === first.kind &&
      UNIT_FAMILY[series.unit] === UNIT_FAMILY[first.unit] &&
      series.currency === first.currency;
    if (compatible) {
      selected.push(series);
    } else {
      dropped.push(code);
    }
  }

  const mixedUnits = new Set(selected.map((s) => s.unit)).size > 1;
  const chartUnit =
    selected.length > 0
      ? mixedUnits
        ? FAMILY_REFERENCE_UNIT[UNIT_FAMILY[selected[0].unit]]
        : selected[0].unit
      : null;

  const [histories, rows] = await Promise.all([
    Promise.all(selected.map((s) => markets.getHistory(s.code, "1y"))),
    Promise.all(selected.map((s) => markets.getRow(s.code))),
  ]);

  const pointMap = new Map<string, ComparePoint>();
  selected.forEach((series, index) => {
    const factor = mixedUnits ? UNIT_TO_REFERENCE[series.unit] : 1;
    for (const obs of histories[index]) {
      const point = pointMap.get(obs.date) ?? { date: obs.date };
      point[series.code] = Math.round(obs.value * factor * 100) / 100;
      pointMap.set(obs.date, point);
    }
  });
  const points = [...pointMap.values()].sort((a, b) =>
    a.date.localeCompare(b.date),
  );

  return (
    <Container className="pb-16">
      <MarketsPageHeader
        crumb="Market Comparison"
        title="Market Comparison"
        description="Chart up to four compatible series over the last 12 months. Comparisons stay within one market type, unit family and currency; grape and wine prices are never mixed. Development figures are illustrative samples."
        activeHref="/markets/compare"
      />

      <div className="mt-8">
        <Suspense fallback={<div className="h-16 border-y border-rule bg-paper" />}>
          <ComparePicker
            options={options}
            selected={selected.map((s) => s.code)}
          />
        </Suspense>
      </div>

      {dropped.length > 0 ? (
        <p className="mt-4 border border-ochre bg-ochre/10 px-4 py-2.5 text-sm text-ink">
          <span className="wt-label mr-2 text-ochre">Not comparable</span>
          {dropped.join(", ")}{" "}
          {dropped.length === 1 ? "was" : "were"} removed: series must share
          the same market type, unit family and currency as the first
          selection.
        </p>
      ) : null}

      {selected.length > 0 && mixedUnits && chartUnit ? (
        <p className="mt-4 border border-ochre bg-ochre/10 px-4 py-2.5 text-sm text-ink">
          <span className="wt-label mr-2 text-ochre">
            Normalisation applied
          </span>
          The selected series are published in different units. For this
          chart, values are normalised to {chartUnit}. Original observations
          remain unchanged on each series page.
        </p>
      ) : null}

      {selected.length === 0 ? (
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]">
          <div className="border border-dashed border-rule bg-paper px-6 py-10">
            <p className="wt-label text-ink-soft">No series selected</p>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink">
              Add a first series above; the picker then offers only series
              that can be compared with it. Comparisons never mix grape and
              wine prices, volume and mass units, or currencies.
            </p>
          </div>
          <div>
            <h2 className="wt-label border-b-2 border-ink pb-1.5 text-wine">
              Suggested comparisons
            </h2>
            <ul className="mt-3 space-y-2">
              {PRESETS.map((preset) => (
                <li key={preset.label}>
                  <Link
                    href={`/markets/compare?s=${preset.codes.join(",")}`}
                    className="text-sm font-medium text-ink underline decoration-rule underline-offset-2 hover:text-wine-deep"
                  >
                    {preset.label}
                  </Link>
                  <span className="wt-label ml-2 text-ink-soft">
                    {preset.codes.length} series
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-6 border border-rule bg-paper">
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-rule px-4 py-3">
              <h2 className="text-sm font-semibold text-ink">
                Last 12 months
              </h2>
              <p className="wt-label text-ink-soft">
                {chartUnit}
                {mixedUnits ? (
                  <span className="ml-1.5 text-ochre">normalised</span>
                ) : null}
              </p>
            </div>
            <div className="px-2 py-3">
              <CompareChart
                points={points}
                series={selected.map((s) => ({ code: s.code, name: s.name }))}
                unit={chartUnit ?? ""}
              />
            </div>
          </div>

          <div className="mt-6 overflow-x-auto border border-rule bg-paper">
            <table className="w-full border-collapse text-left">
              <caption className="sr-only">
                Latest values of the compared series
              </caption>
              <thead>
                <tr className="border-b-2 border-ink">
                  <th scope="col" className={TH}>
                    Code
                  </th>
                  <th scope="col" className={TH}>
                    Series
                  </th>
                  <th scope="col" className={TH_RIGHT}>
                    Latest (original)
                  </th>
                  {mixedUnits && chartUnit ? (
                    <th scope="col" className={TH_RIGHT}>
                      Chart value ({chartUnit})
                    </th>
                  ) : null}
                  <th scope="col" className={TH_RIGHT}>
                    Wk %
                  </th>
                  <th scope="col" className={TH}>
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) =>
                  row ? (
                    <tr
                      key={row.series.code}
                      className="border-b border-rule last:border-b-0"
                    >
                      <td className={TD}>
                        <SeriesCodeLink code={row.series.code} />
                      </td>
                      <td className={`${TD} text-sm font-medium text-ink`}>
                        {row.series.name}
                      </td>
                      <td className={TD_RIGHT}>
                        <PriceCell
                          value={row.latest.value}
                          unit={row.series.unit}
                        />
                      </td>
                      {mixedUnits && chartUnit ? (
                        <td
                          className={`${TD_RIGHT} tnum font-mono text-sm text-ink-soft`}
                        >
                          {formatPrice(
                            row.latest.value *
                              UNIT_TO_REFERENCE[row.series.unit],
                          )}
                          <sup className="ml-0.5 text-[0.6rem] text-ochre">
                            n
                          </sup>
                        </td>
                      ) : null}
                      <td className={TD_RIGHT}>
                        <MaybePercent value={row.changes.weekPercent} />
                      </td>
                      <td className={`${TD} tnum font-mono text-xs text-ink-soft`}>
                        {formatDate(row.latest.date)}
                      </td>
                    </tr>
                  ) : null,
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Container>
  );
}
