/**
 * ILLUSTRATIVE FIXTURE DATA: news stories.
 *
 * Development placeholders demonstrating the news format across the
 * coverage WineTerm is widening to: brands, consumption, culture and
 * lifestyle beside markets, trade and regulation. None of these stories
 * is published reporting, and every one carries the illustrative status;
 * pages rendering them carry a visible development-content notice. They
 * describe generic developments and reference no real or invented
 * company, transaction or person. See src/fixtures/README.md.
 *
 * The photographs are real and credited: public domain (CC0) images from
 * the sources named in each credit, cropped to 3:2 and stored in
 * public/news under the story's id.
 *
 * Newest first. Lists sort by publication time and keep this order for
 * stories published at the same time.
 */

import type { NewsStory, StoryImage } from "@/services/types";

const CC0 = "CC0 1.0";

function photo(
  id: string,
  alt: string,
  credit: StoryImage["credit"],
): StoryImage {
  return { src: `/news/${id}.jpg`, alt, width: 960, height: 640, credit };
}

function story(
  fields: Omit<NewsStory, "href" | "status" | "image"> & {
    image: { alt: string; credit: StoryImage["credit"] };
  },
): NewsStory {
  return {
    ...fields,
    image: photo(fields.id, fields.image.alt, fields.image.credit),
    status: "illustrative",
    href: `/news/${fields.id}`,
  };
}

const rawpixel = (url: string): StoryImage["credit"] => ({
  source: "rawpixel",
  url,
  licence: CC0,
});

const stocksnap = (creator: string, url: string): StoryImage["credit"] => ({
  creator,
  source: "StockSnap",
  url,
  licence: CC0,
});

export const newsStories: NewsStory[] = [
  story({
    id: "younger-drinkers-buy-fewer-bottles",
    headline: "Younger drinkers buy fewer bottles and choose them more carefully",
    standfirst:
      "Consumer surveys across Europe point to lower volumes but a readiness to pay more for wines with a clear origin and a story to tell.",
    publishedAt: "2026-11-06T09:00:00Z",
    topics: ["consumption", "brands", "lifestyle"],
    image: {
      alt: "Two glasses of red wine raised in a toast",
      credit: stocksnap(
        "Holiday Scenes",
        "https://stocksnap.io/photo/wine-glasses-E9THX9BI3P",
      ),
    },
    body: [
      "Drinkers under 35 are buying wine less often than their parents did at the same age, but the bottles they do buy are chosen with more care. Survey work in several European markets describes the same pattern: fewer occasions, smaller baskets and a higher average spend per bottle.",
      "Origin, grape variety and the way a wine is made weigh more in the choice than a familiar label. Producers that explain where a wine comes from, on the bottle and online, report a better response than those relying on price promotions alone.",
      "For wineries the shift is a mixed blessing. Volume keeps falling, but there is room for brands that can justify a higher price, and for retailers that guide the choice rather than simply widening the range.",
    ],
  }),
  story({
    id: "cooperatives-invest-in-their-own-brands",
    headline: "Cooperatives invest in their own brands to depend less on bulk sales",
    standfirst:
      "Bottling lines, design budgets and export teams: first-stage producers want to keep more of the value of the wine they make.",
    publishedAt: "2026-11-06T08:00:00Z",
    topics: ["brands", "markets", "trade"],
    image: {
      alt: "Stainless steel fermentation tanks in a winery",
      credit: rawpixel(
        "https://www.rawpixel.com/image/6016371/wine-cellar-free-public-domain-cc0-photo",
      ),
    },
    body: [
      "Cooperatives that have long sold most of their wine in bulk are putting more of it into bottle under their own names. The investment goes into filling lines, label design and sales staff for export markets, rather than into more tank capacity.",
      "The aim is to depend less on bulk prices, which have been weak for several campaigns, and to give members a steadier return. A bottled range also gives the cooperative a direct relationship with retailers and importers.",
      "The move is slow and costly. Building a brand takes years of marketing spend, and most cooperatives will keep selling a large share of their wine in bulk while their own labels find a market.",
    ],
  }),
  story({
    id: "rose-stretches-its-season",
    headline: "Rosé stretches its season beyond the summer months",
    standfirst:
      "Producers and retailers are presenting rosé as a wine for the whole year, with autumn food pairings and deeper-coloured styles.",
    publishedAt: "2026-11-05T10:00:00Z",
    topics: ["brands", "consumption", "retail"],
    image: {
      alt: "Bottles of rosé wine stored in a wooden diamond rack",
      credit: rawpixel(
        "https://www.rawpixel.com/image/5906700/photo-image-public-domain-vintage-free",
      ),
    },
    body: [
      "Rosé sales still peak between May and August, and that dependence on a few summer months is what producers now want to change. Autumn promotions pair rosé with seasonal dishes, and some ranges add darker, fuller styles meant for the table rather than the terrace.",
      "Retailers are following with year-round shelf space, where rosé used to shrink back to a few lines after the summer. The bet is that drinkers who already know the category will buy it outside the season if it stays in view.",
      "Whether the habit sticks will show in winter sales. A wine sold on lightness and freshness has to find new reasons to be chosen when the weather turns.",
    ],
  }),
  story({
    id: "wine-tourism-holds-up-through-the-harvest",
    headline: "Wine tourism bookings hold up through the harvest season",
    standfirst:
      "Estates offering harvest visits and tastings report steadier autumn demand, with visitors staying longer and buying at the cellar door.",
    publishedAt: "2026-11-05T08:00:00Z",
    topics: ["wine-tourism", "lifestyle", "culture"],
    image: {
      alt: "A winery estate at the foot of a terraced vineyard slope",
      credit: rawpixel(
        "https://www.rawpixel.com/image/6030238/photo-image-public-domain-free-landscape",
      ),
    },
    body: [
      "Autumn used to be the quiet end of the wine tourism year. Estates that open their cellars during the harvest, with picking mornings, tank tastings and long lunches, now describe it as one of their busiest periods.",
      "Visitors are staying longer, often for a weekend rather than a single tasting, and spending more at the cellar door. For smaller producers direct sales of this kind earn a far better margin than wine sold through distributors.",
      "The growth brings its own demands: staff who can host visitors in the middle of the harvest, rooms and transport in rural areas, and booking systems that most small wineries are only starting to use.",
    ],
  }),
  story({
    id: "low-and-no-alcohol-wines-win-shelf-space",
    headline: "Low- and no-alcohol wines win more shelf space",
    standfirst:
      "Retailers are widening their dealcoholised ranges as moderation becomes a lasting habit rather than a January resolution.",
    publishedAt: "2026-11-04T10:00:00Z",
    topics: ["consumption", "retail", "brands"],
    image: {
      alt: "White wine being poured into a glass",
      credit: stocksnap(
        "Torsten Dettlaff",
        "https://stocksnap.io/photo/wine-glass-QIZWBURQ54",
      ),
    },
    body: [
      "Wines with little or no alcohol are moving from a single shelf at the end of the aisle into the main wine range. Retailers report that the category no longer sells only in January, when many drinkers take a break, but across the year.",
      "Quality has improved as producers invest in removal techniques that keep more of the wine's aroma. Sparkling and white styles lead, since the absence of alcohol is less noticeable in lighter wines than in reds.",
      "The category is still small next to conventional wine, but it is one of the few growing. For producers it is a way to keep drinkers who are cutting back rather than lose them to other drinks.",
    ],
  }),
  story({
    id: "restaurants-sell-more-wine-by-the-glass",
    headline: "Restaurants shorten wine lists and sell more by the glass",
    standfirst:
      "Shorter lists, wider by-the-glass ranges and preservation systems help venues manage their stock and their margins.",
    publishedAt: "2026-11-04T08:00:00Z",
    topics: ["hospitality", "consumption", "lifestyle"],
    image: {
      alt: "A restaurant table laid with wine glasses and an open bottle",
      credit: stocksnap(
        "Quentin Dr",
        "https://stocksnap.io/photo/wine-glass-QI10VZZPBC",
      ),
    },
    body: [
      "Restaurants are cutting the number of wines on their lists and offering more of them by the glass. A shorter list ties up less money in the cellar, and a wide glass selection lets diners try something new without committing to a bottle.",
      "Preservation systems that keep an open bottle fresh for days have made it possible to pour better wines by the glass. Sommeliers say diners use the format to explore, ordering two or three different glasses with a meal.",
      "For producers the change narrows the route onto restaurant lists. Fewer listings are available, and they go to wines that staff can explain and that sell steadily glass after glass.",
    ],
  }),
  story({
    id: "sparkling-wine-leads-year-end-orders",
    headline: "Sparkling wine leads the year-end order book",
    standfirst:
      "Importers have brought forward orders for the festive season, with traditional-method wines from southern Europe gaining ground.",
    publishedAt: "2026-11-03T09:00:00Z",
    topics: ["trade", "consumption", "markets"],
    image: {
      alt: "Glasses of sparkling wine lined up on serving trays",
      credit: rawpixel(
        "https://www.rawpixel.com/image/5922483/photo-image-new-year-public-domain-birthday",
      ),
    },
    body: [
      "Orders of sparkling wine for the end of the year arrived earlier than usual, as importers secured stock ahead of the shipping peak. Sparkling remains the category least affected by the general fall in wine consumption.",
      "Traditional-method wines from southern Europe are gaining a larger share of those orders, offered as an alternative to better-known appellations at a lower price.",
      "The early buying brings forward sales that would otherwise have come in December. Exporters will judge the season on repeat orders in the new year rather than on the first shipments.",
    ],
  }),
  story({
    id: "lighter-bottles-move-up-to-premium-labels",
    headline: "Lighter bottles move up from entry ranges to premium labels",
    standfirst:
      "Weight reduction is spreading to higher price points, driven by freight costs and emissions reporting.",
    publishedAt: "2026-11-02T09:00:00Z",
    topics: ["packaging", "sustainability", "brands"],
    image: {
      alt: "Rows of dark glass wine bottles lying on their side",
      credit: rawpixel(
        "https://www.rawpixel.com/image/6027871/wine-bottles-free-public-domain-cc0-photo",
      ),
    },
    body: [
      "Lighter glass bottles, long standard in entry-level ranges, are now being adopted for more expensive wines. Producers had resisted, fearing that buyers read a heavy bottle as a sign of quality.",
      "Glass is the largest single source of a bottle of wine's carbon footprint, and a lighter bottle also costs less to ship. As more retailers ask suppliers to report emissions, the weight of the bottle has become a commercial question.",
      "Producers making the switch say buyers rarely notice the difference on the shelf. Some now state the bottle's weight on the back label as part of their sustainability message.",
    ],
  }),
  story({
    id: "harvest-festivals-return-to-full-programmes",
    headline: "Harvest festivals return to full programmes across southern Europe",
    standfirst:
      "Village fairs, grape treading and open cellar days bring visitors back to wine regions once the picking ends.",
    publishedAt: "2026-10-31T09:00:00Z",
    topics: ["culture", "wine-tourism", "harvest"],
    image: {
      alt: "Hands holding freshly picked bunches of white grapes",
      credit: {
        creator: "W.carter",
        source: "Wikimedia Commons",
        url: "https://commons.wikimedia.org/w/index.php?curid=72903508",
        licence: CC0,
      },
    },
    body: [
      "Harvest festivals in wine villages across southern Europe ran full programmes this autumn: processions, grape treading, tastings in the square and cellars opened to the public for a weekend.",
      "Local authorities and producers' associations see the festivals as a way to bring visitors to wine regions outside the summer, and to keep traditions alive in villages where fewer people now work the vineyards.",
      "For wineries they are also a sales event. Many sell a large share of their direct-to-consumer volume over a festival weekend, and use it to sign up visitors for later deliveries.",
    ],
  }),
  story({
    id: "local-grape-varieties-gain-ground-on-wine-lists",
    headline: "Local grape varieties gain ground on wine lists",
    standfirst:
      "Sommeliers and importers are giving more space to native varieties as drinkers look beyond the international names.",
    publishedAt: "2026-10-30T09:00:00Z",
    topics: ["culture", "hospitality", "brands"],
    image: {
      alt: "Sunlit rows of vines on a hillside vineyard",
      credit: rawpixel(
        "https://www.rawpixel.com/image/6016746/photo-image-public-domain-leaves-green",
      ),
    },
    body: [
      "Wine lists that once relied on a handful of international varieties are making room for grapes grown in only one region or country. Sommeliers say diners increasingly ask for something they have not tried before.",
      "Importers are following, adding native varieties to their portfolios to stand out in crowded markets. For the regions concerned, a recognised local grape is a distinction that competitors elsewhere cannot copy.",
      "The challenge is familiarity. A variety few people can pronounce needs staff to recommend it, and producers are investing in training and tastings for the trade as much as in marketing to consumers.",
    ],
  }),
  story({
    id: "natural-cork-holds-its-place-in-premium-closures",
    headline: "Natural cork holds its place in premium closures",
    standfirst:
      "Producers of wines meant for ageing keep choosing cork, while screw caps extend their lead in everyday ranges.",
    publishedAt: "2026-10-29T09:00:00Z",
    topics: ["packaging", "sustainability"],
    image: {
      alt: "A heap of used wine corks",
      credit: stocksnap(
        "Elisha Terada",
        "https://stocksnap.io/photo/wine-corks-P7IKG503HV",
      ),
    },
    body: [
      "The market for wine closures is splitting by price. Screw caps keep gaining in wines meant to be drunk young, while natural cork holds its place in wines made for ageing and in markets where buyers expect to hear a cork being drawn.",
      "Cork producers point to improved quality control, which has reduced the faults that once pushed wineries towards alternatives, and to the environmental case for a closure harvested from living trees.",
      "For many producers the choice is now a matter of brand rather than of technical performance: the closure says something about the wine, and each market reads it differently.",
    ],
  }),
  story({
    id: "crisis-distillation-criteria-for-2026-27",
    headline: "EU committee weighs crisis distillation criteria for 2026/27",
    standfirst:
      "Eligibility rules, volumes and reference prices remain open ahead of the new campaign; member states differ on scope.",
    publishedAt: "2026-10-28T09:00:00Z",
    topics: ["regulation", "markets"],
    image: {
      alt: "Rows of vines leading towards woodland",
      credit: rawpixel(
        "https://www.rawpixel.com/image/6016749/photo-image-public-domain-leaves-green",
      ),
    },
    body: [
      "The rules for crisis distillation in the new campaign are still under discussion. Which wines are eligible, how much may be withdrawn and at what price remain open, and member states disagree on how broad the measure should be.",
      "Producing countries with large stocks of unsold wine want the scheme open early, while others argue that repeated distillation delays the reduction in vineyard area that the market needs.",
      "Growers and cooperatives are waiting on the outcome before deciding how much of their stock to offer. A late decision would leave wine in tanks that are needed for the new vintage.",
    ],
  }),
  story({
    id: "wine-and-cheese-anchor-autumn-food-festivals",
    headline: "Wine and cheese pairings anchor autumn food festivals",
    standfirst:
      "Regional food fairs are building their programmes around local wine, giving small producers a stage beside chefs and cheesemakers.",
    publishedAt: "2026-10-27T09:00:00Z",
    topics: ["lifestyle", "culture"],
    image: {
      alt: "Glasses of red wine beside cheeses and cured meat on a wooden board",
      credit: rawpixel(
        "https://www.rawpixel.com/image/5920638/photo-image-background-christmas-public-domain",
      ),
    },
    body: [
      "Autumn food festivals are putting wine at the centre of their programmes, with tastings that pair local wines with cheeses, cured meats and seasonal dishes from the same region.",
      "For small producers the fairs are a rare chance to pour for consumers who would never find their wine on a supermarket shelf, often alongside chefs who use it in their cooking.",
      "Organisers see wine as the link that holds a regional food offer together, and producers' associations are increasingly the ones running the events.",
    ],
  }),
  story({
    id: "bulk-buyers-return-after-the-harvest",
    headline: "Bulk buyers return to the market after the harvest",
    standfirst:
      "With the new wine in tank, merchants and bottlers are sampling again, though most are buying only what their orders require.",
    publishedAt: "2026-10-26T09:00:00Z",
    topics: ["markets", "trade", "harvest"],
    image: {
      alt: "Oak barrels stacked in a cellar",
      credit: rawpixel(
        "https://www.rawpixel.com/image/6045637/free-public-domain-cc0-photo",
      ),
    },
    body: [
      "Once the new wine was in tank, buyers returned to the bulk market, sampling the vintage and asking for offers. Activity picked up from the quiet weeks of the harvest, though volumes remain modest.",
      "Most merchants and bottlers are buying only to cover confirmed orders, with large stocks from earlier vintages still available. Sellers with wine that matches a specific demand find buyers more easily than those offering generic lots.",
      "Prices for the new campaign will take shape over the coming weeks, as the first contracts are registered. The figures are published on the Markets pages as they arrive.",
    ],
  }),
];
