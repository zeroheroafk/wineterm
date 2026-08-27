import Link from "next/link";

import { Container } from "@/components/layout/Container";
import { MainNav } from "@/components/layout/MainNav";
import { MobileNav } from "@/components/layout/MobileNav";
import { UtilityBar } from "@/components/layout/UtilityBar";
import { Wordmark } from "@/components/layout/Wordmark";

/**
 * Global header: utility bar, masthead row with the wordmark and the
 * newsletter call to action, and the primary navigation rail.
 */
export function SiteHeader() {
  return (
    <header className="relative border-b-2 border-wine bg-paper">
      <UtilityBar />
      <Container>
        <div className="flex items-center justify-between gap-4 py-4">
          <Wordmark />
          <div className="flex items-center gap-3">
            <p className="wt-label hidden max-w-44 text-right leading-relaxed text-ink-soft xl:block">
              Prices, supply and trade for the professional wine market
            </p>
            <Link
              href="/briefing"
              className="hidden h-9 items-center border border-wine bg-wine px-4 text-sm font-medium text-paper transition-colors hover:bg-wine-deep sm:flex"
            >
              Get the briefing
            </Link>
            <MobileNav />
          </div>
        </div>
        <MainNav />
      </Container>
    </header>
  );
}
