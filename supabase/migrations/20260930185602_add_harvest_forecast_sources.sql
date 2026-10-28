-- The sources of the official harvest forecasts on /harvest, so that the
-- table sources keeps mirroring the site's registry
-- (src/services/markets/sources.ts). The forecasts themselves are entered
-- by hand in src/services/harvest/official.ts: they come as PDF releases
-- and web pages, not as data an import can read.

insert into public.sources (id, name, kind, classification, coverage, cadence, note, url)
values
  (
    'mapa-avances',
    'MAPA, crop area and production estimates',
    'official-bulletin',
    'official',
    'Spain: monthly estimates of crop areas and production, including wine grapes and, once the harvest is in, wine and must',
    'Monthly, about three months after the month estimated',
    'Official estimates of the Spanish Ministry of Agriculture, Fisheries and Food (Avances de superficies y producciones de cultivos). WineTerm enters the wine grape and wine figures by hand, with their date. Source: Ministerio de Agricultura, Pesca y Alimentación, reused under Law 37/2007.',
    'https://www.mapa.gob.es/es/estadistica/temas/estadisticas-agrarias/agricultura/avances-superficies-producciones-agricolas'
  ),
  (
    'agreste',
    'Agreste, Infos rapides Viticulture',
    'official-bulletin',
    'official',
    'France: estimates of wine production by category and wine basin, from August to November',
    'Monthly through the harvest',
    'Harvest estimates of the statistical service of the French Ministry of Agriculture. WineTerm enters the national totals from each release by hand, with its date. Source: Agreste, Ministère de l''Agriculture et de la Souveraineté alimentaire.',
    'https://agreste.agriculture.gouv.fr/agreste-web/disaron/IraVit26107/detail/'
  ),
  (
    'ivv',
    'IVV, harvest forecast',
    'official-bulletin',
    'official',
    'Portugal: wine production forecast by wine region',
    'Once a year, before the harvest',
    'Forecast of the Instituto da Vinha e do Vinho, Portugal''s wine institute. WineTerm enters the national total and the regional changes by hand, with its date. Source: Instituto da Vinha e do Vinho, I.P.',
    'https://www.ivv.gov.pt/noticias/previsao-de-colheita-campanha-2026-2027/'
  ),
  (
    'uiv-assoenologi-ismea',
    'Unione Italiana Vini, Assoenologi and ISMEA',
    'trade-reporting',
    'reported',
    'Italy: the joint production forecast published before the harvest',
    'Once a year in early September; none in 2026',
    'Italy''s usual harvest forecast comes from the trade associations Unione Italiana Vini and Assoenologi with the public agency ISMEA. For 2026 they published none, and will report results after the harvest.',
    'https://www.unioneitalianavini.it/approfondimenti-tematici/news/vendemmia-2026-dati-consuntivi-fine-campagna'
  );
