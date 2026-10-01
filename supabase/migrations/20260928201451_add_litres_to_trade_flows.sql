-- Litres for Comext trade flows, and Comext imports posted one run at a
-- time.
--
-- Comext publishes volume in litres (its supplementary quantity) only for
-- CN8 codes, not for the heading and subheadings kept in trade_flows. The
-- import-comext function now also reads the CN8 codes of each subheading
-- and stores their litres on the subheading and heading rows, in
-- quantity_l, where the CN8 values add up exactly to the row's value.
-- Otherwise the litres stay null, and the run's note counts those rows.
--
-- CN8 requests take Comext up to half a minute each, so a run now covers
-- one reporter, flow and year, and the runs are posted one at a time
-- instead of all at once: start_comext_imports() queues them and schedules
-- the pg_cron job dispatch-comext-imports, which posts the next run
-- whenever none is in flight and removes itself when none is left. Each
-- call stays far below the Edge Function time limit, and Eurostat sees a
-- handful of requests at a time.

alter table public.trade_flows
  add column quantity_l numeric(16, 2) check (quantity_l >= 0);

comment on column public.trade_flows.quantity_l is
  'Volume in litres: the supplementary quantities of the CN8 codes under the product, summed. Null when those codes do not add up to the value of the row.';

alter table public.import_runs
  add column dispatched_at timestamptz,
  add column note text check (char_length(note) <= 1000);

comment on column public.import_runs.dispatched_at is
  'When the database posted the run to its Edge Function; null while the run waits its turn.';
comment on column public.import_runs.note is
  'Remarks on a finished run, such as rows saved without one of their measures.';

-- Posts the oldest queued Comext run to the import-comext function once no
-- other run is in flight. It reads the project URL and the anon key from
-- Vault, secrets project_url and anon_key, which are set per project and
-- never committed.
create function private.dispatch_comext_imports()
returns void
language plpgsql
set search_path = ''
as $$
declare
  project_url text;
  anon_key text;
  next_run bigint;
begin
  -- Close runs left behind: a function stopped at its time limit never
  -- records an outcome, and a post that never arrived leaves its run
  -- queued.
  update public.import_runs
     set status = 'failed', finished_at = now(), error = 'Did not finish'
   where source_id = 'eurostat-comext'
     and status = 'running'
     and started_at < now() - interval '5 minutes';
  update public.import_runs
     set status = 'failed', finished_at = now(), error = 'Never started'
   where source_id = 'eurostat-comext'
     and status = 'queued'
     and dispatched_at < now() - interval '5 minutes';

  if exists (
    select 1
      from public.import_runs
     where source_id = 'eurostat-comext'
       and (status = 'running' or (status = 'queued' and dispatched_at is not null))
  ) then
    return;
  end if;

  select id into next_run
    from public.import_runs
   where source_id = 'eurostat-comext' and status = 'queued'
   order by id
   limit 1;
  if next_run is null then
    if exists (select 1 from cron.job where jobname = 'dispatch-comext-imports') then
      perform cron.unschedule('dispatch-comext-imports');
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
     where source_id = 'eurostat-comext' and status = 'queued';
    raise warning 'Comext imports stopped: set the Vault secrets project_url and anon_key';
    return;
  end if;

  update public.import_runs set dispatched_at = now() where id = next_run;
  perform net.http_post(
    url := project_url || '/functions/v1/import-comext',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || anon_key
    ),
    body := jsonb_build_object('run_id', next_run),
    timeout_milliseconds := 30000
  );
end;
$$;

revoke all on function private.dispatch_comext_imports()
  from public, anon, authenticated;

-- Queues one run per year, reporter and flow, newest year first, and
-- starts posting them. pg_cron calls it every month; call it by hand for a
-- backfill, for example select private.start_comext_imports(2021, 2023);
create or replace function private.start_comext_imports(
  from_year integer,
  to_year integer default extract(year from now())::integer
)
returns setof bigint
language plpgsql
set search_path = ''
as $$
declare
  year_number integer;
  reporter_code text;
  flow_name text;
  run_id bigint;
begin
  if from_year > to_year then
    raise exception 'from_year % is after to_year %', from_year, to_year;
  end if;
  if not exists (select 1 from vault.decrypted_secrets where name = 'project_url')
     or not exists (select 1 from vault.decrypted_secrets where name = 'anon_key') then
    raise warning 'Comext imports not started: set the Vault secrets project_url and anon_key';
    return;
  end if;

  for year_number in reverse to_year..from_year loop
    foreach reporter_code in array array['ES', 'PT', 'FR', 'IT'] loop
      foreach flow_name in array array['export', 'import'] loop
        insert into public.import_runs (source_id, scope, job)
        values (
          'eurostat-comext',
          format('%s %s %s', reporter_code, flow_name, year_number),
          jsonb_build_object(
            'reporter', reporter_code,
            'flow', flow_name,
            'year', year_number
          )
        )
        returning id into run_id;
        return next run_id;
      end loop;
    end loop;
  end loop;

  perform cron.schedule(
    'dispatch-comext-imports',
    '20 seconds',
    'select private.dispatch_comext_imports()'
  );
  perform private.dispatch_comext_imports();
end;
$$;

revoke all on function private.start_comext_imports(integer, integer)
  from public, anon, authenticated;
