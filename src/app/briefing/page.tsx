import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { NewsletterSignup } from "@/components/editorial/NewsletterSignup";

export const metadata: Metadata = {
  title: "Get the briefing",
  description:
    "The WineTerm Weekly Briefing: prices, supply signals and trade developments across the European wine market, every Friday.",
};

/** Landing route for the newsletter call to action across the shell. */
export default function BriefingPage() {
  return (
    <Container className="pb-12">
      <Breadcrumbs items={[{ label: "Briefing" }]} />
      <div className="mx-auto max-w-xl py-8">
        <NewsletterSignup />
        <p className="mt-4 text-sm leading-relaxed text-ink-soft">
          Signup processing is not connected yet in this development build.
          The briefing launches together with the first market sections.
        </p>
      </div>
    </Container>
  );
}
