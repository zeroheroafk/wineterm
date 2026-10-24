-- What a bottle of wine is worth when it leaves Spain, Portugal, France
-- and Italy, for the Consumer pages: aggregates of public.trade_flows, as
-- the trade aggregates are, for the two subheadings sold mostly in
-- bottles, still wine in containers of up to 2 litres (CN 2204 21) and
-- sparkling wine (CN 2204 10). The site divides each value by its litres
-- and shows the result per 75 cl bottle.
--
-- They run with the caller's rights (anon may read trade_flows) and take
-- the last month of the reference period, trade_latest_month(): the
-- twelve months to it are compared with the twelve months before. Volumes
-- are litres, and litres_complete is false when a row in the group has no
-- litres, so the site never divides a value by part of its volume.

-- Each reporter's exports to the world and to its leading destinations,
-- per subheading. Partner aggregates and Comext's codes for stores and
-- unspecified countries (QP to QZ) are left out of the ranking; the world
-- total comes first, as place 0.
create function public.trade_bottle_destinations(end_month date, top_n integer default 8)
returns table (
  product text,
  reporter text,
  partner text,
  place bigint,
  litres numeric,
  value_eur numeric,
  litres_prior_year numeric,
  value_eur_prior_year numeric,
  litres_complete boolean
)
language sql
stable
set search_path = ''
as $$
  with totals as (
    select t.product,
           t.reporter,
           t.partner,
           sum(t.quantity_l) filter (where t.period > end_month - interval '12 months') as litres,
           sum(t.value_eur) filter (where t.period > end_month - interval '12 months') as value_eur,
           sum(t.quantity_l) filter (where t.period <= end_month - interval '12 months') as litres_prior_year,
           sum(t.value_eur) filter (where t.period <= end_month - interval '12 months') as value_eur_prior_year,
           bool_and(t.quantity_l is not null) as litres_complete
      from public.trade_flows as t
     where t.flow = 'export'
       and t.product in ('220410', '220421')
       and t.partner !~ '^(EXT_EU27_2020|INT_EU27_2020|Q[P-Z])$'
       and t.period > end_month - interval '24 months'
       and t.period <= end_month
     group by t.product, t.reporter, t.partner
  ),
  ranked as (
    select totals.*,
           case
             when totals.partner = 'WORLD' then 0
             else row_number() over (
               partition by totals.product, totals.reporter, totals.partner = 'WORLD'
               order by totals.litres desc nulls last, totals.partner
             )
           end as place
      from totals
  )
  select r.product, r.reporter, r.partner, r.place, r.litres, r.value_eur,
         r.litres_prior_year, r.value_eur_prior_year, r.litres_complete
    from ranked as r
   where r.place <= top_n
   order by r.product, r.reporter, r.place
$$;

-- Each reporter's exports to the world per subheading and month.
create function public.trade_bottle_monthly(end_month date, months integer default 36)
returns table (
  product text,
  reporter text,
  period date,
  litres numeric,
  value_eur numeric,
  litres_complete boolean
)
language sql
stable
set search_path = ''
as $$
  select t.product,
         t.reporter,
         t.period,
         t.quantity_l,
         t.value_eur,
         t.quantity_l is not null
    from public.trade_flows as t
   where t.flow = 'export'
     and t.partner = 'WORLD'
     and t.product in ('220410', '220421')
     and t.period > end_month - make_interval(months => months)
     and t.period <= end_month
   order by t.product, t.reporter, t.period
$$;

grant execute on function
  public.trade_bottle_destinations(date, integer),
  public.trade_bottle_monthly(date, integer)
  to anon, authenticated, service_role;
