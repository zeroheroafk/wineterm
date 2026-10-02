-- One bulk wine price per country instead of separate export and import
-- averages. Portugal, France and Italy keep the average price of the
-- bulk wine they export, their own wine, as their national bulk price,
-- under new codes; the import averages, mostly Spanish wine, and Spain's
-- export average, Spain's price being MAPA's official national average,
-- are no longer computed, so the refresh at the end clears their
-- observations and the site, which lists only series with observations,
-- stops showing them. drop_unused_trade_price_series then removes the
-- empty series. The source is renamed after where the figures come from;
-- whether a price is official or a WineTerm calculation is explained on
-- the methodology page.

update public.sources
   set name = 'Eurostat Comext, calculated by WineTerm',
       coverage = 'Portugal, France and Italy: average price per hectolitre of the bulk wine each exports',
       note = 'WineTerm divides the statistical value of each month''s exports of wine in containers over 10 litres (CN 2204 29) by their volume in litres, both as Eurostat publishes them. The result averages every colour, category and destination, valued at the border. Data: Eurostat Comext, CC BY 4.0.'
 where id = 'wineterm-trade-estimate';

insert into public.market_series (
  code, kind, name, country, region, product, unit, campaign, source_id,
  source_type, verification, methodology
)
select series.code, 'bulk-wine', series.name, series.country, 'National average',
       'Bulk wine, all colours and categories', 'EUR/hl', old.campaign,
       'wineterm-trade-estimate', 'wineterm-estimate', 'verified',
       format(
         'Monthly average price of the bulk wine %s exports: the statistical value of its exports of wine in containers over 10 litres (CN 2204 29) divided by their volume in litres, from Eurostat Comext, per hectolitre. It covers every colour, category and destination, valued at the border, so it moves with the mix of wines sold as well as with prices.%s Each month is dated to its last day and arrives about two months later, when Eurostat publishes it; Eurostat''s revisions are applied as they come.',
         series.country_name,
         series.caveat
       )
  from (
    values
      ('PT-NAT-BULK', 'PT-BULK-EXP', 'Portugal bulk wine, national average', 'PT', 'Portugal',
       ' The volumes are small, a few million litres a month, so single months move more than the market.'),
      ('FR-NAT-BULK', 'FR-BULK-EXP', 'France bulk wine, national average', 'FR', 'France',
       ' French bulk exports include much wine with a PDO, so the average sits well above the price of wine without GI.'),
      ('IT-NAT-BULK', 'IT-BULK-EXP', 'Italy bulk wine, national average', 'IT', 'Italy',
       ' Italian bulk exports include much wine with a PDO or PGI, so the average sits above the price of common wine.')
  ) as series (code, old_code, name, country, country_name, caveat)
  join public.market_series as old on old.code = series.old_code;

update public.market_observations as o
   set series_code = map.code
  from (
    values
      ('PT-BULK-EXP', 'PT-NAT-BULK'),
      ('FR-BULK-EXP', 'FR-NAT-BULK'),
      ('IT-BULK-EXP', 'IT-NAT-BULK')
  ) as map (old_code, code)
 where o.series_code = map.old_code;

create or replace function private.trade_price_estimates()
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
        ('PT-NAT-BULK', 'PT'),
        ('FR-NAT-BULK', 'FR'),
        ('IT-NAT-BULK', 'IT')
    ) as series (code, reporter)
    join public.trade_flows as t
      on t.reporter = series.reporter
     and t.flow = 'export'
     and t.partner = 'WORLD'
     and t.product = '220429'
   where t.value_eur is not null
     and t.quantity_l > 0
$$;

select private.refresh_trade_price_estimates();
