"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Horizontal scroll container for wide tables.
 *
 * While its content overflows, it is a focusable region named after the
 * table's caption (or `label`), so keyboard users can reach it and scroll
 * with the arrow keys. While everything fits, it stays a plain wrapper
 * and adds no tab stop. The attributes follow the measured size on the
 * element itself, so resizing needs no re-render; the server HTML is the
 * plain wrapper.
 */
export function ScrollRegion({
  children,
  className = "",
  label,
}: {
  children: ReactNode;
  className?: string;
  /** Accessible name; defaults to the caption of the table inside. */
  label?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const name =
      label ??
      element.querySelector("caption")?.textContent?.trim() ??
      "Scrollable table";

    const sync = () => {
      if (element.scrollWidth > element.clientWidth + 1) {
        element.setAttribute("role", "region");
        element.setAttribute("aria-label", name);
        element.tabIndex = 0;
      } else {
        element.removeAttribute("role");
        element.removeAttribute("aria-label");
        element.removeAttribute("tabindex");
      }
    };

    const observer = new ResizeObserver(sync);
    observer.observe(element);
    for (const child of element.children) observer.observe(child);
    return () => observer.disconnect();
  }, [label]);

  return (
    <div ref={ref} className={`relative overflow-x-auto ${className}`}>
      {children}
    </div>
  );
}
