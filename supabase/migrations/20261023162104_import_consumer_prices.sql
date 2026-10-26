-- Prices of wine to the consumer: the sources, the table that holds them
-- and the imports that load it.
--
-- Eurostat publishes every month the harmonised index of consumer prices
-- (HICP) of the EU and of each country, by product, since 2026 in the
-- second version of the European classification of consumption (ECOICOP
-- ver. 2, dataset prc_hicp_minr). WineTerm imports wine from grapes
-- (02.1.2.1): the index, 2025 = 100, and the annual rate of change
-- Eurostat publishes with it, for the EU, its 27 countries and
-- Switzerland. The US Bureau of Labor Statistics publishes every month,
-- among the average prices it collects for its consumer price index, the
-- average price of a litre of table wine in US cities.
--
-- start_eurostat_hicp_imports() and start_bls_price_imports() queue one
-- run each and post it to the import-eurostat-hicp and import-bls-prices
-- functions. pg_cron calls them every Friday; call them by hand to import
-- at once, the BLS prices from a given year:
-- select private.start_eurostat_hicp_imports();
-- select private.start_bls_price_imports(2015);
--
-- They read the project URL and the anon key from Vault, secrets
-- project_url and anon_key, which are set per project and never
-- committed. Without them they only raise a warning.

insert into public.sources (id, name, kind, classification, coverage, cadence, note, url)
values
  (
    'eurostat-hicp',
    'Eurostat, harmonised index of consumer prices (HICP)',
    'official-bulletin',
    'official',
    'The EU, its 27 countries and Switzerland: consumer prices by product; WineTerm imports wine from grapes',
    'Monthly, in the middle of the month, for the month before',
    'Official statistics, imported unchanged: the index of the consumer prices of wine from grapes (ECOICOP ver. 2, 02.1.2.1), 2025 = 100, and its annual rate of change, as Eurostat publishes them. They follow the prices households pay for wine to take home, taxes included; wine served in restaurants and bars is not covered. Source: Eurostat, CC BY 4.0.',
    'https://ec.europa.eu/eurostat/databrowser/view/prc_hicp_minr/default/table'
  ),
  (
    'bls-average-prices',
    'US Bureau of Labor Statistics, CPI average prices',
    'official-bulletin',
    'official',
    'United States: average prices of selected foods and drinks in US cities; WineTerm imports table wine',
    'Monthly, about two weeks after the month',
    'Official statistics of the US Bureau of Labor Statistics, collected for the consumer price index and imported unchanged: the average price of a litre of red, white and rosé table wine of every size, packaging and origin in US cities, in US dollars. Sparkling, dessert and fruit wines are not included. Average prices describe a month''s price level; the changes WineTerm shows are computed from them. Source: US Bureau of Labor Statistics, public domain.',
    'https://data.bls.gov/timeseries/APU0000720311'
  );

create table public.consumer_prices (
  country text not null check (country ~ '^[A-Z]{2}$'),
  product text not null check (product in ('wine-from-grapes', 'table-wine')),
  measure text not null check (measure in ('index', 'average-price')),
  period date not null check (extract(day from period) = 1),
  value numeric(12, 4) not null check (value > 0),
  unit text not null check (unit in ('2025=100', 'USD/litre')),
  annual_rate numeric(6, 1),
  status text not null check (status in ('final', 'provisional', 'estimate')),
  source_id text not null references public.sources (id),
  published_at timestamptz not null,
  updated_at timestamptz not null default now(),
  revised boolean not null default false,
  primary key (country, product, measure, period)
);

comment on table public.consumer_prices is
  'Monthly prices of wine to the consumer, as published: price indices and average prices.';
comment on column public.consumer_prices.country is
  'ISO 3166-1 alpha-2 code, or EU for the European Union of 27 countries (Eurostat''s EU27_2020).';
comment on column public.consumer_prices.product is
  'wine-from-grapes: ECOICOP ver. 2, 02.1.2.1. table-wine: red, white and rosé table wine of every size and origin.';
comment on column public.consumer_prices.measure is
  'index: a price index, in the unit''s reference year. average-price: the average price paid, in the unit''s currency.';
comment on column public.consumer_prices.period is
  'First day of the month the figure refers to.';
comment on column public.consumer_prices.annual_rate is
  'Percentage change on the same month a year earlier, as the source publishes it; null where it publishes none.';
comment on column public.consumer_prices.published_at is
  'When the source first published the figure, or when WineTerm first read it where the source gives no date.';

create index consumer_prices_source_id_idx on public.consumer_prices (source_id);

alter table public.consumer_prices enable row level security;

revoke all on table public.consumer_prices from anon, authenticated;
grant select on table public.consumer_prices to anon, authenticated;
grant select, insert, update, delete on table public.consumer_prices to service_role;

create policy "Consumer prices are public"
  on public.consumer_prices for select to anon, authenticated using (true);

-- Queues one run and posts it to the import-eurostat-hicp function. A run
-- reads every month the dataset holds for wine from grapes.
create function private.start_eurostat_hicp_imports()
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
    raise warning 'Eurostat HICP import not started: set the Vault secrets project_url and anon_key';
    return null;
  end if;

  -- Close runs left behind: a function stopped at its time limit never
  -- records an outcome, and a post that never arrived leaves its run
  -- queued.
  update public.import_runs
     set status = 'failed', finished_at = now(), error = 'Did not finish'
   where source_id = 'eurostat-hicp'
     and status = 'running'
     and started_at < now() - interval '15 minutes';
  update public.import_runs
     set status = 'failed', finished_at = now(), error = 'Never started'
   where source_id = 'eurostat-hicp'
     and status = 'queued'
     and queued_at < now() - interval '15 minutes';

  insert into public.import_runs (source_id, scope, job, dispatched_at)
  values ('eurostat-hicp', 'Wine from grapes', '{}'::jsonb, now())
  returning id into run_id;

  perform net.http_post(
    url := project_url || '/functions/v1/import-eurostat-hicp',
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

revoke all on function private.start_eurostat_hicp_imports()
  from public, anon, authenticated;

-- Queues one run and posts it to the import-bls-prices function. A run
-- reads the months from the start of from_year; the BLS answers ten
-- years per request, and requests without a registration key are
-- limited to 25 a day from one address.
create function private.start_bls_price_imports(
  from_year integer default extract(year from now())::integer - 1
)
returns bigint
language plpgsql
set search_path = ''
as $$
declare
  project_url text;
  anon_key text;
  to_year integer := extract(year from now())::integer;
  run_id bigint;
begin
  if from_year > to_year then
    raise exception 'from_year % is after the current year', from_year;
  end if;
  select decrypted_secret into project_url
    from vault.decrypted_secrets where name = 'project_url';
  select decrypted_secret into anon_key
    from vault.decrypted_secrets where name = 'anon_key';
  if project_url is null or anon_key is null then
    raise warning 'BLS price import not started: set the Vault secrets project_url and anon_key';
    return null;
  end if;

  -- Close runs left behind, as above.
  update public.import_runs
     set status = 'failed', finished_at = now(), error = 'Did not finish'
   where source_id = 'bls-average-prices'
     and status = 'running'
     and started_at < now() - interval '15 minutes';
  update public.import_runs
     set status = 'failed', finished_at = now(), error = 'Never started'
   where source_id = 'bls-average-prices'
     and status = 'queued'
     and queued_at < now() - interval '15 minutes';

  insert into public.import_runs (source_id, scope, job, dispatched_at)
  values (
    'bls-average-prices',
    'Table wine',
    jsonb_build_object('from_year', from_year, 'to_year', to_year),
    now()
  )
  returning id into run_id;

  perform net.http_post(
    url := project_url || '/functions/v1/import-bls-prices',
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

revoke all on function private.start_bls_price_imports(integer)
  from public, anon, authenticated;

-- Eurostat releases a month's HICP in the middle of the next, and the BLS
-- its average prices about two weeks after the month; checking on Friday
-- mornings publishes a new month within a week of either. The BLS run
-- re-reads the previous year too, which picks up its corrections.
select cron.schedule(
  'import-eurostat-hicp',
  '47 6 * * 5',
  $$select private.start_eurostat_hicp_imports()$$
);
select cron.schedule(
  'import-bls-prices',
  '49 6 * * 5',
  $$select private.start_bls_price_imports()$$
);

-- Both join the silence check of private.check_imports(): they run every
-- week, so nine days without a successful run is a fault.
insert into private.import_schedule (source_id, max_silence) values
  ('eurostat-hicp', interval '9 days'),
  ('bls-average-prices', interval '9 days')
on conflict (source_id) do nothing;
