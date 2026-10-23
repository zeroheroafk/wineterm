import type { ArticleHero } from "@/services/types";

/**
 * The credit a photograph's licence asks for: the author linked to the
 * page the picture is published on, the licence linked to its terms and
 * what was changed from the original. Set inside the caller's caption,
 * on the light surfaces or, with `onDark`, over a darkened photograph.
 */
export function PhotoCredit({
  hero,
  changes = hero.changes,
  onDark = false,
}: {
  hero: ArticleHero;
  /** What was changed, when the page changes more than the file does. */
  changes?: string;
  onDark?: boolean;
}) {
  const linkClassName = onDark
    ? "underline decoration-paper/40 underline-offset-2 hover:text-paper"
    : "underline decoration-rule underline-offset-2 hover:text-wine";
  return (
    <>
      Photo:{" "}
      <a href={hero.sourceUrl} className={linkClassName}>
        {hero.author}
      </a>
      ,{" "}
      <a href={hero.licence.url} className={linkClassName}>
        {hero.licence.name}
      </a>
      {changes ? `, ${changes}` : null}
    </>
  );
}
