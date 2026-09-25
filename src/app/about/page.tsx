import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { ButtonLink } from "@/components/ui/Button";
import { PageHeader, SectionHeader } from "@/components/ui/SectionHeader";

export const metadata: Metadata = {
  title: "About",
  description:
    "WineTerm is an independent market desk for the professional wine trade: prices, production, stocks, trade and crop intelligence.",
};

export default function AboutPage() {
  return (
    <Container className="pb-16">
      <Breadcrumbs items={[{ label: "About" }]} />
      <PageHeader
        kicker="WineTerm"
        title="An independent market desk for the wine trade"
        description="Prices, production, stocks, trade and crop intelligence for wineries, growers and the global wine trade."
      />

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div>
          <div className="max-w-2xl space-y-3 text-[0.95rem] leading-relaxed text-ink">
            <p>
              WineTerm exists because the professional wine market runs on
              scattered information: regional bulletins, settlement notes,
              customs tables and phone calls. We bring those signals into one
              disciplined place, keep every observation attached to its
              source, unit and date, and add interpretation only where the
              data supports it.
            </p>
            <p>
              Coverage starts with the professional European market, with
              particularly deep coverage of Spain and Portugal and
              comparative series for France and Italy. The platform is built
              for repeated working use by wineries, winegrowers,
              cooperatives, bulk buyers and sellers, brokers, bottlers,
              importers and exporters, industry suppliers and analysts.
            </p>
            <p>
              WineTerm is currently in development. Every figure shown today
              is an illustrative sample, marked as such; the{" "}
              <Link
                href="/insights/methodology"
                className="text-wine underline decoration-rule underline-offset-2 hover:text-wine-deep"
              >
                methodology
              </Link>{" "}
              those samples demonstrate is the one live data will follow.
            </p>
          </div>

          <section className="mt-10">
            <SectionHeader kicker="Principles" title="How WineTerm works" />
            <ul className="mt-5 max-w-2xl divide-y divide-rule border-y border-rule">
              {[
                "Every figure carries its source, unit, date and status; nothing is presented as live that is not.",
                "Original observations are never replaced: normalisations and derivations are labelled additions.",
                "Editorial judgement is separated from data and states what it rests on.",
                "Fragmented markets are shown as they are; WineTerm does not invent national averages.",
              ].map((principle) => (
                <li
                  key={principle}
                  className="py-2.5 text-sm leading-relaxed text-ink"
                >
                  {principle}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="space-y-6">
          <div className="border border-rule bg-paper px-5 py-4">
            <h2 className="wt-label text-wine">WineTerm is</h2>
            <ul className="mt-2 space-y-1.5 text-sm text-ink">
              <li>Market intelligence for the wine industry</li>
              <li>Built for professional, repeated use</li>
              <li>Source-first and unit-exact</li>
            </ul>
            <h2 className="wt-label mt-4 border-t border-rule pt-3 text-ink-soft">
              WineTerm is not
            </h2>
            <ul className="mt-2 space-y-1.5 text-sm text-ink-soft">
              <li>A consumer wine magazine or shop</li>
              <li>A tasting, rating or lifestyle platform</li>
              <li>A fine-wine investment or collector tool</li>
              <li>A marketplace or broker</li>
            </ul>
          </div>
          <div className="border border-rule bg-paper px-5 py-4">
            <h2 className="wt-label text-wine">Get in touch</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              Data partnerships, directory listings, coverage suggestions or
              corrections.
            </p>
            <div className="mt-3">
              <ButtonLink href="/contact" variant="secondary">
                Contact
              </ButtonLink>
            </div>
          </div>
        </aside>
      </div>
    </Container>
  );
}
