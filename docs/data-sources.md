# Real data sources

Candidate providers to replace the illustrative fixtures, mapped to the
WineTerm sections they would feed. Researched on 2026-09-26 through web
search, then checked against live responses on 2026-09-26 and 27. The
development environment could not reach the providers then, so those
checks ran from Supabase: Edge Functions and `pg_net` requests made from
the project's database. The Comext litres checks of 2026-09-28 and the
MAPA price and INFOVI checks of 2026-09-29 and 30 ran from the
development environment, which now reaches both providers.

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
   Validated, but on 30 September 2026 its newest prices were about a
   year old, too late for a weekly market view. Portugal is not covered.
3. **Spanish bulk wine prices and stocks: MAPA. Imported.** Weekly
   national average prices of white and red wine without PDO/PGI since
   January 2019, refreshed twice a week, feed the Markets pages, the
   homepage key prices and the market strip. The monthly INFOVI
   declarations since January 2018, refreshed weekly, feed Spain's
   declared balance on `/supply`, its stocks on `/supply/stocks` and the
   wine made since 1 August on `/supply/production`. Commercial reuse of
   both is allowed under Law 37/2007.
4. **Portugal: IVV.** Monthly trade synthesis in Excel validated; the
   production files are password-protected.
5. **Harvest: official national forecasts. On `/harvest`.** Agreste,
   IVV and MAPA's crop estimates, entered by hand from each release; the
   OIV world outlook still to add.
6. **Gaps to cover with partners or desk estimates:** grape prices,
   must and concentrate prices, and Portuguese bulk wine prices.
7. **Bulk price estimates from trade: WineTerm. Computed.** Until
   reusable current prices exist for Portugal, France and Italy, the
   monthly average price of each country's bulk wine exports, from the
   Comext figures, is its national bulk price. See "WineTerm estimates
   from Comext" below.

## Markets: bulk wine prices

### EU Agri-food Data Portal, wine prices (DG AGRI)

- **Covers:** prices of different classes of wine for France, Germany,
  Italy and Spain. **Portugal is not included.** Validated.
  - Spain has regional series: Ciudad Real, Toledo, Albacete, Badajoz
    and Valencia, plus Rioja DOP and Rueda DOP.
  - France has 8 series.
  - On 30 September 2026 the newest week ended on 6 July 2025 for Spain
    and Italy and on 2 November 2025 for France. There are gaps in
    2020/21.
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

### Spain: MAPA representative wine markets

- **Covers:** weekly ex-winery bulk prices of white and red wine without
  PDO/PGI in EUR/hl at Albacete, Ciudad Real, Cuenca and Toledo, and red
  at Murcia: the prices Spain notifies to the Commission under Regulation
  (EU) 2017/1185, and the source of the Agri-food portal's regional
  series. Validated on 2 October 2026 in table 2.2 of the "Informe
  Semanal de Coyuntura" for week 38/2026 (14 to 20 September): Ciudad
  Real white 40.61 and red 48.78 EUR/hl.
- **Access:** one PDF report a week on the ministry's site, under a
  hashed file name; no workbook found yet. **To validate:** a link that
  can be found each week, and how far back the reports go.
- **Licence:** Law 37/2007, as the other MAPA statistics.
- **Feeds:** would replace the Castilla-La Mancha samples with official
  provincial prices.

### Spain: Ciudad Real market (Cámara de Comercio)

- **Not usable.** The chamber's market price pages carry no wine
  quotations. Castilla-La Mancha prices come from the Agri-food regional
  series instead.
- Link: [previous weeks](https://www.camaracr.org/servicios/lonja/informacion-de-precios/precios-semanas-anteriores).

### WineTerm estimates from Comext. Computed

- **Covers:** the national bulk wine price of Portugal, France and Italy
  (`PT-NAT-BULK`, `FR-NAT-BULK`, `IT-NAT-BULK`): the monthly average price
  of the country's exports of wine in containers over 10 litres (CN 2204
  29), value divided by litres, in EUR/hl, from January 2021. One price
  per country: the import averages, mostly Spanish wine (99% of
  Portugal's, 77% of France's and 79% of Italy's since July 2025), and an
  export average for Spain, whose price is MAPA's, were computed first
  and are dropped by the migration `one_bulk_price_per_country`.
- **In the database:** source `wineterm-trade-estimate` (shown as
  "Eurostat Comext, calculated by WineTerm"), classification `estimated`;
  observations with status `estimate`, dated to the last day of the
  month, computed by `private.refresh_trade_price_estimates()` from
  `trade_flows` (partner `WORLD`). The price tables show no status for
  real prices; the methodology page says which are official and which are
  estimates.
- **Checks:** the same average for Spain followed MAPA's national
  ex-winery price of white and red wine without PDO/PGI with a
  correlation of 0.96 over the months since 2021, 6 to 17% above it by
  year. Export volumes since August 2024 average 4.5 million litres a
  month for Portugal, 10 for France and 28 for Italy; month to month the
  averages vary by 9%, 10.5% and 6.5%.
- **Limits:** averages over every colour, category and destination,
  valued at the border, not quoted prices; French and Italian exports
  carry much PDO and PGI wine, so they sit far above the price of wine
  without GI.
- **Refresh:** after each Comext import; see `README.md`, section
  Database.

### France: DRAAF Occitanie, bulk wine market follow-up

- **Covers:** a monthly report of the regional office of the Ministry of
  Agriculture on the Occitanie bulk market, with average prices of
  registered purchase contracts by category (without GI, PGI, PDO) and
  colour. **To validate:** neither the reports nor the pages could be
  read from the development environment on 2 October 2026 (connection
  reset, and 503 through a fetch service), so the figures and the
  licence are unchecked. French state services usually publish under the
  Licence Ouverte; to confirm.
- Links: [monthly follow-up, 48 weeks to 1 July 2026](https://draaf.occitanie.agriculture.gouv.fr/suivi-mensuel-du-marche-des-vins-en-vrac-48-semaines-1er-juillet-2026-11-sur-12-a10100.html).

### Italy: chamber of commerce price lists

- **Covers:** weekly wholesale lists with bulk wine in EUR per
  hectolitre-degree, must and RCGM per degree Brix, and grapes in EUR
  per 100 kg during the harvest. Bologna's list n. 32 of 6 August 2026,
  read on 2 October 2026: generic white 10 to 12% vol 4.50 to 4.90,
  red 4.10 to 4.60 EUR/hl-degree; RCGM 4.80 to 5.00 per degree Brix.
- **Not usable without permission:** Bologna and Alessandria-Asti
  publish under CC BY-NC-ND, which excludes commercial use. Ask each
  chamber for written permission.
- Link: [Bologna weekly lists](https://www.bo.camcom.gov.it/it/borsa-merci-e-rilevazione-prezzi/listino-settimanale-dei-prezzi-rilevati-il-giovedi).

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

### Spain: MAPA INFOVI. Imported

- **Covers:** monthly declarations by producers of 1,000 hl or more and
  by warehouse holders: opening stocks, grape intake and production,
  entries, exits and closing stocks, by autonomous community, colour,
  presentation and operator type. Producers under 1,000 hl do not declare
  monthly; the annual declaration at 31 July counts them (1.47 Mhl of wine
  at 31 July 2024). Annual wine balance published separately.
- **In the database:** `public.supply_figures`, source `mapa-infovi`,
  national totals only: wine stocks at the end of each month by colour
  (red and rosé, white) and presentation (bulk, packaged), stocks of must
  that is not concentrated by colour, and wine made from 1 August to the
  end of the month by colour. Since 30 September 2026 also the wine that
  came in during each month from other operators in Spain, from the rest
  of the EU and from third countries (tables 3.1 and 3.2), and that went
  out within Spain, to distilleries, to vinegar makers, to the rest of the
  EU and to third countries (table 4.0) or for the declarants' own
  operations (table 4.6, published since July 2021 and missing for March
  2022), as totals with colour and presentation `all`. 1,700 figures,
  January 2018 to July 2026.
- **Access:** one xlsx workbook per month with 12 or 13 sheets, listed on
  one page per year: `vitivinicultura/infovi_2018` to `infovi_2024`, then
  `vitivinicultura/datos_infovi_anteriores/infovi_2025` and `infovi_2026`;
  the archive page links the past years and the sector page the current
  one. Links read "Datos INFOVI julio 2018", "Informe INFOVI junio 2026"
  or "INFOVI julio 2026"; file names carry typos
  (`informe-infovi-marzo-2026-.xlsx`), so the import matches labels. The
  July 2026 workbook was uploaded on 11 September 2026. Validated.
- **Layout quirks, all handled:** tables sometimes start in column E
  instead of A (December 2021, August 2018); table 2.2 titles are often
  left over from earlier months ("a 31 de julio 2023" in August 2022);
  table 5 lacks the must total in March and April 2019, and table 4.0 the
  grand total of exits in March 2019; August workbooks up to 2019 have no
  table 2.2, and their table 2.1 covers the same period; November 2018
  carries tables 3 and 4 twice, identical; sheet names and titles vary
  ("3,1. ENTRADAS España", "cuadro 4. salidas" or "cuadro 4.0 salidas",
  "septiembre - 2023"). The import anchors on the TOTAL row, checks each
  table's title and the headings above its totals and that the parts add
  up to the printed totals, and dates each workbook by table 5's title.
- **September 2018 is inconsistent:** its summary of exits (table 4.0)
  disagrees with the detailed exit tables 4.1 to 4.4, and one figure,
  45,803 hl, turns up in unrelated cells of tables 3.2 and 4.0. The import
  keeps that month's stocks and production and skips its entries and
  exits, so Spain's balance starts with the 2019/20 campaign.
- **Checks:** all 103 monthly workbooks from January 2018 read without
  error. Wine stocks at 31 July 2026 read 28,368,423 hl and must
  2,065,537 hl, as in the ministry's July 2026 report (PDF). At 31 July
  2024 the monthly figure, 29,592,291 hl, is within 0.1% of producers of
  1,000 hl or more plus warehouse holders in the annual stock declaration
  (29,622,887 hl). July 2026's entries and exits match the report's
  tables 3.1, 3.2, 4.0 and 4.6 to the hectolitre (exits 4,230,678 hl).
  Opening stocks plus wine made plus entries minus exits land within 0.2%
  of the declared closing stocks in most months since July 2021, and
  within 0.9% in every one (July 2026: 1,485 hl apart); before, when own
  operations were not yet declared, the declared stocks typically come
  out 0.3 to 0.6% lower. Over a campaign the declared closing stocks come
  out 1.2 to 1.7 Mhl below the computed ones since 2022/23 (losses, uses
  not declared as exits, later revisions). Exits to other countries run
  0.5 to 1.5 Mhl a campaign below the customs exports of wine, since
  other traders export too, as the ministry notes.
- **Refresh:** `pg_cron` job `import-infovi`, Mondays at 06:41 UTC,
  re-imports the current year, and the previous one until mid-March. See
  `README.md`, section Database.
- **Licence:** Law 37/2007, commercial reuse citing the source.
- **Feeds:** Spain's stocks on `/supply/stocks`; on `/supply/production`
  the wine made since 1 August against the same month of the previous
  campaign, with the totals of completed campaigns. That is wine only:
  must is not in table 2.2, so the totals sit below Spain's headline
  production of wine and must. On `/supply`, Spain's declared balance:
  the latest campaign to date against the one before to the same month,
  and the completed campaigns from 2019/20.
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

The official forecasts below feed the country forecasts on `/harvest`.
They come as PDF releases and web pages, so they are entered by hand in
`src/services/harvest/official.ts`, with each release's date, and updated
when a new release appears. Checked on 30 September 2026.

- **France, Agreste:** "Infos rapides Viticulture", monthly from August
  to November, with downloadable figure data. Issue 2026-107, published
  7 September 2026: 33,864 thousand hl estimated at 1 September, 6% below
  2025 (35,894) and 17% below the 2021 to 2025 average (40,666). All
  wine, including wine for brandy. The site's server sends no
  intermediate certificate, so `curl` needs the HARICA "GEANT TLS RSA 1"
  certificate added to its CA file.
  Links: [issue 2026-107](https://agreste.agriculture.gouv.fr/agreste-web/disaron/IraVit26107/detail/),
  [PDF](https://agreste.agriculture.gouv.fr/agreste-web/download/publication/publie/IraVit26107/2026_107inforapviticulture.pdf).
- **Portugal, IVV:** 2026/27 forecast published 3 August 2026: 6,666
  thousand hl, 12% above 2025/26 (5,956) and 4% below the five-campaign
  average (6,926), with a table by region (Douro +25%; Alentejo,
  Península de Setúbal and Trás-os-Montes +15%; Azores -20%).
  Link: [forecast 2026/27](https://www.ivv.gov.pt/noticias/previsao-de-colheita-campanha-2026-2027/).
- **Spain, MAPA crop estimates** ("Avances de superficies y producciones
  de cultivos"): monthly, about three months late. The May 2026 notebook,
  uploaded 14 September 2026, puts 2026 wine grapes at 4,877 thousand
  tonnes, 8.8% above 2025 (4,483), from 810.5 thousand ha in production
  (-2.5%); wine and must appear only after the harvest (2025: 32,575
  thousand hl, provisional). No national wine forecast yet; cooperatives
  and regional bodies publish their own estimates (31.5 Mhl of wine and
  must for 2025/26 from the cooperatives).
  Links: [crop estimates](https://www.mapa.gob.es/es/estadistica/temas/estadisticas-agrarias/agricultura/avances-superficies-producciones-agricolas),
  [cooperatives' 2025/26 estimate](https://www.agro-alimentarias.coop/docs_download/la-vendimia-2025-2026-se-estima-en-315-millones-de-hectolitros).
- **Italy:** on 29 July 2026 Unione Italiana Vini, Assoenologi and ISMEA
  dropped their pre-harvest forecast; results come after the harvest,
  around mid-November if the grape harvest declarations are brought
  forward. 2025 production reported to the Commission: 44.4 Mhl, per
  press reports.
  Link: [announcement](https://www.unioneitalianavini.it/approfondimenti-tematici/news/vendemmia-2026-dati-consuntivi-fine-campagna).

## World context

- **OIV:** free and unrestricted access to its statistics database
  (area, production, consumption and trade); annual state of the sector
  in April and a first world production estimate in October or
  November. Link: [OIV statistics](https://www.oiv.int/what-we-do/statistics).

## Next steps

1. Keep the harvest forecasts current: Agreste's October and November
   estimates, MAPA's wine and must once the harvest is in, Italy's
   results in mid-November and the OIV's world estimate in October or
   November.
2. Split Spain's exits to other countries into bulk and packaged, by
   colour, from INFOVI tables 4.3 and 4.4.
3. Check the Agri-food prices' lag again every few months, and import
   France and Italy if they catch up.
4. Read the licence pages still marked **to confirm** (Agri-food portal,
   IVV, FranceAgriMer, DRAAF Occitanie) and record the attribution text
   in `sources` before importing from them.
5. Import MAPA's representative wine markets, which would replace the
   Castilla-La Mancha samples with official provincial prices, once a
   weekly link and the report history are found.
6. Ask the Bologna and Alessandria-Asti chambers of commerce for
   permission to republish their wine, must and grape prices.
