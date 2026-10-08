/**
 * Industry stories: WineTerm's own headline and summary of a report
 * published elsewhere, each linked to its source. Real editorial content,
 * unlike src/fixtures; every figure is as the source reports it, and each
 * was checked against the source's page on 8 October 2026.
 */

import type { IndustryStory } from "@/services/types";

export const industryStories: IndustryStory[] = [
  // Companies
  {
    id: "univitis-recovery-plan",
    topic: "companies",
    headline: "Bordeaux cooperative Univitis halves in size under a 15-year recovery plan",
    summary:
      "The Libourne court approved the plan on 26 August. The cooperative now has 65 members farming 650 ha, down from 130 members and 1,300 ha in summer 2024, has sold a château, moved its bottling to Unidor and expects to market 50,000 hl in 2026, most of it in bulk.",
    publishedAt: "2026-10-01",
    source: {
      name: "Vitisphere",
      url: "https://www.vitisphere.com/actualite-107434-univitis-se-redresse-en-montrant-la-sortie-de-crise-des-vins-de-bordeaux-ne-produire-que-ce-que-lon-sait-vendre.html",
    },
  },
  {
    id: "raventos-codorniu-results-2025",
    topic: "companies",
    headline: "Raventós Codorníu posts record net profit of €14 million",
    summary:
      "The cava and wine group reported 2025 sales of €234 million and EBITDA of €46 million, up 5%. It sells more than 55 million bottles a year in about 60 countries; cava makes up 59% of its portfolio and still wine 39%.",
    publishedAt: "2026-09-23",
    source: {
      name: "Vinetur",
      url: "https://www.vinetur.com/20260923107628/raventos-codorniu-alcanza-su-mayor-beneficio-neto-con-14-millones-de-euros.html",
    },
  },
  {
    id: "drome-cooperatives-merger",
    topic: "companies",
    headline: "Two Drôme cooperatives move towards a merger of about 60,000 hl",
    summary:
      "La Suzienne (45,000 hl from 1,400 ha, 80% sold in bulk) and Coteaux Saint-Maurice (15,000 hl from 400 ha) signed merger protocols in June and vinified all their 2026 grapes at Suze-la-Rousse. Members vote in February 2027.",
    publishedAt: "2026-09-03",
    source: {
      name: "Vitisphere",
      url: "https://www.vitisphere.com/actualite-107258--nous-avons-ete-les-seuls-a-leur-proposer-un-projet-equilibre-ces-deux-cooperatives-dromoises-en-voie-de-fusion.html",
    },
  },
  // Deals & Investments
  {
    id: "felix-solis-rioja-brands",
    topic: "deals",
    headline: "Félix Solís Avantis buys historic Rioja brands at auction",
    summary:
      "The Valdepeñas group acquired Federico Paternina, Lagunilla and Rioja Santiago from Marqués de la Concordia, which is in liquidation. No price was disclosed.",
    publishedAt: "2026-09-03",
    source: {
      name: "AgroCLM",
      url: "https://www.agroclm.com/2026/09/03/la-bodega-felix-solis-adquiere-marcas-historicas-de-vino-de-la-rioja/",
    },
  },
  {
    id: "vintae-bodegas-riojanas",
    topic: "deals",
    headline: "Vintae takes 90% of Bodegas Riojanas under a court-approved restructuring",
    summary:
      "The deal brings €12 million of new capital and a credit line of up to €5 million. Bodegas Riojanas stays listed, and the group gains wineries in Toro and Rueda and a majority stake in one in Rías Baixas.",
    publishedAt: "2026-07-23",
    source: {
      name: "Vinetur",
      url: "https://www.vinetur.com/20260723104738/vintae-takes-control-of-bodegas-riojanas-in-court-approved-deal.html",
    },
  },
  // Regulation
  {
    id: "france-grubbing-up-deadline",
    topic: "regulation",
    headline: "France has 20,000 ha of subsidised grubbing-up left to do by 31 December",
    summary:
      "Only 7,800 of the 28,000 eligible hectares, paid at €4,000/ha, had been grubbed up by early October, for €38 million. Growers who miss their commitments lose replanting and restructuring aid for six campaigns.",
    publishedAt: "2026-10-08",
    source: {
      name: "Vitisphere",
      url: "https://www.vitisphere.com/actualite-107483-le-temps-presse-encore-20-000-ha-de-vignes-a-arracher-en-2-mois.html",
    },
  },
  {
    id: "eu-rules-national-crisis-aid",
    topic: "regulation",
    headline: "Brussels sets the tests for national crisis aid to wine",
    summary:
      "A delegated regulation in force since 17 September lets governments fund crisis distillation, green harvesting or voluntary grubbing-up once stocks, prices or sales in the category and area concerned depart clearly from their five-year averages. It implements the 2026 EU wine package.",
    publishedAt: "2026-09-16",
    source: {
      name: "Vinetur",
      url: "https://www.vinetur.com/20260916107234/european-commission-sets-rules-for-emergency-aid-to-the-wine-sector.html",
    },
  },
  {
    id: "spain-planting-rules-rd-684-2026",
    topic: "regulation",
    headline: "Spain adapts its vineyard planting rules to the EU wine package",
    summary:
      "Royal Decree 684/2026 keeps replanting authorisations valid for longer, lifts penalties for leaving them unused, sets conditions for growers who receive permanent grubbing-up aid and updates the list of authorised wine-grape varieties.",
    publishedAt: "2026-08-27",
    source: {
      name: "Boletín Oficial del Estado",
      url: "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-18205",
    },
  },
  {
    id: "germany-crisis-distillation",
    topic: "regulation",
    headline: "EU funds crisis distillation of German PDO red and rosé",
    summary:
      "The Commission made €14.16 million available to withdraw an estimated 0.24 Mhl of surplus PDO red and rosé in Württemberg and Rheinhessen, at €59/hl including transport and distillation. The alcohol may go only to industrial or energy uses, and payments must be made by 31 May 2027.",
    publishedAt: "2026-08-03",
    source: {
      name: "Official Journal of the European Union",
      url: "https://eur-lex.europa.eu/eli/reg_del/2026/1913/oj",
    },
  },
  {
    id: "us-duty-eu-wine-ten-percent",
    topic: "regulation",
    headline: "US duty on EU wine stays at 10% under Section 301",
    summary:
      "The US Trade Representative replaced the temporary surcharge with a Section 301 duty on 24 July, keeping EU goods at 10% while Australia, Chile, New Zealand, South Africa and Switzerland pay 12.5%. Italian wine's trade body warned that open investigations could still add duties.",
    publishedAt: "2026-07-25",
    source: {
      name: "Vitisphere",
      url: "https://www.vitisphere.com/actualite-107116-les-vins-francais-retombent-a-10-de-taxes-trump-cest-encourageant-mais-aussi-dans-lincertitude-de-droits-supplementaires-sources-dinquietude.html",
    },
  },
  // Technology
  {
    id: "henkell-freixenet-aroma-recovery",
    topic: "technology",
    headline: "Henkell Freixenet installs aroma recovery for alcohol-free sparkling wine",
    summary:
      "Solos's patented system, which captures the aromas lost when alcohol is removed and returns them to the wine, goes into the group's alcohol-free centre in Wiesbaden. The investment was not quantified.",
    publishedAt: "2026-10-06",
    source: {
      name: "WineNews",
      url: "https://winenews.it/it/dealcolati-il-colosso-henkell-freixenet-punta-sulle-tecnologie-di-nuova-generazione_603535/",
    },
  },
  {
    id: "puglia-agrivoltaic-vineyard",
    topic: "technology",
    headline: "Solar panels over vines more than doubled shoot growth in a Puglia trial",
    summary:
      "At Laterza, vines under panels grew shoots of 268 to 274 cm against 115.8 cm in full sun, and bunches of 164.9 g against 65.4 g, with sugar at 22.9 against 25.8 °Brix. The researchers caution that the results may not hold in wetter climates.",
    publishedAt: "2026-10-06",
    source: {
      name: "Vinetur",
      url: "https://www.vinetur.com/20261006108228/study-finds-solar-panels-more-than-doubled-shoot-growth-in-a-puglia-vineyard.html",
    },
  },
  // Packaging & Logistics
  {
    id: "ppwr-packaging-records",
    topic: "packaging-logistics",
    headline: "EU packaging rules require records for bottles bought years ago",
    summary:
      "Under the Packaging and Packaging Waste Regulation, which applies from 12 August, wineries need compliance documents, including on PFAS and heavy metals, for bottles, closures and labels already in stock. Unione Italiana Vini says rules on bottle weight and labelling still need clarifying.",
    publishedAt: "2026-10-01",
    source: {
      name: "Vinetur",
      url: "https://www.vinetur.com/20261001108140/italian-wineries-may-have-to-rebuild-old-packaging-records-under-eu-rules.html",
    },
  },
  {
    id: "amorim-tax-stamped-corks",
    topic: "packaging-logistics",
    headline: "Amorim offers corks carrying the French tax stamp",
    summary:
      "With 2Pack, approved by French customs to make 20 million a year, Amorim France burns the Marianne excise mark into the cork, so bottles need neither the tax capsule nor a separate over-cap.",
    publishedAt: "2026-09-21",
    source: {
      name: "Vitisphere",
      url: "https://www.vitisphere.com/actualite-107356-amorim-fiscalise-ses-bouchons-pour-faire-sauter-la-crd-des-bouteilles-de-vin.html",
    },
  },
  {
    id: "bag-in-box-sorting-france",
    topic: "packaging-logistics",
    headline: "France trails on sorting bag-in-box packs for recycling",
    summary:
      "A Smurfit Westrock study found consumers separate the bag from the carton 97% of the time in Germany and 93% in Belgium, but 67% in France. Wine filled 77% of the packs collected at its Antwerp site.",
    publishedAt: "2026-09-14",
    source: {
      name: "Vitisphere",
      url: "https://www.vitisphere.com/actualite-107275-la-france-lanterne-rouge-du-tri-des-bags-in-box-destines-aux-vins-huiles-laits.html",
    },
  },
];
