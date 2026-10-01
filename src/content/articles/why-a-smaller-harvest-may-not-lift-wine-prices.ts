import type { ArticleDetail } from "@/services/types";

const id = "why-a-smaller-harvest-may-not-lift-wine-prices";

export const whyASmallerHarvestMayNotLiftWinePrices: ArticleDetail = {
  id,
  kind: "analysis",
  section: "Crop & Supply",
  headline: "Why a smaller harvest may not lift wine prices",
  standfirst:
    "Lower production can help reduce accumulated stocks. For wineries facing slower sales, a recovery in prices depends on how soon buyers need fresh supplies.",
  publishedAt: "2026-10-01",
  readingMinutes: 4,
  href: `/insights/analysis/${id}`,
  body: [
    {
      text: "In France, another small harvest will not necessarily give growers the price recovery they need. Agreste's estimate at 1 September put 2026 wine production at close to 34 million hectolitres, 6% below the previous year. A reduction of that kind can ease pressure on the market, but it leaves the wine from earlier vintages in place. The new crop will arrive alongside stocks that producers, merchants and bottlers are still trying to sell, making the pace of those sales as important as the size of the harvest.",
      cites: [1],
    },
    {
      text: "Recent global figures show why lower output has brought limited relief. The International Organisation of Vine and Wine described 2025 as the third consecutive year of low production, while estimating that world consumption fell a further 2.7% to 208 million hectolitres. Its assessment was that below-average production would help stocks decline gradually, rather than create widespread shortages. Even after several difficult vintages, the industry was adjusting to a market buying less wine.",
      cites: [2],
    },
    {
      text: "France has already experienced the effect on prices. In an assessment published on 29 April 2026, Agreste reported that limited production had coincided with weaker exports and continuing erosion in producer prices for appellation wines. Demand in several major importing markets had weakened, while trade barriers and currency movements added to exporters' difficulties. Some categories performed better than others, but the broader message was clear: producing less had not been enough to strengthen producers' negotiating position across the market.",
      cites: [3],
    },
    {
      text: "The wine carried over from previous years helps explain that outcome. Italy's official cellar register recorded approximately 42.5 million hectolitres of wine held in reporting facilities at the end of July 2026, 6.9% more than a year earlier. Stocks had fallen during July, yet they remained above the comparable point in 2025. The figure concerns wine held in Italy, with must reported separately. It shows why a seasonal decline in cellars does not, on its own, establish that supply is becoming scarce.",
      cites: [4],
    },
    {
      text: "A national stock total needs interpretation, however. It cannot reveal how much wine is freely available to a particular buyer, how much is already committed, or how closely the available stocks match current orders. Wine being matured for a future release serves a different purpose from a tank whose owner needs an immediate sale. What matters commercially is how quickly saleable stocks can be absorbed. If orders slow sufficiently, a cellar can hold fewer litres than before and still have more wine than it needs for the months ahead.",
    },
    {
      text: "The differences between wines also limit what a national harvest figure can tell us. A shortage in one region or category may coexist with an excess elsewhere. France's €40 million crisis-distillation programme for 2026 illustrates how specific the problem can be: it targeted eligible red and rosé wines, with the resulting alcohol destined for industrial or energy uses. FranceAgriMer linked the measure to elevated stocks and deteriorating market conditions in those categories. The programme addressed wine already struggling to find a market; a smaller harvest in another segment would offer it little direct help.",
      cites: [5],
    },
    {
      text: "For a merchant or bottler, purchasing decisions depend on the orders that must be supplied. News of a smaller crop may encourage earlier buying where the required wine is becoming difficult to find. A business with ample inventory and slow sales has more reason to wait, even if national production is falling. Buying additional wine would commit cash to stock whose sale is uncertain. In those circumstances, the first effect of a weaker harvest may be to reduce the number of offers available to the buyer, with little immediate change in the price it is prepared to pay.",
    },
    {
      text: "Growers can face a particularly uncomfortable adjustment. Much of the work and expense of a vineyard comes before the final crop is known. A poor yield leaves fewer grapes over which to spread those costs, while equipment and other commitments still have to be paid for. A winery processing a smaller volume faces a similar problem with its facilities. Even if selling prices improve, the increase may be insufficient to compensate for the lost output. A harvest that helps reduce the industry's accumulated stocks can therefore make an individual producer's finances worse.",
    },
    {
      text: "Prices also move differently along the supply chain. A winery might need to pay more for scarce grapes from a particular source while struggling to raise the selling price of its finished wine. A bottler may have secured supplies under an earlier contract, delaying the effect of a tighter market on its costs. Retail prices introduce further influences, including packaging, distribution and promotional decisions. A headline about lower production consequently offers little basis for assuming that grapes, bulk wine and bottles on a supermarket shelf will all become more expensive together.",
    },
    {
      text: "There are circumstances in which a smaller harvest can produce a strong price response. Where demand remains firm, available stocks are limited and buyers have few acceptable alternatives, the loss of new supply can force competition for the remaining wine. Prices may rise before a physical shortage develops if customers begin securing their needs earlier. The relevant evidence would be stronger orders and tighter availability for the wines concerned. A low national production estimate is useful context, but it cannot establish those conditions for every region or producer.",
    },
    {
      text: "For the 2026 harvest, the distinction will become clearer as the new wine enters commercial channels. Repeat orders, the speed at which existing stocks leave cellars and buyers' willingness to commit to future deliveries will provide a better guide to a recovery than the crop estimate alone. Producers may first see easier stock clearance or less pressure to discount, with firmer prices following later if demand supports them. Until buyers need to replenish their supplies, a smaller harvest can leave growers with fewer litres to sell and no compensating improvement in what they earn from each one.",
    },
  ],
  sources: [
    {
      citation: [
        "Agreste, ",
        { title: "Une production viticole 2026 estimée à 34 millions d'hectolitres" },
        ", estimates at 1 September 2026",
      ],
      url: "https://agreste.agriculture.gouv.fr/agreste-web/download/publication/publie/IraVit26107/2026_107inforapviticulture.pdf",
      note: "Harvest forecast, subject to revision.",
    },
    {
      citation: [
        "OIV, ",
        { title: "State of the World Wine Sector in 2025" },
        ", May 2026",
      ],
      url: "https://www.oiv.int/sites/default/files/2026-05/OIV-State_of_the_World_Wine_Sector_in_2025.pdf",
      note: "Production and consumption estimates may be revised.",
    },
    {
      citation: [
        "Agreste, ",
        { title: "En début de campagne 2025-2026, malgré une production limitée, la contraction des exportations pèse sur les prix des vins et spiritueux" },
        ", 29 April 2026",
      ],
      url: "https://agreste.agriculture.gouv.fr/agreste-web/disaron/SynVit26448/detail/",
    },
    {
      citation: [
        "MASAF / ICQRF, ",
        { title: "Cantina Italia" },
        ", report 8/2026, stocks at 31 July 2026",
      ],
      url: "https://www.masaf.gov.it/flex/cm/pages/ServeAttachment.php/L/IT/D/1%252Fa%252F5%252FD.dfcfdbf1e1cc74a71573/P/BLOB%3AID%3D25030/E/pdf?mode=download",
      note: "The 42.5 million hectolitre figure is rounded from the detailed tables' total of 42,520,772 hectolitres of wine; the report's introductory text rounds differently.",
    },
    {
      citation: ["FranceAgriMer, crisis-distillation programme for 2026"],
      url: "https://www.franceagrimer.fr/aides/aide-la-distillation-de-crise-2026",
    },
  ],
};
