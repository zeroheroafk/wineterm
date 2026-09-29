# Real data sources

Candidate providers to replace the illustrative fixtures, mapped to the
WineTerm sections they would feed. Researched on 2026-09-26 through web
search, then checked against live responses on 2026-09-26 and 27. The
development environment could not reach the providers then, so those
checks ran from Supabase: Edge Functions and `pg_net` requests made from
the project's database. The Comext litres checks of 2026-09-28 and the
MAPA price checks of 2026-09-29 ran from the development environment,
which now reaches both providers.

Status legend:

- **Imported**: loaded into the database and refreshed on a schedule.
- **Validated**: seen in a live response; format and fields known.
- **Confirmed**: coverage and access described in the provider's own
  documentation or pages, not yet seen in a live response.
- **To validate**: plausible from the research, not yet checked.
- **Licence to confirm**: reuse terms not yet read on the provider's site.
- **Not usable**: checked, and not a source for WineTerm as things stand.
- **Gap**: no public, reusable series found.

## Recommended order

1. **Trade: Eurostat Comext. Imported.** Monthly trade in heading 2204
   for Spain, Portugal, France and Italy since January 2021, in euros,
   net mass and litres, refreshed every month. Feeds `/trade` and the
   homepage trade panel.
2. **Bulk wine prices for ES, FR and IT: EU Agri-food Data Portal.**
   Validated, but the newest data seen is from the 2024/25 campaign, so
   it may lag too much for a weekly market view. Portugal is not
   covered.
3. **Spanish bulk wine prices: MAPA. Imported.** Weekly national average
   prices of white and red wine without PDO/PGI since January 2019,
   refreshed twice a week. Feeds the Markets pages, the homepage key prices
   and the market strip. The monthly INFOVI declarations (supply) are
   validated, not yet imported; commercial reuse of both is allowed under
   Law 37/2007.
4. **Portugal: IVV.** Monthly trade synthesis in Excel validated; the
   production files are password-protected.
5. **Harvest: national forecasts** (Agreste, IVV, Spanish regional and
   cooperative estimates) plus the OIV world outlook.
6. **Gaps to cover with partners or desk estimates:** grape prices,
   must and concentrate prices, and Portuguese bulk wine prices.

## Markets: bulk wine prices

### EU Agri-food Data Portal, wine prices (DG AGRI)

- **Covers:** prices of different classes of wine for France, Germany,
  Italy and Spain. **Portugal is not included.** Validated.
  - Spain has regional series: Ciudad Real, Toledo, Albacete, Badajoz
    and Valencia, plus Rioja DOP and Rueda DOP.
  - France has 8 series.
  - The newest data seen is from the 2024/25 campaign; whether 2025/26
    is published is not confirmed. There are gaps in 2020/21.
- **Access:** `GET https://api.tech.ec.europa.eu/agrifood/api/wine/prices`
  with `memberStateCodes` (e.g. `ES,FR`), `weeks` (week 1 is the first
  week of August) or `beginDate`/`endDate` (`dd/mm/yyyy`). Validated.
  - Send `Accept-Encoding: identity`: compressed responses break off
    before the body is read.
  - Rows carry `memberStateCode`, `beginDate`, `endDate`, `weekNumber`,
    `description`, `unit` and `price`. `price` is a string such as
    `"€47.78"`, the unit reads `"Euro / HL."` and dates are
    `dd/mm/yyyy`, so each field needs parsing.
- **Licence:** European Commission reuse policy. **Licence to confirm**
  on the portal.
- **Feeds:** `market_series` and `market_observations` for ES, FR and IT
  reference wines, source classification `official`, if the lag is
  acceptable.
- Docs: [Wine API](https://agridata.ec.europa.eu/extensions/API_Documentation/wine.html),
  [wine prices dashboard](https://agridata.ec.europa.eu/extensions/DashboardWine/WinePrice.html).

### Spain: MAPA weekly wine prices. Imported

- **Covers:** national average prices of white wine without PDO/PGI and
  red wine without PDO/PGI of 12 points of colour, ex-winery ("salida
  bodega"), in EUR/hl, weekly since January 2019.
- **In the database:** `public.market_observations`, series
  `ES-NAT-WHT-NGI` and `ES-NAT-RED-NGI` (`public.market_series`), source
  `mapa-pmn`. 806 weekly prices at the first load (weeks 2019-01 to
  2026-38).
- **Access:** "Precios Medios Nacionales", one xlsx workbook per year on
  the ministry's statistics page, linked as "Precios Medios Nacionales
  2026". The current year's file is replaced weekly and its name changes
  (`precios_medios_nacionales_2026-s36.xlsx` held weeks up to 38), so the
  import looks the link up on each run. The sheet has a header row
  "Semana 1" to "Semana 52/53" (ISO weeks), a row of date ranges typed by
  hand (with typos such as "25/02-3-03"), and the wine rows "Vino blanco
  sin DOP/IGP (€/hectolitro)" and "Vino tinto sin DOP/IGP, 12 p. color
  (€/hectolitro)"; a few values are text with a decimal comma. The
  `Last-Modified` header dates the upload: the 2026 workbook with week 38
  was uploaded on Thursday 24 September 2026, four days after the week
  ended. Files for 2019 to 2024 all carry 9 June 2025, a re-upload.
  Validated.
- **Checks:** the week 38/2026 bulletin (14 to 20 September) gives white
  44.12 and red 49.48 EUR/hl, up 3.93% and 3.38% on the week and down
  10.51% and up 10.50% on the year; the stored series give the same
  prices and the same changes. Every workbook from 2019 reads without
  error, one price per series and ISO week, no week twice.
- **Weekly PDF bulletins:** the same prices with commentary, whose text
  extracts cleanly with `unpdf`. Not needed while the workbook is
  published.
- **Refresh:** `pg_cron` job `import-mapa-prices`, Tuesday and Friday at
  06:17 UTC, re-imports the current and the previous year. See
  `README.md`, section Database.
- **Licence:** Law 37/2007 general conditions allow commercial and
  non-commercial reuse, citing the source and the date of the data.
  Confirmed.
- Links: [national average prices](https://www.mapa.gob.es/es/estadistica/temas/estadisticas-agrarias/economia/precios-medios-nacionales),
  [weekly wine price bulletins](https://www.mapa.gob.es/es/agricultura/temas/producciones-agricolas/vitivinicultura/boletines_semanales_precio_vino),
  [reuse conditions](https://datos.gob.es/en/documentacion/aviso-legal-tipo-para-la-reutilizacion-de-la-informacion-del-sector-publico).

### Spain: Ciudad Real market (Cámara de Comercio)

- **Not usable.** The chamber's market price pages carry no wine
  quotations. Castilla-La Mancha prices come from the Agri-food regional
  series instead.
- Link: [previous weeks](https://www.camaracr.org/servicios/lonja/informacion-de-precios/precios-semanas-anteriores).

### France: FranceAgriMer VISIONet

- **Covers:** average bulk wine purchase prices, historical series in
  Excel and weekly bulk market summaries. Confirmed from the site.
- **Not usable automatically:** requests from Supabase end in a redirect
  loop, so VISIONet cannot be read by a scheduled job as it stands.
- **Licence:** **to confirm**.
- Links: [VISIONet](https://visionet.franceagrimer.fr/),
  [wine quotations](https://www.franceagrimer.fr/filieres-Vin-et-cidre/Vin/Eclairer/Outils/VISIO-Donnees-en-ligne/Cotations).

### Italy: ISMEA Mercati

- **Covers:** prices at origin, weekly by product and variety, monthly
  for DOC/DOCG wines. Confirmed.
- **Not usable without an agreement:** ISMEA states its material is its
  property and protected by copyright, so commercial use needs a
  licence. Italian prices come from the Agri-food portal meanwhile.
- Link: [wine prices](https://www.ismeamercati.it/flex/cm/pages/ServeBLOB.php/L/IT/IDPagina/954).

### Portugal: IVV and SIMA

- **IVV** publishes sectoral price reports for still wines; format and
  frequency **to validate**. Link: [wine data](https://www.ivv.gov.pt/estatisticas/dados-do-vinho/).
- **SIMA (GPP): not usable.** Its production market quotations do not
  include wine. Link: [regsima](https://regsima.gpp.pt/regsima/consulta/mercados?tm=8).
- Portuguese bulk wine prices are therefore a **gap** until the IVV
  reports are checked or a partner reports prices.

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
  and yield per member state and quality category since 1997/98, on the
  dashboard. Confirmed.
- **Access:** the wine API has no production endpoint, so these figures
  are only on the dashboard. Validated.
- Link: [production and opening stocks](https://agridata.ec.europa.eu/extensions/DashboardWine/WineProduction.html).

### Spain: MAPA INFOVI and wine balance

- **Covers:** monthly declarations by producers and warehouses: opening
  stocks, grape intake and production, entries, exits and closing stocks,
  by autonomous community, colour and operator type. Producers under
  1,000 hl declare only in December and August. Confirmed. Annual wine
  balance published separately.
- **Access:** a monthly Excel workbook with 13 sheets, split by
  autonomous community; it reads with SheetJS in an Edge Function.
  Validated.
- **Licence:** Law 37/2007, commercial reuse citing the source.
- **Feeds:** `/supply` for Spain.
- Links: [INFOVI 2024](https://www.mapa.gob.es/es/agricultura/temas/producciones-agricolas/vitivinicultura/infovi_2024),
  [wine balance](https://www.mapa.gob.es/es/estadistica/temas/estadisticas-agrarias/agricultura/balance-del-vino).

### Portugal: IVV

- **Covers:** harvest and production declarations, declared stocks,
  monthly exports and shipments (including bulk). Confirmed.
- **Access:** the monthly "Síntese" workbook (xlsx) reads cleanly but
  is a trade report. The production and stock workbooks (xls) are
  password-protected, so they cannot be imported as published.
  Validated.
- **Licence:** **to confirm**.
- Link: [wine data](https://www.ivv.gov.pt/estatisticas/dados-do-vinho/).

## Trade

### Eurostat Comext, dataset DS-045409. Imported

- **Covers:** monthly EU trade by reporter, partner, CN product and flow.
  For WineTerm: 2204 (wine and grape must), 2204 10 (sparkling),
  2204 21 (containers up to 2 l), 2204 22 (2 to 10 l), 2204 29 (over
  10 l, bulk) and 2204 30 (other grape must).
- **In the database:** `public.trade_flows`, one row per reporter,
  partner, product, flow and month, for Spain, Portugal, France and Italy,
  exports and imports, from January 2021. Partners are ISO country codes
  plus `WORLD`, `EXT_EU27_2020` and `INT_EU27_2020`. About 178,000 rows
  at the first load (July 2026 data, published on 2026-09-15).
- **Quantities:** the 4 and 6-digit codes carry `VALUE_IN_EUROS` and
  `QUANTITY_IN_100KG` only, stored as euros and kilograms of net mass.
  Litres (`SUPPLEMENTARY_QUANTITY`) exist only at CN8 level. The import
  asks for every CN8 code of each subheading in Comext's CN codelist
  (180 codes, current and discontinued) and stores their litres, summed,
  in `quantity_l` on the subheading and heading rows, but only where the
  CN8 values add up exactly to the row's value; otherwise the litres stay
  null and the run's note counts the rows. Mass is no substitute for
  volume: in France's 2025 exports it runs from 1.01 kg per litre (bulk,
  bottles up to 2 l) to 1.05 (sparkling) and about 1.2 (2 to 10 l
  containers, grape must).
- **Access:** JSON-stat 2.0 from
  `https://ec.europa.eu/eurostat/api/comext/dissemination/statistics/1.0/data/DS-045409`,
  filtered by `reporter`, `flow` (1 import, 2 export), `product` and
  `indicators`, with `sinceTimePeriod`/`untilTimePeriod`. Months not yet
  published come back empty, and a future year as an empty dataset.
  Large requests are deferred with `413 ASYNCHRONOUS_RESPONSE`; a year
  of 36 CN8 codes with two indicators comes back directly, in up to
  about 30 seconds the first time and at once when repeated.
- **Checks:** Portugal's exports of 2204 to the United States in January
  2026 read EUR 5,611,515 and 1,440,938 kg, as on Eurostat. For every
  reporter and flow in 2025, the five subheadings add up exactly to
  2204, and the partner countries add up exactly to `WORLD`. For every
  reporter, flow, partner, subheading and month of 2025, the CN8 values
  add up exactly to the subheading's value and every CN8 value has its
  litres, so no row lacks litres; 2021 checks the same for Italy's
  imports. Stored litres match a separate sum of the CN8 detail, for
  example Portugal's 2025 exports of 2204: 339,194,243 litres.
- **Refresh:** `pg_cron` job `import-comext-monthly` on the 20th of each
  month re-imports the current and the previous year, which picks up
  Eurostat's revisions. See `README.md`, section Database.
- **Licence:** Eurostat reuse policy, CC BY 4.0; commercial reuse
  allowed citing the source. Confirmed.
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

1. Build the INFOVI import (Excel) for Spanish supply.
2. Decide whether the Agri-food prices are recent enough to import.
3. Read the licence pages still marked **to confirm** (Agri-food portal,
   IVV, FranceAgriMer) and record the attribution text in `sources`
   before importing from them.
