import { Suspense } from "react";

import { Container } from "@/components/layout/Container";
import { MainNav } from "@/components/layout/MainNav";
import { MobileNav } from "@/components/layout/MobileNav";
import {
  MainNavFallback,
  MobileNavFallback,
} from "@/components/layout/NavFallbacks";
import { UtilityBar } from "@/components/layout/UtilityBar";
import { Wordmark } from "@/components/layout/Wordmark";
import { ButtonLink } from "@/components/ui/Button";

/**
 * Global header: compact utility strip, masthead row with the wordmark,
 * its descriptor and the single newsletter action, and the primary
 * navigation rail. The navigation marks the current section from the
 * pathname, so it sits behind a boundary with a static stand-in for the
 * routes whose path is only known at request time.
 */
export function SiteHeader() {
  return (
    <header className="relative border-b border-rule bg-paper">
      <UtilityBar />
      <Container>
        <div className="flex items-center justify-between gap-4 py-3">
          <div className="flex min-w-0 items-center gap-4">
            <Wordmark />
            <p className="hidden border-l border-rule pl-4 text-sm leading-tight text-ink-soft md:block">
              Wine market intelligence
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:block">
              <ButtonLink href="/briefing">Get the briefing</ButtonLink>
            </div>
            <Suspense fallback={<MobileNavFallback />}>
              <MobileNav />
            </Suspense>
          </div>
        </div>
        <Suspense fallback={<MainNavFallback />}>
          <MainNav />
        </Suspense>
      </Container>
    </header>
  );
}
