/**
 * Central typed source registry.
 *
 * Every market observation references one entry here by id, and each
 * entry mirrors its row in the database table sources. Providers are
 * added as their data is licensed and connected.
 */

/** How a source's figures should be read. */
export type DataClassification =
  | "official"
  | "reported"
  | "indicative"
  | "modelled"
  | "estimated";

export const DATA_CLASSIFICATION_LABELS: Record<DataClassification, string> = {
  official: "Official",
  reported: "Reported",
  indicative: "Indicative",
  modelled: "Modelled",
  estimated: "Estimated",
};

export type SourceId =
  | "eurostat-comext"
  | "mapa-pmn"
  | "mapa-infovi"
  | "mapa-isc"
  | "mapa-avances"
  | "draaf-occitanie"
  | "agreste"
  | "ivv"
  | "uiv-assoenologi-ismea"
  | "icqrf-cantina-italia"
  | "douane-stocks"
  | "ivv-existencias"
  | "wineterm-trade-estimate";

export interface MarketSource {
  id: SourceId;
  /** Display name. */
  name: string;
  /** Publisher kind, shown on methodology blocks. */
  kind:
    | "official-bulletin"
    | "regional-observatory"
    | "cooperative-network"
    | "trade-reporting"
    | "wineterm";
  classification: DataClassification;
  /** Geographic coverage of the source. */
  coverage: string;
  /** Typical publication cadence. */
  cadence: string;
  /** How WineTerm treats this source's figures. */
  note: string;
  /** The publisher's page for the data. */
  url?: string;
}

export const SOURCE_REGISTRY: Record<SourceId, MarketSource> = {
  "eurostat-comext": {
    id: "eurostat-comext",
    name: "Eurostat Comext, EU trade by CN8 (DS-045409)",
    kind: "official-bulletin",
    classification: "official",
    coverage:
      "Trade of Spain, Portugal, France and Italy in wine and grape must (CN 2204) with every partner",
    cadence:
      "Monthly, mid-month, for the month two months earlier; recent months are revised",
    note: "Official customs and intra-EU trade statistics, imported unchanged: value in euros, and volume in litres summed from the CN8 codes. Source: Eurostat, CC BY 4.0.",
    url: "https://ec.europa.eu/eurostat/web/international-trade-in-goods/database",
  },
  "mapa-pmn": {
    id: "mapa-pmn",
    name: "MAPA, Precios Medios Nacionales",
    kind: "official-bulletin",
    classification: "official",
    coverage:
      "Spain, national weekly averages of agricultural prices; WineTerm imports white and red wine without PDO/PGI",
    cadence: "Weekly, a few days after the week ends",
    note: "Official statistics of the Spanish Ministry of Agriculture, Fisheries and Food, imported unchanged: ex-winery prices in euros per hectolitre. Source: Ministerio de Agricultura, Pesca y Alimentación, reused under Law 37/2007.",
    url: "https://www.mapa.gob.es/es/estadistica/temas/estadisticas-agrarias/economia/precios-medios-nacionales",
  },
  "mapa-infovi": {
    id: "mapa-infovi",
    name: "MAPA, INFOVI monthly declarations",
    kind: "official-bulletin",
    classification: "official",
    coverage:
      "Spain: stocks, production, entries and exits of wine declared every month by producers of 1,000 hl or more and by warehouse holders; WineTerm imports their national totals",
    cadence: "Monthly, about six weeks after the month ends",
    note: "Official statistics of the Spanish Ministry of Agriculture, Fisheries and Food, compiled from the compulsory monthly declarations of the wine sector and imported unchanged, in hectolitres. Producers making less than 1,000 hl a year do not declare monthly and are not included. Source: Ministerio de Agricultura, Pesca y Alimentación, reused under Law 37/2007.",
    url: "https://www.mapa.gob.es/es/agricultura/temas/producciones-agricolas/vitivinicultura/datos_infovi_anteriores",
  },
  "mapa-isc": {
    id: "mapa-isc",
    name: "MAPA, Informe Semanal de Coyuntura",
    kind: "official-bulletin",
    classification: "official",
    coverage:
      "Spain, weekly prices in the representative agricultural markets; WineTerm imports white and red wine without PDO/PGI by market",
    cadence: "Weekly, a few days after the week ends",
    note: "Official statistics of the Spanish Ministry of Agriculture, Fisheries and Food, the prices Spain notifies to the European Commission, imported unchanged: ex-winery bulk prices in euros per hectolitre. Source: Ministerio de Agricultura, Pesca y Alimentación, reused under Law 37/2007.",
    url: "https://www.mapa.gob.es/es/estadistica/temas/publicaciones/informe-semanal-coyuntura",
  },
  "draaf-occitanie": {
    id: "draaf-occitanie",
    name: "DRAAF Occitanie, Marché vrac des vins",
    kind: "official-bulletin",
    classification: "official",
    coverage:
      "France, Occitanie: monthly prices of bulk wine without GI and PGI wine by colour, in the departments of former Languedoc-Roussillon and of former Midi-Pyrénées",
    cadence: "Monthly, some weeks after the month ends",
    note: "Official statistics of the regional office of the French Ministry of Agriculture, from the bulk wine purchase contracts presented for visa to FranceAgriMer and the interprofessions, imported unchanged: average prices in euros per hectolitre. Source: DRAAF Occitanie, from FranceAgriMer data, reused under the Licence Ouverte / Etalab 2.0.",
    url: "https://draaf.occitanie.agriculture.gouv.fr/marche-vrac-des-vins-de-la-region-occitanie-donnees-actualisees-a345.html",
  },
  "mapa-avances": {
    id: "mapa-avances",
    name: "MAPA, crop area and production estimates",
    kind: "official-bulletin",
    classification: "official",
    coverage:
      "Spain: monthly estimates of crop areas and production, including wine grapes and, once the harvest is in, wine and must",
    cadence: "Monthly, about three months after the month estimated",
    note: "Official estimates of the Spanish Ministry of Agriculture, Fisheries and Food (Avances de superficies y producciones de cultivos). WineTerm enters the wine grape and wine figures by hand, with their date. Source: Ministerio de Agricultura, Pesca y Alimentación, reused under Law 37/2007.",
    url: "https://www.mapa.gob.es/es/estadistica/temas/estadisticas-agrarias/agricultura/avances-superficies-producciones-agricolas",
  },
  agreste: {
    id: "agreste",
    name: "Agreste, Infos rapides Viticulture",
    kind: "official-bulletin",
    classification: "official",
    coverage:
      "France: estimates of wine production by category and wine basin, from August to November",
    cadence: "Monthly through the harvest",
    note: "Harvest estimates of the statistical service of the French Ministry of Agriculture. WineTerm enters the national totals from each release by hand, with its date. Source: Agreste, Ministère de l'Agriculture et de la Souveraineté alimentaire.",
    url: "https://agreste.agriculture.gouv.fr/agreste-web/disaron/IraVit26127/detail/",
  },
  ivv: {
    id: "ivv",
    name: "IVV, harvest forecast",
    kind: "official-bulletin",
    classification: "official",
    coverage: "Portugal: wine production forecast by wine region",
    cadence: "Once a year, before the harvest",
    note: "Forecast of the Instituto da Vinha e do Vinho, Portugal's wine institute. WineTerm enters the national total and the regional changes by hand, with its date. Source: Instituto da Vinha e do Vinho, I.P.",
    url: "https://www.ivv.gov.pt/noticias/previsao-de-colheita-campanha-2026-2027/",
  },
  "uiv-assoenologi-ismea": {
    id: "uiv-assoenologi-ismea",
    name: "Unione Italiana Vini, Assoenologi and ISMEA",
    kind: "trade-reporting",
    classification: "reported",
    coverage: "Italy: the joint production forecast published before the harvest",
    cadence: "Once a year in early September; none in 2026",
    note: "Italy's usual harvest forecast comes from the trade associations Unione Italiana Vini and Assoenologi with the public agency ISMEA. For 2026 they published none, and will report results after the harvest.",
    url: "https://www.unioneitalianavini.it/approfondimenti-tematici/news/vendemmia-2026-dati-consuntivi-fine-campagna",
  },
  "icqrf-cantina-italia": {
    id: "icqrf-cantina-italia",
    name: "ICQRF, Cantina Italia",
    kind: "official-bulletin",
    classification: "official",
    coverage:
      "Italy: wine, must and new wine held at the end of each month by the operators that keep the telematic wine register; WineTerm imports the national totals by category and colour",
    cadence: "Monthly, 8 to 12 days after the month ends",
    note: "Official statistics of the Italian Ministry of Agriculture's inspectorate (ICQRF), from the telematic wine registers, which hold at least 95% of the wine kept in Italy, imported unchanged in hectolitres from each report's spreadsheet. Source: ICQRF, bollettino \"Cantina Italia\", reused with attribution under the ministry's CC BY terms.",
    url: "https://www.masaf.gov.it/flex/cm/pages/ServeBLOB.php/L/IT/IDPagina/7817",
  },
  "douane-stocks": {
    id: "douane-stocks",
    name: "DGDDI, stock declarations",
    kind: "official-bulletin",
    classification: "official",
    coverage:
      "France: wine held at 31 July by producers and by traders, as declared to customs at the end of each campaign, by category and colour; WineTerm imports the national totals",
    cadence: "Yearly, in October or November",
    note: "Official statistics of the French customs (Direction générale des douanes et droits indirects), from the end-of-campaign stock declarations, imported unchanged in hectolitres. Source: DGDDI, open data, reused under the Licence Ouverte / Open Licence 2.0.",
    url: "https://www.douane.gouv.fr/la-douane/opendata/categories/viticulture/stocks-de-vins",
  },
  "ivv-existencias": {
    id: "ivv-existencias",
    name: "IVV, declarações de existências",
    kind: "official-bulletin",
    classification: "official",
    coverage:
      "Portugal: wine and must held at 31 July, as declared to the wine institute, by category and colour; WineTerm imports the national totals",
    cadence: "Yearly; the series workbook follows the declarations by some months",
    note: "Official statistics of the Instituto da Vinha e do Vinho, from the compulsory stock declarations at 31 July, imported unchanged in hectolitres from its series workbook. Wine and must are declared together, and products with a PDO or PGI include those eligible for one. Source: Instituto da Vinha e do Vinho, I.P.",
    url: "https://www.ivv.gov.pt/estatisticas/dados-do-vinho/",
  },
  "wineterm-trade-estimate": {
    id: "wineterm-trade-estimate",
    name: "Eurostat Comext, calculated by WineTerm",
    kind: "wineterm",
    classification: "estimated",
    coverage:
      "Portugal, France and Italy: average price per hectolitre of the bulk wine each exports",
    cadence: "Monthly, after each Comext release, about two months after the month",
    note: "WineTerm divides the statistical value of each month's exports of wine in containers over 10 litres (CN 2204 29) by their volume in litres, both as Eurostat publishes them. The result averages every colour, category and destination, valued at the border. Data: Eurostat Comext, CC BY 4.0.",
    url: "https://ec.europa.eu/eurostat/web/international-trade-in-goods/database",
  },
};

export function getSource(id: SourceId): MarketSource {
  return SOURCE_REGISTRY[id];
}
