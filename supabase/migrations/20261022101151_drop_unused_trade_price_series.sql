-- The series one_bulk_price_per_country stopped computing, left without
-- observations: the import averages, Spain's export average and the
-- export averages that moved to the national codes. They were removed
-- by hand on 21 October 2026, when the database held only the three
-- national series; this migration records that and deletes nothing.
--
-- delete from public.market_series as s
--  where s.source_id = 'wineterm-trade-estimate'
--    and s.code in (
--      'ES-BULK-EXP', 'PT-BULK-EXP', 'PT-BULK-IMP', 'FR-BULK-EXP',
--      'FR-BULK-IMP', 'IT-BULK-EXP', 'IT-BULK-IMP'
--    )
--    and not exists (
--      select 1 from public.market_observations as o where o.series_code = s.code
--    );
do $$
begin
  if exists (
    select 1 from public.market_series
     where source_id = 'wineterm-trade-estimate'
       and code in (
         'ES-BULK-EXP', 'PT-BULK-EXP', 'PT-BULK-IMP', 'FR-BULK-EXP',
         'FR-BULK-IMP', 'IT-BULK-EXP', 'IT-BULK-IMP'
       )
  ) then
    raise warning 'Unused trade price series still present: remove them by hand';
  end if;
end;
$$;
