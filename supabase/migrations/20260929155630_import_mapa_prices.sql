-- Weekly Spanish wine prices from the Ministry of Agriculture, Fisheries
-- and Food (MAPA, Precios Medios Nacionales): the source, its two series
-- and the imports that load them into public.market_observations.
--
-- The ministry publishes one workbook per year of weekly national average
-- prices of agricultural products and replaces the current year's workbook
-- every week. The import-mapa-prices function reads its two wine rows,
-- white and red wine without PDO/PGI, ex-winery, in EUR/hl. A run covers
-- one year's workbook; start_mapa_imports() queues one run per year and
-- posts each to the function. pg_cron calls it twice a week for the
-- current and the previous year; call it by hand for a backfill, for
-- example select private.start_mapa_imports(2019);
--
-- It reads the project URL and the anon key from Vault, secrets
-- project_url and anon_key, which are set per project and never
-- committed. Without them it only raises a warning.

insert into public.sources (id, name, kind, classification, coverage, cadence, note, url)
values (
  'mapa-pmn',
  'MAPA, Precios Medios Nacionales',
  'official-bulletin',
  'official',
  'Spain, national weekly averages of agricultural prices; WineTerm imports white and red wine without PDO/PGI',
  'Weekly, a few days after the week ends',
  'Official statistics of the Spanish Ministry of Agriculture, Fisheries and Food, imported unchanged: ex-winery prices in euros per hectolitre. Source: Ministerio de Agricultura, Pesca y Alimentación, reused under Law 37/2007.',
  'https://www.mapa.gob.es/es/estadistica/temas/estadisticas-agrarias/economia/precios-medios-nacionales'
);

insert into public.market_series (
  code, kind, name, country, region, colour, classification, category, spec,
  product, unit, campaign, source_id, source_type, verification, methodology
)
values
  (
    'ES-NAT-WHT-NGI', 'bulk-wine', 'Spain national average white without PDO/PGI',
    'ES', 'National average', 'white', 'no-gi', 'generic', null,
    'White wine without PDO/PGI', 'EUR/hl', '2026/27', 'mapa-pmn', 'official', 'verified',
    'Weekly national average of ex-winery prices for white wine without PDO/PGI, published by the Spanish Ministry of Agriculture, Fisheries and Food in Precios Medios Nacionales and imported unchanged. Weeks run Monday to Sunday, and each price is dated to the Sunday that ends its week. Published is when the ministry uploaded the workbook WineTerm first read the price from.'
  ),
  (
    'ES-NAT-RED-NGI', 'bulk-wine', 'Spain national average red without PDO/PGI',
    'ES', 'National average', 'red', 'no-gi', 'generic', '12 points of colour',
    'Red wine without PDO/PGI, 12 points of colour', 'EUR/hl', '2026/27', 'mapa-pmn', 'official', 'verified',
    'Weekly national average of ex-winery prices for red wine without PDO/PGI of 12 points of colour, published by the Spanish Ministry of Agriculture, Fisheries and Food in Precios Medios Nacionales and imported unchanged. Weeks run Monday to Sunday, and each price is dated to the Sunday that ends its week. Published is when the ministry uploaded the workbook WineTerm first read the price from.'
  );

-- Queues one run per year, newest first, and posts each to the
-- import-mapa-prices function. A run reads one small workbook in seconds,
-- so the runs are posted at once rather than one at a time.
create function private.start_mapa_imports(
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
    raise warning 'MAPA imports not started: set the Vault secrets project_url and anon_key';
    return;
  end if;

  -- Close runs left behind: a function stopped at its time limit never
  -- records an outcome, and a post that never arrived leaves its run
  -- queued.
  update public.import_runs
     set status = 'failed', finished_at = now(), error = 'Did not finish'
   where source_id = 'mapa-pmn'
     and status = 'running'
     and started_at < now() - interval '15 minutes';
  update public.import_runs
     set status = 'failed', finished_at = now(), error = 'Never started'
   where source_id = 'mapa-pmn'
     and status = 'queued'
     and queued_at < now() - interval '15 minutes';

  for year_number in reverse to_year..from_year loop
    insert into public.import_runs (source_id, scope, job, dispatched_at)
    values ('mapa-pmn', year_number::text, jsonb_build_object('year', year_number), now())
    returning id into run_id;

    perform net.http_post(
      url := project_url || '/functions/v1/import-mapa-prices',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || anon_key
      ),
      body := jsonb_build_object('run_id', run_id),
      timeout_milliseconds := 30000
    );
    return next run_id;
  end loop;
end;
$$;

revoke all on function private.start_mapa_imports(integer, integer)
  from public, anon, authenticated;

-- The ministry uploads the new week a few days after it ends, usually
-- late in the week. Checking on Tuesday and Friday mornings publishes it
-- within days, and the previous year's workbook is re-read as well,
-- because its last weeks and revisions arrive in January.
select cron.schedule(
  'import-mapa-prices',
  '17 6 * * 2,5',
  $$select private.start_mapa_imports(extract(year from now())::integer - 1)$$
);
