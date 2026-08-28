import type { Metadata } from "next";

import { Container } from "@/components/layout/Container";
import { SectionPageHeader } from "@/components/layout/SectionPageHeader";
import { BalanceTable } from "@/components/supply/BalanceTable";
import { MethodologyNotes } from "@/components/supply/MethodologyNotes";
import { ButtonLink } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { primaryNavigation } from "@/lib/navigation";
import { getSupplyService } from "@/services/supply/service";

export const metadata: Metadata = {
  title: "Crop & Supply",
  description:
    "The physical balance of the European wine market: stocks, production, availability, use and trade in million hectolitres.",
};

export default async function SupplyPage() {
  const supply = getSupplyService();
  const current = await supply.getCurrentCampaign();
  const [currentBalances, previousBalances] = await Promise.all([
    supply.getBalances(current),
    supply.getBalances("2025/26"),
  ]);

  return (
    <Container className="pb-16">
      <SectionPageHeader
        section={primaryNavigation[1]}
        crumbs={[{ label: "Crop & Supply" }]}
        kicker="Crop & Supply"
        title="Supply balance"
        description="The physical balance of the market: opening stocks, production, imports, use and trade, expressed in million hectolitres. Development figures are illustrative samples."
        activeHref="/supply"
      />

      <section id="balance" className="mt-10 scroll-mt-6">
        <SectionHeader
          kicker="Current campaign"
          title="2026/27 balance, first estimates"
          description="Availability is opening stocks plus estimated production plus imports. Closing stocks are derived from the balance identity and revised as declarations arrive."
        />
        <div className="mt-5">
          <BalanceTable rows={currentBalances} campaign={current} />
        </div>
      </section>

      <section className="mt-12">
        <SectionHeader
          kicker="Campaign comparison"
          title="2025/26 balance, provisional"
          description="The previous campaign with the residual line: the difference between the balance-derived closing stocks and the opening stocks the countries actually declared for 2026/27."
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
