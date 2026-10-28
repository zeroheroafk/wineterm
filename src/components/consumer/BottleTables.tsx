import { MaybePercent, TD, TD_RIGHT, TH, TH_RIGHT } from "@/components/markets/cells";
import { CountryLabel } from "@/components/ui/CountryLabel";
import { ScrollRegion } from "@/components/ui/ScrollRegion";
import { formatPrice } from "@/lib/format";
import {
  BOTTLE_CATEGORY_LABELS,
  type BottleCategory,
  type BottleOrigin,
  type BottleValues,
} from "@/services/consumer/types";
import { COUNTRY_NAMES, PRODUCER_COUNTRIES } from "@/services/types";

/**
 * Each origin's value per bottle to every destination together, still and
 * sparkling wine side by side, with the change on the twelve months
 * before. The still wine volume shows while the table spans the width.
 */
export function BottleOriginsTable({ values }: { values: BottleValues }) {
  const of = (category: BottleCategory, origin: string) =>
    values.origins[category].find((row) => row.origin === origin)?.world ?? null;
  const origins = PRODUCER_COUNTRIES.filter(
    (origin) => of("bottled", origin) || of("sparkling", origin),
  );

  return (
    <ScrollRegion className="border border-rule bg-paper">
      <table className="w-full border-collapse text-left">
        <caption className="sr-only">
          Value per 75 cl bottle of the still and sparkling wine each country
          exports, {values.period.label}, with the change on the twelve
          months before, and the still wine exported in million bottles
        </caption>
        <thead>
          <tr className="border-b-2 border-ink">
            <th scope="col" className={TH}>
              Origin
            </th>
            <th scope="col" className={TH_RIGHT}>
              Still wine, EUR/75 cl
            </th>
            <th scope="col" className={TH_RIGHT}>
              YoY
            </th>
            <th scope="col" className={TH_RIGHT}>
              Sparkling, EUR/75 cl
            </th>
            <th scope="col" className={TH_RIGHT}>
              YoY
            </th>
            <th scope="col" className={`${TH_RIGHT} hidden md:table-cell`}>
              Still wine, M bottles
            </th>
          </tr>
        </thead>
        <tbody>
          {origins.map((origin) => {
            const still = of("bottled", origin);
            const sparkling = of("sparkling", origin);
            return (
              <tr key={origin} className="border-b border-rule last:border-b-0">
                <th scope="row" className={`${TD} font-normal`}>
                  <CountryLabel code={origin} withName />
                </th>
                <td className={`${TD_RIGHT} tnum font-mono text-sm font-medium text-ink`}>
                  {still ? formatPrice(still.eurPerBottle) : "–"}
                </td>
                <td className={TD_RIGHT}>
                  <MaybePercent value={still?.yoyPercent ?? null} />
                </td>
                <td className={`${TD_RIGHT} tnum font-mono text-sm font-medium text-ink`}>
                  {sparkling ? formatPrice(sparkling.eurPerBottle) : "–"}
                </td>
                <td className={TD_RIGHT}>
                  <MaybePercent value={sparkling?.yoyPercent ?? null} />
                </td>
                <td
                  className={`${TD_RIGHT} tnum hidden font-mono text-sm text-ink-soft md:table-cell`}
                >
                  {still ? formatPrice(still.bottlesM, 0) : "–"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </ScrollRegion>
  );
}

/**
 * One origin's exports in one category: every destination together, then
 * the leading destinations by volume, each with its value per bottle and
 * its change on the twelve months before.
 */
export function BottleDestinationsTable({
  origin,
  category,
  period,
}: {
  origin: BottleOrigin;
  category: BottleCategory;
  period: string;
}) {
  const name = COUNTRY_NAMES[origin.origin];
  return (
    <div className="min-w-0 border border-rule bg-paper">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b-2 border-ink px-3 py-2">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-ink">
          <CountryLabel code={origin.origin} />
          {name}
        </h3>
        <p className="wt-label text-ink-soft">{period}</p>
      </div>
      <ScrollRegion>
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">
            {BOTTLE_CATEGORY_LABELS[category]} exported by {name}, {period}: million
            75 cl bottles, value per bottle and change on the twelve months
            before, for every destination together and the leading ones
          </caption>
          <thead>
            <tr className="border-b border-rule">
              <th scope="col" className={`${TH} w-8`}>
                #
              </th>
              <th scope="col" className={TH}>
                Destination
              </th>
              <th scope="col" className={TH_RIGHT}>
                M bottles
              </th>
              <th scope="col" className={TH_RIGHT}>
                EUR/75 cl
              </th>
              <th scope="col" className={TH_RIGHT}>
                YoY
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-ink/30">
              <td className={TD} />
              <th scope="row" className={`${TD} text-sm font-semibold text-ink`}>
                All destinations
              </th>
              <td className={`${TD_RIGHT} tnum font-mono text-sm font-semibold text-ink`}>
                {formatPrice(origin.world.bottlesM, origin.world.bottlesM < 10 ? 1 : 0)}
              </td>
              <td className={`${TD_RIGHT} tnum font-mono text-sm font-semibold text-ink`}>
                {formatPrice(origin.world.eurPerBottle)}
              </td>
              <td className={TD_RIGHT}>
                <MaybePercent value={origin.world.yoyPercent} />
              </td>
            </tr>
            {origin.destinations.map((row, index) => (
              <tr key={row.destination} className="border-b border-rule last:border-b-0">
                <td className={`${TD} tnum font-mono text-xs text-ink-soft`}>{index + 1}</td>
                <th scope="row" className={`${TD} font-normal`}>
                  <CountryLabel code={row.destination} withName />
                </th>
                <td className={`${TD_RIGHT} tnum font-mono text-sm text-ink-soft`}>
                  {formatPrice(row.bottlesM, row.bottlesM < 10 ? 1 : 0)}
                </td>
                <td className={`${TD_RIGHT} tnum font-mono text-sm text-ink`}>
                  {formatPrice(row.eurPerBottle)}
                </td>
                <td className={TD_RIGHT}>
                  <MaybePercent value={row.yoyPercent} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollRegion>
    </div>
  );
}
