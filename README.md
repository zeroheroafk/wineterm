# WineTerm

Market intelligence for the wine industry. Prices, production, stocks,
trade and crop intelligence for wineries, growers and the global wine
trade, with a focus on the professional European market: Spain,
Portugal, France and Italy.

## Stack

- Next.js (App Router) with React Server Components
- TypeScript in strict mode
- Tailwind CSS 4 (tokens defined in `src/app/globals.css`)
- Recharts for charts, wrapped in `ChartFrame` so the library is swappable
- next/font: Newsreader (editorial serif), Archivo (interface sans),
  IBM Plex Mono (data)

## Structure

```
src/
  app/               Routes: home, Markets, Market data, Crop & Supply, Trade,
                     Insights, Industry, Directory, institutional pages,
                     /design-system
  components/
    layout/          Global shell: header, navigation, footer, breadcrumbs
    ui/              Section headers, buttons, filters, tabs, labels, states
    market/          Tables, price cells, changes, charts, commentary
    editorial/       Article previews, newsletter modules
  lib/               Navigation, formatting, Supabase client and form actions
  services/          Typed service layer: Supabase for prices, supply and
                     trade; the official harvest estimates entered by hand
  content/           Published editorial content: the Insights articles
                     and monthly reports, and the Industry stories
```

The service interfaces in `src/services` are the seam between the pages
and the data; components depend only on those interfaces, and every
figure comes from a named source. Trade reads Eurostat figures from the
database. Markets reads from it the Spanish Ministry of Agriculture's
weekly national wine prices and its weekly prices in seven
representative markets, the French Ministry of Agriculture's monthly
prices in Languedoc-Roussillon and Midi-Pyrénées (DRAAF Occitanie), and
one national bulk wine price each for Portugal, France and Italy:
WineTerm's monthly estimate, the average price of the country's bulk
exports, computed in the database from the Eurostat figures. The supply,
stocks and production pages read Spain's monthly declarations, and the
stocks page also Italy's month-end stocks from the ICQRF's Cantina
Italia reports and the stocks France and Portugal declare at 31 July,
from the customs' open data and the wine institute's series. The
harvest page shows each country's official production estimate, entered
by hand in `src/services/harvest/official.ts`. Insights articles and
monthly reports are published content in `src/content/articles`, one
file per article, read at `/insights/analysis/<id>` and
`/insights/monthly-reports/<id>`, and weekly briefings at
`/insights/weekly-briefing/<id>`. An article's photograph, credited with
its author and licence, is in `public/images/insights/<id>.jpg`; the
latest weekly briefing leads the homepage across the full width, set on
its photograph when it has one, darkened under the text and credited at
the foot of the band.
Industry stories, WineTerm's summaries
of reports published elsewhere with a link to each, are in
`src/content/industry.ts`. A section whose source is not connected yet,
such as must prices or the balances of Portugal, France and Italy, says
so instead of showing sample figures; grape prices are not covered.

## Commands

```bash
npm run dev        # development server
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
npm run build      # production build
```

`/design-system` documents the tokens and component set. It is excluded
from the sitemap and marked noindex.

## Environment

- `SITE_URL`: canonical origin, including the scheme, used for
  `metadataBase`, the sitemap and robots.txt. Optional: without it,
  Vercel builds use the project's production domain and local builds
  use `http://localhost:3000`.
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`:
  the Supabase project. With both set, the forms store briefing signups
  and contact messages; `/trade` and the Market data trade snapshot
  show Eurostat figures; the Markets pages and the homepage key prices
  show MAPA's national wine prices, the Spanish and French regional
  prices and the national bulk prices of Portugal, France and Italy
  computed from the trade figures; `/supply`, `/supply/stocks` and
  `/supply/production` show Spain's INFOVI balance, stocks and wine
  production; and `/supply/stocks` shows the stocks of Italy, France
  and Portugal. Pages regenerate at most hourly and database reads are
  cached for an hour; the build then reads the database, and fails
  rather than publish trade volumes missing litres. Without them,
  submissions are discarded and the reply says so, and the price,
  supply and trade pages say that no database is connected.
- `SITE_INDEXABLE`: set to `true` to let search engines index the site.
  Until then every page is marked noindex.
- `SHOW_DESIGN_SYSTEM`: set to `true` to serve `/design-system`, the
  component gallery, from a production build, as on a preview
  deployment; otherwise it answers 404 there. `next dev` always serves
  it.

## Database

Supabase project `wineterm`, in Paris (`eu-west-3`). Schema changes live
in `supabase/migrations` and are applied in order;
`src/lib/database.types.ts` is generated from the schema and must be
regenerated after each migration.

The site talks to the Data API with the publishable key, which runs as
the `anon` role. Grants and row level security limit that role to
inserting form submissions, which it can never read back, and to reading
market data. New tables get no grants by default, so each migration
grants exactly what a table needs.

The trade pages do not page through `trade_flows`: the functions
`trade_latest_month`, `trade_totals`, `trade_destinations`,
`trade_top_flows` and `trade_monthly` aggregate it in the database and
the site calls them through the Data API. Their reference period ends at
the latest month all four reporters have published, since France and
Italy often publish a month after Spain and Portugal.

The Markets pages read `market_series` and `market_observations` whole,
paging through the observations, and cache them for an hour: the site
uses Cache Components (`cacheComponents` in `next.config.ts`), so the
read is a `"use cache: remote"` function with `cacheLife("hours")` and
the tag `market-data`, shared by every server instance because the
pages that filter by query string render at request time. The pages that
read only cached data carry `"use cache"` themselves and are regenerated
at most hourly. A stored series appears only when its source is in
`src/services/markets/sources.ts`. The supply, stocks and production
pages read `supply_figures` the same way (`"use cache"`, tag
`supply-data`), and the trade pages their aggregates (tag
`trade-data`).

The data providers, with their coverage, access and licence status, and
the candidates still to connect, are catalogued in
`docs/data-sources.md`.

### Imports

External data is fetched from Supabase, not from the site: the database
queues each run in `import_runs` and calls an Edge Function, which
executes only queued runs, writes with the service role and records the
outcome on the run.

- **Eurostat Comext** (`supabase/functions/import-comext`) loads monthly
  trade in heading 2204 for Spain, Portugal, France and Italy into
  `trade_flows`: value in euros, net mass and volume in litres. Comext
  publishes litres only for CN8 codes, so the import also reads the CN8
  codes listed in `cn8.ts` and stores their sum on each subheading row
  when their values add up to the row's value. A run covers one
  reporter, flow and year. `private.start_comext_imports()` queues the
  runs and schedules the `pg_cron` job `dispatch-comext-imports`, which
  posts them one at a time and removes itself when none is left. The job
  `import-comext-monthly` starts the current and the previous year on
  the 20th of each month. For a backfill, run in the SQL editor
  `select private.start_comext_imports(2021, 2023);` and check
  `select * from import_runs order by id desc;`. A run whose `note`
  reports rows without litres usually means the January revision of the
  Combined Nomenclature added a CN8 code: add it to `cn8.ts`, redeploy
  and re-import that year.

- **MAPA, Informe Semanal de Coyuntura** (`supabase/functions/import-mapa-markets`)
  loads the weekly ex-winery prices of white and red wine without PDO/PGI
  in the representative markets (table 2.2: Albacete, Badajoz, Ciudad
  Real, Cuenca, Murcia, Toledo and Valencia) into `market_observations`,
  as twelve series `ES-<market>-<WHT|RED>-NGI`. The ministry publishes a
  workbook a week, listed on a page per year (the latest weeks on the
  main page first); `isc.ts` reads table 2.2 from each and dates it by the
  week its heading and link agree on, since both are typed by hand: see
  `reportedWeek` and `settleWeeks`. Only each report's own week is read,
  not the week before it restates. A run covers one year, from 2019
  (table 2.2 starts in week 12). A call of the function has about two
  seconds of CPU time, so it reads at most eight workbooks, keeps each in
  `mapa_market_reports` and queues its run again while some remain; the
  job `dispatch-mapa-market-imports` posts queued runs one at a time and
  removes itself when none is left, and the call that finds nothing left
  to read saves the year's prices. Kept workbooks are not read again.
  `private.start_mapa_market_imports()` queues one run per year, and the
  job `import-mapa-markets` starts the current year on Tuesday and Friday
  mornings, and the previous one in January. For a backfill, run
  `select private.start_mapa_market_imports(2019);`. A run that could not
  read a workbook saves the other weeks and fails, naming it; the next run
  reads that workbook again.

- **DRAAF Occitanie, Marché vrac des vins** (`supabase/functions/import-draaf-occitanie`)
  loads the monthly average prices of the bulk wine contracts presented
  for visa to FranceAgriMer and the interprofessions, for wine produced in
  Occitanie, into `market_observations` as twelve series
  `FR-<LR|MP>-<RED|ROS|WHT>-<NGI|PGI>`: wine without GI and PGI wine, by
  colour, in the departments of former Languedoc-Roussillon and of former
  Midi-Pyrénées, in EUR/hl. The regional office keeps one page with the
  last three campaigns; `draaf.ts` reads its twelve price tables by their
  captions and dates each price to the last day of its month. A run reads
  the page once: new months are stored with the date the page carries,
  and a changed value as a revision. The job `import-draaf-occitanie`
  runs `private.start_draaf_imports()` on Wednesday mornings; call it to
  import at once. A failed run names the table or cell that did not read
  as expected.

- **WineTerm trade price estimates** (no Edge Function): three monthly
  series in `market_observations`, source `wineterm-trade-estimate`,
  `PT-NAT-BULK`, `FR-NAT-BULK` and `IT-NAT-BULK`: the value of a month's
  bulk wine exports (CN 2204 29) divided by their litres, in EUR/hl.
  `private.refresh_trade_price_estimates()`
  computes them from `trade_flows`, stores a changed month as a revision
  and moves each series' campaign to its latest month; the Comext
  dispatcher calls it once the last queued run has finished. After
  loading trade figures another way, run
  `select private.refresh_trade_price_estimates();`.

- **MAPA, Precios Medios Nacionales** (`supabase/functions/import-mapa-prices`)
  loads the Spanish Ministry of Agriculture's weekly national average
  prices of white and red wine without PDO/PGI, ex-winery in EUR/hl, into
  `market_observations` as the series `ES-NAT-WHT-NGI` and
  `ES-NAT-RED-NGI`. The ministry publishes one workbook per year, from
  2019, and replaces the current year's each week; `pmn.ts` finds its link
  on the ministry's page, reads the two wine rows and dates each price to
  the Sunday ending its ISO week, checking the week against the dates
  printed under it. A run covers one year: new weeks are stored with the
  workbook's upload time as their publication date, and a changed value is
  stored as a revision. `private.start_mapa_imports()` posts one run per
  year at once; the job `import-mapa-prices` starts the current and the
  previous year on Tuesday and Friday mornings. For a backfill, run
  `select private.start_mapa_imports(2019);`. A failed run names the
  workbook, week or row that did not read as expected, which usually means
  the ministry changed the workbook's layout.

- **MAPA, INFOVI** (`supabase/functions/import-infovi`) loads Spain's
  monthly declarations of the wine sector into `supply_figures`: wine
  stocks at the end of each month by colour, bulk and packaged, stocks of
  must that is not concentrated, wine made since 1 August, and the wine
  that came in during the month from Spain and from abroad and went out
  by destination, with the exits abroad also by colour, bulk and
  packaged, national totals in hectolitres. They cover producers of
  1,000 hl or more and warehouse holders. The ministry publishes a
  workbook per month, from 2018, about six weeks after the month ends;
  `infovi.ts` finds each by its link label on the year's page, anchors on
  the TOTAL row of tables 5, 2.2, 3.1, 3.2, 4.0, 4.3, 4.4 and 4.6, checks
  each table's title and the headings above its totals, and that the parts
  add up to the printed totals. A stored total with colour and
  presentation `all` stands for its parts, which are stored beside it. September 2018's entries and exits are
  skipped, because that month's tables contradict one another. A run
  covers one year; the job `import-infovi` starts the
  current year every Monday, and the previous one until mid-March. For a
  backfill, run `select private.start_infovi_imports(2018, 2020);`. A
  failed run names the table and the check that did not hold.

- **ICQRF, Cantina Italia** (`supabase/functions/import-cantina-italia`)
  loads Italy's month-end stocks into `supply_figures`: wine with a PDO
  and with a PGI by colour, varietal and other wine, must that is not
  concentrated, concentrated and rectified concentrated must, and new
  wine still in fermentation, national totals in hectolitres. The
  ministry lists one report per month, 8 to 12 days after the month
  ends, each with a spreadsheet by region and province; `cantina.ts`
  reads the ministry's listing of a year, keeps the reports dated at a
  month's end (a report dated the 1st counts the month before, as the
  bulletins of 2018 and 2019 were dated), finds each report's
  spreadsheet and reads the national totals, checking that the regions
  add up to them. A run covers one month's report, which keeps the
  parsing within the function's CPU time;
  `private.start_cantina_italia_imports()` queues one run per month,
  from December of the year before to the last month ended, and posts
  them at once, and the job `import-cantina-italia` starts the current
  year every Thursday. The bulletins up to the autumn of 2018 lay the
  figures out in other sheets and are not read. For a backfill, run a
  year at a time, `select private.start_cantina_italia_imports(2019,
  2019);`, to spare the ministry's server a hundred downloads at once.

- **DGDDI, stock declarations** (`supabase/functions/import-douane-stocks`)
  loads France's stocks at 31 July into `supply_figures`: the wine
  producers and traders declared to customs at the end of each campaign,
  by category (PDO, PGI, without GI, and wine from third countries at
  traders) and colour, national totals in hectolitres, with the holder
  in the `holder` column. The customs' open data lists one workbook per
  campaign since 2017/2018; `douane.ts` reads the listing's pages, keeps
  the statements of production and trade stocks, and reads each
  workbook's TOTAL rows, checking that the categories add up to them.
  `private.start_douane_stock_imports()` queues one run that reads
  every campaign, and the job `import-douane-stocks` runs it on Tuesdays
  from October to December, when a campaign's statement comes out.

- **IVV, declarações de existências** (`supabase/functions/import-ivv-stocks`)
  loads Portugal's stocks at 31 July into `supply_figures`: the wine and
  must operators declared to the wine institute, by category (PDO, PDO
  liqueur wine, PGI, varietal, without certification) and colour,
  national totals in hectolitres, from the series workbook the institute
  keeps among its documents. `ivv.ts` finds the latest series in the
  documents' sitemap, its workbook on the page, and reads every year's
  table, checking that the categories add up to the total.
  `private.start_ivv_stock_imports()` queues one run, and the job
  `import-ivv-stocks` runs it on Tuesdays from January to June, when the
  series follows the declarations.

Scheduled calls need two Vault secrets, set once per project and never
committed: `project_url` (the project's API URL) and `anon_key` (the
legacy anon key, because the function verifies JWTs). Without them the
job only logs a warning. If legacy keys are ever disabled, redeploy the
function with JWT verification off: it trusts only runs the database
queued, not the caller.

The job `check-imports` runs `private.check_imports()` every morning:
it reports, once each, the failed runs no later run of the same scope
recovered, the runs left queued or running for a day, and the sources
without a successful run for longer than `private.import_schedule`
allows (five days for MAPA's prices, nine for INFOVI, DRAAF and the
Cantina Italia, 35 for Comext, 370 for the annual stock statements of
France and Portugal). The report goes to a webhook (Vault secret
`alert_webhook_url`) and by email through Resend (`resend_api_key`,
`alert_email_to` and, optionally, `alert_email_from`); with neither
set, it is only logged as a warning, so set one before launch.

Deploy a function with the Supabase CLI
(`supabase functions deploy import-comext`, and likewise
`import-mapa-prices`, `import-mapa-markets`, `import-draaf-occitanie`,
`import-infovi`, `import-cantina-italia`, `import-douane-stocks` and
`import-ivv-stocks`) or the dashboard.
