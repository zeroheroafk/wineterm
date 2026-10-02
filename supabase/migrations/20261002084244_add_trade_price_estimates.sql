-- Monthly WineTerm estimates of bulk wine prices, computed from the
-- Eurostat Comext figures already in public.trade_flows: the source, seven
-- series and the function that keeps their observations in step with the
-- trade figures.
--
-- Each observation is the statistical value of a month's trade in wine in
-- containers over 10 litres (CN 2204 29) divided by its volume in litres,
-- in EUR/hl: Spain's, Portugal's, France's and Italy's exports, and the
-- imports of Portugal, France and Italy, mostly Spanish wine. Spain's
-- imports are left out: a few million litres a month of mixed origin,
-- whose average swings too much to read as a price. Months whose litres
-- are null (their CN8 codes did not add up) get no estimate.
--
-- refresh_trade_price_estimates() recomputes every month. A new month is
-- stored with the time it was first computed as its publication date; a
-- month whose value changes, because Comext revised it, is stored as a
-- revision. dispatch_comext_imports() calls it once the last queued
-- Comext run has finished; call it by hand after loading trade figures
-- some other way: select private.refresh_trade_price_estimates();

insert into public.sources (id, name, kind, classification, coverage, cadence, note, url)
values (
  'wineterm-trade-estimate',
  'WineTerm estimate from Eurostat Comext',
  'wineterm',
  'estimated',
  'Spain, Portugal, France and Italy: average value per hectolitre of their bulk wine exports, and of the bulk wine imports of Portugal, France and Italy',
  'Monthly, after each Comext release, about two months after the month',
  'WineTerm divides the statistical value of each month''s trade in wine in containers over 10 litres (CN 2204 29) by its volume in litres, both as Eurostat publishes them. The result averages every colour, category and partner, valued at the border: an indicator of bulk prices, not a quoted ex-winery price. Data: Eurostat Comext, CC BY 4.0.',
  'https://ec.europa.eu/eurostat/web/international-trade-in-goods/database'
);

insert into public.market_series (
  code, kind, name, country, region, product, unit, campaign, source_id,
  source_type, verification, methodology
)
select code, 'bulk-wine', name, country, region,
       'Wine in containers over 10 litres (CN 2204 29), all colours and categories',
       'EUR/hl', '2025/26', 'wineterm-trade-estimate', 'wineterm-estimate',
       'verified', methodology
  from (
    values
      (
        'ES-BULK-EXP', 'Spain bulk wine exports, average value', 'ES', 'Bulk exports',
        'Monthly average value of Spain''s exports of wine in containers over 10 litres to every partner: their statistical value divided by their volume, from Eurostat Comext, per hectolitre. Each month is dated to its last day. A WineTerm estimate, not a quoted price: it averages every colour, category and destination, valued at the border, so it moves with the mix of wines as well as with prices. Since 2021 it has followed MAPA''s national ex-winery price of wine without PDO/PGI closely, 6 to 17% above it. Published is when WineTerm first computed the month; Comext''s revisions are applied as they come.'
      ),
      (
        'PT-BULK-EXP', 'Portugal bulk wine exports, average value', 'PT', 'Bulk exports',
        'Monthly average value of Portugal''s exports of wine in containers over 10 litres to every partner: their statistical value divided by their volume, from Eurostat Comext, per hectolitre. Each month is dated to its last day. A WineTerm estimate, not a quoted price: it averages every colour, category and destination, valued at the border, so it moves with the mix of wines as well as with prices. The volumes are small, a few million litres a month, so single months move more than the market. Published is when WineTerm first computed the month; Comext''s revisions are applied as they come.'
      ),
      (
        'PT-BULK-IMP', 'Portugal bulk wine imports, average value', 'PT', 'Bulk imports',
        'Monthly average value of Portugal''s imports of wine in containers over 10 litres, nearly all of it Spanish: their statistical value divided by their volume, from Eurostat Comext, per hectolitre. Each month is dated to its last day. A WineTerm estimate, not a quoted price: it averages every colour, category and origin, valued at the border, so it moves with the mix of wines as well as with prices. Published is when WineTerm first computed the month; Comext''s revisions are applied as they come.'
      ),
      (
        'FR-BULK-EXP', 'France bulk wine exports, average value', 'FR', 'Bulk exports',
        'Monthly average value of France''s exports of wine in containers over 10 litres to every partner: their statistical value divided by their volume, from Eurostat Comext, per hectolitre. Each month is dated to its last day. A WineTerm estimate, not a quoted price: it averages every colour, category and destination, valued at the border, and French bulk exports include much wine with a PDO, so it sits well above the price of wine without GI. Published is when WineTerm first computed the month; Comext''s revisions are applied as they come.'
      ),
      (
        'FR-BULK-IMP', 'France bulk wine imports, average value', 'FR', 'Bulk imports',
        'Monthly average value of France''s imports of wine in containers over 10 litres, about three quarters of it Spanish: their statistical value divided by their volume, from Eurostat Comext, per hectolitre. Each month is dated to its last day. A WineTerm estimate, not a quoted price: it averages every colour, category and origin, valued at the border, so it moves with the mix of wines as well as with prices. Published is when WineTerm first computed the month; Comext''s revisions are applied as they come.'
      ),
      (
        'IT-BULK-EXP', 'Italy bulk wine exports, average value', 'IT', 'Bulk exports',
        'Monthly average value of Italy''s exports of wine in containers over 10 litres to every partner: their statistical value divided by their volume, from Eurostat Comext, per hectolitre. Each month is dated to its last day. A WineTerm estimate, not a quoted price: it averages every colour, category and destination, valued at the border, and Italian bulk exports include much wine with a PDO or PGI, so it sits above the price of common wine. Published is when WineTerm first computed the month; Comext''s revisions are applied as they come.'
      ),
      (
        'IT-BULK-IMP', 'Italy bulk wine imports, average value', 'IT', 'Bulk imports',
        'Monthly average value of Italy''s imports of wine in containers over 10 litres, about four fifths of it Spanish: their statistical value divided by their volume, from Eurostat Comext, per hectolitre. Each month is dated to its last day. A WineTerm estimate, not a quoted price: it averages every colour, category and origin, valued at the border, so it moves with the mix of wines as well as with prices. Published is when WineTerm first computed the month; Comext''s revisions are applied as they come.'
      )
  ) as estimates (code, name, country, region, methodology);

-- The estimates as the trade figures give them now, one per series and
-- month with litres.
create function private.trade_price_estimates()
returns table (series_code text, observed_on date, value numeric)
language sql
stable
set search_path = ''
as $$
  select series.code,
         (t.period + interval '1 month' - interval '1 day')::date,
         round(t.value_eur / t.quantity_l * 100, 2)
    from (
      values
        ('ES-BULK-EXP', 'ES', 'export'),
        ('PT-BULK-EXP', 'PT', 'export'),
        ('PT-BULK-IMP', 'PT', 'import'),
        ('FR-BULK-EXP', 'FR', 'export'),
        ('FR-BULK-IMP', 'FR', 'import'),
        ('IT-BULK-EXP', 'IT', 'export'),
        ('IT-BULK-IMP', 'IT', 'import')
    ) as series (code, reporter, flow)
    join public.trade_flows as t
      on t.reporter = series.reporter
     and t.flow = series.flow
     and t.partner = 'WORLD'
     and t.product = '220429'
   where t.value_eur is not null
     and t.quantity_l > 0
$$;

revoke all on function private.trade_price_estimates()
  from public, anon, authenticated;

-- Brings the estimate series in step with the trade figures and returns
-- the number of observations added, revised or removed. Each series'
-- campaign follows its latest month.
create function private.refresh_trade_price_estimates()
returns integer
language plpgsql
set search_path = ''
as $$
declare
  changed integer;
begin
  with estimates as (
    select * from private.trade_price_estimates()
  ),
  upserted as (
    insert into public.market_observations as o
      (series_code, observed_on, value, status, published_at)
    select e.series_code, e.observed_on, e.value, 'estimate', now()
      from estimates as e
    on conflict (series_code, observed_on) do update
       set value = excluded.value,
           updated_at = now(),
           revised = true
     where o.value is distinct from excluded.value
    returning 1
  ),
  removed as (
    delete from public.market_observations as o
     using public.market_series as s
     where s.code = o.series_code
       and s.source_id = 'wineterm-trade-estimate'
       and not exists (
         select 1
           from estimates as e
          where e.series_code = o.series_code
            and e.observed_on = o.observed_on
       )
    returning 1
  )
  select (select count(*) from upserted) + (select count(*) from removed)
    into changed;

  -- Campaigns run from August to July: shifting a date back seven months
  -- lands in the year the campaign starts.
  update public.market_series as s
     set campaign = format(
           '%s/%s',
           latest.start_year,
           lpad(((latest.start_year + 1) % 100)::text, 2, '0')
         )
    from (
      select o.series_code,
             extract(year from max(o.observed_on) - interval '7 months')::integer
               as start_year
        from public.market_observations as o
       group by o.series_code
    ) as latest
   where s.code = latest.series_code
     and s.source_id = 'wineterm-trade-estimate';

  return changed;
end;
$$;

revoke all on function private.refresh_trade_price_estimates()
  from public, anon, authenticated;

-- As before, plus the refresh once the last queued run has finished. A
-- failed refresh only raises a warning, so the dispatcher still removes
-- itself.
create or replace function private.dispatch_comext_imports()
returns void
language plpgsql
set search_path = ''
as $$
declare
  project_url text;
  anon_key text;
  next_run bigint;
begin
  -- Close runs left behind: a function stopped at its time limit never
  -- records an outcome, and a post that never arrived leaves its run
  -- queued.
  update public.import_runs
     set status = 'failed', finished_at = now(), error = 'Did not finish'
   where source_id = 'eurostat-comext'
     and status = 'running'
     and started_at < now() - interval '5 minutes';
  update public.import_runs
     set status = 'failed', finished_at = now(), error = 'Never started'
   where source_id = 'eurostat-comext'
     and status = 'queued'
     and dispatched_at < now() - interval '5 minutes';

  if exists (
    select 1
      from public.import_runs
     where source_id = 'eurostat-comext'
       and (status = 'running' or (status = 'queued' and dispatched_at is not null))
  ) then
    return;
  end if;

  select id into next_run
    from public.import_runs
   where source_id = 'eurostat-comext' and status = 'queued'
   order by id
   limit 1;
  if next_run is null then
    if exists (select 1 from cron.job where jobname = 'dispatch-comext-imports') then
      begin
        perform private.refresh_trade_price_estimates();
      exception when others then
        raise warning 'Trade price estimates not refreshed: %', sqlerrm;
      end;
      perform cron.unschedule('dispatch-comext-imports');
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
     where source_id = 'eurostat-comext' and status = 'queued';
    raise warning 'Comext imports stopped: set the Vault secrets project_url and anon_key';
    return;
  end if;

  update public.import_runs set dispatched_at = now() where id = next_run;
  perform net.http_post(
    url := project_url || '/functions/v1/import-comext',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || anon_key
    ),
    body := jsonb_build_object('run_id', next_run),
    timeout_milliseconds := 30000
  );
end;
$$;

revoke all on function private.dispatch_comext_imports()
  from public, anon, authenticated;

select private.refresh_trade_price_estimates();
