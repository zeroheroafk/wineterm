/**
 * Official 2026 harvest forecasts, entered by hand from each body's latest
 * release and updated when a new one appears: Agreste revises France's
 * estimate each month from August to November, the IVV forecasts Portugal
 * once before the harvest, and Spain's Ministry of Agriculture estimates
 * wine grapes in its monthly crop estimates, wine and must only once the
 * harvest is in. Italy's usual forecasters published none this year.
 * Volumes in Mhl as each source counts them, so their scopes differ.
 */

import type { CountryHarvestForecast } from "@/services/harvest/types";

/** When WineTerm last checked the releases below. */
export const OFFICIAL_FORECASTS_UPDATED_AT = "2026-09-30T16:00:00Z";

export const officialForecasts: CountryHarvestForecast[] = [
  {
    country: "ES",
    minMhl: null,
    maxMhl: null,
    // Wine and must made in 2025, provisional, from the same estimates.
    previousMhl: 32.575,
    direction: null,
    commentary:
      "No wine forecast yet. The Ministry of Agriculture's crop estimates, as of May and published in September, put 2026 wine grapes at 4.88 million tonnes, 8.8% above 2025, from 2.5% less vineyard in production. 2025 gave 32.6 Mhl of wine and must, provisional.",
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
      "6.7 Mhl forecast for 2026/27, 12% above 2025/26 and 4% below the average of the last five campaigns, after favourable weather and low disease pressure. The Douro (+25%), Alentejo, Península de Setúbal and Trás-os-Montes (+15% each) carry the increase; the Azores fall 20%.",
    status: "forecast",
    sourceId: "ivv",
    publishedAt: "2026-08-03",
    updatedAt: OFFICIAL_FORECASTS_UPDATED_AT,
  },
  {
    country: "FR",
    minMhl: 33.864,
    maxMhl: 33.864,
    previousMhl: 35.894,
    direction: "down",
    commentary:
      "33.9 Mhl estimated at 1 September, 6% below 2025 and 17% below the 2021-2025 average: one of the smallest crops in 30 years. Vineyard in production is down 2.5% and summer drought and heatwaves cut yields. Champagne's crop is about half of 2025's and Burgundy's Pinot noir lost over half; IGP wines rise 4%. All wine, including wine for brandy.",
    status: "forecast",
    sourceId: "agreste",
    publishedAt: "2026-09-07",
    updatedAt: OFFICIAL_FORECASTS_UPDATED_AT,
  },
  {
    country: "IT",
    minMhl: null,
    maxMhl: null,
    previousMhl: null,
    direction: null,
    commentary:
      "No forecast this year: Unione Italiana Vini, Assoenologi and ISMEA dropped their usual pre-harvest estimate and will publish results once picking ends, asking for the grape harvest declarations to be brought forward to mid-November.",
    status: "forecast",
    sourceId: "uiv-assoenologi-ismea",
    publishedAt: "2026-07-29",
    updatedAt: OFFICIAL_FORECASTS_UPDATED_AT,
  },
];
