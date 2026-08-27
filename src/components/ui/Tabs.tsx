"use client";

import { useId, useState, type ReactNode } from "react";

export interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
}

/** Underline tabs for switching views within one data panel. */
export function Tabs({
  items,
  initialId,
}: {
  items: TabItem[];
  initialId?: string;
}) {
  const [activeId, setActiveId] = useState(initialId ?? items[0]?.id);
  const baseId = useId();
  const active = items.find((item) => item.id === activeId) ?? items[0];

  return (
    <div>
      <div
        role="tablist"
        className="flex items-center gap-1 border-b border-rule"
      >
        {items.map((item) => {
          const selected = item.id === active?.id;
          return (
            <button
              key={item.id}
              role="tab"
              type="button"
              id={`${baseId}-tab-${item.id}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${item.id}`}
              onClick={() => setActiveId(item.id)}
              className={`-mb-px border-b-2 px-3 py-2 text-sm ${
                selected
                  ? "border-wine font-medium text-wine-deep"
                  : "border-transparent text-ink-soft hover:text-ink"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {active ? (
        <div
          role="tabpanel"
          id={`${baseId}-panel-${active.id}`}
          aria-labelledby={`${baseId}-tab-${active.id}`}
          className="pt-4"
        >
          {active.content}
        </div>
      ) : null}
    </div>
  );
}
