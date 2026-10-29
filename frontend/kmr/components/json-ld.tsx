// Renders a JSON-LD block. The JSON is escaped for safe inline embedding
// ("<" would otherwise be able to close the script tag early), which matters
// because product names and descriptions come from staff-authored data.
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  const json = JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
