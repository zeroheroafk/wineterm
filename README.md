# WineTerm

Market intelligence for the wine industry. Prices, production, stocks,
trade and crop intelligence for wineries, growers and the global wine
trade, with a focus on the professional European market (Spain and
Portugal first, comparative data for France and Italy).

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
  app/               Routes: home, Markets, Crop & Supply, Trade, Insights,
                     Industry, Directory, institutional pages, /design-system
  components/
    layout/          Global shell: header, navigation, footer, breadcrumbs
    ui/              Section headers, buttons, filters, tabs, labels, states
    market/          Tables, price cells, changes, charts, commentary
    editorial/       Article previews, newsletter modules
  lib/               Navigation, formatting, Supabase client and form actions
  services/          Typed service layer: Supabase for trade and imported
                     prices, fixtures elsewhere
  fixtures/          Illustrative sample data only; see fixtures/README.md
```

The service interfaces in `src/services` are the seam for real data
sources; components depend only on those interfaces. Trade reads Eurostat
figures from the database, Markets reads the Spanish Ministry of
Agriculture's weekly national wine prices from it, listed before the
illustrative series, and the stocks and production pages read Spain's
month-end wine stocks and wine made since 1 August. Everything else
still uses the fixtures, and nothing
in `src/fixtures` is real market data: every fixture observation carries
the Illustrative status, which is how the site tells samples from real
prices.

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
  and contact messages; `/trade` and the homepage trade panel show
  Eurostat figures, the Markets pages, the homepage key prices and the
  market strip add MAPA's national wine prices to the illustrative series,
  and `/supply/stocks` and `/supply/production` show Spain's INFOVI
  stocks and wine production.
  Pages regenerate at most hourly and database reads are cached for an
  hour; the build then reads the database, and fails rather than publish
  trade volumes missing litres. Without them, submissions are discarded
  and the reply says so, and trade and markets show only the illustrative
  fixtures.
- `SITE_INDEXABLE`: set to `true` to let search engines index the site.
  Until then every page is marked noindex, because most figures are
  still illustrative fixtures.

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
paging through the observations, and cache them for an hour
(`unstable_cache`, tag `market-data`). A stored series appears only when
its source is in `src/services/markets/sources.ts`; a fixture with the
same code gives way to it. The stocks and production pages read
Spain's rows of `supply_figures` the same way (tag `supply-data`).

Real data providers that will replace the fixtures, with their coverage,
access and licence status, are catalogued in `docs/data-sources.md`.

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
  must that is not concentrated, and wine made since 1 August, national
  totals in hectolitres. They cover producers of 1,000 hl or more and
  warehouse holders. The ministry publishes a workbook per month, from
  2018, about six weeks after the month ends; `infovi.ts` finds each by its
  link label on the year's page, anchors on the TOTAL row of tables 5 and
  2.2, checks the headings above it and that the parts add up to the
  printed totals. A run covers one year; the job `import-infovi` starts the
  current year every Monday, and the previous one until mid-March. For a
  backfill, run `select private.start_infovi_imports(2018, 2020);`. A
  failed run names the table and the check that did not hold.

Scheduled calls need two Vault secrets, set once per project and never
committed: `project_url` (the project's API URL) and `anon_key` (the
legacy anon key, because the function verifies JWTs). Without them the
job only logs a warning. If legacy keys are ever disabled, redeploy the
function with JWT verification off: it trusts only runs the database
queued, not the caller.

Deploy a function with the Supabase CLI
(`supabase functions deploy import-comext`, and likewise
`import-mapa-prices` and `import-infovi`) or the dashboard.
