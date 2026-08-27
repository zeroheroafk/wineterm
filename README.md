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
