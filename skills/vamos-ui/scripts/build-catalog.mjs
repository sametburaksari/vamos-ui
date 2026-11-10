#!/usr/bin/env node
// @ts-check
/**
 * Regenerates skills/vamos-ui/references/components.md and blocks.md.
 *
 * Source of truth, in order of preference:
 *   1. the built registry (apps/www/public/r/index.json + r/<name>.json), when present;
 *   2. the source files: apps/www/src/docs/entries/*.tsx, apps/www/src/blocks/<name>/meta.ts
 *      and registry/guidance/<name>.json.
 *
 * Usage:
 *   node skills/vamos-ui/scripts/build-catalog.mjs [--root <repo>] [--registry <dir>] [--out <dir>] [--source] [--check]
 *
 *   --root      repository root (default: three levels up from this file)
 *   --registry  registry directory (default: <root>/apps/www/public/r)
 *   --out       output directory (default: skills/vamos-ui/references)
 *   --source    ignore the registry and read the source files
 *   --check     do not write; exit 1 when the files on disk are out of date
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const HOMEPAGE = "https://ui.vamos.ist";

/**
 * @typedef {{ whenToUse: string[], avoidWhen: string[], related: string[], a11y?: string[] }} Guidance
 * @typedef {{ name: string, title: string, description: string, group: string, docs: string, guidance?: Guidance }} ComponentRow
 * @typedef {{ name: string, title: string, description: string, category: string, tags: string[], docs: string, guidance?: Guidance }} BlockRow
 * @typedef {{ components: ComponentRow[], blocks: BlockRow[], source: "registry" | "source" }} Catalog
 */

/** Group order on the docs site; unknown groups are appended alphabetically. */
export const GROUP_ORDER = [
  "Foundations",
  "Forms & inputs",
  "Pickers",
  "Overlays & feedback",
  "Navigation",
  "Page layouts",
  "Data display",
  "Charts",
  "Calendar & time",
  "Editors & drag-and-drop",
  "Flows & wizards",
  "Media",
  "Site blocks",
];

/** Block category order (mirrors apps/www/src/blocks/types.ts). */
export const CATEGORY_ORDER = [
  "App shells",
  "Dashboards",
  "Authentication",
  "List pages",
  "Detail pages",
  "Settings & forms",
  "Onboarding",
  "Empty & error states",
  "Website pages",
  "Marketing sections",
];

// ---------------------------------------------------------------- parsing

/**
 * Reads the JS string literal that starts at `start` (a quote character) and returns its value.
 * Handles "…", '…' and `…` (without interpolation) with backslash escapes.
 * @param {string} src
 * @param {number} start
 * @returns {string | null}
 */
export function readStringLiteral(src, start) {
  const quote = src[start];
  if (quote !== '"' && quote !== "'" && quote !== "`") return null;
  let out = "";
  for (let i = start + 1; i < src.length; i++) {
    const ch = src[i];
    if (ch === "\\") {
      const next = src[i + 1];
      i++;
      if (next === "n") out += "\n";
      else if (next === "t") out += "\t";
      else if (next === "u" && /^[0-9a-fA-F]{4}$/.test(src.slice(i + 1, i + 5))) {
        out += String.fromCharCode(parseInt(src.slice(i + 1, i + 5), 16));
        i += 4;
      } else if (next === "\n") continue;
      else out += next ?? "";
      continue;
    }
    if (ch === quote) return out;
    out += ch;
  }
  return null;
}

/**
 * Finds `key: "<literal>"` at or after `from` and returns the literal's value.
 * @param {string} src
 * @param {string} key
 * @param {number} [from]
 */
export function readStringProp(src, key, from = 0) {
  const re = new RegExp(`(?:^|[\\s,{])${key}\\s*:\\s*`, "g");
  re.lastIndex = from;
  const m = re.exec(src);
  if (!m) return undefined;
  const value = readStringLiteral(src, m.index + m[0].length);
  return value ?? undefined;
}

/**
 * Parses a docs entry file (apps/www/src/docs/entries/<slug>.tsx).
 * Fields are read after `slug:` so helper arrays above the entry (prop tables) are skipped.
 * @param {string} src
 * @returns {{ slug: string, title: string, group: string, description: string } | null}
 */
export function parseDocEntry(src) {
  const slugAt = src.search(/(?:^|[\s,{])slug\s*:/m);
  if (slugAt < 0) return null;
  const slug = readStringProp(src, "slug", slugAt);
  if (!slug) return null;
  return {
    slug,
    title: readStringProp(src, "title", slugAt) ?? slug,
    group: readStringProp(src, "group", slugAt) ?? "Other",
    description: collapse(readStringProp(src, "description", slugAt) ?? ""),
  };
}

/**
 * Parses a block meta file (apps/www/src/blocks/<name>/meta.ts).
 * @param {string} src
 * @returns {{ title: string, description: string, category: string, tags: string[] }}
 */
export function parseBlockMeta(src) {
  const tagsMatch = src.match(/tags\s*:\s*\[([^\]]*)\]/);
  const tags = tagsMatch ? [...tagsMatch[1].matchAll(/["'`]([^"'`]+)["'`]/g)].map((m) => m[1]) : [];
  return {
    title: readStringProp(src, "title") ?? "",
    description: collapse(readStringProp(src, "description") ?? ""),
    category: readStringProp(src, "category") ?? "Other",
    tags,
  };
}

/** @param {string} s */
function collapse(s) {
  return s.replace(/\s+/g, " ").trim();
}

/**
 * The first sentence of a description, capped at `max` characters on a word boundary.
 * @param {string} text
 * @param {number} [max]
 */
export function firstSentence(text, max = 150) {
  const clean = collapse(text);
  // A sentence ends at ". " followed by an uppercase letter or quote (avoids "e.g. foo").
  // Very short first sentences ("Triggers an action.") take the next one too.
  const sentences = clean.split(/(?<=[.!?])\s+(?=[A-Z“"(])/);
  let s = sentences[0] ?? "";
  for (let i = 1; i < sentences.length && s.length < 40; i++) s = `${s} ${sentences[i]}`;
  if (s.length > max) {
    const cut = s.slice(0, max);
    const space = cut.lastIndexOf(" ");
    s = `${(space > 60 ? cut.slice(0, space) : cut).replace(/[\s,;:—–-]+$/, "")}…`;
  }
  return s;
}

// ---------------------------------------------------------------- loading

/** @param {string} file */
function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

/**
 * @param {string} dir guidance directory
 * @param {string} name
 * @returns {Guidance | undefined}
 */
function readGuidance(dir, name) {
  const file = path.join(dir, `${name}.json`);
  return fs.existsSync(file) ? readJson(file) : undefined;
}

/**
 * Loads the catalog from a built registry directory.
 * @param {string} registryDir
 * @param {string} [guidanceDir] fallback guidance when an item has none
 * @returns {Catalog}
 */
export function loadFromRegistry(registryDir, guidanceDir) {
  const index = readJson(path.join(registryDir, "index.json"));
  /** @type {ComponentRow[]} */ const components = [];
  /** @type {BlockRow[]} */ const blocks = [];
  for (const item of index.items ?? []) {
    if (item.type !== "component" && item.type !== "block") continue;
    const itemFile = path.join(registryDir, `${item.name}.json`);
    const full = fs.existsSync(itemFile) ? readJson(itemFile) : item;
    const guidance = full.guidance ?? (guidanceDir ? readGuidance(guidanceDir, item.name) : undefined);
    const base = { name: item.name, title: item.title ?? item.name, description: collapse(item.description ?? ""), guidance };
    if (item.type === "component") {
      components.push({ ...base, group: item.group ?? "Other", docs: item.docs ?? `${HOMEPAGE}/docs/components/${item.name}` });
    } else {
      blocks.push({ ...base, category: item.category ?? "Other", tags: item.tags ?? [], docs: item.docs ?? `${HOMEPAGE}/blocks#${item.name}` });
    }
  }
  return { components, blocks, source: "registry" };
}

/**
 * Loads the catalog from the source files.
 * @param {string} root repository root
 * @returns {Catalog}
 */
export function loadFromSource(root) {
  const entriesDir = path.join(root, "apps/www/src/docs/entries");
  const blocksDir = path.join(root, "apps/www/src/blocks");
  const guidanceDir = path.join(root, "registry/guidance");
  /** @type {ComponentRow[]} */ const components = [];
  for (const file of fs.readdirSync(entriesDir).filter((f) => f.endsWith(".tsx")).sort()) {
    const entry = parseDocEntry(fs.readFileSync(path.join(entriesDir, file), "utf8"));
    if (!entry) continue;
    components.push({
      name: entry.slug,
      title: entry.title,
      description: entry.description,
      group: entry.group,
      docs: `${HOMEPAGE}/docs/components/${entry.slug}`,
      guidance: readGuidance(guidanceDir, entry.slug),
    });
  }
  /** @type {BlockRow[]} */ const blocks = [];
  for (const name of fs.readdirSync(blocksDir).sort()) {
    const metaFile = path.join(blocksDir, name, "meta.ts");
    if (!fs.existsSync(metaFile)) continue;
    const meta = parseBlockMeta(fs.readFileSync(metaFile, "utf8"));
    blocks.push({ name, ...meta, docs: `${HOMEPAGE}/blocks#${name}`, guidance: readGuidance(guidanceDir, name) });
  }
  return { components, blocks, source: "source" };
}

// ---------------------------------------------------------------- rendering

/** @param {string} s */
export function cell(s) {
  return s.replace(/\|/g, "\\|").replace(/\n+/g, " ").trim();
}

/**
 * @template T
 * @param {T[]} rows
 * @param {(row: T) => string} key
 * @param {string[]} order
 * @returns {[string, T[]][]}
 */
export function groupBy(rows, key, order) {
  /** @type {Map<string, T[]>} */ const map = new Map();
  for (const row of rows) {
    const k = key(row);
    if (!map.has(k)) map.set(k, []);
    /** @type {T[]} */ (map.get(k)).push(row);
  }
  const rank = (/** @type {string} */ k) => {
    const i = order.indexOf(k);
    return i < 0 ? order.length : i;
  };
  return [...map.entries()].sort(([a], [b]) => rank(a) - rank(b) || a.localeCompare(b));
}

/** @param {Guidance | undefined} g */
function useWhen(g) {
  return g?.whenToUse?.[0] ? cell(g.whenToUse[0]) : "—";
}
/** @param {Guidance | undefined} g */
function avoid(g) {
  return g?.avoidWhen?.[0] ? cell(g.avoidWhen[0]) : "—";
}
/** @param {string[] | undefined} names */
function relatedList(names) {
  return names?.length ? names.map((n) => `\`${n}\``).join(", ") : "—";
}

const GENERATED = "<!-- Generated by skills/vamos-ui/scripts/build-catalog.mjs — do not edit by hand. -->";

/**
 * @param {Catalog} catalog
 * @returns {string}
 */
export function renderComponents(catalog) {
  const lines = [
    GENERATED,
    "",
    "# Vamos UI — component catalog",
    "",
    `${catalog.components.length} components. Install any of them with \`npx vamos-ui add <name>\`; read the full API with \`npx vamos-ui view <name>\` or the MCP tool \`get_item\`. Each name links to its docs page.`,
    "",
    "Columns: **Use when** is the first whenToUse rule and **Avoid when** the first avoidWhen rule from registry/guidance/<name>.json; `get_item` returns all of them plus accessibility notes.",
    "",
  ];
  for (const [group, rows] of groupBy(catalog.components, (r) => r.group, GROUP_ORDER)) {
    lines.push(`## ${group}`, "", "| Name | What it is | Use when | Avoid when | Related |", "|---|---|---|---|---|");
    for (const row of [...rows].sort((a, b) => a.name.localeCompare(b.name))) {
      lines.push(
        `| [\`${row.name}\`](${row.docs}) | ${cell(firstSentence(row.description))} | ${useWhen(row.guidance)} | ${avoid(row.guidance)} | ${relatedList(row.guidance?.related)} |`,
      );
    }
    lines.push("");
  }
  return `${lines.join("\n").trimEnd()}\n`;
}

/**
 * @param {Catalog} catalog
 * @returns {string}
 */
export function renderBlocks(catalog) {
  const lines = [
    GENERATED,
    "",
    "# Vamos UI — block catalog",
    "",
    `${catalog.blocks.length} blocks — whole screens to start from. Install with \`npx vamos-ui add <name>\` (files land in \`blocksDir/<name>/\`, required components are installed too). Preview any block at https://ui.vamos.ist/view/<name>.`,
    "",
    "Pick the block whose screen is closest, then adapt the content to the real domain; do not compose a screen from scratch when a block fits. Tags: `cms`, `crm`, `hr`, `ops`, `site`, `any`.",
    "",
  ];
  for (const [category, rows] of groupBy(catalog.blocks, (r) => r.category, CATEGORY_ORDER)) {
    lines.push(`## ${category}`, "", "| Block | Screen | Use when | Avoid when | Built with |", "|---|---|---|---|---|");
    for (const row of [...rows].sort((a, b) => a.name.localeCompare(b.name))) {
      const tags = row.tags.length ? ` <sub>${row.tags.join(" · ")}</sub>` : "";
      lines.push(
        `| [\`${row.name}\`](${row.docs})${tags} | **${cell(row.title)}** — ${cell(firstSentence(row.description, 170))} | ${useWhen(row.guidance)} | ${avoid(row.guidance)} | ${relatedList(row.guidance?.related)} |`,
      );
    }
    lines.push("");
  }
  return `${lines.join("\n").trimEnd()}\n`;
}

/**
 * Names referenced in guidance `related` lists that are not catalog items.
 * @param {Catalog} catalog
 * @returns {string[]}
 */
export function findBrokenRelated(catalog) {
  const names = new Set([...catalog.components, ...catalog.blocks].map((r) => r.name));
  const broken = [];
  for (const row of [...catalog.components, ...catalog.blocks]) {
    for (const rel of row.guidance?.related ?? []) if (!names.has(rel)) broken.push(`${row.name} → ${rel}`);
  }
  return broken;
}

// ---------------------------------------------------------------- CLI

/** @param {string[]} argv */
export function parseArgs(argv) {
  /** @type {{ root?: string, registry?: string, out?: string, source: boolean, check: boolean, help: boolean }} */
  const args = { source: false, check: false, help: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--source") args.source = true;
    else if (a === "--check") args.check = true;
    else if (a === "--root" || a === "--registry" || a === "--out") {
      const value = argv[++i];
      if (!value) throw new Error(`${a} needs a value`);
      args[/** @type {"root" | "registry" | "out"} */ (a.slice(2))] = value;
    } else if (a === "-h" || a === "--help") {
      args.help = true;
    } else throw new Error(`Unknown option ${a}`);
  }
  return args;
}

/** @param {string[]} argv */
export function main(argv) {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const args = parseArgs(argv);
  if (args.help) {
    console.log("Usage: node build-catalog.mjs [--root <repo>] [--registry <dir>] [--out <dir>] [--source] [--check]");
    return 0;
  }
  const root = path.resolve(args.root ?? path.join(here, "../../.."));
  const registryDir = path.resolve(args.registry ?? path.join(root, "apps/www/public/r"));
  const outDir = path.resolve(args.out ?? path.join(here, "../references"));
  const useRegistry = !args.source && fs.existsSync(path.join(registryDir, "index.json"));
  const catalog = useRegistry ? loadFromRegistry(registryDir, path.join(root, "registry/guidance")) : loadFromSource(root);

  const files = { "components.md": renderComponents(catalog), "blocks.md": renderBlocks(catalog) };
  const missing = [...catalog.components, ...catalog.blocks].filter((r) => !r.guidance).map((r) => r.name);
  const broken = findBrokenRelated(catalog);
  const from = useRegistry ? path.relative(process.cwd(), registryDir) || "." : "source files";

  if (args.check) {
    const stale = Object.entries(files).filter(([name, text]) => {
      const file = path.join(outDir, name);
      return !fs.existsSync(file) || fs.readFileSync(file, "utf8") !== text;
    });
    if (stale.length) {
      console.error(`Out of date: ${stale.map(([n]) => n).join(", ")}. Run node skills/vamos-ui/scripts/build-catalog.mjs`);
      return 1;
    }
    console.log(`Catalog is up to date (${catalog.components.length} components, ${catalog.blocks.length} blocks, from ${from}).`);
    return 0;
  }

  fs.mkdirSync(outDir, { recursive: true });
  for (const [name, text] of Object.entries(files)) fs.writeFileSync(path.join(outDir, name), text);
  console.log(`Wrote ${path.relative(process.cwd(), outDir) || "."}/components.md (${catalog.components.length}) and blocks.md (${catalog.blocks.length}) from ${from}.`);
  if (missing.length) console.warn(`No guidance for ${missing.length}: ${missing.join(", ")} — add registry/guidance/<name>.json.`);
  if (broken.length) console.warn(`Unknown related names: ${broken.join(", ")}`);
  return 0;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  try {
    process.exitCode = main(process.argv.slice(2));
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
