import { Fragment } from "react";

import { MaybePercent, TD, TD_RIGHT, TH, TH_RIGHT } from "@/components/markets/cells";
import { formatChange, formatMonthYear, formatPrice } from "@/lib/format";
import type { ExitsAbroadLine, SpainCampaignBalance } from "@/services/supply/types";

const VALUE = "tnum font-mono text-sm";

interface Line {
  label: string;
  value: (balance: SpainCampaignBalance) => number | null;
  /** Subtotals and declared stocks get heavier rules and weight. */
  emphasis?: boolean;
  /** Indented under the group row before it. */
  indent?: boolean;
  /** Footnote marker. */
  marker?: string;
  /** Signed, without a percentage change: a difference, not a volume. */
  difference?: boolean;
}

type Row = Line | { group: string };

const ROWS: Row[] = [
  { label: "Opening stocks, 31 July", value: (b) => b.openingMhl },
  { label: "Wine made since 1 August", value: (b) => b.madeMhl },
  { group: "Entries" },
  { label: "From operators in Spain", value: (b) => b.entriesDomesticMhl, indent: true, marker: "a" },
  { label: "From the rest of the EU", value: (b) => b.entriesEuMhl, indent: true },
  { label: "From third countries", value: (b) => b.entriesThirdCountriesMhl, indent: true },
  { label: "Availability", value: (b) => b.availabilityMhl, emphasis: true },
  { group: "Exits" },
  { label: "Within Spain", value: (b) => b.exitsDomesticMhl, indent: true, marker: "a" },
  { label: "To distilleries", value: (b) => b.exitsDistillationMhl, indent: true },
  { label: "To vinegar makers", value: (b) => b.exitsVinegarMhl, indent: true },
  { label: "To the rest of the EU", value: (b) => b.exitsEuMhl, indent: true, marker: "b" },
  { label: "To third countries", value: (b) => b.exitsThirdCountriesMhl, indent: true, marker: "b" },
  { label: "Own operations", value: (b) => b.exitsOwnOperationsMhl, indent: true, marker: "c" },
  { label: "All exits", value: (b) => b.exitsMhl, emphasis: true },
  { label: "Closing stocks, computed", value: (b) => b.computedClosingMhl },
  { label: "Closing stocks, declared", value: (b) => b.closingMhl, emphasis: true },
  { label: "Unaccounted", value: (b) => b.unaccountedMhl, marker: "d", difference: true },
];

const MEMO: Line = {
  label: "Exits within Spain, net of entries from Spain",
  value: (b) => b.netDomesticExitsMhl,
  marker: "a",
};

function percentChange(current: number | null, previous: number | null): number | null {
  return current === null || previous === null || previous === 0
    ? null
    : (current / previous - 1) * 100;
}

function Marker({ children }: { children: string }) {
  return <sup className="ml-1 text-[0.6rem] normal-case text-ochre">{children}</sup>;
}

function Amount({ value, difference }: { value: number | null; difference?: boolean }) {
  if (value === null) return <span className="wt-label text-ink-soft">n/a</span>;
  return <>{difference ? formatChange(value, 2) : formatPrice(value, 2)}</>;
}

/** Campaign and the month it runs to, for a column heading. */
function Period({ balance }: { balance: SpainCampaignBalance }) {
  return (
    <>
      <span className="text-ink">{balance.campaign}</span>
      <span className="mt-1 block">to {formatMonthYear(balance.throughMonth)}</span>
    </>
  );
}

/**
 * Spain's declared wine balance for the latest campaign to date against
 * the campaign before to the same month: stocks, wine made, entries and
 * exits by origin and destination, and what the declarations leave
 * unaccounted. Mhl.
 */
export function SpainBalanceTable({
  latest,
  previous,
}: {
  latest: SpainCampaignBalance;
  previous: SpainCampaignBalance | null;
}) {
  const line = (row: Line) => {
    const current = row.value(latest);
    const before = previous ? row.value(previous) : null;
    return (
      <tr
        key={row.label}
        className={
          row.emphasis ? "border-y border-ink bg-ground/60" : "border-b border-rule last:border-b-0"
        }
      >
        <th
          scope="row"
          className={`${TD} !whitespace-normal text-sm ${row.indent ? "pl-6" : ""} ${
            row.emphasis ? "font-semibold text-ink" : "font-normal text-ink"
          }`}
        >
          {row.label}
          {row.marker ? <Marker>{row.marker}</Marker> : null}
        </th>
        <td className={`${TD_RIGHT} ${VALUE} ${row.emphasis ? "font-medium" : ""} text-ink`}>
          <Amount value={current} difference={row.difference} />
        </td>
        <td className={`${TD_RIGHT} ${VALUE} hidden text-ink-soft sm:table-cell`}>
          {previous ? <Amount value={before} difference={row.difference} /> : null}
        </td>
        <td className={TD_RIGHT}>
          {row.difference ? null : <MaybePercent value={percentChange(current, before)} />}
        </td>
      </tr>
    );
  };

  return (
    <div className="overflow-x-auto border border-rule bg-paper">
      <table className="w-full border-collapse text-left">
        <caption className="sr-only">
          Spain&apos;s declared wine balance for {latest.campaign} to{" "}
          {formatMonthYear(latest.throughMonth)}
          {previous
            ? `, against ${previous.campaign} to ${formatMonthYear(previous.throughMonth)}`
            : null}
          , million hectolitres
        </caption>
        <thead>
          <tr className="border-b-2 border-ink">
            <th scope="col" className={TH}>
              Mhl
            </th>
            <th scope="col" className={TH_RIGHT}>
              <Period balance={latest} />
            </th>
            <th scope="col" className={`${TH_RIGHT} hidden sm:table-cell`}>
              {previous ? <Period balance={previous} /> : "A campaign earlier"}
            </th>
            <th scope="col" className={TH_RIGHT}>
              Change
            </th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) =>
            "group" in row ? (
              <tr key={row.group} className="border-b border-rule">
                <th scope="rowgroup" colSpan={4} className={`${TD} wt-label pt-3 font-normal text-ink-soft`}>
                  {row.group}
                </th>
              </tr>
            ) : (
              line(row)
            ),
          )}
        </tbody>
        <tbody className="border-t-2 border-ink">{line(MEMO)}</tbody>
      </table>
    </div>
  );
}

/**
 * Spain's declared wine balance by completed campaign, in short: wine
 * made, exits abroad and within Spain, closing stocks and what is left
 * unaccounted. Opening stocks are the row below's closing stocks. Mhl.
 */
export function SpainBalanceHistoryTable({ history }: { history: SpainCampaignBalance[] }) {
  return (
    <div className="overflow-x-auto border border-rule bg-paper">
      <table className="w-full border-collapse text-left">
        <caption className="sr-only">
          Spain&apos;s declared wine balance by completed campaign, million hectolitres
        </caption>
        <thead>
          <tr className="border-b-2 border-ink">
            <th scope="col" className={TH}>
              Campaign
            </th>
            <th scope="col" className={TH_RIGHT}>
              Made
            </th>
            <th scope="col" className={TH_RIGHT}>
              Exits abroad
              <Marker>b</Marker>
            </th>
            <th scope="col" className={`${TH_RIGHT} hidden md:table-cell`}>
              Bulk share
              <Marker>b</Marker>
            </th>
            <th scope="col" className={`${TH_RIGHT} hidden sm:table-cell`}>
              Within Spain, net
              <Marker>a</Marker>
            </th>
            <th scope="col" className={TH_RIGHT}>
              Closing
            </th>
            <th scope="col" className={`${TH_RIGHT} hidden sm:table-cell`}>
              Unaccounted
              <Marker>d</Marker>
            </th>
          </tr>
        </thead>
        <tbody>
          {history.map((balance) => (
            <tr key={balance.campaign} className="border-b border-rule last:border-b-0">
              <th scope="row" className={`${TD} ${VALUE} font-normal text-ink`}>
                {balance.campaign}
              </th>
              <td className={`${TD_RIGHT} ${VALUE} text-ink`}>
                {formatPrice(balance.madeMhl, 2)}
              </td>
              <td className={`${TD_RIGHT} ${VALUE} text-ink`}>
                {formatPrice(balance.exitsEuMhl + balance.exitsThirdCountriesMhl, 2)}
              </td>
              <td className={`${TD_RIGHT} ${VALUE} hidden text-ink-soft md:table-cell`}>
                {balance.exitsAbroad ? formatOneDecimalShare(bulkShare(balance.exitsAbroad)) : null}
              </td>
              <td className={`${TD_RIGHT} ${VALUE} hidden text-ink sm:table-cell`}>
                {formatPrice(balance.netDomesticExitsMhl, 2)}
              </td>
              <td className={`${TD_RIGHT} ${VALUE} font-medium text-ink`}>
                {formatPrice(balance.closingMhl, 2)}
              </td>
              <td className={`${TD_RIGHT} ${VALUE} hidden text-ink-soft sm:table-cell`}>
                {formatChange(balance.unaccountedMhl, 2)}
                {balance.exitsOwnOperationsMhl === null ? <Marker>c</Marker> : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

type Kind = Pick<ExitsAbroadLine, "colour" | "presentation">;

interface AbroadLine {
  label: string;
  match: (line: ExitsAbroadLine) => boolean;
  emphasis?: boolean;
  indent?: boolean;
}

const COLOURS: [ExitsAbroadLine["colour"], string][] = [
  ["red-rose", "Red and rosé"],
  ["white", "White"],
];

const ABROAD_ROWS: (AbroadLine | { group: string })[] = (
  [
    ["bulk", "Bulk"],
    ["packaged", "Packaged"],
  ] as const
).flatMap(([presentation, name]) => [
  { group: name },
  ...COLOURS.map(([colour, label]) => ({
    label,
    match: (line: Kind) => line.colour === colour && line.presentation === presentation,
    indent: true,
  })),
  {
    label: `All ${name.toLowerCase()}`,
    match: (line: Kind) => line.presentation === presentation,
    emphasis: true,
  },
]);

const ALL_ABROAD: AbroadLine = { label: "All exits abroad", match: () => true, emphasis: true };

/** Hectolitres of the lines a row covers, to the EU, to third countries or both. */
function abroad(
  lines: ExitsAbroadLine[],
  match: AbroadLine["match"],
  to: "eu" | "third" | "all",
): number {
  return lines
    .filter(match)
    .reduce(
      (sum, line) =>
        sum + (to === "third" ? 0 : line.euMhl) + (to === "eu" ? 0 : line.thirdCountriesMhl),
      0,
    );
}

/** A share with one decimal always, so "60.0%" lines up with "63.9%". */
function formatOneDecimalShare(value: number): string {
  return `${formatPrice(value, 1)}%`;
}

/** Bulk wine's share of the exits abroad, percent. */
function bulkShare(lines: ExitsAbroadLine[]): number {
  return (
    (abroad(lines, (line) => line.presentation === "bulk", "all") /
      abroad(lines, () => true, "all")) *
    100
  );
}

/**
 * Spain's declared exits to the rest of the EU and to third countries by
 * presentation and colour, for the latest campaign to date, with the
 * total against the campaign before to the same month. Mhl.
 */
export function SpainExitsAbroadTable({
  latest,
  lines,
  previous,
}: {
  latest: SpainCampaignBalance;
  /** The latest campaign's exits abroad. */
  lines: ExitsAbroadLine[];
  previous: SpainCampaignBalance | null;
}) {
  const before = previous?.exitsAbroad ?? null;

  const line = (row: AbroadLine) => {
    const total = abroad(lines, row.match, "all");
    const earlier = before ? abroad(before, row.match, "all") : null;
    return (
      <tr
        key={row.label}
        className={
          row.emphasis ? "border-y border-ink bg-ground/60" : "border-b border-rule last:border-b-0"
        }
      >
        <th
          scope="row"
          className={`${TD} !whitespace-normal text-sm ${row.indent ? "pl-6" : ""} ${
            row.emphasis ? "font-semibold" : "font-normal"
          } text-ink`}
        >
          {row.label}
        </th>
        <td className={`${TD_RIGHT} ${VALUE} hidden text-ink sm:table-cell`}>
          {formatPrice(abroad(lines, row.match, "eu"), 2)}
        </td>
        <td className={`${TD_RIGHT} ${VALUE} hidden text-ink sm:table-cell`}>
          {formatPrice(abroad(lines, row.match, "third"), 2)}
        </td>
        <td className={`${TD_RIGHT} ${VALUE} ${row.emphasis ? "font-medium" : ""} text-ink`}>
          {formatPrice(total, 2)}
        </td>
        <td className={`${TD_RIGHT} ${VALUE} hidden text-ink-soft md:table-cell`}>
          {earlier === null ? null : formatPrice(earlier, 2)}
        </td>
        <td className={TD_RIGHT}>
          <MaybePercent value={percentChange(total, earlier)} />
        </td>
      </tr>
    );
  };

  return (
    <div className="overflow-x-auto border border-rule bg-paper">
      <table className="w-full border-collapse text-left">
        <caption className="sr-only">
          Spain&apos;s declared exits of wine abroad by presentation and colour, {latest.campaign} to{" "}
          {formatMonthYear(latest.throughMonth)}
          {previous
            ? `, against ${previous.campaign} to ${formatMonthYear(previous.throughMonth)}`
            : null}
          , million hectolitres
        </caption>
        <thead>
          <tr className="border-b-2 border-ink">
            <th scope="col" className={TH}>
              Mhl
            </th>
            <th scope="col" className={`${TH_RIGHT} hidden sm:table-cell`}>
              To the EU
            </th>
            <th scope="col" className={`${TH_RIGHT} hidden sm:table-cell`}>
              To third countries
            </th>
            <th scope="col" className={TH_RIGHT}>
              <Period balance={latest} />
            </th>
            <th scope="col" className={`${TH_RIGHT} hidden md:table-cell`}>
              {previous ? <Period balance={previous} /> : "A campaign earlier"}
            </th>
            <th scope="col" className={TH_RIGHT}>
              Change
            </th>
          </tr>
        </thead>
        <tbody>
          {ABROAD_ROWS.map((row) =>
            "group" in row ? (
              <tr key={row.group} className="border-b border-rule">
                <th scope="rowgroup" colSpan={6} className={`${TD} wt-label pt-3 font-normal text-ink-soft`}>
                  {row.group}
                </th>
              </tr>
            ) : (
              line(row)
            ),
          )}
        </tbody>
        <tbody className="border-t-2 border-ink">
          {line(ALL_ABROAD)}
          <tr>
            <th scope="row" className={`${TD} !whitespace-normal text-sm font-normal text-ink`}>
              Bulk share
            </th>
            <td className="hidden sm:table-cell" />
            <td className="hidden sm:table-cell" />
            <td className={`${TD_RIGHT} ${VALUE} text-ink`}>
              {formatOneDecimalShare(bulkShare(lines))}
            </td>
            <td className={`${TD_RIGHT} ${VALUE} hidden text-ink-soft md:table-cell`}>
              {before ? formatOneDecimalShare(bulkShare(before)) : null}
            </td>
            <td />
          </tr>
        </tbody>
      </table>
    </div>
  );
}

/** The footnotes both tables share, keyed by their markers. */
export function SpainBalanceNotes() {
  const notes: [string, string][] = [
    [
      "a",
      "Wine traded between declarants counts as an exit for the seller and an entry for the buyer, so exits within Spain less entries from operators in Spain are roughly what reached the Spanish market.",
    ],
    [
      "b",
      "As declared by the operators; the official export figures are the customs statistics on the Trade page.",
    ],
    [
      "c",
      "Wine taken out for the declarants' own operations, declared in a separate table since July 2021 and missing for March 2022; where a campaign lacks it, it sits in the unaccounted line.",
    ],
    [
      "d",
      "Declared minus computed closing stocks: losses, uses not declared as exits, and later revisions of the monthly declarations.",
    ],
  ];
  return (
    <p className="wt-label mt-2 max-w-3xl leading-relaxed text-ink-soft">
      {notes.map(([marker, text], index) => (
        <Fragment key={marker}>
          {index > 0 ? " " : null}
          <sup className="normal-case text-ochre">{marker}</sup> {text}
        </Fragment>
      ))}
    </p>
  );
}
