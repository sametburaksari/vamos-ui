import * as React from "react";

export type JsonLdNode = Record<string, unknown>;

/** Serialises JSON-LD safely for a `<script>` (no `</script>` break-out, no U+2028/9 surprises). */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

/** Merges nodes into one `{ "@context", "@graph" }` document; nodes with the same `@id` are merged. */
export function mergeJsonLd(nodes: readonly (JsonLdNode | null | undefined)[]): JsonLdNode | null {
  const byId = new Map<string, JsonLdNode>();
  const graph: JsonLdNode[] = [];
  for (const n of nodes) {
    if (!n) continue;
    const { "@context": _ctx, ...rest } = n;
    const id = typeof rest["@id"] === "string" ? (rest["@id"] as string) : undefined;
    if (id && byId.has(id)) Object.assign(byId.get(id)!, rest);
    else {
      graph.push(rest);
      if (id) byId.set(id, rest);
    }
  }
  return graph.length ? { "@context": "https://schema.org", "@graph": graph } : null;
}

export interface JsonLdProps {
  /** One node, a list of nodes (merged into an @graph), or a complete JSON-LD document. */
  data: JsonLdNode | readonly JsonLdNode[] | null | undefined;
}

/**
 * Structured data for search engines. Server component.
 *
 * ```tsx
 * <JsonLd data={{ "@type": "Restaurant", name: "Kıyı Meyhane", servesCuisine: "Aegean" }} />
 * ```
 */
export function JsonLd({ data }: JsonLdProps) {
  if (!data) return null;
  const doc = Array.isArray(data) ? mergeJsonLd(data) : "@context" in (data as JsonLdNode) ? (data as JsonLdNode) : { "@context": "https://schema.org", ...(data as JsonLdNode) };
  if (!doc) return null;
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(doc) }} />;
}
