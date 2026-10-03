/**
 * The Weekly Briefing, written from the data. Each edition is dated a
 * Friday and reads the real bulk wine series as they stood on that day:
 * the latest observation of each, its change on the previous one and on
 * a year earlier. Weekly series quoted in the week make the national and
 * regional sections; monthly series whose latest month was published in
 * the week make the monthly section. The headline and the summary are
 * composed from those figures, so an edition says exactly what the
 * tables say, no more. Without real series there is no edition, and the
 * pages fall back to the illustrative samples.
 */

import { cache } from "react";

import { formatPercent, formatPrice } from "@/lib/format";
import {
  cadenceOf,
  loadCatalogue,
  type CatalogueEntry,
} from "@/services/markets/service";
import { getSource } from "@/services/markets/sources";
import {
  NATIONAL_AVERAGE,
  type MarketSeries,
  type SeriesObservation,
} from "@/services/markets/types";
import {
  COUNTRY_NAMES,
  type DataSource,
  type WineColour,
} from "@/services/types";

import type {
  BriefingPrice,
  RegionalRoundup,
  WeeklyBriefing,
} from "@/services/briefing/types";

const DAY_MS = 86400000;

/** How many Fridays back the archive lists. */
export const ARCHIVE_EDITIONS = 8;

/** A weekly price counts as this week's when observed within these days. */
const WEEKLY_WINDOW_DAYS = 10;

/** The most recent Friday on or before a date, as an ISO date. */
export function fridayOnOrBefore(iso: string): string {
  const date = new Date(`${iso}T00:00:00Z`);
  const back = (date.getUTCDay() - 5 + 7) % 7;
  date.setUTCDate(date.getUTCDate() - back);
  return date.toISOString().slice(0, 10);
}

/** `count` Fridays, the given one first, then each a week earlier. */
export function editionDates(friday: string, count: number): string[] {
  const dates: string[] = [];
  for (let i = 0; i < count; i++) {
    dates.push(
      new Date(Date.parse(`${friday}T00:00:00Z`) - i * 7 * DAY_MS)
        .toISOString()
        .slice(0, 10),
    );
  }
  return dates;
}

function daysBetween(fromIso: string, toIso: string): number {
  return (Date.parse(`${toIso}T00:00:00Z`) - Date.parse(`${fromIso}T00:00:00Z`)) / DAY_MS;
}

function percent(current: number, previous: number): number {
  return (current / previous - 1) * 100;
}

const COLOUR: Record<WineColour, string> = { red: "red", white: "white", rose: "rosé" };

/**
 * "Spain red", "Albacete red", "Languedoc-Roussillon red without GI",
 * "France bulk" for a national price that spans every colour.
 */
function priceName(series: MarketSeries): string {
  const national = series.region === NATIONAL_AVERAGE;
  const market = national
    ? COUNTRY_NAMES[series.country]
    : (series.appellation ?? series.region);
  const colour = series.colour ? COLOUR[series.colour] : national ? "bulk" : null;
  const classification =
    series.classification === "pgi"
      ? "PGI"
      : series.classification === "no-gi" && !national
        ? "without GI"
        : null;
  return [market, colour, classification].filter(Boolean).join(" ");
}

function sourceOf(series: MarketSeries): DataSource {
  const source = getSource(series.sourceId);
  return { name: source.name, url: source.url };
}

/** The observation nearest a year before `latest`, within three weeks. */
function yearEarlier(
  history: SeriesObservation[],
  latest: SeriesObservation,
): SeriesObservation | null {
  let best: SeriesObservation | null = null;
  let bestDistance = Infinity;
  for (const obs of history) {
    const distance = Math.abs(daysBetween(obs.date, latest.date) - 365);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = obs;
    }
  }
  return bestDistance <= 21 ? best : null;
}

/** A series' price as it stood on the edition date, or null before its first. */
function priceAt(
  { series, history }: CatalogueEntry,
  editionDate: string,
): BriefingPrice | null {
  const known = history.filter((obs) => obs.date <= editionDate);
  const latest = known[known.length - 1];
  if (!latest) return null;
  const previous = known[known.length - 2];
  const yoy = yearEarlier(known, latest);
  return {
    code: series.code,
    name: priceName(series),
    country: series.country,
    value: latest.value,
    unit: series.unit,
    changePercent: previous ? percent(latest.value, previous.value) : null,
    yoyPercent: yoy ? percent(latest.value, yoy.value) : null,
    date: latest.date,
    source: sourceOf(series),
  };
}

function signedPercent(value: number | null): string {
  return value === null ? "n/a" : formatPercent(value);
}

/** "+3.4% on the week and +10.5% on a year earlier" */
function describeChanges(price: BriefingPrice, horizon: string): string {
  const parts: string[] = [];
  if (price.changePercent !== null) {
    parts.push(`${signedPercent(price.changePercent)} on ${horizon}`);
  }
  if (price.yoyPercent !== null) {
    parts.push(`${signedPercent(price.yoyPercent)} on a year earlier`);
  }
  return parts.join(" and ");
}

function direction(value: number | null): "up" | "down" | "flat" {
  if (value === null || Math.abs(value) < 0.05) return "flat";
  return value > 0 ? "up" : "down";
}

/** The headline, from the national averages' weekly moves. */
export function composeHeadline(national: BriefingPrice[], weekEnding: string): string {
  if (national.length === 0) {
    return `Bulk wine prices, week to ${formatDay(weekEnding)}`;
  }
  const country = COUNTRY_NAMES[national[0].country];
  const moves = national.map((price) => direction(price.changePercent));
  const detail = national
    .map((price) => `${colourOf(price)} ${signedPercent(price.changePercent)}`)
    .join(", ");
  const verb = moves.every((move) => move === "up")
    ? "firm"
    : moves.every((move) => move === "down")
      ? "ease"
      : moves.every((move) => move === "flat")
        ? "hold"
        : "diverge";
  return `${country === "Spain" ? "Spanish" : country} bulk prices ${verb}: ${detail}`;
}

/** The colour word of a national price, read from its name. */
function colourOf(price: BriefingPrice): string {
  return price.name.split(" ").slice(1).join(" ") || price.name;
}

/** "20 September" */
function formatDay(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00Z`));
}

/** The summary paragraph: national averages, regional roundup, monthly prices. */
export function composeSummary(
  national: BriefingPrice[],
  regional: RegionalRoundup,
  monthly: BriefingPrice[],
  weekEnding: string,
): string {
  const sentences: string[] = [];

  if (national.length > 0) {
    const country = COUNTRY_NAMES[national[0].country];
    const clauses = national.map((price, index) => {
      const changes = describeChanges(price, "the week");
      const lead =
        index === 0
          ? `${capitalise(colourOf(price))} wine without PDO/PGI averaged ${formatPrice(price.value)} ${price.unit} ex-winery in ${country} in the week to ${formatDay(weekEnding)}`
          : `${colourOf(price)} ${formatPrice(price.value)} ${price.unit}`;
      return changes ? `${lead}, ${changes}` : lead;
    });
    sentences.push(`${clauses.join("; ")}.`);
  }

  if (regional.quoted + regional.unquoted > 0) {
    const total = regional.quoted + regional.unquoted;
    const parts = [
      regional.rose ? `${regional.rose} rose` : null,
      regional.fell ? `${regional.fell} fell` : null,
      regional.unchanged ? `${regional.unchanged} ${regional.unchanged === 1 ? "was" : "were"} unchanged` : null,
    ].filter(Boolean);
    let sentence = `Of the ${total} regional markets, ${regional.quoted} ${regional.quoted === 1 ? "was" : "were"} quoted`;
    if (parts.length > 0) sentence += `: ${parts.join(", ")}`;
    sentence += ".";
    const lead = regional.risers[0];
    const lag = regional.fallers[0];
    if (lead) {
      sentence += ` ${lead.name} led the rises at ${signedPercent(lead.changePercent)}`;
      sentence += lag ? `; ${lag.name} fell most, ${signedPercent(lag.changePercent)}.` : ".";
    } else if (lag) {
      sentence += ` ${lag.name} fell most, ${signedPercent(lag.changePercent)}.`;
    }
    sentences.push(sentence);
  }

  if (monthly.length > 0) {
    const items = monthly
      .slice(0, 4)
      .map(
        (price) =>
          `${price.name} ${formatPrice(price.value)} ${price.unit} for ${price.period}${price.changePercent !== null ? ` (${signedPercent(price.changePercent)} on the month)` : ""}`,
      );
    sentences.push(
      `New monthly prices this week: ${items.join("; ")}${monthly.length > 4 ? `, and ${monthly.length - 4} more` : ""}.`,
    );
  }

  return sentences.join(" ");
}

function capitalise(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** The edition for one Friday, or null when no real series has a price by then. */
export function buildBriefing(
  entries: CatalogueEntry[],
  editionDate: string,
): WeeklyBriefing | null {
  const real = entries.filter(
    (entry) =>
      entry.series.kind === "bulk-wine" &&
      entry.history.length > 0 &&
      entry.history[entry.history.length - 1].status !== "illustrative",
  );

  const national: BriefingPrice[] = [];
  const regionalQuoted: BriefingPrice[] = [];
  let regionalUnquoted = 0;
  const monthly: BriefingPrice[] = [];
  let weekEnding = "";
  /** The last week any weekly series covers, for a week with no quote. */
  let latestWeekly = "";

  for (const entry of real) {
    const price = priceAt(entry, editionDate);
    if (!price) continue;
    // Over the whole history: a weekly market that went unquoted for
    // some weeks lately is still a weekly market.
    const cadence = cadenceOf(
      entry.history.filter((obs) => obs.date <= editionDate),
      Infinity,
    );
    if (cadence === "monthly") {
      // Published during the edition's week: the week before the Friday
      // inclusive.
      const published = entry.history
        .filter((obs) => obs.date === price.date)
        .map((obs) => obs.publishedAt.slice(0, 10))
        .sort()[0];
      if (published && daysBetween(published, editionDate) >= 0 && daysBetween(published, editionDate) < 7) {
        monthly.push({ ...price, period: formatMonthLong(price.date) });
      }
      continue;
    }
    const thisWeek = daysBetween(price.date, editionDate) < WEEKLY_WINDOW_DAYS;
    if (price.date > latestWeekly) latestWeekly = price.date;
    if (entry.series.region === NATIONAL_AVERAGE) {
      if (thisWeek) {
        national.push(price);
        if (price.date > weekEnding) weekEnding = price.date;
      }
    } else if (thisWeek) {
      regionalQuoted.push(price);
      if (price.date > weekEnding) weekEnding = price.date;
    } else {
      regionalUnquoted += 1;
    }
  }

  if (national.length === 0 && regionalQuoted.length === 0 && monthly.length === 0) {
    return null;
  }
  if (!weekEnding) weekEnding = latestWeekly || editionDate;

  // White before red, as the sources list them.
  national.sort((a, b) => a.name.localeCompare(b.name) * -1);

  const moved = regionalQuoted.filter((price) => price.changePercent !== null);
  const regional: RegionalRoundup = {
    quoted: regionalQuoted.length,
    unquoted: regionalUnquoted,
    rose: moved.filter((price) => direction(price.changePercent) === "up").length,
    fell: moved.filter((price) => direction(price.changePercent) === "down").length,
    unchanged: moved.filter((price) => direction(price.changePercent) === "flat").length,
    risers: moved
      .filter((price) => direction(price.changePercent) === "up")
      .sort((a, b) => b.changePercent! - a.changePercent!)
      .slice(0, 3),
    fallers: moved
      .filter((price) => direction(price.changePercent) === "down")
      .sort((a, b) => a.changePercent! - b.changePercent!)
      .slice(0, 3),
  };

  monthly.sort((a, b) => a.name.localeCompare(b.name));

  const sources = [
    ...new Map(
      [...national, ...regionalQuoted, ...monthly].map((price) => [
        price.source.name,
        price.source,
      ]),
    ).values(),
  ];

  return {
    id: `wb-${editionDate}`,
    date: editionDate,
    weekEnding,
    headline: composeHeadline(national, weekEnding),
    summary: composeSummary(national, regional, monthly, weekEnding),
    national,
    regional,
    monthly,
    sources,
    isCurrent: false,
  };
}

/** "July 2026" from an ISO date in that month. */
function formatMonthLong(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso.slice(0, 7)}-01T00:00:00Z`));
}

/**
 * The editions of the archive, newest first, the first marked current.
 * Empty when no real series is connected.
 */
export function buildEditions(
  entries: CatalogueEntry[],
  today: string,
  count = ARCHIVE_EDITIONS,
): WeeklyBriefing[] {
  const editions = editionDates(fridayOnOrBefore(today), count)
    .map((date) => buildBriefing(entries, date))
    .filter((edition): edition is WeeklyBriefing => edition !== null);
  if (editions[0]) editions[0].isCurrent = true;
  return editions;
}

export interface BriefingService {
  /** Newest first; empty without real series. */
  getEditions(): Promise<WeeklyBriefing[]>;
  getCurrentEdition(): Promise<WeeklyBriefing | null>;
}

const loadEditions = cache(async (): Promise<WeeklyBriefing[]> =>
  buildEditions(await loadCatalogue(), new Date().toISOString().slice(0, 10)),
);

class LiveBriefingService implements BriefingService {
  async getEditions(): Promise<WeeklyBriefing[]> {
    return loadEditions();
  }

  async getCurrentEdition(): Promise<WeeklyBriefing | null> {
    return (await loadEditions())[0] ?? null;
  }
}

let service: BriefingService | null = null;

export function getBriefingService(): BriefingService {
  service ??= new LiveBriefingService();
  return service;
}
