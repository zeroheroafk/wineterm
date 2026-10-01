import type { Metadata } from "next";

import { LegalPage } from "@/components/editorial/LegalPage";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "How WineTerm handles personal data: what is collected, why, and the rights you hold.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy"
      description="How WineTerm handles personal data."
      updatedAt="2026-09-26"
      sections={[
        {
          heading: "What we collect",
          paragraphs: [
            "WineTerm collects the data you give us directly: an email address when you sign up for the briefing, and the details you include when you contact us. The platform itself can be read without an account.",
            "Signups and contact messages are stored in a database in the European Union (Paris region), operated for WineTerm by Supabase as data processor. They are never exposed through the site; only WineTerm can read them.",
          ],
        },
        {
          heading: "How we use it",
          paragraphs: [
            "Email addresses are used to send the briefing you asked for and service messages about it. Contact details are used to answer you. We do not sell personal data, and we do not add addresses to marketing lists beyond what you signed up for.",
          ],
        },
        {
          heading: "Legal basis and retention",
          paragraphs: [
            "Processing rests on your consent for the briefing, which you can withdraw at any time by unsubscribing, and on legitimate interest for answering correspondence. Data is kept only as long as needed for those purposes.",
          ],
        },
        {
          heading: "Your rights",
          paragraphs: [
            "Under the GDPR you can request access to, correction of, or deletion of your personal data, and you can object to or restrict processing. Use the contact page to exercise any of these rights. You also have the right to complain to your supervisory authority.",
          ],
        },
        {
          heading: "Cookies and analytics",
          paragraphs: [
            "The development build sets no advertising or tracking cookies. If analytics are introduced at launch, this policy will be updated first and will describe exactly what is measured.",
          ],
        },
      ]}
    />
  );
}
