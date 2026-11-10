// @ts-check
/**
 * Module graph for a source tree: imports, exports and relative-path resolution.
 * Uses the TypeScript parser (syntax only — no type checker, no program), so it is fast and
 * handles every import form: static, type-only, side-effect, `export … from` and `import()`.
 */
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import { parseSource } from "./ts-static.mjs";

/**
 * @typedef {object} ImportRef
 * @property {string} spec Module specifier as written.
 * @property {string[]} names Imported binding names ("default" for default, "*" for namespace / export *).
 * @property {boolean} typeOnly
 * @property {boolean} reexport True for `export … from`.
 * @property {number} line
 */

/**
 * @typedef {object} ModuleInfo
 * @property {string} rel Path relative to the tree root (posix).
 * @property {string} abs
 * @property {string} code
 * @property {ImportRef[]} imports
 * @property {Set<string>} localExports Names declared and exported in this file.
 * @property {{ spec: string, names: Map<string, string> | null }[]} reexports `names` maps exported → imported; null = `export *`.
 * @property {boolean} pureBarrel Only re-exports/imports (no declarations of its own).
 * @property {string | undefined} leadingComment First comment of the file, cleaned.
 */

export const SOURCE_EXTS = [".ts", ".tsx", ".mts", ".js", ".jsx", ".mjs"];
const RESOLVE_EXTS = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".mts"];

/** @param {string} p */
export const toPosix = (p) => p.split(path.sep).join("/");

/**
 * Recursively lists files under `dir` (posix paths relative to it), sorted, skipping node_modules.
 * @param {string} dir
 * @param {(rel: string) => boolean} [filter]
 * @returns {string[]}
 */
export function listFiles(dir, filter = () => true) {
  /** @type {string[]} */
  const out = [];
  const walk = (/** @type {string} */ d, /** @type {string} */ prefix) => {
    for (const ent of fs.readdirSync(d, { withFileTypes: true })) {
      if (ent.name === "node_modules" || ent.name.startsWith(".")) continue;
      const rel = prefix ? `${prefix}/${ent.name}` : ent.name;
      if (ent.isDirectory()) walk(path.join(d, ent.name), rel);
      else if (ent.isFile() && filter(rel)) out.push(rel);
    }
  };
  walk(dir, "");
  return out.sort();
}

/** @param {string} rel */
export function isTestFile(rel) {
  const base = rel.split("/").pop() ?? "";
  return /\.(test|spec|stories)\.[cm]?[jt]sx?$/.test(base) || /^_test-setup\./.test(base) || /^test-(utils|fixtures)\./.test(base) || /^_fixtures\./.test(base);
}

/** @param {string} spec */
export const isRelative = (spec) => spec === "." || spec === ".." || spec.startsWith("./") || spec.startsWith("../");

/**
 * npm package name of a bare specifier ("@tiptap/pm/state" → "@tiptap/pm").
 * @param {string} spec
 */
export function packageName(spec) {
  const parts = spec.split("/");
  return spec.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0];
}

/**
 * Parses one module.
 * @param {string} rel
 * @param {string} abs
 * @param {string} code
 * @returns {ModuleInfo}
 */
export function parseModule(rel, abs, code) {
  /** @type {ModuleInfo} */
  const info = { rel, abs, code, imports: [], localExports: new Set(), reexports: [], pureBarrel: true, leadingComment: leadingComment(code) };
  if (!SOURCE_EXTS.some((e) => rel.endsWith(e))) {
    info.pureBarrel = false;
    return info;
  }
  const sf = parseSource(rel, code);
  const line = (/** @type {ts.Node} */ n) => sf.getLineAndCharacterOfPosition(n.getStart(sf)).line + 1;
  const hasExport = (/** @type {ts.Node} */ n) => ts.canHaveModifiers(n) && (ts.getModifiers(n) ?? []).some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
  const hasDefault = (/** @type {ts.Node} */ n) => ts.canHaveModifiers(n) && (ts.getModifiers(n) ?? []).some((m) => m.kind === ts.SyntaxKind.DefaultKeyword);

  for (const stmt of sf.statements) {
    if (ts.isImportDeclaration(stmt) && ts.isStringLiteral(stmt.moduleSpecifier)) {
      /** @type {string[]} */
      const names = [];
      const clause = stmt.importClause;
      if (clause?.name) names.push("default");
      const nb = clause?.namedBindings;
      if (nb && ts.isNamespaceImport(nb)) names.push("*");
      if (nb && ts.isNamedImports(nb)) for (const el of nb.elements) names.push((el.propertyName ?? el.name).text);
      info.imports.push({ spec: stmt.moduleSpecifier.text, names, typeOnly: !!clause?.isTypeOnly, reexport: false, line: line(stmt) });
      continue;
    }
    if (ts.isExportDeclaration(stmt)) {
      if (stmt.moduleSpecifier && ts.isStringLiteral(stmt.moduleSpecifier)) {
        const spec = stmt.moduleSpecifier.text;
        const ec = stmt.exportClause;
        if (!ec) {
          info.reexports.push({ spec, names: null });
          info.imports.push({ spec, names: ["*"], typeOnly: stmt.isTypeOnly, reexport: true, line: line(stmt) });
        } else if (ts.isNamespaceExport(ec)) {
          info.reexports.push({ spec, names: new Map([[ec.name.text, "*"]]) });
          info.imports.push({ spec, names: ["*"], typeOnly: stmt.isTypeOnly, reexport: true, line: line(stmt) });
        } else {
          /** @type {Map<string, string>} */
          const map = new Map();
          for (const el of ec.elements) map.set(el.name.text, (el.propertyName ?? el.name).text);
          info.reexports.push({ spec, names: map });
          info.imports.push({ spec, names: [...map.values()], typeOnly: stmt.isTypeOnly, reexport: true, line: line(stmt) });
        }
      } else if (stmt.exportClause && ts.isNamedExports(stmt.exportClause)) {
        // `export { a, b as c }` of local bindings
        for (const el of stmt.exportClause.elements) info.localExports.add(el.name.text);
        info.pureBarrel = false;
      }
      continue;
    }
    if (ts.isExportAssignment(stmt)) {
      info.localExports.add("default");
      info.pureBarrel = false;
      continue;
    }
    if (ts.isImportEqualsDeclaration(stmt)) continue;
    if (ts.isExpressionStatement(stmt) && ts.isStringLiteral(stmt.expression)) continue; // "use client"
    if (ts.isEmptyStatement(stmt)) continue;
    // A declaration of its own: not a pure barrel.
    info.pureBarrel = false;
    if (hasExport(stmt)) {
      if (hasDefault(stmt)) info.localExports.add("default");
      if (ts.isVariableStatement(stmt)) {
        for (const d of stmt.declarationList.declarations) for (const n of bindingNames(d.name)) info.localExports.add(n);
      } else if ((ts.isFunctionDeclaration(stmt) || ts.isClassDeclaration(stmt) || ts.isInterfaceDeclaration(stmt) || ts.isTypeAliasDeclaration(stmt) || ts.isEnumDeclaration(stmt) || ts.isModuleDeclaration(stmt)) && stmt.name && ts.isIdentifier(stmt.name)) {
        if (!hasDefault(stmt)) info.localExports.add(stmt.name.text);
      }
    }
  }

  // Dynamic imports anywhere in the file: import("./x")
  const visit = (/** @type {ts.Node} */ node) => {
    if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
      const arg = node.arguments[0];
      if (arg && (ts.isStringLiteral(arg) || ts.isNoSubstitutionTemplateLiteral(arg))) {
        info.imports.push({ spec: arg.text, names: ["*"], typeOnly: false, reexport: false, line: line(node) });
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  if (!info.reexports.length && !info.imports.length) info.pureBarrel = false;
  return info;
}

/** @param {ts.BindingName} name @returns {string[]} */
function bindingNames(name) {
  if (ts.isIdentifier(name)) return [name.text];
  /** @type {string[]} */
  const out = [];
  for (const el of name.elements) if (!ts.isOmittedExpression(el)) out.push(...bindingNames(el.name));
  return out;
}

/** @param {string} code */
function leadingComment(code) {
  const m = /^\s*(?:(?:"use client"|'use client');?\s*)?(\/\*[\s\S]*?\*\/|(?:\/\/[^\n]*\n?)+)/.exec(code);
  if (!m) return undefined;
  const text = m[1]
    .replace(/^\/\*+|\*+\/$/g, "")
    .split("\n")
    .map((l) => l.replace(/^\s*(\*|\/\/)\s?/, "").trim())
    .filter(Boolean)
    .join(" ")
    .trim();
  return text || undefined;
}

/**
 * A parsed source tree with relative-import resolution.
 */
export class ModuleTree {
  /**
   * @param {string} root Absolute directory.
   * @param {(rel: string) => boolean} [filter]
   */
  constructor(root, filter = (rel) => !isTestFile(rel)) {
    this.root = root;
    /** @type {Map<string, ModuleInfo>} */
    this.modules = new Map();
    this.files = new Set(listFiles(root, filter));
  }

  /** @param {string} rel @returns {ModuleInfo} */
  get(rel) {
    let m = this.modules.get(rel);
    if (!m) {
      const abs = path.join(this.root, rel);
      m = parseModule(rel, abs, fs.readFileSync(abs, "utf8"));
      this.modules.set(rel, m);
    }
    return m;
  }

  /** @param {string} rel */
  has(rel) {
    return this.files.has(rel);
  }

  /**
   * Resolves a relative specifier from `fromRel` to a file in the tree.
   * @param {string} fromRel
   * @param {string} spec
   * @returns {string | undefined}
   */
  resolve(fromRel, spec) {
    const base = path.posix.normalize(path.posix.join(path.posix.dirname(fromRel), spec));
    if (base.startsWith("../")) return undefined; // outside the tree
    return this.resolvePath(base === "." ? "" : base);
  }

  /** @param {string} base posix path relative to root, without extension */
  resolvePath(base) {
    const dir = base ? `${base}/` : "";
    const candidates = [base, ...RESOLVE_EXTS.map((e) => base + e), ...RESOLVE_EXTS.map((e) => `${dir}index${e}`)].filter(Boolean);
    // "./x.js" written for a .ts file (ESM style)
    if (/\.[cm]?jsx?$/.test(base)) {
      const stem = base.replace(/\.[cm]?jsx?$/, "");
      candidates.push(stem + ".ts", stem + ".tsx");
    }
    return candidates.find((c) => this.files.has(c));
  }

  /**
   * Resolves an exported name of `rel` to the file that declares it, following re-exports.
   * Returns "npm:<specifier>" when the name is re-exported from an npm package.
   * @param {string} rel
   * @param {string} name
   * @param {Set<string>} [seen]
   * @returns {string | undefined}
   */
  declarationOf(rel, name, seen = new Set()) {
    const key = `${rel}#${name}`;
    if (seen.has(key) || !this.has(rel)) return undefined;
    seen.add(key);
    const m = this.get(rel);
    if (m.localExports.has(name)) return rel;
    for (const re of m.reexports) {
      if (!isRelative(re.spec)) {
        // `export { z } from "zod"`: the binding comes from an npm package.
        if (re.names?.has(name)) return `npm:${re.spec}`;
        continue;
      }
      const target = this.resolve(rel, re.spec);
      if (!target) continue;
      if (re.names === null) {
        if (name === "default") continue;
        const hit = this.declarationOf(target, name, seen);
        if (hit) return hit;
      } else if (re.names.has(name)) {
        const imported = /** @type {string} */ (re.names.get(name));
        return imported === "*" ? target : this.declarationOf(target, imported, seen) ?? target;
      }
    }
    return undefined;
  }

  /**
   * Every concrete (non-barrel) file a barrel re-exports, transitively.
   * @param {string} rel
   * @param {Set<string>} [seen]
   * @returns {string[]}
   */
  barrelTargets(rel, seen = new Set()) {
    if (seen.has(rel)) return [];
    seen.add(rel);
    const m = this.get(rel);
    if (!m.pureBarrel) return [rel];
    /** @type {string[]} */
    const out = [];
    for (const re of m.reexports) {
      if (!isRelative(re.spec)) continue;
      const t = this.resolve(rel, re.spec);
      if (t) out.push(...this.barrelTargets(t, seen));
    }
    return out;
  }
}
