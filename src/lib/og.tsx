import type { ReactNode } from "react";

/**
 * Shared frame for the generated Open Graph images: the WineTerm
 * wordmark on the paper surface, the page's own content beneath, a
 * burgundy rule at the foot. Only flexbox and plain CSS: the images are
 * rendered by Satori, not a browser.
 */

export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = "image/png";

/** The design tokens of globals.css, which Satori cannot read. */
export const OG_COLOURS = {
  ground: "#f6f2eb",
  paper: "#fcfaf5",
  ink: "#1d1a18",
  inkSoft: "#625c55",
  wine: "#6b2737",
  rule: "#d6cfc5",
  up: "#3f6b4b",
  down: "#a8443a",
  ochreDeep: "#77592c",
} as const;

type OgFont = {
  name: string;
  data: ArrayBuffer;
  weight: 400 | 600;
  style: "normal" | "italic";
};

/**
 * The editorial serif, fetched from Google Fonts as TrueType at build
 * time, as next/font does for the pages. Without network access the
 * image falls back to Satori's bundled sans, so a build never fails on
 * a font.
 */
async function loadFont(
  family: string,
  weight: OgFont["weight"],
  style: OgFont["style"],
): Promise<OgFont | null> {
  const query = `family=${encodeURIComponent(family)}:ital,wght@${style === "italic" ? 1 : 0},${weight}`;
  try {
    const css = await fetch(`https://fonts.googleapis.com/css2?${query}`, {
      // An old user agent makes Google Fonts answer with TrueType URLs.
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:30.0)" },
    }).then((response) => (response.ok ? response.text() : ""));
    const url = css.match(/src: url\(([^)]+)\) format\('(?:truetype|opentype)'\)/)?.[1];
    if (!url) return null;
    const data = await fetch(url).then((response) =>
      response.ok ? response.arrayBuffer() : null,
    );
    return data ? { name: family, data, weight, style } : null;
  } catch {
    return null;
  }
}

/** The fonts the frame uses, those that could be fetched. */
export async function ogFonts(): Promise<OgFont[]> {
  const fonts = await Promise.all([
    loadFont("Newsreader", 600, "normal"),
    loadFont("Newsreader", 400, "italic"),
    loadFont("Archivo", 400, "normal"),
  ]);
  return fonts.filter((font): font is OgFont => font !== null);
}

const SERIF = "Newsreader, Georgia, serif";
const SANS = "Archivo, Helvetica, Arial, sans-serif";

export function OgFrame({
  kicker,
  children,
}: {
  /** Section line above the content, e.g. "Markets · ES-NAT-RED-NGI". */
  kicker?: string;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: OG_COLOURS.ground,
        color: OG_COLOURS.ink,
        padding: "56px 64px",
        fontFamily: SANS,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 44,
            height: 44,
            backgroundColor: OG_COLOURS.wine,
            color: OG_COLOURS.paper,
            fontSize: 20,
            fontWeight: 600,
            letterSpacing: -1,
          }}
        >
          WT
        </div>
        <div style={{ display: "flex", fontFamily: SERIF, fontSize: 52, lineHeight: 1 }}>
          <span style={{ fontWeight: 600 }}>Wine</span>
          <span style={{ fontStyle: "italic", color: OG_COLOURS.wine }}>Term</span>
        </div>
        {kicker ? (
          <div
            style={{
              marginLeft: "auto",
              fontSize: 22,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: OG_COLOURS.inkSoft,
            }}
          >
            {kicker}
          </div>
        ) : null}
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          justifyContent: "center",
          fontFamily: SERIF,
        }}
      >
        {children}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          borderTop: `4px solid ${OG_COLOURS.wine}`,
          paddingTop: 18,
          fontSize: 22,
          color: OG_COLOURS.inkSoft,
        }}
      >
        <span>Market intelligence for the wine industry</span>
        <span>wineterm</span>
      </div>
    </div>
  );
}

export { SANS as OG_SANS, SERIF as OG_SERIF };
