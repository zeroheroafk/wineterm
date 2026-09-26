# Real data sources

Candidate providers to replace the illustrative fixtures, mapped to the
WineTerm sections they would feed. Researched on 2026-09-26 through web
search. The development environment's network policy blocked direct
calls to every provider, so endpoints, units and licences marked
**to validate** still need a live check before any import is built.

Status legend:

- **Confirmed**: coverage and access described in the provider's own
  documentation or pages.
- **To validate**: plausible from the research, not yet seen in a live
  response.
- **Licence to confirm**: reuse terms not yet read on the provider's site.
- **Gap**: no public, reusable series found.

## Recommended order

1. **Trade: Eurostat Comext.** Monthly CN8 trade for heading 2204, open
   API, commercial reuse allowed with attribution. Feeds `/trade` almost
   completely.
2. **Bulk wine prices for ES, FR and IT: EU Agri-food Data Portal.**
   Weekly national prices since 2009 through a documented API. Portugal
   is not covered, so Portuguese prices need a national source (step 4).
3. **Spanish supply: MAPA INFOVI and wine balance.** Monthly production
   and stocks by region and colour; commercial reuse allowed under Law
   37/2007.
4. **Portugal: IVV.** Production, stocks, monthly exports and price
   reports; reuse terms to confirm.
5. **Harvest: national forecasts** (Agreste, IVV, Spanish regional and
   cooperative estimates) plus the OIV world outlook.
6. **Gaps to cover with partners or desk estimates:** grape prices and
   must/concentrate prices.

## Markets: bulk wine prices

### EU Agri-food Data Portal, wine prices (DG AGRI)

- **Covers:** prices of different classes of wine for France, Germany,
  Italy and Spain; some series back to 2009. **Portugal is not
  included.** Confirmed.
- **Access:** REST API. `GET /api/wine/prices` with optional
  `memberStateCodes` (e.g. `ES,FR`), `descriptions`, `weeks` (week 1 is
  the first week of August) and `beginDate`/`endDate` (`dd/mm/yyyy`).
  Response rows carry `memberStateCode`, `memberStateName`, `beginDate`,
  `endDate`, `weekNumber`, `description`, `unit` and `price`. Confirmed
  from the API documentation. API base reported as
  `https://api.tech.ec.europa.eu/agrifood`; the full path is **to
  validate**.
- **Licence:** European Commission reuse policy. **Licence to confirm**
  on the portal.
- **Feeds:** `market_series` and `market_observations` for ES, FR and IT
  reference wines, source classification `official`.
- Docs: [Wine API](https://agridata.ec.europa.eu/extensions/API_Documentation/wine.html),
  [wine prices dashboard](https://agridata.ec.europa.eu/extensions/DashboardWine/WinePrice.html).

### Spain: MAPA weekly wine prices

- **Covers:** weekly wine price bulletins, and national average prices
  for wine without PDO/PGI (white, red) in EUR/hl, published in the
  weekly market report. Confirmed.
- **Access:** PDF bulletins and the weekly "Informe semanal de
  coyuntura". Needs PDF parsing unless an Excel version exists (**to
  validate**).
- **Licence:** Law 37/2007 general conditions allow commercial and
  non-commercial reuse with attribution. Confirmed.
- Links: [weekly wine price bulletins](https://www.mapa.gob.es/es/agricultura/temas/producciones-agricolas/vitivinicultura/boletines_semanales_precio_vino),
  [national average prices](https://mapa.gob.es/es/estadistica/temas/estadisticas-agrarias/economia/precios-medios-nacionales/default.aspx),
  [reuse conditions](https://datos.gob.es/en/documentacion/aviso-legal-tipo-para-la-reutilizacion-de-la-informacion-del-sector-publico).

### Spain: Ciudad Real market (Cámara de Comercio)

- **Covers:** weekly bulk wine quotations for La Mancha in EUR per
  hectodegree, with past weeks archived. Confirmed that the archive
  exists; current format **to validate**.
- **Licence:** **to confirm**.
- **Feeds:** the Castilla-La Mancha series (`ES-CLM-*`), which today are
  fixtures.
- Link: [previous weeks](https://www.camaracr.org/servicios/lonja/informacion-de-precios/precios-semanas-anteriores).

### France: FranceAgriMer VISIONet

- **Covers:** average bulk wine purchase prices reported to the
  Commission; historical price series in Excel; weekly bulk market
  summaries with contract volumes and average prices (PDF, rolling five
  weeks). Confirmed.
- **Licence:** **to confirm** (French public data is usually under the
  open licence, but this has not been checked).
- Links: [VISIONet](https://visionet.franceagrimer.fr/),
  [wine quotations](https://www.franceagrimer.fr/filieres-Vin-et-cidre/Vin/Eclairer/Outils/VISIO-Donnees-en-ligne/Cotations).

### Italy: ISMEA Mercati

- **Covers:** prices at origin, weekly by product, by variety and for IGT
  wines, monthly for DOC/DOCG; Excel downloads. Confirmed.
- **Licence:** ISMEA states its material is its property and protected
  by copyright. **Commercial use needs an agreement.** Until then, use
  the Agri-food portal for Italian prices.
- Link: [wine prices](https://www.ismeamercati.it/flex/cm/pages/ServeBLOB.php/L/IT/IDPagina/954).

### Portugal: IVV and SIMA

- **IVV** publishes sectoral price reports for still wines. Format and
  frequency **to validate**. Link: [wine data](https://www.ivv.gov.pt/estatisticas/dados-do-vinho/).
- **SIMA (GPP)** publishes weekly minimum, maximum and most frequent
  prices from production markets. Whether wine is covered is **to
  validate**. Link: [regsima](https://regsima.gpp.pt/regsima/consulta/mercados?tm=8).
- **Licences:** **to confirm**.

## Markets: grapes, must and concentrates

- **Grapes: gap.** Prices are set in contracts or cooperative
  settlements; the public trace is wineries' price sheets reported in
  the press (for example Valdepeñas 2026: Airén with DO at about EUR
  0.023 per degree, roughly EUR 0.28/kg at 12 degrees). No official
  series was found. Options: desk collection labelled `reported`, or
  partnerships with cooperatives.
- **Must and concentrates: gap.** No public weekly series found for
  rectified concentrated must. Italian chamber of commerce price lists
  (for example [Bologna](https://www.bo.camcom.gov.it/it/borsa-merci/listino-settimanale-dei-prezzi-rilevati-il-gioved%C3%AC))
  quote wine products weekly and may include musts (**to validate**,
  licence to confirm). Otherwise this needs licensed broker data.

## Crop & Supply

### EU Agri-food Data Portal, production and opening stocks

- **Covers:** annual wine production, opening stocks, availability, area
  and yield per member state and quality category since 1997/98.
  Confirmed on the dashboard; API endpoint **to validate**.
- **Feeds:** `/supply` balance sheets for ES, PT, FR and IT from one
  consistent source.
- Link: [production and opening stocks](https://agridata.ec.europa.eu/extensions/DashboardWine/WineProduction.html).

### Spain: MAPA INFOVI and wine balance

- **Covers:** monthly declarations by producers and warehouses: opening
  stocks, grape intake and production, entries, exits and closing stocks,
  by autonomous community, colour and operator type. Producers under
  1,000 hl declare only in December and August. Confirmed. Annual wine
  balance published separately.
- **Access:** monthly PDF reports (Excel **to validate**).
- **Licence:** Law 37/2007, commercial reuse with attribution.
- Links: [INFOVI 2024](https://www.mapa.gob.es/es/agricultura/temas/producciones-agricolas/vitivinicultura/infovi_2024),
  [wine balance](https://www.mapa.gob.es/es/estadistica/temas/estadisticas-agrarias/agricultura/balance-del-vino).

### Portugal: IVV

- **Covers:** harvest and production declarations, declared stocks,
  monthly exports and shipments (including bulk). Confirmed.
- Link: [wine data](https://www.ivv.gov.pt/estatisticas/dados-do-vinho/).

## Trade

### Eurostat Comext, dataset DS-045409

- **Covers:** monthly EU trade by reporter, partner, CN8 product and
  flow. For WineTerm: 2204 10 (sparkling), 2204 21 (containers up to
  2 l), 2204 22 (2 to 10 l), 2204 29 (over 10 l, bulk) and 2204 30
  (other grape must). Confirmed.
- **Access:** SDMX/JSON API at
  `https://ec.europa.eu/eurostat/api/comext/dissemination`. Full-dataset
  downloads are disabled, so every query must filter (reporter, partner,
  product, flow, period). Indicators include `VALUE_IN_EUROS` and
  quantities; the supplementary unit for wine is **to validate**.
- **Licence:** Eurostat reuse policy, CC BY 4.0; commercial reuse
  allowed with attribution, except data Eurostat attributes to other
  sources. Confirmed.
- Links: [Comext API guide](https://ec.europa.eu/eurostat/web/user-guides/data-browser/api-data-access/api-getting-started/comext-database),
  [Eurostat licence](https://ec.europa.eu/eurostat/help/copyright-notice).

## Harvest

- **France, Agreste:** harvest forecasts in "Infos rapides Viticulture"
  with downloadable figure data. The 1 September 2026 estimate is about
  34 Mhl, 6% below 2025 and 17% below the 2021 to 2025 average.
  Link: [2026 forecast data](https://agreste.agriculture.gouv.fr/agreste-web/download/publication/publie/IraVit26107/2026_107inforapviticulture.pdf).
- **Portugal, IVV:** 2026/27 forecast of 6.7 Mhl, up 12% and 4% below
  the five-campaign average, with regional detail (Douro +25%, Alentejo,
  Setúbal and Trás-os-Montes +15%). 2025/26 closed at 5.9 Mhl.
  Link: [forecast 2026/27](https://www.ivv.gov.pt/noticias/previsao-de-colheita-campanha-2026-2027/).
- **Spain:** no single official early forecast was found; cooperative
  estimates (31.5 Mhl of wine and must for 2025/26) and regional
  interprofession figures (Castilla-La Mancha around 19 Mhl for 2026).
  Link: [cooperatives' estimate](https://www.agro-alimentarias.coop/docs_download/la-vendimia-2025-2026-se-estima-en-315-millones-de-hectolitros).
- **Italy:** Assoenologi, ISMEA and UIV suspended the 2026 forecast;
  final figures are due at the end of the harvest, around mid-November.
  2025 production reported to the Commission: 44.4 Mhl.
  Link: [announcement](https://www.unioneitalianavini.it/approfondimenti-tematici/news/vendemmia-2026-dati-consuntivi-fine-campagna).

## World context

- **OIV:** free and unrestricted access to its statistics database
  (area, production, consumption and trade); annual state of the sector
  in April and a first world production estimate in October or
  November. Link: [OIV statistics](https://www.oiv.int/what-we-do/statistics).

## Next steps

1. Allow the providers' hosts in the development environment (listed
   below) and validate each **to validate** item with a live call.
2. Read each provider's licence page and record the attribution text in
   `sources` before importing anything.
3. Build the first import (Comext, then Agri-food prices) as a scheduled
   job that writes with the Supabase secret key, never the publishable
   one.

Hosts used by the recommended sources: `ec.europa.eu`,
`api.tech.ec.europa.eu`, `agridata.ec.europa.eu`, `www.mapa.gob.es`,
`www.ivv.gov.pt`, `regsima.gpp.pt`, `visionet.franceagrimer.fr`,
`agreste.agriculture.gouv.fr`, `www.oiv.int`, `www.camaracr.org`.
