import type { ReactNode, SelectHTMLAttributes } from "react";

/**
 * Horizontal filter rail above a table or chart. Purely compositional:
 * pages place FilterSelect controls (or custom controls) inside it.
 */
export function FilterBar({
  children,
  end,
}: {
  children: ReactNode;
  /** Right-aligned slot, typically an UpdatedAt or a result count. */
  end?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-y border-rule bg-paper px-3 py-2.5">
      <div className="flex flex-wrap items-end gap-x-5 gap-y-3">{children}</div>
      {end ? <div className="flex items-center">{end}</div> : null}
    </div>
  );
}

export function FilterSelect({
  label,
  id,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  id: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="wt-label text-ink-soft">
        {label}
      </label>
      <select
        id={id}
        {...props}
        className="h-8 min-w-36 border border-rule bg-paper px-2 font-mono text-xs text-ink"
      >
        {children}
      </select>
    </div>
  );
}
