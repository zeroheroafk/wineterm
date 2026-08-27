import { Container } from "@/components/layout/Container";
import { ButtonLink } from "@/components/ui/Button";

/**
 * Branded 404. During the foundation phase this also answers navigation
 * links whose sections have not been built yet.
 */
export default function NotFound() {
  return (
    <Container className="py-20">
      <div className="mx-auto max-w-lg border border-rule border-t-2 border-t-wine bg-paper p-8 text-center">
        <p className="wt-label text-wine">404</p>
        <h1 className="wt-headline mt-2 text-3xl font-semibold text-ink">
          This page is not available
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          The address may be wrong, or this section of WineTerm has not
          opened yet. Sections come online as their data series are
          connected.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <ButtonLink href="/" variant="secondary">
            Back to WineTerm
          </ButtonLink>
          <ButtonLink href="/briefing">Get the briefing</ButtonLink>
        </div>
      </div>
    </Container>
  );
}
