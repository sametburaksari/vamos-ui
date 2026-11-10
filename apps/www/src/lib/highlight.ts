import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import { createHighlighter, type Highlighter } from "shiki";

let hl: Promise<Highlighter> | null = null;
function getHl() {
  hl ??= createHighlighter({ themes: ["vitesse-light", "vitesse-dark"], langs: ["tsx", "bash", "css"] });
  return hl;
}

/** Dual-theme (light/dark) HTML; colours are picked via CSS variables (globals.css). */
export async function highlight(code: string, lang: "tsx" | "bash" | "css" = "tsx") {
  const h = await getHl();
  return h.codeToHtml(code.trimEnd(), { lang, themes: { light: "vitesse-light", dark: "vitesse-dark" }, defaultColor: false });
}

const appRoot = process.cwd();
export const readExample = (file: string) => fs.readFile(path.join(appRoot, "src/docs/examples", file), "utf8");
export const readUiSource = (file: string) => fs.readFile(path.join(appRoot, "../../packages/ui/src", file), "utf8");
export const readBlockFile = (file: string) => fs.readFile(path.join(appRoot, "src/blocks", file), "utf8");
