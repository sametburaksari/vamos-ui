import path from "node:path";
import type { RegistryFile, RegistryItem, VamosConfig } from "./types";

const KIT = "@vamos-ui/react";

/** Kit package subpaths whose export target differs from the folder name. */
const SUBPATH_MAP: [RegExp, string][] = [[/^locale\/(.+)$/, "locales/$1"]];

function mapSubpath(sub: string): string {
  for (const [re, to] of SUBPATH_MAP) if (re.test(sub)) return sub.replace(re, to);
  return sub;
}

/**
 * Rewrites "@vamos-ui/react" and "@vamos-ui/react/<subpath>" module specifiers to the
 * project alias. Covers static/dynamic imports, re-exports, require, vi.mock-style
 * calls with a module string, and CSS @import.
 */
export function rewriteImports(content: string, importAlias: string): string {
  const alias = importAlias.replace(/\/+$/, "");
  const re = /(\bfrom\s*|\bimport\s*\(\s*|\bimport\s+|\brequire\s*\(\s*|\bmock\s*\(\s*|@import\s+(?:url\(\s*)?)(["'])@vamos-ui\/react(\/[^"'\s]*)?\2/g;
  return content.replace(re, (_m, lead: string, q: string, sub?: string) => {
    const target = sub ? `${alias}/${mapSubpath(sub.slice(1))}` : alias;
    return `${lead}${q}${target}${q}`;
  });
}

export function usesKitImport(content: string): boolean {
  return content.includes(`"${KIT}`) || content.includes(`'${KIT}`);
}

/** Normalises a registry path and refuses anything that could escape the target dir. */
export function safeRelative(p: string): string {
  const norm = path.posix.normalize(p.replace(/\\/g, "/")).replace(/^\.\//, "");
  if (norm.startsWith("../") || norm === ".." || path.posix.isAbsolute(norm) || /^[a-z]:/i.test(norm)) {
    throw new Error(`Refusing unsafe registry path "${p}".`);
  }
  return norm;
}

/** Project-relative (posix) destination of a registry file. */
export function targetPath(item: Pick<RegistryItem, "name" | "type">, file: RegistryFile, config: Pick<VamosConfig, "uiDir" | "blocksDir">): string {
  const rel = safeRelative(file.path);
  if (item.type === "block") {
    const prefix = `blocks/${item.name}/`;
    const inner = rel.startsWith(prefix) ? rel.slice(prefix.length) : rel.startsWith("blocks/") ? rel.slice("blocks/".length) : rel;
    const dest = rel.startsWith(prefix) ? path.posix.join(item.name, inner) : rel.startsWith("blocks/") ? inner : path.posix.join(item.name, inner);
    return path.posix.join(toPosix(config.blocksDir), dest);
  }
  return path.posix.join(toPosix(config.uiDir), rel);
}

export function toPosix(p: string): string {
  return p.replace(/\\/g, "/").replace(/\/+$/, "");
}

/** Content as it will be written to disk. */
export function transformFile(content: string, config: Pick<VamosConfig, "importAlias">): string {
  return rewriteImports(content, config.importAlias);
}
