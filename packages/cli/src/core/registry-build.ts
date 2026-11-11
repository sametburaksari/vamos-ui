/**
 * `vamos-ui registry build`: turns a folder of components into a registry anyone can host.
 *
 *   my-registry/
 *     registry.json            optional: name, homepage, version and per-item overrides
 *     package.json             optional: version ranges for npm imports
 *     components/stat-card.tsx → item "stat-card" (type component)
 *     lib/format-money.ts      → item "format-money" (type lib)
 *     blocks/kpi-board/*       → item "kpi-board" (type block, every file in the folder)
 *
 * Output (default <dir>/r): one <name>.json per item plus index.json, in the same format as
 * https://ui.vamos.ist/r, validated with the same item schema. Imports are read to fill in
 * dependencies: relative imports of another item become "./<item>", bare imports become npm
 * dependencies with the range from package.json. Nothing is executed.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { externalIndexSchema, externalItemSchema, NAME_PATTERN, validateSchema } from "./schema";
import type { ItemType, RegistryIndexItem, RegistryItem } from "./types";

export const MANIFEST_FILE = "registry.json";
const SOURCE_EXT = /\.(tsx?|jsx?|mts|mjs|css)$/;
const SKIP_FILE = /\.(test|spec|stories)\.[^.]+$|\.d\.ts$/;
/** Provided by the app; never listed as item dependencies. */
const PEER_PACKAGES = new Set(["react", "react-dom", "next", "@vamos-ui/react"]);
const KIT = "@vamos-ui/react";

export interface ManifestItem {
  name: string;
  type?: ItemType;
  title?: string;
  description?: string;
  /** Paths relative to the registry folder. Defaults to the discovered files. */
  files?: string[];
  dependencies?: string[];
  registryDependencies?: string[];
  docs?: string;
  group?: string;
  category?: string;
  tags?: string[];
  usage?: string;
  examples?: { title: string; description?: string; code: string }[];
}

export interface Manifest {
  name?: string;
  homepage?: string;
  version?: string;
  items?: ManifestItem[];
}

export interface BuildOptions {
  dir: string;
  homepage?: string;
  name?: string;
}

export interface BuildResult {
  items: RegistryItem[];
  index: { name: string; version: string; homepage: string; items: RegistryIndexItem[] };
  errors: string[];
  warnings: string[];
}

const toPosix = (p: string) => p.split(path.sep).join("/");
const titleize = (s: string) => s.replace(/[-_]+/g, " ").replace(/^\w/, (c) => c.toUpperCase());
const kebab = (s: string) =>
  s
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

function listFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || entry.name === "node_modules") continue;
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listFiles(abs));
    else if (SOURCE_EXT.test(entry.name) && !SKIP_FILE.test(entry.name)) out.push(abs);
  }
  return out.sort();
}

/** Discovers items from the folder layout. */
export function discoverItems(dir: string): ManifestItem[] {
  const items: ManifestItem[] = [];
  for (const [folder, type] of [["components", "component"], ["lib", "lib"]] as const) {
    const base = path.join(dir, folder);
    if (!existsSync(base)) continue;
    for (const entry of readdirSync(base, { withFileTypes: true })) {
      if (entry.name.startsWith(".")) continue;
      if (entry.isFile() && SOURCE_EXT.test(entry.name) && !SKIP_FILE.test(entry.name) && !/^index\./.test(entry.name)) {
        items.push({ name: kebab(entry.name.replace(/\.[^.]+$/, "")), type, files: [`${folder}/${entry.name}`] });
      } else if (entry.isDirectory()) {
        // components/<name>/… is one item with every file in the folder
        const files = listFiles(path.join(base, entry.name)).map((f) => toPosix(path.relative(dir, f)));
        if (files.length) items.push({ name: kebab(entry.name), type, files });
      }
    }
  }
  const blocks = path.join(dir, "blocks");
  if (existsSync(blocks)) {
    for (const entry of readdirSync(blocks, { withFileTypes: true })) {
      if (!entry.isDirectory() || entry.name.startsWith(".")) continue;
      const files = listFiles(path.join(blocks, entry.name)).map((f) => toPosix(path.relative(dir, f)));
      if (files.length) items.push({ name: kebab(entry.name), type: "block", files });
    }
  }
  return items.sort((a, b) => a.name.localeCompare(b.name));
}

/** Module specifiers a source file imports (static, dynamic, re-exports, CSS @import). */
export function importsOf(code: string): { spec: string; names: string[] }[] {
  const out: { spec: string; names: string[] }[] = [];
  const clean = code.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");
  for (const m of clean.matchAll(/\b(?:import|export)\s+(?:type\s+)?([\s\S]*?)\s*from\s*["']([^"']+)["']/g)) {
    const names = [...(m[1]!.match(/\{([\s\S]*?)\}/)?.[1] ?? "").split(",")].map((n) => n.trim().replace(/^type\s+/, "").split(/\s+as\s+/)[0]!.trim()).filter(Boolean);
    out.push({ spec: m[2]!, names });
  }
  for (const m of clean.matchAll(/\bimport\s*["']([^"']+)["']/g)) out.push({ spec: m[1]!, names: [] });
  for (const m of clean.matchAll(/\bimport\s*\(\s*["']([^"']+)["']\s*\)/g)) out.push({ spec: m[1]!, names: [] });
  for (const m of clean.matchAll(/@import\s+(?:url\()?["']([^"']+)["']/g)) out.push({ spec: m[1]!, names: [] });
  return out;
}

function packageOf(spec: string): string {
  const parts = spec.split("/");
  return spec.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0]!;
}

const RESOLVE_EXT = ["", ".tsx", ".ts", ".jsx", ".js", ".mts", ".mjs", ".css", "/index.tsx", "/index.ts", "/index.js"];

function readJson(file: string): any {
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

/** Builds the registry in memory. Pure apart from reading `dir`. */
export function buildThirdPartyRegistry(opts: BuildOptions): BuildResult {
  const dir = path.resolve(opts.dir);
  const errors: string[] = [];
  const warnings: string[] = [];
  const manifestPath = path.join(dir, MANIFEST_FILE);
  const manifest: Manifest = existsSync(manifestPath) ? (readJson(manifestPath) ?? (errors.push(`${MANIFEST_FILE} is not valid JSON.`), {})) : {};
  const pkg = readJson(path.join(dir, "package.json")) ?? {};
  const ranges: Record<string, string> = { ...pkg.peerDependencies, ...pkg.devDependencies, ...pkg.dependencies };

  const homepage = opts.homepage ?? manifest.homepage ?? (typeof pkg.homepage === "string" ? pkg.homepage : undefined);
  if (!homepage || !/^https?:\/\//.test(homepage)) errors.push(`A homepage URL is required (docs links point to it): set "homepage" in ${MANIFEST_FILE} or pass --homepage https://…`);
  const name = opts.name ?? manifest.name ?? (typeof pkg.name === "string" ? kebab(pkg.name.replace(/^@[^/]+\//, "")) : kebab(path.basename(dir)));
  if (!new RegExp(NAME_PATTERN).test(name)) errors.push(`Registry name "${name}" must be lower-case letters, digits and dashes.`);
  const version = manifest.version ?? (typeof pkg.version === "string" ? pkg.version : "0.1.0");

  // Discovered items, then manifest entries override or add.
  const byName = new Map<string, ManifestItem>();
  for (const it of discoverItems(dir)) byName.set(it.name, it);
  for (const it of manifest.items ?? []) {
    if (!it || typeof it.name !== "string") {
      errors.push(`${MANIFEST_FILE}: every item needs a "name".`);
      continue;
    }
    byName.set(it.name, { ...byName.get(it.name), ...it });
  }
  if (!byName.size) errors.push(`No items found in ${dir}. Put components in components/, helpers in lib/, screens in blocks/<name>/, or list them in ${MANIFEST_FILE}.`);

  // Which item owns each file, for relative imports between items.
  const owner = new Map<string, string>();
  for (const it of byName.values()) {
    for (const f of it.files ?? []) {
      const rel = path.posix.normalize(f.replace(/\\/g, "/"));
      if (rel.startsWith("../") || path.posix.isAbsolute(rel)) errors.push(`${it.name}: file "${f}" is outside the registry folder.`);
      else if (!existsSync(path.join(dir, rel))) errors.push(`${it.name}: file "${f}" does not exist.`);
      else if (owner.has(rel) && owner.get(rel) !== it.name) errors.push(`"${f}" belongs to both ${owner.get(rel)} and ${it.name}.`);
      else owner.set(rel, it.name);
    }
  }

  const items: RegistryItem[] = [];
  for (const it of [...byName.values()].sort((a, b) => a.name.localeCompare(b.name))) {
    const files = (it.files ?? []).map((f) => path.posix.normalize(f.replace(/\\/g, "/"))).filter((f) => owner.get(f) === it.name);
    const deps = new Set<string>(it.dependencies ?? []);
    const regDeps = new Set<string>(it.registryDependencies ?? []);
    const kitNames = new Set<string>();
    let description = it.description;
    const contents = new Map<string, string>();
    const itemType = it.type ?? "component";
    for (const rel of files) {
      let code = readFileSync(path.join(dir, rel), "utf8");
      const original = code;
      if (description === undefined) {
        const doc = /^\s*(?:["']use client["'];?\s*)?(?:import[^\n]*\n\s*)*\/\*\*([\s\S]*?)\*\//.exec(code)?.[1];
        if (doc) description = doc.replace(/^\s*\*\s?/gm, "").replace(/@\w+[\s\S]*$/, "").trim().split(/\n\s*\n/)[0]!.replace(/\s+/g, " ");
      }
      for (const { spec, names } of importsOf(code)) {
        if (spec.startsWith(".")) {
          const target = path.posix.normalize(path.posix.join(path.posix.dirname(rel), spec));
          const hit = RESOLVE_EXT.map((e) => target + e).find((c) => owner.has(c));
          if (hit) {
            const other = byName.get(owner.get(hit)!)!;
            if (other.name !== it.name) regDeps.add(`./${other.name}`);
            // Blocks install to blocksDir, everything else to uiDir: a block reaches the kit folder
            // through the kit import, which the CLI rewrites to the project's alias.
            if (itemType === "block" && (other.type ?? "component") !== "block") {
              const kitPath = hit.replace(/\.(tsx?|jsx?|mts|mjs)$/, "").replace(/\/index$/, "");
              const esc = spec.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
              code = code.replace(new RegExp(`(["'])${esc}\\1`, "g"), `$1${KIT}/${kitPath}$1`);
            } else if (itemType !== "block" && (other.type ?? "component") === "block") {
              errors.push(`${it.name}: ${rel} imports a block file ("${spec}"); only blocks may import blocks.`);
            }
          } else if (RESOLVE_EXT.some((e) => existsSync(path.join(dir, target + e)) && statSync(path.join(dir, target + e)).isFile())) {
            errors.push(`${it.name}: ${rel} imports "${spec}", which is not part of any item. Add it to an item's files.`);
          } else errors.push(`${it.name}: ${rel} imports "${spec}", which does not exist.`);
          continue;
        }
        if (spec.startsWith("node:") || spec.startsWith("@/") || spec.startsWith("~/")) {
          if (!spec.startsWith("node:")) warnings.push(`${it.name}: ${rel} imports "${spec}" (a project alias); use relative imports so the item works in any project.`);
          continue;
        }
        const pkgName = packageOf(spec);
        if (pkgName === KIT) {
          names.forEach((n) => kitNames.add(n));
          continue;
        }
        if (PEER_PACKAGES.has(pkgName) || /^(tailwindcss|tw-animate-css)$/.test(pkgName)) continue;
        if ([...deps].some((d) => d === pkgName || d.startsWith(`${pkgName}@`))) continue;
        const range = ranges[pkgName];
        if (range && !/^(workspace|file|link|git|https?):/.test(range)) deps.add(`${pkgName}@${range}`);
        else {
          deps.add(pkgName);
          warnings.push(`${it.name}: no version range for "${pkgName}" in package.json; it will install the latest version.`);
        }
      }
      contents.set(rel, code === original ? original : code);
    }
    if (kitNames.size && !(it.registryDependencies ?? []).length) {
      const guesses = [...kitNames].filter((n) => /^[A-Z]/.test(n)).map(kebab);
      warnings.push(`${it.name}: imports ${[...kitNames].join(", ")} from ${KIT}. List the Vamos UI items it needs in registryDependencies (e.g. ${JSON.stringify([...new Set(guesses)].slice(0, 3))}) in ${MANIFEST_FILE}.`);
    }
    const item: RegistryItem = {
      name: it.name,
      type: it.type ?? "component",
      title: it.title ?? titleize(it.name),
      description: description ?? "",
      ...(it.group ? { group: it.group } : {}),
      ...(it.category ? { category: it.category } : {}),
      ...(it.tags?.length ? { tags: it.tags } : {}),
      docs: it.docs ?? homepage ?? "",
      dependencies: [...deps].sort(),
      registryDependencies: [...regDeps].sort(),
      files: files.map((f) => ({ path: f, content: contents.get(f) ?? readFileSync(path.join(dir, f), "utf8") })),
      ...(it.usage ? { usage: it.usage } : {}),
      ...(it.examples?.length ? { examples: it.examples } : {}),
    };
    if (!item.files.length) errors.push(`${it.name}: no files.`);
    if (item.type === "block" && item.files.some((f) => !f.path.startsWith(`blocks/${item.name}/`))) {
      warnings.push(`${it.name}: block files outside blocks/${item.name}/ are installed into the block's folder.`);
    }
    if (!item.description) warnings.push(`${it.name}: no description (add a /** … */ comment at the top of the file or "description" in ${MANIFEST_FILE}).`);
    if (homepage) for (const e of validateSchema(item, externalItemSchema())) errors.push(`${it.name}: ${e}`);
    items.push(item);
  }

  const index = {
    name,
    version,
    homepage: homepage ?? "",
    items: items.map((i) => ({
      name: i.name,
      type: i.type,
      title: i.title,
      description: i.description,
      ...(i.group ? { group: i.group } : {}),
      ...(i.category ? { category: i.category } : {}),
      ...(i.tags ? { tags: i.tags } : {}),
      docs: i.docs,
    })),
  };
  if (homepage) for (const e of validateSchema(index, externalIndexSchema())) errors.push(`index.json: ${e}`);
  return { items, index, errors: [...new Set(errors)], warnings: [...new Set(warnings)] };
}

const stableJson = (value: unknown) => JSON.stringify(value, null, 2) + "\n";

export async function writeThirdPartyRegistry(result: BuildResult, outDir: string): Promise<{ files: number; bytes: number }> {
  await mkdir(outDir, { recursive: true });
  let bytes = 0;
  const write = async (file: string, value: unknown) => {
    const text = stableJson(value);
    bytes += Buffer.byteLength(text);
    await writeFile(path.join(outDir, file), text);
  };
  for (const item of result.items) await write(`${item.name}.json`, item);
  await write("index.json", result.index);
  return { files: result.items.length + 1, bytes };
}
