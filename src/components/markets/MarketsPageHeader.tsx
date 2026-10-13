import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { SectionNav } from "@/components/layout/SectionNav";
import { PageHeader } from "@/components/ui/SectionHeader";
import { pricesNavigation } from "@/lib/navigation";

const MARKETS_SECTION = pricesNavigation;

/** Shared header block for Markets routes: breadcrumb, title, section rail. */
export function MarketsPageHeader({
  crumb,
  kicker = "Prices",
  title,
  description,
  activeHref,
}: {
  /** Breadcrumb leaf; omit on the landing page. */
  crumb?: string;
  kicker?: string;
  title: string;
  description?: string;
  activeHref?: string;
}) {
  return (
    <>
      <Breadcrumbs
        items={
          crumb
            ? [{ label: "Prices", href: "/markets" }, { label: crumb }]
            : [{ label: "Prices" }]
        }
      />
      <PageHeader kicker={kicker} title={title} description={description} />
      <div className="mt-6">
        <SectionNav section={MARKETS_SECTION} activeHref={activeHref} />
      </div>
    </>
  );
}
