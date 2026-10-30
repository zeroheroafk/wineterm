/**
 * Rules for the briefing bar, the newsletter signup fixed to the foot of
 * the window (components/editorial/BriefingBar.tsx), kept apart from the
 * component so they run without a browser.
 */

/** localStorage key: when the reader last closed the bar, in epoch ms. */
export const BAR_DISMISSED_KEY = "wineterm_briefing_bar_dismissed";

/** localStorage key: set once one of the reader's signups is stored. */
export const BRIEFING_SUBSCRIBED_KEY = "wineterm_briefing_subscribed";

/** Days a closed bar stays away before it may ask again. */
export const DISMISS_DAYS = 30;

const DAY_MS = 86_400_000;

/**
 * Sections whose page is itself the signup, where the bar would only
 * repeat it. Whole segments: "/briefing" does not hide the bar on
 * "/insights/weekly-briefing".
 */
const HIDDEN_SECTIONS = ["/briefing"];

export function barHiddenOn(pathname: string): boolean {
  return HIDDEN_SECTIONS.some(
    (section) => pathname === section || pathname.startsWith(`${section}/`),
  );
}

/**
 * Whether the stored close time is within DISMISS_DAYS of now. Anything
 * that is not a time, such as a value from an older scheme, counts as
 * never closed.
 */
export function dismissedRecently(stored: string | null, now: number): boolean {
  if (!stored) return false;
  const closedAt = Number(stored);
  return Number.isFinite(closedAt) && now - closedAt < DISMISS_DAYS * DAY_MS;
}
