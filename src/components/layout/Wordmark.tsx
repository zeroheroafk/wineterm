import Link from "next/link";

/** Contour wine-glass emblem and spaced publication wordmark. */
function Emblem() {
  return (
    <svg aria-hidden="true" viewBox="0 0 42 58" className="h-14 w-10 shrink-0 fill-none stroke-current" strokeWidth=".8">
      {[0, 1, 2, 3].map((ring) => (
        <path key={ring} transform={`translate(${ring * 1.5} ${ring * 1.8}) scale(${1 - ring * .07})`}
          d="M11 4C6 12 4 21 6 29C8 36 14 40 21 40C28 40 34 36 36 29C38 21 36 12 31 4Z M21 40V51 M12 54Q21 49 30 54" />
      ))}
      <path d="M11 23Q21 28 31 23" />
    </svg>
  );
}

export function Wordmark({ href = "/", size = "md" }: { href?: string; size?: "md" | "lg" }) {
  return (
    <Link href={href} aria-label="WineTerm home" className="inline-flex shrink-0 items-center gap-2 text-wine-deep">
      <Emblem />
      <span className={`font-serif font-semibold uppercase tracking-[.12em] ${size === "lg" ? "text-3xl" : "text-[1.4rem]"}`}>WineTerm</span>
    </Link>
  );
}

export function WordmarkInverted({ size = "md" }: { size?: "md" | "lg" }) {
  return (
    <span className="inline-flex items-center gap-2 text-wine-wash">
      <Emblem />
      <span className={`font-serif font-semibold uppercase tracking-[.12em] ${size === "lg" ? "text-3xl" : "text-[1.4rem]"}`}>WineTerm</span>
    </span>
  );
}
