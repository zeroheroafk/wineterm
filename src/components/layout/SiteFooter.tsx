import Link from "next/link";

import { Container } from "@/components/layout/Container";
import { WordmarkInverted } from "@/components/layout/Wordmark";
import { footerNavigation } from "@/lib/navigation";

/** Global footer on the dark burgundy institutional surface. */
export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t-4 border-wine bg-wine-deep text-wine-wash">
      <Container className="py-10">
        <div className="flex flex-col gap-10 lg:flex-row lg:justify-between">
          <div className="max-w-sm">
            <WordmarkInverted />
            <p className="mt-4 text-sm leading-relaxed">
              Prices, production, stocks, trade and crop intelligence for
              wineries, growers and the global wine trade.
            </p>
            <form
              className="mt-6"
              aria-label="Newsletter signup"
              action="/briefing"
            >
              <label htmlFor="footer-briefing-email" className="wt-label">
                The WineTerm briefing, in your inbox
              </label>
              <div className="mt-2 flex">
                <input
                  id="footer-briefing-email"
                  type="email"
                  name="email"
                  required
                  placeholder="work email"
                  className="h-9 w-full border border-wine bg-paper px-3 font-mono text-sm text-ink placeholder:text-ink-soft"
                />
                <button
                  type="submit"
                  className="h-9 shrink-0 border border-ochre bg-transparent px-4 text-sm font-medium text-ochre transition-colors hover:bg-ochre hover:text-wine-deep"
                >
                  Get the briefing
                </button>
              </div>
            </form>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {footerNavigation.map((group) => (
              <nav key={group.heading} aria-label={group.heading}>
                <h2 className="wt-label text-ochre">{group.heading}</h2>
                <ul className="mt-3 space-y-2">
                  {group.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="text-sm text-wine-wash transition-colors hover:text-paper"
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

        <div className="mt-10 border-t border-wine pt-5">
          <p className="wt-label leading-relaxed">
            &copy; {year} WineTerm. All rights reserved. Content is provided
            for professional information purposes and is not investment
            advice. Figures shown during development are illustrative samples,
            not live market data.
          </p>
        </div>
      </Container>
    </footer>
  );
}
