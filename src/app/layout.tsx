import type { Metadata } from "next";
import { Archivo, IBM_Plex_Mono, Newsreader } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Suspense } from "react";

import { BriefingBar } from "@/components/editorial/BriefingBar";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SITE_OPEN_GRAPH } from "@/lib/seo";
import {
  GOOGLE_SITE_VERIFICATION,
  SITE_INDEXABLE,
  SITE_URL,
} from "@/lib/site";

import "./globals.css";

/** Editorial serif for headlines and display text. */
const editorial = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-editorial",
});

/** Interface sans for navigation, body and controls. */
const interfaceSans = Archivo({
  subsets: ["latin"],
  variable: "--font-interface",
});

/** Data monospace for prices, dates, units, codes and labels. */
const dataMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-data",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "WineTerm | Wine news and market intelligence",
    template: "%s | WineTerm",
  },
  description:
    "Wine sector news, prices, production, stocks, trade and crop intelligence for wineries, growers and the global wine trade.",
  // No canonical here: metadata merges shallowly, so a canonical set in
  // the layout would point every page that sets none at the homepage.
  // Each page names its own.
  openGraph: { ...SITE_OPEN_GRAPH, type: "website" },
  robots: SITE_INDEXABLE ? null : { index: false, follow: false },
  verification: { google: GOOGLE_SITE_VERIFICATION },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${editorial.variable} ${interfaceSans.variable} ${dataMono.variable}`}
    >
      <body className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="grow">{children}</main>
        <SiteFooter />
        {/* The bar reads the pathname, which suspends while the static
            shell of a route with dynamic params is prerendered; it renders
            nothing on the server anyway. */}
        <Suspense fallback={null}>
          <BriefingBar />
        </Suspense>
        <Analytics />
      </body>
    </html>
  );
}
