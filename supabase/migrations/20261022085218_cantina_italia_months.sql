-- Italy's stock imports by month: a run of the import-cantina-italia
-- function now reads one report, the month's, since four spreadsheets
-- of 2024 in one run exceeded the function's CPU time.
-- start_cantina_italia_imports() queues one run per closing month, from
-- December of the year before from_year, whose report the ministry
-- lists under from_year, to the last month that has ended. After
-- deploying the function, backfill a year at a time, to spare the
-- ministry's server a hundred downloads at once:
-- select private.start_cantina_italia_imports(2019, 2019);

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

  -- The last month that has ended: its report comes out 8 to 12 days
  -- later.
  last_closing := (date_trunc('month', now()) - interval '1 month')::date;
  closing := make_date(from_year - 1, 12, 1);
  while closing <= least(make_date(to_year, 12, 1), last_closing) loop
    insert into public.import_runs (source_id, scope, job, dispatched_at)
    values (
      'icqrf-cantina-italia',
      to_char(closing, 'YYYY-MM'),
      jsonb_build_object(
        'year', extract(year from closing)::integer,
        'month', extract(month from closing)::integer
      ),
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
    closing := (closing + interval '1 month')::date;
  end loop;
end;
$$;

-- A month's report appears 8 to 12 days after the month ends, on no fixed
-- day, so the job checks every Thursday. It re-reads the months of the
-- current year that have ended and December of the year before, whose
-- report arrives in January.
select cron.unschedule(jobid) from cron.job where jobname = 'import-cantina-italia';
select cron.schedule(
  'import-cantina-italia',
  '51 6 * * 4',
  $$select private.start_cantina_italia_imports(extract(year from now())::integer)$$
);
