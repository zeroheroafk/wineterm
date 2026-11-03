import type { ArticleDetail } from "@/services/types";

const id = "france-vineyard-removal-languedoc-harvest-2026";

export const franceVineyardRemovalLanguedocHarvest2026: ArticleDetail = {
  id,
  kind: "analysis",
  section: "Crop & Supply",
  headline: "France Is Paying to Remove Vines as Languedoc Expects a Larger Harvest",
  standfirst:
    "Languedoc-Roussillon expects 19.6% more wine in 2026, while France's removal programme has received expressions of interest covering 27,926 hectares.",
  description:
    "Languedoc-Roussillon expects 19.6% more wine in 2026. France's vineyard-removal scheme faces a yield recovery and weaker global consumption.",
  publishedAt: "2026-11-03",
  readingMinutes: 3,
  href: `/insights/analysis/${id}`,
  hero: {
    src: `/images/insights/${id}.jpg`,
    width: 1280,
    height: 854,
    alt: "Autumn-coloured vineyard rows beneath wooded hills near Pic de Vissou in the Languedoc region of southern France.",
    caption:
      "Autumn vineyards near Pic de Vissou in Languedoc, photographed in October 2020. Illustrative image, not the 2026 harvest.",
    author: "Christian Ferrer",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Vignes_pr%C3%A8s_du_Pic_de_Vissou_-_October_2020_-_A01.jpg",
    licence: {
      name: "CC BY 4.0",
      url: "https://creativecommons.org/licenses/by/4.0/",
    },
    changes: "reduced in size",
  },
  body: [
    {
      text: "Languedoc-Roussillon is forecast to produce 10.59 million hectolitres of wine in 2026, up 19.6% on last year, according to the regional agriculture administration's 7 October estimate. France has meanwhile offered growers support to remove vines permanently.",
      cites: [1],
    },
    {
      text: "Across the wider Occitanie region, the productive vineyard has shrunk by more than 6,000 hectares, or 2.8%, yet the harvest is forecast to rise by 18% from the exceptionally weak 2025 campaign. Higher yields on the remaining vines have more than offset the loss of land, bringing expected output slightly above the five-year average.",
      cites: [1],
    },
    {
      heading: "Rain helped the remaining vines recover",
      text: "The administration recorded repeated heatwaves and worsening drought during the summer. Rainfall in the second half of August then improved yields enough for the October forecast to be revised upwards. Better water reserves earlier in the year and the absence of significant spring frost also helped, although results varied sharply between vineyards.",
      cites: [1],
    },
    {
      text: "For a cooperative winery, a larger intake can spread processing costs over more wine. When orders are slow, however, the additional volume also ties up working capital and storage.",
    },
    {
      heading: "Funding a permanent reduction",
      text: "A 16 June update from FranceAgriMer records 5,823 expressions of interest covering 27,926 hectares. These were intentions declared during the February call, not verified completed removals or final payment claims. The national programme offers €4,000 for each eligible hectare permanently removed. The government set aside €130 million for the scheme, following European Commission approval on 1 June.",
      cites: [2, 3],
    },
    {
      text: "France's total vineyard area had already fallen by around 34,000 hectares in 2025, to 740,000 hectares, according to the OIV, whose broader series includes vines grown for uses other than wine.",
      cites: [4],
    },
    {
      text: "Removing a low-yielding hectare takes less wine out of future harvests than removing a high-yielding one. If growers use the payment to leave cultivation or give up their least productive land, the reduction in output will be smaller than the reduction in area. The commercial adjustment also has to absorb wine produced before those vines were removed.",
    },
    {
      heading: "Consumption and the wines left to sell",
      text: "The OIV estimated world wine consumption at 208 million hectolitres in 2025, down 2.7%, while global vineyard area contracted for a sixth consecutive year. It also described the overall wine balance as broadly contained after several small harvests.",
      cites: [4],
    },
    {
      text: "The EU measures adopted in February 2026 allow member states to support permanent vineyard removal. In France, reducing the supply of wines that are struggling to sell would address the imbalance more directly. A buyer seeking white wine with a specified appellation still needs that wine when inexpensive red is plentiful; additional red supply does little to fill the order.",
      cites: [5],
    },
    {
      text: "France's growers have until 10 December to submit their harvest declarations. That filing deadline is the next fixed checkpoint for the crop, rather than a promised publication date for final figures. Completed-removal data will then be needed to establish how much of the 27,926 hectares has actually left production.",
      cites: [6],
    },
  ],
  sources: [
    {
      citation: [
        "DRAAF Occitanie, ",
        { title: "Prévisions de récolte viticole au 1er octobre 2026" },
        ", 7 October 2026",
      ],
      url: "https://draaf.occitanie.agriculture.gouv.fr/previsions-de-recolte-viticole-au-1er-octobre-2026-a10136.html",
      note: "Harvest forecast, subject to revision.",
    },
    {
      citation: [
        "FranceAgriMer, ",
        { title: "Le dispositif d'arrachage définitif de vignes est lancé" },
        ", update of 16 June 2026",
      ],
      url: "https://www.franceagrimer.fr/index.php/actualites/le-dispositif-darrachage-definitif-de-vignes-est-lance",
      note: "Expressions of interest, not completed removals.",
    },
    {
      citation: [
        "Ministère de l'Agriculture, ",
        { title: "La Commission européenne donne son feu vert à la France pour la mise en place de l'arrachage" },
        ", 1 June 2026",
      ],
      url: "https://agriculture.gouv.fr/la-commission-europeenne-donne-son-feu-vert-a-la-france-pour-la-mise-en-place-de-larrachage",
    },
    {
      citation: [
        "OIV, ",
        { title: "State of the World Wine Sector in 2025" },
        ", May 2026",
      ],
      url: "https://www.oiv.int/sites/default/files/documents/OIV-State_of_the_World_Wine_Sector_in_2025.pdf",
    },
    {
      citation: [
        "Council of the European Union, ",
        { title: "Council approves set of measures to support the EU wine sector" },
        ", 23 February 2026",
      ],
      url: "https://www.consilium.europa.eu/en/press/press-releases/2026/02/23/council-approves-set-of-measures-to-support-the-eu-wine-sector/",
    },
    {
      citation: [
        "Douane, ",
        { title: "Déclarer sa récolte et sa production" },
      ],
      url: "https://www.douane.gouv.fr/demarche/declarer-sa-recolte-et-production",
      note: "The 10 December date is the harvest-declaration deadline for growers.",
    },
  ],
};
