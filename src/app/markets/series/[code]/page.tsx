import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { MarketCommentaryBlock } from "@/components/market/MarketCommentaryBlock";
import { ChartFrame } from "@/components/market/ChartFrame";
import { PriceLineChart } from "@/components/market/PriceLineChart";
import { CampaignComparisonTable } from "@/components/markets/CampaignComparisonTable";
import { MaybePercent } from "@/components/markets/cells";
import { RelatedMarketsList } from "@/components/markets/RelatedMarketsList";
import {
  DataClassificationTag,
  SourceTypeTag,
  VerificationTag,
} from "@/components/markets/tags";
import { TimeRangeControls } from "@/components/markets/TimeRangeControls";
import { CountryLabel } from "@/components/ui/CountryLabel";
import { DataStatusLabel } from "@/components/ui/DataStatusLabel";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { formatDate, formatDateTime, formatPrice } from "@/lib/format";
import { getMarketsService } from "@/services/markets/service";
import { firstParam, type SearchParams } from "@/services/markets/params";
import { getSource } from "@/services/markets/sources";
import {
  referenceUnit,
  UNIT_TO_REFERENCE,
  type MarketKind,
  type TimeRangeKey,
} from "@/services/markets/types";
import { COUNTRY_NAMES } from "@/services/types";

const KIND_META: Record<MarketKind, { label: string; href: string }> = {
  "bulk-wine": { label: "Bulk Wine Prices", href: "/markets/bulk-wine" },
  grape: { label: "Grape Prices", href: "/markets/grapes" },
  must: { label: "Must & Concentrates", href: "/markets/must-concentrates" },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  const series = await getMarketsService().getSeries(code);
  if (!series) return { title: "Market not found" };
  return {
    title: series.name,
    description: `${series.product}. ${series.region}, ${COUNTRY_NAMES[series.country]}. Price series in ${series.unit}.`,
  };
}

export default async function MarketDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const [{ code }, query] = await Promise.all([params, searchParams]);
  const markets = getMarketsService();

  const row = await markets.getRow(code);
  if (!row) notFound();

  const { series, latest, changes } = row;
  const kindMeta = KIND_META[series.kind];
  const source = getSource(series.sourceId);

  const available = await markets.getAvailableRanges(code);
  const requested = firstParam(query, "r") as TimeRangeKey | undefined;
  const range: TimeRangeKey =
    requested && available.includes(requested)
      ? requested
      : available.includes("1y")
        ? "1y"
        : "max";

  const [history, campaigns, related, commentary] = await Promise.all([
    markets.getHistory(code, range),
    markets.getCampaignAverages(code),
    markets.getRelated(code),
    markets.getCommentary(series.kind),
  ]);

  const points = history.map((obs) => ({ date: obs.date, value: obs.value }));
  const reference = referenceUnit(series.unit);
  const normalised =
    series.unit === reference
      ? null
      : Math.round(latest.value * UNIT_TO_REFERENCE[series.unit] * 100) / 100;

  return (
    <Container className="pb-16">
      <Breadcrumbs
        items={[
          { label: "Markets", href: "/markets" },
          { label: kindMeta.label, href: kindMeta.href },
          { label: series.code },
        ]}
      />

      <header className="border-b border-rule pb-6">
        <p className="wt-label text-wine">
          {kindMeta.label}
          <span aria-hidden="true" className="mx-2 text-rule">
            &middot;
          </span>
          {series.code}
        </p>
        <h1 className="wt-headline mt-2 text-3xl font-semibold text-ink sm:text-4xl">
          {series.name}
        </h1>
        <p className="mt-2 text-base text-ink-soft">{series.product}</p>
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
          <CountryLabel code={series.country} withName />
          <span className="text-sm text-ink-soft">
            {series.appellation ?? series.region}
          </span>
          <DataClassificationTag classification={source.classification} />
          <SourceTypeTag type={series.sourceType} />
          <VerificationTag status={series.verification} />
          <DataStatusLabel status={latest.status} />
        </div>
      </header>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,21rem)]">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-ink">Price history</h2>
            <TimeRangeControls
              basePath={`/markets/series/${series.code}`}
              available={available}
              active={range}
            />
          </div>
          <ChartFrame
            title={series.name}
            code={series.code}
            unit={series.unit}
            status={latest.status}
            source={{ name: source.name }}
            updatedAt={latest.updatedAt}
          >
            <PriceLineChart points={points} unit={series.unit} />
          </ChartFrame>

          {campaigns.length > 1 ? (
            <section className="mt-10">
              <SectionHeader
                kicker="Campaigns"
                title="Campaign comparison"
                description="Average of this series' own observations per marketing campaign (August to July). Partial campaigns reflect the observations available so far."
              />
              <div className="mt-5">
                <CampaignComparisonTable averages={campaigns} unit={series.unit} />
              </div>
            </section>
          ) : null}

          <section className="mt-10">
            <SectionHeader kicker="Provenance" title="Source and methodology" />
            <div className="mt-5 border border-rule bg-paper px-5 py-4">
              <dl className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
                <div>
                  <dt className="wt-label text-ink-soft">Source</dt>
                  <dd className="mt-1 text-sm font-medium text-ink">
                    {source.name}
                  </dd>
                </div>
                <div>
                  <dt className="wt-label text-ink-soft">Classification</dt>
                  <dd className="mt-1">
                    <DataClassificationTag
                      classification={source.classification}
                    />
                  </dd>
                </div>
                <div>
                  <dt className="wt-label text-ink-soft">Coverage</dt>
                  <dd className="mt-1 text-sm text-ink">{source.coverage}</dd>
                </div>
                <div>
                  <dt className="wt-label text-ink-soft">Cadence</dt>
                  <dd className="mt-1 text-sm text-ink">{source.cadence}</dd>
                </div>
              </dl>
              <p className="mt-4 border-t border-rule pt-3 text-sm leading-relaxed text-ink-soft">
                {series.methodology}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                {source.note}
              </p>
              <Link
                href="/insights/methodology"
                className="wt-label mt-3 inline-block text-wine hover:text-wine-deep"
              >
                WineTerm methodology &rarr;
              </Link>
            </div>
          </section>
        </div>

        <aside className="min-w-0 space-y-8">
          <div className="border border-rule border-t-2 border-t-wine bg-paper">
            <div className="border-b border-rule px-4 py-2.5">
              <h2 className="wt-label text-wine">Current price</h2>
            </div>
            <div className="px-4 py-4">
              <p className="tnum font-mono text-3xl text-ink">
                {formatPrice(latest.value)}
                <span className="ml-2 text-sm text-ink-soft">
                  {series.unit}
                </span>
              </p>
              {latest.min !== undefined && latest.max !== undefined ? (
                <p className="tnum mt-1 font-mono text-xs text-ink-soft">
                  Range {formatPrice(latest.min)} - {formatPrice(latest.max)}
                </p>
              ) : null}
              {normalised !== null ? (
                <p className="tnum mt-1 font-mono text-xs text-ink-soft">
                  Normalised {formatPrice(normalised)} {reference}
                  <span className="wt-label ml-1.5 text-ochre">labelled</span>
                </p>
              ) : null}
              <dl className="mt-4 space-y-1.5 border-t border-rule pt-3">
                {(
                  [
                    ["1 week", changes.weekPercent],
                    ["1 month", changes.monthPercent],
                    ["1 year", changes.yoyPercent],
                  ] as const
                ).map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between gap-4"
                  >
                    <dt className="wt-label text-ink-soft">{label}</dt>
                    <dd>
                      <MaybePercent value={value} />
                    </dd>
                  </div>
                ))}
              </dl>
              <dl className="mt-4 space-y-1.5 border-t border-rule pt-3">
                <div className="flex items-center justify-between gap-4">
                  <dt className="wt-label text-ink-soft">Observed</dt>
                  <dd className="tnum font-mono text-xs text-ink">
                    {formatDate(latest.date)}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="wt-label text-ink-soft">Published</dt>
                  <dd className="tnum font-mono text-xs text-ink">
                    {formatDate(latest.publishedAt)}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="wt-label text-ink-soft">Updated</dt>
                  <dd className="tnum font-mono text-xs text-ink">
                    {formatDateTime(latest.updatedAt)}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="wt-label text-ink-soft">Revision</dt>
                  <dd className="wt-label text-ink">
                    {latest.revised ? "Revised" : "As first published"}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="wt-label text-ink-soft">Campaign</dt>
                  <dd className="tnum font-mono text-xs text-ink">
                    {series.campaign}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {related.length > 0 ? (
            <div>
              <h2 className="wt-label border-b-2 border-ink pb-1.5 text-wine">
                Related markets
              </h2>
              <div className="mt-3">
                <RelatedMarketsList rows={related} />
              </div>
            </div>
          ) : null}

          {commentary ? <MarketCommentaryBlock commentary={commentary} /> : null}
        </aside>
      </div>
    </Container>
  );
}
