-- Weekly Briefing signups and contact messages. The site's Server Actions
-- write them through the Data API with the publishable key (role anon):
-- the public may insert a whitelisted set of columns and read nothing.
-- The desk reads submissions in the dashboard or with the secret key.

create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique
    check (
      char_length(email) <= 254
      and email = lower(email)
      and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    ),
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'unsubscribed')),
  created_at timestamptz not null default now()
);

comment on table public.newsletter_subscribers is
  'Weekly Briefing signups. Inserted by the site (anon, insert-only). Status stays pending until a confirmation step exists.';

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 200),
  email text not null
    check (
      char_length(email) <= 254
      and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    ),
  organisation text check (char_length(organisation) <= 200),
  subject text not null check (char_length(subject) between 1 and 100),
  message text not null check (char_length(btrim(message)) between 1 and 5000),
  created_at timestamptz not null default now()
);

comment on table public.contact_messages is
  'Messages from the contact page. Inserted by the site (anon, insert-only); read by the desk.';

-- Signing up an address already on the list succeeds silently instead of
-- failing on the unique constraint, so the API never reveals whether an
-- address is subscribed. Lives in a schema the Data API does not expose.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create function private.skip_existing_subscriber()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if exists (
    select 1 from public.newsletter_subscribers where email = new.email
  ) then
    return null;
  end if;
  return new;
end;
$$;

revoke all on function private.skip_existing_subscriber() from public, anon, authenticated;

create trigger skip_existing_subscriber
  before insert on public.newsletter_subscribers
  for each row execute function private.skip_existing_subscriber();

alter table public.newsletter_subscribers enable row level security;
alter table public.contact_messages enable row level security;

revoke all on table public.newsletter_subscribers, public.contact_messages
  from anon, authenticated;
grant insert (email) on table public.newsletter_subscribers to anon;
grant insert (name, email, organisation, subject, message)
  on table public.contact_messages to anon;
grant select, insert, update, delete
  on table public.newsletter_subscribers, public.contact_messages to service_role;

create policy "Anyone can sign up for the briefing"
  on public.newsletter_subscribers
  for insert to anon
  with check (status = 'pending');

create policy "Anyone can send a contact message"
  on public.contact_messages
  for insert to anon
  with check (true);
