import { movementDirection } from "@/lib/format";

/**
 * Direction glyph for price movement: SVG triangles for up and down, a
 * short dash for flat. Colour comes from the movement tokens only.
 */
export function TrendIndicator({ value }: { value: number }) {
  const direction = movementDirection(value);

  if (direction === "flat") {
    return (
      <svg
        aria-label="unchanged"
        viewBox="0 0 8 8"
        className="h-2 w-2 fill-ink-soft"
      >
        <rect x="0" y="3.25" width="8" height="1.5" />
      </svg>
    );
  }

  return (
    <svg
      aria-label={direction === "up" ? "rising" : "falling"}
      viewBox="0 0 8 8"
      className={`h-2 w-2 ${direction === "up" ? "fill-up" : "fill-down"}`}
    >
      {direction === "up" ? (
        <path d="M4 0.5 7.5 7.5H0.5Z" />
      ) : (
        <path d="M4 7.5 0.5 0.5H7.5Z" />
      )}
    </svg>
  );
}
