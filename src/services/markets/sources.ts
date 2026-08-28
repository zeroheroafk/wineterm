/**
 * Central typed source registry.
 *
 * Every market observation references one entry here by id. During
 * development all entries are explicitly marked as samples; none of them
 * is a real publishing body, and no real official source is imitated.
 * Real providers are added to this registry when their data is licensed
 * and connected.
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
