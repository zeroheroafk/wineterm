/**
 * DRAAF Occitanie, Marché vrac des vins de la région Occitanie: the
 * regional office of the French Ministry of Agriculture publishes, on one
 * page it keeps up to date, the monthly average prices of the bulk wine
 * purchase contracts presented for visa to FranceAgriMer and the
 * interprofessions for wine produced in Occitanie, over the last three
 * campaigns. WineTerm reads its price tables: wine without GI and PGI
 * wine, red, rosé and white, for the departments of former
 * Languedoc-Roussillon and of former Midi-Pyrénées. No database access
 * here.
 */

export const SOURCE_ID = "draaf-occitanie";
export const PAGE =
  "https://draaf.occitanie.agriculture.gouv.fr/marche-vrac-des-vins-de-la-region-occitanie-donnees-actualisees-a345.html";
const TIMEOUT_MS = 60_000;

/**
 * Bounds of a plausible price in EUR/hl. A value outside them means the
 * page changed shape, not that the market moved.
 */
const MIN_PRICE = 5;
const MAX_PRICE = 500;

export interface Observation {
  series_code: string;
  /** Last day of the price's month, e.g. "2026-07-31". */
  observed_on: string;
  /** EUR/hl, as published. */
  value: number;
}

/** Series codes by the words of their table's caption. */
const BASINS: Record<string, string> = { LR: "LR", MP: "MP" };
const CATEGORIES: Record<string, string> = { "VIN SANS IG": "NGI", IGP: "PGI" };
const COLOURS: Record<string, string> = { ROUGE: "RED", ROSE: "ROS", BLANC: "WHT" };

/** Series codes, e.g. FR-LR-RED-PGI; the migration creates each one. */
export const SERIES_CODES = Object.values(BASINS).flatMap((basin) =>
  Object.values(CATEGORIES).flatMap((category) =>
    Object.values(COLOURS).map((colour) => `FR-${basin}-${colour}-${category}`)
  )
);

/** Month of each row, by the start of its label: "août", "sept.", "déc."… */
const MONTHS: [string, number][] = [
  ["aou", 8],
  ["sep", 9],
  ["oct", 10],
  ["nov", 11],
  ["dec", 12],
  ["jan", 1],
  ["fev", 2],
  ["feb", 2],
  ["mar", 3],
  ["avr", 4],
  ["mai", 5],
  ["juin", 6],
  ["juil", 7],
];

const ENTITIES: Record<string, string> = {
  amp: "&",
  nbsp: " ",
  agrave: "à",
  eacute: "é",
  Eacute: "É",
  egrave: "è",
  ecirc: "ê",
  ucirc: "û",
  ocirc: "ô",
  rsquo: "’",
};

/** A cell's text: tags removed, entities decoded, spaces collapsed. */
function text(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, decimal) => String.fromCodePoint(Number(decimal)))
    .replace(/&([a-z]+);/gi, (entity, name) => ENTITIES[name] ?? entity)
    .replace(/\s+/g, " ")
    .trim();
}

/** Text without accents, for matching: "ROSÉ" reads "ROSE". */
function plain(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function monthOf(label: string): number | null {
  const key = plain(label).toLowerCase().replace(/\./g, "").trim();
  return MONTHS.find(([prefix]) => key.startsWith(prefix))?.[1] ?? null;
}

function monthEnd(year: number, month: number): string {
  return new Date(Date.UTC(year, month, 0)).toISOString().slice(0, 10);
}

/**
 * A price cell: "69,54"; null for an empty or withheld one ("ss", "-"),
 * or a zero, which no month trades at and may stand for one not yet over.
 */
function price(cell: string): number | null {
  if (cell === "" || /^(-|ss|ns|nd|0+(,0+)?)$/i.test(cell)) return null;
  if (!/^\d+(,\d+)?$/.test(cell)) throw new Error(`A price cell reads "${cell}"`);
  return Number(cell.replace(",", "."));
}

export interface PagePrices {
  observations: Observation[];
  /** The date the page says it was published, e.g. "2026-10-01". */
  publishedOn: string | null;
}

/** The series code a table's caption names, or null for another table. */
function seriesOf(caption: string): string | null {
  const match = plain(caption).toUpperCase().match(
    /^COURBES PRIX (VIN SANS IG|IGP) - (ROUGE|ROSE|BLANC) - DEPARTEMENT DE PRODUCTION EX (LR|MP)$/,
  );
  if (!match) return null;
  return `FR-${BASINS[match[3]]}-${COLOURS[match[2]]}-${CATEGORIES[match[1]]}`;
}

/**
 * The monthly prices of every series on the page. Each table heads one
 * column per campaign ("2025/2026") and one row per month from August; a
 * month not yet published is empty.
 */
export function pagePrices(html: string): PagePrices {
  const observations: Observation[] = [];
  const found = new Set<string>();
  for (const [table] of html.matchAll(/<table\b[^>]*>[\s\S]*?<\/table>/gi)) {
    const caption = table.match(/<caption[^>]*>([\s\S]*?)<\/caption>/i);
    const code = caption ? seriesOf(text(caption[1])) : null;
    if (!code) continue;
    if (found.has(code)) throw new Error(`Two price tables for ${code}`);
    found.add(code);

    const rows = [...table.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)].map(([, row]) =>
      [...row.matchAll(/<t([hd])\b[^>]*>([\s\S]*?)<\/t\1>/gi)].map(([, , cell]) => text(cell))
    );
    const [header, ...body] = rows;
    const campaigns = (header ?? []).slice(1).map((heading) => {
      const match = heading.match(/^(\d{4})\s*\/\s*(\d{4})$/);
      if (!match || Number(match[2]) !== Number(match[1]) + 1) {
        throw new Error(`The ${code} table heads a column "${heading}", not a campaign`);
      }
      return Number(match[1]);
    });
    if (campaigns.length === 0) throw new Error(`The ${code} table heads no campaign`);

    const months = new Set<number>();
    for (const [label, ...cells] of body) {
      const month = monthOf(label ?? "");
      if (!month) throw new Error(`The ${code} table has a row "${label}", not a month`);
      if (months.has(month)) throw new Error(`The ${code} table has two rows for "${label}"`);
      months.add(month);
      if (cells.length !== campaigns.length) {
        throw new Error(`The ${code} row "${label}" has ${cells.length} cells for ${campaigns.length} campaigns`);
      }
      cells.forEach((cell, index) => {
        const value = price(cell);
        if (value === null) return;
        const year = month >= 8 ? campaigns[index] : campaigns[index] + 1;
        const observed_on = monthEnd(year, month);
        if (value < MIN_PRICE || value > MAX_PRICE) {
          throw new Error(`${code} reads ${value} EUR/hl for ${observed_on}`);
        }
        observations.push({ series_code: code, observed_on, value });
      });
    }
  }

  const missing = SERIES_CODES.filter((code) => !found.has(code));
  if (missing.length > 0) {
    throw new Error(`The page has no price table for ${missing.join(", ")}`);
  }
  const published = html.match(/Publi(?:é|&eacute;) le\s+(\d{2})\/(\d{2})\/(\d{4})/);
  return {
    observations,
    publishedOn: published ? `${published[3]}-${published[2]}-${published[1]}` : null,
  };
}

export async function fetchPage(): Promise<string> {
  const response = await fetch(PAGE, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!response.ok) throw new Error(`DRAAF Occitanie answered ${response.status} for ${PAGE}`);
  return await response.text();
}
