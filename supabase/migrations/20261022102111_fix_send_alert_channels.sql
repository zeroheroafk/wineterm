-- private.send_alert() appended each channel's name to its text[] with
-- `channels || 'webhook'`, which PostgreSQL reads as array concatenation
-- and fails on ("malformed array literal") the moment a channel is
-- configured, so private.check_imports() could never deliver a report.
-- array_append() says what was meant.

create or replace function private.send_alert(subject text, body text)
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
    channels := array_append(channels, 'webhook');
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
    channels := array_append(channels, 'email');
  end if;

  if channels = '{}' then
    raise warning 'Import alert not sent, no channel configured (Vault secrets alert_webhook_url, or resend_api_key and alert_email_to): % / %', subject, body;
  end if;
  return channels;
end;
$$;

revoke all on function private.send_alert(text, text)
  from public, anon, authenticated;
