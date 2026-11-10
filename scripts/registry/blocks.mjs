// @ts-check
/**
 * Reads apps/www/src/blocks/<name>/meta.ts statically.
 */
import fs from "node:fs";
import path from "node:path";
import { collectConsts, evaluate, findDefaultExport, lineOf, parseSource } from "./ts-static.mjs";

/**
 * @typedef {object} BlockMetaData
 * @property {string} name Folder name.
 * @property {string} title
 * @property {string} description
 * @property {string} category
 * @property {string[]} files Paths relative to the blocks dir, main file first.
 * @property {number} order
 * @property {string[]} tags
 */

/**
 * @param {string} blocksDir absolute
 * @param {(msg: string) => void} warn
 * @returns {BlockMetaData[]}
 */
export function readBlockMetas(blocksDir, warn) {
  const names = fs
    .readdirSync(blocksDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && fs.existsSync(path.join(blocksDir, d.name, "meta.ts")))
    .map((d) => d.name)
    .sort();
  return names.map((name) => {
    const rel = `${name}/meta.ts`;
    const sf = parseSource(rel, fs.readFileSync(path.join(blocksDir, rel), "utf8"));
    const expr = findDefaultExport(sf);
    if (!expr) throw new Error(`blocks/${rel}: no default-exported meta object`);
    const raw = /** @type {Record<string, unknown>} */ (
      evaluate(expr, { sourceFile: sf, consts: collectConsts(sf), calls: {}, onUnknown: (n, r) => warn(`blocks/${rel}:${lineOf(n, sf)} ${r}`) })
    );
    const s = (/** @type {string} */ k) => {
      if (typeof raw[k] !== "string") throw new Error(`blocks/${rel}: "${k}" must be a static string`);
      return /** @type {string} */ (raw[k]);
    };
    const list = (/** @type {string} */ k) => (Array.isArray(raw[k]) ? /** @type {unknown[]} */ (raw[k]).filter((v) => typeof v === "string") : []);
    const files = /** @type {string[]} */ (list("files"));
    if (!files.length) warn(`blocks/${rel}: meta.files is empty; using ${name}/page.tsx`);
    return {
      name,
      title: s("title"),
      description: s("description"),
      category: s("category"),
      files: files.length ? files : [`${name}/page.tsx`],
      order: typeof raw.order === "number" ? raw.order : 100,
      tags: /** @type {string[]} */ (list("tags")),
    };
  });
}
