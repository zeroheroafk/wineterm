import { Button } from "@/components/ui/Button";

/**
 * The main newsletter module. The form posts to the briefing landing
 * route; subscription handling arrives with the backend phase.
 */
export function NewsletterSignup({
  variant = "panel",
}: {
  variant?: "panel" | "inline";
}) {
  const inputId = `briefing-email-${variant}`;

  if (variant === "inline") {
    return (
      <form
        action="/briefing"
        aria-label="Newsletter signup"
        className="flex flex-wrap items-end gap-3 border-y border-rule py-4"
      >
        <div className="min-w-56 grow">
          <label htmlFor={inputId} className="wt-label text-wine">
            The Weekly Briefing
          </label>
          <input
            id={inputId}
            type="email"
            name="email"
            required
            placeholder="work email"
            className="mt-1.5 h-9 w-full border border-rule bg-paper px-3 font-mono text-sm text-ink placeholder:text-ink-soft"
          />
        </div>
        <Button type="submit">Get the briefing</Button>
      </form>
    );
  }

  return (
    <form
      action="/briefing"
      aria-label="Newsletter signup"
      className="border border-rule border-t-2 border-t-wine bg-paper p-6"
    >
      <p className="wt-label text-wine">The Weekly Briefing</p>
      <h3 className="wt-headline mt-2 text-2xl font-semibold text-ink">
        The week in wine markets, every Friday
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">
        Prices, supply signals and trade developments across Europe, written
        for professionals. Free during the launch period.
      </p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <label htmlFor={inputId} className="sr-only">
          Work email
        </label>
        <input
          id={inputId}
          type="email"
          name="email"
          required
          placeholder="work email"
          className="h-9 grow border border-rule bg-ground px-3 font-mono text-sm text-ink placeholder:text-ink-soft"
        />
        <Button type="submit">Get the briefing</Button>
      </div>
      <p className="wt-label mt-3 text-ink-soft">
        No marketing lists. Unsubscribe at any time.
      </p>
    </form>
  );
}
