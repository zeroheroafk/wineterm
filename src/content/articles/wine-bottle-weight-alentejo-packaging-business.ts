import type { ArticleDetail } from "@/services/types";

const id = "wine-bottle-weight-alentejo-packaging-business";

export const wineBottleWeightAlentejoPackagingBusiness: ArticleDetail = {
  id,
  kind: "analysis",
  section: "Packaging & Sustainability",
  headline: "Alentejo Bets on a 390-Gram Wine Bottle",
  standfirst:
    "The regional bottle is due in late 2027. A British retailer's figures show how lighter glass can cut packaging charges.",
  description:
    "Alentejo is testing a 390g regional wine bottle. The Wine Society estimates how lighter glass reduces a retailer's packaging charges.",
  publishedAt: "2026-11-10",
  readingMinutes: 3,
  href: `/insights/analysis/${id}`,
  hero: {
    src: `/images/insights/${id}.jpg`,
    width: 1800,
    height: 1200,
    alt: "Rows of wine bottles on a bottling line.",
    caption: "Wine bottles on a bottling line. Illustrative photograph.",
    author: "Lucian Pirvu",
    sourceUrl: "https://www.pexels.com/photo/wine-bottles-on-an-industrial-machinery-4176427/",
    licence: { name: "Pexels License", url: "https://www.pexels.com/license/" },
    changes: "cropped",
  },
  body: [
    {
      text: "Alentejo's regional wine commission, the CVRA, developed the 390-gram bottle with glassmaker Verallia. Wineries in the region can choose whether to use it. Harpers reported that bottling and stress tests will run through March 2027, with the production model to be confirmed afterwards and a launch planned for late that year.",
    },
    {
      text: "The bottle is part of the CVRA's voluntary sustainability programme for Alentejo growers and wineries. At the projected volume of 50 million bottles a year, the CVRA estimates that the new design would use 1,500 tonnes less glass than the same number of 420-gram bottles.",
    },
    {
      text: "The 420-gram reference is also the threshold in the Sustainable Wine Roundtable's still-wine accord. Signatories have committed to bringing their average bottle weight below it by the end of 2026. In October, the group said more than 20 companies were involved. Together they make and sell about three billion bottles, or 11% of global wine sales.",
    },
    {
      heading: "The Wine Society's packaging bill",
      text: "The Wine Society, a British retailer, brought the sales-weighted average for its still-wine bottles down from 468 to 439 grams between January 2024 and January 2025, a 29-gram cut close to the 30-gram difference in the CVRA's comparison. Across roughly 8.5 million bottles, the retailer estimated a saving of 246 tonnes of glass and around £83,000 in packaging charges, using May 2025 rates for Extended Producer Responsibility and Packaging Recovery Notes.",
    },
    {
      text: "A year later, the average had fallen just three more grams, to 436.",
    },
    {
      text: "The Society's 2025/26 report says the retailer has more say over the glass it uses for its own labels than for third-party brands. Older vintages can remain in heavier bottles while they sell through.",
    },
    {
      text: "The same report describes a trial with LGI Wines using Verallia's 300-gram Air 300G in commercial distribution. It covers Cantoiseau red and white, previously supplied in 370-gram bottles. The trial bottle weighs 90 grams less than the one Verallia developed for Alentejo.",
    },
  ],
  sources: [
    {
      citation: ["CVRA, project announcement (LinkedIn)"],
      url: "https://pt.linkedin.com/posts/vinhos-do-alentejo_vinhosdoalentejo-winesofalentejo-psva-activity-7519454105602392064-8J6c",
      note: "The 50 million bottles a year and 1,500 tonnes figures are a conditional scenario against 420-gram bottles, not a measured saving.",
    },
    {
      citation: ["CVRA, ", { title: "Programa de Sustentabilidade dos Vinhos do Alentejo" }],
      url: "https://sustentabilidade.vinhosdoalentejo.pt/pt/programa-de-sustentabilidade-dos-vinhos-do-alentejo",
    },
    {
      citation: ["Harpers, ", { title: "Alentejo announces region-wide lightweight wine bottle" }, ", 19 October 2026"],
      url: "https://harpers.co.uk/news/fullstory.php/aid/36535/Alentejo_announces_region-wide_lightweight_wine_bottle_.html",
      note: "Testing calendar through March 2027 and planned late-2027 launch.",
    },
    {
      citation: ["The Wine Society, ", { title: "Annual Sustainability Report 2024/25" }],
      url: "https://www.thewinesociety.com/globalassets/pdfs/sustainability/2025/annual-sustainability-report-2025.pdf",
      note: "468 to 439 grams, roughly 8.5 million bottles, and the 246-tonne and £83,000 estimates at May 2025 EPR and PRN rates.",
    },
    {
      citation: ["The Wine Society, ", { title: "Annual Sustainability Report 2025/26" }],
      url: "https://www.thewinesociety.com/globalassets/pdfs/sustainability/2026/the-wine-society-annual-sustainability-report-2026.pdf",
      note: "436-gram average, third-party brands and older vintages, and the Cantoiseau trial with LGI Wines. The 90-gram difference is 390 minus 300.",
    },
    {
      citation: ["Sustainable Wine Roundtable, ", { title: "Three years, three billion bottles: what's next for the bottle weight accord" }, ", October 2026"],
      url: "https://swroundtable.org/three-years-three-billion-bottles-whats-next-for-the-bottle-weight-accord/",
    },
  ],
};
