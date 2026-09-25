import type { Metadata } from "next";
import { Suspense } from "react";

import { Container } from "@/components/layout/Container";
import { MarketCommentaryBlock } from "@/components/market/MarketCommentaryBlock";
import {
  MarketFilterPanel,
  type FilterFieldConfig,
} from "@/components/markets/MarketFilterPanel";
import { MarketsPageHeader } from "@/components/markets/MarketsPageHeader";
import { MustPricesTable } from "@/components/markets/MustPricesTable";
import { UpdatedAt } from "@/components/ui/SourceLine";
import { getMarketsService } from "@/services/markets/service";
import {
  filterFromParams,
  type SearchParams,
} from "@/services/markets/params";
import { MUST_PRODUCT_LABELS } from "@/services/markets/types";
import { COUNTRY_NAMES, type CountryCode } from "@/services/types";

export const metadata: Metadata = {
  title: "Must & Concentrates",
  description:
    "Grape must, concentrated must and RCGM quotations with technical specifications and original units.",
};

export default async function MustConcentratesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const markets = getMarketsService();
  const filter = filterFromParams(params);

  const [rows, options, commentary] = await Promise.all([
    markets.getRows("must", filter),
    markets.getFilterOptions("must"),
    markets.getCommentary("must"),
  ]);

  const updatedAt = rows[0]?.latest.updatedAt;

  const fields: FilterFieldConfig[] = [
    {
      param: "product",
      label: "Product",
      type: "select",
      options: Object.entries(MUST_PRODUCT_LABELS).map(([value, label]) => ({
        value,
        label,
      })),
    },
    {
      param: "colour",
      label: "Colour",
      type: "select",
      options: [
        { value: "red", label: "Red" },
        { value: "white", label: "White" },
      ],
    },
    {
      param: "country",
      label: "Origin",
      type: "select",
      options: options.countries.map((code) => ({
        value: code,
        label: COUNTRY_NAMES[code as CountryCode] ?? code,
      })),
    },
    {
      param: "unit",
      label: "Unit",
      type: "select",
      options: options.units.map((unit) => ({ value: unit, label: unit })),
    },
    {
      param: "source",
      label: "Source type",
      type: "select",
      options: [
        { value: "official", label: "Official" },
        { value: "reported", label: "Reported" },
        { value: "indicative", label: "Indicative" },
        { value: "estimated", label: "Estimated" },
      ],
    },
  ];

  return (
    <Container className="pb-16">
      <MarketsPageHeader
        crumb="Must & Concentrates"
        title="Must & Concentrates"
        description="Quotations for grape must, concentrated grape must and rectified concentrated grape must, with the technical specification each price refers to. Must is quoted by volume and concentrates by mass; the two are never converted into each other. Development figures are illustrative samples."
        activeHref="/markets/must-concentrates"
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
        <MustPricesTable rows={rows} />
        <p className="wt-label mt-2 max-w-3xl leading-relaxed text-ink-soft">
          Prices refer to the stated specification (potential alcohol for
          must, Brix for concentrates). Quotations with different
          specifications are separate series and are not averaged together.
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
