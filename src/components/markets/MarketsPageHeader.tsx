import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { SectionNav } from "@/components/layout/SectionNav";
import { PageHeader } from "@/components/ui/SectionHeader";
import { primaryNavigation } from "@/lib/navigation";

const MARKETS_SECTION = primaryNavigation[0];

/** Shared header block for Markets routes: breadcrumb, title, section rail. */
export function MarketsPageHeader({
  crumb,
  kicker = "Markets",
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
            ? [{ label: "Markets", href: "/markets" }, { label: crumb }]
            : [{ label: "Markets" }]
        }
      />
      <PageHeader kicker={kicker} title={title} description={description} />
      <div className="mt-6">
        <SectionNav section={MARKETS_SECTION} activeHref={activeHref} />
      </div>
    </>
  );
}
