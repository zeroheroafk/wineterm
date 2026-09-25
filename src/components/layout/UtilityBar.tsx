import Link from "next/link";

import { Container } from "@/components/layout/Container";
import { CurrentDate } from "@/components/ui/CurrentDate";

/** Thin institutional strip above the main header. */
export function UtilityBar() {
  return (
    <div className="bg-wine-deep text-wine-wash">
      <Container className="flex h-8 items-center justify-between gap-4">
        <p className="wt-label truncate">
          <span className="hidden sm:inline">
            <CurrentDate
              id="edition-date"
              options={{
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              }}
            />
          </span>
          <span className="mx-2 hidden text-wine sm:inline" aria-hidden="true">
            |
          </span>
          European wine market intelligence
        </p>
        <nav aria-label="Utility" className="flex items-center gap-4">
          <span className="wt-label hidden text-ochre md:inline">
            ES&nbsp;&middot;&nbsp;PT&nbsp;&middot;&nbsp;FR&nbsp;&middot;&nbsp;IT
          </span>
          <Link
            href="/insights/methodology"
            className="wt-label hidden hover:text-paper sm:inline"
          >
            Methodology
          </Link>
          <Link href="/about" className="wt-label hover:text-paper">
            About
          </Link>
        </nav>
      </Container>
    </div>
  );
}
