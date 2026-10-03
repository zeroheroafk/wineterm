/**
 * Structured data for search engines, rendered as a JSON-LD script.
 * The payload is escaped so a "<" in any value cannot close the script.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
