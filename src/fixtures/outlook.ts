/**
 * ILLUSTRATIVE FIXTURE DATA: the Market Outlook edition.
 *
 * Sample editorial content demonstrating the publication structure. The
 * judgement is written against the illustrative development data in the
 * other fixture sets and is not real market analysis. Data tables on
 * the page are pulled from the services, not duplicated here.
 */

import type { OutlookEdition } from "@/services/outlook/types";

export const currentOutlook: OutlookEdition = {
  id: "outlook-2026-08",
  edition: "Late August 2026",
  publishedAt: "2026-08-21T08:00:00Z",
  updatedAt: "2026-08-21T09:30:00Z",
  status: "illustrative",
  summaryParagraphs: [
    "The market enters the 2026/27 campaign with less slack than the headline stock figures suggest. Opening stocks across the four countries are the lowest of the last five campaigns, buyers hold thinner forward cover than usual for late August, and the first crop estimates leave no margin for a weather setback in Iberia. We expect generic red prices to stay firm through the early campaign and whites to remain adequately supplied unless harvest revisions cut the white crop.",
    "The main moderating force is demand. Bulk export volumes have declined for a second season and bottled shipments are flat at best, so any price strength rests on short supply rather than consumption growth. That makes the current firmness real but conditional, and sensitive to the size of the Italian crop now being confirmed.",
  ],
  keyPoints: [
    {
      id: "ok-1",
      text: "Generic red: firm into the vintage on thin old-crop availability and early cover buying.",
      effect: "supportive",
    },
    {
      id: "ok-2",
      text: "Whites: comfortable for now; direction depends on harvest revisions through September.",
      effect: "neutral",
    },
    {
      id: "ok-3",
      text: "Demand: bulk export volumes still contracting, capping the upside of any rally.",
      effect: "pressuring",
    },
    {
      id: "ok-4",
      text: "Italy is the swing factor: a crop at the top of its range would ease Iberian tightness by winter.",
      effect: "pressuring",
    },
  ],
  priceDirection: [
    "Iberian generic red firmed through August as buyers brought forward cover ahead of a crop that starts from the lowest opening stocks in five campaigns. Weekly gains are modest in absolute terms but consistent, and reported ranges have narrowed, which usually signals genuine scarcity of spot parcels rather than reporting noise.",
    "Whites tell a different story. Availability is comfortable, Lisboa and Castilla-La Mancha whites eased in recent weeks, and early harvest volumes of clean, sound whites will add pressure through September. PDO bulk ranges in Rioja and the Douro remain stable on thin traded volume, which limits their information value for the wider market.",
  ],
  supplyAndStocks: [
    "First estimates put the four-country crop slightly above last campaign, but the balance matters more than the headline: the production recovery starts from reduced opening stocks, so total availability rises far less than production. On our indicative balance, closing stocks rebuild modestly in Spain and Italy and continue to erode in France.",
    "Stock declarations are not fully comparable across countries: reference dates differ by up to a month and France reports a single annual figure. Direction is nevertheless consistent: reported stocks are flat to lower everywhere except Spain, where the small rebuild reflects last campaign's weak exports as much as this year's crop.",
  ],
  demand: [
    "Buying activity is early-campaign cover, not expansion. Bottlers report routine contract renewals at moderately higher red prices and unchanged white prices, and no operator we survey describes strategic stock building. Bulk demand from northern European bottlers remains the swing segment to watch: it responds fastest when origin prices firm.",
    "Consumer offtake in the main markets continues to drift lower in volume while holding in value. For the balance of the next quarter we treat demand as a constraint on price strength rather than a source of it.",
  ],
  harvest: [
    "The harvest is opening roughly on schedule in the south and one to two weeks out in the north. The season splits along water availability: irrigated and coastal vineyards carry average to good crops in sound condition, while unirrigated Iberian plots lost potential to the dry July. Quality indicators so far are good, particularly acidity retention in early whites.",
    "Forecast ranges remain wide and will narrow with September declarations. The distribution of risk is not symmetrical: a hot, dry finish would trim Spain and Portugal further, while the upside case rests almost entirely on Italy confirming the top of its range.",
  ],
  trade: [
    "Bulk export volumes are down again on a twelve-month basis, with value roughly held by higher unit values. Bottled volumes are flat with value up around two percent, and sparkling continues to grow from a smaller base. The pattern is consistent with a market trading less wine at higher average prices.",
    "Flows into Germany and the United Kingdom remain the volume anchors for bulk; the United States remains the value anchor for bottled and sparkling. Must and concentrate trade is small and stable, and we treat it separately throughout: its volumes are not comparable with wine.",
  ],
  countryOutlooks: [
    {
      country: "ES",
      stance: "firm",
      paragraphs: [
        "Spain drives the current firmness. Old-crop generic red is short, the new crop starts from low stocks, and early cover buying has met thin spot availability. A crop near the top of the estimate range would calm the market by November; a dry finish would extend the firmness into winter. Whites are well supplied and should stay competitive against other origins.",
      ],
    },
    {
      country: "PT",
      stance: "stable",
      paragraphs: [
        "Portugal opens broadly balanced. Alentejo carries a good white crop, the Douro remains rain-dependent, and exporters retain cover from last campaign. Prices track Spain with a lag; we expect stability unless Spanish reds extend their run.",
      ],
    },
    {
      country: "FR",
      stance: "soft",
      paragraphs: [
        "France points below last campaign, but structural surplus in the generic segment keeps the market soft: domestic use continues to decline faster than supply adjusts. Contract prices for no-GI reds are steady; PGI varietal whites remain the firmer niche on export demand.",
      ],
    },
    {
      country: "IT",
      stance: "stable",
      paragraphs: [
        "Italy heads for the largest crop of the four. Early southern volumes are sound and Veneto expects an above-average Glera harvest. Confirmation of the upper range would pressure generic prices across the south and cap the Iberian rally; we hold a stable stance until September declarations.",
      ],
    },
  ],
  risks: [
    {
      id: "rk-1",
      title: "Hot, dry finish to the Iberian season",
      detail:
        "A further heat episode before mid-September would cut dryland red yields in Castilla-La Mancha and Extremadura and tighten the generic red balance materially.",
      horizon: "next month",
      likelihood: "medium",
      effect: "supportive",
    },
    {
      id: "rk-2",
      title: "Italian crop confirms at the top of its range",
      detail:
        "Southern Italian availability at full range would restore competition in generic red export markets and cap Iberian firmness by late autumn.",
      horizon: "one to three months",
      likelihood: "medium",
      effect: "pressuring",
    },
    {
      id: "rk-3",
      title: "Harvest rain disrupts quality in the north",
      detail:
        "Sustained September rain in northern appellations would shift volume between quality bands more than it changes totals, moving PDO and PGI differentials rather than the generic price level.",
      horizon: "one to three months",
      likelihood: "low",
      effect: "neutral",
    },
    {
      id: "rk-4",
      title: "Further weakening of bulk export demand",
      detail:
        "A third consecutive season of contracting bulk volumes would leave the campaign dependent on domestic disappearance and distillation measures, pressuring prices from the demand side regardless of crop size.",
      horizon: "one to three months",
      likelihood: "medium",
      effect: "pressuring",
    },
  ],
  methodology: [
    "The Market Outlook combines the WineTerm desk's judgement with the platform's structured series: bulk wine reference prices, supply balances, stock declarations, harvest field reporting and customs aggregates. Interpretation comes first; the tables that follow each section show the data the judgement rests on.",
    "Balance items use the indicative identity of opening stocks plus production plus imports, minus domestic use and exports. The identity is not exact across sources: definitions, reference dates and revisions differ, and residuals against declared stocks are shown rather than smoothed away.",
    "During development, every figure on this page is an illustrative sample and every named source is a stand-in. Nothing here is live market data or investment advice.",
  ],
  sourceIds: [
    "sample-official-bulletin-es",
    "sample-official-bulletin-pt",
    "sample-official-bulletin-fr",
    "sample-official-bulletin-it",
    "sample-supply-stats",
    "sample-harvest-network",
    "sample-customs",
    "wineterm-desk",
  ],
};
