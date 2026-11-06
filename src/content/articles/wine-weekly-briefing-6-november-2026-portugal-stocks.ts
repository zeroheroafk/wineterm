import type { ArticleDetail } from "@/services/types";

const id = "wine-weekly-briefing-6-november-2026-portugal-stocks";

export const weeklyBriefing20261106: ArticleDetail = {
  id,
  kind: "weekly-briefing",
  section: "Weekly Briefing",
  headline:
    "WineTerm Weekly Briefing — 6 November 2026: Portugal's July Stocks and Partial Dealcoholisation",
  standfirst:
    "Portugal's pre-harvest inventory declined 5%, while uncertified whites increased. IVV guidance specifies where PDO and PGI wines may undergo partial dealcoholisation.",
  description:
    "WineTerm's Portugal briefing covers July wine stocks, uncertified whites and IVV's territorial rules for partially dealcoholised PDO and PGI wines.",
  publishedAt: "2026-11-06",
  readingMinutes: 3,
  href: `/insights/weekly-briefing/${id}`,
  hero: {
    src: `/images/insights/${id}.jpg`,
    width: 1800,
    height: 1013,
    alt: "Terraced vineyards overlooking the Douro River in Portugal.",
    caption:
      "Terraced vineyards in the Douro Valley. Archive photograph, October 2010.",
    author: "Rosino",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Terraced_vineyards_in_the_douro_valley.jpg",
    licence: {
      name: "CC BY-SA 2.0",
      url: "https://creativecommons.org/licenses/by-sa/2.0/",
    },
    changes: "resized",
  },
  body: [
    {
      text: "Portugal held 11.55 million hectolitres of wine and must on 31 July 2026, before the new harvest, the Instituto da Vinha e do Vinho (IVV) reported on 2 November. Stocks fell 5%, matching the previous year's decline.",
    },
    {
      text: "Those lower pre-harvest stocks preceded a harvest that the IVV's August forecast put 12% above the previous campaign. The July inventory measures what was carried into that harvest; it does not yet show how much of the new wine cellars have sold. WineTerm examined that distinction in Portugal Wine Harvest Rebound: The Sales Test.",
    },
    {
      text: "Wine and must with a protected designation of origin (PDO, or DOP in Portugal) or protected geographical indication (PGI, or IGP) fell 7% to 9.53 million hectolitres, including products still eligible for certification. Uncertified stocks rose 6% to 1.93 million hectolitres, with uncertified whites up 15%. A further 94,000 hectolitres were classified by vintage or grape variety in the IVV report.",
    },
    {
      text: "Across all categories, red wine and must totalled 7.83 million hectolitres, down 8%. Whites increased 2% to 3.03 million hectolitres; rosé fell 4%.",
    },
    {
      heading: "Where the stocks are held",
      text: "Twenty of the 3,398 operators had more than 100,000 hectolitres each, together accounting for 43% of the inventory. At the other end, four in five operators, each with no more than 1,000 hectolitres, shared 4% of stocks.",
    },
    {
      text: "Douro and Port held 4.28 million hectolitres of PDO/PGI wine and must, equivalent to 37% of Portugal's total inventory. Port accounted for 62% of the regional stocks, with its inventory down 6%; Douro's fell 8%. Alentejo's PDO/PGI inventory fell 10% to 1.42 million hectolitres, while Lisboa's fell 5% to 1.09 million.",
    },
    {
      text: "Stocks of EU-origin wine and must, including EU blends, rose 36% to about 515,000 hectolitres. The IVV attributes the accumulation chiefly to 270,000 fewer hectolitres released onto the Portuguese market, a fall of 17%. That outweighed a 145,000-hectolitre decline in imports, down 7.5%.",
    },
    {
      heading: "Where PDO and PGI wines can be partially dealcoholised",
      text: "The IVV's Information Note No. 8/2026, dated 29 October, treats partial dealcoholisation as a production step for PDO and PGI wines. The operation must take place inside the demarcated geographical area, except under the territorial derogations in Article 5 of Delegated Regulation (EU) 2019/33: the immediate vicinity, or the same or a neighbouring administrative unit, where the product specification permits them. The interpretation also applies to PDO and PGI sparkling and semi-sparkling wines.",
    },
    {
      text: "The product specification therefore determines whether a plant outside the region is an option.",
    },
  ],
  sources: [
    {
      citation: [
        "IVV, ",
        { title: "Informação de Mercado n.º 4/2026" },
        ", 2 November 2026",
      ],
      url: "https://www.ivv.gov.pt/wp-content/uploads/2026/11/Informacao-de-Mercado-n.o4_2026.pdf",
    },
    {
      citation: [
        "IVV, ",
        { title: "Nota Informativa 8/2026" },
        ", 29 October 2026",
      ],
      url: "https://www.ivv.gov.pt/wp-content/uploads/2026/10/NOTA-INFORMATIVA_8_2026_desalcoolizados_conceito-producao-IG.pdf",
    },
    {
      citation: [
        "IVV, ",
        { title: "Previsão de colheita, campanha 2026/2027" },
      ],
      url: "https://www.ivv.gov.pt/noticias/previsao-de-colheita-campanha-2026-2027/",
    },
  ],
};
