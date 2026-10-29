import type { Metadata } from "next";
import { Suspense } from "react";

import { Container } from "@/components/layout/Container";
import { BulkPricesTable } from "@/components/markets/BulkPricesTable";
import {
  MarketFilterPanel,
  type FilterFieldConfig,
} from "@/components/markets/MarketFilterPanel";
import { MarketsPageHeader } from "@/components/markets/MarketsPageHeader";
import { ResultsFallback } from "@/components/markets/ResultsFallback";
import { SourceLine, UpdatedAt } from "@/components/ui/SourceLine";
import { EmptyState } from "@/components/ui/states";
import { getMarketsService } from "@/services/markets/service";
import {
  filterFromParams,
  type SearchParams,
} from "@/services/markets/params";
import { getSource } from "@/services/markets/sources";
import {
  COUNTRY_NAMES,
  type CountryCode,
  type DataSource,
} from "@/services/types";

export const metadata: Metadata = {
  title: "Bulk Wine Prices: Spain, France, Italy, Portugal",
  description:
    "Bulk wine prices by country, region, classification and colour, with original units preserved.",
  alternates: { canonical: "/markets/bulk-wine" },
};

/**
 * The header is prerendered; the filtered table reads the query string,
 * so it renders at request time behind the fallback.
 */
export default function BulkWinePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  return (
    <Container className="pb-16">
      <MarketsPageHeader
        crumb="Bulk Wine Prices"
        title="Bulk Wine Prices"
        description="Bulk wine prices across the main European producing regions. Observations keep their original unit, with labelled EUR/hl normalisations beside them. National averages are listed first, then prices in regional reference markets. How each price is established is set out in the methodology."
        activeHref="/markets/bulk-wine"
      />

      <Suspense fallback={<ResultsFallback />}>
        <BulkWineResults searchParams={searchParams} />
      </Suspense>
    </Container>
  );
}

async function BulkWineResults({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const markets = getMarketsService();
  const filter = filterFromParams(params);

  const [rows, allRows, options] = await Promise.all([
    markets.getRows("bulk-wine", filter),
    markets.getRows("bulk-wine"),
    markets.getFilterOptions("bulk-wine"),
  ]);
  if (allRows.length === 0) {
    return (
      <div className="mt-8">
        <EmptyState
          title="No bulk wine prices to show"
          detail="Prices are read from the database, which this build is not connected to."
        />
      </div>
    );
  }

  const updatedAt = rows
    .map((row) => row.latest.updatedAt)
    .sort()
    .at(-1);
  // The publishers of the prices shown, cited under the table.
  const sources = [
    ...new Map(
      rows.map((row): [string, DataSource] => {
        const source = getSource(row.series.sourceId);
        return [source.id, { name: source.name, url: source.url }];
      }),
    ).values(),
  ];

  const fields: FilterFieldConfig[] = [
    {
      param: "country",
      label: "Country",
      type: "select",
      options: options.countries.map((code) => ({
        value: code,
        label: COUNTRY_NAMES[code as CountryCode] ?? code,
      })),
    },
    {
      param: "region",
      label: "Region",
      type: "search",
      options: options.regions.map((region) => ({
        value: region,
        label: region,
      })),
    },
    {
      param: "classification",
      label: "Classification",
      type: "select",
      options: [
        { value: "no-gi", label: "Without PDO or PGI" },
        { value: "pgi", label: "PGI wine" },
        { value: "pdo", label: "PDO wine" },
      ],
    },
    {
      param: "colour",
      label: "Colour",
      type: "select",
      options: [
        { value: "red", label: "Red" },
        { value: "white", label: "White" },
        { value: "rose", label: "Rosé" },
      ],
    },
    {
      param: "category",
      label: "Category",
      type: "select",
      options: [
        { value: "generic", label: "Generic" },
        { value: "varietal", label: "Varietal" },
        { value: "organic", label: "Organic" },
      ],
    },
    {
      param: "campaign",
      label: "Campaign",
      type: "select",
      options: options.campaigns.map((campaign) => ({
        value: campaign,
        label: campaign,
      })),
    },
    {
      param: "currency",
      label: "Currency",
      type: "select",
      options: [{ value: "EUR", label: "EUR" }],
    },
    {
      param: "unit",
      label: "Unit",
      type: "select",
      options: options.units.map((unit) => ({ value: unit, label: unit })),
    },
    {
      param: "observed",
      label: "Observed",
      type: "select",
      options: [
        { value: "7", label: "Last 7 days" },
        { value: "30", label: "Last 30 days" },
      ],
    },
  ];

  return (
    <>
      <div className="mt-8">
        <MarketFilterPanel
          fields={fields}
          resultCount={rows.length}
          end={updatedAt ? <UpdatedAt iso={updatedAt} /> : undefined}
        />
      </div>

      <div className="mt-5">
        <BulkPricesTable rows={rows} />
        {sources.length > 0 ? (
          <div className="mt-2">
            <SourceLine source={sources} />
          </div>
        ) : null}
        <p className="wt-label mt-2 text-ink-soft">
          <sup className="text-ochre-deep">n</sup> Normalised to EUR/hl from the
          original unit for comparability. The original observation is always
          shown first; the normalisation never replaces it.
          {rows.some((row) => row.series.perDegree)
            ? " Prices recorded per hectolitre-degree are shown in EUR/hl at the wine's strength; each series page gives the recorded value and the strength used."
            : null}
        </p>
      </div>
    </>
  );
}
