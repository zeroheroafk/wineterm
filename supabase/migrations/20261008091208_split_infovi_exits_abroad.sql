-- Spain's exits of wine to the rest of the EU and to third countries by
-- colour and presentation, from INFOVI tables 4.3 and 4.4.
--
-- The import-infovi function now also stores, for exits-eu and
-- exits-third-countries, one figure per colour (red-rose, white) and
-- presentation (bulk, packaged) beside the month's total from table 4.0,
-- which keeps colour and presentation 'all'. The parts add up to the
-- total; readers take the total where there is one, so nothing is counted
-- twice. The existing checks already allow these values, so only the
-- column comments change. After deploying the function, load the split
-- for every year with
-- select private.start_infovi_imports(2018);

comment on column public.supply_figures.colour is
  'Red and rosé, or white; all for a total not split by colour, as for entries and exits. Where a month carries both a total and its parts, the total stands for them.';
comment on column public.supply_figures.presentation is
  'Bulk or packaged, for wine stocks and exits abroad; all where the source does not split them, or for the total of the parts.';
