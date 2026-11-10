import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export function stylesImportPath(cssFile: string, uiDir: string): string {
  let rel = path.posix.relative(path.posix.dirname(cssFile.replace(/\\/g, "/")), `${uiDir.replace(/\\/g, "/")}/styles.css`);
  if (!rel.startsWith(".")) rel = `./${rel}`;
  return rel;
}

/**
 * Adds the import once, right after `@import "tailwindcss"` (Tailwind v4 needs the
 * kit tokens after Tailwind). Pure function; returns null when nothing changes.
 */
export function addStylesImport(css: string, importPath: string): { css: string; afterTailwind: boolean } | null {
  const escaped = importPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  if (new RegExp(`@import\\s+(?:url\\()?["']${escaped}["']`).test(css)) return null;
  const line = `@import "${importPath}";`;
  const lines = css.split("\n");
  let tw = -1;
  let lastImport = -1;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i]!.trim();
    if (/^@import\s+(?:url\()?["']tailwindcss(?:\/[^"']*)?["']/.test(l)) tw = i;
    if (/^@(import|charset|layer\s+[\w\s,-]+;)/.test(l)) lastImport = i;
    else if (l && !l.startsWith("/*") && !l.startsWith("*") && !l.startsWith("//")) break;
  }
  const at = tw >= 0 ? tw + 1 : lastImport + 1;
  lines.splice(at, 0, line);
  return { css: lines.join("\n"), afterTailwind: tw >= 0 };
}

export type CssResult = "added" | "present" | "created";

export async function ensureStylesImport(root: string, cssFile: string, uiDir: string): Promise<{ result: CssResult; afterTailwind: boolean }> {
  const abs = path.join(root, cssFile);
  const importPath = stylesImportPath(cssFile, uiDir);
  if (!existsSync(abs)) {
    await mkdir(path.dirname(abs), { recursive: true });
    await writeFile(abs, `@import "tailwindcss";\n@import "${importPath}";\n`);
    return { result: "created", afterTailwind: true };
  }
  const current = await readFile(abs, "utf8");
  const next = addStylesImport(current, importPath);
  if (!next) return { result: "present", afterTailwind: true };
  await writeFile(abs, next.css);
  return { result: "added", afterTailwind: next.afterTailwind };
}

export function brandImportPath(cssFile: string, uiDir: string): string {
  return stylesImportPath(cssFile, uiDir).replace(/styles\.css$/, "brand.css");
}

/**
 * Adds `@import "<brand.css>"` once, right after the kit styles import (the brand overrides the
 * kit accents, so it must come later). Pure; returns null when the import is already there.
 */
export function addBrandImport(css: string, importPath: string, stylesPath: string): { css: string; afterStyles: boolean } | null {
  const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  if (new RegExp(`@import\\s+(?:url\\()?["']${esc(importPath)}["']`).test(css)) return null;
  const lines = css.split("\n");
  const line = `@import "${importPath}";`;
  const styles = lines.findIndex((l) => new RegExp(`^\\s*@import\\s+(?:url\\()?["'](?:${esc(stylesPath)}|@vamos-ui/react/styles\\.css)["']`).test(l));
  if (styles >= 0) {
    lines.splice(styles + 1, 0, line);
    return { css: lines.join("\n"), afterStyles: true };
  }
  let last = -1;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i]!.trim();
    if (/^@(import|charset)/.test(l)) last = i;
    else if (l && !l.startsWith("/*") && !l.startsWith("*") && !l.startsWith("//")) break;
  }
  lines.splice(last + 1, 0, line);
  return { css: lines.join("\n"), afterStyles: false };
}
