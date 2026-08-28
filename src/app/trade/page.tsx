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
import { getSource } from "@/services/markets/sources";
import { getTradeService } from "@/services/trade/service";
import {
  TRADE_CATEGORY_LABELS,
  type TradeCategory,
  type TradeMonthlyPoint,
} from "@/services/trade/types";

export const metadata: Metadata = {
  title: "Trade",
  description:
    "Wine trade flows by customs category: bulk, bottled still, sparkling, and must and concentrates. Volumes, values, unit values and partners.",
};

const CATEGORY_ORDER: TradeCategory[] = ["bulk", "bottled", "sparkling", "must"];

export default async function TradePage() {
  const trade = getTradeService();
  const [period, summaries, details] = await Promise.all([
    trade.getPeriod(),
    trade.getCategorySummaries(),
    trade.getAllCategoryDetails(),
  ]);
  const monthly = await Promise.all(
    CATEGORY_ORDER.map((category) => trade.getMonthlyExportVolumes(category)),
  );
  const customsSource = getSource("sample-customs");

  const monthlyPoints = monthly[0].map((point: TradeMonthlyPoint, index) => {
    const row: { month: string; [key: string]: string | number } = {
      month: point.month,
    };
    CATEGORY_ORDER.forEach((category, categoryIndex) => {
      row[category] = monthly[categoryIndex][index].volumeMhl;
    });
    return row;
  });

  return (
    <Container className="pb-16">
      <SectionPageHeader
        section={primaryNavigation[2]}
        crumbs={[{ label: "Trade" }]}
        kicker="Trade"
        title="Imports and exports"
        description="External trade of Spain, Portugal, France and Italy by customs category. Bulk, bottled still, sparkling, and must and concentrates are separate headings and are never combined. Development figures are illustrative samples."
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
          description="Combined exports of the four countries, by category, over the last 24 months. Sparkling shows its usual year-end seasonality; each line is a separate customs heading."
        />
        <figure className="mt-5 border border-rule bg-paper">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-rule px-4 py-3">
            <h3 className="text-sm font-semibold text-ink">
              Exports by category
            </h3>
            <p className="wt-label text-ink-soft">Mhl per month</p>
          </div>
          <div className="px-2 py-3">
            <MonthlyLinesChart
              points={monthlyPoints}
              series={CATEGORY_ORDER.map((category) => ({
                key: category,
                name: TRADE_CATEGORY_LABELS[category],
              }))}
              unit="Mhl"
            />
          </div>
          <figcaption className="border-t border-rule px-4 py-2.5">
            <SourceLine source={{ name: customsSource.name }} />
          </figcaption>
        </figure>
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
        Source: {customsSource.name}, {customsSource.cadence.toLowerCase()}.
        Shares are within each category and direction. Monthly changes
        compare the latest available month with the month before; annual
        changes compare rolling 12-month periods.
      </p>
    </Container>
  );
}
