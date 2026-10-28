import type { ArticleDetail } from "@/services/types";

const id = "market-report-september-2026";

export const marketReportSeptember2026: ArticleDetail = {
  id,
  kind: "monthly-report",
  section: "Market Report",
  headline: "Market Report, September 2026",
  standfirst:
    "Spanish white wine ended September 17% cheaper than a year earlier as an early harvest filled cellars, while exports from the four main producers kept shrinking and France gathered one of its smallest crops in decades.",
  publishedAt: "2026-10-08",
  readingMinutes: 5,
  href: `/insights/monthly-reports/${id}`,
  body: [
    {
      text: "September closed with the Spanish market divided by colour. White wine without a geographical indication sold for markedly less than a year earlier and red for slightly more, while Spanish producers declared more wine made in August than in any August since the monthly declarations began in 2018. Exports from Spain, Portugal, France and Italy were lower in the first half of 2026 than in 2025, and France expects a harvest well below average. This report sets out the figures published up to 8 October.",
    },
    {
      heading: "Prices",
      text: "The Spanish Ministry of Agriculture's national average for white wine without PDO or PGI was €42.19/hl in the week to 27 September, 17.1% below the €50.90 of the same week of 2025. Red wine without PDO or PGI was €47.88/hl, 2.5% above a year earlier. Both have eased since the last week of July, white by 7.1% and red by 6.6%.",
      cites: [1],
    },
    {
      text: "The representative markets show how uneven the picture is. White fell 26.3% on the year in Badajoz, to €39.00/hl, and 20.2% in Ciudad Real, to €39.34/hl, but rose 8.5% in Albacete, to €62.76/hl, and 6.1% in Cuenca, to €51.79/hl. In Toledo both colours were lower, red by 11.6% and white by 13.6%. A single market's weekly quotation can move sharply from one week to the next, so these readings are a guide to the spread rather than a trend.",
      cites: [2],
    },
    {
      text: "In Languedoc-Roussillon, the monthly averages of bulk contracts compiled by DRAAF Occitanie, the latest for July, put PGI red at €89.85/hl, 2.5% below July 2025, PGI rosé at €78.18/hl (down 1.8%) and PGI white at €123.38/hl (up 4.3%). For the other producers, WineTerm's estimate from customs data, the average value of each country's bulk wine exports, rose 8.1% in Portugal to €89.12/hl in July and 4.3% in France to €140.43/hl in June, while Italy's fell 12.8% to €86.86/hl.",
      cites: [3, 5],
    },
    {
      heading: "Spain's cellars",
      text: "Producers and warehouse holders in Spain declared 10.61 Mhl of wine made in August, more than twice the 4.72 Mhl of August 2025 and well above the previous high of 5.89 Mhl in August 2023, according to the INFOVI declarations the ministry published on 7 October. Stocks at 31 August came to 37.28 Mhl of wine, 19.7% more than a year earlier. Bulk white rose 41.5% to 14.46 Mhl and bulk red and rosé 12.9% to 16.71 Mhl, while packaged wine was little changed at 6.11 Mhl. Stocks of must that is not concentrated rose 61.1% to 2.83 Mhl.",
      cites: [4],
    },
    {
      text: "Part of the gap is timing: a harvest that starts earlier puts more wine in the August figures, and the comparison will narrow as the later months of 2025's crop come into view. The campaign started from a similar base, with stocks at 31 July 1.3% below a year earlier at 28.37 Mhl, but the ministry's crop estimates put this year's wine grapes 8.8% above 2025's. Lower white prices are consistent with a market preparing for more wine.",
      cites: [4, 8],
    },
    {
      text: "Wine leaving cellars was weaker. Declarants sent 1.07 Mhl abroad in August, 16.4% less than a year before, 60% of it in bulk; exits within Spain, other than to distilleries and vinegar makers, fell 4.4% to 1.72 Mhl.",
      cites: [4],
    },
    {
      heading: "Trade",
      text: "Customs figures to mid-year show exports contracting across the four producers. Spain exported 10.25 Mhl of wine from January to July, 15.4% less than in 2025, worth €1.64 billion (down 7.6%). Its bulk exports fell 19.2% to 5.61 Mhl, while their average value rose 8.6% to €55.2/hl. Portugal's exports fell 10.0% to 1.82 Mhl, and its bulk exports 26.8%. From January to June, France exported 6.22 Mhl, 1.6% less than a year earlier, for €5.43 billion (down 2.2%), and Italy 9.86 Mhl, 4.0% less, for €3.63 billion (down 6.2%).",
      cites: [5],
    },
    {
      heading: "Harvest",
      text: "France expects one of its smallest crops in three decades. Agreste's estimate at 1 September is 33.9 Mhl, 6% below 2025 and 17% below the 2021 to 2025 average, after drought and heatwaves and with 2.5% less vineyard in production. Portugal's IVV forecasts 6.7 Mhl for 2026/27, 12% more than the previous campaign. Spain has no wine forecast yet, only the crop estimate for grapes, and Italy's industry bodies dropped their pre-harvest forecast in favour of results after the harvest.",
      cites: [6, 7, 8, 9],
    },
    {
      heading: "What to watch",
      text: "October brings the September INFOVI declarations, with the wine made in the second month of the harvest; Eurostat's August trade figures, due in mid-October; and Agreste's next estimate for France. Whether Spanish white wine prices steady once the size of the new crop is clearer will set the tone for the campaign's first months.",
    },
  ],
  tables: [
    {
      title: "Bulk wine prices, EUR/hl",
      columns: ["Latest", "A year earlier", "Change"],
      rows: [
        { label: "Spain, white without PDO/PGI, week to 27 Sep", cells: ["42.19", "50.90", "−17.1%"] },
        { label: "Spain, red without PDO/PGI, week to 27 Sep", cells: ["47.88", "46.70", "+2.5%"] },
        { label: "Languedoc-Roussillon, PGI red, July", cells: ["89.85", "92.17", "−2.5%"] },
        { label: "Languedoc-Roussillon, PGI rosé, July", cells: ["78.18", "79.59", "−1.8%"] },
        { label: "Languedoc-Roussillon, PGI white, July", cells: ["123.38", "118.26", "+4.3%"] },
        { label: "Portugal, bulk exports, July", cells: ["89.12", "82.47", "+8.1%"] },
        { label: "France, bulk exports, June", cells: ["140.43", "134.65", "+4.3%"] },
        { label: "Italy, bulk exports, June", cells: ["86.86", "99.59", "−12.8%"] },
      ],
      cites: [1, 3, 5],
      afterParagraph: 3,
    },
    {
      title: "Spain, declared wine at 31 August, Mhl",
      columns: ["2026", "2025", "Change"],
      rows: [
        { label: "Stocks of wine", cells: ["37.28", "31.14", "+19.7%"] },
        { label: "Red and rosé, bulk", cells: ["16.71", "14.80", "+12.9%"] },
        { label: "White, bulk", cells: ["14.46", "10.22", "+41.5%"] },
        { label: "Packaged", cells: ["6.11", "6.12", "−0.2%"] },
        { label: "Stocks of must, not concentrated", cells: ["2.83", "1.76", "+61.1%"] },
        { label: "Wine made in August", cells: ["10.61", "4.72", "+124.7%"] },
      ],
      cites: [4],
      afterParagraph: 5,
    },
  ],
  sources: [
    {
      citation: [
        "Ministerio de Agricultura, Pesca y Alimentación, ",
        { title: "Precios Medios Nacionales" },
        ", weekly wine prices, 2025 and 2026",
      ],
      url: "https://www.mapa.gob.es/es/estadistica/temas/estadisticas-agrarias/economia/precios-medios-nacionales",
    },
    {
      citation: [
        "Ministerio de Agricultura, Pesca y Alimentación, ",
        { title: "Informe Semanal de Coyuntura" },
        ", table 2.2, prices in representative wine markets",
      ],
      url: "https://www.mapa.gob.es/es/estadistica/temas/publicaciones/informe-semanal-coyuntura",
      note: "Ciudad Real's year-earlier price is for the week to 21 September 2025, the nearest published.",
    },
    {
      citation: [
        "DRAAF Occitanie, ",
        { title: "Marché vrac des vins de la région Occitanie" },
        ", monthly prices of bulk contracts",
      ],
      url: "https://draaf.occitanie.agriculture.gouv.fr/marche-vrac-des-vins-de-la-region-occitanie-donnees-actualisees-a345.html",
    },
    {
      citation: [
        "Ministerio de Agricultura, Pesca y Alimentación, ",
        { title: "Informe INFOVI" },
        ", July and August 2025 and 2026",
      ],
      url: "https://www.mapa.gob.es/es/agricultura/temas/producciones-agricolas/vitivinicultura/datos_infovi_anteriores",
      note: "Producers of less than 1,000 hl a year do not declare monthly and are not included.",
    },
    {
      citation: [
        "Eurostat, ",
        { title: "EU trade since 1988 by HS2-4-6 and CN8" },
        " (DS-045409), CN 2204 and 2204 29",
      ],
      url: "https://ec.europa.eu/eurostat/web/international-trade-in-goods/database",
      note: "Bulk export prices are WineTerm's calculation: the value of bulk wine exports divided by their volume.",
    },
    {
      citation: [
        "Agreste, ",
        { title: "Infos rapides Viticulture" },
        " no. 2026-107, estimates at 1 September 2026",
      ],
      url: "https://agreste.agriculture.gouv.fr/agreste-web/disaron/IraVit26107/detail/",
    },
    {
      citation: [
        "Instituto da Vinha e do Vinho, ",
        { title: "Previsão de colheita, campanha 2026/2027" },
        ", 3 August 2026",
      ],
      url: "https://www.ivv.gov.pt/noticias/previsao-de-colheita-campanha-2026-2027/",
    },
    {
      citation: [
        "Ministerio de Agricultura, Pesca y Alimentación, ",
        { title: "Avances de superficies y producciones de cultivos" },
        ", May 2026",
      ],
      url: "https://www.mapa.gob.es/es/estadistica/temas/estadisticas-agrarias/agricultura/avances-superficies-producciones-agricolas",
    },
    {
      citation: [
        "Unione Italiana Vini, ",
        { title: "Vendemmia 2026: dati consuntivi a fine campagna" },
        ", 29 July 2026",
      ],
      url: "https://www.unioneitalianavini.it/approfondimenti-tematici/news/vendemmia-2026-dati-consuntivi-fine-campagna",
    },
  ],
};
