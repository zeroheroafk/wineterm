-- Trade aggregates for the site.
--
-- The trade pages show the four reporters' trade by customs subheading
-- over twelve months, ranked destinations and relationships, and monthly
-- series. Paging trade_flows through the Data API to add it up on every
-- render would be slow, so these functions aggregate in the database. They
-- run with the caller's rights (anon may read trade_flows) and take the
-- last month of the reference period: the twelve months to it are compared
-- with the twelve months before, and the month itself with the one before.
--
-- Volumes are litres. litres_complete is false when a row in the group has
-- no litres, so the site never shows the volume of part of the trade.

-- The latest month published for every reporter and flow: a total over the
-- four reporters never mixes months some of them have not published yet.
create function public.trade_latest_month()
returns date
language sql
stable
set search_path = ''
as $$
  select min(scopes.latest)
    from (
      select max(t.period) as latest
        from public.trade_flows as t
       where t.partner = 'WORLD' and t.product = '2204'
       group by t.reporter, t.flow
    ) as scopes
$$;

-- Each reporter's trade with the world, per subheading and flow.
create function public.trade_totals(end_month date)
returns table (
  product text,
  flow text,
  reporter text,
  litres numeric,
  value_eur numeric,
  litres_prior_year numeric,
  value_eur_prior_year numeric,
  litres_month numeric,
  litres_prior_month numeric,
  litres_complete boolean
)
language sql
stable
set search_path = ''
as $$
  select t.product,
         t.flow,
         t.reporter,
         sum(t.quantity_l) filter (where t.period > end_month - interval '12 months'),
         sum(t.value_eur) filter (where t.period > end_month - interval '12 months'),
         sum(t.quantity_l) filter (where t.period <= end_month - interval '12 months'),
         sum(t.value_eur) filter (where t.period <= end_month - interval '12 months'),
         sum(t.quantity_l) filter (where t.period = end_month),
         sum(t.quantity_l) filter (where t.period = end_month - interval '1 month'),
         bool_and(t.quantity_l is not null)
    from public.trade_flows as t
   where t.partner = 'WORLD'
     and t.product in ('220410', '220421', '220422', '220429', '220430')
     and t.period > end_month - interval '24 months'
     and t.period <= end_month
   group by t.product, t.flow, t.reporter
$$;

-- The leading destinations of the four reporters' exports together, per
-- subheading, and for wine (every subheading but grape must). Partner
-- aggregates and Comext's codes for stores and unspecified countries
-- (QP to QZ) are left out.
create function public.trade_destinations(end_month date, top_n integer default 5)
returns table (
  product text,
  partner text,
  litres numeric,
  value_eur numeric,
  litres_prior_year numeric,
  value_eur_prior_year numeric,
  litres_month numeric,
  litres_prior_month numeric,
  litres_complete boolean
)
language sql
stable
set search_path = ''
as $$
  with groups (product, member) as (
    values
      ('220410', '220410'), ('220421', '220421'), ('220422', '220422'),
      ('220429', '220429'), ('220430', '220430'),
      ('wine', '220410'), ('wine', '220421'), ('wine', '220422'),
      ('wine', '220429')
  ),
  totals as (
    select g.product,
           t.partner,
           sum(t.quantity_l) filter (where t.period > end_month - interval '12 months') as litres,
           sum(t.value_eur) filter (where t.period > end_month - interval '12 months') as value_eur,
           sum(t.quantity_l) filter (where t.period <= end_month - interval '12 months') as litres_prior_year,
           sum(t.value_eur) filter (where t.period <= end_month - interval '12 months') as value_eur_prior_year,
           sum(t.quantity_l) filter (where t.period = end_month) as litres_month,
           sum(t.quantity_l) filter (where t.period = end_month - interval '1 month') as litres_prior_month,
           bool_and(t.quantity_l is not null) as litres_complete
      from public.trade_flows as t
      join groups as g on g.member = t.product
     where t.flow = 'export'
       and t.partner !~ '^(WORLD|EXT_EU27_2020|INT_EU27_2020|Q[P-Z])$'
       and t.period > end_month - interval '24 months'
       and t.period <= end_month
     group by g.product, t.partner
  ),
  ranked as (
    select totals.*,
           row_number() over (
             partition by totals.product
             order by totals.litres desc nulls last, totals.partner
           ) as place
      from totals
  )
  select r.product, r.partner, r.litres, r.value_eur, r.litres_prior_year,
         r.value_eur_prior_year, r.litres_month, r.litres_prior_month,
         r.litres_complete
    from ranked as r
   where r.place <= top_n
   order by r.product, r.place
$$;

-- The largest reporter-to-partner export relationships, per subheading.
create function public.trade_top_flows(end_month date, top_n integer default 5)
returns table (
  product text,
  reporter text,
  partner text,
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
       and t.product in ('220410', '220421', '220422', '220429', '220430')
       and t.partner !~ '^(WORLD|EXT_EU27_2020|INT_EU27_2020|Q[P-Z])$'
       and t.period > end_month - interval '24 months'
       and t.period <= end_month
     group by t.product, t.reporter, t.partner
  ),
  ranked as (
    select totals.*,
           row_number() over (
             partition by totals.product
             order by totals.litres desc nulls last, totals.reporter, totals.partner
           ) as place
      from totals
  )
  select r.product, r.reporter, r.partner, r.litres, r.value_eur,
         r.litres_prior_year, r.value_eur_prior_year, r.litres_complete
    from ranked as r
   where r.place <= top_n
   order by r.product, r.place
$$;

-- The four reporters' exports to the world per subheading and month.
create function public.trade_monthly(end_month date, months integer default 24)
returns table (
  product text,
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
         t.period,
         sum(t.quantity_l),
         sum(t.value_eur),
         bool_and(t.quantity_l is not null)
    from public.trade_flows as t
   where t.flow = 'export'
     and t.partner = 'WORLD'
     and t.product in ('220410', '220421', '220422', '220429', '220430')
     and t.period > end_month - make_interval(months => months)
     and t.period <= end_month
   group by t.product, t.period
   order by t.product, t.period
$$;

grant execute on function
  public.trade_latest_month(),
  public.trade_totals(date),
  public.trade_destinations(date, integer),
  public.trade_top_flows(date, integer),
  public.trade_monthly(date, integer)
  to anon, authenticated, service_role;
