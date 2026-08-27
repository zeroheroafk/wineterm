import type { Metadata } from "next";
import { Suspense } from "react";

import { Container } from "@/components/layout/Container";
import { MarketCommentaryBlock } from "@/components/market/MarketCommentaryBlock";
import { GrapePricesTable } from "@/components/markets/GrapePricesTable";
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
import { OBSERVATION_SOURCE_LABELS } from "@/services/markets/types";
import { COUNTRY_NAMES, type CountryCode } from "@/services/types";

export const metadata: Metadata = {
  title: "Grape Prices",
  description:
    "Grape prices by region, variety and harvest, with explicit provenance for every observation.",
};

export default async function GrapePricesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const markets = getMarketsService();
  const filter = filterFromParams(params);

  const [rows, options, commentary] = await Promise.all([
    markets.getRows("grape", filter),
    markets.getFilterOptions("grape"),
    markets.getCommentary("grape"),
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
      param: "variety",
      label: "Variety",
      type: "search",
      options: options.varieties.map((variety) => ({
        value: variety,
        label: variety,
      })),
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
      param: "harvest",
      label: "Harvest",
      type: "select",
      options: options.harvestYears.map((year) => ({
        value: year,
        label: year,
      })),
    },
    {
      param: "sourcetype",
      label: "Source type",
      type: "select",
      options: Object.entries(OBSERVATION_SOURCE_LABELS).map(
        ([value, label]) => ({ value, label }),
      ),
    },
    {
      param: "unit",
      label: "Unit",
      type: "select",
      options: options.units.map((unit) => ({ value: unit, label: unit })),
    },
  ];

  return (
    <Container className="pb-16">
      <MarketsPageHeader
        crumb="Grape Prices"
        title="Grape Prices"
        description="Grape prices by region, appellation, variety and harvest. Every observation states how it was established: official campaign averages, registered contracts, cooperative settlements, buyer announcements, reported ranges or clearly labelled WineTerm estimates. Development figures are illustrative samples."
        activeHref="/markets/grapes"
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
        <GrapePricesTable rows={rows} />
        <p className="wt-label mt-2 max-w-3xl leading-relaxed text-ink-soft">
          Grape markets are fragmented and regional. WineTerm publishes
          individual observations with their provenance and does not
          aggregate them into a national index; no average across these rows
          represents a national market price.
          <sup className="ml-1 text-ochre">n</sup> marks values normalised to
          EUR/kg from the original unit.
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
