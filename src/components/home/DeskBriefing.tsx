import Link from "next/link";
import { ActionForm } from "@/components/ui/ActionForm";
import { subscribeToBriefing } from "@/lib/actions";

export function DeskBriefing() {
  return (
    <section aria-labelledby="desk-briefing" className="border-y border-rule">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-rule py-2.5 text-[11px] uppercase">
        <h2 id="desk-briefing" className="font-bold">The WineTerm brief</h2>
        <Link href="/briefing" className="border-l border-rule pl-6 text-ink-soft hover:text-wine">Weekly briefing <span className="wt-desk-meta ml-2">Every Friday</span></Link>
        <Link href="/insights/analysis" className="text-ink-soft hover:text-wine">Analysis</Link>
        <Link href="/insights/monthly-reports" className="ml-auto text-wine normal-case hover:underline">View publications →</Link>
      </div>
      <ActionForm action={subscribeToBriefing} aria-labelledby="desk-briefing" messageClassName="text-wine">
        <div className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[13px] text-ink-soft"><span aria-hidden="true" className="mr-2 text-wine">✉</span> Wine prices, analysis and market updates in your inbox, every Friday.</p>
          <div className="flex shrink-0 gap-2">
            <label htmlFor="desk-email" className="sr-only">Work email</label>
            <input id="desk-email" name="email" type="email" autoComplete="email" required placeholder="your@email.com" className="h-9 min-w-0 grow rounded-lg border border-rule bg-transparent px-3 text-sm sm:w-64" />
            <button type="submit" className="h-9 rounded-lg bg-wine px-4 text-[11px] font-bold uppercase text-paper hover:bg-wine-deep">Subscribe</button>
          </div>
        </div>
      </ActionForm>
    </section>
  );
}
