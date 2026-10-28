import { Flag, hasFlag } from "@/components/ui/Flag";
import { countryName } from "@/services/types";

/**
 * Country identifier: the country's flag, optionally followed by its
 * name. The flag names the country on hover and to assistive technology;
 * beside the name it is decorative.
 *
 * A code with no flag is set as text: "badge" (default) boxes it in the
 * monospace label style; "plain" sets it as quiet sans text for editorial
 * tables where a box on every row would add noise.
 */
export function CountryLabel({
  code,
  withName = false,
  variant = "badge",
}: {
  code: string;
  withName?: boolean;
  variant?: "badge" | "plain";
}) {
  const name = countryName(code);
  const label = withName ? <span className="text-sm text-ink">{name}</span> : null;

  if (hasFlag(code)) {
    return (
      <span className="inline-flex items-center gap-2">
        <Flag code={code} decorative={withName} />
        {label}
      </span>
    );
  }

  if (variant === "plain") {
    return (
      <span className="inline-flex items-baseline gap-2">
        <abbr
          title={name}
          className="text-xs font-medium tracking-wide text-ink-soft no-underline"
        >
          {code}
        </abbr>
        {label}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5">
      <abbr
        title={name}
        className="wt-label border border-rule bg-ground px-1 py-0.5 text-ink no-underline"
      >
        {code}
      </abbr>
      {label}
    </span>
  );
}
