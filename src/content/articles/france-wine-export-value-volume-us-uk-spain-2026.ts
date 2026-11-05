import type { ArticleDetail } from "@/services/types";

const id = "france-wine-export-value-volume-us-uk-spain-2026";

export const franceWineExportValueVolumeUsUkSpain2026: ArticleDetail = {
  id,
  kind: "analysis",
  section: "International Trade",
  headline: "France’s Wine Exports Are Losing Value Faster Than Volume",
  standfirst:
    "US receipts fell sharply in 2025/26, while British purchases grew. Domestic bulk contracts show where French sellers have retained more pricing strength.",
  description:
    "US wine receipts fell 22% as French export volume to that market lost 5%. Britain's sparkling purchases and domestic bulk contracts show where sales held up.",
  publishedAt: "2026-11-05",
  readingMinutes: 5,
  href: `/insights/analysis/${id}`,
  hero: {
    src: `/images/insights/${id}.jpg`,
    width: 1800,
    height: 1013,
    alt: "Rows of wooden wine barrels inside a cellar in Bordeaux, France.",
    caption:
      "Wine barrels in a cellar. Illustrative photograph; not an image of 2026 exports or of a business named in the report.",
    author: "Árpád Czapp",
    sourceUrl: "https://unsplash.com/photos/a-row-of-wine-barrels-in-a-wine-cellar-F3isHrw5l1w",
    licence: { name: "Unsplash License", url: "https://unsplash.com/license" },
    changes: "cropped",
  },
  body: [
    {
      text: "France's wine export volume fell 2% in the August 2025–July 2026 campaign, while receipts declined 5%, according to FranceAgriMer's 20 October report. The reported average was €8.84/litre, down about 3%. The sharper revenue loss leaves exporters with less money from a broadly similar volume of business.",
    },
    {
      text: "The US accounted for a particularly steep decline: 5% fewer litres and 22% less revenue.",
    },
    {
      heading: "US orders face weaker consumption",
      text: "The average value of French wine shipped to the US fell almost 18% to €10.70/litre. FranceAgriMer links the deterioration to tariff measures and weaker consumption. The change combines prices with the mix of wine sold; it does not establish that comparable bottles were discounted by that amount.",
    },
    {
      text: "The OIV's May 2026 report puts US consumption at 31.9 million hectolitres in calendar 2025, down 4.3%. That demand backdrop means tariff relief alone would offer an incomplete basis for expecting orders to recover. Importers also need to sell the wine already in their distribution channels.",
    },
    {
      text: "The commercial response starts with the order book. An importer reducing bottle numbers creates a volume problem for the French supplier; an importer maintaining purchases while seeking concessions creates pressure on the return from each shipment. Matching the response to that change is more useful than treating the entire fall in receipts as a price cut.",
    },
    {
      heading: "Britain buys more French sparkling wine",
      text: "French exports to Britain rose by more than 6% in volume and a little over 1% in value. Sparkling shipments grew around 11% and 5% respectively, with Champagne volumes up about 5% and stronger growth in other appellation sparkling wines, including Crémant.",
    },
    {
      text: "For the French trade, that is a growing outlet alongside the contracting US business. It also demands more wine to generate each additional euro of revenue. Supplying that expansion commits stock and working capital even when the headline sales result improves.",
    },
    {
      heading: "Spain supplies most of France's imports",
      text: "The report's import chart records 4.83 million hectolitres and €845 million for the campaign. Bulk wine supplied 73% of imported litres. Spain accounted for 63% of total volume, despite a 15% fall in its shipments; Spanish bulk volumes fell about 14%.",
    },
    {
      text: "That contraction matters to the suppliers serving the French bulk market. An export sale at a lower return can still release cash and tank space; losing the order altogether leaves both tied up until another customer is found. The consequence for a Spanish supplier therefore extends beyond the price on the next contract.",
    },
    {
      text: "France's high-value exports and its lower-priced imports also serve different products and customers. Subtracting their average values would leave out the costs of preparing and delivering those wines and would produce no usable trading margin.",
    },
    {
      heading: "Where bulk contract prices held up",
      text: "FranceAgriMer's first-stage purchase contracts over the 53 weeks of 2025/26 show the following averages across vintages:",
    },
    {
      text: "Recorded Vin de France volumes increased by 3% for red, 18% for rosé and 12% for white. More wine changed hands at lower average prices in each colour. IGP prices held steadier, although these category aggregates also contain different wines and contract mixes.",
    },
    {
      text: "The next campaign's contracts will provide a more direct test of whether that buying activity continues as the new vintage enters the market. A further rise in volume at lower prices would release stock while putting more pressure on the return per hectolitre. Stable prices accompanied by fewer contracts would leave sellers with a different cash-flow problem.",
    },
    {
      text: "For the next FranceAgriMer release, follow US shipment volume alongside receipts and Britain's sparkling-wine purchases. Its bulk-contract series will show whether the Vin de France price declines extend into 2026/27; no publication date for that next release has been confirmed here.",
    },
  ],
  tables: [
    {
      title: "First-stage bulk contract prices, 2025/26 averages, EUR/hl (change on the previous campaign)",
      columns: ["Red", "Rosé", "White"],
      rows: [
        { label: "Vin de France", cells: ["€66/hl (−4%)", "€70/hl (−1%)", "€84/hl (−9%)"] },
        { label: "IGP", cells: ["€93/hl (+3%)", "€86/hl (unchanged)", "€113/hl (+3%)"] },
      ],
      afterParagraph: 10,
    },
  ],
  sources: [
    {
      citation: [
        "FranceAgriMer, ",
        { title: "Note de conjoncture vin et cidre" },
        ", 20 October 2026, 6-page PDF",
      ],
      url: "https://www.franceagrimer.fr/sites/default/files/2026-10/NCO-VIN-CS-102026.pdf",
      note: "Main source. Pages 1–3: cumulative first-stage bulk purchase contracts over 53 weeks of the 2025/26 campaign, all vintages, Vin de France and IGP separately. Pages 4–6: France's wine trade over August 2025–July 2026, drawn from Trade Data Monitor. Export and import averages are aggregates, not prices of equivalent wines; bulk contract prices are not export prices or producer margins.",
    },
    {
      citation: [
        "OIV, ",
        { title: "State of the World Wine Sector in 2025" },
        ", May 2026",
      ],
      url: "https://www.oiv.int/sites/default/files/2026-05/OIV-State_of_the_World_Wine_Sector_in_2025_1.pdf",
      note: "US consumption in calendar 2025, a different period from FranceAgriMer's campaign-year trade series.",
    },
    {
      citation: ["FranceAgriMer, official report page"],
      url: "https://www.franceagrimer.fr/index.php/node/7089",
    },
  ],
};
