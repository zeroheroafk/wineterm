import type { ArticleDetail } from "@/services/types";

const id = "portugal-wine-harvest-rebound-sales-test-2026";

export const portugalWineHarvestReboundSalesTest2026: ArticleDetail = {
  id,
  kind: "analysis",
  section: "Markets",
  headline: "Portugal expects more wine. The sales test comes next",
  standfirst:
    "Portugal's harvest forecast points to more wine as export volumes contract. The Douro's production rules show why the commercial outcome will differ across the industry.",
  publishedAt: "2026-10-29",
  readingMinutes: 4,
  href: `/insights/analysis/${id}`,
  hero: {
    src: `/images/insights/${id}.jpg`,
    width: 1920,
    height: 1280,
    alt: "Terraced vineyards across hillsides in Portugal's Douro Valley beneath a cloudy sky.",
    caption: "Terraced vineyards in the Douro Valley in November 2024.",
    author: "Sergei Gussev",
    sourceUrl: "https://www.pexels.com/photo/scenic-vineyards-in-douro-valley-landscape-34832609/",
    licence: { name: "Pexels License", url: "https://www.pexels.com/license/" },
    changes: "cropped",
  },
  body: [
    {
      text: "Portugal is approaching the end of October with the prospect of a larger vintage and fewer litres sold abroad. The Instituto da Vinha e do Vinho's July forecast put 2026/27 production at about 6.7 million hectolitres, roughly 12% above the previous campaign and 4% below the five-campaign average. The harvest declarations will provide the next check on that estimate.",
      cites: [1],
    },
    {
      text: "For cellars short of wine after a small vintage, extra production can help supply existing customers and spread fixed costs over more litres. The benefit is harder to secure where stocks are already waiting for orders. Portugal's most recent export figures make that distinction more urgent.",
    },
    {
      heading: "Exports are losing volume",
      text: "206.1 million litres left Portugal in January–August 2026, down 9.1% from the same period of 2025. Export receipts fell 6.2% to €566.0 million, according to the IVV's August trade workbook, released on 20 October. Average export value rose 3.2% to €2.75 per litre.",
      cites: [2],
    },
    {
      text: "Portugal shipped about 20.7 million fewer litres in those eight months. A higher average value helped cushion the revenue loss but left a substantial volume shortfall to overcome. The question for the new vintage is how quickly exporters can rebuild the orders needed to absorb it.",
      cites: [2],
    },
    {
      text: "Shipments to EU destinations fell 15.5% by volume, compared with a 4.2% decline outside the EU. These are changes in Portuguese exports, rather than a measure of total consumption in those markets. They identify where Portuguese sellers have been losing volume without explaining, on their own, whether the cause was price, availability or a change in the wines customers bought.",
      cites: [2],
    },
    {
      text: "The average also needs to be read through the product mix. A larger share of higher-value wine can lift euros per litre while orders for other categories weaken. A cellar bringing additional bulk wine to market cannot assume it will receive the national average export value.",
    },
    {
      heading: "The older sales total needs a different reading",
      text: "The IVV's 726-million-litre figure for 2025 covers wine marketed by mainland operators for both internal consumption and export, excluding Port. It cannot be used as a domestic-sales total or added to exports to construct national demand. Its 3.1% decline also concealed different movements by origin: Portuguese wine rose 1.1%, while imported wine fell 18.4%. The decline in the aggregate therefore gives an incomplete account of the outlets available to Portuguese producers.",
      cites: [3],
    },
    {
      heading: "The Douro's larger crop faces a separate allocation",
      text: "The Douro is expected to lead the harvest recovery, with output forecast to rise 25%. The IVV also projects 15% increases in Alentejo, Península de Setúbal and Trás-os-Montes, and attributes roughly half a million hectolitres of additional production to those four regions together.",
      cites: [1],
    },
    {
      text: "In the Douro, the commercial value of extra grapes depends in part on their authorised use. The 2026 harvest regulation fixes the region's allocation of must for Port production at 76,000 pipes of 550 litres. The benefício system allocates that production authorisation across eligible vineyards. A rise in the forecast for total regional wine output does not automatically increase a grower's Port allocation.",
      cites: [4],
    },
    {
      text: "The extra crop therefore cannot all be valued as additional Port production. Wine sold through other permitted outlets needs its own buyers and will earn a different return. That is a more useful starting point for assessing the Douro's recovery than applying one average selling price to every additional litre.",
    },
    {
      text: "Alentejo and Península de Setúbal have different product portfolios, so the Douro allocation cannot be treated as a national constraint. Their forecast increases still need to be assessed against regional sales and the stock already in cellars. The national production total cannot show which businesses have room for more wine.",
    },
    {
      heading: "France's smaller harvest still contains growing categories",
      text: "Agreste's October estimate put French production at 34.9 million hectolitres, 2% below 2025, while revising September's forecast upwards after better-than-expected yields in Languedoc-Roussillon. French PGI wine output was forecast to rise 11%, illustrating why Portuguese sellers can face additional competition in some categories even when a neighbouring country's total harvest falls.",
      cites: [5],
    },
    {
      heading: "The next check comes after the declarations",
      text: "The immediate evidence to watch is whether Portuguese export volumes recover as the new vintage enters sales programmes. A further rise in average export value would help revenue, but cellars carrying more wine also need orders that absorb volume. A better harvest can improve production economics while leaving the cost of holding unsold stock unresolved.",
    },
    {
      text: "The next firm date is 31 October, the IVV deadline for the 2026/27 harvest and production declarations. Once processed, those returns will provide the basis for checking the forecast against reported production.",
      cites: [6],
    },
  ],
  sources: [
    {
      citation: [
        "Instituto da Vinha e do Vinho, ",
        { title: "Previsão de Colheita – Campanha 2026/2027" },
        ", forecast of July 2026, page updated 3 August 2026",
      ],
      url: "https://www.ivv.gov.pt/noticias/previsao-de-colheita-campanha-2026-2027/",
      note: "Harvest forecast, subject to the harvest declarations.",
    },
    {
      citation: [
        "Instituto da Vinha e do Vinho, ",
        { title: "Exportação / Expedição de Vinhos – Agosto 2026" },
        ", January to August 2025 and 2026, released 20 October 2026",
      ],
      url: "https://www.ivv.gov.pt/wp-content/uploads/2026/10/Sintese-Estatistica_AGO-_2026.xlsx",
      note: "Figures from Statistics Portugal (INE). Average export value is the value of exports divided by their volume, across every category of wine.",
    },
    {
      citation: [
        "Instituto da Vinha e do Vinho, ",
        { title: "Informação de Mercado n.º 2/2026: Quantidade de vinho colocado no mercado em 2025" },
        ", 10 February 2026",
      ],
      url: "https://www.ivv.gov.pt/wp-content/uploads/2026/03/Informacao_Mercado_2_2026_Vinho_colocado.pdf",
      note: "Wine placed on the market by operators in mainland Portugal, for internal consumption and export, excluding Port.",
    },
    {
      citation: [
        "Instituto dos Vinhos do Douro e do Porto, ",
        { title: "Regulamento n.º 1018/2026" },
        ", the Douro's harvest communiqué for 2026, Diário da República, 30 July 2026",
      ],
      url: "https://diariodarepublica.pt/dr/detalhe/regulamento/1018-2026-1153268687",
    },
    {
      citation: [
        "Agreste, ",
        { title: "Une production viticole 2026 estimée à près de 35 millions d'hectolitres" },
        ", estimates at 1 October 2026",
      ],
      url: "https://agreste.agriculture.gouv.fr/agreste-web/download/publication/publie/IraVit26127/2026_127inforapviticulture.v2.pdf",
      note: "Harvest forecast, subject to revision.",
    },
    {
      citation: [
        "Instituto da Vinha e do Vinho, ",
        {
          title:
            "Nota Informativa n.º 07/2026 – Entrega da Declaração de Colheita e Produção – Campanha 2026/2027",
        },
        ", 7 September 2026",
      ],
      url: "https://www.ivv.gov.pt/documentos/entrega-da-declaracao-de-colheita-e-producao-campanha-2026-2027/",
    },
  ],
};
