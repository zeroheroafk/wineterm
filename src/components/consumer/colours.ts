import type { CountryLine } from "@/components/consumer/CountryLinesChart";
import { COUNTRY_NAMES, PRODUCER_COUNTRIES, type ProducerCountry } from "@/services/types";

/** Each producer country's colour, the same in every chart (tokens in globals.css). */
export const COUNTRY_COLOURS: Record<ProducerCountry, string> = {
  ES: "var(--wt-country-es)",
  PT: "var(--wt-country-pt)",
  FR: "var(--wt-country-fr)",
  IT: "var(--wt-country-it)",
};

/**
 * One line per producer country, all four always, so each keeps its
 * colour whichever has figures.
 */
export const PRODUCER_LINES: CountryLine[] = PRODUCER_COUNTRIES.map((country) => ({
  key: country,
  name: COUNTRY_NAMES[country],
  colour: COUNTRY_COLOURS[country],
}));
