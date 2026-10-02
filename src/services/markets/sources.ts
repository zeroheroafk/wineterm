/**
 * Central typed source registry.
 *
 * Every market observation references one entry here by id. Stand-ins
 * for sources not yet connected are marked as samples; none of them is a
 * real publishing body, and no real official source is imitated. Real
 * providers are added to this registry when their data is licensed and
 * connected, and each mirrors its row in the database table sources.
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
  | "sample-official-bulletin-es"
  | "sample-official-bulletin-pt"
  | "sample-official-bulletin-fr"
  | "sample-official-bulletin-it"
  | "sample-regional-observatory"
  | "sample-coop-network"
  | "sample-trade-reports"
  | "sample-supply-stats"
  | "sample-customs"
  | "sample-harvest-network"
  | "eurostat-comext"
  | "mapa-pmn"
  | "mapa-infovi"
  | "mapa-isc"
  | "mapa-avances"
  | "draaf-occitanie"
  | "agreste"
  | "ivv"
  | "uiv-assoenologi-ismea"
  | "wineterm-trade-estimate"
  | "wineterm-desk";

export interface MarketSource {
  id: SourceId;
  /** Display name. Sample entries are labelled as such. */
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
  /** True while the entry is an illustrative development stand-in. */
  isSample: boolean;
  /** The publisher's page for the data, for real sources. */
  url?: string;
}

export const SOURCE_REGISTRY: Record<SourceId, MarketSource> = {
  "sample-official-bulletin-es": {
    id: "sample-official-bulletin-es",
    name: "Spanish official price bulletin (sample)",
    kind: "official-bulletin",
    classification: "official",
    coverage: "Spain, national and regional reference markets",
    cadence: "Weekly",
    note: "Stand-in for an official weekly bulletin. Figures are illustrative development data.",
    isSample: true,
  },
  "sample-official-bulletin-pt": {
    id: "sample-official-bulletin-pt",
    name: "Portuguese official price bulletin (sample)",
    kind: "official-bulletin",
    classification: "official",
    coverage: "Portugal, regional reference markets",
    cadence: "Weekly",
    note: "Stand-in for an official weekly bulletin. Figures are illustrative development data.",
    isSample: true,
  },
  "sample-official-bulletin-fr": {
    id: "sample-official-bulletin-fr",
    name: "French official price bulletin (sample)",
    kind: "official-bulletin",
    classification: "official",
    coverage: "France, regional contract reporting",
    cadence: "Weekly",
    note: "Stand-in for official contract price reporting. Figures are illustrative development data.",
    isSample: true,
  },
  "sample-official-bulletin-it": {
    id: "sample-official-bulletin-it",
    name: "Italian official price bulletin (sample)",
    kind: "official-bulletin",
    classification: "official",
    coverage: "Italy, chamber of commerce reference markets",
    cadence: "Weekly",
    note: "Stand-in for official reference price lists. Figures are illustrative development data.",
    isSample: true,
  },
  "sample-regional-observatory": {
    id: "sample-regional-observatory",
    name: "Regional market observatory (sample)",
    kind: "regional-observatory",
    classification: "reported",
    coverage: "Iberian producing regions",
    cadence: "Weekly to fortnightly",
    note: "Stand-in for a regional observatory reporting traded ranges. Figures are illustrative development data.",
    isSample: true,
  },
  "sample-coop-network": {
    id: "sample-coop-network",
    name: "Cooperative network reporting (sample)",
    kind: "cooperative-network",
    classification: "reported",
    coverage: "Cooperative settlement prices, Spain and Portugal",
    cadence: "Campaign settlements, updated as published",
    note: "Stand-in for cooperative settlement reporting. Figures are illustrative development data.",
    isSample: true,
  },
  "sample-trade-reports": {
    id: "sample-trade-reports",
    name: "Trade reporting network (sample)",
    kind: "trade-reporting",
    classification: "indicative",
    coverage: "Bulk trade, must and concentrate quotations",
    cadence: "Weekly",
    note: "Stand-in for broker and trade quotations. Figures are illustrative development data.",
    isSample: true,
  },
  "sample-supply-stats": {
    id: "sample-supply-stats",
    name: "National supply statistics (sample)",
    kind: "official-bulletin",
    classification: "official",
    coverage: "Production, stocks and balance items, ES, PT, FR, IT",
    cadence: "Monthly declarations and campaign balances",
    note: "Stand-in for national production and stock declarations. Figures are illustrative development data.",
    isSample: true,
  },
  "sample-customs": {
    id: "sample-customs",
    name: "Customs statistics (sample)",
    kind: "official-bulletin",
    classification: "official",
    coverage: "Wine, must and concentrate trade flows by partner",
    cadence: "Monthly, with a two-month publication lag",
    note: "Stand-in for customs trade statistics. Figures are illustrative development data.",
    isSample: true,
  },
  "sample-harvest-network": {
    id: "sample-harvest-network",
    name: "Regional harvest reporting network (sample)",
    kind: "regional-observatory",
    classification: "reported",
    coverage: "Vineyard and harvest conditions in covered regions",
    cadence: "Weekly during the campaign",
    note: "Stand-in for technician and grower reporting. Assessments are qualitative; figures are illustrative development data.",
    isSample: true,
  },
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
    isSample: false,
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
    isSample: false,
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
    isSample: false,
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
    isSample: false,
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
    isSample: false,
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
    isSample: false,
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
    isSample: false,
    url: "https://agreste.agriculture.gouv.fr/agreste-web/disaron/IraVit26107/detail/",
  },
  ivv: {
    id: "ivv",
    name: "IVV, harvest forecast",
    kind: "official-bulletin",
    classification: "official",
    coverage: "Portugal: wine production forecast by wine region",
    cadence: "Once a year, before the harvest",
    note: "Forecast of the Instituto da Vinha e do Vinho, Portugal's wine institute. WineTerm enters the national total and the regional changes by hand, with its date. Source: Instituto da Vinha e do Vinho, I.P.",
    isSample: false,
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
    isSample: false,
    url: "https://www.unioneitalianavini.it/approfondimenti-tematici/news/vendemmia-2026-dati-consuntivi-fine-campagna",
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
    isSample: false,
    url: "https://ec.europa.eu/eurostat/web/international-trade-in-goods/database",
  },
  "wineterm-desk": {
    id: "wineterm-desk",
    name: "WineTerm market desk",
    kind: "wineterm",
    classification: "estimated",
    coverage: "Cross-checked estimates where no published series exists",
    cadence: "As warranted",
    note: "Desk estimates built from multiple observations. Clearly labelled and never presented as official prices. Development figures are illustrative.",
    isSample: false,
  },
};

export function getSource(id: SourceId): MarketSource {
  return SOURCE_REGISTRY[id];
}
