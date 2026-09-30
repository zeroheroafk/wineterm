import { COUNTRY_NAMES, type CountryCode } from "@/services/types";

/**
 * Country identifier: ISO code, optionally followed by the country name.
 * No flags; codes keep tables scannable and sortable.
 *
 * "badge" (default) boxes the code in the monospace label style; "plain"
 * sets it as quiet sans text for editorial tables where a box on every
 * row would add noise.
 */
export function CountryLabel({
  code,
  withName = false,
  variant = "badge",
}: {
  code: CountryCode;
  withName?: boolean;
  variant?: "badge" | "plain";
}) {
  if (variant === "plain") {
    return (
      <span className="inline-flex items-baseline gap-2">
        <abbr
          title={COUNTRY_NAMES[code]}
          className="text-xs font-medium tracking-wide text-ink-soft no-underline"
        >
          {code}
        </abbr>
        {withName ? (
          <span className="text-sm text-ink">{COUNTRY_NAMES[code]}</span>
        ) : null}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5">
      <abbr
        title={COUNTRY_NAMES[code]}
        className="wt-label border border-rule bg-ground px-1 py-0.5 text-ink no-underline"
      >
        {code}
      </abbr>
      {withName ? (
        <span className="text-sm text-ink">{COUNTRY_NAMES[code]}</span>
      ) : null}
    </span>
  );
}
