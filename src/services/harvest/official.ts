/**
 * Official estimates of the 2026 harvest, entered by hand from each
 * body's latest release and updated when a new one appears: Agreste
 * revises France's estimate each month from August to November, the IVV
 * forecasts Portugal once before the harvest, and Spain's Ministry of
 * Agriculture estimates wine grapes in its monthly crop estimates, wine
 * and must only once the harvest is in. Italy's usual forecasters
 * published none this year. Volumes in Mhl as each source counts them,
 * so their scopes differ.
 */

import type { CountryHarvestForecast } from "@/services/harvest/types";

/** The campaign the estimates are for: the 2026 harvest opens 2026/27. */
export const HARVEST_CAMPAIGN = "2026/27";

/** When WineTerm last checked the releases below. */
export const OFFICIAL_FORECASTS_UPDATED_AT = "2026-10-21T10:00:00Z";

export const officialForecasts: CountryHarvestForecast[] = [
  {
    country: "ES",
    minMhl: null,
    maxMhl: null,
    // Wine and must made in 2025, provisional, from the same estimates.
    previousMhl: 32.575,
    direction: null,
    commentary:
      "No wine estimate yet. The Ministry of Agriculture's crop estimates, as of May and published in September, put 2026 wine grapes at 4.88 million tonnes, 8.8% above 2025, from 2.5% less vineyard in production. 2025 gave 32.6 Mhl of wine and must, provisional.",
    status: "forecast",
    sourceId: "mapa-avances",
    publishedAt: "2026-09-14",
    updatedAt: OFFICIAL_FORECASTS_UPDATED_AT,
  },
  {
    country: "PT",
    minMhl: 6.666,
    maxMhl: 6.666,
    previousMhl: 5.956,
    direction: "up",
    commentary:
      "6.7 Mhl forecast for 2026/27, 12% above 2025/26 and 4% below the average of the last five campaigns, after favourable weather and low disease pressure. The Douro (+25%), Alentejo, Península de Setúbal and Trás-os-Montes (+15% each) carry the increase; the Azores fall 20%. The institute publishes no revision during the harvest.",
    status: "forecast",
    sourceId: "ivv",
    publishedAt: "2026-08-03",
    updatedAt: OFFICIAL_FORECASTS_UPDATED_AT,
  },
  {
    // Agreste's issue 2026-127 of 7 October gives the estimate at 1
    // October as "près de 35 millions d'hectolitres": the issue itself
    // could not be read on 21 October, so the figure is the rounded one
    // it states, to be replaced by its exact total.
    country: "FR",
    minMhl: 35,
    maxMhl: 35,
    previousMhl: 35.894,
    direction: "down",
    commentary:
      "Nearly 35 Mhl estimated at 1 October, revised slightly up from the 33.9 Mhl of September on better yields than expected in Languedoc-Roussillon: 2% below 2025 and 14% below the 2021-2025 average, still one of the smallest crops in 30 years. Vineyard in production is down 2.5% and summer drought and heatwaves cut yields. All wine, including wine for brandy; the next estimate is due on 6 November.",
    status: "provisional",
    sourceId: "agreste",
    publishedAt: "2026-10-07",
    updatedAt: OFFICIAL_FORECASTS_UPDATED_AT,
  },
  {
    country: "IT",
    minMhl: null,
    maxMhl: null,
    previousMhl: null,
    direction: null,
    commentary:
      "No estimate this year: Unione Italiana Vini, Assoenologi and ISMEA dropped their usual pre-harvest forecast and will publish results once picking ends, asking for the grape harvest declarations to be brought forward to mid-November.",
    status: "forecast",
    sourceId: "uiv-assoenologi-ismea",
    publishedAt: "2026-07-29",
    updatedAt: OFFICIAL_FORECASTS_UPDATED_AT,
  },
];
