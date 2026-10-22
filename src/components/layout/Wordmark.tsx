import Link from "next/link";

import { WORDMARK } from "@/components/layout/logoPaths";

/**
 * WineTerm logo wordmark.
 *
 * The traced logo drawn as inline SVG: the letters take the current text
 * colour, so one artwork serves light and dark surfaces, while the wine
 * drop keeps its own burgundy gradient and highlight.
 */
const SIZES = {
  md: "h-8",
  lg: "h-11",
} as const;

function LogoSvg({
  gradientId,
  className,
}: {
  gradientId: string;
  className: string;
}) {
  return (
    <svg
      viewBox={`0 0 ${WORDMARK.width} ${WORDMARK.height}`}
      className={`block w-auto shrink-0 ${className}`}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={gradientId} x1="0.1" y1="0.15" x2="0.95" y2="0.9">
          <stop offset={0} style={{ stopColor: "var(--wt-drop-light)" }} />
          <stop offset={0.55} style={{ stopColor: "var(--wt-drop)" }} />
          <stop offset={1} style={{ stopColor: "var(--wt-drop-deep)" }} />
        </linearGradient>
      </defs>
      <path fill="currentColor" d={WORDMARK.letters} />
      <path fill={`url(#${gradientId})`} d={WORDMARK.drop} />
      <path fill="var(--wt-paper)" fillOpacity={0.7} d={WORDMARK.highlight} />
    </svg>
  );
}

export function Wordmark({
  href = "/",
  size = "md",
}: {
  href?: string;
  size?: "md" | "lg";
}) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center no-underline"
      aria-label="WineTerm home"
    >
      <LogoSvg
        gradientId="wt-drop"
        className={`text-wine-deep ${SIZES[size]}`}
      />
    </Link>
  );
}

/** Inverted variant for dark surfaces such as the footer. */
export function WordmarkInverted({ size = "md" }: { size?: "md" | "lg" }) {
  return (
    <span className="inline-flex items-center" role="img" aria-label="WineTerm">
      <LogoSvg
        gradientId="wt-drop-inverted"
        className={`text-paper ${SIZES[size]}`}
      />
    </span>
  );
}
