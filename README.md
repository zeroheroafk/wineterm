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
  app/               Routes: interim home, /briefing, /design-system (internal)
  components/
    layout/          Global shell: header, navigation, footer, breadcrumbs
    ui/              Section headers, buttons, filters, tabs, labels, states
    market/          Tables, price cells, changes, charts, commentary
    editorial/       Article previews, newsletter modules
  lib/               Navigation config and formatting helpers
  services/          Typed service layer (fixture-backed for now)
  fixtures/          Illustrative sample data only; see fixtures/README.md
```

The service interfaces in `src/services` are the seam for real data
sources, authentication and a database later; components depend only on
those interfaces. Nothing in `src/fixtures` is real market data.

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
  and contact messages; without them, submissions are discarded and the
  reply says so.
- `SITE_INDEXABLE`: set to `true` to let search engines index the site.
  Until then every page is marked noindex, because the figures are
  illustrative fixtures.

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

Scheduled calls need two Vault secrets, set once per project and never
committed: `project_url` (the project's API URL) and `anon_key` (the
legacy anon key, because the function verifies JWTs). Without them the
job only logs a warning. If legacy keys are ever disabled, redeploy the
function with JWT verification off: it trusts only runs the database
queued, not the caller.

Deploy a function with the Supabase CLI
(`supabase functions deploy import-comext`) or the dashboard.
