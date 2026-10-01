import Link from "next/link";

import { Container } from "@/components/layout/Container";
import { WordmarkInverted } from "@/components/layout/Wordmark";
import { CurrentDate } from "@/components/ui/CurrentDate";
import { footerNavigation } from "@/lib/navigation";

/**
 * Global footer on the dark burgundy institutional surface: brand line,
 * link groups in cream and the legal and data notice in sentence case.
 * The newsletter signup lives on the pages themselves, not here.
 */
export function SiteFooter() {
  return (
    <footer className="wt-on-dark mt-16 bg-wine-deep text-wine-wash">
      <Container className="py-9">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] lg:gap-16">
          <div>
            <WordmarkInverted />
            <p className="mt-3 max-w-xs text-sm leading-relaxed">
              Prices, supply and trade intelligence for the international
              wine trade.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-7 sm:grid-cols-4">
            {footerNavigation.map((group) => (
              <nav key={group.heading} aria-label={group.heading}>
                <h2 className="text-sm font-semibold text-paper">
                  {group.heading}
                </h2>
                <ul className="mt-2.5 space-y-1.5">
                  {group.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="text-sm text-wine-wash underline-offset-4 transition-colors hover:text-paper hover:underline"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-8 border-t border-wine-wash/20 pt-4">
          <p className="text-[0.8125rem] leading-normal text-wine-wash">
            &copy; <CurrentDate options={{ year: "numeric" }} unit="year" />{" "}
            WineTerm. All rights reserved. Content is provided for
            professional information purposes and is not investment advice.
            During development, figures are illustrative samples, not live
            market data, unless credited to an official source such as
            Eurostat or MAPA.
          </p>
        </div>
      </Container>
    </footer>
  );
}
