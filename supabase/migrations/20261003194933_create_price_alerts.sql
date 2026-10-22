-- Reconstructed on 22 October 2026 from the database, where this
-- migration had been applied without its file reaching the repository:
-- the table is as the catalog describes it. Nothing on the site writes
-- to it yet, and the anon role holds no grant on it, so its insert
-- policy is not exercised.

create table if not exists public.price_alerts (
  id uuid primary key default gen_random_uuid(),
  email text not null
    check (
      char_length(email) <= 254
      and email = lower(email)
      and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    ),
  series_code text not null
    references public.market_series (code) on delete cascade,
  condition text not null default 'new'
    check (condition in ('new', 'above', 'below')),
  threshold numeric(12, 4)
    check (threshold is null or threshold > 0),
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'unsubscribed')),
  created_at timestamptz not null default now(),
  check ((condition = 'new') = (threshold is null)),
  unique (email, series_code, condition)
);

comment on table public.price_alerts is
  'Price alert requests from the series pages. Inserted by the site (anon, insert-only); read by the desk. Status stays pending until delivery exists.';

create index if not exists price_alerts_series_code_idx
  on public.price_alerts (series_code);

alter table public.price_alerts enable row level security;

revoke all on table public.price_alerts from anon, authenticated;
grant select, insert, update, delete on table public.price_alerts to service_role;

create policy "Anyone can request a price alert"
  on public.price_alerts for insert to anon
  with check (status = 'pending');
