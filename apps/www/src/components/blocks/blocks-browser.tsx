"use client";

import * as React from "react";
import { Button, EmptyState, ToggleGroup, ToggleGroupItem } from "@vamos-ui/react";
import { BlockViewer, type BlockFile } from "./block-viewer";

export interface BrowserBlock {
  name: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  files: BlockFile[];
}

/** Domain filters, in display order. A block tagged "any" fits every domain. */
const domainTags = [
  { id: "cms", label: "CMS" },
  { id: "crm", label: "CRM" },
  { id: "hr", label: "HR" },
  { id: "ops", label: "Ops" },
  { id: "site", label: "Websites" },
] as const;

const ALL = "all";
const matchesTag = (b: BrowserBlock, tag: string) => tag === ALL || b.tags.includes(tag) || b.tags.includes("any");

function readQuery() {
  if (typeof window === "undefined") return { category: ALL, tag: ALL };
  const q = new URLSearchParams(window.location.search);
  return { category: q.get("category") ?? ALL, tag: q.get("tag") ?? ALL };
}

/**
 * The /blocks list: filter by category (in `blockCategories` order, with counts) and by domain
 * tag. Filters live in the query string so a filtered view can be shared.
 */
export function BlocksBrowser({ blocks, categories }: { blocks: BrowserBlock[]; categories: readonly string[] }) {
  const [category, setCategory] = React.useState(ALL);
  const [tag, setTag] = React.useState(ALL);

  React.useEffect(() => {
    const q = readQuery();
    if (q.category === ALL || categories.includes(q.category)) setCategory(q.category);
    if (q.tag === ALL || domainTags.some((t) => t.id === q.tag)) setTag(q.tag);
  }, [categories]);

  const update = (next: { category?: string; tag?: string }) => {
    const c = next.category ?? category;
    const t = next.tag ?? tag;
    setCategory(c);
    setTag(t);
    const q = new URLSearchParams(window.location.search);
    if (c === ALL) q.delete("category");
    else q.set("category", c);
    if (t === ALL) q.delete("tag");
    else q.set("tag", t);
    const qs = q.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${qs ? `?${qs}` : ""}${window.location.hash}`);
  };

  const byTag = blocks.filter((b) => matchesTag(b, tag));
  const counts = new Map<string, number>();
  for (const b of byTag) counts.set(b.category, (counts.get(b.category) ?? 0) + 1);
  // Only categories that have blocks at all; order follows blockCategories.
  const present = categories.filter((c) => blocks.some((b) => b.category === c));
  const visible = byTag.filter((b) => category === ALL || b.category === category);
  const ordered = [...visible].sort((a, b) => categories.indexOf(a.category) - categories.indexOf(b.category));

  return (
    <>
      <div className="mt-8 grid gap-3">
        <div className="-mx-5 overflow-x-auto px-5 scrollbar-none">
          <ToggleGroup
            aria-label="Category"
            size="sm"
            value={category}
            onValueChange={(v) => update({ category: v || ALL })}
            className="w-max"
          >
            <ToggleGroupItem value={ALL}>
              All <span className="text-fg-subtle tabular">{byTag.length}</span>
            </ToggleGroupItem>
            {present.map((c) => {
              const n = counts.get(c) ?? 0;
              return (
                <ToggleGroupItem key={c} value={c} disabled={n === 0 && category !== c}>
                  {c} <span className="text-fg-subtle tabular">{n}</span>
                </ToggleGroupItem>
              );
            })}
          </ToggleGroup>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span id="blocks-domain" className="text-[12.5px] text-fg-subtle">Domain</span>
          <ToggleGroup aria-labelledby="blocks-domain" variant="outline" size="xs" value={tag} onValueChange={(v) => update({ tag: v || ALL })} className="border-0 bg-transparent p-0">
            <ToggleGroupItem value={ALL}>Any</ToggleGroupItem>
            {domainTags.map((t) => (
              <ToggleGroupItem key={t.id} value={t.id}>{t.label}</ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">{`${ordered.length} ${ordered.length === 1 ? "block" : "blocks"} shown`}</p>

      {ordered.length ? (
        <div className="mt-10 grid gap-16">
          {ordered.map((b, i) => (
            <React.Fragment key={b.name}>
              {category === ALL && (i === 0 || ordered[i - 1]!.category !== b.category) ? (
                <h2 className="-mb-10 border-b border-line pb-2 text-[11.5px] font-medium uppercase tracking-[0.14em] text-fg-subtle">{b.category}</h2>
              ) : null}
              <BlockViewer name={b.name} title={b.title} description={b.description} files={b.files} />
            </React.Fragment>
          ))}
        </div>
      ) : (
        <EmptyState
          kind="no-results"
          className="mt-12"
          title="No blocks for this filter yet"
          description="Try another domain, or show every category."
          actions={<Button size="sm" variant="secondary" onClick={() => update({ category: ALL, tag: ALL })}>Clear filters</Button>}
        />
      )}
    </>
  );
}
