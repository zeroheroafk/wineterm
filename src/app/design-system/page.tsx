import type { Metadata } from "next";

import { ArticlePreview } from "@/components/editorial/ArticlePreview";
import { NewsletterSignup } from "@/components/editorial/NewsletterSignup";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { SectionNav } from "@/components/layout/SectionNav";
import { AbsoluteChange, PercentChange } from "@/components/market/ChangeCell";
import { ChartFrame } from "@/components/market/ChartFrame";
import { MarketCommentaryBlock } from "@/components/market/MarketCommentaryBlock";
import { MarketTable } from "@/components/market/MarketTable";
import { PriceCell } from "@/components/market/PriceCell";
import { PriceLineChart } from "@/components/market/PriceLineChart";
import { TrendIndicator } from "@/components/market/TrendIndicator";
import { Button, ButtonLink } from "@/components/ui/Button";
import { CountryLabel } from "@/components/ui/CountryLabel";
import { DataStatusLabel } from "@/components/ui/DataStatusLabel";
import { FilterBar, FilterSelect } from "@/components/ui/FilterBar";
import { PageHeader, SectionHeader } from "@/components/ui/SectionHeader";
import { SourceLine, UpdatedAt } from "@/components/ui/SourceLine";
import { Tabs } from "@/components/ui/Tabs";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  TableSkeleton,
} from "@/components/ui/states";
import { primaryNavigation } from "@/lib/navigation";
import { getEditorialService } from "@/services/editorial";
import { getMarketDataService } from "@/services/market-data";
import type { DataStatus } from "@/services/types";

export const metadata: Metadata = {
  title: "Design system (internal)",
  robots: { index: false, follow: false },
};

const SWATCHES = [
  { name: "ground", varName: "--wt-ground", className: "bg-ground", hex: "#F6F2EB" },
  { name: "paper", varName: "--wt-paper", className: "bg-paper", hex: "#FCFAF5" },
  { name: "ink", varName: "--wt-ink", className: "bg-ink", hex: "#1D1A18" },
  { name: "ink-soft", varName: "--wt-ink-soft", className: "bg-ink-soft", hex: "#706A63" },
  { name: "wine", varName: "--wt-wine", className: "bg-wine", hex: "#6B2737" },
  { name: "wine-deep", varName: "--wt-wine-deep", className: "bg-wine-deep", hex: "#421724" },
  { name: "wine-wash", varName: "--wt-wine-wash", className: "bg-wine-wash", hex: "#E8DADD" },
  { name: "rule", varName: "--wt-rule", className: "bg-rule", hex: "#D6CFC5" },
  { name: "up", varName: "--wt-up", className: "bg-up", hex: "#3F6B4B" },
  { name: "down", varName: "--wt-down", className: "bg-down", hex: "#A8443A" },
  { name: "ochre", varName: "--wt-ochre", className: "bg-ochre", hex: "#A67C3D" },
];

const SPACING_STEPS = [
  { token: "1", px: "4px", className: "w-1" },
  { token: "2", px: "8px", className: "w-2" },
  { token: "3", px: "12px", className: "w-3" },
  { token: "4", px: "16px", className: "w-4" },
  { token: "6", px: "24px", className: "w-6" },
  { token: "8", px: "32px", className: "w-8" },
  { token: "12", px: "48px", className: "w-12" },
  { token: "16", px: "64px", className: "w-16" },
];

const STATUSES: DataStatus[] = [
  "final",
  "provisional",
  "estimate",
  "forecast",
  "illustrative",
];

function Spec({ children }: { children: React.ReactNode }) {
  return <p className="wt-label mb-3 text-ink-soft">{children}</p>;
}

function Block({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-12">
      <SectionHeader title={title} />
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default async function DesignSystemPage() {
  const marketData = getMarketDataService();
  const editorial = getEditorialService();

  const [quotes, series, commentary, updatedAt, articles] = await Promise.all([
    marketData.getBulkWineQuotes(),
    marketData.getPriceSeries("ES-CLM-RED-GEN"),
    marketData.getMarketCommentary("bulk"),
    marketData.getLastUpdated(),
    editorial.getLatestArticles(3),
  ]);

  const markets = primaryNavigation[0];

  return (
    <Container className="pb-16">
      <Breadcrumbs items={[{ label: "Internal" }, { label: "Design System" }]} />

      <PageHeader
        kicker="Internal reference"
        title="WineTerm design system"
        description="Tokens, typography and the core component set. This route is internal: it is excluded from the sitemap and marked noindex. All figures on this page are illustrative fixtures, not market data."
      />

      <Block title="Colours">
        <Spec>
          Defined once as CSS variables in globals.css and exposed as Tailwind
          tokens. Components never hardcode hex values.
        </Spec>
        <ul className="grid grid-cols-2 gap-px border border-rule bg-rule sm:grid-cols-3 lg:grid-cols-4">
          {SWATCHES.map((swatch) => (
            <li key={swatch.name} className="bg-paper p-3">
              <span className={`block h-12 border border-rule ${swatch.className}`} />
              <p className="wt-label mt-2 text-ink">{swatch.name}</p>
              <p className="wt-label mt-0.5 text-ink-soft">
                {swatch.varName} &middot; {swatch.hex}
              </p>
            </li>
          ))}
        </ul>
      </Block>

      <Block title="Typography">
        <Spec>
          Newsreader for editorial display, Archivo for interface text, IBM
          Plex Mono for data. Numerals are always tabular.
        </Spec>
        <div className="space-y-6 border border-rule bg-paper p-6">
          <div>
            <p className="wt-label text-ink-soft">Editorial serif / Newsreader</p>
            <p className="wt-headline mt-2 text-4xl font-semibold text-ink">
              Iberian bulk market tightens into the vintage
            </p>
            <p className="wt-headline mt-1 text-2xl italic text-ink-soft">
              Standfirst and commentary set in the italic cut
            </p>
          </div>
          <div className="border-t border-rule pt-5">
            <p className="wt-label text-ink-soft">Interface sans / Archivo</p>
            <p className="mt-2 max-w-xl text-base leading-relaxed text-ink">
              Interface text is set in Archivo: navigation, table content,
              descriptions and controls. It stays legible at small sizes and
              never competes with the serif display voice.
            </p>
          </div>
          <div className="border-t border-rule pt-5">
            <p className="wt-label text-ink-soft">Data mono / IBM Plex Mono</p>
            <p className="tnum mt-2 font-mono text-sm text-ink">
              ES-CLM-RED-GEN &nbsp; 4.10 EUR/hl &nbsp; +2.5% &nbsp; 20 Aug 2026
            </p>
            <p className="wt-label mt-2 text-wine">
              Small uppercase market labels use the mono at 11px with wide
              tracking
            </p>
          </div>
        </div>
      </Block>

      <Block title="Spacing">
        <Spec>
          The default Tailwind 4px scale. Sections breathe with 48px and 64px;
          data rows stay dense at 8px to 12px.
        </Spec>
        <ul className="space-y-2 border border-rule bg-paper p-6">
          {SPACING_STEPS.map((step) => (
            <li key={step.token} className="flex items-center gap-4">
              <span className="wt-label w-16 text-ink-soft">
                {step.token} &middot; {step.px}
              </span>
              <span className={`h-4 bg-wine ${step.className}`} />
            </li>
          ))}
        </ul>
      </Block>

      <Block title="Borders and rules">
        <Spec>
          Square corners everywhere. Hairline rules in the rule token; heavy
          2px rules in ink or wine mark the start of a section or table.
        </Spec>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="border border-rule bg-paper p-4">
            <p className="wt-label text-ink-soft">1px rule border</p>
          </div>
          <div className="border border-rule border-t-2 border-t-ink bg-paper p-4">
            <p className="wt-label text-ink-soft">2px ink top rule</p>
          </div>
          <div className="border border-rule border-t-2 border-t-wine bg-paper p-4">
            <p className="wt-label text-ink-soft">2px wine top rule</p>
          </div>
        </div>
      </Block>

      <Block title="Buttons">
        <Spec>Three variants, one 36px height, no rounding.</Spec>
        <div className="flex flex-wrap items-center gap-3 border border-rule bg-paper p-6">
          <Button>Get the briefing</Button>
          <Button variant="secondary">Download table</Button>
          <Button variant="quiet">View methodology</Button>
          <Button disabled>Disabled</Button>
          <ButtonLink href="/design-system" variant="secondary">
            Link as button
          </ButtonLink>
        </div>
      </Block>

      <Block title="Navigation patterns">
        <Spec>
          The primary navigation lives in the header above. Below: the
          secondary section rail and the breadcrumb trail.
        </Spec>
        <SectionNav section={markets} activeHref="/markets/bulk-wine" />
        <div className="mt-4 border border-rule bg-paper px-3">
          <Breadcrumbs
            items={[
              { label: "Markets", href: "/markets" },
              { label: "Bulk Wine Prices" },
            ]}
          />
        </div>
      </Block>

      <Block title="Data labels">
        <Spec>
          Status tags, country labels, source attribution and update times.
          Every table and chart carries a source line.
        </Spec>
        <div className="space-y-5 border border-rule bg-paper p-6">
          <div className="flex flex-wrap gap-2">
            {STATUSES.map((status) => (
              <DataStatusLabel key={status} status={status} />
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-4 border-t border-rule pt-5">
            <CountryLabel code="ES" withName />
            <CountryLabel code="PT" withName />
            <CountryLabel code="FR" />
            <CountryLabel code="IT" />
          </div>
          <div className="space-y-2 border-t border-rule pt-5">
            <SourceLine
              source={{ name: "Regional market bulletin (sample)" }}
              updatedAt={updatedAt}
            />
            <UpdatedAt iso={updatedAt} />
          </div>
        </div>
      </Block>

      <Block title="Price movements">
        <Spec>
          Monospace tabular numerals; green and red reserved exclusively for
          movement. Flat movement is neutral.
        </Spec>
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4 border border-rule bg-paper p-6">
          <PriceCell value={4.1} unit="EUR/hl" />
          <PriceCell value={1234.5} unit="EUR/tonne" decimals={1} />
          <PercentChange value={2.5} />
          <PercentChange value={-4.2} />
          <PercentChange value={0} />
          <AbsoluteChange value={0.15} />
          <AbsoluteChange value={-0.2} />
          <span className="inline-flex items-center gap-2">
            <TrendIndicator value={1} />
            <TrendIndicator value={-1} />
            <TrendIndicator value={0} />
          </span>
        </div>
      </Block>

      <Block title="Filters">
        <Spec>
          The filter rail sits directly above its table. Controls are native
          selects styled with tokens; the right slot carries the update time.
        </Spec>
        <FilterBar end={<UpdatedAt iso={updatedAt} />}>
          <FilterSelect label="Country" id="ds-filter-country" defaultValue="all">
            <option value="all">All countries</option>
            <option value="ES">Spain</option>
            <option value="PT">Portugal</option>
            <option value="FR">France</option>
            <option value="IT">Italy</option>
          </FilterSelect>
          <FilterSelect label="Colour" id="ds-filter-colour" defaultValue="all">
            <option value="all">All colours</option>
            <option value="red">Red</option>
            <option value="white">White</option>
            <option value="rose">Rose</option>
          </FilterSelect>
          <FilterSelect label="Period" id="ds-filter-period" defaultValue="3m">
            <option value="1m">1 month</option>
            <option value="3m">3 months</option>
            <option value="12m">12 months</option>
          </FilterSelect>
        </FilterBar>
      </Block>

      <Block title="Market table">
        <Spec>
          The core data interface. Fixture rows, marked illustrative, fetched
          through the typed market data service.
        </Spec>
        <MarketTable
          caption="Illustrative bulk wine reference prices"
          quotes={quotes}
          updatedAt={updatedAt}
        />
      </Block>

      <Block title="Chart frame">
        <Spec>
          Every chart sits in the same frame: title, code and unit on top,
          source and status underneath. The plot is a thin flat line with
          monospace ticks.
        </Spec>
        {series ? (
          <ChartFrame
            title={series.name}
            code={series.code}
            unit={series.unit}
            status={series.status}
            source={series.source}
            updatedAt={series.updatedAt}
          >
            <PriceLineChart points={series.points} unit={series.unit} />
          </ChartFrame>
        ) : null}
      </Block>

      <Block title="Tabs">
        <Spec>Underline tabs switch views inside one data panel.</Spec>
        <div className="border border-rule bg-paper p-4">
          <Tabs
            items={[
              {
                id: "table",
                label: "Table",
                content: <TableSkeleton rows={3} />,
              },
              {
                id: "chart",
                label: "Chart",
                content: (
                  <p className="text-sm text-ink-soft">
                    Chart view placeholder for the tabs demonstration.
                  </p>
                ),
              },
              {
                id: "notes",
                label: "Notes",
                content: (
                  <p className="text-sm text-ink-soft">
                    Series definitions and collection notes appear here.
                  </p>
                ),
              },
            ]}
          />
        </div>
      </Block>

      <Block title="Market commentary">
        <Spec>
          A dated desk note set in the serif, attached to a market panel by a
          burgundy rule.
        </Spec>
        {commentary ? <MarketCommentaryBlock commentary={commentary} /> : null}
      </Block>

      <Block title="Editorial previews">
        <Spec>
          Lead and list densities. Kicker in the mono label style, headline in
          the serif, meta line with date and reading time.
        </Spec>
        <div className="grid gap-8 border border-rule bg-paper p-6 lg:grid-cols-2">
          <ArticlePreview article={articles[0]} variant="lead" />
          <div>
            {articles.slice(1).map((article) => (
              <ArticlePreview key={article.id} article={article} />
            ))}
          </div>
        </div>
      </Block>

      <Block title="Empty, loading and error states">
        <Spec>
          Data panels degrade into one shared frame: dashed rule for empty,
          spinner for loading, movement-red tint for errors.
        </Spec>
        <div className="grid gap-4 lg:grid-cols-3">
          <EmptyState action={<Button variant="secondary">Reset filters</Button>} />
          <LoadingState />
          <ErrorState action={<Button variant="secondary">Retry</Button>} />
        </div>
        <div className="mt-4">
          <Spec>Table skeleton</Spec>
          <TableSkeleton />
        </div>
      </Block>

      <Block title="Newsletter modules">
        <Spec>Panel and inline variants of the briefing signup.</Spec>
        <div className="grid gap-6 lg:grid-cols-2">
          <NewsletterSignup />
          <div className="self-center">
            <NewsletterSignup variant="inline" />
          </div>
        </div>
      </Block>
    </Container>
  );
}
