import { Container } from "@/components/layout/Container";
import { NewsletterSignup } from "@/components/editorial/NewsletterSignup";
import { ButtonLink } from "@/components/ui/Button";

/**
 * Interim home page for the foundation phase. The full homepage, with
 * market panels and editorial slots, is built in the next phase.
 */
export default function Home() {
  return (
    <Container className="py-12">
      <div className="max-w-3xl border-b border-rule pb-10">
        <p className="wt-label text-wine">Wine market intelligence</p>
        <h1 className="wt-headline mt-3 text-5xl font-semibold leading-tight text-ink sm:text-6xl">
          The market desk for the professional wine trade
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-ink-soft">
          Prices, production, stocks, trade and crop intelligence for
          wineries, growers and the global wine trade. Coverage starts with
          Spain and Portugal, with comparative data for France and Italy.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <ButtonLink href="/briefing">Get the briefing</ButtonLink>
          <ButtonLink href="/insights/methodology" variant="secondary">
            How WineTerm data works
          </ButtonLink>
        </div>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_24rem]">
        <div>
          <p className="wt-label text-ink-soft">Platform status</p>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-ink">
            WineTerm is in development. Market sections open as their data
            series are connected and verified; the Weekly Briefing is the
            first product to launch.
          </p>
        </div>
        <NewsletterSignup />
      </div>
    </Container>
  );
}
