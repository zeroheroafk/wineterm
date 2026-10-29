import type { Metadata } from "next";
import { Fragment } from "react";

import { DirectoryEntry } from "@/components/directory/DirectoryEntry";
import { Container } from "@/components/layout/Container";
import { SectionPageHeader } from "@/components/layout/SectionPageHeader";
import { ButtonLink } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { primaryNavigation } from "@/lib/navigation";
import { getDirectoryService } from "@/services/directory";
import {
  COUNTRY_NAMES,
  DIRECTORY_CATEGORIES,
  DIRECTORY_CATEGORY_LABELS,
  type CountryCode,
  type DirectoryCategory,
  type DirectoryCompany,
} from "@/services/types";

export const metadata: Metadata = {
  title: "Wine Trade Companies",
  description:
    "The companies of the professional wine trade: wineries, cooperatives, bottlers, brokers, suppliers and service providers.",
  alternates: { canonical: "/companies" },
};

const CATEGORY_DESCRIPTIONS: Record<DirectoryCategory, string> = {
  "wineries-cooperatives":
    "Producers and first-stage processors: wine groups, family producers and growers' cooperatives.",
  "bulk-buyers-sellers":
    "Operators buying and selling bulk wine, must and concentrates.",
  "brokers-intermediaries":
    "Brokerage desks and agents active in the covered markets.",
  "bottlers-packers":
    "Contract bottling, canning, bag-in-box and private-label packing.",
  "importers-exporters":
    "Trading houses and distributors moving wine across the covered flows.",
  "suppliers-services":
    "Dry goods, oenological products, equipment, logistics and professional services.",
};

const LIST = new Intl.ListFormat("en-GB", { type: "conjunction" });

function companyCount(count: number): string {
  return `${count} ${count === 1 ? "company" : "companies"}`;
}

/** "A, B and C", each name linked to the company's entry. */
function EntryLinks({ companies }: { companies: DirectoryCompany[] }) {
  return companies.map((company, index) => (
    <Fragment key={company.id}>
      {index === 0 ? null : index === companies.length - 1 ? " and " : ", "}
      <a
        href={`#${company.id}`}
        className="text-wine underline decoration-rule underline-offset-2 hover:text-wine-deep"
      >
        {company.name}
      </a>
    </Fragment>
  ));
}

export default async function CompaniesPage() {
  const companies = await getDirectoryService().getCompanies();
  // The countries listed, in the order WineTerm covers them.
  const countries = (Object.keys(COUNTRY_NAMES) as CountryCode[])
    .filter((code) => companies.some((company) => company.country === code))
    .map((code) => COUNTRY_NAMES[code]);

  return (
    <Container className="pb-16">
      <SectionPageHeader
        section={primaryNavigation[5]}
        crumbs={[{ label: "Companies" }]}
        kicker="Companies"
        title="Companies"
        description={`A structured directory of the professional wine trade, built for finding counterparties, not for consumer discovery: ${companyCount(companies.length)} in ${LIST.format(countries)}, listed by what they do.`}
        activeHref="/companies"
      />

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-12">
          {DIRECTORY_CATEGORIES.map((category) => {
            const listed = companies.filter(
              (company) => company.category === category,
            );
            const alsoHere = companies.filter((company) =>
              company.otherCategories.includes(category),
            );
            const titleId = `${category}-title`;
            return (
              <section
                key={category}
                id={category}
                aria-labelledby={titleId}
                className="scroll-mt-6"
              >
                <SectionHeader
                  id={titleId}
                  kicker={companyCount(listed.length)}
                  title={DIRECTORY_CATEGORY_LABELS[category]}
                  description={CATEGORY_DESCRIPTIONS[category]}
                />
                <div className="mt-4">
                  {listed.map((company) => (
                    <DirectoryEntry key={company.id} company={company} />
                  ))}
                </div>
                {alsoHere.length > 0 ? (
                  <p className="border-t border-rule pt-3 text-sm leading-relaxed text-pretty text-ink-soft">
                    Also working in this category, and listed under their
                    main activity: <EntryLinks companies={alsoHere} />.
                  </p>
                ) : null}
              </section>
            );
          })}
        </div>

        <aside className="min-w-0 space-y-6">
          <div className="border border-rule bg-paper px-5 py-4">
            <h2 className="wt-label text-wine">About the listings</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              Each entry describes the company in WineTerm&apos;s own words
              and was checked, on the date it shows, against pages the
              company or its group publishes. A company is listed under its
              main activity and tagged with the other categories it works
              in; both are editorial assignments. The country is that of the
              business or local entity listed, not every country it serves.
            </p>
          </div>

          <div className="border border-rule border-t-2 border-t-wine bg-paper px-5 py-5">
            <p className="wt-label text-wine">Listings</p>
            <h2 className="wt-headline mt-2 text-2xl font-semibold text-ink">
              List your organisation
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              Entries are checked before they are published. To list your
              organisation, or to correct an entry, get in touch.
            </p>
            <div className="mt-4">
              <ButtonLink href="/contact" variant="secondary">
                Contact WineTerm
              </ButtonLink>
            </div>
          </div>
        </aside>
      </div>
    </Container>
  );
}
