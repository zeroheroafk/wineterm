import { ImageResponse } from "next/og";

import { OG_COLOURS, OG_CONTENT_TYPE, OG_SIZE, OgFrame, ogFonts } from "@/lib/og";

/** The image shown when any page without its own is shared. */
export const alt = "WineTerm: market intelligence for the wine industry";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return new ImageResponse(
    (
      <OgFrame>
        <div
          style={{
            display: "flex",
            fontSize: 72,
            fontWeight: 600,
            lineHeight: 1.08,
            letterSpacing: -1.5,
            maxWidth: 900,
          }}
        >
          Prices, supply and trade for the professional wine market.
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 30,
            color: OG_COLOURS.inkSoft,
            fontFamily: "Archivo, Helvetica, Arial, sans-serif",
          }}
        >
          Bulk wine prices · Stocks and production · Imports and exports
        </div>
      </OgFrame>
    ),
    { ...size, fonts: await ogFonts() },
  );
}
