/**
 * Inline script that runs while the browser parses the server HTML,
 * before the first paint. On the client it renders as text/plain, so
 * React neither warns about rendering a script nor runs it again; see
 * the "Preventing flash before hydration" guide in the Next.js docs.
 */
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
