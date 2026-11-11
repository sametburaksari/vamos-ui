"use client";

import * as React from "react";
import { Button, EmptyState, ToggleGroup, ToggleGroupItem } from "@vamos-ui/react";
import { BlockViewer } from "./block-viewer";
import { SiteGrid } from "./site-grid";
import { OTHER_SITE_GROUP, PAGE_GROUP, siteGroupOf, siteTypeGroups } from "./site-types";

export interface BrowserBlock {
  name: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  /** File paths; the source is fetched on demand. */
  files: string[];
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
/** The category shown as a thumbnail grid with a site-type filter. */
const WEBSITES = "Website pages";
const siteGroups = [...siteTypeGroups, OTHER_SITE_GROUP, PAGE_GROUP];
const matchesTag = (b: BrowserBlock, tag: string) => tag === ALL || b.tags.includes(tag) || b.tags.includes("any");

function readQuery() {
  if (typeof window === "undefined") return { category: ALL, tag: ALL, type: ALL, block: null };
  const q = new URLSearchParams(window.location.search);
  return { category: q.get("category") ?? ALL, tag: q.get("tag") ?? ALL, type: q.get("type") ?? ALL, block: q.get("block") };
}

/**
 * The /blocks list: filter by category (in `blockCategories` order, with counts) and by domain
 * tag. "Website pages" switches to a thumbnail grid with a site-type filter; picking a card
 * opens its full preview and code. Filters live in the query string so a view can be shared.
 */
export function BlocksBrowser({ blocks, categories }: { blocks: BrowserBlock[]; categories: readonly string[] }) {
  const [category, setCategory] = React.useState(ALL);
  const [tag, setTag] = React.useState(ALL);
  const [type, setType] = React.useState(ALL);
  const [selected, setSelected] = React.useState<string | null>(null);

  React.useEffect(() => {
    const q = readQuery();
    if (q.category === ALL || categories.includes(q.category)) setCategory(q.category);
    if (q.tag === ALL || domainTags.some((t) => t.id === q.tag)) setTag(q.tag);
    if (q.type === ALL || siteGroups.some((g) => g.id === q.type)) setType(q.type);
    if (q.block && blocks.some((b) => b.name === q.block && b.category === WEBSITES)) setSelected(q.block);
  }, [categories, blocks]);

  const update = (next: { category?: string; tag?: string; type?: string; block?: string | null }) => {
    const c = next.category ?? category;
    const t = next.tag ?? tag;
    // Site type and the opened site only mean something inside "Website pages".
    const ty = c === WEBSITES ? (next.type ?? type) : ALL;
    const b = c === WEBSITES ? (next.block !== undefined ? next.block : next.type !== undefined ? null : selected) : null;
    setCategory(c);
    setTag(t);
    setType(ty);
    setSelected(b);
    const q = new URLSearchParams(window.location.search);
    const put = (key: string, value: string | null) => (value === null || value === ALL ? q.delete(key) : q.set(key, value));
    put("category", c);
    put("tag", t);
    put("type", ty);
    put("block", b);
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
  const websites = category === WEBSITES;
  const typeCounts = new Map<string, number>();
  if (websites) for (const b of visible) typeCounts.set(siteGroupOf(b.name), (typeCounts.get(siteGroupOf(b.name)) ?? 0) + 1);
  const presentGroups = siteGroups.filter((g) => typeCounts.has(g.id));
  const shown = websites && type !== ALL ? ordered.filter((b) => siteGroupOf(b.name) === type) : ordered;

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
        {websites && presentGroups.length > 1 ? (
          <div className="flex flex-wrap items-center gap-2">
            <span id="blocks-site-type" className="text-[12.5px] text-fg-subtle">Site type</span>
            <ToggleGroup aria-labelledby="blocks-site-type" variant="outline" size="xs" value={type} onValueChange={(v) => update({ type: v || ALL })} className="flex-wrap border-0 bg-transparent p-0">
              <ToggleGroupItem value={ALL}>
                All <span className="text-fg-subtle tabular">{visible.length}</span>
              </ToggleGroupItem>
              {presentGroups.map((g) => (
                <ToggleGroupItem key={g.id} value={g.id}>
                  {g.label} <span className="text-fg-subtle tabular">{typeCounts.get(g.id)}</span>
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        ) : null}
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

      <p className="sr-only" aria-live="polite">{`${shown.length} ${shown.length === 1 ? "block" : "blocks"} shown`}</p>

      {websites && shown.length ? (
        <SiteGrid blocks={shown} selected={selected} onSelect={(name) => update({ block: name })} />
      ) : !websites && ordered.length ? (
        <div className="mt-10 grid gap-16">
          {ordered.map((b, i) => {
            const first = i === 0 || ordered[i - 1]!.category !== b.category;
            // Whole sites stay a thumbnail grid in "All" too; a card opens it under "Website pages".
            if (b.category === WEBSITES && !first) return null;
            return (
              <React.Fragment key={b.name}>
                {category === ALL && first ? (
                  <h2 className="-mb-10 border-b border-line pb-2 text-[11.5px] font-medium uppercase tracking-[0.14em] text-fg-subtle">{b.category}</h2>
                ) : null}
                {b.category === WEBSITES ? (
                  <SiteGrid blocks={ordered.filter((o) => o.category === WEBSITES)} selected={null} cardHeading="h3" onSelect={(name) => update({ category: WEBSITES, block: name })} />
                ) : (
                  <BlockViewer name={b.name} title={b.title} description={b.description} files={b.files} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      ) : (
        <EmptyState
          kind="no-results"
          className="mt-12"
          title="No blocks for this filter yet"
          description="Try another domain, or show every category."
          actions={<Button size="sm" variant="secondary" onClick={() => update({ category: ALL, tag: ALL, type: ALL })}>Clear filters</Button>}
        />
      )}
    </>
  );
}
