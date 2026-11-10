import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export const INDEX_HEADER = "// Maintained by vamos-ui: regenerated on every add/upgrade. Do not edit by hand.";

/** Folders that are never public entry points of their own. */
const SKIP_DIRS = new Set(["components", "lib", "styles", "locales", "node_modules"]);
const SKIP_FILE = /(\.test|\.spec|\.stories)\.[jt]sx?$|^_|^test-(utils|fixtures|setup)\.|\.d\.ts$/;

interface ExportNames {
  values: string[];
  types: string[];
}

/** Regex-level export scan. Good enough to detect name clashes between sibling files. */
export function collectExports(code: string): ExportNames {
  const values = new Set<string>();
  const types = new Set<string>();
  const src = code.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");
  for (const m of src.matchAll(/export\s+(?:declare\s+)?(?:async\s+)?(?:const|let|var|function\*?|class|abstract\s+class|enum)\s+([A-Za-z_$][\w$]*)/g)) values.add(m[1]!);
  for (const m of src.matchAll(/export\s+(?:declare\s+)?(?:type|interface)\s+([A-Za-z_$][\w$]*)/g)) types.add(m[1]!);
  for (const m of src.matchAll(/export\s+(type\s+)?\{([^}]*)\}/g)) {
    const allTypes = !!m[1];
    for (const part of m[2]!.split(",")) {
      const p = part.trim();
      if (!p) continue;
      const isType = allTypes || p.startsWith("type ");
      const name = p.replace(/^type\s+/, "").split(/\s+as\s+/).pop()!.trim();
      if (name === "default") continue;
      (isType ? types : values).add(name);
    }
  }
  return { values: [...values], types: [...types] };
}

/**
 * Builds an index that re-exports every module. Uses `export *` unless two files
 * export the same name; then the later file gets explicit exports without the clash.
 */
export function buildIndex(modules: { spec: string; code: string }[]): string {
  const taken = new Set<string>();
  const lines: string[] = [INDEX_HEADER];
  for (const mod of modules) {
    const ex = collectExports(mod.code);
    const all = [...ex.values, ...ex.types];
    const clash = all.some((n) => taken.has(n));
    if (!clash) {
      lines.push(`export * from "${mod.spec}";`);
    } else {
      const values = ex.values.filter((n) => !taken.has(n));
      const types = ex.types.filter((n) => !taken.has(n) && !ex.values.includes(n));
      if (values.length) lines.push(`export { ${values.join(", ")} } from "${mod.spec}";`);
      if (types.length) lines.push(`export type { ${types.join(", ")} } from "${mod.spec}";`);
    }
    all.forEach((n) => taken.add(n));
  }
  return lines.join("\n") + "\n";
}

function isOurs(file: string): boolean {
  if (!existsSync(file)) return true;
  return readFileSync(file, "utf8").startsWith(INDEX_HEADER);
}

function sourceFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => /\.(tsx?|jsx?)$/.test(f) && !/^index\.[jt]sx?$/.test(f) && !SKIP_FILE.test(f))
    .sort();
}

const spec = (f: string) => `./${f.replace(/\.(tsx?|jsx?)$/, "")}`;

export interface IndexResult {
  written: string[];
  /** Hand-written index files that were left alone. */
  kept: string[];
}

export interface IndexOptions {
  /**
   * The kit's own index files (kit-relative path → source), from the registry's barrels.json.
   * When given, each project index is the kit's index filtered down to the installed files,
   * so curated re-exports (`export { z } from "zod"`, `../blocks/rich-text`) keep working.
   */
  barrels?: Record<string, string>;
  /** Project-relative files that registry items own (from the lockfile). Never regenerated. */
  owned?: Set<string>;
}

const SOURCE_EXTS = [".ts", ".tsx", ".js", ".jsx"];

/** One `export … from "…"` statement of a barrel. */
interface BarrelStatement {
  text: string;
  spec: string;
}

/** Splits a pure re-export barrel into its `export … from` statements (comments dropped). */
export function barrelStatements(code: string): BarrelStatement[] {
  const src = code.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " ")).replace(/^\s*\/\/.*$/gm, "");
  const out: BarrelStatement[] = [];
  const re = /^[ \t]*export\b[^;]*?\bfrom\s*(["'])([^"']+)\1\s*;?/gm;
  for (const m of src.matchAll(re)) out.push({ text: m[0].trim().replace(/;?$/, ";"), spec: m[2]! });
  return out;
}

/** Relative module specifier from one kit folder to a kit file (no extension). */
function relSpec(fromDir: string, kitFile: string): string {
  let r = path.posix.relative(fromDir || ".", kitFile).replace(/\.(tsx?|jsx?)$/, "").replace(/\/index$/, "");
  if (!r.startsWith(".")) r = `./${r}`;
  return r;
}

/**
 * Index files built from the kit's barrels: keeps the statements whose target is installed,
 * inlines non-index barrels the project does not have (lib/public.ts → root index), and keeps
 * npm re-exports (`export { z } from "zod"`) only when something else in the index survives.
 */
async function refreshFromBarrels(root: string, base: string, barrels: Record<string, string>, owned: Set<string>, result: IndexResult): Promise<void> {
  const projRel = (kitRel: string) => path.relative(root, path.join(base, kitRel)).split(path.sep).join("/");
  /** Generated index files that ended up with content (kit-relative). */
  const generated = new Set<string>();
  const isFile = (kitRel: string) => existsSync(path.join(base, kitRel)) && statSync(path.join(base, kitRel)).isFile();

  /** Kit-relative file a specifier from `dir` points to, if it is available in the project. */
  const resolveLocal = (dir: string, spec: string): string | null => {
    const target = path.posix.normalize(path.posix.join(dir || ".", spec));
    for (const ext of SOURCE_EXTS) {
      const f = `${target}${ext}`;
      if (!/(^|\/)index\.[jt]sx?$/.test(f) && isFile(f)) return f;
    }
    for (const ext of SOURCE_EXTS) {
      const f = `${target}/index${ext}`;
      if (generated.has(f) || (isFile(f) && (owned.has(projRel(f)) || !isOurs(path.join(base, f))))) return f;
    }
    return null;
  };
  /** The barrel a specifier points to, when the project does not have that file itself. */
  const barrelFor = (dir: string, spec: string): string | null => {
    const target = path.posix.normalize(path.posix.join(dir || ".", spec));
    for (const ext of SOURCE_EXTS) {
      if (barrels[`${target}${ext}`] !== undefined && !/(^|\/)index\.[jt]sx?$/.test(`${target}${ext}`)) return `${target}${ext}`;
    }
    return null;
  };

  const expand = (dir: string, code: string, seen: Set<string>): string[] => {
    const lines: string[] = [];
    const npm: string[] = [];
    let local = 0;
    for (const st of barrelStatements(code)) {
      if (!st.spec.startsWith(".")) {
        npm.push(st.text);
        continue;
      }
      if (resolveLocal(dir, st.spec)) {
        lines.push(st.text);
        local++;
        continue;
      }
      const inner = barrelFor(dir, st.spec);
      if (inner && !seen.has(inner)) {
        const innerDir = path.posix.dirname(inner) === "." ? "" : path.posix.dirname(inner);
        const nested = expand(innerDir, barrels[inner]!, new Set([...seen, inner]));
        // Re-point the inlined statements at paths relative to this folder.
        for (const line of nested) {
          lines.push(
            line.replace(/(\bfrom\s*)(["'])([^"']+)\2/, (_m, lead: string, q: string, spec: string) =>
              spec.startsWith(".") ? `${lead}${q}${relSpec(dir, path.posix.join(innerDir || ".", spec))}${q}` : `${lead}${q}${spec}${q}`,
            ),
          );
          local++;
        }
      }
    }
    return local ? [...npm, ...lines] : [];
  };

  // Deepest folders first, so a parent can re-export a child index generated in this run.
  const indexes = Object.keys(barrels)
    .filter((f) => /(^|\/)index\.[jt]sx?$/.test(f))
    .sort((a, b) => b.split("/").length - a.split("/").length || a.localeCompare(b));
  for (const kitIndex of indexes) {
    const dir = path.posix.dirname(kitIndex) === "." ? "" : path.posix.dirname(kitIndex);
    const file = path.join(base, dir, "index.ts");
    const rel = projRel(path.posix.join(dir, "index.ts"));
    if (dir && !existsSync(path.join(base, dir))) continue;
    if (owned.has(rel)) continue; // a real module shipped by an item (next/index.ts …)
    const body = expand(dir, barrels[kitIndex]!, new Set([kitIndex]));
    if (!body.length) continue;
    if (!isOurs(file)) {
      result.kept.push(rel);
      continue;
    }
    generated.add(path.posix.join(dir, "index.ts"));
    const next = [INDEX_HEADER, ...body].join("\n") + "\n";
    if (existsSync(file) && readFileSync(file, "utf8") === next) continue;
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, next);
    result.written.push(rel);
  }
}

/**
 * Regenerates <uiDir>/index.ts (lib/public + every components/*.tsx) and an index
 * for every sub-folder that mirrors a kit subpath (charts, data-table, format …).
 * Index files without the vamos-ui header are treated as user-owned and kept.
 * With `barrels` (the registry's copy of the kit's index files) the indexes mirror the kit's
 * curated exports; without it they fall back to `export *` of every file.
 */
export async function refreshIndexes(root: string, uiDir: string, opts: IndexOptions = {}): Promise<IndexResult> {
  const base = path.join(root, uiDir);
  const result: IndexResult = { written: [], kept: [] };
  if (!existsSync(base)) return result;
  if (opts.barrels && Object.keys(opts.barrels).length) {
    await refreshFromBarrels(root, base, opts.barrels, opts.owned ?? new Set(), result);
    return result;
  }
  const write = async (dir: string, modules: { spec: string; code: string }[]) => {
    const file = path.join(dir, "index.ts");
    const rel = path.relative(root, file).split(path.sep).join("/");
    if (!isOurs(file)) {
      result.kept.push(rel);
      return;
    }
    if (!modules.length) return;
    const next = buildIndex(modules);
    if (existsSync(file) && readFileSync(file, "utf8") === next) return;
    await mkdir(dir, { recursive: true });
    await writeFile(file, next);
    result.written.push(rel);
  };

  const rootModules: { spec: string; code: string }[] = [];
  const pub = ["lib/public.ts", "lib/public.tsx"].find((f) => existsSync(path.join(base, f)));
  if (pub) rootModules.push({ spec: "./lib/public", code: readFileSync(path.join(base, pub), "utf8") });
  for (const f of sourceFiles(path.join(base, "components"))) {
    rootModules.push({ spec: `./components/${spec(f).slice(2)}`, code: readFileSync(path.join(base, "components", f), "utf8") });
  }
  await write(base, rootModules);

  const walk = async (dir: string, depth: number) => {
    for (const entry of readdirSync(dir).sort()) {
      const abs = path.join(dir, entry);
      if (entry.startsWith(".") || !statSync(abs).isDirectory()) continue;
      if (depth === 0 && SKIP_DIRS.has(entry)) continue;
      const files = sourceFiles(abs);
      await write(
        abs,
        files.map((f) => ({ spec: spec(f), code: readFileSync(path.join(abs, f), "utf8") })),
      );
      if (depth < 3) await walk(abs, depth + 1);
    }
  };
  await walk(base, 0);
  return result;
}
