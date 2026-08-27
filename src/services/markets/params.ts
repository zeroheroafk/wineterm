/**
 * URL query parameter helpers shared by the Markets pages. Filter state
 * lives entirely in the URL so it is shareable and survives navigating
 * into a market detail page and back.
 */

import type { SeriesFilter } from "@/services/markets/service";

export type SearchParams = Record<string, string | string[] | undefined>;

export function firstParam(
  params: SearchParams,
  key: string,
): string | undefined {
  const value = params[key];
  return typeof value === "string" && value !== "" ? value : undefined;
}

/** Maps URL parameters onto the typed series filter. */
export function filterFromParams(params: SearchParams): SeriesFilter {
  return {
    country: firstParam(params, "country"),
    region: firstParam(params, "region"),
    classification: firstParam(params, "classification"),
    colour: firstParam(params, "colour"),
    category: firstParam(params, "category"),
    campaign: firstParam(params, "campaign"),
    currency: firstParam(params, "currency"),
    unit: firstParam(params, "unit"),
    window: firstParam(params, "observed"),
    dataClass: firstParam(params, "source"),
    variety: firstParam(params, "variety"),
    harvest: firstParam(params, "harvest"),
    sourceType: firstParam(params, "sourcetype"),
    product: firstParam(params, "product"),
  };
}
