import type { ArticleDetail } from "@/services/types";

const id = "november-2026-wine-market-outlook-harvest-stocks-demand";

export const november2026WineMarketOutlook: ArticleDetail = {
  id,
  kind: "monthly-report",
  section: "Wine Market Outlook",
  headline: "November Wine Market Outlook: Stocks, Sales and the Price of the New Crop",
  standfirst:
    "Spain ended the campaign with 33.4 million hectolitres of wine and must in stock. Dated Italian quotations show the different prices buyers face as Europe's new vintage reaches the market.",
  description:
    "WineTerm's November 2026 outlook on Europe's wine harvest, Spain's stocks, demand, exports and the factors likely to shape prices.",
  publishedAt: "2026-11-04",
  readingMinutes: 5,
  href: `/insights/monthly-reports/${id}`,
  hero: {
    src: `/images/insights/${id}.jpg`,
    width: 1800,
    height: 1125,
    alt: "Rows of wooden wine barrels in a dimly lit wine cellar in Porto, Portugal.",
    caption:
      "Wine barrels stored in a cellar in Porto, Portugal. Illustrative image; not a photograph of the 2026 harvest.",
    author: "Joshua Kettle",
    sourceUrl:
      "https://unsplash.com/photos/rows-of-old-wine-barrels-in-a-dimly-lit-cellar-YHExHf6Axf0",
    licence: {
      name: "Unsplash License",
      url: "https://unsplash.com/license",
    },
  },
  body: [
    {
      text: "Spanish cellars entered the new campaign with 33.4 million hectolitres of wine and must, while apparent consumption and export movements were falling. The November harvest numbers arrive against that existing stock position. In Italy, local quotations already provide a more concrete measure of buying conditions than national crop forecasts alone.",
    },
    {
      text: "At Pescara on 26 October, ISMEA quoted common white wine at €5.50 per hectograde for the row with an average strength of 10.5 degrees. Its common red and rosé row averaging 12 degrees stood at €4.75 per hectograde. Both were ex-cellar and unchanged from the previous week.",
      cites: [1],
    },
    {
      text: "A hectograde is one degree of alcohol in one hectolitre. At the listed strengths, those quotations imply €57.75/hl for the white and €57/hl for the red and rosé, before transport. The near-equal cost per hectolitre disappears if the two original unit prices are read as ordinary euro-per-hectolitre quotations. These are local product references, with their stated alcohol strengths, rather than a European price index.",
    },
    {
      heading: "Spain's stocks and the pace of sales",
      text: "OIVE's campaign-closing report, published on 14 September, puts end-July wine and must stocks 0.8% above the preceding campaign close. Wine alone fell 0.8% to 30.1 million hectolitres; must accounts for the increase in the combined total. The industry still had a substantial volume available before the new vintage began entering tanks.",
      cites: [2],
    },
    {
      text: "OIVE's 19 October analysis estimated apparent Spanish wine consumption at 8.96 million hectolitres in the twelve months to July, down 8.1%. The closing report recorded a 9.4% decline in INFOVI wine export movements to 16.73 million hectolitres. These indicators have different statistical scopes, but both record weaker outflows.",
      cites: [3, 2],
    },
    {
      text: "For cellars selling bulk wine to finance the next campaign, slower turnover extends the time between paying for the crop and collecting sales revenue. Lower quotations may attract orders, but also reduce the return on the wine sold. The balance between those two effects will shape the pressure to release stocks during November.",
    },
    {
      heading: "A recovery in Portugal, a smaller French crop",
      text: "France's corrected 8 October Agreste estimate put the harvest at 34.9 million hectolitres, down 2% on 2025 and 14% below the five-year average. Better yields in Languedoc-Roussillon lifted the estimate from September's level.",
      cites: [4],
    },
    {
      text: "Portugal's IVV forecast points to 6.7 million hectolitres for 2026/27, up 12% but 4% below its five-campaign average. Douro's expected increase is 25%; Alentejo, Península de Setúbal and Trás-os-Montes each show 15%. Those four regions account for roughly half a million hectolitres of the expected national gain.",
      cites: [5],
    },
    {
      text: "An 8 October report citing European Commission estimates puts Italy at about 41.1 million hectolitres of wine and must. That remains a preliminary, secondary-source estimate with broader product coverage than France's wine total.",
      cites: [6],
    },
    {
      heading: "The demand carried into November",
      text: "The OIV's May report on 2025 estimated world wine consumption at 208 million hectolitres, down 2.7%. International export volume fell 4.7% to 94.8 million hectolitres and value fell 6.7% to €33.8 billion. That is the prior-year backdrop to the new vintage, not a reading of October orders.",
      cites: [7],
    },
    {
      text: "Portugal's 2025 exports also show the cost of selling more volume at a lower average value: the IVV reported 341 million litres, up 1.1%, and €954 million in receipts, down 1.1%. The resulting €2.80/litre average reflects the mix of destinations and products as well as prices.",
      cites: [8],
    },
    {
      text: "November's subsequent INFOVI reports will show more of the new Spanish vintage in storage. Updated Agreste estimates and Portuguese harvest declarations will firm up production volumes. France's growers face a 10 December harvest-declaration deadline; that is a filing deadline, not a date for the release of final results. Alongside those releases, comparable local quotations such as ISMEA's will show what sellers are asking for the wine buyers can actually purchase.",
      cites: [9],
    },
  ],
  sources: [
    {
      citation: ["ISMEA Mercati, ", { title: "Pescara bulk wine quotations" }, ", 26 October 2026"],
      url: "https://www.ismeamercati.it/flex/cm/pages/ServeBLOB.php/L/IT/IDPagina/956",
      note: "Local quotations per hectograde, ex-cellar; not a European price index.",
    },
    {
      citation: [
        "OIVE, ",
        { title: "Informe mensual vitivinícola, julio 2026" },
        ", 14 September 2026",
      ],
      url: "https://estadisticas.interprofesionaldelvino.es/informe/informe-mensual-vitivinicola-julio-2026/",
      note: "Campaign-closing stocks and INFOVI export movements.",
    },
    {
      citation: [
        "OIVE, ",
        { title: "Análisis del consumo de vino en España a julio 2026" },
        ", 19 October 2026",
      ],
      url: "https://estadisticas.interprofesionaldelvino.es/informe/analisis-del-consumo-de-vino-en-espana-a-julio-2026/",
      note: "Apparent consumption, not household consumption data.",
    },
    {
      citation: [
        "Agreste, ",
        { title: "French harvest estimate" },
        ", corrected 8 October 2026",
      ],
      url: "https://agreste.agriculture.gouv.fr/agreste-web/disaron/IraVit26127/detail/",
      note: "Provisional estimate, subject to revision.",
    },
    {
      citation: [
        "IVV, ",
        { title: "Previsão de colheita, campanha 2026/2027" },
      ],
      url: "https://www.ivv.gov.pt/noticias/previsao-de-colheita-campanha-2026-2027/",
      note: "Provisional forecast.",
    },
    {
      citation: [
        "Vinetur, ",
        { title: "Italy's 2026 wine production is projected to fall 7.2% to 41.1 million hectoliters" },
        ", 8 October 2026, citing European Commission estimates",
      ],
      url: "https://www.vinetur.com/en/amp/20261008108623/italys-2026-wine-production-is-projected-to-fall-722-to-411-million-hectoliters.html",
      note: "Preliminary secondary-source estimate of wine and must; not directly comparable with wine-only figures.",
    },
    {
      citation: [
        "OIV, ",
        { title: "State of the World Wine Sector in 2025" },
        ", May 2026",
      ],
      url: "https://www.oiv.int/sites/default/files/documents/OIV-State_of_the_World_Wine_Sector_in_2025.pdf",
      note: "2025 data, not a 2026 forecast.",
    },
    {
      citation: ["IVV, ", { title: "Informação de mercado 03/2026" }, ", 11 March 2026"],
      url: "https://www.ivv.gov.pt/tipologia_documentos/informacao-de-mercado/",
    },
    {
      citation: ["Douane, ", { title: "Déclarer sa récolte et sa production" }],
      url: "https://www.douane.gouv.fr/demarche/declarer-sa-recolte-et-production",
      note: "The 10 December date is the harvest-declaration deadline for growers.",
    },
  ],
};
