import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { SectionNav } from "@/components/layout/SectionNav";
import { PageHeader } from "@/components/ui/SectionHeader";
import type { BreadcrumbItem, NavSection } from "@/lib/navigation";

/** Shared header block for section routes: breadcrumb, title, section rail. */
export function SectionPageHeader({
  section,
  crumbs,
  kicker,
  title,
  description,
  activeHref,
}: {
  section?: NavSection;
  crumbs: BreadcrumbItem[];
  kicker: string;
  title: string;
  description?: string;
  activeHref?: string;
}) {
  return (
    <>
      <Breadcrumbs items={crumbs} />
      <PageHeader kicker={kicker} title={title} description={description} />
      {section ? (
        <div className="mt-6">
          <SectionNav section={section} activeHref={activeHref} />
        </div>
      ) : null}
    </>
  );
}
