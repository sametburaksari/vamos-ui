// @ts-check
/**
 * Builds the Vamos UI registry (static JSON) from the kit sources, docs entries and blocks.
 *
 *   packages/ui/src/**            → component / lib / style items (files, npm deps, item deps)
 *   apps/www/src/docs/entries/*   → one component item per docs entry (title, usage, props, examples)
 *   apps/www/src/docs/examples/** → examples[].code, verbatim
 *   apps/www/src/blocks/<name>/   → one block item per folder with meta.ts
 *   registry/guidance/<name>.json → guidance (optional)
 *
 * Pure: buildRegistry() reads the file system and returns data; writeRegistry() writes it.
 */
import fs from "node:fs";
import path from "node:path";
import { readBlockMetas } from "./blocks.mjs";
import { extractTokens } from "./css.mjs";
import { readDocEntries } from "./docs.mjs";
import { ModuleTree, isRelative, isTestFile, listFiles, packageName } from "./modules.mjs";
import { validateSchema } from "./json-schema.mjs";
import { AXES, axesDocument, configSchema, indexSchema, itemSchema } from "./schema.mjs";

const SHARED_DIR = "_shared";
const SHARED_ITEM = "blocks-shared";

export const REGISTRY_NAME = "vamos-ui";
/** Follows the kit: registry items are the @vamos-ui/react sources at this version. */
export const REGISTRY_VERSION = JSON.parse(fs.readFileSync(new URL("../../packages/ui/package.json", import.meta.url), "utf8")).version;
export const HOMEPAGE = "https://ui.vamos.ist";
export const STYLES = "styles";

/** Kit directories whose files are shared internals, published one lib item per file. */
const LIB_DIRS = ["lib/", "format/", "locales/"];

/**
 * @typedef {"component" | "block" | "lib" | "style"} ItemType
 * @typedef {{ path: string, content: string }} RegistryFile
 * @typedef {{ name: string, type: string, default?: string, description: string }} PropRow
 * @typedef {object} Guidance
 * @property {string[]} whenToUse
 * @property {string[]} avoidWhen
 * @property {string[]} related
 * @property {string[]} [a11y]
 * @typedef {object} RegistryItem
 * @property {string} name
 * @property {ItemType} type
 * @property {string} title
 * @property {string} description
 * @property {string} [group]
 * @property {string} [category]
 * @property {string[]} [tags]
 * @property {string} docs
 * @property {string[]} dependencies
 * @property {string[]} registryDependencies
 * @property {RegistryFile[]} files
 * @property {string} [usage]
 * @property {{ component: string, props: PropRow[] }[]} [props]
 * @property {{ title: string, description?: string, code: string }[]} [examples]
 * @property {Guidance} [guidance]
 * @typedef {Pick<RegistryItem, "name" | "type" | "title" | "description" | "group" | "category" | "tags" | "docs">} RegistryIndexItem
 */

/**
 * @typedef {object} BuildOptions
 * @property {string} root Repository root.
 * @property {string} [homepage]
 */

/**
 * @typedef {object} BuildResult
 * @property {RegistryItem[]} items Sorted by name.
 * @property {{ name: string, version: string, homepage: string, items: RegistryIndexItem[] }} index
 * @property {ReturnType<typeof extractTokens>} tokens
 * @property {ReturnType<typeof axesDocument>} axes
 * @property {string[]} warnings
 * @property {string[]} errors
 * @property {string[]} info Notes about how entries were split (not problems).
 * @property {{ version: string, files: { path: string, content: string }[] }} barrels
 *   The kit's own index files (pure re-export barrels plus lib/public.ts). Items never ship
 *   them; the CLI filters them down to the installed files to build a project's index files.
 * @property {{ path: string, content: string }[]} skill The agent skill (skills/vamos-ui: SKILL.md and
 *   references/*.md), published under r/skills/vamos-ui/ for `vamos-ui init --agent`.
 */

/** @param {string} file kit-relative path */
export function libItemName(file) {
  const stem = file.replace(/\.[^./]+$/, "").replace(/\/index$/, "");
  const slug = (stem.startsWith("lib/") ? stem.slice(4) : stem)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `lib-${slug}`;
}

/** Kebab/slug → "Title Case" fallback. @param {string} s */
const titleize = (s) => s.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

/** @param {string} text @param {number} max */
function firstSentence(text, max = 220) {
  const m = /^(.+?[.!?])(\s|$)/.exec(text);
  const s = (m ? m[1] : text).trim();
  return s.length > max ? s.slice(0, max - 1).trimEnd() + "…" : s;
}

/** @param {BuildOptions} options @returns {BuildResult} */
export function buildRegistry(options) {
  const root = path.resolve(options.root);
  const homepage = options.homepage ?? HOMEPAGE;
  const kitDir = path.join(root, "packages/ui/src");
  const blocksDir = path.join(root, "apps/www/src/blocks");
  const entriesDir = path.join(root, "apps/www/src/docs/entries");
  const examplesDir = path.join(root, "apps/www/src/docs/examples");
  const guidanceDir = path.join(root, "registry/guidance");

  /** @type {string[]} */
  const warnings = [];
  /** @type {string[]} */
  const errors = [];
  const warn = (/** @type {string} */ m) => warnings.push(m);
  /** @type {string[]} */
  const info = [];
  const error = (/** @type {string} */ m) => errors.push(m);

  // ── Package metadata ──────────────────────────────────────────────────────────────────────
  const pkg = JSON.parse(fs.readFileSync(path.join(root, "packages/ui/package.json"), "utf8"));
  /** @type {Record<string, string>} */
  const npmRanges = { ...(pkg.dependencies ?? {}) };
  const peers = new Set(Object.keys(pkg.peerDependencies ?? {}));
  const selfName = /** @type {string} */ (pkg.name);
  /** subpath ("" = root) → kit-relative entry file */
  /** @type {Map<string, string>} */
  const subpaths = new Map();
  for (const [key, target] of Object.entries(pkg.exports ?? {})) {
    if (typeof target !== "string" || !target.startsWith("./src/")) continue;
    subpaths.set(key === "." ? "" : key.slice(2), target.slice("./src/".length));
  }

  // ── Sources ───────────────────────────────────────────────────────────────────────────────
  const kit = new ModuleTree(kitDir);
  const blockTree = new ModuleTree(blocksDir);
  const entries = readDocEntries(entriesDir, root, warn);
  const blockMetas = readBlockMetas(blocksDir, warn);

  /** @param {string} spec @returns {string | undefined} kit file for a "@vamos-ui/react/…" specifier */
  const kitEntryFor = (spec) => {
    if (spec === selfName) return subpaths.get("");
    const sub = spec.slice(selfName.length + 1);
    if (subpaths.has(sub)) return subpaths.get(sub);
    for (const [key, target] of subpaths) {
      if (!key.includes("*")) continue;
      const [pre, post] = key.split("*");
      if (sub.startsWith(pre) && sub.endsWith(post)) return target.replace("*", sub.slice(pre.length, sub.length - post.length));
    }
    return undefined;
  };

  // ── Ownership ─────────────────────────────────────────────────────────────────────────────
  /** kit file → owning item name */
  /** @type {Map<string, string>} */
  const owner = new Map();
  /** item name → files it owns, in declaration order */
  /** @type {Map<string, string[]>} */
  const owned = new Map();
  /** @type {Map<string, ItemType>} */
  const itemTypes = new Map();
  const claim = (/** @type {string} */ file, /** @type {string} */ item, /** @type {ItemType} */ type) => {
    const previous = owner.get(file);
    if (previous && previous !== item) owned.set(previous, (owned.get(previous) ?? []).filter((f) => f !== file));
    owner.set(file, item);
    itemTypes.set(item, type);
    const list = owned.get(item) ?? [];
    if (!list.includes(file)) list.push(file);
    owned.set(item, list);
  };
  /** One lib item per module; two modules must never map to the same item name. */
  const claimLib = (/** @type {string} */ file) => {
    const name = libItemName(file);
    const taken = owned.get(name)?.find((f) => f !== file);
    if (taken || (itemTypes.has(name) && itemTypes.get(name) !== "lib")) error(`lib item name "${name}" for ${file} collides with ${taken ?? `the ${itemTypes.get(name)} item`}`);
    else claim(file, name, "lib");
  };
  const isBarrel = (/** @type {string} */ f) => /(^|\/)index\.[cm]?[jt]sx?$/.test(f) && kit.get(f).pureBarrel;
  const isCss = (/** @type {string} */ f) => f.endsWith(".css");
  const isLibFile = (/** @type {string} */ f) => LIB_DIRS.some((d) => f.startsWith(d));

  // styles
  itemTypes.set(STYLES, "style");
  owned.set(STYLES, []);
  for (const f of [...kit.files].filter((f) => f === "styles.css" || (f.startsWith("styles/") && isCss(f))).sort((a, b) => (a === "styles.css" ? -1 : b === "styles.css" ? 1 : a.localeCompare(b)))) {
    claim(f, STYLES, "style");
  }
  for (const f of kit.files) if (isCss(f) && !owner.has(f)) warn(`packages/ui/src/${f}: CSS outside styles/ is not published`);
  // lib/, format/, locales/
  for (const f of kit.files) if (isLibFile(f) && !isCss(f) && !isBarrel(f)) claimLib(f);

  // ── Kit import edges (barrel-aware) ───────────────────────────────────────────────────────
  /** @type {Map<string, { targets: string[], npm: string[], unresolved: { spec: string, line: number }[], css: boolean }>} */
  const edgeCache = new Map();
  /** Resolved kit files `f` imports; imports through a pure barrel go to the declaring files. */
  const edges = (/** @type {string} */ f) => {
    let e = edgeCache.get(f);
    if (e) return e;
    e = { targets: [], npm: [], unresolved: [], css: false };
    for (const imp of kit.get(f).imports) {
      if (!isRelative(imp.spec)) {
        if (imp.spec === selfName || imp.spec.startsWith(selfName + "/")) error(`packages/ui/src/${f}:${imp.line} imports its own package "${imp.spec}"; use a relative import`);
        else e.npm.push(imp.spec);
        continue;
      }
      const target = kit.resolve(f, imp.spec);
      if (!target) {
        e.unresolved.push({ spec: imp.spec, line: imp.line });
        continue;
      }
      if (isCss(target)) {
        e.css = true;
        continue;
      }
      if (!isBarrel(target)) {
        e.targets.push(target);
        continue;
      }
      for (const name of imp.names) {
        const ts = name === "*" ? kit.barrelTargets(target) : [kit.declarationOf(target, name)];
        for (const t of ts) {
          if (!t) e.unresolved.push({ spec: `${imp.spec} (${name})`, line: imp.line });
          else if (t.startsWith("npm:")) e.npm.push(t.slice(4));
          else e.targets.push(t);
        }
      }
    }
    edgeCache.set(f, e);
    return e;
  };

  // ── Docs entries: ownership ───────────────────────────────────────────────────────────────
  // An entry owns its primary source (the first listed kit module) plus the other listed modules
  // its primary actually imports. Listed modules it does not import ("extras") are published as
  // their own items and become registry dependencies of the entry, so `add <entry>` installs
  // everything the docs page documents. Modules another entry owns, or that several entries list
  // (e.g. a shared schema registry), are cross-references: dependencies only when imported.
  /** @type {Map<string, string>} */
  const primaryOf = new Map();
  /** @type {Map<string, string[]>} file → entries listing it as a secondary source */
  const secondaryClaims = new Map();
  for (const e of entries) {
    if (itemTypes.has(e.slug)) error(`${e.file}: item name "${e.slug}" is already used by a ${itemTypes.get(e.slug)} item`);
    itemTypes.set(e.slug, "component");
    owned.set(e.slug, []);
    let primaryTaken = false;
    for (const src of e.source) {
      if (!kit.has(src)) {
        error(`${e.file}: source "${src}" does not exist in packages/ui/src`);
        continue;
      }
      if (isCss(src) || isLibFile(src) || isBarrel(src)) continue;
      if (!primaryTaken) {
        primaryTaken = true;
        if (!primaryOf.has(src)) {
          primaryOf.set(src, e.slug);
          continue;
        }
      }
      if (!secondaryClaims.has(src)) secondaryClaims.set(src, []);
      /** @type {string[]} */ (secondaryClaims.get(src)).push(e.slug);
    }
  }
  for (const [file, slug] of primaryOf) claim(file, slug, "component");
  /** @type {Map<string, Set<string>>} entry → listed modules it does not own (dependencies) */
  const extras = new Map();
  for (const e of entries) {
    const mine = (owned.get(e.slug) ?? [])[0];
    // Files reachable from the primary without crossing another item's files.
    const reachable = new Set();
    if (mine) {
      const queue = [mine];
      while (queue.length) {
        const f = /** @type {string} */ (queue.shift());
        for (const t of edges(f).targets) {
          const o = owner.get(t);
          if (reachable.has(t) || (o && o !== e.slug)) continue;
          reachable.add(t);
          queue.push(t);
        }
      }
    }
    for (const src of e.source) {
      if (!kit.has(src) || isCss(src) || isLibFile(src) || isBarrel(src) || src === mine) continue;
      const claims = secondaryClaims.get(src) ?? [];
      // Modules owned by another entry are cross-references: a dependency only if imported.
      if (owner.has(src) || claims.length !== 1) continue;
      if (reachable.has(src)) claim(src, e.slug, "component");
      else {
        if (!extras.has(e.slug)) extras.set(e.slug, new Set());
        /** @type {Set<string>} */ (extras.get(e.slug)).add(src);
      }
    }
  }

  // ── Blocks: own files, block deps, kit references ─────────────────────────────────────────
  const blockNames = new Set(blockMetas.map((b) => b.name));
  for (const b of blockMetas) {
    if (itemTypes.has(b.name)) error(`block "${b.name}" has the same name as a ${itemTypes.get(b.name)} item`);
    itemTypes.set(b.name, "block");
  }
  /** @type {Map<string, { files: string[], blockDeps: Set<string>, kitRefs: Set<string>, npm: Set<string> }>} */
  const blockGraphs = new Map();
  // apps/www/src/blocks/_shared: fixtures and helpers several blocks import. Published once as the
  // lib item "blocks-shared" (files under blocks/_shared/), which those blocks depend on.
  const sharedDir = path.join(blocksDir, SHARED_DIR);
  const sharedFiles = fs.existsSync(sharedDir)
    ? fs.readdirSync(sharedDir).filter((f) => /\.tsx?$/.test(f) && !/\.test\.tsx?$/.test(f)).sort().map((f) => `${SHARED_DIR}/${f}`)
    : [];
  const sharedMeta = sharedFiles.length ? { name: SHARED_DIR, files: sharedFiles } : null;
  for (const b of sharedMeta ? [...blockMetas, sharedMeta] : blockMetas) {
    /** @type {string[]} */
    const files = [];
    const blockDeps = new Set();
    const kitRefs = new Set();
    const npm = new Set();
    /** @type {string[]} */
    const queue = [];
    const visit = (/** @type {string} */ f) => {
      const folder = f.split("/")[0];
      if (folder !== b.name) {
        if (folder === SHARED_DIR) blockDeps.add(SHARED_ITEM);
        else if (blockNames.has(folder)) blockDeps.add(folder);
        else error(`block ${b.name}: "${f}" is outside any block folder and cannot be published`);
        return;
      }
      if (files.includes(f)) return;
      files.push(f);
      queue.push(f);
    };
    for (const f of b.files) {
      if (!blockTree.has(f)) error(`blocks/${b.name}/meta.ts: listed file "${f}" does not exist`);
      else visit(f);
    }
    if (b.name === SHARED_DIR) {
      // no page: a lib of shared files
    } else if (blockTree.has(`${b.name}/page.tsx`)) visit(`${b.name}/page.tsx`);
    else error(`block ${b.name}: page.tsx is missing`);
    while (queue.length) {
      const f = /** @type {string} */ (queue.shift());
      for (const imp of blockTree.get(f).imports) {
        if (isRelative(imp.spec)) {
          const target = blockTree.resolve(f, imp.spec);
          if (!target) error(`blocks/${f}:${imp.line} cannot resolve "${imp.spec}"`);
          else if (target.endsWith("/meta.ts") || target === "types.ts") error(`blocks/${f}:${imp.line} imports "${imp.spec}" (site-only metadata)`);
          else visit(target);
        } else if (imp.spec === selfName || imp.spec.startsWith(selfName + "/")) {
          if (imp.spec.endsWith(".css")) {
            blockDeps.add(STYLES);
            continue;
          }
          const entry = kitEntryFor(imp.spec);
          if (!entry || !kit.has(entry)) {
            error(`blocks/${f}:${imp.line} "${imp.spec}" is not an export of ${selfName}`);
            continue;
          }
          for (const name of imp.names) {
            const targets = name === "*" ? kit.barrelTargets(entry) : [kit.declarationOf(entry, name)];
            for (const t of targets) {
              if (!t) error(`blocks/${f}:${imp.line} "${name}" is not exported by ${imp.spec}`);
              else if (t.startsWith("npm:")) npm.add(t.slice(4));
              else kitRefs.add(t);
            }
          }
        } else npm.add(imp.spec);
      }
    }
    blockGraphs.set(b.name, { files, blockDeps, kitRefs, npm });
  }

  // ── Kit closures with promotion of shared internals to lib items ─────────────────────────
  /**
   * Walks relative imports from `item`'s owned files. Unowned files are included; files owned by
   * another item end the walk and become a registry dependency.
   * @param {string} item
   */
  const closure = (item) => {
    const files = [...(owned.get(item) ?? [])];
    const included = new Set(files);
    /** @type {Set<string>} */
    const deps = new Set();
    /** @type {Set<string>} */
    const npm = new Set();
    /** @type {Map<string, Set<string>>} included unowned file → importers */
    const importers = new Map();
    /** @type {{ from: string, spec: string, line: number }[]} */
    const unresolved = [];
    const queue = [...files];
    while (queue.length) {
      const f = /** @type {string} */ (queue.shift());
      const e = edges(f);
      for (const s of e.npm) npm.add(s);
      for (const u of e.unresolved) unresolved.push({ from: f, ...u });
      if (e.css) deps.add(STYLES);
      for (const t of e.targets) {
        const o = owner.get(t);
        if (o && o !== item) {
          deps.add(o);
          continue;
        }
        if (!o) {
          if (!importers.has(t)) importers.set(t, new Set());
          /** @type {Set<string>} */ (importers.get(t)).add(f);
        }
        if (!included.has(t)) {
          included.add(t);
          files.push(t);
          queue.push(t);
        }
      }
    }
    deps.delete(item);
    return { files, deps, npm, importers, unresolved };
  };

  const kitItems = () => [...itemTypes.entries()].filter(([, t]) => t !== "block").map(([n]) => n).sort();
  /** Files a block imports through the package entry points. */
  const blockRefs = () => {
    const out = new Set();
    for (const g of blockGraphs.values()) for (const t of g.kitRefs) out.add(t);
    return out;
  };
  /** @type {Map<string, ReturnType<typeof closure>>} */
  let closures = new Map();
  const settle = () => {
    for (let round = 0; round < 100; round++) {
      closures = new Map(kitItems().map((n) => [n, closure(n)]));
      /** @type {Map<string, Set<string>>} unowned file → items that include it */
      const reach = new Map();
      /** @type {Map<string, Set<string>>} */
      const importersOf = new Map();
      for (const [name, c] of closures) {
        for (const [f, imps] of c.importers) {
          if (!reach.has(f)) reach.set(f, new Set());
          /** @type {Set<string>} */ (reach.get(f)).add(name);
          if (!importersOf.has(f)) importersOf.set(f, new Set());
          for (const i of imps) /** @type {Set<string>} */ (importersOf.get(f)).add(i);
        }
      }
      const external = new Set([...blockRefs()].filter((f) => !owner.has(f)));
      for (const [, xs] of extras) for (const f of xs) if (!owner.has(f)) external.add(f);
      const candidates = new Set([...reach].filter(([, s]) => s.size > 1).map(([f]) => f));
      for (const f of external) candidates.add(f);
      if (!candidates.size) return;
      // Promote the top-most shared files first; their own imports may then stay private.
      let promote = [...candidates].filter((f) => external.has(f) || [...(importersOf.get(f) ?? [])].some((i) => !candidates.has(i)));
      if (!promote.length) promote = [...candidates];
      for (const f of promote.sort()) claimLib(f);
    }
    error("internal: ownership did not settle after 100 rounds");
  };
  settle();

  // Kit modules nothing reaches (no docs entry, no importer): publish them as lib items anyway.
  const reached = new Set();
  for (const c of closures.values()) for (const f of c.files) reached.add(f);
  const isEmptyModule = (/** @type {string} */ f) => {
    const m = kit.get(f);
    return !m.imports.length && !m.localExports.size;
  };
  const orphans = [...kit.files].filter((f) => !reached.has(f) && !isBarrel(f) && !isCss(f) && !isEmptyModule(f));
  if (orphans.length) {
    warn(`${orphans.length} kit module(s) have no docs entry and no importer; published as lib items: ${orphans.join(", ")}`);
    for (const f of orphans) claimLib(f);
    settle();
  }

  // Umbrella entries (extras + a primary other items import): the primary moves to its own lib
  // item so importers do not pull the whole umbrella (e.g. every site block → "blocks-api").
  {
    const refs = blockRefs();
    let changed = false;
    for (const e of entries) {
      const own = closures.get(e.slug);
      // Only extras the entry's code does not already depend on make it an umbrella.
      const added = [...(extras.get(e.slug) ?? [])].filter((f) => {
        const o = owner.get(f);
        return o && o !== e.slug && !own?.deps.has(o);
      });
      if (!added.length) continue;
      const files = owned.get(e.slug) ?? [];
      const usedElsewhere = files.some((f) => refs.has(f)) || [...closures].some(([n, c]) => n !== e.slug && c.deps.has(e.slug));
      if (!usedElsewhere || !files.length) continue;
      const lib = libItemName(files[0]);
      for (const f of [...files]) claim(f, lib, "lib");
      owned.set(e.slug, []);
      (extras.get(e.slug) ?? new Set()).add(files[0]);
      changed = true;
    }
    if (changed) settle();
  }
  for (const [name, c] of closures) {
    if (itemTypes.get(name) === "component" && !(owned.get(name) ?? []).length) {
      info.push(`docs entry "${name}" is an umbrella: no files of its own, depends on ${[...(extras.get(name) ?? [])].map((f) => owner.get(f)).join(", ")}`);
    }
  }

  // ── Assemble items ───────────────────────────────────────────────────────────────────────
  /** @param {Iterable<string>} specs @param {string} who */
  const npmDeps = (specs, who) => {
    const out = new Set();
    for (const spec of specs) {
      if (spec.startsWith("node:")) continue;
      const name = packageName(spec);
      if (peers.has(name)) continue;
      const range = npmRanges[name];
      if (!range) {
        warn(`${who}: imports "${spec}", which is not a dependency of ${selfName}; listed without a version`);
        out.add(name);
      } else out.add(`${name}@${range}`);
    }
    return [...out].sort();
  };
  const readKit = (/** @type {string} */ f) => kit.get(f).code;
  const docsUrl = (/** @type {string} */ p) => `${homepage}${p}`;

  /** @type {Map<string, Guidance>} */
  const guidance = new Map();
  if (fs.existsSync(guidanceDir)) {
    for (const f of listFiles(guidanceDir, (r) => r.endsWith(".json") && !r.includes("/"))) {
      const name = f.replace(/\.json$/, "");
      try {
        const g = readGuidance(JSON.parse(fs.readFileSync(path.join(guidanceDir, f), "utf8")));
        if (!g) warn(`registry/guidance/${f}: expected { whenToUse, avoidWhen, related } string arrays; ignored`);
        else guidance.set(name, g);
      } catch (e) {
        warn(`registry/guidance/${f}: invalid JSON (${/** @type {Error} */ (e).message}); ignored`);
      }
    }
  }

  /** @type {RegistryItem[]} */
  const items = [];
  const examplesCache = new Map();
  const readExample = (/** @type {string} */ file, /** @type {string} */ who) => {
    if (!examplesCache.has(file)) {
      const abs = path.join(examplesDir, file);
      examplesCache.set(file, fs.existsSync(abs) ? fs.readFileSync(abs, "utf8") : undefined);
    }
    const code = examplesCache.get(file);
    if (code === undefined) error(`${who}: example file "${file}" not found in apps/www/src/docs/examples`);
    return code;
  };

  for (const name of kitItems()) {
    const c = /** @type {ReturnType<typeof closure>} */ (closures.get(name));
    const type = /** @type {ItemType} */ (itemTypes.get(name));
    for (const u of c.unresolved) error(`packages/ui/src/${u.from}:${u.line} cannot resolve "${u.spec}" (item ${name})`);
    const ownFirst = [...(owned.get(name) ?? [])];
    const rest = c.files.filter((f) => !ownFirst.includes(f)).sort();
    const files = [...ownFirst, ...rest].map((f) => ({ path: f, content: readKit(f) }));
    const registryDependencies = new Set(c.deps);
    if (type === "component") registryDependencies.add(STYLES);
    for (const f of extras.get(name) ?? []) {
      const o = owner.get(f);
      if (o) registryDependencies.add(o);
    }
    registryDependencies.delete(name);

    if (type === "component") {
      const e = /** @type {import("./docs.mjs").DocEntryData} */ (entries.find((x) => x.slug === name));
      /** @type {RegistryItem["examples"]} */
      const examples = [];
      for (const ex of [e.demo, ...e.examples]) {
        if (!ex) continue;
        const code = readExample(ex.file, e.file);
        if (code !== undefined) examples.push({ title: ex.title, ...(ex.description ? { description: ex.description } : {}), code });
      }
      items.push(
        compact({
          name,
          type,
          title: e.title,
          description: e.description,
          group: e.group,
          tags: e.covers.length ? [...new Set(e.covers)].sort() : undefined,
          docs: docsUrl(`/docs/components/${name}`),
          dependencies: npmDeps(c.npm, name),
          registryDependencies: [...registryDependencies].sort(),
          files,
          usage: e.usage || undefined,
          props: e.api.length ? e.api.map((g) => ({ component: g.name, props: g.props })) : undefined,
          examples: examples.length ? examples : undefined,
          guidance: guidance.get(name),
        }),
      );
    } else if (type === "style") {
      items.push({
        name,
        type,
        title: "Styles & tokens",
        description: "Design tokens for the five theme axes (theme, material, accent, density, font), Tailwind v4 theme mapping and the component CSS. Import once after Tailwind.",
        docs: docsUrl("/docs/installation"),
        dependencies: [],
        registryDependencies: [],
        files,
        usage: `/* app stylesheet */\n@import "tailwindcss";\n@import "./components/vamos/styles.css";\n\n<html class="dark" data-material="glass" data-accent="ocean" data-density="comfortable" data-font="editorial">`,
        ...(guidance.has(name) ? { guidance: guidance.get(name) } : {}),
      });
    } else {
      const main = ownFirst[0];
      const comment = main ? kit.get(main).leadingComment : undefined;
      items.push(
        compact({
          name,
          type,
          title: main ?? name,
          description: comment ? firstSentence(comment) : `Shared internal module (${main}) used by other Vamos UI items.`,
          docs: docsUrl("/docs/installation"),
          dependencies: npmDeps(c.npm, name),
          registryDependencies: [...registryDependencies].sort(),
          files,
          guidance: guidance.get(name),
        }),
      );
    }
  }

  for (const b of blockMetas) {
    const g = /** @type {NonNullable<ReturnType<typeof blockGraphs.get>>} */ (blockGraphs.get(b.name));
    const deps = new Set([...g.blockDeps, STYLES]);
    for (const t of g.kitRefs) {
      const o = owner.get(t);
      if (o) deps.add(o);
      else error(`block ${b.name}: kit file "${t}" has no registry item`);
    }
    deps.delete(b.name);
    const main = g.files[0];
    const rel = main.slice(b.name.length + 1).replace(/\.tsx?$/, "");
    items.push(
      compact({
        name: b.name,
        type: /** @type {const} */ ("block"),
        title: b.title,
        description: b.description,
        category: b.category,
        tags: b.tags.length ? [...b.tags].sort() : undefined,
        docs: docsUrl(`/blocks#${b.name}`),
        dependencies: npmDeps(g.npm, `block ${b.name}`),
        registryDependencies: [...deps].sort(),
        files: g.files.map((f) => ({ path: `blocks/${f}`, content: blockTree.get(f).code })),
        usage: `import Page from "@/components/blocks/${b.name}/${rel}";\n\nexport default function Route() {\n  return <Page />;\n}`,
        guidance: guidance.get(b.name),
      }),
    );
  }

  if (sharedMeta) {
    const g = /** @type {NonNullable<ReturnType<typeof blockGraphs.get>>} */ (blockGraphs.get(SHARED_DIR));
    const deps = new Set([STYLES]);
    for (const t of g.kitRefs) {
      const o = owner.get(t);
      if (o) deps.add(o);
      else error(`${SHARED_ITEM}: kit file "${t}" has no registry item`);
    }
    items.push(
      compact({
        name: SHARED_ITEM,
        // "block" so its files install next to the blocks (components/blocks/_shared) and resolve as block paths.
        type: /** @type {const} */ ("block"),
        title: "Shared block data",
        category: "Shared",
        tags: ["internal"],
        docs: docsUrl("/blocks"),
        description: "Fictional fixtures (people, companies, products, orders, tickets…) and formatting helpers shared by the admin blocks.",
        dependencies: npmDeps(g.npm, SHARED_ITEM),
        registryDependencies: [...deps].sort(),
        files: g.files.map((f) => ({ path: `blocks/${f}`, content: blockTree.get(f).code })),
      }),
    );
  }

  items.sort((a, b) => a.name.localeCompare(b.name));

  // ── Integrity checks ─────────────────────────────────────────────────────────────────────
  const names = new Set(items.map((i) => i.name));
  for (const item of items) {
    for (const d of item.registryDependencies) if (!names.has(d)) error(`${item.name}: registry dependency "${d}" does not exist`);
    const paths = new Set();
    for (const f of item.files) {
      if (paths.has(f.path)) error(`${item.name}: duplicate file "${f.path}"`);
      paths.add(f.path);
    }
    if (!item.files.length && !item.registryDependencies.length) error(`${item.name}: has neither files nor registry dependencies`);
  }
  // Each kit file is written by exactly one item (otherwise two items fight over a path).
  /** @type {Map<string, string>} */
  const writer = new Map();
  for (const item of items) {
    for (const f of item.files) {
      const prev = writer.get(f.path);
      if (prev) error(`file "${f.path}" is published by both "${prev}" and "${item.name}"`);
      else writer.set(f.path, item.name);
    }
  }
  // Every import of every published file resolves inside the item plus its dependencies.
  const itemsByName = new Map(items.map((i) => [i.name, i]));
  for (const item of items) {
    const all = dependencyClosure(item.name, itemsByName);
    const kitPaths = new Set();
    const blockPaths = new Set();
    for (const n of all) for (const f of itemsByName.get(n)?.files ?? []) (itemsByName.get(n)?.type === "block" ? blockPaths : kitPaths).add(f.path);
    const need = (/** @type {string} */ file, /** @type {string} */ spec, /** @type {string} */ target) => {
      error(`${item.name}: ${file} imports "${spec}", but ${target} is not installed by "${item.name}" or its registry dependencies`);
    };
    for (const f of item.files) {
      if (item.type === "block") {
        const rel = f.path.slice("blocks/".length);
        for (const imp of blockTree.get(rel).imports) {
          if (isRelative(imp.spec)) {
            const t = blockTree.resolve(rel, imp.spec);
            if (t && !blockPaths.has(`blocks/${t}`)) need(f.path, imp.spec, `blocks/${t}`);
          } else if (imp.spec === selfName || imp.spec.startsWith(selfName + "/")) {
            if (imp.spec.endsWith(".css")) {
              if (!all.has(STYLES)) need(f.path, imp.spec, STYLES);
              continue;
            }
            const entry = kitEntryFor(imp.spec);
            if (!entry) continue; // reported above
            for (const name of imp.names) {
              for (const t of name === "*" ? kit.barrelTargets(entry) : [kit.declarationOf(entry, name)]) {
                if (t && !t.startsWith("npm:") && !kitPaths.has(t)) need(f.path, `${imp.spec} (${name})`, t);
              }
            }
          }
        }
        continue;
      }
      for (const imp of kit.get(f.path).imports) {
        if (!isRelative(imp.spec)) continue;
        const t = kit.resolve(f.path, imp.spec);
        if (!t) continue; // reported as unresolved
        if (isCss(t)) {
          if (!all.has(STYLES)) need(f.path, imp.spec, STYLES);
        } else if (isBarrel(t)) {
          for (const name of imp.names) {
            for (const d of name === "*" ? kit.barrelTargets(t) : [kit.declarationOf(t, name)]) {
              if (d && !d.startsWith("npm:") && !kitPaths.has(d)) need(f.path, `${imp.spec} (${name})`, d);
            }
          }
        } else if (!kitPaths.has(t)) need(f.path, imp.spec, t);
      }
    }
    const schemaErrors = validateSchema(item, itemSchema());
    for (const m of schemaErrors.slice(0, 5)) error(`${item.name}: schema ${m}`);
  }
  for (const m of validateSchema({ name: REGISTRY_NAME, version: REGISTRY_VERSION, homepage, items: items.map(toIndexItem) }, indexSchema()).slice(0, 5)) error(`index.json: schema ${m}`);
  for (const g of guidance.keys()) if (!names.has(g)) warn(`registry/guidance/${g}.json: no item named "${g}"`);
  // Naming rule: the other registry's name must never appear. Spelled in parts so this file passes its own grep.
  const banned = new RegExp(["sha", "dcn"].join(""), "i");
  for (const item of items) {
    const where = [item.title, item.description, item.usage ?? "", ...item.files.map((f) => f.content), ...(item.examples ?? []).map((e) => e.code)].find((t) => banned.test(t));
    if (where !== undefined) error(`${item.name}: contains a forbidden product name (naming rule)`);
  }

  const tokens = extractTokens(readKit("styles.css"));
  for (const axis of AXES) {
    if (axis.attribute === "class") continue;
    for (const v of axis.values) {
      if (v === axis.default && axis.name === "material") continue;
      if (!tokens.some((t) => t.overrides.some((o) => o.selector.includes(`[${axis.attribute}="${v}"]`))) && v !== axis.default) {
        warn(`styles.css: axis value ${axis.attribute}="${v}" overrides no token`);
      }
    }
  }

  const barrelPaths = [...kit.files].filter((f) => isBarrel(f) || f === "lib/public.ts").sort();
  const barrels = { version: REGISTRY_VERSION, files: barrelPaths.map((f) => ({ path: f, content: readKit(f) })) };
  for (const b of barrels.files) if (banned.test(b.content)) error(`${b.path}: contains a forbidden product name (naming rule)`);

  /** @type {{ path: string, content: string }[]} */
  const skill = [];
  const skillDir = path.join(root, "skills/vamos-ui");
  if (fs.existsSync(path.join(skillDir, "SKILL.md"))) {
    skill.push({ path: "SKILL.md", content: fs.readFileSync(path.join(skillDir, "SKILL.md"), "utf8") });
    const refDir = path.join(skillDir, "references");
    if (fs.existsSync(refDir)) {
      for (const f of fs.readdirSync(refDir).filter((f) => f.endsWith(".md")).sort()) {
        skill.push({ path: `references/${f}`, content: fs.readFileSync(path.join(refDir, f), "utf8") });
      }
    }
    for (const f of skill) if (banned.test(f.content)) error(`skills/vamos-ui/${f.path}: contains a forbidden product name (naming rule)`);
  }

  return {
    items,
    barrels,
    skill,
    index: { name: REGISTRY_NAME, version: REGISTRY_VERSION, homepage, items: items.map(toIndexItem) },
    tokens,
    axes: axesDocument(),
    warnings,
    errors,
    info,
  };
}

/**
 * The item plus every item it needs, transitively.
 * @param {string} name
 * @param {Map<string, RegistryItem>} byName
 * @returns {Set<string>}
 */
export function dependencyClosure(name, byName) {
  const out = new Set([name]);
  const queue = [name];
  while (queue.length) {
    const n = /** @type {string} */ (queue.shift());
    for (const d of byName.get(n)?.registryDependencies ?? []) {
      if (!out.has(d)) {
        out.add(d);
        queue.push(d);
      }
    }
  }
  return out;
}

/** @param {RegistryItem} i @returns {RegistryIndexItem} */
export function toIndexItem(i) {
  return compact({ name: i.name, type: i.type, title: i.title, description: i.description, group: i.group, category: i.category, tags: i.tags, docs: i.docs });
}

/**
 * Drops undefined properties (keeps key order).
 * @template {Record<string, unknown>} T
 * @param {T} obj
 * @returns {T}
 */
function compact(obj) {
  return /** @type {T} */ (Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)));
}

/** @param {unknown} raw @returns {Guidance | undefined} */
export function readGuidance(raw) {
  if (!raw || typeof raw !== "object") return undefined;
  const r = /** @type {Record<string, unknown>} */ (raw);
  const list = (/** @type {unknown} */ v) => (Array.isArray(v) && v.every((s) => typeof s === "string") ? /** @type {string[]} */ (v) : undefined);
  const whenToUse = list(r.whenToUse);
  const avoidWhen = list(r.avoidWhen);
  const related = list(r.related);
  if (!whenToUse || !avoidWhen || !related) return undefined;
  const a11y = list(r.a11y);
  return { whenToUse, avoidWhen, related, ...(a11y ? { a11y } : {}) };
}

/** @param {unknown} value */
export const stableJson = (value) => JSON.stringify(value, null, 2) + "\n";

/**
 * Writes the registry into `outDir`, removing stale JSON from earlier builds.
 * @param {BuildResult} result
 * @param {string} outDir
 * @returns {{ files: number, bytes: number, byType: Record<string, number> }}
 */
export function writeRegistry(result, outDir) {
  fs.mkdirSync(outDir, { recursive: true });
  /** @type {Map<string, string>} */
  const out = new Map();
  for (const item of result.items) out.set(`${item.name}.json`, stableJson(item));
  out.set("index.json", stableJson(result.index));
  out.set("schema.json", stableJson(itemSchema()));
  out.set("index-schema.json", stableJson(indexSchema()));
  out.set("config-schema.json", stableJson(configSchema()));
  out.set("tokens.json", stableJson(result.tokens));
  out.set("axes.json", stableJson(result.axes));
  if (result.barrels) out.set("barrels.json", stableJson(result.barrels));
  for (const f of fs.readdirSync(outDir)) if (f.endsWith(".json") && !out.has(f)) fs.rmSync(path.join(outDir, f));
  let bytes = 0;
  for (const [f, content] of [...out].sort(([a], [b]) => a.localeCompare(b))) {
    const abs = path.join(outDir, f);
    bytes += Buffer.byteLength(content);
    if (!fs.existsSync(abs) || fs.readFileSync(abs, "utf8") !== content) fs.writeFileSync(abs, content);
  }
  if (result.skill?.length) {
    const skillOut = path.join(outDir, "skills/vamos-ui");
    const keep = new Set(result.skill.map((f) => f.path));
    if (fs.existsSync(skillOut)) {
      for (const f of fs.readdirSync(skillOut, { recursive: true }).map(String)) {
        const abs = path.join(skillOut, f);
        if (f.endsWith(".md") && !keep.has(f.split(path.sep).join("/")) && fs.statSync(abs).isFile()) fs.rmSync(abs);
      }
    }
    for (const f of result.skill) {
      const abs = path.join(skillOut, f.path);
      fs.mkdirSync(path.dirname(abs), { recursive: true });
      bytes += Buffer.byteLength(f.content);
      if (!fs.existsSync(abs) || fs.readFileSync(abs, "utf8") !== f.content) fs.writeFileSync(abs, f.content);
    }
  }
  /** @type {Record<string, number>} */
  const byType = {};
  for (const i of result.items) byType[i.type] = (byType[i.type] ?? 0) + 1;
  return { files: out.size, bytes, byType };
}
