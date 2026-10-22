import * as flags from "country-flag-icons/react/3x2";

import { countryName } from "@/services/types";

const FLAGS = flags as unknown as Record<string, (typeof flags)["ES"] | undefined>;

/**
 * ISO 3166-1 user-assigned codes. Sources and the flag set give them
 * different meanings (XC is Ceuta to Eurostat, Northern Cyprus to the
 * flag set), so they keep their code; Kosovo's XK is the one both share.
 */
const USER_ASSIGNED = /^(AA|Q[M-Z]|X[A-JL-Z]|ZZ)$/;

/** Whether `code` is drawn as a flag rather than set as its code. */
export function hasFlag(code: string): boolean {
  return (
    /^[A-Z]{2}$/.test(code) && !USER_ASSIGNED.test(code) && FLAGS[code] !== undefined
  );
}

/**
 * Flag of an ISO 3166-1 alpha-2 code, 3:2, a hairline round it so white
 * fields hold their edge on paper. Named for assistive technology and on
 * hover unless `decorative`, where the country is named next to it.
 * Renders nothing for codes without a flag; check `hasFlag` first.
 *
 * Server-side only: it holds every flag, which must not reach a client
 * bundle. Client components take it rendered, as a prop.
 */
export function Flag({
  code,
  decorative = false,
}: {
  code: string;
  decorative?: boolean;
}) {
  const Svg = hasFlag(code) ? FLAGS[code] : undefined;
  if (!Svg) return null;
  const name = countryName(code);

  return (
    <Svg
      {...(decorative
        ? { "aria-hidden": true }
        : { role: "img", "aria-label": name, title: name })}
      className="inline-block h-3 w-[1.125rem] shrink-0 shadow-[0_0_0_1px_var(--wt-rule)]"
    />
  );
}
