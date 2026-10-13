import Link from "next/link";
import { ShareChart } from "@/components/charts/ShareChart";
import { Container } from "@/components/layout/Container";
import { DeskBriefing } from "@/components/home/DeskBriefing";
import { PriceTerminal, type TerminalSeries } from "@/components/home/PriceTerminal";
import { formatDate } from "@/lib/format";
import { getEditorialService } from "@/services/editorial";
import { getHomeService } from "@/services/home";
import { getMarketsService, isIllustrative } from "@/services/markets/service";
import { getSource } from "@/services/markets/sources";
import { NATIONAL_AVERAGE } from "@/services/markets/types";

export const revalidate = 3600;

function DeskHeading({ id, title, href, action }: { id: string; title: string; href: string; action: string }) {
  return <div className="wt-desk-heading"><h2 id={id}>{title}</h2><Link href={href}>{action} →</Link></div>;
}

export default async function Home() {
  const markets = getMarketsService();
  const editorial = getEditorialService();
  const [rows, articles, lead, reports] = await Promise.all([
    markets.getRows("bulk-wine"), editorial.getLatestArticles(8),
    getHomeService().getLeadAnalysis(), editorial.getMonthlyReports(),
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
  const otherArticles = articles.filter((article) => article.id !== lead?.id);

  return (
    <Container className="pt-6 pb-10 sm:pt-8">
      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Wine prices & intelligence</h1>
          <p className="mt-1 text-sm text-ink-soft">Reference prices, published analysis and market reports.</p>
        </div>
        <Link href="/markets/bulk-wine" className="text-xs font-medium text-wine hover:underline">All wine prices →</Link>
      </div>
      <section aria-label="Wine prices" className="overflow-hidden border border-rule bg-paper">
        <PriceTerminal series={series} />
      </section>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <section aria-labelledby="analysis-desk">
          <DeskHeading id="analysis-desk" title="Analysis" href="/insights/analysis" action="All analysis" />
          {lead ? (
            <article aria-labelledby="lead-story" className="mt-5 border-l-[3px] border-wine pl-5 sm:pl-6">
              <p className="wt-desk-meta text-wine">Featured analysis · {lead.section}</p>
              <h2 id="lead-story" className="mt-2 max-w-2xl font-serif text-[1.875rem] leading-[1.15] font-semibold sm:text-[2.25rem]">
                <Link href={lead.href} className="hover:text-wine">{lead.headline}</Link>
              </h2>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink-soft">{lead.standfirst}</p>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-ink-soft">
                <time dateTime={lead.publishedAt}>{formatDate(lead.publishedAt)}</time>
                <span>{lead.readingMinutes} min read</span>
                <Link href={lead.href} className="font-medium text-wine hover:underline">Read analysis →</Link>
              </div>
              {lead.chart ? <div className="mt-5 max-w-xl"><ShareChart chart={lead.chart} titleId="featured-analysis-chart" /></div> : null}
            </article>
          ) : <p className="py-5 text-sm text-ink-soft">Published analysis will appear here.</p>}

          {otherArticles.length > 0 ? (
            <div className="mt-6 grid gap-6 border-t border-rule pt-5 sm:grid-cols-2">
              {otherArticles.map((article) => (
                <article key={article.id}>
                  <p className="wt-desk-meta text-wine">{article.kind}</p>
                  <h3 className="mt-2 text-base leading-snug font-semibold"><Link href={article.href} className="hover:text-wine">{article.headline}</Link></h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{article.standfirst}</p>
                  <p className="mt-2 text-xs text-ink-soft"><time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time> · {article.readingMinutes} min read</p>
                </article>
              ))}
            </div>
          ) : null}
        </section>

        <aside aria-labelledby="reports-desk">
          <DeskHeading id="reports-desk" title="Reports" href="/insights/monthly-reports" action="All reports" />
          <div className="wt-desk-list mt-3">
            {availableReports.length > 0 ? availableReports.map((report) => (
              <article key={report.id} className="py-4">
                <p className="wt-desk-meta text-wine">WineTerm · Market report</p>
                <h3 className="mt-2 text-base font-semibold"><Link href="/insights/monthly-reports" className="hover:text-wine">{report.title}</Link></h3>
                <p className="mt-2 text-xs text-ink-soft">{report.month}</p>
              </article>
            )) : (
              <div className="py-4">
                <p className="wt-desk-meta text-wine">In preparation</p>
                <h3 className="mt-2 font-serif text-2xl font-semibold">Monthly market reports</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">A monthly review of wine prices and the factors shaping the market. Reports will appear here when published.</p>
              </div>
            )}
          </div>
          <Link href="/insights/monthly-reports" className="mt-3 block border border-wine px-4 py-3 text-center text-xs font-semibold text-wine hover:bg-wine-wash">Explore reports →</Link>
          <div className="mt-6 border-t border-rule pt-5">
            <h3 className="text-sm font-semibold">The weekly briefing</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">Wine prices and analysis in your inbox every Friday.</p>
            <Link href="/briefing" className="mt-3 inline-block text-xs font-medium text-wine hover:underline">Get the briefing →</Link>
          </div>
        </aside>
      </div>

      <div className="mt-10"><DeskBriefing /></div>
    </Container>
  );
}
