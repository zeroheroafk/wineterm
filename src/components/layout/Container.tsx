import type { ReactNode } from "react";

/**
 * Main content container used by every tier of the shell, so the utility
 * bar, header, price strip, sections and footer share one set of edges:
 * 1,280px wide at most, 1,232px of content inside the side padding.
 */
export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-[80rem] px-4 sm:px-6 ${className}`}>
      {children}
    </div>
  );
}
