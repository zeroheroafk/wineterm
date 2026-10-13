import { Container } from "@/components/layout/Container";
import { MainNav } from "@/components/layout/MainNav";
import { MobileNav } from "@/components/layout/MobileNav";
import { Wordmark } from "@/components/layout/Wordmark";
import { ButtonLink } from "@/components/ui/Button";

export function SiteHeader() {
  return (
    <header className="relative z-40 border-b border-rule bg-ground">
      <Container className="flex min-h-20 items-center justify-between gap-5 py-3">
        <Wordmark />
        <MainNav />
        <div className="flex shrink-0 items-center gap-3">
          <div className="hidden sm:block">
            <ButtonLink href="/markets/compare" className="h-8 rounded-md px-3 text-[0.6875rem] font-bold uppercase">Compare markets</ButtonLink>
          </div>
          <MobileNav />
        </div>
      </Container>
    </header>
  );
}
