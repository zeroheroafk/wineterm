import { DataStatusLabel } from "@/components/ui/DataStatusLabel";

/**
 * Development-content notice for editorial surfaces: the articles and
 * editions below are illustrative placeholders, and every page that
 * lists them says so once, visibly, near the top.
 */
export function DevContentNotice({
  text = "Development content: the items below are illustrative placeholders demonstrating the editorial format, not published reporting.",
}: {
  text?: string;
}) {
  return (
    <p className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-y border-rule bg-paper px-3 py-2">
      <DataStatusLabel status="illustrative" />
      <span className="wt-label leading-relaxed text-ink-soft">{text}</span>
    </p>
  );
}
