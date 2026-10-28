/**
 * Companies listed in the professional directory. Like the articles,
 * this is published content, not a fixture: each entry is a real
 * company, described in WineTerm's own words and checked on the date it
 * gives against the pages in its sources, which the company or its
 * group publishes. Categories are editorial; the country is that of the
 * business or local entity listed, not every country it serves.
 *
 * Listed by country, as researched; the directory sorts them by name.
 */

import type { DirectoryCompany } from "@/services/types";

export const directoryCompanies: DirectoryCompany[] = [
  {
    id: "sogrape",
    name: "Sogrape",
    country: "PT",
    category: "wineries-cooperatives",
    otherCategories: ["importers-exporters"],
    description:
      "Portuguese wine group with wineries in Portugal and other producing countries, alongside international wine distribution businesses.",
    website: "https://sogrape.com/",
    sources: ["https://sogrape.com/about-us"],
    checkedAt: "2026-10-28",
  },
  {
    id: "aveleda",
    name: "Aveleda",
    country: "PT",
    category: "wineries-cooperatives",
    otherCategories: [],
    description:
      "Portuguese wine producer based in Penafiel, with a portfolio centred on the Vinho Verde region and the Quinta da Aveleda estate.",
    website: "https://aveledavinhoverde.com/",
    sources: [
      "https://aveledavinhoverde.com/",
      "https://aveledavinhoverde.com/contactos/",
    ],
    checkedAt: "2026-10-28",
  },
  {
    id: "symington-family-estates",
    name: "Symington Family Estates",
    country: "PT",
    category: "wineries-cooperatives",
    otherCategories: [],
    description:
      "Family-owned Portuguese wine business producing Port and still wines, with a long-established presence in the Douro Valley.",
    website: "https://www.symington.com/",
    sources: ["https://www.symington.com/"],
    checkedAt: "2026-10-28",
  },
  {
    id: "adega-de-borba",
    name: "Adega de Borba",
    country: "PT",
    category: "wineries-cooperatives",
    otherCategories: ["importers-exporters"],
    description:
      "Alentejo wine cooperative bringing together growers in Borba and producing and bottling wines for Portuguese and export markets.",
    website: "https://adegaborba.pt/",
    sources: ["https://adegaborba.pt/adega/", "https://adegaborba.pt/"],
    checkedAt: "2026-10-28",
  },
  {
    id: "casa-santos-lima",
    name: "Casa Santos Lima",
    country: "PT",
    category: "wineries-cooperatives",
    otherCategories: ["importers-exporters"],
    description:
      "Family-owned Portuguese producer, bottler and exporter making wines from several Portuguese regions for international markets.",
    website: "https://www.casasantoslima.com/",
    sources: ["https://www.casasantoslima.com/"],
    checkedAt: "2026-10-28",
  },
  {
    id: "goanvi-bottling",
    name: "Goanvi Bottling",
    country: "PT",
    category: "bottlers-packers",
    otherCategories: [],
    description:
      "Beverage bottling business based in Maiorga, Portugal, providing wine bottling services and serving domestic and international markets.",
    website: "https://www.goanvi.wine/en/",
    sources: [
      "https://www.goanvi.wine/en/",
      "https://www.goanvi.wine/pt/47/contacto",
    ],
    checkedAt: "2026-10-28",
  },
  {
    id: "amorim-cork",
    name: "Amorim Cork",
    country: "PT",
    category: "suppliers-services",
    otherCategories: [],
    description:
      "Portuguese cork closure producer supplying stoppers for still wines, sparkling wines and spirits through an international distribution network.",
    website: "https://www.amorimcork.com/en/",
    sources: ["https://www.amorimcork.com/en/about-us/amorim-cork/"],
    checkedAt: "2026-10-28",
  },
  {
    id: "ba-glass",
    name: "BA Glass",
    country: "PT",
    category: "suppliers-services",
    otherCategories: [],
    description:
      "Glass packaging manufacturer with operations in Portugal and other markets, supplying wine bottles and other food and beverage containers.",
    website: "https://www.baglass.com/",
    sources: [
      "https://www.baglass.com/",
      "https://www.baglass.com/contact-us/",
    ],
    checkedAt: "2026-10-28",
  },
  {
    id: "dcoop-vinos-baco",
    name: "Dcoop Vinos-Baco",
    country: "ES",
    category: "bulk-buyers-sellers",
    otherCategories: ["wineries-cooperatives", "importers-exporters"],
    description:
      "Spanish cooperative wine business marketing members' bulk and packaged wines, alongside grape concentrates and other wine-related products.",
    website: "https://www.dcoop.es/productos/vinos",
    sources: [
      "https://www.dcoop.es/informacion-corporativa/areas-de-actividad/vi%C3%B1edos",
    ],
    checkedAt: "2026-10-28",
  },
  {
    id: "felix-solis-avantis",
    name: "Félix Solís Avantis",
    country: "ES",
    category: "wineries-cooperatives",
    otherCategories: [],
    description:
      "Spanish family-owned wine group producing wines through wineries and brands including Félix Solís and Pagos del Rey.",
    website: "https://felixsolisavantis.com/",
    sources: ["https://felixsolisavantis.com/"],
    checkedAt: "2026-10-28",
  },
  {
    id: "garcia-carrion",
    name: "García Carrión",
    country: "ES",
    category: "wineries-cooperatives",
    otherCategories: ["importers-exporters"],
    description:
      "Spanish wine and beverage group with wineries across several appellations, a portfolio including Don Simón, and international sales.",
    website: "https://garciacarrion.com/",
    sources: [
      "https://garciacarrion.com/pages/historia-y-valores",
      "https://garciacarrion.com/pages/internacional",
    ],
    checkedAt: "2026-10-28",
  },
  {
    id: "vinigalicia",
    name: "ViniGalicia",
    country: "ES",
    category: "wineries-cooperatives",
    otherCategories: ["importers-exporters"],
    description:
      "Galician family wine business based in Chantada, producing wines across Galicia's five appellations and working with international distributors.",
    website: "https://www.vinigalicia.es/es/",
    sources: [
      "https://www.vinigalicia.es/es/nosotros/",
      "https://www.vinigalicia.es/es/prensa/",
    ],
    checkedAt: "2026-10-28",
  },
  {
    id: "e-wine",
    name: "E-WINE",
    country: "ES",
    category: "brokers-intermediaries",
    otherCategories: [],
    description:
      "Almendralejo-based broker arranging bulk wine and grape must transactions between wineries, cooperatives, bottlers and industrial buyers in Spain, Portugal and Europe.",
    website: "https://e-wine.es/",
    sources: ["https://e-wine.es/"],
    checkedAt: "2026-10-28",
  },
  {
    id: "vinexval",
    name: "VINEXVAL",
    country: "ES",
    category: "brokers-intermediaries",
    otherCategories: [],
    description:
      "Valencia-based broker connecting cooperatives, wineries and wine merchants for bulk wine, grape must and related product transactions.",
    website: "https://www.vinexval.com/",
    sources: [
      "https://www.vinexval.com/",
      "https://www.vinexval.com/english-1",
    ],
    checkedAt: "2026-10-28",
  },
  {
    id: "agrovin",
    name: "Agrovin",
    country: "ES",
    category: "suppliers-services",
    otherCategories: [],
    description:
      "Spanish supplier of oenological products, technical solutions and winery equipment covering multiple stages of wine production and bottling.",
    website: "https://agrovin.com/",
    sources: ["https://agrovin.com/"],
    checkedAt: "2026-10-28",
  },
  {
    id: "vidrala",
    name: "Vidrala",
    country: "ES",
    category: "suppliers-services",
    otherCategories: [],
    description:
      "Spain-based glass packaging group manufacturing bottles and containers, including packaging for still and sparkling wines.",
    website: "https://www.vidrala.com/en/",
    sources: [
      "https://www.vidrala.com/en/",
      "https://www.vidrala.com/en/contact/vidrala-headquarters/",
    ],
    checkedAt: "2026-10-28",
  },
  {
    id: "les-grands-chais-de-france",
    name: "Les Grands Chais de France",
    country: "FR",
    category: "importers-exporters",
    otherCategories: ["wineries-cooperatives", "bottlers-packers"],
    description:
      "French wine group active in vineyard management, winemaking, bottling, logistics and international distribution across multiple wine regions.",
    website: "https://www.groupegcf.fr/",
    sources: ["https://www.groupegcf.fr/le-groupe-lgcf.html"],
    checkedAt: "2026-10-28",
  },
  {
    id: "castel-freres",
    name: "Castel Frères",
    country: "FR",
    category: "importers-exporters",
    otherCategories: ["wineries-cooperatives", "bottlers-packers"],
    description:
      "French wine merchant and producer with branded wines, château wines and fine wines, supported by bottling and logistics operations.",
    website: "https://www.castel-freres.com/en/",
    sources: ["https://www.castel-freres.com/en/"],
    checkedAt: "2026-10-28",
  },
  {
    id: "cordier-by-invivo",
    name: "Cordier by InVivo",
    country: "FR",
    category: "bulk-buyers-sellers",
    otherCategories: [
      "wineries-cooperatives",
      "bottlers-packers",
      "importers-exporters",
    ],
    description:
      "French wine business within InVivo, integrating bulk wine sourcing, production, bottling, brands and distribution through cooperative and industrial partnerships.",
    website: "https://www.cordier.com/",
    sources: ["https://www.cordier.com/"],
    checkedAt: "2026-10-28",
  },
  {
    id: "ciatti-europe",
    name: "Ciatti Europe",
    country: "FR",
    category: "brokers-intermediaries",
    otherCategories: [],
    description:
      "Montpellier-based office of the Ciatti network, brokering bulk wines, grapes, musts and concentrates across France and other European markets.",
    website: "https://ciatti.com/ciatti-global/ciatti-france-europe/",
    sources: [
      "https://www.ciatti-europe.com/",
      "https://ciatti.com/ciatti-global/ciatti-france-europe/",
    ],
    checkedAt: "2026-10-28",
  },
  {
    id: "maison-ginestet",
    name: "Maison Ginestet",
    country: "FR",
    category: "importers-exporters",
    otherCategories: [],
    description:
      "Bordeaux wine merchant specialising in sourcing, promoting and distributing Bordeaux fine wines to professional customers.",
    website: "https://www.maison-ginestet.com/",
    sources: ["https://www.maison-ginestet.com/"],
    checkedAt: "2026-10-28",
  },
  {
    id: "sicsoe",
    name: "SICSOE",
    country: "FR",
    category: "bottlers-packers",
    otherCategories: ["suppliers-services"],
    description:
      "French wine services company providing bulk wine preparation and storage, contract bottling, packaging, logistics and dry-goods procurement.",
    website: "https://www.sicsoe.fr/",
    sources: [
      "https://www.sicsoe.fr/qui-sommes-nous/services/",
      "https://www.sicsoe.fr/conditionnement/mise-en-bouteille/",
    ],
    checkedAt: "2026-10-28",
  },
  {
    id: "diam-bouchage",
    name: "Diam Bouchage",
    country: "FR",
    category: "suppliers-services",
    otherCategories: [],
    description:
      "France-based producer of technical cork closures for still wines, sparkling wines and spirits, with production and sales operations across several countries.",
    website: "https://www.diam-cork.com/",
    sources: [
      "https://www.diam-cork.com/",
      "https://diam-cork.com/nous-contacter",
    ],
    checkedAt: "2026-10-28",
  },
  {
    id: "caviro",
    name: "Caviro",
    country: "IT",
    category: "wineries-cooperatives",
    otherCategories: ["importers-exporters"],
    description:
      "Italian cooperative wine group combining wine production and export with the recovery of winemaking by-products in an integrated circular model.",
    website: "https://www.caviro.com/",
    sources: ["https://www.caviro.com/"],
    checkedAt: "2026-10-28",
  },
  {
    id: "terre-cevico",
    name: "Terre Cevico",
    country: "IT",
    category: "bulk-buyers-sellers",
    otherCategories: ["wineries-cooperatives", "bottlers-packers"],
    description:
      "Italian cooperative wine group based in Romagna, producing and selling bulk and packaged wines through dedicated production and sales operations.",
    website: "https://www.terrecevico.com/en/",
    sources: [
      "https://www.terrecevico.com/en/",
      "https://www.terrecevico.com/en/terre-cevico-company/",
    ],
    checkedAt: "2026-10-28",
  },
  {
    id: "cavit",
    name: "Cavit",
    country: "IT",
    category: "wineries-cooperatives",
    otherCategories: [],
    description:
      "Trentino wine cooperative bringing together local wineries and growers to produce still and sparkling wines from the region.",
    website: "https://www.cavit.it/",
    sources: ["https://www.cavit.it/"],
    checkedAt: "2026-10-28",
  },
  {
    id: "schenk-italia",
    name: "Schenk Italia",
    country: "IT",
    category: "bottlers-packers",
    otherCategories: ["wineries-cooperatives", "importers-exporters"],
    description:
      "Italian wine producer and exporter based in Ora, offering regional wines and private-label supply through its Italian wine operations.",
    website: "https://www.schenkitalia.it/en/",
    sources: [
      "https://www.schenkitalia.it/en/",
      "https://schenkfamily-wine.co.uk/producer/schenk-italian-wineries/",
    ],
    checkedAt: "2026-10-28",
  },
  {
    id: "cantine-sgarzi-luigi",
    name: "Cantine Sgarzi Luigi",
    country: "IT",
    category: "bottlers-packers",
    otherCategories: ["wineries-cooperatives", "bulk-buyers-sellers"],
    description:
      "Italian winery supplying bulk and packaged wines, private-label development and packaging solutions including bottles, cans and bag-in-box.",
    website: "https://cantinesgarzi.com/",
    sources: [
      "https://cantinesgarzi.com/",
      "https://cantinesgarzi.com/it/private-label/",
    ],
    checkedAt: "2026-10-28",
  },
  {
    id: "enartis",
    name: "Enartis",
    country: "IT",
    category: "suppliers-services",
    otherCategories: [],
    description:
      "Italian supplier of oenological products and technical support, helping wineries manage wine quality and production processes.",
    website: "https://www.enartis.com/",
    sources: [
      "https://www.enartis.com/wp-content/uploads/2019/05/Enartis_company-profile_EN.pdf",
    ],
    checkedAt: "2026-10-28",
  },
  {
    id: "gai-macchine-imbottigliatrici",
    name: "GAI Macchine Imbottigliatrici",
    country: "IT",
    category: "suppliers-services",
    otherCategories: [],
    description:
      "Italian manufacturer of bottling machinery for wine and other beverages, based in Ceresole Alba.",
    website: "https://www.gai-it.com/",
    sources: ["https://www.gai-it.com/"],
    checkedAt: "2026-10-28",
  },
];
