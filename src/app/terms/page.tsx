import type { Metadata } from "next";

import { LegalPage } from "@/components/editorial/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "Terms of use for the WineTerm platform: professional information, permitted use, and limits of liability.",
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Use"
      description="The terms under which WineTerm content and data are provided."
      updatedAt="2026-08-21"
      sections={[
        {
          heading: "What WineTerm provides",
          paragraphs: [
            "WineTerm provides market information for the professional wine trade: price series, supply and trade statistics, harvest reporting and editorial analysis. Content is provided for professional information purposes only. It is not investment advice, not a recommendation to buy or sell any product, and not a substitute for commercial judgement.",
            "During the development period, all figures on the platform are illustrative samples and are marked as such. They must not be relied on for any commercial decision.",
          ],
        },
        {
          heading: "Permitted use",
          paragraphs: [
            "Access is for the internal professional use of your organisation. You may quote individual figures with attribution to WineTerm and the underlying source. You may not systematically extract, scrape, republish or redistribute WineTerm content or data, in whole or in part, without written permission.",
          ],
        },
        {
          heading: "Sources and accuracy",
          paragraphs: [
            "WineTerm attributes every observation to its source and keeps original observations unchanged. We work to keep content accurate and current, but figures are revised by their sources, and WineTerm gives no warranty of accuracy, completeness or timeliness. The methodology page describes how figures are collected, classified and revised.",
          ],
        },
        {
          heading: "Liability",
          paragraphs: [
            "To the extent permitted by law, WineTerm accepts no liability for decisions taken on the basis of the platform's content, for interruptions of availability, or for indirect or consequential loss. Nothing in these terms excludes liability that cannot lawfully be excluded.",
          ],
        },
        {
          heading: "Intellectual property",
          paragraphs: [
            "The WineTerm name, wordmark, design, series codes and editorial content are the property of WineTerm. Underlying statistics remain subject to the terms of their publishing sources.",
          ],
        },
        {
          heading: "Changes",
          paragraphs: [
            "These terms will be finalised and may change before launch. Material changes will be announced on the platform, and continued use after a change constitutes acceptance.",
          ],
        },
      ]}
    />
  );
}
