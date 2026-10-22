import type { Metadata } from "next";
import { cacheLife } from "next/cache";

import { Container } from "@/components/layout/Container";
import { SectionPageHeader } from "@/components/layout/SectionPageHeader";
import { AnnualStocksSection } from "@/components/supply/AnnualStocksSection";
import { JulyStocksTable } from "@/components/supply/JulyStocksTable";
import { MethodologyNotes } from "@/components/supply/MethodologyNotes";
import { MonthlyStocksSection } from "@/components/supply/MonthlyStocksSection";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { EmptyState } from "@/components/ui/states";
import { formatDate, formatMonthYear } from "@/lib/format";
import { primaryNavigation } from "@/lib/navigation";
import { getSupplyService } from "@/services/supply/service";

export const metadata: Metadata = {
  title: "Stocks",
  description:
    "Wine stocks in Spain, Italy, France and Portugal as their operators declare them: Spain and Italy at the end of each month, France and Portugal at 31 July, in million hectolitres.",
};

/** The stocks are read from the database; regenerated at most hourly. */
export default async function StocksPage() {
  "use cache";
  cacheLife("hours");

  const supply = getSupplyService();
  const [july, spain, italy, france, portugal] = await Promise.all([
    supply.getJulyStocks(),
    supply.getSpainMonthlyStocks(),
    supply.getItalyMonthlyStocks(),
    supply.getFranceAnnualStocks(),
    supply.getPortugalAnnualStocks(),
  ]);
  const connected = spain || italy || france || portugal;

  return (
    <Container className="pb-16">
      <SectionPageHeader
        section={primaryNavigation[2]}
        crumbs={[
          { label: "Crop & Supply", href: "/supply" },
          { label: "Stocks" },
        ]}
        kicker="Crop & Supply"
        title="Stocks"
        description="Wine held in each country as its operators declare it: Spain and Italy at the end of each month, France and Portugal at 31 July, when the campaign closes. Each source counts its own declarants and products, so countries are compared indicatively and each is read against itself a year earlier."
        activeHref="/supply/stocks"
      />

      {july.length > 0 ? (
        <section className="mt-10">
          <SectionHeader
            kicker="Across countries"
            title="Stocks at 31 July"
            description="Each country's stocks at the close of its latest campaign against a year earlier, as its own source counts them. The sources differ in who declares and what is counted, so the figures sit side by side without adding up to one market."
          />
          <div className="mt-5">
            <JulyStocksTable rows={july} />
          </div>
        </section>
      ) : null}

      {spain ? (
        <MonthlyStocksSection
          stocks={spain}
          kicker="Spain"
          title="Monthly wine stocks"
          description="Wine held at the end of each month by producers of 1,000 hl or more and by warehouse holders, as declared to the Ministry of Agriculture (INFOVI). Stocks peak after the harvest and fall to their low at the end of July, when the campaign closes."
          note={
            <>
              {formatMonthYear(spain.latestMonth)} was published on{" "}
              {formatDate(spain.publishedAt)}. Figures are the national totals of the monthly
              declarations; producers making less than 1,000 hl a year do not declare every
              month and are not included.
            </>
          }
        />
      ) : null}

      {italy ? (
        <MonthlyStocksSection
          stocks={italy}
          kicker="Italy"
          title="Monthly wine and must stocks"
          description="Wine, must and new wine held at the end of each month by the operators that keep the telematic wine register, as the Ministry of Agriculture's inspectorate (ICQRF) reports it in Cantina Italia. The register holds at least 95% of the wine kept in Italy."
          note={
            <>
              {formatMonthYear(italy.latestMonth)} was published on{" "}
              {formatDate(italy.publishedAt)}. Wine with a PDO or PGI includes bottled and bulk
              wine alike; the inspectorate publishes no report for August, when the campaign&apos;s
              registrations close, so the chart skips it.
            </>
          }
        />
      ) : null}

      {france ? (
        <AnnualStocksSection
          stocks={france}
          kicker="France"
          title="Stocks declared at 31 July"
          description="Wine held at the close of the campaign by producers and by traders, as each declares to customs, by category and colour. Traders' stocks include wine from the rest of the EU and from third countries; PGI wine and wine without GI add the volumes declared with and without a grape variety."
          note={
            <>
              31 July {france.latestYear} was published on {formatDate(france.publishedAt)}. The
              customs publish each campaign&apos;s declarations once, in October or November, and
              revise them only by a new release.
            </>
          }
        />
      ) : null}

      {portugal ? (
        <AnnualStocksSection
          stocks={portugal}
          kicker="Portugal"
          title="Stocks declared at 31 July"
          description="Wine and must held at the close of the campaign by every operator but retailers, as declared to the wine institute (IVV), by category and colour. PDO and PGI wine include wine eligible for certification, and PDO liqueur wine is counted apart, as the institute does."
          note={
            <>
              The institute publishes the series some months after the declarations close in
              September; WineTerm read it on {formatDate(portugal.updatedAt)}. Wine and must are
              declared together, so the totals are not wine alone.
            </>
          }
        />
      ) : null}

      {!connected ? (
        <div className="mt-10 max-w-3xl">
          <EmptyState
            title="No declarations to show"
            detail="Stocks are read from the database, which this build is not connected to."
          />
        </div>
      ) : null}

      <div className="mt-10 max-w-3xl">
        <MethodologyNotes title="Reporting dates and coverage">
          <p>
            Spain&apos;s month-end stocks are declared to the Ministry of Agriculture (INFOVI)
            by producers of 1,000 hl or more and by warehouse holders, published about six
            weeks after the month ends; smaller producers declare once a year, and at 31 July
            2024 held another 1.5 Mhl. Italy&apos;s month-end stocks are the telematic wine
            register&apos;s, published by the ICQRF 8 to 12 days after the month ends; musts and
            new wine still in fermentation are counted apart from wine.
          </p>
          <p className="mt-3 border-t border-rule pt-3">
            France&apos;s and Portugal&apos;s stocks are declared once a year at 31 July, the
            close of the campaign, by every holder: in France to customs, producers and traders
            apart, published in October or November; in Portugal to the wine institute, wine
            and must together, published as a series some months later. Opening stocks at
            1 August are the stocks declared at 31 July.
          </p>
          <p className="mt-3 border-t border-rule pt-3">
            Each country is compared against itself a year earlier. Across countries the
            comparison is indicative: who declares, what is counted and whether must is
            included differ, and the table of stocks at 31 July says so for each.
          </p>
        </MethodologyNotes>
      </div>
    </Container>
  );
}
