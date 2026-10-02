-- The series one_bulk_price_per_country stopped computing, left without
-- observations: the import averages, Spain's export average and the
-- export averages that moved to the national codes.
--
-- Not yet applied: the Supabase MCP server waits for a confirmation of
-- deletes that did not reach the user. Apply it with the Supabase CLI or
-- the SQL editor. Until then the empty series are harmless, since the
-- site lists only series with observations.
delete from public.market_series as s
 where s.source_id = 'wineterm-trade-estimate'
   and s.code in (
     'ES-BULK-EXP', 'PT-BULK-EXP', 'PT-BULK-IMP', 'FR-BULK-EXP',
     'FR-BULK-IMP', 'IT-BULK-EXP', 'IT-BULK-IMP'
   )
   and not exists (
     select 1 from public.market_observations as o where o.series_code = s.code
   );
