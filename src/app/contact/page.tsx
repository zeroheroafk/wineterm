import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { ActionForm } from "@/components/ui/ActionForm";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/SectionHeader";
import { sendContactMessage } from "@/lib/actions";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact WineTerm about data partnerships, directory listings, coverage suggestions or corrections.",
};

const SUBJECTS = [
  "Data partnership",
  "Directory listing",
  "Coverage suggestion",
  "Correction",
  "Other",
];

export default function ContactPage() {
  return (
    <Container className="pb-16">
      <Breadcrumbs items={[{ label: "Contact" }]} />
      <PageHeader
        kicker="WineTerm"
        title="Contact"
        description="Data partnerships, directory listings, coverage suggestions and corrections. Messages reach the market desk directly."
      />

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <ActionForm
          action={sendContactMessage}
          aria-label="Contact form"
          className="max-w-xl border border-rule border-t-2 border-t-wine bg-paper p-6"
          messageClassName="text-wine"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="contact-name" className="wt-label text-ink-soft">
                Name
              </label>
              <input
                id="contact-name"
                name="name"
                type="text"
                required
                className="mt-1.5 h-9 w-full border border-rule bg-ground px-3 font-mono text-sm text-ink"
              />
            </div>
            <div>
              <label htmlFor="contact-email" className="wt-label text-ink-soft">
                Work email
              </label>
              <input
                id="contact-email"
                name="email"
                type="email"
                required
                className="mt-1.5 h-9 w-full border border-rule bg-ground px-3 font-mono text-sm text-ink"
              />
            </div>
          </div>
          <div className="mt-4">
            <label
              htmlFor="contact-organisation"
              className="wt-label text-ink-soft"
            >
              Organisation
            </label>
            <input
              id="contact-organisation"
              name="organisation"
              type="text"
              className="mt-1.5 h-9 w-full border border-rule bg-ground px-3 font-mono text-sm text-ink"
            />
          </div>
          <div className="mt-4">
            <label htmlFor="contact-subject" className="wt-label text-ink-soft">
              Subject
            </label>
            <select
              id="contact-subject"
              name="subject"
              className="mt-1.5 h-9 w-full border border-rule bg-ground px-3 font-mono text-sm text-ink"
            >
              {SUBJECTS.map((subject) => (
                <option key={subject}>{subject}</option>
              ))}
            </select>
          </div>
          <div className="mt-4">
            <label htmlFor="contact-message" className="wt-label text-ink-soft">
              Message
            </label>
            <textarea
              id="contact-message"
              name="message"
              rows={5}
              required
              className="mt-1.5 w-full border border-rule bg-ground px-3 py-2 font-mono text-sm text-ink"
            />
          </div>
          <div className="mt-5">
            <Button type="submit">Send message</Button>
          </div>
          <p className="wt-label mt-3 leading-relaxed text-ink-soft">
            Message delivery is not connected yet in this development build.
          </p>
        </ActionForm>

        <aside className="max-w-md">
          <div className="border border-rule bg-paper px-5 py-4">
            <h2 className="wt-label text-wine">What to expect</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              The desk reads everything. Corrections are handled first, then
              data partnerships and directory requests. During the
              development period, responses may take a few days.
            </p>
          </div>
        </aside>
      </div>
    </Container>
  );
}
