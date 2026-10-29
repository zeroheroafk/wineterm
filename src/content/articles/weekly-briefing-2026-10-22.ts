import type { ArticleDetail } from "@/services/types";

const id = "weekly-briefing-2026-10-22";

export const weeklyBriefing20261022: ArticleDetail = {
  id,
  kind: "weekly-briefing",
  section: "Weekly Briefing",
  headline: "Spanish white wine rebounds as an early crop fills Italy's cellars",
  standfirst:
    "Spain's white wine without a GI gained 8.5% in two weeks, Italy's cellars hold 14% more wine than a year ago with the new crop already fermenting, French stocks are the lowest since 2018, and EU governments set their line on wine in the farm market reform.",
  description:
    "Spain's white wine without a GI gained 8.5% in two weeks, Italy's cellars hold 14% more wine than a year ago, and French stocks are the lowest since 2018.",
  publishedAt: "2026-10-22",
  readingMinutes: 3,
  href: `/insights/weekly-briefing/${id}`,
  hero: {
    src: `/images/insights/${id}.jpg`,
    width: 1920,
    height: 1280,
    alt: "Rows of tall stainless steel wine tanks under a metal catwalk, with hoses, a pump and a small mobile tank on the wet tiled floor of a cellar.",
    caption: "Fermentation tanks in a cellar at Chavignol, near Sancerre.",
    author: "Cjp24",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Stainless_steel_vinification_tanks.jpg",
    licence: { name: "CC BY-SA 4.0", url: "https://creativecommons.org/licenses/by-sa/4.0/" },
    changes: "cropped",
  },
  body: [
    {
      heading: "Prices: white wine turns up",
      text: "The national average for white wine without PDO or PGI rose to €45.76/hl in the week to 11 October, 8.5% above the €42.19 of two weeks earlier and its highest since July, though still 7.2% below the same week of 2025. Red reached €50.30/hl, its highest since early August and 8.9% above a year earlier. Brokers do not read a turn yet: Ciatti's October report describes bulk buying as hesitant and highly sensitive to price, with soft consumption and large carryover stocks leaving buyers in the stronger position.",
      cites: [1, 2],
    },
    {
      heading: "Spain and Portugal: exports fall in August",
      text: "Eurostat's August figures confirm the drop in shipments that Spain's declarations showed. Spain exported 1.21 Mhl of wine, 13.7% less than in August 2025, worth €183.7 million, 9.7% less. Bulk wine, in containers of more than 10 litres, fell 20.2% to 0.64 Mhl at an average €52.68/hl, 3.4% more than a year earlier. From January to August Spain's exports are down 15.1% in volume, to 11.48 Mhl, and 7.7% in value. Portugal shipped 0.22 Mhl in August, 11.5% less, worth 5.3% less.",
      cites: [3],
    },
    {
      heading: "Italy: the new crop is already in the tanks",
      text: "Italy's cellars held 41.0 Mhl of wine at 30 September, 14.2% more than a year earlier. Beside it sat 12.8 Mhl of must and 8.9 Mhl of new wine still fermenting, nearly twice the 4.6 Mhl of September 2025, a measure of how early the harvest came in. The crop itself is smaller: the European Commission's figures of 12 October put Italy's 2026 production at 41.1 Mhl, 7.6% below 2025, and the EU's at 139 Mhl, about the same as last year.",
      cites: [4, 5],
    },
    {
      heading: "France: lower stocks, late grubbing-up",
      text: "French producers and traders declared 48.5 Mhl of wine in stock at 31 July, 5.4% less than a year earlier and the least since 2018, in the customs figures published on 15 October. Producers held 26.5 Mhl, 8.6% less, and traders 22.0 Mhl, 1.3% less. The grubbing-up meant to shrink the vineyard is running late: 7,800 hectares had been pulled up by 7 October, leaving some 20,000 to go before the 31 December deadline for the €4,000/ha aid. Drought is part of it: with no rain from early July to early October, one Gironde grower told Vitisphere, the ground was too hard to dig.",
      cites: [6, 7],
    },
    {
      heading: "Brussels: wine in the market rules",
      text: "EU governments agreed their position on the reform of the common market organisation on 19 October, leaving its budget to the 2028–2034 negotiations. They want sector programmes to be mandatory for beekeeping and for fruit and vegetables, but for wine only in certain circumstances, with national exemptions. Talks with the European Parliament can now open, and agriculture ministers meet in Luxembourg on 26 and 27 October to seek a partial general approach on the rest of the farm reform. In the Parliament, the public health committee's review of the Beating Cancer Plan dropped language suggesting no level of drinking is safe and did not call for stronger health warnings, wine regions say; the plenary vote is provisionally set for 11 November.",
      cites: [8, 9, 10],
    },
    {
      heading: "Coming up",
      text: "MAPA's prices for the week to 18 October are due on 23 October. Agreste's next estimate of the French harvest follows on 6 November, the European Parliament's vote on the cancer plan report on 11 November, and Spain's September declarations and Eurostat's September trade figures in mid-November.",
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
        "Vinetur, ",
        { title: "Soft consumption pushes global bulk wine prices lower" },
        ", 16 October 2026",
      ],
      url: "https://www.vinetur.com/en/20261016109122/soft-consumption-pushes-global-bulk-wine-prices-lower.html",
      note: "Reports Ciatti Global Wine & Grape Brokers' October market report, published on 15 October.",
    },
    {
      citation: [
        "Eurostat, ",
        { title: "EU trade since 1988 by HS2-4-6 and CN8" },
        " (DS-045409), CN 2204 and 2204 29, January to August 2025 and 2026",
      ],
      url: "https://ec.europa.eu/eurostat/web/international-trade-in-goods/database",
      note: "Bulk export prices are WineTerm's calculation: the value of bulk wine exports divided by their volume.",
    },
    {
      citation: [
        "ICQRF, ",
        { title: "Cantina Italia" },
        ", report no. 9/2026, stocks at 30 September 2026",
      ],
      url: "https://www.masaf.gov.it/flex/cm/pages/ServeBLOB.php/L/IT/IDPagina/25277",
    },
    {
      citation: [
        "Vitisphere, ",
        { title: "Stabilité de la vendange mais pas des stocks de vins européens" },
        ", 14 October 2026",
      ],
      url: "https://www.vitisphere.com/actualite-107512-la-production-europeenne-se-maintient-a-139-millions-dhectolitres.html",
      note: "Reports the European Commission's production estimates updated on 12 October.",
    },
    {
      citation: [
        "Direction générale des douanes et droits indirects, ",
        { title: "Stocks de vins" },
        ", declarations at 31 July 2018 to 2026",
      ],
      url: "https://www.douane.gouv.fr/la-douane/opendata/categories/viticulture/stocks-de-vins",
      note: "Wine held by producers and by traders, wine of third-country origin included.",
    },
    {
      citation: [
        "Vitisphere, ",
        {
          title:
            "Retard à l'allumage de l'arrachage des vignes : « on n’a pas eu de pluie de juillet à octobre. On ne pouvait pas commencer à creuser. »",
        },
        ", 21 October 2026",
      ],
      url: "https://www.vitisphere.com/actualite-107564-retard-a-lallumage-de-larrachage-des-vignes-on-na-pas-eu-de-pluie-de-juillet-a-octobre-on-ne-pouvait-pas-commencer-a-creuser.html",
    },
    {
      citation: [
        "Vinetur, ",
        { title: "European Union governments approved a partial mandate for post-2027 farm market reform" },
        ", 21 October 2026",
      ],
      url: "https://www.vinetur.com/en/20261021109436/european-union-governments-approved-a-partial-mandate-for-post-2027-farm-market-reform.html",
    },
    {
      citation: [
        "Council of the European Union, ",
        { title: "Agriculture and Fisheries Council, 26–27 October 2026" },
      ],
      url: "https://www.consilium.europa.eu/en/meetings/agrifish/2026/10/26-27/",
    },
    {
      citation: [
        "Vinetur, ",
        { title: "European Parliament panel rejects tougher alcohol warnings for wine" },
        ", 15 October 2026",
      ],
      url: "https://www.vinetur.com/en/20261015109093/european-parliament-panel-rejects-tougher-alcohol-warnings-for-wine.html",
    },
  ],
};
