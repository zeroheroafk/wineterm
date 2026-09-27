-- Starts Comext imports from the database. start_comext_imports() queues
-- one run per reporter and flow in public.import_runs and asks the
-- import-comext Edge Function to execute each. pg_cron calls it every
-- month; call it by hand for a backfill, for example
-- select private.start_comext_imports(2021, 2023);
--
-- It reads the project URL and the anon key from Vault, secrets
-- project_url and anon_key, which are set per project and never
-- committed. Without them it only raises a warning.

create extension if not exists pg_cron;

create function private.start_comext_imports(
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
  reporter_code text;
  flow_name text;
  run_id bigint;
begin
  select decrypted_secret into project_url
    from vault.decrypted_secrets where name = 'project_url';
  select decrypted_secret into anon_key
    from vault.decrypted_secrets where name = 'anon_key';
  if project_url is null or anon_key is null then
    raise warning 'Comext imports not started: set the Vault secrets project_url and anon_key';
    return;
  end if;

  -- Close runs left behind: a function stopped at its time limit never
  -- records an outcome, and a request that never arrived leaves its run
  -- queued.
  update public.import_runs
     set status = 'failed', finished_at = now(), error = 'Did not finish'
   where source_id = 'eurostat-comext'
     and status = 'running'
     and started_at < now() - interval '15 minutes';
  update public.import_runs
     set status = 'failed', finished_at = now(), error = 'Never started'
   where source_id = 'eurostat-comext'
     and status = 'queued'
     and queued_at < now() - interval '15 minutes';

  foreach reporter_code in array array['ES', 'PT', 'FR', 'IT'] loop
    foreach flow_name in array array['export', 'import'] loop
      insert into public.import_runs (source_id, scope, job)
      values (
        'eurostat-comext',
        reporter_code || ' ' || flow_name,
        jsonb_build_object(
          'reporter', reporter_code,
          'flow', flow_name,
          'from_year', from_year,
          'to_year', to_year
        )
      )
      returning id into run_id;

      perform net.http_post(
        url := project_url || '/functions/v1/import-comext',
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

revoke all on function private.start_comext_imports(integer, integer)
  from public, anon, authenticated;

-- Comext publishes around the middle of the month. On the 20th, refresh
-- the current and the previous year, which also picks up revisions.
select cron.schedule(
  'import-comext-monthly',
  '37 5 20 * *',
  $$select private.start_comext_imports(extract(year from now())::integer - 1)$$
);
