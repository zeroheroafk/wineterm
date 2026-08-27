"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { MAX_COMPARE_SERIES } from "@/services/markets/types";

export interface CompareOption {
  code: string;
  label: string;
  kind: string;
  unitFamily: string;
  unit: string;
  currency: string;
}

/**
 * Series picker for the comparison page. Selection lives in the ?s=
 * query parameter. After the first pick, only series of the same kind,
 * unit family and currency remain selectable, so invalid comparisons
 * (grapes against wine, volume against mass, mixed currencies) cannot be
 * built from the interface.
 */
export function ComparePicker({
  options,
  selected,
}: {
  options: CompareOption[];
  selected: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const update = (codes: string[]) => {
    const params = new URLSearchParams(searchParams.toString());
    if (codes.length > 0) {
      params.set("s", codes.join(","));
    } else {
      params.delete("s");
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  };

  const first = options.find((o) => o.code === selected[0]);
  const addable = options.filter((option) => {
    if (selected.includes(option.code)) return false;
    if (!first) return true;
    return (
      option.kind === first.kind &&
      option.unitFamily === first.unitFamily &&
      option.currency === first.currency
    );
  });

  return (
    <div className="border-y border-rule bg-paper px-3 py-2.5">
      <div className="flex flex-wrap items-center gap-2">
        {selected.map((code) => {
          const option = options.find((o) => o.code === code);
          return (
            <span
              key={code}
              className="flex items-center border border-rule bg-ground"
            >
              <span className="wt-label px-2 py-1.5 text-ink">
                {option?.label ?? code}
              </span>
              <button
                type="button"
                aria-label={`Remove ${option?.label ?? code}`}
                onClick={() => update(selected.filter((c) => c !== code))}
                className="border-l border-rule px-2 py-1.5 text-ink-soft hover:text-down"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 8 8"
                  className="h-2 w-2 stroke-current"
                  strokeWidth={1.4}
                >
                  <path d="M1 1l6 6M7 1L1 7" fill="none" />
                </svg>
              </button>
            </span>
          );
        })}

        {selected.length < MAX_COMPARE_SERIES ? (
          <div className="flex flex-col gap-1">
            <label htmlFor="compare-add" className="sr-only">
              Add series to comparison
            </label>
            <select
              id="compare-add"
              value=""
              onChange={(event) => {
                if (event.target.value) {
                  update([...selected, event.target.value]);
                }
              }}
              className="h-8 w-72 max-w-full border border-rule bg-paper px-2 font-mono text-xs text-ink"
            >
              <option value="">
                {selected.length === 0
                  ? "Add a series to compare"
                  : "Add a compatible series"}
              </option>
              {addable.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.label} ({option.unit})
                </option>
              ))}
            </select>
          </div>
        ) : (
          <span className="wt-label text-ink-soft">
            Maximum of {MAX_COMPARE_SERIES} series
          </span>
        )}

        {selected.length > 0 ? (
          <button
            type="button"
            onClick={() => update([])}
            className="wt-label ml-auto text-wine underline decoration-rule underline-offset-2 hover:text-wine-deep"
          >
            Clear comparison
          </button>
        ) : null}
      </div>
      {first ? (
        <p className="wt-label mt-2 text-ink-soft">
          Comparing {first.kind === "bulk-wine" ? "bulk wine" : first.kind}{" "}
          series quoted in {first.currency}, {first.unitFamily} units only.
          Grape and wine prices are never mixed in one comparison.
        </p>
      ) : null}
    </div>
  );
}
