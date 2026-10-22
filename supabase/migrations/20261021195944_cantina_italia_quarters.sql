-- Italy's stock imports in quarters: a run of the import-cantina-italia
-- function now reads the reports published in one quarter of a year, at
-- most four spreadsheets, since a run of seven did not always finish
-- within its time. start_cantina_italia_imports() queues four runs per
-- year instead of two. After deploying the function, queue the runs with
-- select private.start_cantina_italia_imports(2018);

create or replace function private.start_cantina_italia_imports(
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
  part integer;
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
    foreach part in array array[4, 3, 2, 1] loop
      insert into public.import_runs (source_id, scope, job, dispatched_at)
      values (
        'icqrf-cantina-italia',
        format('%s Q%s', year_number, part),
        jsonb_build_object('year', year_number, 'part', part),
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
