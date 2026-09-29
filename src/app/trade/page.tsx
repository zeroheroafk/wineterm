import type { Metadata } from "next";

import { Container } from "@/components/layout/Container";
import { SectionPageHeader } from "@/components/layout/SectionPageHeader";
import { MonthlyLinesChart } from "@/components/trade/MonthlyLinesChart";
import { TradeCategorySummaryTable } from "@/components/trade/TradeCategorySummaryTable";
import { TradeFlowsRelationTable } from "@/components/trade/TradeFlowsRelationTable";
import { TradePartnersTable } from "@/components/trade/TradePartnersTable";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SourceLine } from "@/components/ui/SourceLine";
import { primaryNavigation } from "@/lib/navigation";
import { getTradeService } from "@/services/trade/service";
import {
  TRADE_CATEGORIES,
  TRADE_CATEGORY_LABELS,
} from "@/services/trade/types";

export const metadata: Metadata = {
  title: "Trade",
  description:
    "Wine trade of Spain, Portugal, France and Italy by customs category: bulk, bottled and bag-in-box still wine, sparkling wine and grape must. Volumes, values, unit values and partners.",
};

// Eurostat publishes monthly; regenerate at most hourly so a new month
// shows up soon after the import.
export const revalidate = 3600;

export default async function TradePage() {
  const trade = getTradeService();
  const [period, source, updatedAt, summaries, details, monthly] =
    await Promise.all([
      trade.getPeriod(),
      trade.getSource(),
      trade.getUpdatedAt(),
      trade.getCategorySummaries(),
      trade.getAllCategoryDetails(),
      Promise.all(
        TRADE_CATEGORIES.map((category) =>
          trade.getMonthlyExportVolumes(category),
        ),
      ),
    ]);
  const attribution = { name: source.name, url: source.url };

  return (
    <Container className="pb-16">
      <SectionPageHeader
        section={primaryNavigation[2]}
        crumbs={[{ label: "Trade" }]}
        kicker="Trade"
        title="Imports and exports"
        description={
          source.isSample
            ? "Trade of Spain, Portugal, France and Italy by customs category. Bulk, bottled and bag-in-box still wine, sparkling wine and grape must are separate subheadings and are never combined. Development figures are illustrative samples."
            : "Trade of Spain, Portugal, France and Italy with every partner, by customs category. Bulk, bottled and bag-in-box still wine, sparkling wine and grape must are separate subheadings and are never combined. Official Eurostat statistics; volumes are the litres declared for each shipment."
        }
        activeHref="/trade"
      />

      <section className="mt-10">
        <SectionHeader
          kicker="Overview"
          title="Trade by category"
          action={{ label: "Market prices", href: "/markets/bulk-wine" }}
        />
        <div className="mt-5">
          <TradeCategorySummaryTable summaries={summaries} period={period.label} />
        </div>
      </section>

      <section className="mt-12">
        <SectionHeader
          kicker="Evolution"
          title="Monthly export volumes"
          description="Combined exports of the four countries over the last 24 months, one chart per category. Each chart has its own scale, to show the shape of the year; the table above compares sizes."
        />
        <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {TRADE_CATEGORIES.map((category, index) => (
            <figure key={category} className="min-w-0 border border-rule bg-paper">
              <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-rule px-4 py-3">
                <h3 className="text-sm font-semibold text-ink">
                  {TRADE_CATEGORY_LABELS[category]}
                </h3>
                <p className="wt-label text-ink-soft">Mhl per month</p>
              </div>
              <div className="px-2 py-3">
                <MonthlyLinesChart
                  points={monthly[index].map((point) => ({
                    month: point.month,
                    volume: point.volumeMhl,
                  }))}
                  series={[
                    { key: "volume", name: TRADE_CATEGORY_LABELS[category] },
                  ]}
                  unit="Mhl"
                  decimals={2}
                  height={180}
                />
              </div>
            </figure>
          ))}
        </div>
        <div className="mt-3">
          <SourceLine source={attribution} updatedAt={updatedAt} />
        </div>
      </section>

      {details.map((detail) => (
        <section
          key={detail.category}
          id={detail.category}
          className="mt-14 scroll-mt-6"
        >
          <SectionHeader
            kicker="Category"
            title={TRADE_CATEGORY_LABELS[detail.category]}
            description={detail.note}
          />
          <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
            <TradePartnersTable
              title="Exporters"
              rows={detail.exporters}
              period={period.label}
            />
            <TradePartnersTable
              title="Leading destinations"
              rows={detail.destinations}
              period={period.label}
            />
          </div>
          <div className="mt-5">
            <TradeFlowsRelationTable rows={detail.topFlows} period={period.label} />
          </div>
        </section>
      ))}

      <p className="wt-label mt-10 max-w-3xl leading-relaxed text-ink-soft">
        Source: {source.name}, {source.cadence.toLowerCase()}.
        {source.isSample
          ? ""
          : " The period ends at the latest month all four countries have published."}{" "}
        Shares are within each category and direction. Monthly changes
        compare the latest month with the month before; annual changes
        compare rolling 12-month periods.
      </p>
    </Container>
  );
}
