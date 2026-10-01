import type { ArticleDetail } from "@/services/types";

const id = "wine-trade-you-never-see-on-a-label";

export const wineTradeYouNeverSeeOnALabel: ArticleDetail = {
  id,
  kind: "analysis",
  section: "Trade",
  headline: "The wine trade you never see on a label",
  standfirst:
    "A third of internationally traded wine travels in bulk. Behind those shipments sits a business in sourcing, bottling and distribution that shapes how producers reach their customers.",
  publishedAt: "2026-10-01",
  readingMinutes: 5,
  href: `/insights/analysis/${id}`,
  body: [
    {
      text: "In June 2023, New Zealand wine producer Indevin announced plans to have a selection of its Villa Maria wines bottled in Cheshire, England. Wine would travel to Britain in bulk, with bottles manufactured and filled at Encirc's plant before being delivered to retailers. The companies presented the arrangement, scheduled to begin in early 2024, as a way to reduce transport emissions and respond more quickly to British customers. For an established wine brand, the decision about where to fill the bottle had become part of how it could compete.",
      cites: [1],
    },
    {
      text: "Such arrangements account for a substantial part of international wine commerce. In its May 2026 report, the International Organisation of Vine and Wine estimated that bulk wine represented 34% of global wine export volume in 2025, but just 7.3% of export value. The category, covering containers holding more than ten litres, recorded an average export value of €0.75 per litre. These figures describe wine crossing borders in a particular format; they do not measure the share of a bottle's eventual retail price received by its producer.",
      cites: [2],
    },
    {
      text: "The wine still has costs to incur after arrival, including packaging and distribution, while the bulk and bottled categories contain different mixes of origins, brands and price points. Their export values cannot tell us how much extra profit a producer would make by putting the same wine into glass. Nor does a bulk shipment necessarily mean that a winery has sold its wine to someone else's brand. A producer can use an overseas bottler while continuing to sell under its own name, as the Villa Maria arrangement illustrates.",
      cites: [1, 2],
    },
    {
      text: "Elsewhere in the market, ownership and commercial responsibility do change hands. A winery may sell wine to a buyer that will arrange its packaging and sale under a separate label. This creates room for businesses whose expertise lies in assembling a finished product and getting it to customers. Britain's Kingsland Drinks, for example, offers private labelling, packaging procurement and contract packing alongside supply-chain services. A retailer or brand owner can therefore commission a wine business without having to own every stage from vineyard to bottling line.",
      cites: [3],
    },
    {
      text: "Buyers arrive with requirements that narrow the available supply. The international broker Ciatti describes a process of matching buyers with wines by grape variety, appellation, vintage, quantity and price, using representative samples before negotiating contracts. Agreements can cover an immediate purchase or a longer supply relationship, with payment and shipping terms negotiated alongside the wine itself. A large inventory of unsold red wine is consequently of limited help to a buyer seeking a particular white variety from a specified origin. Availability has to be judged against the order that needs filling.",
      cites: [4],
    },
    {
      text: "Once the wine has been selected, transport creates another set of choices. Flexitanks, flexible liners fitted inside shipping containers, allow large quantities to travel without their final glass packaging. The Australian Wine Research Institute describes a configuration carrying 24,000 litres in a standard 20-foot container, equivalent to 32,000 bottles of 750ml. That comparison describes the amount of wine in the load, rather than how many filled bottles the same container could carry. The commercial attraction is straightforward: glass and retail packaging can be added closer to the customer, reducing the weight and space devoted to them on the international journey.",
      cites: [5],
    },
    {
      text: "Bottling at destination also leaves some decisions open for longer. Wine held in bulk can be allocated to packaging runs as orders become clearer, subject to the product's specifications and the capacity available at the bottling plant. A June 2026 review by New Zealand's Bragato Research Institute identified this flexibility as one of the model's advantages. It can help a supplier respond to changing demand without having committed every litre to a finished pack before departure.",
      cites: [6],
    },
    {
      text: "Preserving that flexibility requires careful handling. Oxygen exposure and temperature are among the risks identified by the Bragato review, which stresses the importance of testing and coordination between the winery, transport provider and receiving bottler. Evidence also shows that bulk transport can preserve quality successfully. In an Australian Wine Research Institute project completed in 2015, shipments between Australia and Britain showed no major sensory differences before and after transport under the conditions studied. Those findings support the method's viability while leaving each shipment dependent on the wine, equipment and journey involved.",
      cites: [5, 6, 7],
    },
    {
      text: "The winery's quality controls therefore have to extend to the receiving operation. It has to be confident that the wine approved before loading is the wine that reaches the bottle, and that someone will identify a problem if it does not. For a brand owner, outsourcing the filling operation leaves its reputation exposed to work carried out elsewhere. A lower freight bill therefore has to be considered alongside the cost of oversight and the reliability of the partners involved.",
      cites: [6],
    },
    {
      text: "For producers selling to another business, the attraction is different. A bulk contract can provide an outlet without requiring the winery to finance packaging, consumer marketing and distribution under its own label. It can also make sales planning easier when volumes and delivery dates are agreed in advance. The benefit depends on the contract: payment terms determine when the producer receives cash, and a commitment from a dependable customer is worth more than an expression of interest. The price per litre is only one part of the commercial decision.",
      cites: [4],
    },
    {
      text: "There is a substantial difference, too, between making wine for an identified customer and making it in the hope that a buyer will appear later. The first gives a producer a specification and some visibility over demand. The second leaves it exposed to whatever buyers want when the wine is ready. Bulk trading can connect available wine with customers across markets, but the existence of a trading network does not guarantee that every wine will find a profitable destination. A cheaper route to the shelf cannot, by itself, make consumers buy more bottles.",
    },
    {
      text: "A winery can earn a higher selling price under its own label and still be left with less after packaging, promotion, distribution and unsold stock. A well-negotiated bulk contract may offer a lower price but a more predictable outlet. Deciding between them requires knowledge of the customer as well as the cost of making the wine. For producers without an established route to the shelf, that commercial work begins well before anyone chooses a label.",
    },
  ],
  sources: [
    {
      citation: [
        "Encirc, “Encirc and Indevin drink to new bottling partnership”, June 2023",
      ],
      url: "https://www.encirc360.com/2023/06/13/encirc-and-indevin-drink-to-new-bottling-partnership/",
    },
    {
      citation: [
        "OIV, ",
        { title: "State of the World Wine Sector in 2025" },
        ", May 2026, international trade section",
      ],
      url: "https://www.oiv.int/sites/default/files/2026-05/OIV-State_of_the_World_Wine_Sector_in_2025.pdf",
      note: "Figures are OIV estimates and may be revised.",
    },
    {
      citation: [
        "Kingsland Drinks, services and private-labelling information",
      ],
      url: "https://www.kingsland-drinks.com/frequently-asked-questions/",
    },
    {
      citation: ["Ciatti, bulk-wine sourcing, specifications and contracts"],
      url: "https://ciatti.com/products/bulk-wine/",
    },
    {
      citation: [
        "Australian Wine Research Institute, Project 3.6.1: Maximising quality during bulk wine transport",
      ],
      url: "https://www.awri.com.au/research_and_development/rde-plan/projects/project-3-6-1/",
    },
    {
      citation: [
        "Bragato Research Institute, “Innovations in bulk wine shipping”, 24 June 2026",
      ],
      url: "https://bri.co.nz/news/innovations-in-bulk-wine-shipping/",
    },
    {
      citation: [
        "Wine Australia, summary of AWRI project AWR 1203, completed June 2015",
      ],
      url: "https://www.wineaustralia.com/research_and_innovation/projects/maximising-quality-during-bulk-wine-transport",
    },
  ],
};
