import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Descriptive text link with a trailing arrow, e.g. "All bulk wine
 * prices →". The label should name the destination; never "More" or "All".
 */
export function ArrowLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-baseline gap-1 text-sm font-medium text-wine underline-offset-4 transition-colors hover:text-wine-deep hover:underline ${className}`}
    >
      {children}
      <span aria-hidden="true" className="inline-block">
        &rarr;
      </span>
    </Link>
  );
}
