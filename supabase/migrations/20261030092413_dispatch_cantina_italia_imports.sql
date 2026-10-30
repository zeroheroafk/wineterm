-- Cantina Italia runs one at a time. start_cantina_italia_imports()
-- posted the year's runs at once, and on 29 October the Edge Runtime
-- handed nine of the ten to one worker, whose CPU time they share: the
-- worker stopped with "CPU Time exceeded" after 2.3 seconds and left six
-- runs running, never to record an outcome. The function now only queues
-- the runs; the pg_cron job dispatch-cantina-italia-imports posts them one
-- at a time, as dispatch-mapa-market-imports does for the MAPA markets,
-- and removes itself when none is left. A backfill no longer needs to go
-- a year at a time to spare the ministry's server: it gets one download
-- at a time.

-- The six runs the worker took with it.
update public.import_runs
   set status = 'failed', finished_at = now(),
       error = 'CPU Time exceeded: nine runs posted at once shared one worker'
 where source_id = 'icqrf-cantina-italia' and status = 'running';

-- Posts the oldest queued Cantina Italia run once no other is in flight,
-- and removes itself when none is left. It reads the project URL and the
-- anon key from Vault, secrets project_url and anon_key.
create function private.dispatch_cantina_italia_imports()
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
   where source_id = 'icqrf-cantina-italia'
     and status = 'running'
     and started_at < now() - interval '5 minutes';
  update public.import_runs
     set status = 'failed', finished_at = now(), error = 'Never started'
   where source_id = 'icqrf-cantina-italia'
     and status = 'queued'
     and dispatched_at < now() - interval '5 minutes';

  if exists (
    select 1
      from public.import_runs
     where source_id = 'icqrf-cantina-italia'
       and (status = 'running' or (status = 'queued' and dispatched_at is not null))
  ) then
    return;
  end if;

  select id into next_run
    from public.import_runs
   where source_id = 'icqrf-cantina-italia' and status = 'queued'
   order by id
   limit 1;
  if next_run is null then
    if exists (select 1 from cron.job where jobname = 'dispatch-cantina-italia-imports') then
      perform cron.unschedule('dispatch-cantina-italia-imports');
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
     where source_id = 'icqrf-cantina-italia' and status = 'queued';
    raise warning 'Cantina Italia imports stopped: set the Vault secrets project_url and anon_key';
    return;
  end if;

  update public.import_runs set dispatched_at = now() where id = next_run;
  perform net.http_post(
    url := project_url || '/functions/v1/import-cantina-italia',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || anon_key
    ),
    body := jsonb_build_object('run_id', next_run),
    timeout_milliseconds := 30000
  );
end;
$$;

revoke all on function private.dispatch_cantina_italia_imports()
  from public, anon, authenticated;

-- Queues one run per closing month, from December of the year before
-- from_year, whose report the ministry lists under from_year, to the last
-- month that has ended, and starts posting them.
create or replace function private.start_cantina_italia_imports(
  from_year integer,
  to_year integer default extract(year from now())::integer
)
returns setof bigint
language plpgsql
set search_path = ''
as $$
declare
  closing date;
  last_closing date;
  run_id bigint;
begin
  if from_year < 2019 then
    raise exception 'from_year % is before 2019: the earlier bulletins lay the figures out in other sheets', from_year;
  end if;
  if from_year > to_year then
    raise exception 'from_year % is after to_year %', from_year, to_year;
  end if;
  if not exists (select 1 from vault.decrypted_secrets where name = 'project_url')
     or not exists (select 1 from vault.decrypted_secrets where name = 'anon_key') then
    raise warning 'Cantina Italia imports not started: set the Vault secrets project_url and anon_key';
    return;
  end if;

  -- The last month that has ended: its report comes out 8 to 12 days
  -- later.
  last_closing := (date_trunc('month', now()) - interval '1 month')::date;
  closing := make_date(from_year - 1, 12, 1);
  while closing <= least(make_date(to_year, 12, 1), last_closing) loop
    insert into public.import_runs (source_id, scope, job)
    values (
      'icqrf-cantina-italia',
      to_char(closing, 'YYYY-MM'),
      jsonb_build_object(
        'year', extract(year from closing)::integer,
        'month', extract(month from closing)::integer
      )
    )
    returning id into run_id;
    return next run_id;
    closing := (closing + interval '1 month')::date;
  end loop;

  perform cron.schedule(
    'dispatch-cantina-italia-imports',
    '20 seconds',
    'select private.dispatch_cantina_italia_imports()'
  );
  perform private.dispatch_cantina_italia_imports();
end;
$$;
