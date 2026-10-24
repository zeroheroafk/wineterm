/**
 * WineTerm information architecture.
 *
 * Single source of truth for the primary navigation, its secondary levels,
 * the footer and breadcrumbs. Routes exist here before their pages are
 * built so the shell is stable while sections come online.
 *
 * Pages without content yet stay out of the menus, the footer and the
 * sitemap, though their routes answer: Must & Concentrates
 * (/markets/must-concentrates, no licensed source). Add each back here
 * when it has something to show. Companies (/companies) is the
 * exception: it is in the menu before its first listing, as the place
 * the directory will fill.
 *
 * Crop & Supply (/supply, /supply/production, /supply/stocks, /harvest)
 * is hidden the same way for now, along with its supply and harvest
 * panels on Market data. Its section stays below, marked hidden, so its
 * pages keep their headers; drop the mark to show it again.
 */

export interface NavLeaf {
  label: string;
  href: string;
  /** Short supporting line shown in wide dropdown panels. */
  description?: string;
}

export interface NavSection {
  label: string;
  href: string;
  /** Monospace section code shown in dropdowns and secondary navigation. */
  code: string;
  items: NavLeaf[];
  /** Kept out of the menus; its pages still answer. */
  hidden?: boolean;
}

export const primaryNavigation: NavSection[] = [
  {
    label: "Markets",
    href: "/markets",
    code: "MKT",
    items: [
      {
        label: "Bulk Wine Prices",
        href: "/markets/bulk-wine",
        description: "Reference prices by region, colour and grade",
      },
      {
        label: "Market Comparison",
        href: "/markets/compare",
        description: "Compatible series side by side",
      },
    ],
  },
  {
    label: "Market data",
    href: "/data",
    code: "DAT",
    items: [
      {
        label: "Trade",
        href: "/data#trade",
        description: "Leading exporters, destinations and product forms",
      },
    ],
  },
  {
    label: "Crop & Supply",
    href: "/supply",
    code: "SUP",
    hidden: true,
    items: [
      {
        label: "Production",
        href: "/supply/production",
        description: "Campaign production by country and colour",
      },
      {
        label: "Stocks",
        href: "/supply/stocks",
        description: "Declared stocks and historical comparison",
      },
      {
        label: "Availability",
        href: "/supply",
        description: "Spain's declared balance: stocks, production, entries and exits",
      },
      {
        label: "Harvest",
        href: "/harvest",
        description: "Official production estimates for the vintage",
      },
    ],
  },
  {
    label: "Trade",
    href: "/trade",
    code: "TRD",
    items: [
      {
        label: "Imports & Exports",
        href: "/trade",
        description: "Trade flows by origin, destination and product",
      },
      {
        label: "Bulk Wine Trade",
        href: "/trade#bulk",
        description: "Bulk shipments, volumes and average values",
      },
      {
        label: "Bottled Wine Trade",
        href: "/trade#bottled",
        description: "Bottled still wine trade by market",
      },
      {
        label: "Sparkling Wine Trade",
        href: "/trade#sparkling",
        description: "Sparkling categories and destinations",
      },
    ],
  },
  {
    label: "Consumer",
    href: "/consumer",
    code: "CON",
    items: [
      {
        label: "Bottle Prices",
        href: "/consumer/bottle-prices",
        description: "What a bottle is worth when it leaves Spain, Portugal, France and Italy",
      },
      {
        label: "Shop Prices",
        href: "/consumer/shop-prices",
        description: "How the price of wine in the shops moves, country by country",
      },
    ],
  },
  {
    label: "Companies",
    href: "/companies",
    code: "CMP",
    items: [],
  },
  {
    label: "Insights",
    href: "/insights",
    code: "INS",
    items: [
      {
        label: "Analysis",
        href: "/insights/analysis",
        description: "Interpretation of prices, supply and trade",
      },
      {
        label: "News",
        href: "/insights/news",
        description: "Industry news by topic, linked to its source",
      },
      {
        label: "Weekly Briefing",
        href: "/insights/weekly-briefing",
        description: "The week in wine markets, every Friday",
      },
      {
        label: "Monthly Reports",
        href: "/insights/monthly-reports",
        description: "Structured monthly market reviews",
      },
      {
        label: "Methodology",
        href: "/insights/methodology",
        description: "How WineTerm series are collected and defined",
      },
    ],
  },
];

/** The sections the menus show. */
export const menuNavigation = primaryNavigation.filter((section) => !section.hidden);

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

/** Footer link groups, kept separate from primary navigation on purpose. */
export const footerNavigation: { heading: string; items: NavLeaf[] }[] = [
  {
    heading: "Data",
    items: [
      { label: "Market Data", href: "/data" },
      { label: "Bulk Wine Prices", href: "/markets/bulk-wine" },
      { label: "Imports & Exports", href: "/trade" },
      { label: "Bottle & Shop Prices", href: "/consumer" },
      { label: "Companies", href: "/companies" },
    ],
  },
  {
    heading: "Editorial",
    items: [
      { label: "Analysis", href: "/insights/analysis" },
      { label: "News", href: "/insights/news" },
      { label: "Weekly Briefing", href: "/insights/weekly-briefing" },
      { label: "Monthly Reports", href: "/insights/monthly-reports" },
      { label: "Methodology", href: "/insights/methodology" },
    ],
  },
  {
    heading: "WineTerm",
    items: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Terms of Use", href: "/terms" },
      { label: "Privacy", href: "/privacy" },
    ],
  },
];
