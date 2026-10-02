-- MAPA market imports in batches. A call of the import-mapa-markets
-- function has about two seconds of CPU time, and reading a year's
-- weekly workbooks takes more: the first run, for 2026, stopped with "CPU
-- Time exceeded". The function now keeps each workbook it reads in
-- public.mapa_market_reports, reads at most a few per call and queues its
-- run again while some remain; the pg_cron job dispatch-mapa-market-imports
-- posts the queued runs one at a time, as dispatch-comext-imports does for
-- Comext, and removes itself when none is left. Workbooks already kept are
-- not read again, so the twice-weekly runs read only the new weeks.

create table public.mapa_market_reports (
  url text primary key,
  year smallint not null check (year >= 2019),
  label text not null,
  week date check (week is null or extract(isodow from week) = 7),
  link_week date,
  observations jsonb not null default '[]' check (jsonb_typeof(observations) = 'array'),
  unknown_markets text[] not null default '{}',
  uploaded_at timestamptz,
  error text check (char_length(error) <= 500),
  read_at timestamptz not null default now(),
  check (error is null or week is null)
);

comment on table public.mapa_market_reports is
  'Each weekly workbook of MAPA''s Informe Semanal de Coyuntura as import-mapa-markets read it: the week its table 2.2 reports and those prices, or no week when it has no table 2.2, or the error that stopped the reading. The import settles a year''s weeks from these rows.';
comment on column public.mapa_market_reports.week is
  'Sunday ending the week the workbook reports; null without table 2.2 or after an error.';
comment on column public.mapa_market_reports.link_week is
  'Sunday ending the week its link on the ministry''s page names.';

create index mapa_market_reports_year_idx on public.mapa_market_reports (year);

alter table public.mapa_market_reports enable row level security;
revoke all on table public.mapa_market_reports from anon, authenticated;
grant select, insert, update, delete on table public.mapa_market_reports to service_role;

-- The first run, which ran out of CPU time before recording an outcome.
update public.import_runs
   set status = 'failed', finished_at = now(),
       error = 'CPU Time exceeded reading the whole year in one call'
 where source_id = 'mapa-isc' and status = 'running';

-- Posts the oldest queued MAPA market run once no other is in flight, and
-- removes itself when none is left. It reads the project URL and the anon
-- key from Vault, secrets project_url and anon_key.
create function private.dispatch_mapa_market_imports()
returns void
language plpgsql
set search_path = ''
as $$
declare
  project_url text;
  anon_key text;
  next_run bigint;
begin
  -- Close runs left behind: a call stopped at its time limit never
  -- records an outcome, and a post that never arrived leaves its run
  -- queued.
  update public.import_runs
     set status = 'failed', finished_at = now(), error = 'Did not finish'
   where source_id = 'mapa-isc'
     and status = 'running'
     and started_at < now() - interval '5 minutes';
  update public.import_runs
     set status = 'failed', finished_at = now(), error = 'Never started'
   where source_id = 'mapa-isc'
     and status = 'queued'
     and dispatched_at < now() - interval '5 minutes';

  if exists (
    select 1
      from public.import_runs
     where source_id = 'mapa-isc'
       and (status = 'running' or (status = 'queued' and dispatched_at is not null))
  ) then
    return;
  end if;

  select id into next_run
    from public.import_runs
   where source_id = 'mapa-isc' and status = 'queued'
   order by id
   limit 1;
  if next_run is null then
    if exists (select 1 from cron.job where jobname = 'dispatch-mapa-market-imports') then
      perform cron.unschedule('dispatch-mapa-market-imports');
    end if;
    return;
  end if;

  select decrypted_secret into project_url
    from vault.decrypted_secrets where name = 'project_url';
  select decrypted_secret into anon_key
    from vault.decrypted_secrets where name = 'anon_key';
  if project_url is null or anon_key is null then
    update public.import_runs
       set status = 'failed', finished_at = now(),
           error = 'Vault secrets project_url and anon_key are not set'
     where source_id = 'mapa-isc' and status = 'queued';
    raise warning 'MAPA market imports stopped: set the Vault secrets project_url and anon_key';
    return;
  end if;

  update public.import_runs set dispatched_at = now() where id = next_run;
  perform net.http_post(
    url := project_url || '/functions/v1/import-mapa-markets',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || anon_key
    ),
    body := jsonb_build_object('run_id', next_run),
    timeout_milliseconds := 30000
  );
end;
$$;

revoke all on function private.dispatch_mapa_market_imports()
  from public, anon, authenticated;

-- Queues one run per year, newest first, and starts posting them.
create or replace function private.start_mapa_market_imports(
  from_year integer,
  to_year integer default extract(year from now())::integer
)
returns setof bigint
language plpgsql
set search_path = ''
as $$
declare
  year_number integer;
  run_id bigint;
begin
  if from_year > to_year then
    raise exception 'from_year % is after to_year %', from_year, to_year;
  end if;
  if not exists (select 1 from vault.decrypted_secrets where name = 'project_url')
     or not exists (select 1 from vault.decrypted_secrets where name = 'anon_key') then
    raise warning 'MAPA market imports not started: set the Vault secrets project_url and anon_key';
    return;
  end if;

  for year_number in reverse to_year..from_year loop
    insert into public.import_runs (source_id, scope, job)
    values ('mapa-isc', year_number::text, jsonb_build_object('year', year_number))
    returning id into run_id;
    return next run_id;
  end loop;

  perform cron.schedule(
    'dispatch-mapa-market-imports',
    '20 seconds',
    'select private.dispatch_mapa_market_imports()'
  );
  perform private.dispatch_mapa_market_imports();
end;
$$;

revoke all on function private.start_mapa_market_imports(integer, integer)
  from public, anon, authenticated;
