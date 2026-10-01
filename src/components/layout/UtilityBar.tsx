import Link from "next/link";

import { Container } from "@/components/layout/Container";
import { EditionDate } from "@/components/layout/EditionDate";

/**
 * Compact institutional strip above the masthead: edition date, coverage
 * and secondary links, set small and in sentence case so it never
 * competes with the primary navigation.
 */
export function UtilityBar() {
  return (
    <div className="wt-on-dark bg-wine-deep text-xs text-wine-wash">
      <Container className="flex h-7 items-center justify-between gap-4">
        <p className="truncate">
          <EditionDate />
          <span className="hidden md:inline">
            <span aria-hidden="true" className="mx-2.5 opacity-50">
              |
            </span>
            Coverage: Spain, Portugal, France and Italy
          </span>
        </p>
        <nav aria-label="Utility" className="flex shrink-0 items-center gap-4">
          <Link
            href="/insights/methodology"
            className="hidden underline-offset-2 hover:text-paper hover:underline sm:inline"
          >
            Methodology
          </Link>
          <Link
            href="/about"
            className="underline-offset-2 hover:text-paper hover:underline"
          >
            About
          </Link>
        </nav>
      </Container>
    </div>
  );
}
