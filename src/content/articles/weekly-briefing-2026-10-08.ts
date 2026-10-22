import type { ArticleDetail } from "@/services/types";

const id = "weekly-briefing-2026-10-08";

export const weeklyBriefing20261008: ArticleDetail = {
  id,
  kind: "weekly-briefing",
  section: "Weekly Briefing",
  headline: "An early Spanish harvest fills cellars as white wine slips",
  standfirst:
    "Spain declared 10.6 Mhl of wine made in August, the most since 2018, its white wine without a GI trades 17% below last year, France races to finish its grubbing-up, and EU ministers near a deal on wine's place in the farm reform.",
  publishedAt: "2026-10-08",
  readingMinutes: 3,
  href: `/insights/weekly-briefing/${id}`,
  body: [
    {
      heading: "Spain: the harvest came early",
      text: "The Ministry of Agriculture published Spain's August declarations on 7 October. Producers and warehouse holders made 10.61 Mhl of wine in August, more than twice the 4.72 Mhl of August 2025 and the most in any August since the monthly declarations began in 2018. Stocks at 31 August reached 37.28 Mhl, 19.7% more than a year earlier, with bulk white up 41.5% to 14.46 Mhl. Exits abroad fell 16.4% on the year to 1.07 Mhl.",
      cites: [1],
    },
    {
      heading: "Prices",
      text: "The national average for white wine without PDO or PGI was €42.19/hl in the week to 27 September, 17.1% below the same week of 2025, after a brief rise to €44.12 the week before. Red held at €47.88/hl, 2.5% above a year earlier. With so much new wine already declared, buyers are under little pressure to pay up for white.",
      cites: [2],
    },
    {
      heading: "France: grubbing-up runs late",
      text: "Only 7,800 of the 28,000 hectares approved for subsidised grubbing-up, at €4,000 a hectare, had been pulled up by early October, with the deadline on 31 December. Growers who miss their commitments lose replanting and restructuring aid for six campaigns.",
      cites: [3],
    },
    {
      heading: "Brussels: wine in the farm reform",
      text: "Wine remains the most sensitive chapter of the EU's agricultural reform: member states still disagree on the sector interventions for wine and on funding programmes run through producer organisations. The Special Committee on Agriculture meets on 12 and 19 October, and ministers are due to settle a partial general approach, without the financial points, at the Council of 26 and 27 October in Luxembourg.",
      cites: [4],
    },
    {
      heading: "Coming up",
      text: "Eurostat's August trade figures are due in mid-October, and Spain's September declarations, with the second month of the harvest, in November. The September market report, with prices, stocks, trade and the harvest estimates in full, is on WineTerm now.",
    },
  ],
  sources: [
    {
      citation: [
        "Ministerio de Agricultura, Pesca y Alimentación, ",
        { title: "Informe INFOVI" },
        ", August 2025 and 2026",
      ],
      url: "https://www.mapa.gob.es/es/agricultura/temas/producciones-agricolas/vitivinicultura/datos_infovi_anteriores",
      note: "Producers of less than 1,000 hl a year do not declare monthly and are not included.",
    },
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
        "Vitisphere, ",
        { title: "« Le temps presse » : encore « 20 000 ha de vignes à arracher en 2 mois »" },
        ", 8 October 2026",
      ],
      url: "https://www.vitisphere.com/actualite-107483-le-temps-presse-encore-20-000-ha-de-vignes-a-arracher-en-2-mois.html",
    },
    {
      citation: [
        "Vinetur, ",
        { title: "La UE avanza en la reforma agraria con el vino como punto más sensible" },
        ", 7 October 2026",
      ],
      url: "https://www.vinetur.com/20261007108505/eu-governments-near-partial-farm-deal-with-wine-rules-still-unsettled.html",
    },
  ],
};
