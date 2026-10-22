import type { Metadata } from "next";
import { cacheLife } from "next/cache";

import { Container } from "@/components/layout/Container";
import { SectionPageHeader } from "@/components/layout/SectionPageHeader";
import { MethodologyNotes } from "@/components/supply/MethodologyNotes";
import {
  SpainBalanceHistoryTable,
  SpainBalanceNotes,
  SpainBalanceTable,
  SpainExitsAbroadTable,
} from "@/components/supply/SpainBalanceTables";
import { ButtonLink } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SourceLine } from "@/components/ui/SourceLine";
import { EmptyState } from "@/components/ui/states";
import { formatDate, formatMonthYear } from "@/lib/format";
import { primaryNavigation } from "@/lib/navigation";
import { getSource } from "@/services/markets/sources";
import { getSupplyService } from "@/services/supply/service";

export const metadata: Metadata = {
  title: "Crop & Supply",
  description:
    "Spain's declared wine balance: stocks, wine made, entries and exits in million hectolitres, from the monthly INFOVI declarations to the Ministry of Agriculture.",
};

/** Spain's balance is read from the database; regenerated at most hourly. */
export default async function SupplyPage() {
  "use cache";
  cacheLife("hours");

  const spain = await getSupplyService().getSpainBalance();
  const spainSource = spain ? getSource(spain.sourceId) : null;

  return (
    <Container className="pb-16">
      <SectionPageHeader
        section={primaryNavigation[2]}
        crumbs={[{ label: "Crop & Supply" }]}
        kicker="Crop & Supply"
        title="Supply balance"
        description="The physical balance of the market in million hectolitres. Spain's is drawn up from the stocks, production, entries and exits declared every month to the Ministry of Agriculture (INFOVI). Portugal, France and Italy publish no monthly entries and exits WineTerm may republish, so their balances follow once a source does; their declared stocks are on the stocks page."
        activeHref="/supply"
      />

      {spain && spainSource ? (
        <>
          <section id="spain" className="mt-10 scroll-mt-6">
            <SectionHeader
              kicker="Spain"
              title="Declared wine balance"
              description="Stocks at 31 July, wine made since 1 August, and the wine that came in and went out each month, as declared to the Ministry of Agriculture by producers of 1,000 hl or more and by warehouse holders. Computed closing stocks are set against the stocks declared at the end of the period."
            />
            {/* Side by side only where the history table fits beside the balance. */}
            <div className="mt-5 grid grid-cols-1 items-start gap-6 xl:grid-cols-[5fr_6fr]">
              <div className="max-w-3xl xl:max-w-none">
                <SpainBalanceTable latest={spain.latest} previous={spain.previous} />
              </div>
              <div className="max-w-3xl xl:max-w-none">
                <h3 className="wt-label mb-2 text-ink-soft">Completed campaigns</h3>
                <SpainBalanceHistoryTable history={spain.history} />
                <div className="mt-3">
                  <SourceLine
                    source={{ name: spainSource.name, url: spainSource.url }}
                    updatedAt={spain.updatedAt}
                  />
                </div>
                <SpainBalanceNotes />
                <p className="wt-label mt-2 max-w-3xl leading-relaxed text-ink-soft">
                  {formatMonthYear(spain.latestMonth)} was published on{" "}
                  {formatDate(spain.publishedAt)}. Wine only; producers of less
                  than 1,000 hl a year do not declare monthly and are not
                  included.
                </p>
              </div>
            </div>
          </section>

          {spain.latest.exitsAbroad ? (
            <section id="spain-exits-abroad" className="mt-10 scroll-mt-6">
              <SectionHeader
                kicker="Spain"
                title="Exits abroad, bulk and packaged"
                description="The wine declarants sent to the rest of the EU and to third countries since 1 August, by presentation and colour, as declared to the Ministry of Agriculture. Customs statistics on the Trade page count every exporter, not only declarants."
              />
              <div className="mt-5 max-w-4xl">
                <SpainExitsAbroadTable
                  latest={spain.latest}
                  lines={spain.latest.exitsAbroad}
                  previous={spain.previous}
                />
              </div>
            </section>
          ) : null}
        </>
      ) : (
        <div className="mt-10 max-w-3xl">
          <EmptyState
            title="No declarations to show"
            detail="Spain's balance is read from the database, which this build is not connected to."
          />
        </div>
      )}

      <div className="mt-10 max-w-3xl">
        <MethodologyNotes title="How to read the balance">
          <p>
            Spain&apos;s balance adds up the monthly INFOVI declarations from
            1 August: opening stocks are those declared at 31 July, wine made
            is the ministry&apos;s total since 1 August, and entries and exits
            are the sums of the monthly tables. The declared closing stocks
            come out below the computed ones, and by more before 2022/23, when
            own operations were not yet declared separately: losses, uses not
            declared as exits and later revisions make the difference, which
            is shown rather than smoothed away.
          </p>
          <p className="mt-2">
            Exits abroad are the declarants&apos; own figures and run below the
            customs export statistics, since other traders export too.
            September 2018&apos;s entries and exits are left out because the
            ministry&apos;s tables for that month contradict one another, so
            the completed campaigns start with 2019/20.
          </p>
        </MethodologyNotes>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <ButtonLink href="/supply/production" variant="secondary">
          Production detail
        </ButtonLink>
        <ButtonLink href="/supply/stocks" variant="secondary">
          Stocks detail
        </ButtonLink>
        <ButtonLink href="/harvest" variant="secondary">
          Harvest estimates
        </ButtonLink>
      </div>
    </Container>
  );
}
