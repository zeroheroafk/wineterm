import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/ui/SectionHeader";
import { formatDate } from "@/lib/format";

export interface LegalSection {
  heading: string;
  paragraphs: string[];
}

/** Shared layout for legal pages: numbered prose sections, draft notice. */
export function LegalPage({
  title,
  description,
  updatedAt,
  sections,
}: {
  title: string;
  description: string;
  updatedAt: string;
  sections: LegalSection[];
}) {
  return (
    <Container className="pb-16">
      <Breadcrumbs items={[{ label: title }]} />
      <PageHeader kicker="WineTerm" title={title} description={description} />
      <p className="wt-label mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 border-y border-rule bg-paper px-3 py-2 text-ink-soft">
        <span className="text-ochre">Draft</span>
        This document is a development draft and is finalised before launch.
        Last updated {formatDate(updatedAt)}.
      </p>
      <div className="mt-8 max-w-2xl">
        {sections.map((section, index) => (
          <section key={section.heading} className="mt-8 first:mt-0">
            <h2 className="flex items-baseline gap-3 border-b border-rule pb-2">
              <span className="tnum font-mono text-sm text-wine">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="wt-headline text-xl font-semibold text-ink">
                {section.heading}
              </span>
            </h2>
            <div className="mt-3 space-y-3">
              {section.paragraphs.map((paragraph, pIndex) => (
                <p
                  key={pIndex}
                  className="text-sm leading-relaxed text-ink"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </Container>
  );
}
