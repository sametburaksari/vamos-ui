import fs from "node:fs";
import path from "node:path";

/**
 * Reads the packages' CHANGELOG.md files (the single source of release notes, written by hand
 * for old releases and by Changesets for new ones) into a shape the docs page can render.
 *
 * Understood format: "## <version>[ — <date>]" per release, "### <kind>" per group, "- " items
 * (continuation lines indented by two spaces), plain paragraphs as a release note.
 */

export interface ChangelogRelease {
  version: string;
  date?: string;
  note?: string;
  groups: { kind: string; items: string[] }[];
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

export function parseChangelog(md: string): ChangelogRelease[] {
  const releases: ChangelogRelease[] = [];
  let release: ChangelogRelease | undefined;
  let group: ChangelogRelease["groups"][number] | undefined;
  for (const raw of md.split("\n")) {
    const line = raw.trimEnd();
    const h2 = /^##\s+(\S+)(?:\s+[—-]\s+(\d{4}-\d{2}-\d{2}))?\s*$/.exec(line);
    if (h2) {
      release = { version: h2[1]!, date: h2[2], groups: [] };
      group = undefined;
      releases.push(release);
      continue;
    }
    if (!release) continue;
    const h3 = /^###\s+(.+)$/.exec(line);
    if (h3) {
      const kind = KIND_ALIASES[h3[1]!.trim()] ?? h3[1]!.trim();
      group = release.groups.find((g) => g.kind === kind);
      if (!group) release.groups.push((group = { kind, items: [] }));
      continue;
    }
    // Changesets prefixes items with the commit hash ("- abc1234: text"); drop it.
    const item = /^[-*]\s+(?:[0-9a-f]{7,40}:\s+)?(.+)$/.exec(line);
    if (item && group) {
      group.items.push(item[1]!);
      continue;
    }
    if (/^\s{2,}\S/.test(line) && group && group.items.length) {
      const last = group.items.length - 1;
      const nested = /^\s+[-*]\s+(.+)$/.exec(line);
      // "Updated dependencies [hash]" followed by "  - pkg@1.2.3" lines → "Updated dependencies: pkg@1.2.3, …"
      if (nested && group.items[last]!.startsWith("Updated dependencies")) {
        const head = group.items[last]!.replace(/\s*\[[0-9a-f, ]+\]/, "");
        group.items[last] = head.includes(":") ? `${head}, ${nested[1]}` : `${head}: ${nested[1]}`;
      } else group.items[last] += " " + line.trim();
      continue;
    }
    if (line.trim() && !group) release.note = release.note ? `${release.note} ${line.trim()}` : line.trim();
  }
  return releases;
}

export function readChangelogs(): PackageChangelog[] {
  return CHANGELOG_PACKAGES.map((p) => {
    const file = path.join(ROOT, p.dir, "CHANGELOG.md");
    const md = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
    return { name: p.name, label: p.label, slug: p.slug, releases: parseChangelog(md) };
  });
}
