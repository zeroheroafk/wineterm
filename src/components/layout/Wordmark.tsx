import Link from "next/link";

/**
 * Typographic WineTerm wordmark.
 *
 * The publication name in the editorial serif leads; a small burgundy
 * setting block carrying the monospace "WT" ticker sits before it as a
 * secondary mark. Deliberately built from type only.
 */
const SIZES = {
  md: {
    name: "text-[1.75rem] leading-none",
    block: "h-[1.3rem] w-[1.3rem] text-[0.6rem]",
  },
  lg: {
    name: "text-[2.25rem] leading-none",
    block: "h-7 w-7 text-[0.8rem]",
  },
} as const;

export function Wordmark({
  href = "/",
  size = "md",
}: {
  href?: string;
  size?: "md" | "lg";
}) {
  const sizes = SIZES[size];

  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-2 no-underline"
      aria-label="WineTerm home"
    >
      <span
        aria-hidden="true"
        className={`flex shrink-0 items-center justify-center bg-wine font-mono font-medium tracking-tight text-paper ${sizes.block}`}
      >
        WT
      </span>
      <span className={`wt-headline font-semibold text-ink ${sizes.name}`}>
        Wine<span className="font-normal italic text-wine">Term</span>
      </span>
    </Link>
  );
}

/** Inverted variant for dark surfaces such as the footer. */
export function WordmarkInverted({ size = "md" }: { size?: "md" | "lg" }) {
  const sizes = SIZES[size];

  return (
    <span className="inline-flex items-center gap-2">
      <span
        aria-hidden="true"
        className={`flex shrink-0 items-center justify-center bg-paper font-mono font-medium tracking-tight text-wine-deep ${sizes.block}`}
      >
        WT
      </span>
      <span className={`wt-headline font-semibold text-paper ${sizes.name}`}>
        Wine<span className="font-normal italic text-wine-wash">Term</span>
      </span>
    </span>
  );
}
