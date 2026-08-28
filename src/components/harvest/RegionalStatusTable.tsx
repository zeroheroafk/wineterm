import { TrendIndicator } from "@/components/market/TrendIndicator";
import { CountryLabel } from "@/components/ui/CountryLabel";
import { formatDate } from "@/lib/format";
import {
  YIELD_EXPECTATION_LABELS,
  type HarvestRegionReport,
  type YieldExpectation,
} from "@/services/harvest/types";

const DIRECTION_VALUE = { up: 1, down: -1, flat: 0 } as const;

const YIELD_STYLES: Record<YieldExpectation, string> = {
  "above-average": "border-up text-up",
  average: "border-rule text-ink-soft",
  "below-average": "border-ochre text-ochre",
  "well-below-average": "border-down text-down",
};

function YieldTag({ expectation }: { expectation: YieldExpectation }) {
  return (
    <span
      className={`wt-label inline-flex items-center border px-1.5 py-0.5 ${YIELD_STYLES[expectation]}`}
    >
      {YIELD_EXPECTATION_LABELS[expectation]}
    </span>
  );
}

function ProgressCell({ report }: { report: HarvestRegionReport }) {
  if (!report.started || report.progressPercent === null) {
    return (
      <span className="wt-label text-ink-soft">
        {report.harvestStart
          ? `From ${formatDate(report.harvestStart)}`
          : "Not started"}
      </span>
    );
  }
  return (
    <span className="block">
      <span className="tnum font-mono text-xs text-ink">
        ~{report.progressPercent}%
      </span>
      <span aria-hidden="true" className="mt-1 block h-1.5 w-full max-w-24 bg-ground">
        <span
          className="block h-full bg-wine"
          style={{ width: `${report.progressPercent}%` }}
        />
      </span>
    </span>
  );
}

/**
 * Regional harvest status rail. Progress is approximate by design
 * (5 percent steps, marked with a tilde); condition and quality are the
 * field network's qualitative reporting.
 */
export function RegionalStatusTable({
  reports,
}: {
  reports: HarvestRegionReport[];
}) {
  return (
    <div className="border border-rule bg-paper">
      <div className="hidden border-b-2 border-ink px-4 py-2 lg:grid lg:grid-cols-[10.5rem_minmax(0,1.2fr)_6.5rem_minmax(0,1.6fr)_9.5rem_5.5rem] lg:gap-4">
        <span className="wt-label text-ink-soft">Region</span>
        <span className="wt-label text-ink-soft">Stage and start</span>
        <span className="wt-label text-ink-soft">Progress</span>
        <span className="wt-label text-ink-soft">Weather and quality</span>
        <span className="wt-label text-ink-soft">Yield outlook</span>
        <span className="wt-label text-right text-ink-soft">Updated</span>
      </div>
      <ul>
        {reports.map((report) => (
          <li
            key={report.id}
            className="grid grid-cols-1 gap-x-4 gap-y-2 border-b border-rule px-4 py-3.5 last:border-b-0 lg:grid-cols-[10.5rem_minmax(0,1.2fr)_6.5rem_minmax(0,1.6fr)_9.5rem_5.5rem] lg:gap-y-1"
          >
            <p className="flex items-center gap-2 whitespace-nowrap">
              <CountryLabel code={report.country} />
              <span className="text-sm font-medium text-ink">
                {report.region}
              </span>
            </p>
            <p className="text-sm leading-snug text-ink">
              {report.stage}
              {report.started && report.harvestStart ? (
                <span className="wt-label mt-0.5 block text-ink-soft">
                  Started {formatDate(report.harvestStart)}
                </span>
              ) : null}
            </p>
            <div>
              <ProgressCell report={report} />
            </div>
            <p className="text-xs leading-relaxed text-ink-soft">
              {report.weather}
              <span className="mt-0.5 block text-ink">{report.quality}</span>
            </p>
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <YieldTag expectation={report.yieldExpectation} />
              <span className="flex items-center gap-1">
                <TrendIndicator value={DIRECTION_VALUE[report.direction]} />
              </span>
            </p>
            <p className="tnum font-mono text-xs text-ink-soft lg:text-right">
              {formatDate(report.updatedAt)}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
