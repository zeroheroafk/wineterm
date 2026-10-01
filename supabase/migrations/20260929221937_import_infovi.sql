-- Spain's monthly wine stocks and production from the Ministry of
-- Agriculture's INFOVI summaries: the source, the table that holds them
-- and the imports that load it.
--
-- Spanish wine operators declare every month what they hold, make, take in
-- and ship (INFOVI), and the ministry publishes a workbook of national and
-- regional totals about six weeks after the month ends. The import-infovi
-- function reads two national totals from each workbook: stocks of wine
-- and must at the end of the month, and wine made since 1 August. A run
-- covers one year's workbooks; start_infovi_imports() queues one run per
-- year and posts each to the function. pg_cron calls it every week; call
-- it by hand for a backfill, for example
-- select private.start_infovi_imports(2018, 2020);
--
-- It reads the project URL and the anon key from Vault, secrets
-- project_url and anon_key, which are set per project and never
-- committed. Without them it only raises a warning.

insert into public.sources (id, name, kind, classification, coverage, cadence, note, url)
values (
  'mapa-infovi',
  'MAPA, INFOVI monthly declarations',
  'official-bulletin',
  'official',
  'Spain: stocks, production, entries and exits of wine declared every month by producers of 1,000 hl or more and by warehouse holders; WineTerm imports the national stocks and production',
  'Monthly, about six weeks after the month ends',
  'Official statistics of the Spanish Ministry of Agriculture, Fisheries and Food, compiled from the compulsory monthly declarations of the wine sector and imported unchanged, in hectolitres. Producers making less than 1,000 hl a year do not declare monthly and are not included. Source: Ministerio de Agricultura, Pesca y Alimentación, reused under Law 37/2007.',
  'https://www.mapa.gob.es/es/agricultura/temas/producciones-agricolas/vitivinicultura/datos_infovi_anteriores'
);

create table public.supply_figures (
  country text not null check (country ~ '^[A-Z]{2}$'),
  period date not null check (extract(day from period) = 1),
  measure text not null check (measure in ('closing-stocks', 'production-to-date')),
  product text not null check (product in ('wine', 'must')),
  colour text not null check (colour in ('red-rose', 'white')),
  presentation text not null check (presentation in ('bulk', 'packaged', 'all')),
  volume_hl numeric(14, 2) not null check (volume_hl >= 0),
  source_id text not null references public.sources (id),
  published_at timestamptz not null,
  updated_at timestamptz not null default now(),
  revised boolean not null default false,
  primary key (country, period, measure, product, colour, presentation)
);

comment on table public.supply_figures is
  'Monthly wine supply figures as declared, in hectolitres. Spain from MAPA INFOVI: national totals of producers of 1,000 hl or more and of warehouse holders.';
comment on column public.supply_figures.period is
  'First day of the month the figure refers to.';
comment on column public.supply_figures.measure is
  'closing-stocks: held on the last day of the month. production-to-date: made from 1 August, the start of the campaign, to the last day of the month.';
comment on column public.supply_figures.presentation is
  'Bulk or packaged, for wine stocks; all where the source does not split them.';
comment on column public.supply_figures.published_at is
  'When the source first published the figure: the upload of the workbook it was first read from.';

create index supply_figures_source_id_idx on public.supply_figures (source_id);

alter table public.supply_figures enable row level security;

revoke all on table public.supply_figures from anon, authenticated;
grant select on table public.supply_figures to anon, authenticated;
grant select, insert, update, delete on table public.supply_figures to service_role;

create policy "Supply figures are public"
  on public.supply_figures for select to anon, authenticated using (true);

-- Queues one run per year, newest first, and posts each to the
-- import-infovi function. A run reads up to twelve small workbooks, three
-- at a time, so the runs are posted at once rather than one at a time.
create function private.start_infovi_imports(
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
    raise warning 'INFOVI imports not started: set the Vault secrets project_url and anon_key';
    return;
  end if;

  -- Close runs left behind: a function stopped at its time limit never
  -- records an outcome, and a post that never arrived leaves its run
  -- queued.
  update public.import_runs
     set status = 'failed', finished_at = now(), error = 'Did not finish'
   where source_id = 'mapa-infovi'
     and status = 'running'
     and started_at < now() - interval '15 minutes';
  update public.import_runs
     set status = 'failed', finished_at = now(), error = 'Never started'
   where source_id = 'mapa-infovi'
     and status = 'queued'
     and queued_at < now() - interval '15 minutes';

  for year_number in reverse to_year..from_year loop
    insert into public.import_runs (source_id, scope, job, dispatched_at)
    values ('mapa-infovi', year_number::text, jsonb_build_object('year', year_number), now())
    returning id into run_id;

    perform net.http_post(
      url := project_url || '/functions/v1/import-infovi',
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

revoke all on function private.start_infovi_imports(integer, integer)
  from public, anon, authenticated;

-- A month appears about six weeks after it ends, on no fixed day, so the
-- job checks every Monday. It re-reads the current year and, until the
-- middle of March, the previous one, whose last months arrive in January
-- and February.
select cron.schedule(
  'import-infovi',
  '41 6 * * 1',
  $$select private.start_infovi_imports(extract(year from now() - interval '75 days')::integer)$$
);
