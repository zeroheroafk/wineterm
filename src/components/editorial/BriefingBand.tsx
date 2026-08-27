import { Button } from "@/components/ui/Button";

/**
 * Full-width weekly briefing band for the homepage: editorial copy on the
 * left, the signup form on the right, framed by heavy rules rather than a
 * card so it reads as part of the page's bulletin structure.
 */
export function BriefingBand() {
  return (
    <section className="border-y-2 border-ink bg-paper">
      <div className="grid grid-cols-1 gap-6 px-5 py-8 sm:px-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-center">
        <div>
          <p className="wt-label text-wine">The Weekly Briefing</p>
          <h2 className="wt-headline mt-2 text-3xl font-semibold text-ink">
            The wine market, once a week.
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-soft">
            Prices, harvest conditions, supply, trade and the developments
            shaping the professional wine industry.
          </p>
        </div>
        <form action="/briefing" aria-label="Newsletter signup">
          <div className="flex flex-col gap-2 sm:flex-row">
            <label htmlFor="band-briefing-email" className="sr-only">
              Work email
            </label>
            <input
              id="band-briefing-email"
              type="email"
              name="email"
              required
              placeholder="work email"
              className="h-10 grow border border-rule bg-ground px-3 font-mono text-sm text-ink placeholder:text-ink-soft"
            />
            <Button type="submit" className="h-10">
              Get the briefing
            </Button>
          </div>
          <p className="wt-label mt-2.5 text-ink-soft">
            Every Friday. No marketing lists. Unsubscribe at any time.
          </p>
        </form>
      </div>
    </section>
  );
}
