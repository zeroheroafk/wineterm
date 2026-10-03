import { ImageResponse } from "next/og";

import { formatDate, formatPercent, formatPrice } from "@/lib/format";
import {
  OG_COLOURS,
  OG_CONTENT_TYPE,
  OG_SANS,
  OG_SIZE,
  OgFrame,
  ogFonts,
} from "@/lib/og";
import { getMarketsService } from "@/services/markets/service";
import { getSource } from "@/services/markets/sources";
import { COUNTRY_NAMES } from "@/services/types";

/**
 * A series page shared on social networks shows its latest price, the
 * move on a week earlier and the date, read from the same catalogue as
 * the page; a sample says so.
 */
export const alt = "WineTerm price series";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const row = await getMarketsService().getRow(code);
  const fonts = await ogFonts();

  if (!row) {
    return new ImageResponse(
      (
        <OgFrame kicker="Markets">
          <div style={{ display: "flex", fontSize: 64, fontWeight: 600 }}>
            Market not found
          </div>
        </OgFrame>
      ),
      { ...size, fonts },
    );
  }

  const { series, latest, changes } = row;
  const sample = latest.status === "illustrative";
  const change = changes.weekPercent;
  const changeColour =
    change === null || change === 0
      ? OG_COLOURS.inkSoft
      : change > 0
        ? OG_COLOURS.up
        : OG_COLOURS.down;

  return new ImageResponse(
    (
      <OgFrame kicker={`Markets · ${series.code}`}>
        <div
          style={{
            display: "flex",
            fontSize: 54,
            fontWeight: 600,
            lineHeight: 1.1,
            letterSpacing: -1,
            maxWidth: 1000,
          }}
        >
          {series.name}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 10,
            fontSize: 28,
            color: OG_COLOURS.inkSoft,
            fontFamily: OG_SANS,
          }}
        >
          {series.product} · {series.appellation ?? series.region},{" "}
          {COUNTRY_NAMES[series.country]}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 24,
            marginTop: 40,
            fontFamily: OG_SANS,
          }}
        >
          <span style={{ fontSize: 96, fontWeight: 600, letterSpacing: -2 }}>
            {formatPrice(latest.value)}
          </span>
          <span style={{ fontSize: 36, color: OG_COLOURS.inkSoft }}>{series.unit}</span>
          {change !== null ? (
            <span style={{ fontSize: 44, color: changeColour }}>
              {formatPercent(change)}
            </span>
          ) : null}
        </div>
        <div
          style={{
            display: "flex",
            gap: 28,
            marginTop: 8,
            fontSize: 24,
            color: sample ? OG_COLOURS.ochreDeep : OG_COLOURS.inkSoft,
            fontFamily: OG_SANS,
          }}
        >
          <span>{formatDate(latest.date)}</span>
          <span>
            {sample ? "Illustrative sample, not a market price" : getSource(series.sourceId).name}
          </span>
        </div>
      </OgFrame>
    ),
    { ...size, fonts },
  );
}
