import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { SectionPageHeader } from "@/components/layout/SectionPageHeader";
import { TradeFlowsPanel } from "@/components/market/TradeFlowsPanel";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SourceLine } from "@/components/ui/SourceLine";
import { formatMonthYear, formatPrice } from "@/lib/format";
import { marketDataNavigation } from "@/lib/navigation";
import { getHomeService } from "@/services/home";
import { getSource } from "@/services/markets/sources";
import { getSupplyService } from "@/services/supply/service";

export const revalidate = 3600;
export const metadata: Metadata = {
  title: "Market data",
  description: "Wine production, stocks, supply balances, harvest and international trade data.",
};

const SECTIONS = [
  { href: "/supply/production", title: "Production", description: "Wine made by campaign, country and colour." },
  { href: "/supply/stocks", title: "Stocks", description: "Declared stocks and historical comparisons." },
  { href: "/supply", title: "Supply balance", description: "Production, opening stocks, entries and exits." },
  { href: "/harvest", title: "Harvest outlook", description: "Harvest progress, regional conditions and forecasts." },
  { href: "/trade", title: "Imports & exports", description: "Trade by country, destination and wine category." },
];

export default async function MarketDataPage() {
  const [trade, spain] = await Promise.all([
    getHomeService().getTradeOverview(),
    getSupplyService().getSpainBalance(),
  ]);
  const supplySource = spain ? getSource(spain.sourceId) : null;

  return (
    <Container className="pb-12">
      <SectionPageHeader section={marketDataNavigation}
        crumbs={[{ label: "Market data" }]}
        kicker="Market data" title="The wine market in figures"
        description="Production, stocks, harvest and international trade. Choose a dataset or explore the summaries below."
        activeHref="/data" />

      <section aria-label="Explore datasets" className="mt-7 grid gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
        {SECTIONS.map((section) => (
          <Link key={section.href} href={section.href} className="border-b border-rule py-5 hover:text-wine">
            <h2 className="flex items-center justify-between gap-3 text-base font-semibold">{section.title}<span aria-hidden="true">→</span></h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{section.description}</p>
          </Link>
        ))}
      </section>

      <section aria-labelledby="data-trade" className="mt-10">
        <SectionHeader id="data-trade" title="Trade overview"
          description={`${trade.exportersLabel}. ${trade.period}. Volumes in million hectolitres; changes compare with a year earlier.`}
          action={{ label: "All trade data", href: "/trade" }} />
        <div className="mt-5"><TradeFlowsPanel overview={trade} /></div>
      </section>

      <section aria-labelledby="data-supply" className="mt-10">
        <SectionHeader id="data-supply" title="Production & stocks"
          description={spain ? `Spain · ${spain.latest.campaign} · Through ${formatMonthYear(spain.latestMonth)}. Wine only; monthly INFOVI declarations cover producers of 1,000 hl or more and warehouse holders.` : "Published supply data is not connected yet. The detailed pages include clearly labelled illustrative samples."}
          action={{ label: "Full supply balance", href: "/supply" }} />
        {spain && supplySource ? (
          <>
            <dl className="mt-5 grid gap-4 border-y border-rule py-5 sm:grid-cols-3">
              {[
                { label: "Wine production", note: "Made since 1 August", value: spain.latest.madeMhl },
                { label: "Closing stocks", note: "Declared at month end", value: spain.latest.closingMhl },
                { label: "Availability", note: "Opening stocks, production & entries", value: spain.latest.availabilityMhl },
              ].map((figure) => <div key={figure.label}><dt className="text-sm font-medium">{figure.label}</dt><dd className="tnum mt-2 font-mono text-2xl">{formatPrice(figure.value, 1)} <span className="text-sm text-ink-soft">Mhl</span></dd><dd className="mt-1 text-xs text-ink-soft">{figure.note}</dd></div>)}
            </dl>
            <div className="mt-3"><SourceLine source={{ name: supplySource.name, url: supplySource.url }} updatedAt={spain.updatedAt} /></div>
          </>
        ) : null}
      </section>

      <section aria-labelledby="data-harvest" className="mt-10 border-t border-rule pt-5">
        <h2 id="data-harvest" className="text-lg font-semibold">Harvest & growing conditions</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">The harvest monitor groups regional progress, vineyard conditions and production forecasts. Regional reports currently use illustrative sample data.</p>
        <Link href="/harvest" className="mt-3 inline-block text-sm font-medium text-wine hover:underline">Explore the harvest monitor →</Link>
      </section>
    </Container>
  );
}
