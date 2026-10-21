-- The series one_bulk_price_per_country stopped computing, left without
-- observations: the import averages, Spain's export average and the
-- export averages that moved to the national codes.
--
-- The Supabase MCP server waited for a confirmation of these deletes
-- that never reached the user, so the series were removed by hand
-- instead: on 21 October 2026 the database held only the three national
-- series, and this migration was still absent from its migration
-- history. Applying it with the Supabase CLI records it and deletes
-- nothing.
delete from public.market_series as s
 where s.source_id = 'wineterm-trade-estimate'
   and s.code in (
     'ES-BULK-EXP', 'PT-BULK-EXP', 'PT-BULK-IMP', 'FR-BULK-EXP',
     'FR-BULK-IMP', 'IT-BULK-EXP', 'IT-BULK-IMP'
   )
   and not exists (
     select 1 from public.market_observations as o where o.series_code = s.code
   );
