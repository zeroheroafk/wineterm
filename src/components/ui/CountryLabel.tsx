import { countryName } from "@/services/types";

/**
 * Country identifier: bordered monospace ISO code, optionally followed by
 * the country name. No flags; codes keep tables scannable and sortable.
 */
export function CountryLabel({
  code,
  withName = false,
}: {
  code: string;
  withName?: boolean;
}) {
  const name = countryName(code);
  return (
    <span className="inline-flex items-center gap-1.5">
      <abbr
        title={name}
        className="wt-label border border-rule bg-ground px-1 py-0.5 text-ink no-underline"
      >
        {code}
      </abbr>
      {withName ? <span className="text-sm text-ink">{name}</span> : null}
    </span>
  );
}
