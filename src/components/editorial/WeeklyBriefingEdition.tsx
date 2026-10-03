import Link from "next/link";

import { InlinePercentChange } from "@/components/market/ChangeCell";
import { ScrollRegion } from "@/components/ui/ScrollRegion";
import { DataNote } from "@/components/ui/SourceLine";
import { formatDate, formatPrice } from "@/lib/format";
import type { BriefingPrice, WeeklyBriefing } from "@/services/briefing/types";

const TH = "wt-label px-3 py-2 font-normal text-ink-soft first:pl-0 last:pr-0";
const TD = "px-3 py-2 first:pl-0 last:pr-0";

function Percent({ value }: { value: number | null }) {
  return value === null ? (
    <span className="text-ink-soft">n/a</span>
  ) : (
    <InlinePercentChange value={value} />
  );
}

/** Prices in a ruled table: name, price, the two changes and the date. */
function PriceTable({
  prices,
  caption,
  changeLabel,
  dateLabel = "Week to",
}: {
  prices: BriefingPrice[];
  caption: string;
  changeLabel: string;
  dateLabel?: string;
}) {
  return (
    <ScrollRegion>
      <table className="w-full border-collapse text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-ink/30">
            <th scope="col" className={TH}>
              Market
            </th>
            <th scope="col" className={`${TH} text-right`}>
              Price
            </th>
            <th scope="col" className={`${TH} text-right`}>
              {changeLabel}
            </th>
            <th scope="col" className={`${TH} hidden text-right sm:table-cell`}>
              Year on year
            </th>
            <th scope="col" className={`${TH} hidden text-right md:table-cell`}>
              {dateLabel}
            </th>
          </tr>
        </thead>
        <tbody>
          {prices.map((price) => (
            <tr key={price.code} className="border-b border-rule">
              <th scope="row" className={`${TD} font-normal`}>
                <Link
                  href={`/markets/series/${price.code}`}
                  className="font-medium text-ink hover:text-wine-deep"
                >
                  {price.name}
                </Link>
                <span className="block text-xs text-ink-soft md:hidden">
                  {price.period ?? formatDate(price.date)}
                </span>
              </th>
              <td className={`${TD} tnum text-right whitespace-nowrap`}>
                <span className="font-semibold text-ink">{formatPrice(price.value)}</span>
                <span className="ml-1 text-xs text-ink-soft">{price.unit}</span>
              </td>
              <td className={`${TD} text-right`}>
                <Percent value={price.changePercent} />
              </td>
              <td className={`${TD} hidden text-right sm:table-cell`}>
                <Percent value={price.yoyPercent} />
              </td>
              <td
                className={`${TD} tnum hidden text-right text-xs whitespace-nowrap text-ink-soft md:table-cell`}
              >
                {price.period ?? formatDate(price.date)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </ScrollRegion>
  );
}

/**
 * One edition of the Weekly Briefing in full: the headline and summary
 * written from the figures, then the figures themselves, each linked to
 * its series page, and the sources.
 */
export function WeeklyBriefingEdition({
  edition,
  headingLevel = 2,
}: {
  edition: WeeklyBriefing;
  /** 1 when the edition is the page, 2 under the page's own heading. */
  headingLevel?: 1 | 2;
}) {
  const Heading = headingLevel === 1 ? "h1" : "h2";
  const Sub = headingLevel === 1 ? "h2" : "h3";
  const movers = [...edition.regional.risers, ...edition.regional.fallers];

  return (
    <article className="border border-rule border-t-2 border-t-wine bg-paper px-5 py-5 sm:px-6">
      <p className="wt-label text-wine">
        {edition.isCurrent ? "Current edition" : "Edition"}
        <span aria-hidden="true" className="mx-2 text-rule">
          &middot;
        </span>
        <time dateTime={edition.date}>{formatDate(edition.date)}</time>
      </p>
      <Heading className="wt-headline mt-2 text-2xl leading-snug font-semibold text-balance text-ink sm:text-[1.75rem]">
        {edition.headline}
      </Heading>
      <p className="mt-3 max-w-2xl text-[0.9375rem] leading-[1.6] text-pretty text-ink">
        {edition.summary}
      </p>

      {edition.national.length > 0 ? (
        <section className="mt-7">
          <Sub className="wt-label text-ink-soft">
            National averages, week to {formatDate(edition.weekEnding)}
          </Sub>
          <div className="mt-2">
            <PriceTable
              prices={edition.national}
              caption="National average bulk wine prices this week"
              changeLabel="Week"
            />
          </div>
        </section>
      ) : null}

      {movers.length > 0 ? (
        <section className="mt-7">
          <Sub className="wt-label text-ink-soft">
            Regional markets: {edition.regional.quoted} quoted
            {edition.regional.unquoted > 0
              ? `, ${edition.regional.unquoted} without a quotation this week`
              : ""}
          </Sub>
          <div className="mt-2">
            <PriceTable
              prices={movers}
              caption="Largest rises and falls in the regional markets this week"
              changeLabel="Week"
            />
          </div>
        </section>
      ) : null}

      {edition.monthly.length > 0 ? (
        <section className="mt-7">
          <Sub className="wt-label text-ink-soft">New monthly prices this week</Sub>
          <div className="mt-2">
            <PriceTable
              prices={edition.monthly}
              caption="Monthly bulk wine prices published this week"
              changeLabel="Month"
              dateLabel="Month"
            />
          </div>
        </section>
      ) : null}

      <footer className="mt-6 border-t border-rule pt-3">
        <DataNote source={edition.sources}>
          Written from the price series as they stood on{" "}
          {formatDate(edition.date)}; every figure links to its series.
        </DataNote>
      </footer>
    </article>
  );
}
