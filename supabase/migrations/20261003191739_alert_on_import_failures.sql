-- Alerts when an import fails, gets stuck or stops running. Until now a
-- failed run was only a row in import_runs, and a pg_cron job that
-- stopped firing, or Vault secrets that went missing, left no trace but
-- stale prices. private.check_imports() runs every morning after the
-- import jobs, collects what went wrong since the last check and sends
-- it once:
--
--   * failed runs not yet reported, unless a later run of the same
--     source and scope succeeded;
--   * runs queued or running for more than a day;
--   * sources whose last successful run is older than their schedule
--     allows (private.import_schedule), reported once per silence.
--
-- The message goes to the Vault secret alert_webhook_url as JSON
-- {"text": ...}, the shape Slack, Discord ("content" is added too) and
-- most automation services accept, and by e-mail through Resend when
-- the secrets resend_api_key and alert_email_to are set (optional
-- alert_email_from, which defaults to Resend's onboarding sender).
-- Without any of them it only raises a warning, like the import jobs.

alter table public.import_runs
  add column alerted_at timestamptz;

comment on column public.import_runs.alerted_at is
  'When private.check_imports() reported this failed run, or decided it needed no report; null until then.';

-- How long each source may go without a successful run before it counts
-- as silent: its schedule plus a margin for a failed or skipped run.
create table private.import_schedule (
  source_id text primary key references public.sources (id),
  max_silence interval not null,
  silent_since timestamptz,
  silence_alerted_at timestamptz
);

comment on table private.import_schedule is
  'How often each import must succeed, and whether its current silence has been reported.';

insert into private.import_schedule (source_id, max_silence) values
  ('mapa-pmn', interval '5 days'),
  ('mapa-isc', interval '5 days'),
  ('mapa-infovi', interval '9 days'),
  ('draaf-occitanie', interval '9 days'),
  ('eurostat-comext', interval '35 days');

-- Sends one alert through every channel configured in Vault. Returns the
-- channels used, or none when no secret is set.
create function private.send_alert(subject text, body text)
returns text[]
language plpgsql
set search_path = ''
as $$
declare
  webhook_url text;
  resend_key text;
  email_to text;
  email_from text;
  channels text[] := '{}';
begin
  select decrypted_secret into webhook_url
    from vault.decrypted_secrets where name = 'alert_webhook_url';
  select decrypted_secret into resend_key
    from vault.decrypted_secrets where name = 'resend_api_key';
  select decrypted_secret into email_to
    from vault.decrypted_secrets where name = 'alert_email_to';
  select decrypted_secret into email_from
    from vault.decrypted_secrets where name = 'alert_email_from';

  if webhook_url is not null then
    perform net.http_post(
      url := webhook_url,
      headers := jsonb_build_object('Content-Type', 'application/json'),
      body := jsonb_build_object(
        'text', subject || E'\n\n' || body,
        'content', left(subject || E'\n\n' || body, 1900)
      ),
      timeout_milliseconds := 15000
    );
    channels := channels || 'webhook';
  end if;

  if resend_key is not null and email_to is not null then
    perform net.http_post(
      url := 'https://api.resend.com/emails',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || resend_key
      ),
      body := jsonb_build_object(
        'from', coalesce(email_from, 'WineTerm imports <onboarding@resend.dev>'),
        'to', jsonb_build_array(email_to),
        'subject', subject,
        'text', body
      ),
      timeout_milliseconds := 15000
    );
    channels := channels || 'email';
  end if;

  if channels = '{}' then
    raise warning 'Import alert not sent, no channel configured (Vault secrets alert_webhook_url, or resend_api_key and alert_email_to): % / %', subject, body;
  end if;
  return channels;
end;
$$;

revoke all on function private.send_alert(text, text) from public, anon, authenticated;

-- Collects the problems since the last check and sends them as one
-- message. Returns the message, or null when there was nothing to report.
create function private.check_imports()
returns text
language plpgsql
set search_path = ''
as $$
declare
  lines text[] := '{}';
  run record;
  src record;
  message text;
  stuck_after constant interval := interval '1 day';
begin
  -- Failed runs not reported yet. A failure that a later run of the same
  -- source and scope has made good is marked as seen without a line.
  for run in
    select r.id, r.source_id, r.scope, r.finished_at, r.error,
           exists (
             select 1 from public.import_runs later
              where later.source_id = r.source_id
                and later.scope = r.scope
                and later.status = 'succeeded'
                and later.id > r.id
           ) as recovered
      from public.import_runs r
     where r.status = 'failed' and r.alerted_at is null
     order by r.id
  loop
    if not run.recovered then
      lines := lines || format(
        '- %s %s: run %s failed at %s: %s',
        run.source_id, run.scope, run.id,
        to_char(run.finished_at at time zone 'UTC', 'YYYY-MM-DD HH24:MI'),
        coalesce(left(run.error, 300), 'no error recorded')
      );
    end if;
    update public.import_runs set alerted_at = now() where id = run.id;
  end loop;

  -- Runs that never finished. Reported every day they stay so, since the
  -- dispatchers normally close them within minutes.
  for run in
    select id, source_id, scope, status, queued_at
      from public.import_runs
     where status in ('queued', 'running')
       and queued_at < now() - stuck_after
     order by id
  loop
    lines := lines || format(
      '- %s %s: run %s still %s since %s',
      run.source_id, run.scope, run.id, run.status,
      to_char(run.queued_at at time zone 'UTC', 'YYYY-MM-DD HH24:MI')
    );
  end loop;

  -- Sources without a successful run within their allowance, once per
  -- silence: a success clears the record, and the next silence is a
  -- new alert.
  for src in
    select s.source_id, s.max_silence, s.silence_alerted_at,
           (select max(finished_at) from public.import_runs r
             where r.source_id = s.source_id and r.status = 'succeeded') as last_success
      from private.import_schedule s
  loop
    if src.last_success is null or src.last_success < now() - src.max_silence then
      if src.silence_alerted_at is null or src.silence_alerted_at < coalesce(src.last_success, '-infinity') then
        lines := lines || format(
          '- %s: no successful run since %s (allowed %s); check the pg_cron job, the Vault secrets and the Edge Function logs',
          src.source_id,
          coalesce(to_char(src.last_success at time zone 'UTC', 'YYYY-MM-DD HH24:MI'), 'ever'),
          src.max_silence
        );
        update private.import_schedule
           set silence_alerted_at = now(),
               silent_since = coalesce(silent_since, now())
         where source_id = src.source_id;
      end if;
    elsif src.silence_alerted_at is not null then
      update private.import_schedule
         set silence_alerted_at = null, silent_since = null
       where source_id = src.source_id;
    end if;
  end loop;

  if lines = '{}' then
    return null;
  end if;

  message := array_to_string(lines, E'\n');
  perform private.send_alert(
    format('WineTerm imports: %s problem%s', array_length(lines, 1),
           case when array_length(lines, 1) = 1 then '' else 's' end),
    message || E'\n\nselect * from import_runs order by id desc;'
  );
  return message;
end;
$$;

revoke all on function private.check_imports() from public, anon, authenticated;

-- Every morning, after the import jobs (06:17 to 06:43 UTC) have had
-- time to finish.
select cron.schedule(
  'check-imports',
  '13 7 * * *',
  $$select private.check_imports()$$
);
