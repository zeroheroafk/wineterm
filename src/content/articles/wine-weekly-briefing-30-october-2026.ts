import type { ArticleDetail } from "@/services/types";

const id = "wine-weekly-briefing-30-october-2026";

export const weeklyBriefing20261030: ArticleDetail = {
  id,
  kind: "weekly-briefing",
  section: "Weekly Briefing",
  headline: "WineTerm Weekly Briefing — 30 October 2026",
  standfirst:
    "Portugal eases access to vineyard aid advances. Trade figures from Spain, Madeira and Veneto show weaker sales in several markets.",
  description:
    "WineTerm's 30 October briefing: Portugal's vineyard aid changes, weaker Spanish wine exports, Madeira sales and Veneto's export slowdown.",
  publishedAt: "2026-10-30",
  readingMinutes: 2,
  href: `/insights/weekly-briefing/${id}`,
  hero: {
    src: `/images/insights/${id}.jpg`,
    width: 1124,
    height: 750,
    alt: "Rows of wooden wine barrels between large green storage tanks in a winery cellar.",
    caption:
      "Winery storage tanks and barrels. Illustrative photograph; not a depiction of a specific 2026 harvest.",
    author: "ArtHouse Studio",
    sourceUrl: "https://www.pexels.com/photo/barrels-at-a-winery-4639044/",
    licence: { name: "Pexels License", url: "https://www.pexels.com/license/" },
  },
  body: [
    {
      heading: "Portugal brings vineyard aid forward",
      text: "A regulation published on 26 October removes the requirement to start an approved vineyard investment before requesting an advance. Growers can seek 80% of the approved aid, rather than 80% of the total investment cost, while providing the required guarantee to IFAP.",
      cites: [1],
    },
    {
      text: "The exceptional 2026/27 programme covers damage from weather events between 28 January and 15 February 2026. Its advance-request deadline is 28 February 2027. The investment and final payment request must be completed by 30 June 2027; the approved-project and guarantee requirements continue to apply.",
      cites: [1],
    },
    {
      heading: "Spain's August exports fall",
      text: "Spain exported 115.7 million litres of wine in August, down 13.7% from August 2025, while receipts declined 8.2% to €175.8 million. OIVE published the figures on 21 October. Revenue fell less sharply than volume, raising the average value of the mix shipped.",
      cites: [2],
    },
    {
      heading: "Madeira's European sales weaken",
      text: "Madeira wine's first sales reached 1.83 million litres and approximately €13.7 million in January–September, down 14.9% and 5.3% respectively. DREM's 23 October release, using IVBAM data, shows a 29.2% fall in volume sold to EU destinations and a 23.7% fall in receipts. France, its largest EU destination, bought 37.6% fewer litres. In Portugal, volume increased 7.9% and revenue 14.2%.",
      cites: [3],
    },
    {
      text: "Sales to the United States rose 8.0% by volume and 22.4% by value.",
      cites: [3],
    },
    {
      heading: "Veneto's export receipts fall faster than Italy's",
      text: "Veneto's wine exports generated €1.32 billion in the first half of 2026, down 8.4% year on year, compared with a 6.2% national decline. The Veneto Agricoltura analysis reported by ANSA on 22 October puts the region's share of Italian wine export value at 36.3%.",
      cites: [4],
    },
    {
      heading: "Two Portuguese deadlines",
      text: "The exceptional VITIS application window closes at 17:00 on Friday, 30 October. The separate 2026/27 harvest and production declaration is due by 31 October.",
      cites: [5, 6],
    },
    {
      text: "Related WineTerm analysis: Portugal Expects More Wine. The Sales Test Comes Next.",
    },
  ],
  sources: [
    {
      citation: [
        "Diário da República, ",
        { title: "Portaria 468/2026/1" },
        ", 26 October 2026",
      ],
      url: "https://diariodarepublica.pt/dr/detalhe/portaria/468-2026-1185031834",
    },
    {
      citation: [
        "OIVE, ",
        { title: "Exportaciones españolas de vino, agosto 2026" },
        ", 21 October 2026",
      ],
      url: "https://estadisticas.interprofesionaldelvino.es/informe/exportaciones-espanolas-de-vino-agosto-2026/",
    },
    {
      citation: [
        "DREM, ",
        {
          title:
            "Nos primeiros nove meses de 2026 o valor da comercialização de vinho da Madeira baixou 5,3% em valor e 14,9% em quantidade em termos homólogos",
        },
        ", 23 October 2026, using IVBAM data",
      ],
      url: "https://estatistica.madeira.gov.pt/download-now/economica/turismo-pt/turismo-noticias-pt/132-noticias/comercializacao-de-produtos-tradicionais-da-madeira-noticias/6044-23-10-2026-nos-primeiros-nove-meses-de-2026-o-valor-da-comercializacao-de-vinho-da-madeira-baixou-5-3-em-valor-e-14-9-em-quantidade-em-termos-homologos.html",
    },
    {
      citation: [
        "ANSA, ",
        { title: "L'export del vino veneto rallenta ma rimane un pilastro delle vendite nazionali" },
        ", 22 October 2026, reporting Veneto Agricoltura",
      ],
      url: "https://www.ansa.it/sito/notizie/economia/2026/10/22/lexport-del-vino-veneto-rallenta-ma-rimane-un-pilastro-delle-vendite-nazionali_0bfc9168-0ccb-43f8-aa83-89fae425045d.html",
    },
    {
      citation: [
        "IVV, ",
        { title: "VITIS campanha 2026/2027 Continente: prorrogação de prazo" },
        ", 19 October 2026",
      ],
      url: "https://www.ivv.gov.pt/2026/10/19/vitis-campanha-2026-2027-continente-prorrogacao-de-prazo/",
    },
    {
      citation: [
        "IVV, ",
        { title: "Entrega da declaração de colheita e produção, campanha 2026/2027" },
      ],
      url: "https://www.ivv.gov.pt/documentos/entrega-da-declaracao-de-colheita-e-producao-campanha-2026-2027/",
    },
  ],
};
