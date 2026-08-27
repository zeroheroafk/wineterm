import type { Metadata } from "next";
import { Suspense } from "react";

import { Container } from "@/components/layout/Container";
import { MarketCommentaryBlock } from "@/components/market/MarketCommentaryBlock";
import { BulkPricesTable } from "@/components/markets/BulkPricesTable";
import {
  MarketFilterPanel,
  type FilterFieldConfig,
} from "@/components/markets/MarketFilterPanel";
import { MarketsPageHeader } from "@/components/markets/MarketsPageHeader";
import { UpdatedAt } from "@/components/ui/SourceLine";
import { getMarketsService } from "@/services/markets/service";
import {
  filterFromParams,
  type SearchParams,
} from "@/services/markets/params";
import { COUNTRY_NAMES, type CountryCode } from "@/services/types";

export const metadata: Metadata = {
  title: "Bulk Wine Prices",
  description:
    "Weekly bulk wine reference prices by country, region, classification and colour, with original units preserved.",
};

export default async function BulkWinePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const markets = getMarketsService();
  const filter = filterFromParams(params);

  const [rows, options, commentary] = await Promise.all([
    markets.getRows("bulk-wine", filter),
    markets.getFilterOptions("bulk-wine"),
    markets.getCommentary("bulk-wine"),
  ]);

  const updatedAt = rows[0]?.latest.updatedAt;

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
        { value: "rose", label: "Rose" },
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
    {
      param: "source",
      label: "Source type",
      type: "select",
      options: [
        { value: "official", label: "Official" },
        { value: "reported", label: "Reported" },
        { value: "indicative", label: "Indicative" },
        { value: "modelled", label: "Modelled" },
        { value: "estimated", label: "Estimated" },
      ],
    },
  ];

  return (
    <Container className="pb-16">
      <MarketsPageHeader
        crumb="Bulk Wine Prices"
        title="Bulk Wine Prices"
        description="Weekly reference prices for bulk wine across the main European producing regions. Observations keep their original unit; EUR/hl normalisations are labelled, never substituted. Development figures are illustrative samples."
        activeHref="/markets/bulk-wine"
      />

      <div className="mt-8">
        <Suspense fallback={<div className="h-16 border-y border-rule bg-paper" />}>
          <MarketFilterPanel
            fields={fields}
            resultCount={rows.length}
            end={updatedAt ? <UpdatedAt iso={updatedAt} /> : undefined}
          />
        </Suspense>
      </div>

      <div className="mt-5">
        <BulkPricesTable rows={rows} />
        <p className="wt-label mt-2 text-ink-soft">
          <sup className="text-ochre">n</sup> Normalised to EUR/hl from the
          original unit for comparability. The original observation is always
          shown first and is never replaced.
        </p>
      </div>

      {commentary ? (
        <div className="mt-10 max-w-3xl">
          <MarketCommentaryBlock commentary={commentary} />
        </div>
      ) : null}
    </Container>
  );
}
