import { TrendIndicator } from "@/components/market/TrendIndicator";
import { CountryLabel } from "@/components/ui/CountryLabel";
import { formatDate } from "@/lib/format";
import type { HarvestCondition, HarvestRegion } from "@/services/types";

const CONDITION_STYLES: Record<
  HarvestCondition,
  { label: string; className: string }
> = {
  good: { label: "Good", className: "border-up text-up" },
  mixed: { label: "Mixed", className: "border-ochre text-ochre" },
  stressed: { label: "Stressed", className: "border-down text-down" },
};

const EXPECTED_TEXT = {
  up: { label: "Above 2025", value: 1 },
  down: { label: "Below 2025", value: -1 },
  flat: { label: "Near 2025", value: 0 },
} as const;

function ConditionTag({ condition }: { condition: HarvestCondition }) {
  const style = CONDITION_STYLES[condition];
  return (
    <span
      className={`wt-label inline-flex items-center border px-1.5 py-0.5 ${style.className}`}
    >
      {style.label}
    </span>
  );
}

/**
 * Regional harvest status list. Each row: region, current stage, vineyard
 * condition, expected crop against last vintage, and the last update.
 * Collapses from a five-column rail to a stacked list on small screens.
 */
export function HarvestMonitor({ regions }: { regions: HarvestRegion[] }) {
  return (
    <div className="border border-rule bg-paper">
      <div className="hidden border-b-2 border-ink px-4 py-2 lg:grid lg:grid-cols-[11.5rem_minmax(0,1fr)_minmax(0,1.35fr)_8rem_6.5rem] lg:gap-4">
        <span className="wt-label text-ink-soft">Region</span>
        <span className="wt-label text-ink-soft">Stage</span>
        <span className="wt-label text-ink-soft">Condition</span>
        <span className="wt-label text-ink-soft">Expected crop</span>
        <span className="wt-label text-right text-ink-soft">Updated</span>
      </div>
      <ul>
        {regions.map((region) => {
          const expected = EXPECTED_TEXT[region.expected];
          return (
            <li
              key={region.id}
              className="grid gap-x-4 gap-y-1.5 border-b border-rule px-4 py-3 last:border-b-0 lg:grid-cols-[11.5rem_minmax(0,1fr)_minmax(0,1.35fr)_8rem_6.5rem] lg:items-baseline"
            >
              <p className="flex items-center gap-2 whitespace-nowrap">
                <CountryLabel code={region.country} />
                <span className="text-sm font-medium text-ink">
                  {region.region}
                </span>
              </p>
              <p className="text-sm text-ink">{region.stage}</p>
              <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <ConditionTag condition={region.condition} />
                <span className="text-xs leading-snug text-ink-soft">
                  {region.conditionNote}
                </span>
              </p>
              <p className="flex items-center gap-1.5 text-xs whitespace-nowrap text-ink">
                <TrendIndicator value={expected.value} />
                {expected.label}
              </p>
              <p className="tnum font-mono text-xs text-ink-soft lg:text-right">
                {formatDate(region.updatedAt)}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
