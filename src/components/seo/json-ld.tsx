/**
 * Server Component that renders Schema.org structured data as JSON-LD.
 * Used in listing detail pages for rich search results.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  // Escape </script> to prevent XSS when injected via dangerouslySetInnerHTML
  const json = JSON.stringify(data).replace(/</g, "\\u003c");

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
