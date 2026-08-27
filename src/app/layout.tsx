import type { Metadata } from "next";
import { Archivo, IBM_Plex_Mono, Newsreader } from "next/font/google";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";

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
  title: {
    default: "WineTerm | Wine market intelligence",
    template: "%s | WineTerm",
  },
  description:
    "Prices, production, stocks, trade and crop intelligence for wineries, growers and the global wine trade.",
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
      </body>
    </html>
  );
}
