import type { Metadata } from "next";

import { Container } from "@/components/layout/Container";
import { SectionPageHeader } from "@/components/layout/SectionPageHeader";
import { ButtonLink } from "@/components/ui/Button";
import { primaryNavigation } from "@/lib/navigation";

export const metadata: Metadata = {
  title: "Directory",
  description:
    "The WineTerm professional directory: wineries, cooperatives, bottlers, brokers, suppliers and service providers for the wine trade.",
};

const CATEGORIES: { name: string; description: string }[] = [
  {
    name: "Wineries and cooperatives",
    description:
      "Producers and first-stage processors, by region, capacity and product focus.",
  },
  {
    name: "Bulk buyers and sellers",
    description:
      "Operators trading bulk wine, must and concentrates, with the categories they work.",
  },
  {
    name: "Brokers and intermediaries",
    description:
      "Brokerage desks and agents active in the covered markets.",
  },
  {
    name: "Bottlers and packers",
    description:
      "Contract bottling, canning and bag-in-box capacity, by location and line type.",
  },
  {
    name: "Importers and exporters",
    description:
      "Trading houses and distributors moving wine across the covered flows.",
  },
  {
    name: "Suppliers and services",
    description:
      "Dry goods, oenological products, logistics, laboratories and professional services.",
  },
];

export default function DirectoryPage() {
  return (
    <Container className="pb-16">
      <SectionPageHeader
        section={primaryNavigation[5]}
        crumbs={[{ label: "Directory" }]}
        kicker="Directory"
        title="Professional directory"
        description="A structured directory of the professional wine trade, built for finding counterparties, not for consumer discovery. Listings open at launch; no companies are listed during development."
        activeHref="/directory"
      />

      <ul className="mt-10 max-w-3xl border border-rule bg-paper">
        {CATEGORIES.map((category) => (
          <li
            key={category.name}
            className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-rule px-5 py-4 last:border-b-0"
          >
            <span className="min-w-56 flex-1">
              <span className="wt-headline block text-lg font-semibold text-ink">
                {category.name}
              </span>
              <span className="mt-0.5 block text-sm leading-relaxed text-ink-soft">
                {category.description}
              </span>
            </span>
            <span className="wt-label shrink-0 text-ochre">Opens at launch</span>
          </li>
        ))}
      </ul>

      <div className="mt-10 max-w-3xl border border-rule border-t-2 border-t-wine bg-paper px-5 py-5">
        <p className="wt-label text-wine">Early listing</p>
        <h2 className="wt-headline mt-2 text-2xl font-semibold text-ink">
          List your organisation from day one
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
          Directory listings are verified before publication: WineTerm
          confirms that each entry is a real, operating organisation. To be
          included in the opening edition, get in touch.
        </p>
        <div className="mt-4">
          <ButtonLink href="/contact" variant="secondary">
            Contact WineTerm
          </ButtonLink>
        </div>
      </div>
    </Container>
  );
}
