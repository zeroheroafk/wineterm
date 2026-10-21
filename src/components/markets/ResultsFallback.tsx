/**
 * Stands in for a filter rail and its table while they render at request
 * time: the Markets pages read the query string, so their results stream
 * in behind the prerendered header.
 */
export function ResultsFallback() {
  return (
    <div aria-busy="true">
      <p className="sr-only">Loading prices</p>
      <div className="mt-8 h-16 border-y border-rule bg-paper" />
      <div className="mt-5 h-64 border border-rule bg-paper" />
    </div>
  );
}
