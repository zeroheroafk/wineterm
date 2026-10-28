import { Container } from "@/components/layout/Container";
import { ButtonLink } from "@/components/ui/Button";

/**
 * Branded 404 for any address that matches no page. The links wrap onto
 * two lines on narrow screens rather than squeeze inside the fixed-height
 * buttons.
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
          We couldn&apos;t find the page you were looking for. Check the
          address, or use one of the links below to continue exploring
          WineTerm.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/" variant="secondary">
            Back to WineTerm
          </ButtonLink>
          <ButtonLink href="/markets">Explore markets</ButtonLink>
        </div>
      </div>
    </Container>
  );
}
