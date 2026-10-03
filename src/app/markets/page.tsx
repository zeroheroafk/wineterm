import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/layout/Container";
import { MarketCommentaryBlock } from "@/components/market/MarketCommentaryBlock";
import { PriceCell } from "@/components/market/PriceCell";
import { MaybePercent, SeriesCodeLink, TD, TD_RIGHT, TH, TH_RIGHT } from "@/components/markets/cells";
import { StaleLabel } from "@/components/markets/StaleLabel";
import { MarketsPageHeader } from "@/components/markets/MarketsPageHeader";
import { DataStatusLabel } from "@/components/ui/DataStatusLabel";
import { ScrollRegion } from "@/components/ui/ScrollRegion";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { formatDate, formatDateTime } from "@/lib/format";
import { getMarketsService, isIllustrative } from "@/services/markets/service";
import type { MarketKind, MarketRow } from "@/services/markets/types";

// Real series are read from the database; regenerate at most hourly.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Markets",
  description:
    "Bulk wine, grape and must price intelligence for the professional European wine market.",
};

const PRODUCTS: {
  kind: MarketKind;
  title: string;
  href: string;
  description: string;
}[] = [
  {
    kind: "bulk-wine",
    title: "Bulk Wine Prices",
    href: "/markets/bulk-wine",
    description:
      "Bulk wine prices by country, region, classification and colour, with original units preserved and movements over three horizons.",
  },
  {
    kind: "grape",
    title: "Grape Prices",
    href: "/markets/grapes",
    description:
      "Grape prices by region, variety and harvest, with the provenance of every observation: official averages, contracts, cooperative settlements, announcements and estimates.",
  },
  {
    kind: "must",
    title: "Must & Concentrates",
    href: "/markets/must-concentrates",
    description:
      "Grape must, concentrated must and RCGM quotations with technical specifications, quoted in their original volume or mass units.",
  },
];

export default async function MarketsPage() {
  const markets = getMarketsService();

  const [bulkRows, grapeRows, mustRows, bulkCommentary, grapeCommentary, mustCommentary] =
    await Promise.all([
      markets.getRows("bulk-wine"),
      markets.getRows("grape"),
      markets.getRows("must"),
      markets.getCommentary("bulk-wine"),
      markets.getCommentary("grape"),
      markets.getCommentary("must"),
    ]);

  const rowsByKind: Record<MarketKind, MarketRow[]> = {
    "bulk-wine": bulkRows,
    grape: grapeRows,
    must: mustRows,
  };

  const recent = [...bulkRows, ...grapeRows, ...mustRows]
    .sort((a, b) => b.latest.date.localeCompare(a.latest.date))
    .slice(0, 6);
  const hasReal = [...bulkRows, ...grapeRows, ...mustRows].some(
    (row) => !isIllustrative(row),
  );

  return (
    <Container className="pb-16">
      <MarketsPageHeader
        title="Markets"
        description={
          hasReal
            ? "Price series for the professional wine market: bulk wine, grapes, must and concentrates. Every observation keeps its source and original unit, except prices recorded per hectolitre-degree, shown in EUR/hl at the product's strength. National bulk wine averages lead; the other series are illustrative samples, marked as such. How each price is established is set out in the methodology."
            : "Price series for the professional wine market: bulk wine, grapes, must and concentrates. Every observation keeps its source, status and original unit, except prices recorded per hectolitre-degree, shown in EUR/hl at the product's strength; development figures are illustrative samples."
        }
        activeHref="/markets"
      />

      <section className="mt-10">
        <SectionHeader
          kicker="Coverage"
          title="Market coverage"
          description={
            hasReal
              ? "Direct access to every price section. Series counts and dates cover the real series and the illustrative samples together."
              : "Direct access to every price section. Series counts and dates reflect the currently connected development fixtures."
          }
        />
        <ul className="mt-5 border border-rule bg-paper">
          {PRODUCTS.map((product) => {
            const rows = rowsByKind[product.kind];
            const latestDate = rows
              .map((r) => r.latest.date)
              .sort()
              .at(-1);
            return (
              <li
                key={product.href}
                className="border-b border-rule last:border-b-0"
              >
                <Link
                  href={product.href}
                  className="group grid gap-x-6 gap-y-1.5 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_11rem] sm:items-center"
                >
                  <span>
                    <span className="wt-headline text-xl font-semibold text-ink group-hover:text-wine-deep">
                      {product.title}
                    </span>
                    <span className="mt-1 block max-w-2xl text-sm leading-relaxed text-ink-soft">
                      {product.description}
                    </span>
                  </span>
                  <span className="wt-label flex flex-row items-center gap-3 text-ink-soft sm:flex-col sm:items-end sm:gap-1">
                    <span className="text-wine">{rows.length} series</span>
                    {latestDate ? <span>to {formatDate(latestDate)}</span> : null}
                    <span aria-hidden="true" className="hidden sm:inline">
                      &rarr;
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
          <li>
            <Link
              href="/markets/compare"
              className="group grid gap-x-6 gap-y-1.5 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_11rem] sm:items-center"
            >
              <span>
                <span className="wt-headline text-xl font-semibold text-ink group-hover:text-wine-deep">
                  Market Comparison
                </span>
                <span className="mt-1 block max-w-2xl text-sm leading-relaxed text-ink-soft">
                  Chart up to four compatible series side by side. Units are
                  normalised only within the same family, with a clear
                  warning; grape and wine prices are never mixed.
                </span>
              </span>
              <span className="wt-label flex flex-row items-center gap-3 text-ink-soft sm:flex-col sm:items-end sm:gap-1">
                <span className="text-wine">Tool</span>
                <span aria-hidden="true" className="hidden sm:inline">
                  &rarr;
                </span>
              </span>
            </Link>
          </li>
        </ul>
      </section>

      <section className="mt-12">
        <SectionHeader
          kicker="Latest observations"
          title="Recently updated series"
        />
        <ScrollRegion className="mt-5 border border-rule bg-paper">
          <table className="w-full border-collapse text-left">
            <caption className="sr-only">
              Most recently observed series across all market sections
            </caption>
            <thead>
              <tr className="border-b-2 border-ink">
                <th scope="col" className={`${TH} hidden lg:table-cell`}>
                  Code
                </th>
                <th scope="col" className={TH}>
                  Series
                </th>
                <th scope="col" className={TH_RIGHT}>
                  Price
                </th>
                <th scope="col" className={TH_RIGHT}>
                  Wk %
                </th>
                <th scope="col" className={TH}>
                  Date
                </th>
                <th scope="col" className={`${TH} hidden sm:table-cell`}>
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {recent.map((row) => (
                <tr
                  key={row.series.code}
                  className="border-b border-rule transition-colors last:border-b-0 hover:bg-ground/70"
                >
                  <td className={`${TD} hidden lg:table-cell`}>
                    <SeriesCodeLink code={row.series.code} />
                  </td>
                  <td className={TD}>
                    <Link
                      href={`/markets/series/${row.series.code}`}
                      className="text-sm font-medium text-ink hover:text-wine-deep"
                    >
                      {row.series.name}
                    </Link>
                    {isIllustrative(row) ? (
                      <span className="mt-1 block sm:hidden">
                        <DataStatusLabel status="illustrative" />
                      </span>
                    ) : null}
                  </td>
                  <td className={TD_RIGHT}>
                    <PriceCell value={row.latest.value} unit={row.series.unit} />
                  </td>
                  <td className={TD_RIGHT}>
                    <MaybePercent value={row.changes.weekPercent} />
                  </td>
                  <td
                    className={`${TD} tnum font-mono text-xs ${row.staleness ? "text-ochre-deep" : "text-ink-soft"}`}
                  >
                    {formatDate(row.latest.date)}
                    {row.staleness ? (
                      <span className="ml-1.5 inline-block align-middle">
                        <StaleLabel
                          staleness={row.staleness}
                          latestDate={row.latest.date}
                        />
                      </span>
                    ) : null}
                  </td>
                  <td className={`${TD} hidden sm:table-cell`}>
                    {isIllustrative(row) ? (
                      <DataStatusLabel status="illustrative" />
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollRegion>
        {recent.some((row) => row.series.perDegree) ? (
          <p className="wt-label mt-2 text-ink-soft">
            Samples recorded per hectolitre-degree are shown in EUR/hl at the
            product&apos;s strength; each series page gives the recorded value
            and the strength used.
          </p>
        ) : null}
      </section>

      <section className="mt-12">
        <SectionHeader kicker="Desk" title="Latest market commentary" />
        <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          {bulkCommentary ? (
            <MarketCommentaryBlock commentary={bulkCommentary} />
          ) : null}
          <div className="space-y-4">
            {[grapeCommentary, mustCommentary].map((commentary) =>
              commentary ? (
                <article
                  key={commentary.id}
                  className="border border-rule bg-paper px-4 py-3.5"
                >
                  <p className="wt-label text-wine">{commentary.market}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink">
                    {commentary.body}
                  </p>
                  <p className="wt-label mt-2 text-ink-soft">
                    {formatDateTime(commentary.publishedAt)}
                  </p>
                </article>
              ) : null,
            )}
          </div>
        </div>
      </section>
    </Container>
  );
}
