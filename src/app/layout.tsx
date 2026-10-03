import type { Metadata } from "next";
import { Archivo, IBM_Plex_Mono, Newsreader } from "next/font/google";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { JsonLd } from "@/components/ui/JsonLd";
import { SITE_DESCRIPTION, SITE_INDEXABLE, SITE_NAME, SITE_URL } from "@/lib/site";

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
    default: `${SITE_NAME} | Wine market intelligence`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  robots: SITE_INDEXABLE ? null : { index: false, follow: false },
  // Filtered and ranged views of a page canonicalise to the page itself,
  // so the markets tables do not index once per filter.
  alternates: { canonical: "./" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_GB",
  },
  twitter: { card: "summary_large_image" },
};

/** The publisher and the site, once, for every page. */
const siteStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      logo: `${SITE_URL}/opengraph-image`,
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: SITE_NAME,
      url: SITE_URL,
      inLanguage: "en-GB",
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
  ],
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
        <JsonLd data={siteStructuredData} />
        <SiteHeader />
        <main className="grow">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
