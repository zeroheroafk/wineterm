import type { ReactNode } from "react";

import {
  MARKET_EFFECT_LABELS,
  type MarketEffect,
  type OutlookKeyPoint,
  type RiskFactor,
} from "@/services/outlook/types";

const EFFECT_STYLES: Record<MarketEffect, string> = {
  supportive: "border-up text-up",
  neutral: "border-rule text-ink-soft",
  pressuring: "border-down text-down",
};

/** Directional market-effect tag; words, not gauges. */
export function EffectTag({ effect }: { effect: MarketEffect }) {
  return (
    <span
      className={`wt-label inline-flex items-center border px-1.5 py-0.5 whitespace-nowrap ${EFFECT_STYLES[effect]}`}
    >
      {MARKET_EFFECT_LABELS[effect]}
    </span>
  );
}

/**
 * Numbered section of the Market Outlook: research-publication rhythm,
 * with a mono section number, serif title and anchor for the contents
 * list.
 */
export function OutlookSection({
  number,
  id,
  title,
  children,
}: {
  number: number;
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="mt-12 scroll-mt-6">
      <header className="border-t-2 border-ink">
        <div className="flex items-baseline gap-3 border-t border-rule pt-3">
          <span className="tnum font-mono text-sm text-wine">
            {String(number).padStart(2, "0")}
          </span>
          <h2 className="wt-headline text-2xl font-semibold text-ink">
            {title}
          </h2>
        </div>
      </header>
      <div className="mt-4">{children}</div>
    </section>
  );
}

/** Body paragraphs in the publication measure. */
export function OutlookProse({ paragraphs }: { paragraphs: string[] }) {
  return (
    <div className="max-w-2xl space-y-3">
      {paragraphs.map((paragraph, index) => (
        <p key={index} className="text-[0.95rem] leading-relaxed text-ink">
          {paragraph}
        </p>
      ))}
    </div>
  );
}

export function KeyPointsList({ points }: { points: OutlookKeyPoint[] }) {
  return (
    <ul className="divide-y divide-rule border-y border-rule">
      {points.map((point) => (
        <li
          key={point.id}
          className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1.5 py-2.5"
        >
          <span className="min-w-56 flex-1 text-sm leading-snug font-medium text-ink">
            {point.text}
          </span>
          <EffectTag effect={point.effect} />
        </li>
      ))}
    </ul>
  );
}

const LIKELIHOOD_LABELS = { low: "Low", medium: "Medium", high: "High" } as const;

/** Structured risk register: title, detail, horizon, likelihood, effect. */
export function RiskList({ risks }: { risks: RiskFactor[] }) {
  return (
    <ol className="border border-rule bg-paper">
      {risks.map((risk, index) => (
        <li
          key={risk.id}
          className="grid grid-cols-1 gap-x-6 gap-y-2 border-b border-rule px-4 py-3.5 last:border-b-0 md:grid-cols-[minmax(0,1fr)_13.5rem]"
        >
          <div>
            <p className="flex items-baseline gap-2.5">
              <span className="tnum font-mono text-xs text-wine">
                R{index + 1}
              </span>
              <span className="text-sm font-semibold text-ink">
                {risk.title}
              </span>
            </p>
            <p className="mt-1 pl-6 text-sm leading-relaxed text-ink-soft">
              {risk.detail}
            </p>
          </div>
          <dl className="flex flex-wrap items-start gap-x-5 gap-y-1.5 pl-6 md:flex-col md:pl-0">
            <div className="flex items-baseline gap-2">
              <dt className="wt-label text-ink-soft">Horizon</dt>
              <dd className="wt-label text-ink">{risk.horizon}</dd>
            </div>
            <div className="flex items-baseline gap-2">
              <dt className="wt-label text-ink-soft">Likelihood</dt>
              <dd className="wt-label text-ink">
                {LIKELIHOOD_LABELS[risk.likelihood]}
              </dd>
            </div>
            <div className="flex items-baseline gap-2">
              <dt className="sr-only">Market effect</dt>
              <dd>
                <EffectTag effect={risk.effect} />
              </dd>
            </div>
          </dl>
        </li>
      ))}
    </ol>
  );
}
