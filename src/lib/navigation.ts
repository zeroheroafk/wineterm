/**
 * WineTerm information architecture.
 *
 * Single source of truth for the primary navigation, its secondary levels,
 * the footer and breadcrumbs. Routes exist here before their pages are
 * built so the shell is stable while sections come online.
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
        label: "Grape Prices",
        href: "/markets/grapes",
        description: "Wine grape prices through the campaign",
      },
      {
        label: "Must & Concentrates",
        href: "/markets/must-concentrates",
        description: "Grape must, RCGM and concentrate values",
      },
      {
        label: "Market Comparison",
        href: "/markets/compare",
        description: "Compatible series side by side",
      },
    ],
  },
  {
    label: "Crop & Supply",
    href: "/supply",
    code: "SUP",
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
        description: "Supply balance: stocks, production, use and trade",
      },
      {
        label: "Harvest Outlook",
        href: "/harvest",
        description: "Forecasts and progress for the coming vintage",
      },
      {
        label: "Weather",
        href: "/harvest#weather",
        description: "Growing conditions across key regions",
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
    label: "Industry",
    href: "/industry",
    code: "IND",
    items: [
      {
        label: "Companies",
        href: "/industry/companies",
        description: "Wineries, cooperatives, bottlers and suppliers",
      },
      {
        label: "Deals & Investments",
        href: "/industry/deals",
        description: "Transactions, capacity and consolidation",
      },
      {
        label: "Regulation",
        href: "/industry/regulation",
        description: "EU and national rules affecting the sector",
      },
      {
        label: "Technology",
        href: "/industry/technology",
        description: "Winemaking, vineyard and data technology",
      },
      {
        label: "Packaging & Logistics",
        href: "/industry/packaging-logistics",
        description: "Glass, closures, flexitanks and freight",
      },
    ],
  },
  {
    label: "Insights",
    href: "/insights",
    code: "INS",
    items: [
      {
        label: "Market Outlook",
        href: "/outlook",
        description: "The desk's view over the next one to three months",
      },
      {
        label: "News",
        href: "/insights/news",
        description: "Reporting for the professional wine trade",
      },
      {
        label: "Analysis",
        href: "/insights/analysis",
        description: "Interpretation of prices, supply and trade",
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
  {
    label: "Directory",
    href: "/directory",
    code: "DIR",
    items: [],
  },
];

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

/** Footer link groups, kept separate from primary navigation on purpose. */
export const footerNavigation: { heading: string; items: NavLeaf[] }[] = [
  {
    heading: "Data",
    items: [
      { label: "Bulk Wine Prices", href: "/markets/bulk-wine" },
      { label: "Grape Prices", href: "/markets/grapes" },
      { label: "Production", href: "/supply/production" },
      { label: "Stocks", href: "/supply/stocks" },
      { label: "Imports & Exports", href: "/trade" },
    ],
  },
  {
    heading: "Editorial",
    items: [
      { label: "News", href: "/insights/news" },
      { label: "Analysis", href: "/insights/analysis" },
      { label: "Weekly Briefing", href: "/insights/weekly-briefing" },
      { label: "Monthly Reports", href: "/insights/monthly-reports" },
      { label: "Methodology", href: "/insights/methodology" },
    ],
  },
  {
    heading: "Industry",
    items: [
      { label: "Companies", href: "/industry/companies" },
      { label: "Deals & Investments", href: "/industry/deals" },
      { label: "Regulation", href: "/industry/regulation" },
      { label: "Directory", href: "/directory" },
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
