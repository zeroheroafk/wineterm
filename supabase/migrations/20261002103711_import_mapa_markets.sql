-- Weekly Spanish bulk wine prices by representative market from the
-- Ministry of Agriculture, Fisheries and Food (MAPA, Informe Semanal de
-- Coyuntura, table 2.2): the source, twelve series and the imports that
-- load them into public.market_observations.
--
-- The ministry publishes a workbook every week, listed on a page per
-- year. Its table 2.2 gives the ex-winery prices of white and red wine
-- without PDO/PGI in the markets Spain notifies to the Commission
-- (Regulation (EU) 2017/1185), in EUR/hl. The import-mapa-markets
-- function reads a year's workbooks; start_mapa_market_imports() queues
-- one run per year and posts each to it. pg_cron calls it twice a week
-- for the current year, and the previous one in January; call it by hand
-- for a backfill, for example select private.start_mapa_market_imports(2019);
--
-- It reads the project URL and the anon key from Vault, secrets
-- project_url and anon_key, which are set per project and never
-- committed. Without them it only raises a warning.

insert into public.sources (id, name, kind, classification, coverage, cadence, note, url)
values (
  'mapa-isc',
  'MAPA, Informe Semanal de Coyuntura',
  'official-bulletin',
  'official',
  'Spain, weekly prices in the representative agricultural markets; WineTerm imports white and red wine without PDO/PGI by market',
  'Weekly, a few days after the week ends',
  'Official statistics of the Spanish Ministry of Agriculture, Fisheries and Food, the prices Spain notifies to the European Commission, imported unchanged: ex-winery bulk prices in euros per hectolitre. Source: Ministerio de Agricultura, Pesca y Alimentación, reused under Law 37/2007.',
  'https://www.mapa.gob.es/es/estadistica/temas/publicaciones/informe-semanal-coyuntura'
);

insert into public.market_series (
  code, kind, name, country, region, appellation, colour, classification,
  category, spec, product, unit, campaign, source_id, source_type,
  verification, methodology
)
select format('ES-%s-%s-NGI', market.code, wine.code),
       'bulk-wine',
       format('%s %s without PDO/PGI', market.name, wine.colour),
       'ES',
       market.region,
       market.name,
       wine.colour,
       'no-gi',
       'generic',
       wine.spec,
       wine.product,
       'EUR/hl',
       '2026/27',
       'mapa-isc',
       'official',
       'verified',
       format(
         'Weekly ex-winery price of %s in the representative market of %s, bulk, paid in cash, VAT excluded: the price the Spanish Ministry of Agriculture, Fisheries and Food notifies to the European Commission under Regulation (EU) 2017/1185 and publishes in table 2.2 of its weekly market report (Informe Semanal de Coyuntura), imported unchanged. Each price is dated to the Sunday that ends its week; weeks without a quotation are left empty. Published is when the ministry uploaded the week''s workbook.',
         wine.phrase,
         market.name
       )
  from (
    values
      ('ALB', 'Albacete', 'Castilla-La Mancha', true),
      ('BAD', 'Badajoz', 'Extremadura', true),
      ('CRE', 'Ciudad Real', 'Castilla-La Mancha', true),
      ('CUE', 'Cuenca', 'Castilla-La Mancha', true),
      ('MUR', 'Murcia', 'Región de Murcia', false),
      ('TOL', 'Toledo', 'Castilla-La Mancha', true),
      ('VAL', 'Valencia', 'Comunitat Valenciana', false)
  ) as market (code, name, region, has_white)
  cross join (
    values
      ('WHT', 'white', null, 'White wine without PDO/PGI',
       'white wine without PDO/PGI'),
      ('RED', 'red', '12 points of colour', 'Red wine without PDO/PGI, 12 points of colour',
       'red wine without PDO/PGI of 12 points of colour')
  ) as wine (code, colour, spec, product, phrase)
 where market.has_white or wine.code = 'RED';

-- Queues one run per year, newest first, and posts each to the
-- import-mapa-markets function. A run reads up to 53 small workbooks, a
-- few at a time, so the runs are posted at once.
create function private.start_mapa_market_imports(
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
    raise warning 'MAPA market imports not started: set the Vault secrets project_url and anon_key';
    return;
  end if;

  -- Close runs left behind: a function stopped at its time limit never
  -- records an outcome, and a post that never arrived leaves its run
  -- queued.
  update public.import_runs
     set status = 'failed', finished_at = now(), error = 'Did not finish'
   where source_id = 'mapa-isc'
     and status = 'running'
     and started_at < now() - interval '15 minutes';
  update public.import_runs
     set status = 'failed', finished_at = now(), error = 'Never started'
   where source_id = 'mapa-isc'
     and status = 'queued'
     and queued_at < now() - interval '15 minutes';

  for year_number in reverse to_year..from_year loop
    insert into public.import_runs (source_id, scope, job, dispatched_at)
    values ('mapa-isc', year_number::text, jsonb_build_object('year', year_number), now())
    returning id into run_id;

    perform net.http_post(
      url := project_url || '/functions/v1/import-mapa-markets',
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

revoke all on function private.start_mapa_market_imports(integer, integer)
  from public, anon, authenticated;

-- The ministry uploads each week's report a few days after the week ends.
-- Checking on Tuesday and Friday mornings publishes it within days; in
-- January the previous year's last weeks are read as well.
select cron.schedule(
  'import-mapa-markets',
  '29 6 * * 2,5',
  $$select private.start_mapa_market_imports(extract(year from now() - interval '31 days')::integer)$$
);
