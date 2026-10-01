-- Market data, mirroring src/services/markets/types.ts: the source
-- registry, price series definitions and their dated observations.
-- Everything here is published on the site, so the public may read it;
-- only the server (secret key) and migrations write. Supply, trade and
-- harvest data get their own tables when they move off fixtures.

create table public.sources (
  id text primary key,
  name text not null,
  kind text not null
    check (kind in ('official-bulletin', 'regional-observatory', 'cooperative-network', 'trade-reporting', 'wineterm')),
  classification text not null
    check (classification in ('official', 'reported', 'indicative', 'modelled', 'estimated')),
  coverage text not null,
  cadence text not null,
  note text not null,
  url text,
  is_sample boolean not null default false
);

comment on table public.sources is
  'Registry of data sources. Every series and observation cites one; samples are flagged.';

create table public.market_series (
  code text primary key,
  kind text not null check (kind in ('bulk-wine', 'grape', 'must')),
  name text not null,
  country text not null check (country ~ '^[A-Z]{2}$'),
  region text not null,
  appellation text,
  colour text check (colour in ('red', 'white', 'rose')),
  classification text check (classification in ('no-gi', 'pgi', 'pdo')),
  category text check (category in ('generic', 'varietal', 'organic')),
  variety text,
  quality_category text,
  harvest_year smallint,
  must_product text check (must_product in ('grape-must', 'concentrated-must', 'rcgm')),
  spec text,
  product text not null,
  unit text not null check (unit in ('EUR/hl', 'EUR/litre', 'EUR/kg', 'EUR/100kg', 'EUR/tonne')),
  currency text not null default 'EUR' check (currency = 'EUR'),
  campaign text not null check (campaign ~ '^[0-9]{4}/[0-9]{2}$'),
  source_id text not null references public.sources (id),
  source_type text not null
    check (source_type in ('official', 'contract', 'coop-settlement', 'buyer-announcement', 'reported-range', 'wineterm-estimate')),
  verification text not null check (verification in ('verified', 'reported', 'unverified')),
  methodology text not null
);

comment on table public.market_series is
  'Price series definitions (bulk wine, grapes, must). Units are never converted in storage.';

create index market_series_kind_idx on public.market_series (kind);
create index market_series_source_id_idx on public.market_series (source_id);

create table public.market_observations (
  series_code text not null references public.market_series (code) on delete cascade,
  observed_on date not null,
  value numeric(12, 4) not null,
  min_value numeric(12, 4),
  max_value numeric(12, 4),
  status text not null
    check (status in ('final', 'provisional', 'estimate', 'forecast', 'illustrative')),
  published_at timestamptz not null,
  updated_at timestamptz not null default now(),
  revised boolean not null default false,
  primary key (series_code, observed_on),
  check (min_value is null or max_value is null or min_value <= max_value)
);

comment on table public.market_observations is
  'Dated observations of a series, in the series unit. revised marks corrections of earlier publications.';

alter table public.sources enable row level security;
alter table public.market_series enable row level security;
alter table public.market_observations enable row level security;

revoke all on table public.sources, public.market_series, public.market_observations
  from anon, authenticated;
grant select on table public.sources, public.market_series, public.market_observations
  to anon, authenticated;
grant select, insert, update, delete
  on table public.sources, public.market_series, public.market_observations to service_role;

create policy "Sources are public"
  on public.sources for select to anon, authenticated using (true);
create policy "Market series are public"
  on public.market_series for select to anon, authenticated using (true);
create policy "Market observations are public"
  on public.market_observations for select to anon, authenticated using (true);
