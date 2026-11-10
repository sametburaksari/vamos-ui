// @ts-check
/**
 * Reads apps/www/src/docs/entries/*.tsx statically (no execution) into plain data.
 */
import fs from "node:fs";
import path from "node:path";
import { UNKNOWN, collectConsts, evaluate, findDefaultExport, lineOf, parseSource } from "./ts-static.mjs";

/**
 * @typedef {{ id: string, title: string, file: string, description?: string }} DocExample
 * @typedef {{ name: string, type: string, default?: string, description: string }} DocProp
 * @typedef {object} DocEntryData
 * @property {string} slug
 * @property {string} title
 * @property {string} group
 * @property {string} description
 * @property {string[]} source
 * @property {string} [basedOn]
 * @property {string} usage
 * @property {DocExample | undefined} demo
 * @property {DocExample[]} examples
 * @property {{ name: string, props: DocProp[] }[]} api
 * @property {string[]} notes
 * @property {string[]} covers
 * @property {string} file Entry file, relative to the repo root.
 */

/**
 * @param {string} entriesDir absolute
 * @param {string} repoRoot absolute
 * @param {(msg: string) => void} warn
 * @returns {DocEntryData[]}
 */
export function readDocEntries(entriesDir, repoRoot, warn) {
  const files = fs.readdirSync(entriesDir).filter((f) => f.endsWith(".tsx") && f !== "index.tsx").sort();
  return files.map((f) => readDocEntry(path.join(entriesDir, f), repoRoot, warn));
}

/**
 * @param {string} abs
 * @param {string} repoRoot
 * @param {(msg: string) => void} warn
 * @returns {DocEntryData}
 */
export function readDocEntry(abs, repoRoot, warn) {
  const rel = path.relative(repoRoot, abs).split(path.sep).join("/");
  const sf = parseSource(abs, fs.readFileSync(abs, "utf8"));
  const expr = findDefaultExport(sf);
  if (!expr) throw new Error(`${rel}: no default-exported entry object found`);
  const exHelper = (/** @type {unknown[]} */ [id, title, file, _Component, description]) => ({ id, title, file, ...(typeof description === "string" ? { description } : {}) });
  const raw = /** @type {Record<string, unknown>} */ (
    evaluate(expr, {
      sourceFile: sf,
      consts: collectConsts(sf),
      calls: { ex: exHelper },
      onUnknown: (node, reason) => warn(`${rel}:${lineOf(node, sf)} ${reason} — value left out`),
    })
  );
  if (!raw || typeof raw !== "object") throw new Error(`${rel}: entry is not a static object`);

  const str = (/** @type {string} */ key, required = true) => {
    const v = raw[key];
    if (typeof v === "string") return v;
    if (required) throw new Error(`${rel}: "${key}" must be a static string`);
    return undefined;
  };
  const strings = (/** @type {string} */ key) => (Array.isArray(raw[key]) ? /** @type {unknown[]} */ (raw[key]).filter((s) => typeof s === "string") : []);
  const example = (/** @type {unknown} */ v) => {
    if (!v || typeof v !== "object") return undefined;
    const e = /** @type {Record<string, unknown>} */ (v);
    if (typeof e.id !== "string" || typeof e.title !== "string" || typeof e.file !== "string") return undefined;
    return /** @type {DocExample} */ ({ id: e.id, title: e.title, file: e.file, ...(typeof e.description === "string" ? { description: e.description } : {}) });
  };
  const api = Array.isArray(raw.api)
    ? /** @type {unknown[]} */ (raw.api).flatMap((g) => {
        if (!g || typeof g !== "object") return [];
        const group = /** @type {Record<string, unknown>} */ (g);
        if (typeof group.name !== "string" || !Array.isArray(group.props)) return [];
        const props = /** @type {unknown[]} */ (group.props).flatMap((p) => {
          if (!p || typeof p !== "object") return [];
          const pr = /** @type {Record<string, unknown>} */ (p);
          if (typeof pr.name !== "string" || typeof pr.type !== "string") return [];
          return [
            /** @type {DocProp} */ ({
              name: pr.name,
              type: pr.type,
              ...(typeof pr.default === "string" ? { default: pr.default } : {}),
              description: typeof pr.description === "string" ? pr.description : "",
            }),
          ];
        });
        return [{ name: group.name, props }];
      })
    : [];

  const slug = /** @type {string} */ (str("slug"));
  const expectedSlug = path.basename(abs, ".tsx");
  if (slug !== expectedSlug) warn(`${rel}: slug "${slug}" differs from the file name "${expectedSlug}"`);
  const examples = Array.isArray(raw.examples) ? /** @type {unknown[]} */ (raw.examples).map(example).filter((e) => e !== undefined) : [];
  if (raw.examples !== undefined && raw.examples !== UNKNOWN && Array.isArray(raw.examples) && examples.length !== raw.examples.length) {
    warn(`${rel}: ${raw.examples.length - examples.length} example(s) could not be read statically`);
  }
  return {
    slug,
    title: /** @type {string} */ (str("title")),
    group: /** @type {string} */ (str("group")),
    description: /** @type {string} */ (str("description")),
    source: strings("source"),
    basedOn: str("basedOn", false),
    usage: str("usage", false) ?? "",
    demo: example(raw.demo),
    examples,
    api,
    notes: strings("notes"),
    covers: strings("covers"),
    file: rel,
  };
}
