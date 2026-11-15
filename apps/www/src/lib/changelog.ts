import fs from "node:fs";
import path from "node:path";

/**
 * Reads the packages' CHANGELOG.md files (the single source of release notes, written by hand
 * for old releases and by Changesets for new ones) into a shape the docs page can render.
 *
 * Understood format: "## <version>[ — <date>]" per release, "### <kind>" per group, "- " items
 * (continuation lines indented by two spaces, blank lines and nested lists kept), plain paragraphs
 * as a release note.
 */

export interface ChangelogItem {
  /** Commit hash Changesets wrote in front of the item, when there is one. */
  hash?: string;
  /** The item as Markdown: its first line, then its indented lines (dedented), blank lines kept. */
  body: string;
  /** Set by readChangelogs when the same change is described in full under another package. */
  seeAlso?: { label: string; slug: string; version: string };
}

export interface ChangelogRelease {
  version: string;
  date?: string;
  note?: string;
  groups: { kind: string; items: ChangelogItem[] }[];
}

export interface PackageChangelog {
  name: string;
  label: string;
  slug: string;
  releases: ChangelogRelease[];
}

const ROOT = path.resolve(process.cwd(), "../..");

export const CHANGELOG_PACKAGES = [
  { dir: "packages/ui", name: "@vamos-ui/react", label: "Component kit", slug: "react" },
  { dir: "packages/cli", name: "vamos-ui", label: "CLI", slug: "cli" },
  { dir: "packages/mcp", name: "@vamos-ui/mcp", label: "MCP server", slug: "mcp" },
] as const;

/** Changesets' group names read as Keep a Changelog kinds. */
const KIND_ALIASES: Record<string, string> = { "Major Changes": "Changed", "Minor Changes": "Added", "Patch Changes": "Fixed" };
/** Which package "owns" a change listed under several: the one where it is the biggest bump. */
const KIND_RANK: Record<string, number> = { Changed: 3, Added: 2, Removed: 2, Fixed: 1 };

export function parseChangelog(md: string): ChangelogRelease[] {
  const releases: ChangelogRelease[] = [];
  let release: ChangelogRelease | undefined;
  let group: ChangelogRelease["groups"][number] | undefined;
  let item: ChangelogItem | undefined;
  let lines: string[] = [];
  const close = () => {
    if (item) item.body = lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
    item = undefined;
    lines = [];
  };
  for (const raw of md.split("\n")) {
    const line = raw.trimEnd();
    const h2 = /^##\s+(\S+)(?:\s+[—-]\s+(\d{4}-\d{2}-\d{2}))?\s*$/.exec(line);
    if (h2) {
      close();
      release = { version: h2[1]!, date: h2[2], groups: [] };
      group = undefined;
      releases.push(release);
      continue;
    }
    if (!release) continue;
    const h3 = /^###\s+(.+)$/.exec(line);
    if (h3) {
      close();
      const kind = KIND_ALIASES[h3[1]!.trim()] ?? h3[1]!.trim();
      group = release.groups.find((g) => g.kind === kind);
      if (!group) release.groups.push((group = { kind, items: [] }));
      continue;
    }
    // Changesets prefixes items with the commit hash ("- abc1234: text"); keep it apart.
    const top = /^[-*]\s+(?:([0-9a-f]{7,40}):\s+)?(.+)$/.exec(line);
    if (top && group) {
      close();
      item = { hash: top[1], body: "" };
      lines = [top[2]!];
      group.items.push(item);
      continue;
    }
    if (item && (line === "" || /^\s{2,}\S/.test(line))) {
      const text = line.replace(/^ {2}/, "");
      const nested = /^\s*[-*]\s+(.+)$/.exec(text);
      // "Updated dependencies [hash]" followed by "  - pkg@1.2.3" lines → "Updated dependencies: pkg@1.2.3, …"
      if (nested && lines[0]!.startsWith("Updated dependencies")) {
        const head = lines[0]!.replace(/\s*\[[0-9a-f, ]+\]/, "");
        lines[0] = head.includes(":") ? `${head}, ${nested[1]}` : `${head}: ${nested[1]}`;
      } else lines.push(text);
      continue;
    }
    if (line.trim() && !group) release.note = release.note ? `${release.note} ${line.trim()}` : line.trim();
  }
  close();
  // Changesets writes one "Updated dependencies [hash]" item per changeset; keep a single line with the versions.
  for (const r of releases)
    for (const g of r.groups) {
      const deps = g.items.filter((it) => it.body.startsWith("Updated dependencies"));
      if (deps.length < 2) continue;
      const versions = [...new Set(deps.flatMap((it) => (/:\s*(.+)$/.exec(it.body)?.[1] ?? "").split(/,\s*/).filter(Boolean)))];
      const merged: ChangelogItem = { body: versions.length ? `Updated dependencies: ${versions.join(", ")}` : "Updated dependencies" };
      g.items = [...g.items.filter((it) => !deps.includes(it)), merged];
    }
  return releases;
}

export function readChangelogs(): PackageChangelog[] {
  const packages = CHANGELOG_PACKAGES.map((p) => {
    const file = path.join(ROOT, p.dir, "CHANGELOG.md");
    const md = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
    return { name: p.name, label: p.label, slug: p.slug, releases: parseChangelog(md) };
  });
  // A changeset that bumps several packages appears in each CHANGELOG.md. Keep the full text once,
  // under the package where it is the biggest change (ties: the first package), and point to it elsewhere.
  const home = new Map<string, { rank: number; label: string; slug: string; version: string }>();
  for (const p of packages)
    for (const r of p.releases)
      for (const g of r.groups)
        for (const it of g.items) {
          if (!it.hash) continue;
          const rank = KIND_RANK[g.kind] ?? 0;
          const cur = home.get(it.hash);
          if (!cur || rank > cur.rank) home.set(it.hash, { rank, label: p.label, slug: p.slug, version: r.version });
        }
  for (const p of packages)
    for (const r of p.releases)
      for (const g of r.groups)
        for (const it of g.items) {
          const h = it.hash ? home.get(it.hash) : undefined;
          if (h && (h.slug !== p.slug || h.version !== r.version)) it.seeAlso = { label: h.label, slug: h.slug, version: h.version };
        }
  return packages;
}

/** Anchor of a change on the changelog page. */
export const changeId = (hash: string) => `change-${hash}`;
