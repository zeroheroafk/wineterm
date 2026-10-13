import Link from "next/link";

import { ShareChart } from "@/components/charts/ShareChart";
import { ArticlePreview } from "@/components/editorial/ArticlePreview";
import { BriefingBand } from "@/components/editorial/BriefingBand";
import { Container } from "@/components/layout/Container";
import { KeyPricesTable } from "@/components/market/KeyPricesTable";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { ButtonLink } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { formatPrice } from "@/lib/format";
import { getEditorialService } from "@/services/editorial";
import { getHomeService } from "@/services/home";

export const revalidate = 3600;

const TASKS = [
  { href: "/markets/bulk-wine", title: "Check wine prices", description: "Find reference prices by country, region and wine category." },
  { href: "/markets/compare", title: "Compare markets", description: "Follow price history and compare compatible series." },
  { href: "/trade", title: "Explore wine trade", description: "Understand imports, exports and leading destinations." },
];

export default async function Home() {
  const home = getHomeService();
  const [keyPrices, trade, leadAnalysis, secondaryAnalysis, news] = await Promise.all([
    home.getKeyPrices(), home.getTradeOverview(), home.getLeadAnalysis(),
    home.getSecondaryAnalysis(), getEditorialService().getArticlesByKind("news", 3),
  ]);
  const realPrices = keyPrices.filter((quote) => quote.status !== "illustrative");
  const countries = new Set(realPrices.map((quote) => quote.country));
  const hasRealTrade = trade.status !== "illustrative";

  return (
    <Container>
      <section aria-labelledby="home-intro" className="py-10 sm:py-14">
        <p className="wt-kicker text-wine">Wine market intelligence</p>
        <h1 id="home-intro" className="wt-headline mt-3 max-w-3xl text-4xl leading-[1.1] font-semibold text-balance sm:text-5xl">
          Understand the market. Find your next move.
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-soft">
          Wine prices, production and trade data for wineries, growers and buyers.
          Start with the information you need.
        </p>
        <div className="mt-7 grid gap-3 md:grid-cols-3">
          {TASKS.map((task) => (
            <Link key={task.href} href={task.href} className="group border border-rule bg-paper p-5 transition-colors hover:border-wine">
              <h2 className="text-base font-semibold text-wine-deep">{task.title} <span aria-hidden="true">&rarr;</span></h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{task.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="home-summary" className="border-y border-rule py-6">
        <h2 id="home-summary" className="wt-kicker text-wine">Market at a glance</h2>
        <div className="mt-4 grid gap-6 sm:grid-cols-3">
          <div>
            <p className="tnum text-3xl font-semibold">{realPrices.length}</p>
            <p className="mt-1 text-sm text-ink-soft">National price series from published sources</p>
            <ArrowLink href="/markets/bulk-wine" className="mt-2">View prices</ArrowLink>
          </div>
          <div>
            <p className="tnum text-3xl font-semibold">{countries.size}</p>
            <p className="mt-1 text-sm text-ink-soft">Countries with national reference prices</p>
            <ArrowLink href="/insights/methodology#bulk-prices" className="mt-2">Sources and coverage</ArrowLink>
          </div>
          <div>
            <p className="tnum text-3xl font-semibold">{hasRealTrade ? `${formatPrice(trade.splitTotalMhl, 1)} Mhl` : "Not available"}</p>
            <p className="mt-1 text-sm text-ink-soft">{hasRealTrade ? `Wine exports · ${trade.period}` : "Published trade data is not connected."}</p>
            {hasRealTrade ? <p className="mt-1 text-sm text-ink-soft">Source: {trade.source.name}</p> : null}
            <ArrowLink href="/trade" className="mt-2">Explore trade</ArrowLink>
          </div>
        </div>
      </section>

      <section aria-labelledby="home-prices" className="mt-10 sm:mt-12">
        <SectionHeader variant="editorial" id="home-prices" title="Key wine prices"
          description="National reference prices. Each row shows its observation date; changes compare with the previous observation."
          action={{ label: "All wine prices", href: "/markets/bulk-wine" }} />
        <div className="mt-5">
          {realPrices.length > 0 ? (
            <KeyPricesTable variant="editorial" quotes={realPrices.slice(0, 6)} methodologyHref="/insights/methodology#bulk-prices" />
          ) : (
            <div className="border border-rule bg-paper p-6">
              <p className="font-medium">Published prices are not connected yet.</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">You can explore the price tools using clearly labelled sample data. Samples are not market prices.</p>
              <div className="mt-4"><ButtonLink href="/markets/bulk-wine" variant="secondary">Explore sample prices</ButtonLink></div>
            </div>
          )}
        </div>
      </section>

      {leadAnalysis || news.length > 0 ? (
        <section aria-labelledby="home-analysis" className="mt-12">
          <SectionHeader variant="editorial" id="home-analysis" title="News & analysis" action={{ label: "All news & analysis", href: "/insights" }} />
          <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            {leadAnalysis ? <ArticlePreview article={leadAnalysis} variant="feature" visual={leadAnalysis.chart ? <ShareChart chart={leadAnalysis.chart} titleId="lead-analysis-chart" /> : undefined} /> : null}
            <div className="space-y-6 border-t border-rule pt-6 lg:border-t-0 lg:border-l lg:pl-8 lg:pt-0">
              {(news.length > 0 ? news : secondaryAnalysis).slice(0, 3).map((article) => <ArticlePreview key={article.id} article={article} variant="compact" />)}
            </div>
          </div>
        </section>
      ) : null}

      <section aria-labelledby="home-more" className="mt-12">
        <SectionHeader variant="editorial" id="home-more" title="Explore the wider market" />
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {[
            { href: "/supply", title: "Production & stocks", text: "Explore production, stocks and supply balances, with source and sample status shown on each page." },
            { href: "/harvest", title: "Harvest outlook", text: "Explore the harvest monitor. Regional reports currently use illustrative sample data." },
            { href: "/trade", title: "Imports & exports", text: hasRealTrade ? `${trade.period}. ${trade.scopeNote} Source: ${trade.source.name}.` : "Explore trade by category and destination using illustrative samples." },
          ].map((item) => (
            <Link key={item.href} href={item.href} className="border border-rule bg-paper p-5 hover:border-wine">
              <h3 className="wt-headline text-xl font-semibold">{item.title} <span aria-hidden="true">&rarr;</span></h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{item.text}</p>
            </Link>
          ))}
        </div>
      </section>
      <div className="mt-12"><BriefingBand /></div>
    </Container>
  );
}
