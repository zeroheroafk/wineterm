import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { KeyPricesTable } from "@/components/market/KeyPricesTable";
import { ForecastRangeTable } from "@/components/harvest/ForecastRangeTable";
import {
  EffectTag,
  KeyPointsList,
  OutlookProse,
  OutlookSection,
  RiskList,
} from "@/components/outlook/outlook";
import { BalanceTable } from "@/components/supply/BalanceTable";
import { TradeCategorySummaryTable } from "@/components/trade/TradeCategorySummaryTable";
import { CountryLabel } from "@/components/ui/CountryLabel";
import { DataStatusLabel } from "@/components/ui/DataStatusLabel";
import { UpdatedAt } from "@/components/ui/SourceLine";
import { formatDate } from "@/lib/format";
import { getHarvestService } from "@/services/harvest/service";
import { getHomeService } from "@/services/home";
import { getSource } from "@/services/markets/sources";
import { getOutlookService } from "@/services/outlook/service";
import { getSupplyService } from "@/services/supply/service";
import { getTradeService } from "@/services/trade/service";

export const metadata: Metadata = {
  title: "Market Outlook",
  description:
    "The WineTerm desk's structured view of the wine market over the next one to three months: prices, supply, demand, harvest, trade and risks.",
};

const CONTENTS = [
  { id: "summary", label: "Executive summary" },
  { id: "prices", label: "Price direction" },
  { id: "supply", label: "Supply and stocks" },
  { id: "demand", label: "Demand and buying activity" },
  { id: "harvest", label: "Harvest conditions" },
  { id: "trade", label: "Trade developments" },
  { id: "countries", label: "Country outlooks" },
  { id: "risks", label: "Risks, next one to three months" },
  { id: "sources", label: "Sources and methodology" },
];

const STANCE_STYLES = {
  firm: "border-up text-up",
  stable: "border-rule text-ink-soft",
  soft: "border-down text-down",
} as const;

export default async function OutlookPage() {
  const outlook = getOutlookService();
  const supply = getSupplyService();
  const harvest = getHarvestService();
  const trade = getTradeService();
  const home = getHomeService();

  const edition = await outlook.getCurrentEdition();
  const [balances, forecasts, tradeSummaries, tradePeriod, keyPrices, updatedAt] =
    await Promise.all([
      supply.getBalances("2026/27"),
      harvest.getCountryForecasts(),
      trade.getCategorySummaries(),
      trade.getPeriod(),
      home.getKeyPrices(),
      home.getLastUpdated(),
    ]);

  return (
    <Container className="pb-16">
      <Breadcrumbs
        items={[
          { label: "Insights", href: "/insights" },
          { label: "Market Outlook" },
        ]}
      />

      <header className="border-b border-rule pb-6">
        <p className="wt-label text-wine">
          Market Outlook
          <span aria-hidden="true" className="mx-2 text-rule">
            &middot;
          </span>
          {edition.edition}
        </p>
        <h1 className="wt-headline mt-2 max-w-3xl text-4xl leading-tight font-semibold text-ink sm:text-5xl">
          Less slack than the stock figures suggest
        </h1>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="text-sm text-ink">WineTerm Market Desk</span>
          <span aria-hidden="true" className="text-rule">
            &middot;
          </span>
          <time
            dateTime={edition.publishedAt}
            className="wt-label text-ink-soft"
          >
            Published {formatDate(edition.publishedAt)}
          </time>
          <DataStatusLabel status={edition.status} />
        </div>
      </header>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,15rem)]">
        <div className="min-w-0">
          <OutlookSection number={1} id="summary" title="Executive summary">
            <div className="max-w-2xl space-y-3">
              {edition.summaryParagraphs.map((paragraph, index) => (
                <p
                  key={index}
                  className={
                    index === 0
                      ? "wt-headline text-lg leading-relaxed text-ink"
                      : "text-[0.95rem] leading-relaxed text-ink"
                  }
                >
                  {paragraph}
                </p>
              ))}
            </div>
            <div className="mt-5 max-w-2xl">
              <KeyPointsList points={edition.keyPoints} />
            </div>
          </OutlookSection>

          <OutlookSection number={2} id="prices" title="Price direction">
            <OutlookProse paragraphs={edition.priceDirection} />
            <div className="mt-5">
              <KeyPricesTable quotes={keyPrices} updatedAt={updatedAt} />
            </div>
          </OutlookSection>

          <OutlookSection number={3} id="supply" title="Supply and stocks">
            <OutlookProse paragraphs={edition.supplyAndStocks} />
            <div className="mt-5">
              <BalanceTable rows={balances} campaign="2026/27" />
            </div>
          </OutlookSection>

          <OutlookSection
            number={4}
            id="demand"
            title="Demand and buying activity"
          >
            <OutlookProse paragraphs={edition.demand} />
          </OutlookSection>

          <OutlookSection number={5} id="harvest" title="Harvest conditions">
            <OutlookProse paragraphs={edition.harvest} />
            <div className="mt-5">
              <ForecastRangeTable forecasts={forecasts} />
            </div>
            <p className="mt-2">
              <Link
                href="/harvest"
                className="wt-label text-wine hover:text-wine-deep"
              >
                Full harvest monitor &rarr;
              </Link>
            </p>
          </OutlookSection>

          <OutlookSection number={6} id="trade" title="Trade developments">
            <OutlookProse paragraphs={edition.trade} />
            <div className="mt-5">
              <TradeCategorySummaryTable
                summaries={tradeSummaries}
                period={tradePeriod.label}
              />
            </div>
          </OutlookSection>

          <OutlookSection number={7} id="countries" title="Country outlooks">
            <div className="space-y-5">
              {edition.countryOutlooks.map((entry) => (
                <article
                  key={entry.country}
                  className="border-l-2 border-wine py-1 pl-5"
                >
                  <p className="flex flex-wrap items-center gap-2.5">
                    <CountryLabel code={entry.country} withName />
                    <span
                      className={`wt-label inline-flex items-center border px-1.5 py-0.5 ${STANCE_STYLES[entry.stance]}`}
                    >
                      {entry.stance}
                    </span>
                  </p>
                  {entry.paragraphs.map((paragraph, index) => (
                    <p
                      key={index}
                      className="mt-2 max-w-2xl text-[0.95rem] leading-relaxed text-ink"
                    >
                      {paragraph}
                    </p>
                  ))}
                </article>
              ))}
            </div>
          </OutlookSection>

          <OutlookSection
            number={8}
            id="risks"
            title="Risks, next one to three months"
          >
            <RiskList risks={edition.risks} />
          </OutlookSection>

          <OutlookSection
            number={9}
            id="sources"
            title="Sources and methodology"
          >
            <OutlookProse paragraphs={edition.methodology} />
            <ul className="mt-5 max-w-2xl divide-y divide-rule border-y border-rule">
              {edition.sourceIds.map((sourceId) => {
                const source = getSource(sourceId);
                return (
                  <li
                    key={sourceId}
                    className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-2"
                  >
                    <span className="text-sm text-ink">{source.name}</span>
                    <span className="wt-label text-ink-soft">
                      {source.coverage}
                    </span>
                  </li>
                );
              })}
            </ul>
          </OutlookSection>
        </div>

        <aside className="order-first min-w-0 lg:order-none">
          <nav
            aria-label="Contents"
            className="border border-rule bg-paper lg:sticky lg:top-6"
          >
            <p className="wt-label border-b border-rule px-4 py-2.5 text-wine">
              In this edition
            </p>
            <ol className="px-4 py-3">
              {CONTENTS.map((entry, index) => (
                <li key={entry.id}>
                  <a
                    href={`#${entry.id}`}
                    className="flex items-baseline gap-2.5 py-1 text-sm text-ink hover:text-wine-deep"
                  >
                    <span className="tnum font-mono text-xs text-ink-soft">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {entry.label}
                  </a>
                </li>
              ))}
            </ol>
            <div className="border-t border-rule px-4 py-2.5">
              <UpdatedAt iso={edition.updatedAt} />
            </div>
          </nav>
          <div className="mt-4 hidden border border-rule bg-paper px-4 py-3 lg:block">
            <p className="wt-label text-wine">Reading note</p>
            <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">
              Conclusions lead; the tables under each section carry the data
              they rest on. Effect tags read from the price perspective:
              <span className="mt-1.5 flex flex-wrap gap-1.5">
                <EffectTag effect="supportive" />
                <EffectTag effect="pressuring" />
              </span>
            </p>
          </div>
        </aside>
      </div>
    </Container>
  );
}
