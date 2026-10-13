import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { DeskBriefing } from "@/components/home/DeskBriefing";
import { PriceTerminal, type TerminalSeries } from "@/components/home/PriceTerminal";
import { formatDate, formatPercent, formatPrice } from "@/lib/format";
import { getEditorialService } from "@/services/editorial";
import { getHomeService } from "@/services/home";
import { getMarketsService, isIllustrative } from "@/services/markets/service";
import { getSource } from "@/services/markets/sources";
import { NATIONAL_AVERAGE } from "@/services/markets/types";
import { getSupplyService } from "@/services/supply/service";
import { countryName } from "@/services/types";

export const revalidate = 3600;

const DATA_LINKS = [
  { label: "Historical wine prices", href: "/markets/bulk-wine" },
  { label: "Compare markets", href: "/markets/compare" },
  { label: "Grape prices", href: "/markets/grapes" },
  { label: "Must & concentrates", href: "/markets/must-concentrates" },
  { label: "Production & stocks", href: "/supply" },
  { label: "Imports & exports", href: "/trade" },
];

function DeskHeading({ id, title, href, action }: { id: string; title: string; href: string; action: string }) {
  return <div className="wt-desk-heading"><h2 id={id}>{title}</h2><Link href={href}>{action} →</Link></div>;
}

export default async function Home() {
  const markets = getMarketsService();
  const editorial = getEditorialService();
  const [rows, articles, lead, trade, spain, reports] = await Promise.all([
    markets.getRows("bulk-wine"), editorial.getLatestArticles(8),
    getHomeService().getLeadAnalysis(), getHomeService().getTradeOverview(),
    getSupplyService().getSpainBalance(), editorial.getMonthlyReports(),
  ]);
  const publishedRows = rows.filter((row) => !isIllustrative(row));
  const selectedRows = (publishedRows.length ? publishedRows : rows)
    .sort((a, b) => Number(b.series.region === NATIONAL_AVERAGE) - Number(a.series.region === NATIONAL_AVERAGE))
    .slice(0, 7);
  const series: TerminalSeries[] = await Promise.all(selectedRows.map(async (row) => {
    const wine = [row.series.colour, row.series.classification === "no-gi" ? "no GI" : row.series.classification?.toUpperCase()].filter(Boolean).join(" · ");
    return {
      code: row.series.code,
      label: row.series.region === NATIONAL_AVERAGE ? (wine || "National bulk") : `${row.series.appellation ?? row.series.region}${row.series.colour ? ` · ${row.series.colour}` : ""}`,
      country: row.series.country,
      price: row.latest.value,
      unit: row.series.unit,
      weekly: row.changes.weekPercent,
      annual: row.changes.yoyPercent,
      date: row.latest.date,
      source: getSource(row.series.sourceId).name,
      sample: isIllustrative(row),
      points: (await markets.getHistory(row.series.code, "1y")).map(({ date, value }) => ({ date, value })),
    };
  }));
  const availableReports = reports.filter((report) => report.status === "available");
  const tradeSample = trade.status === "illustrative";

  return (
    <>
      <h1 className="sr-only">WineTerm — wine prices, news and market intelligence</h1>
      <section aria-label="Wine market terminal" className="border-b border-rule bg-paper">
        <Container>
          <div className="grid lg:grid-cols-[minmax(0,2.6fr)_minmax(0,1fr)]">
            <PriceTerminal series={series} />
            <aside aria-labelledby="desk-top" className="border-t border-rule lg:border-t-0 lg:border-l">
              <div className="flex min-h-8 items-center justify-between border-b border-rule bg-ground px-3">
                <h2 id="desk-top" className="wt-desk-meta font-medium">From the market desk</h2>
                <Link href="/insights" className="text-[10px] text-wine hover:underline">View all →</Link>
              </div>
              <div className="wt-desk-list px-3">
                {articles.slice(0, 3).map((article) => (
                  <article key={article.id} className="grid grid-cols-[3.5rem_1fr] gap-3 py-3">
                    <time dateTime={article.publishedAt} className="wt-desk-meta text-ink-soft">{formatDate(article.publishedAt)}</time>
                    <div>
                      <Link href={article.href} className="text-[13px] leading-snug hover:text-wine">{article.headline}</Link>
                      <p className="wt-desk-meta mt-1 text-wine">{article.kind} · {article.readingMinutes} min read</p>
                      <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-ink-soft">{article.standfirst}</p>
                    </div>
                  </article>
                ))}
                <div className="py-3">
                  <Link href="/supply" className="text-[13px] font-medium hover:text-wine">Production, stocks & availability →</Link>
                  <p className="mt-1 text-[11px] leading-relaxed text-ink-soft">Follow the physical balance of the European wine market.</p>
                </div>
              </div>
            </aside>
          </div>
        </Container>
      </section>

      <section aria-labelledby="export-strip" className="border-b border-rule bg-paper">
        <Container className="py-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="export-strip" className="text-xs font-bold uppercase"><span className="mr-2 text-wine" aria-hidden="true">↗</span>Export monitor {tradeSample ? <span className="ml-2 font-normal text-ochre-deep">· Illustrative samples</span> : null}</h2>
            <Link href="/trade" className="text-[11px] text-wine hover:underline">All trade data ›</Link>
          </div>
          <p className="mt-1 text-[11px] text-ink-soft">{trade.exportersLabel} · {trade.period} · Million hectolitres · Source: {trade.source.name}</p>
          <div className="mt-2 grid grid-cols-2 border-t border-rule md:grid-cols-4">
            {trade.exporters.slice(0, 4).map((row) => <div key={row.country} className="flex flex-wrap items-center justify-between gap-2 border-rule px-3 py-2 text-xs md:border-r md:last:border-r-0"><span>{countryName(row.country)}</span><span className="tnum font-mono font-medium">{formatPrice(row.volumeMhl, 1)} <span className="text-[10px] font-normal text-ink-soft">Mhl</span> <span className={`text-[10px] ${row.yoyPercent !== null && row.yoyPercent < 0 ? "text-down" : "text-up"}`}>{row.yoyPercent === null ? "—" : formatPercent(row.yoyPercent)}</span></span></div>)}
          </div>
        </Container>
      </section>

      {lead ? (
        <section aria-labelledby="lead-story" className="relative overflow-hidden bg-feature text-white">
          {lead.chart ? <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-[8%] hidden w-[44%] flex-col justify-center gap-10 opacity-15 lg:flex">
            {lead.chart.bars.map((bar) => <div key={bar.label}><p className="mb-2 text-3xl font-medium">{formatPrice(bar.percent, 0)}% · {bar.label}</p><div className="h-12 border border-white/30"><div className="h-full bg-wine-wash" style={{ width: `${bar.percent}%` }} /></div></div>)}
          </div> : null}
          <Container className="relative py-12 sm:py-16">
            <div className="max-w-[44rem]">
              <div className="flex items-center gap-2"><span className="wt-desk-meta rounded bg-wine px-2 py-1 font-medium text-white">WineTerm</span><span className="wt-desk-meta rounded border border-white/40 px-2 py-0.5">Analysis</span></div>
              <h2 id="lead-story" className="mt-4 text-[2rem] leading-[1.14] font-bold tracking-[-.025em] sm:text-[2.75rem]"><Link href={lead.href} className="hover:underline">{lead.headline}</Link></h2>
              <p className="mt-5 max-w-[41rem] text-base leading-relaxed text-white/85 sm:text-lg">{lead.standfirst}</p>
              <div className="wt-desk-meta mt-5 flex items-center gap-4 text-white/60"><time dateTime={lead.publishedAt}>Published {formatDate(lead.publishedAt)}</time><span>{lead.readingMinutes} min read</span></div>
              <Link href={lead.href} className="mt-5 inline-flex items-center gap-3 text-xs font-semibold text-white">Read the analysis <span aria-hidden="true">→</span></Link>
            </div>
          </Container>
        </section>
      ) : null}

      <Container className="pt-6 pb-10">
        <DeskBriefing />
        <div className="mt-8 grid items-start gap-8 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)_minmax(0,1fr)]">
          <section aria-labelledby="latest-desk">
            <DeskHeading id="latest-desk" title="Latest" href="/insights" action="View all" />
            <p className="mt-1 text-xs text-ink-soft">News and analysis from the WineTerm desk.</p>
            <div className="wt-desk-list mt-4">
              {articles.map((article) => <article key={article.id} className="py-4 first:pt-1"><p className="wt-desk-meta text-wine">{article.kind}</p><h3 className="mt-1 text-[15px] leading-snug font-semibold"><Link href={article.href} className="hover:text-wine">{article.headline}</Link></h3><p className="wt-desk-meta mt-2 text-ink-soft">Published <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time></p></article>)}
            </div>
            <Link href="/industry" className="mt-4 block border-t border-rule pt-3 text-xs text-wine hover:underline">Companies, regulation & industry →</Link>
          </section>

          <div className="space-y-8">
            <section aria-labelledby="trade-desk">
              <DeskHeading id="trade-desk" title="Wine trade monitor" href="/trade" action="Full trade data" />
              <p className="mt-1 text-xs text-ink-soft">Export volumes by product form · {trade.period}.</p>
              <div className="mt-3 border border-rule bg-paper">
                <p className="wt-desk-meta border-b border-rule bg-ground px-3 py-2 text-wine">{tradeSample ? "Illustrative data · not published statistics" : trade.source.name}</p>
                {trade.split.map((segment) => <div key={segment.label} className="grid grid-cols-[1fr_auto] gap-4 border-b border-rule p-3 last:border-b-0"><div><h3 className="text-sm font-semibold">{segment.label}</h3><div aria-hidden="true" className="mt-2 h-1.5 bg-ground"><div className="h-full bg-wine/70" style={{ width: `${segment.sharePercent}%` }} /></div></div><div className="tnum text-right"><p className="font-mono text-sm font-medium">{formatPrice(segment.volumeMhl, 1)} Mhl</p><p className="mt-1 text-[11px] text-ink-soft">{formatPrice(segment.sharePercent, 1)}% of volume</p></div></div>)}
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-ink-soft">{trade.scopeNote}</p>
            </section>
            <section aria-labelledby="supply-desk">
              <DeskHeading id="supply-desk" title="Production & stocks" href="/supply" action="Supply balance" />
              {spain ? <>
                <p className="mt-2 text-xs text-ink-soft">Spain · {spain.latest.campaign} · Through {spain.latestMonth} · Source: {getSource(spain.sourceId).name}</p>
                <dl className="wt-desk-list mt-3">
                  {[
                    ["Production", "Wine made since 1 August", spain.latest.madeMhl],
                    ["Stocks", "Declared closing stocks", spain.latest.closingMhl],
                    ["Availability", "Opening stocks, production & entries", spain.latest.availabilityMhl],
                  ].map(([label, note, value]) => <div key={String(label)} className="grid grid-cols-[6rem_1fr_auto] items-center gap-3 py-3"><dt className="wt-desk-meta text-wine">{label}</dt><dd className="text-xs text-ink-soft">{note}</dd><dd className="tnum font-mono text-xs">{formatPrice(Number(value), 1)} Mhl</dd></div>)}
                </dl>
              </> : <div className="py-4 text-sm leading-relaxed text-ink-soft">Published supply data is not connected. <Link href="/supply" className="text-wine hover:underline">Explore the supply tools with labelled samples →</Link></div>}
            </section>
          </div>

          <div className="space-y-8 md:col-span-2 xl:col-span-1">
            <section aria-labelledby="reports-desk">
              <DeskHeading id="reports-desk" title="Market reports" href="/insights/monthly-reports" action="View all" />
              <div className="wt-desk-list mt-3">
                {availableReports.length ? availableReports.map((report) => <article key={report.id} className="py-4"><p className="wt-desk-meta text-wine">WineTerm · Report</p><h3 className="mt-1 text-sm font-semibold"><Link href="/insights/monthly-reports">{report.title}</Link></h3><p className="wt-desk-meta mt-2 text-ink-soft">{report.month}</p></article>) : <div className="py-4"><p className="wt-desk-meta text-wine">In preparation</p><h3 className="mt-1 text-sm font-semibold">Monthly market reports</h3><p className="mt-2 text-xs leading-relaxed text-ink-soft">Structured reviews of wine prices, supply and trade. Reports will appear here when published.</p></div>}
              </div>
              <Link href="/insights/monthly-reports" className="mt-3 block bg-wine px-3 py-2.5 text-center text-[11px] font-bold uppercase text-white hover:bg-wine-deep">Explore market reports</Link>
            </section>
            <section aria-labelledby="data-desk">
              <DeskHeading id="data-desk" title="Market data" href="/markets" action="All data" />
              <ul className="wt-desk-list mt-2">{DATA_LINKS.map((item) => <li key={item.href}><Link href={item.href} className="flex items-center justify-between py-3 text-sm hover:text-wine"><span><span aria-hidden="true" className="mr-2 text-wine">↗</span>{item.label}</span><span aria-hidden="true" className="text-ink-soft">›</span></Link></li>)}</ul>
            </section>
          </div>
        </div>
      </Container>
    </>
  );
}
