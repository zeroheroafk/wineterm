"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useId } from "react";

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterFieldConfig {
  /** URL query parameter the field controls. */
  param: string;
  label: string;
  /** "select" renders options; "search" renders a datalist text input. */
  type: "select" | "search";
  options: FilterOption[];
  placeholder?: string;
}

/**
 * URL-driven filter rail. Every control reads and writes a query
 * parameter, so filter state is shareable, survives navigation to a
 * market detail page and back, and is rendered by the server. All
 * controls stay visible and wrap on small screens; Reset clears only the
 * parameters this panel owns.
 */
export function MarketFilterPanel({
  fields,
  resultCount,
  end,
}: {
  fields: FilterFieldConfig[];
  resultCount?: number;
  end?: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const baseId = useId();

  const apply = (param: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(param, value);
    } else {
      params.delete(param);
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  };

  const activeCount = fields.filter((f) =>
    searchParams.get(f.param),
  ).length;

  return (
    <div className="border-y border-rule bg-paper px-3 py-2.5">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div className="flex flex-wrap items-end gap-x-4 gap-y-3">
          {fields.map((field) => {
            const id = `${baseId}-${field.param}`;
            const current = searchParams.get(field.param) ?? "";
            if (field.type === "search") {
              const listId = `${id}-list`;
              return (
                <div key={field.param} className="flex flex-col gap-1">
                  <label htmlFor={id} className="wt-label text-ink-soft">
                    {field.label}
                  </label>
                  <input
                    id={id}
                    list={listId}
                    defaultValue={current}
                    key={current}
                    placeholder={field.placeholder ?? "type to search"}
                    className="h-8 w-40 border border-rule bg-paper px-2 font-mono text-xs text-ink placeholder:text-ink-soft"
                    onChange={(event) => {
                      const value = event.target.value;
                      if (
                        value === "" ||
                        field.options.some((o) => o.value === value)
                      ) {
                        apply(field.param, value);
                      }
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        apply(field.param, event.currentTarget.value);
                      }
                    }}
                    onBlur={(event) => {
                      if (event.target.value !== current) {
                        apply(field.param, event.target.value);
                      }
                    }}
                  />
                  <datalist id={listId}>
                    {field.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </datalist>
                </div>
              );
            }
            return (
              <div key={field.param} className="flex flex-col gap-1">
                <label htmlFor={id} className="wt-label text-ink-soft">
                  {field.label}
                </label>
                <select
                  id={id}
                  value={current}
                  onChange={(event) => apply(field.param, event.target.value)}
                  className="h-8 min-w-28 border border-rule bg-paper px-2 font-mono text-xs text-ink"
                >
                  <option value="">All</option>
                  {field.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
          {activeCount > 0 ? (
            <Link
              href={pathname}
              replace
              scroll={false}
              className="wt-label mb-2 text-wine underline decoration-rule underline-offset-2 hover:text-wine-deep"
            >
              Reset ({activeCount})
            </Link>
          ) : null}
        </div>
        <div className="flex items-center gap-3 pb-1">
          {typeof resultCount === "number" ? (
            <span className="wt-label text-ink-soft">
              {resultCount} series
            </span>
          ) : null}
          {end}
        </div>
      </div>
    </div>
  );
}
