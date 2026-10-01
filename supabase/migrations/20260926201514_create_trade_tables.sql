-- Monthly EU trade in wine (CN heading 2204) from Eurostat Comext, and the
-- queue and log of the import runs that load it. Trade flows are published
-- on the site, so the public may read them; only the import job (secret
-- key) writes. import_runs is internal: no public access at all.

insert into public.sources (id, name, kind, classification, coverage, cadence, note, url)
values (
  'eurostat-comext',
  'Eurostat Comext, EU trade by CN8 (DS-045409)',
  'official-bulletin',
  'official',
  'EU member states'' trade with every partner; WineTerm imports heading 2204 for Spain, Portugal, France and Italy',
  'Monthly, mid-month, for the month two months earlier; recent months are revised',
  'Official customs and intra-EU trade statistics, imported unchanged: value in euros and net mass. Source: Eurostat, CC BY 4.0.',
  'https://ec.europa.eu/eurostat/web/international-trade-in-goods/database'
);

create table public.trade_flows (
  reporter text not null check (reporter ~ '^[A-Z]{2}$'),
  partner text not null
    check (partner ~ '^[A-Z]{2}$' or partner in ('WORLD', 'EXT_EU27_2020', 'INT_EU27_2020')),
  product text not null check (product ~ '^2204([0-9]{2}){0,2}$'),
  flow text not null check (flow in ('import', 'export')),
  period date not null check (extract(day from period) = 1),
  value_eur numeric(16, 2) check (value_eur >= 0),
  quantity_kg numeric(16, 2) check (quantity_kg >= 0),
  source_id text not null references public.sources (id),
  imported_at timestamptz not null default now(),
  primary key (reporter, partner, product, flow, period),
  check (value_eur is not null or quantity_kg is not null)
);

comment on table public.trade_flows is
  'Monthly trade by reporter, partner, CN product and flow, as published by the source. Partners are ISO country codes or the aggregates WORLD, EXT_EU27_2020 (extra-EU) and INT_EU27_2020 (intra-EU).';
comment on column public.trade_flows.period is 'First day of the reference month.';
comment on column public.trade_flows.value_eur is 'Statistical value in euros.';
comment on column public.trade_flows.quantity_kg is
  'Net mass in kilograms (Comext publishes 100 kg units). A mass, not a volume.';

create index trade_flows_reporter_flow_product_period_idx
  on public.trade_flows (reporter, flow, product, period);
create index trade_flows_source_id_idx on public.trade_flows (source_id);

create table public.import_runs (
  id bigint generated always as identity primary key,
  source_id text not null references public.sources (id),
  scope text not null check (char_length(scope) between 1 and 100),
  job jsonb not null check (jsonb_typeof(job) = 'object'),
  status text not null default 'queued'
    check (status in ('queued', 'running', 'succeeded', 'failed')),
  queued_at timestamptz not null default now(),
  started_at timestamptz,
  finished_at timestamptz,
  rows_upserted integer check (rows_upserted >= 0),
  rows_deleted integer check (rows_deleted >= 0),
  error text
);

comment on table public.import_runs is
  'Queue and log of data imports. The database queues runs; import Edge Functions execute only queued runs and record the outcome. Internal: service role only.';
comment on column public.import_runs.scope is
  'What the run refreshes, e.g. "PT export". At most one run per source and scope runs at a time.';

create unique index import_runs_one_running_idx
  on public.import_runs (source_id, scope) where status = 'running';
create index import_runs_source_id_queued_at_idx
  on public.import_runs (source_id, queued_at desc);

alter table public.trade_flows enable row level security;
alter table public.import_runs enable row level security;

revoke all on table public.trade_flows, public.import_runs from anon, authenticated;
grant select on table public.trade_flows to anon, authenticated;
grant select, insert, update, delete
  on table public.trade_flows, public.import_runs to service_role;

create policy "Trade flows are public"
  on public.trade_flows for select to anon, authenticated using (true);

-- import_runs has no policy on purpose: only the service role, which
-- bypasses row level security, may read or write it.
