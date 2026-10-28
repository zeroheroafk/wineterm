import { CountryLabel } from "@/components/ui/CountryLabel";
import { formatDate } from "@/lib/format";
import {
  DIRECTORY_CATEGORY_LABELS,
  type DirectoryCompany,
} from "@/services/types";

/** "sogrape.com" for "https://www.sogrape.com/en/". */
function websiteHost(url: string): string {
  return new URL(url).hostname.replace(/^www\./, "");
}

/**
 * One company in the directory: its name and country beside what it
 * does, the other categories it works in, its website and the date the
 * entry was checked. The entry carries the company's id, so
 * /directory#<id> leads to it.
 */
export function DirectoryEntry({ company }: { company: DirectoryCompany }) {
  const nameId = `${company.id}-name`;
  const alsoId = `${company.id}-also`;

  return (
    <article
      id={company.id}
      aria-labelledby={nameId}
      className="grid scroll-mt-6 gap-x-6 gap-y-2 border-t border-rule py-4 first:border-t-0 sm:grid-cols-[minmax(0,13rem)_minmax(0,1fr)]"
    >
      <div>
        <h3
          id={nameId}
          className="wt-headline text-lg leading-snug font-semibold text-ink"
        >
          {company.name}
        </h3>
        <p className="mt-1.5">
          <CountryLabel code={company.country} withName />
        </p>
      </div>

      <div className="min-w-0">
        <p className="max-w-2xl text-sm leading-relaxed text-pretty text-ink">
          {company.description}
        </p>
        {company.otherCategories.length > 0 ? (
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            <span id={alsoId} className="wt-label text-ink-soft">
              Also
            </span>
            <ul aria-labelledby={alsoId} className="flex flex-wrap gap-1.5">
              {company.otherCategories.map((category) => (
                <li
                  key={category}
                  className="wt-label border border-rule px-1.5 py-0.5 text-ink-soft"
                >
                  {DIRECTORY_CATEGORY_LABELS[category]}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <p className="mt-2.5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <a
            href={company.website}
            className="text-sm font-medium text-wine underline decoration-rule underline-offset-2 hover:text-wine-deep"
          >
            {websiteHost(company.website)}
          </a>
          <span className="wt-label text-ink-soft">
            Checked{" "}
            <time dateTime={company.checkedAt}>
              {formatDate(company.checkedAt)}
            </time>
          </span>
        </p>
      </div>
    </article>
  );
}
