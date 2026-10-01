import { TrendIndicator } from "@/components/market/TrendIndicator";
import { COUNTRY_NAMES } from "@/services/types";
import type { HarvestCondition, HarvestRegion } from "@/services/types";

/** Condition names carry the meaning; the swatch only reinforces it. */
const CONDITIONS: Record<HarvestCondition, { label: string; swatch: string }> =
  {
    good: { label: "Good", swatch: "bg-up" },
    mixed: { label: "Mixed", swatch: "bg-ochre" },
    stressed: { label: "Stressed", swatch: "bg-down" },
  };

const EXPECTED = {
  up: { text: "Crop expected above 2025", value: 1 },
  down: { text: "Crop expected below 2025", value: -1 },
  flat: { text: "Crop expected near 2025", value: 0 },
} as const;

/**
 * The first listed region of each producer country, in listing order:
 * the homepage shows one representative region per country and leaves
 * the full regional monitor to the Harvest page.
 */
export function representativeRegions(
  regions: HarvestRegion[],
): HarvestRegion[] {
  const seen = new Set<string>();
  return regions.filter((region) => {
    if (seen.has(region.country)) return false;
    seen.add(region.country);
    return true;
  });
}

/**
 * Regional harvest snapshot: for each region its stage, vineyard
 * condition with the field note, and the expected crop against the last
 * vintage. Four across on wide screens, two on tablets, a list on phones.
 */
export function HarvestMonitor({ regions }: { regions: HarvestRegion[] }) {
  return (
    <ul className="grid grid-cols-1 border-b border-rule sm:grid-cols-2 lg:grid-cols-4">
      {regions.map((region) => {
        const condition = CONDITIONS[region.condition];
        const expected = EXPECTED[region.expected];
        return (
          <li
            key={region.id}
            className="border-t border-rule py-4 sm:max-lg:odd:pr-5 sm:max-lg:even:border-l sm:max-lg:even:pl-5 lg:px-5 lg:first:pl-0 lg:last:pr-0 lg:not-first:border-l"
          >
            <h4 className="text-[0.9375rem] leading-snug font-semibold text-ink">
              {region.region}
            </h4>
            <p className="text-xs text-ink-soft">
              {COUNTRY_NAMES[region.country]}
            </p>
            <dl className="mt-3 space-y-2.5 text-sm">
              <div>
                <dt className="sr-only">Stage</dt>
                <dd className="text-ink">{region.stage}</dd>
              </div>
              <div>
                <dt className="sr-only">Vineyard condition</dt>
                <dd>
                  <span className="flex items-center gap-1.5 font-medium text-ink">
                    <span
                      aria-hidden="true"
                      className={`h-2 w-2 shrink-0 ${condition.swatch}`}
                    />
                    {condition.label}
                  </span>
                  <span className="mt-0.5 block text-[0.8125rem] leading-snug text-pretty text-ink-soft">
                    {region.conditionNote}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="sr-only">Expected crop</dt>
                <dd className="flex items-center gap-1.5 text-ink">
                  <TrendIndicator value={expected.value} tone="neutral" />
                  {expected.text}
                </dd>
              </div>
            </dl>
          </li>
        );
      })}
    </ul>
  );
}
