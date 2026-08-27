import Link from "next/link";

/**
 * Typographic WineTerm wordmark.
 *
 * A burgundy setting block carrying the monospace "WT" ticker, followed by
 * the name in the editorial serif. Deliberately built from type only.
 */
export function Wordmark({
  href = "/",
  size = "md",
}: {
  href?: string;
  size?: "md" | "lg";
}) {
  const nameClass =
    size === "lg"
      ? "text-[2rem] leading-none"
      : "text-[1.45rem] leading-none";
  const blockClass =
    size === "lg" ? "h-9 w-9 text-base" : "h-7 w-7 text-[0.8rem]";

  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-2.5 no-underline"
      aria-label="WineTerm home"
    >
      <span
        aria-hidden="true"
        className={`flex items-center justify-center bg-wine font-mono font-medium tracking-tight text-paper ${blockClass}`}
      >
        WT
      </span>
      <span className={`wt-headline font-semibold text-ink ${nameClass}`}>
        Wine<span className="font-normal italic text-wine">Term</span>
      </span>
    </Link>
  );
}

/** Inverted variant for dark surfaces such as the footer. */
export function WordmarkInverted({ size = "md" }: { size?: "md" | "lg" }) {
  const nameClass =
    size === "lg" ? "text-[2rem] leading-none" : "text-[1.45rem] leading-none";
  const blockClass =
    size === "lg" ? "h-9 w-9 text-base" : "h-7 w-7 text-[0.8rem]";

  return (
    <span className="inline-flex items-center gap-2.5">
      <span
        aria-hidden="true"
        className={`flex items-center justify-center bg-paper font-mono font-medium tracking-tight text-wine-deep ${blockClass}`}
      >
        WT
      </span>
      <span className={`wt-headline font-semibold text-paper ${nameClass}`}>
        Wine<span className="font-normal italic text-wine-wash">Term</span>
      </span>
    </span>
  );
}
