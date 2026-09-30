-- Spain's monthly entries and exits of wine from the Ministry of
-- Agriculture's INFOVI summaries, beside the stocks and production already
-- imported, so that Spain's supply balance can be drawn up from them.
--
-- The import-infovi function now also reads from each monthly workbook the
-- national totals of wine that came in during the month from other
-- operators in Spain (table 3.1) and from other countries (table 3.2), and
-- of wine that went out, by destination (tables 4.0 and 4.6). Each is a
-- measure of its own, with colour and presentation 'all'. After deploying
-- the function, load them for every year with
-- select private.start_infovi_imports(2018);

alter table public.supply_figures
  drop constraint supply_figures_measure_check,
  add constraint supply_figures_measure_check check (measure in (
    'closing-stocks',
    'production-to-date',
    'entries-domestic',
    'entries-eu',
    'entries-third-countries',
    'exits-domestic',
    'exits-distillation',
    'exits-vinegar',
    'exits-eu',
    'exits-third-countries',
    'exits-own-operations'
  )),
  drop constraint supply_figures_colour_check,
  add constraint supply_figures_colour_check check (colour in ('red-rose', 'white', 'all'));

comment on column public.supply_figures.measure is
  'closing-stocks: held on the last day of the month. production-to-date: made from 1 August, the start of the campaign, to the last day of the month. entries-domestic, entries-eu, entries-third-countries: came in during the month from other operators in the country, from the rest of the EU or from third countries. exits-domestic, exits-distillation, exits-vinegar: went out during the month within the country, to other uses than distilleries and vinegar makers, to distilleries or to vinegar makers. exits-eu, exits-third-countries: went out to the rest of the EU or to third countries. exits-own-operations: taken out for the declarants'' own operations.';
comment on column public.supply_figures.colour is
  'Red and rosé, or white; all where the figure is not split by colour, as for entries and exits.';

update public.sources
set coverage = 'Spain: stocks, production, entries and exits of wine declared every month by producers of 1,000 hl or more and by warehouse holders; WineTerm imports their national totals'
where id = 'mapa-infovi';
