import type { RegistryIndexItem, RegistryItem } from "./types.js";

export function fence(code: string, path = ""): string {
  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  const lang = ({ tsx: "tsx", ts: "ts", jsx: "jsx", js: "js", mjs: "js", css: "css", json: "json", md: "md", html: "html" } as Record<string, string>)[ext] ?? "";
  const ticks = code.includes("```") ? "````" : "```";
  return `${ticks}${lang}\n${code.replace(/\s+$/, "")}\n${ticks}`;
}

export function oneLine(item: RegistryIndexItem): string {
  const where = item.type === "block" ? item.category : item.group;
  const desc = item.description ? ` — ${truncate(item.description, 140)}` : "";
  return `- \`${item.name}\` ${item.title}${where ? ` [${where}]` : ""}${desc}`;
}

export function truncate(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).trimEnd()}…`;
}

export function cell(text: string | undefined): string {
  return (text ?? "").replace(/\|/g, "\\|").replace(/\n+/g, " ");
}

export function bullets(list: string[] | undefined): string {
  return (list ?? []).map((entry) => `- ${entry}`).join("\n");
}

export function bytes(n: number): string {
  return n < 1024 ? `${n} B` : `${(n / 1024).toFixed(1)} KB`;
}

export function itemHeader(item: RegistryItem | RegistryIndexItem, install: string): string[] {
  const where = item.type === "block" ? item.category : item.group;
  const lines = [`# ${item.title} (\`${item.name}\`)`, "", `${item.type}${where ? ` · ${where}` : ""}${item.tags?.length ? ` · tags: ${item.tags.join(", ")}` : ""}`];
  if (item.description) lines.push("", item.description);
  lines.push("", `Docs: ${item.docs}`, `Install: \`${install}\``);
  return lines;
}
