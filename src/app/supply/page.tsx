import type { Metadata } from "next";

import { Container } from "@/components/layout/Container";
import { SectionPageHeader } from "@/components/layout/SectionPageHeader";
import { BalanceTable } from "@/components/supply/BalanceTable";
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
import { formatDate, formatMonthYear } from "@/lib/format";
import { primaryNavigation } from "@/lib/navigation";
import { getSource } from "@/services/markets/sources";
import { getSupplyService } from "@/services/supply/service";

export const metadata: Metadata = {
  title: "Crop & Supply",
  description:
    "The physical balance of the European wine market: stocks, production, availability, use and trade in million hectolitres.",
};

// Spain's balance is read from the database; regenerate at most hourly.
export const revalidate = 3600;

export default async function SupplyPage() {
  const supply = getSupplyService();
  const current = await supply.getCurrentCampaign();
  const [currentBalances, previousBalances, spain] = await Promise.all([
    supply.getBalances(current),
    supply.getBalances("2025/26"),
    supply.getSpainBalance(),
  ]);
  const spainSource = spain ? getSource(spain.sourceId) : null;

  return (
    <Container className="pb-16">
      <SectionPageHeader
        section={primaryNavigation[1]}
        crumbs={[{ label: "Crop & Supply" }]}
        kicker="Crop & Supply"
        title="Supply balance"
        description={
          spain
            ? "The physical balance of the market in million hectolitres. Spain's is drawn up from the stocks, production, entries and exits declared every month to the Ministry of Agriculture (INFOVI) and leads the page; the four-country balances below are illustrative samples."
            : "The physical balance of the market: opening stocks, production, imports, use and trade, expressed in million hectolitres. Development figures are illustrative samples."
        }
        activeHref="/supply"
      />

      {spain && spainSource ? (
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
      ) : null}

      {spain?.latest.exitsAbroad ? (
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

      <section id="balance" className="mt-10 scroll-mt-6">
        <SectionHeader
          kicker="Current campaign"
          title="2026/27 balance, first estimates"
          description={`${spain ? "Illustrative samples. " : ""}Availability is opening stocks plus estimated production plus imports. Closing stocks are derived from the balance identity and revised as declarations arrive.`}
        />
        <div className="mt-5">
          <BalanceTable rows={currentBalances} campaign={current} />
        </div>
      </section>

      <section className="mt-12">
        <SectionHeader
          kicker="Campaign comparison"
          title="2025/26 balance, provisional"
          description={`${spain ? "Illustrative samples. " : ""}The previous campaign with the residual line: the difference between the balance-derived closing stocks and the opening stocks the countries actually declared for 2026/27.`}
        />
        <div className="mt-5">
          <BalanceTable rows={previousBalances} campaign="2025/26" />
        </div>
      </section>

      <div className="mt-10 max-w-3xl">
        <MethodologyNotes title="How to read the balance">
          <p>
            The balance follows the indicative identity: opening stocks plus
            production plus imports, minus domestic use and exports, equals
            estimated closing stocks. It is presented as an approximation,
            not an accounting identity. Domestic use bundles human
            consumption with industrial uses, distillation and losses;
            production estimates are revised until final declarations close;
            and stock declarations use different reference dates by country.
          </p>
          <p className="mt-2">
            The residual line quantifies the mismatch instead of hiding it:
            where a following campaign has declared opening stocks, the
            difference against the computed closing figure is shown per
            country.
          </p>
          {spain ? (
            <p className="mt-2">
              Spain&apos;s balance adds up the monthly INFOVI declarations
              from 1 August: opening stocks are those declared at 31 July,
              wine made is the ministry&apos;s total since 1 August, and
              entries and exits are the sums of the monthly tables. The
              declared closing stocks come out below the computed ones, and
              by more before 2022/23, when own operations were not yet
              declared separately. Exits abroad are the declarants&apos; own
              figures and run below the customs export statistics, since
              other traders export too. September 2018&apos;s entries and
              exits are left out because the ministry&apos;s tables for that
              month contradict one another, so the completed campaigns start
              with 2019/20.
            </p>
          ) : null}
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
          Harvest monitor
        </ButtonLink>
      </div>
    </Container>
  );
}
