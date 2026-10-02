-- The series one_bulk_price_per_country stopped computing, left without
-- observations: the import averages, Spain's export average and the
-- export averages that moved to the national codes.
--
-- Applied by hand in the SQL editor on 2 October 2026, so it is missing
-- from the project's migration history. Running it again deletes
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
