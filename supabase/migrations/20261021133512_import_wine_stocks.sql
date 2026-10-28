-- Wine stocks of Italy, France and Portugal beside Spain's: the sources,
-- the columns supply_figures needs for them and the imports that load
-- them.
--
-- Italy's operators keep a telematic wine register, and the Ministry of
-- Agriculture's inspectorate (ICQRF) publishes the stocks it holds at the
-- end of each month in its Cantina Italia report, with a spreadsheet by
-- region and province. France's producers and traders declare their
-- stocks at 31 July to customs, which publish the national figures as
-- open data once a year. Portugal's operators declare theirs at 31 July
-- to the wine institute (IVV), which publishes a series workbook of the
-- national totals. The three imports read the national totals by
-- category of wine (PDO, PGI, varietal, other) and colour, and Italy's
-- musts and new wine too; France's keep the producers' and the traders'
-- stocks apart, hence the new holder column.
--
-- start_cantina_italia_imports() queues two runs per year (the reports
-- published in each half of it) and posts each to the
-- import-cantina-italia function; start_douane_stock_imports() and
-- start_ivv_stock_imports() queue one run each. pg_cron calls them in
-- the weeks their sources publish; call them by hand for a backfill, for
-- example
-- select private.start_cantina_italia_imports(2018);
-- select private.start_douane_stock_imports();
-- select private.start_ivv_stock_imports();
--
-- They read the project URL and the anon key from Vault, secrets
-- project_url and anon_key, which are set per project and never
-- committed. Without them they only raise a warning.

insert into public.sources (id, name, kind, classification, coverage, cadence, note, url)
values
  (
    'icqrf-cantina-italia',
    'ICQRF, Cantina Italia',
    'official-bulletin',
    'official',
    'Italy: wine, must and new wine held at the end of each month by the operators that keep the telematic wine register; WineTerm imports the national totals by category and colour',
    'Monthly, 8 to 12 days after the month ends',
    'Official statistics of the Italian Ministry of Agriculture''s inspectorate (ICQRF), from the telematic wine registers, which hold at least 95% of the wine kept in Italy, imported unchanged in hectolitres from each report''s spreadsheet. Source: ICQRF, bollettino "Cantina Italia", reused with attribution under the ministry''s CC BY terms.',
    'https://www.masaf.gov.it/flex/cm/pages/ServeBLOB.php/L/IT/IDPagina/7817'
  ),
  (
    'douane-stocks',
    'DGDDI, stock declarations',
    'official-bulletin',
    'official',
    'France: wine held at 31 July by producers and by traders, as declared to customs at the end of each campaign, by category and colour; WineTerm imports the national totals',
    'Yearly, in October or November',
    'Official statistics of the French customs (Direction générale des douanes et droits indirects), from the end-of-campaign stock declarations, imported unchanged in hectolitres. Source: DGDDI, open data, reused under the Licence Ouverte / Open Licence 2.0.',
    'https://www.douane.gouv.fr/la-douane/opendata/categories/viticulture/stocks-de-vins'
  ),
  (
    'ivv-existencias',
    'IVV, declarações de existências',
    'official-bulletin',
    'official',
    'Portugal: wine and must held at 31 July, as declared to the wine institute, by category and colour; WineTerm imports the national totals',
    'Yearly; the series workbook follows the declarations by some months',
    'Official statistics of the Instituto da Vinha e do Vinho, from the compulsory stock declarations at 31 July, imported unchanged in hectolitres from its series workbook. Wine and must are declared together, and products with a PDO or PGI include those eligible for one. Source: Instituto da Vinha e do Vinho, I.P.',
    'https://www.ivv.gov.pt/estatisticas/dados-do-vinho/'
  );

-- Who holds the stocks, where a source keeps producers and traders apart;
-- the other categories of wine, the three colours as the sources name
-- them, and Italy's musts and new wine.
alter table public.supply_figures
  add column holder text not null default 'all'
    check (holder in ('all', 'producers', 'traders')),
  drop constraint supply_figures_product_check,
  add constraint supply_figures_product_check check (product in (
    'wine',
    'wine-pdo',
    'wine-pdo-liqueur',
    'wine-pgi',
    'wine-varietal',
    'wine-other',
    'wine-third-country',
    'wine-and-must',
    'must',
    'must-concentrated',
    'must-rcgm',
    'new-wine'
  )),
  drop constraint supply_figures_colour_check,
  add constraint supply_figures_colour_check check (colour in (
    'red-rose', 'white', 'all', 'red', 'rose'
  ));

alter table public.supply_figures
  drop constraint supply_figures_pkey,
  add primary key (country, period, measure, product, colour, presentation, holder);

comment on table public.supply_figures is
  'Wine supply figures as declared, in hectolitres: Spain''s monthly INFOVI declarations (producers of 1,000 hl or more and warehouse holders), Italy''s month-end stocks from the telematic wine register, and the stocks France''s and Portugal''s operators declare at 31 July. National totals.';
comment on column public.supply_figures.period is
  'First day of the month the figure refers to; July for stocks declared at 31 July.';
comment on column public.supply_figures.product is
  'wine: all wine, which stands for the categories where both are stored. wine-pdo, wine-pgi: with a protected designation of origin or geographical indication, or eligible for one. wine-pdo-liqueur: Portugal''s liqueur wine with a PDO. wine-varietal: varietal wine without a PDO or PGI. wine-other: other wine without a PDO or PGI. wine-third-country: wine of third-country origin held by French traders. wine-and-must: Portugal''s declarations, which count wine and must together. must: must that is not concentrated. must-concentrated, must-rcgm: concentrated and rectified concentrated must. new-wine: new wine still in fermentation.';
comment on column public.supply_figures.colour is
  'Red and rosé, or white, for Spain; red, rosé or white where a source names the three; all for a total not split by colour. Where a figure carries both a total and its parts, the total stands for them.';
comment on column public.supply_figures.holder is
  'Producers or traders where a source keeps them apart, as the French declarations do; all for every holder together.';

-- Queues two runs per year, newest first, for the reports published in
-- each half of it, and posts each to the import-cantina-italia function.
-- A run reads up to seven spreadsheets, three at a time.
create function private.start_cantina_italia_imports(
  from_year integer,
  to_year integer default extract(year from now())::integer
)
returns setof bigint
language plpgsql
set search_path = ''
as $$
declare
  project_url text;
  anon_key text;
  year_number integer;
  half integer;
  run_id bigint;
begin
  if from_year > to_year then
    raise exception 'from_year % is after to_year %', from_year, to_year;
  end if;
  select decrypted_secret into project_url
    from vault.decrypted_secrets where name = 'project_url';
  select decrypted_secret into anon_key
    from vault.decrypted_secrets where name = 'anon_key';
  if project_url is null or anon_key is null then
    raise warning 'Cantina Italia imports not started: set the Vault secrets project_url and anon_key';
    return;
  end if;

  -- Close runs left behind: a function stopped at its time limit never
  -- records an outcome, and a post that never arrived leaves its run
  -- queued.
  update public.import_runs
     set status = 'failed', finished_at = now(), error = 'Did not finish'
   where source_id = 'icqrf-cantina-italia'
     and status = 'running'
     and started_at < now() - interval '15 minutes';
  update public.import_runs
     set status = 'failed', finished_at = now(), error = 'Never started'
   where source_id = 'icqrf-cantina-italia'
     and status = 'queued'
     and queued_at < now() - interval '15 minutes';

  for year_number in reverse to_year..from_year loop
    foreach half in array array[2, 1] loop
      insert into public.import_runs (source_id, scope, job, dispatched_at)
      values (
        'icqrf-cantina-italia',
        format('%s H%s', year_number, half),
        jsonb_build_object('year', year_number, 'half', half),
        now()
      )
      returning id into run_id;

      perform net.http_post(
        url := project_url || '/functions/v1/import-cantina-italia',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || anon_key
        ),
        body := jsonb_build_object('run_id', run_id),
        timeout_milliseconds := 30000
      );
      return next run_id;
    end loop;
  end loop;
end;
$$;

revoke all on function private.start_cantina_italia_imports(integer, integer)
  from public, anon, authenticated;

-- Queues one run that reads every campaign's stock statement and posts
-- it to the import-douane-stocks function.
create function private.start_douane_stock_imports()
returns bigint
language plpgsql
set search_path = ''
as $$
declare
  project_url text;
  anon_key text;
  run_id bigint;
begin
  select decrypted_secret into project_url
    from vault.decrypted_secrets where name = 'project_url';
  select decrypted_secret into anon_key
    from vault.decrypted_secrets where name = 'anon_key';
  if project_url is null or anon_key is null then
    raise warning 'Customs stock import not started: set the Vault secrets project_url and anon_key';
    return null;
  end if;

  update public.import_runs
     set status = 'failed', finished_at = now(), error = 'Did not finish'
   where source_id = 'douane-stocks'
     and status = 'running'
     and started_at < now() - interval '15 minutes';
  update public.import_runs
     set status = 'failed', finished_at = now(), error = 'Never started'
   where source_id = 'douane-stocks'
     and status = 'queued'
     and queued_at < now() - interval '15 minutes';

  insert into public.import_runs (source_id, scope, job, dispatched_at)
  values ('douane-stocks', 'stock declarations', '{}'::jsonb, now())
  returning id into run_id;

  perform net.http_post(
    url := project_url || '/functions/v1/import-douane-stocks',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || anon_key
    ),
    body := jsonb_build_object('run_id', run_id),
    timeout_milliseconds := 30000
  );
  return run_id;
end;
$$;

revoke all on function private.start_douane_stock_imports()
  from public, anon, authenticated;

-- Queues one run that reads the institute's stock series and posts it to
-- the import-ivv-stocks function.
create function private.start_ivv_stock_imports()
returns bigint
language plpgsql
set search_path = ''
as $$
declare
  project_url text;
  anon_key text;
  run_id bigint;
begin
  select decrypted_secret into project_url
    from vault.decrypted_secrets where name = 'project_url';
  select decrypted_secret into anon_key
    from vault.decrypted_secrets where name = 'anon_key';
  if project_url is null or anon_key is null then
    raise warning 'IVV stock import not started: set the Vault secrets project_url and anon_key';
    return null;
  end if;

  update public.import_runs
     set status = 'failed', finished_at = now(), error = 'Did not finish'
   where source_id = 'ivv-existencias'
     and status = 'running'
     and started_at < now() - interval '15 minutes';
  update public.import_runs
     set status = 'failed', finished_at = now(), error = 'Never started'
   where source_id = 'ivv-existencias'
     and status = 'queued'
     and queued_at < now() - interval '15 minutes';

  insert into public.import_runs (source_id, scope, job, dispatched_at)
  values ('ivv-existencias', 'stock series', '{}'::jsonb, now())
  returning id into run_id;

  perform net.http_post(
    url := project_url || '/functions/v1/import-ivv-stocks',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || anon_key
    ),
    body := jsonb_build_object('run_id', run_id),
    timeout_milliseconds := 30000
  );
  return run_id;
end;
$$;

revoke all on function private.start_ivv_stock_imports()
  from public, anon, authenticated;

-- A month's report appears 8 to 12 days after the month ends, on no fixed
-- day, so the job checks every Thursday. It re-reads the current year
-- and, until the middle of February, the previous one, whose December
-- report arrives in January.
select cron.schedule(
  'import-cantina-italia',
  '51 6 * * 4',
  $$select private.start_cantina_italia_imports(extract(year from now() - interval '45 days')::integer)$$
);

-- The customs publish a campaign's statement between the middle of
-- October and the middle of November, so the job checks on Tuesdays from
-- October to December.
select cron.schedule(
  'import-douane-stocks',
  '53 6 * 10-12 2',
  $$select private.start_douane_stock_imports()$$
);

-- The institute's series workbook follows the declarations by some
-- months, in the winter or spring, so the job checks on Tuesdays from
-- January to June.
select cron.schedule(
  'import-ivv-stocks',
  '55 6 * 1-6 2',
  $$select private.start_ivv_stock_imports()$$
);
