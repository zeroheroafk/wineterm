import { Button } from "@/components/ui/Button";

/**
 * The homepage's single newsletter signup: editorial copy on the left,
 * the labelled form on the right, on one flat surface under a burgundy
 * rule. The form posts to the briefing landing route; the browser's
 * email validation is the feedback until signup processing is connected.
 */
export function BriefingBand() {
  return (
    <section
      aria-labelledby="briefing-band-title"
      className="border-t-2 border-wine bg-paper"
    >
      <div className="grid grid-cols-1 gap-6 px-5 py-7 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,27rem)] lg:items-center lg:gap-12">
        <div>
          <p className="wt-kicker text-wine">The weekly briefing</p>
          <h2
            id="briefing-band-title"
            className="wt-headline mt-2 text-[1.75rem] leading-tight font-semibold text-ink"
          >
            The wine market, once a week.
          </h2>
          <p className="mt-2 max-w-xl text-[0.9375rem] leading-relaxed text-pretty text-ink-soft">
            Prices, harvest conditions, supply, trade and the developments
            shaping the professional wine industry.
          </p>
        </div>
        <form action="/briefing" aria-labelledby="briefing-band-title">
          <label
            htmlFor="band-briefing-email"
            className="block text-sm font-medium text-ink"
          >
            Work email
          </label>
          <div className="mt-1.5 flex flex-col gap-2 sm:flex-row">
            <input
              id="band-briefing-email"
              type="email"
              name="email"
              required
              autoComplete="email"
              placeholder="name@company.com"
              className="h-11 min-w-0 grow border border-rule bg-ground px-3 text-[0.9375rem] text-ink placeholder:text-ink-soft/80"
            />
            <Button type="submit" className="h-11 px-5">
              Get the briefing
            </Button>
          </div>
          <p className="mt-2 text-[0.8125rem] text-ink-soft">
            Every Friday. No marketing lists. Unsubscribe at any time.
          </p>
        </form>
      </div>
    </section>
  );
}
