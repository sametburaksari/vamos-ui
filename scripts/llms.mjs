#!/usr/bin/env node
// Writes the AI-readable side of ui.vamos.ist into a static export (apps/www/out):
//   /llms.txt                      index (llmstxt.org format): what Vamos UI is + links to every page
//   /llms-full.txt                 every guide, component and block in one Markdown file
//   /docs/<page>.md                each guide page as Markdown (from the built HTML)
//   /docs/components/<name>.md     each component: install, usage, when to use, props, examples (from the registry)
//   /blocks/<name>.md              each block: description, guidance, install
//
//   node scripts/llms.mjs [outDir]   (default apps/www/out; needs out/r from build-registry)
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.resolve(process.argv[2] ?? path.join(ROOT, "apps/www/out"));
const SITE = "https://ui.vamos.ist";
// jsdom ships with the kit's test toolchain.
const { JSDOM } = createRequire(path.join(ROOT, "packages/ui/package.json"))("jsdom");

const R = path.join(OUT, "r");
if (!fs.existsSync(path.join(R, "index.json"))) {
  console.error(`llms: ${path.relative(process.cwd(), R)}/index.json not found (run scripts/build-registry.mjs and the static export first)`);
  process.exit(1);
}
const index = JSON.parse(fs.readFileSync(path.join(R, "index.json"), "utf8"));
const item = (name) => {
  const f = path.join(R, `${name}.json`);
  return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, "utf8")) : null;
};
const write = (rel, text) => {
  const f = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, text.replace(/\n{3,}/g, "\n\n").trimEnd() + "\n");
};
const cell = (s) => String(s ?? "").replace(/\|/g, "\\|").replace(/\n+/g, " ");
const fence = (code, lang = "tsx") => "```" + lang + "\n" + String(code).trimEnd() + "\n```";

// --- HTML guide pages → Markdown --------------------------------------------------
function inline(node) {
  let s = "";
  for (const n of node.childNodes) {
    if (n.nodeType === 3) s += n.textContent.replace(/\s+/g, " ");
    else if (n.nodeType === 1) {
      const t = n.tagName.toLowerCase();
      if (t === "svg" || t === "button" || n.getAttribute("aria-hidden") === "true") continue;
      if (t === "code") s += "`" + n.textContent + "`";
      else if (t === "strong" || t === "b") s += "**" + inline(n).trim() + "**";
      else if (t === "em" || t === "i") s += "*" + inline(n).trim() + "*";
      else if (t === "br") s += "\n";
      else if (t === "a") {
        const text = inline(n).trim();
        let href = n.getAttribute("href") ?? "";
        if (href.startsWith("/")) href = SITE + href;
        s += text ? (href && !href.startsWith("#") ? `[${text}](${href})` : text) : "";
      } else if (t === "div" || t === "p") {
        // Block children inside a list item (title + body): keep them apart.
        const inner = inline(n).trim();
        if (inner) s += (s.trim() ? " — " : "") + inner;
      } else s += inline(n);
    }
  }
  return s;
}

function block(node, out, depth = 0) {
  for (const n of node.childNodes) {
    if (n.nodeType === 3) {
      const t = n.textContent.trim();
      if (t) out.push(t);
      continue;
    }
    if (n.nodeType !== 1) continue;
    const t = n.tagName.toLowerCase();
    if (["svg", "button", "nav", "script", "style", "iframe", "form"].includes(t) || n.getAttribute("aria-hidden") === "true") continue;
    if (/^h[1-6]$/.test(t)) out.push("#".repeat(Number(t[1])) + " " + inline(n).trim());
    else if (t === "p") {
      const s = inline(n).trim();
      if (s) out.push(s);
    } else if (t === "pre") {
      const code = n.textContent.replace(/\n$/, "");
      const lang = /^(npx|pnpm|npm|yarn|bun|curl|claude|codex|git) /m.test(code) ? "bash" : /^@import|^:root|\{\s*--/m.test(code) ? "css" : /^\s*[{[]/.test(code) ? "json" : "tsx";
      out.push(fence(code, lang));
    } else if (t === "ul" || t === "ol") {
      let i = 1;
      const lines = [];
      for (const li of n.children) {
        if (li.tagName.toLowerCase() !== "li") continue;
        const sub = [];
        const clone = li.cloneNode(true);
        for (const nested of [...clone.querySelectorAll(":scope > ul, :scope > ol")]) {
          block({ childNodes: [nested] }, sub, depth + 1);
          nested.remove();
        }
        lines.push("  ".repeat(depth) + (t === "ol" ? `${i++}. ` : "- ") + inline(clone).trim());
        for (const s of sub) lines.push(s);
      }
      out.push(lines.join("\n"));
    } else if (t === "table") {
      const rows = [...n.querySelectorAll("tr")].map((tr) => [...tr.children].map((c) => cell(inline(c).trim())));
      if (rows.length) {
        const w = Math.max(...rows.map((r) => r.length));
        const pad = (r) => [...r, ...Array(w - r.length).fill("")];
        out.push([`| ${pad(rows[0]).join(" | ")} |`, `|${" --- |".repeat(w)}`, ...rows.slice(1).map((r) => `| ${pad(r).join(" | ")} |`)].join("\n"));
      }
    } else if (t === "blockquote") out.push("> " + inline(n).trim());
    else block(n, out, depth);
  }
  return out;
}

function guideMarkdown(htmlFile, url) {
  const doc = new JSDOM(fs.readFileSync(htmlFile, "utf8")).window.document;
  const article = doc.querySelector("article") ?? doc.querySelector("main");
  if (!article) return null;
  const title = article.querySelector("h1")?.textContent.trim() ?? doc.title;
  const description = doc.querySelector('meta[name="description"]')?.getAttribute("content") ?? "";
  const body = block(article, []);
  // The breadcrumb ("Docs") before the H1 is noise.
  const h1 = body.findIndex((l) => l.startsWith("# "));
  return { title, description, url, md: [`> Source: ${url}`, ...(h1 >= 0 ? body.slice(h1) : body)].join("\n\n") };
}

// --- registry items → Markdown -------------------------------------------------------
function list(title, items) {
  return items?.length ? `## ${title}\n\n${items.map((s) => `- ${s}`).join("\n")}` : "";
}

function componentMarkdown(it) {
  const g = it.guidance ?? {};
  const parts = [
    `# ${it.title}`,
    `> Source: ${it.docs ?? `${SITE}/docs/components/${it.name}/`}`,
    it.description,
    `## Install\n\n${fence(`npm i @vamos-ui/react\n# or copy the source into your project:\nnpx vamos-ui add ${it.name}`, "bash")}`,
    it.usage ? `## Usage\n\n${fence(it.usage)}` : "",
    list("When to use", g.whenToUse),
    list("Avoid when", g.avoidWhen),
    list("Accessibility", g.accessibility),
    list("Notes", g.notes ?? g.pitfalls),
  ];
  for (const c of it.props ?? []) {
    if (!c.props?.length) continue;
    parts.push(`## ${c.component} props\n\n| Prop | Type | Default | Description |\n| --- | --- | --- | --- |\n${c.props.map((p) => `| ${cell(p.name)} | ${cell("`" + p.type + "`")} | ${cell(p.default ?? "")} | ${cell(p.description ?? "")} |`).join("\n")}`);
  }
  if (it.examples?.length) {
    parts.push("## Examples");
    for (const e of it.examples) parts.push(`### ${e.title}${e.description ? `\n\n${e.description}` : ""}\n\n${fence(e.code)}`);
  }
  return parts.filter(Boolean).join("\n\n");
}

function blockMarkdown(it) {
  const g = it.guidance ?? {};
  return [
    `# ${it.title ?? it.name}`,
    `> Preview: ${SITE}/view/${it.name}/ · Registry: ${SITE}/r/${it.name}.json`,
    it.description,
    it.category ? `Category: ${it.category}${it.tags?.length ? ` · Tags: ${it.tags.join(", ")}` : ""}` : "",
    `## Install\n\n${fence(`npx vamos-ui add ${it.name}`, "bash")}\n\nCopies the screen into your project (it imports components from @vamos-ui/react).`,
    list("When to use", g.whenToUse),
    list("Avoid when", g.avoidWhen),
    list("Notes", g.notes ?? g.pitfalls),
    it.files?.length ? `## Files\n\n${it.files.map((f) => `- ${f.path ?? f}`).join("\n")}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}

// --- collect ------------------------------------------------------------------------
const guides = [];
const docsDir = path.join(OUT, "docs");
const walk = (dir) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (path.relative(docsDir, abs) === "components") {
        if (fs.existsSync(path.join(abs, "index.html"))) guides.push(abs); // the components overview page only
        continue;
      }
      walk(abs);
    } else if (e.name === "index.html" && dir !== docsDir) guides.push(dir);
  }
};
walk(docsDir);
if (fs.existsSync(path.join(docsDir, "index.html"))) guides.unshift(docsDir);

const guidePages = [];
for (const dir of guides.sort()) {
  const rel = path.relative(OUT, dir).split(path.sep).join("/");
  const g = guideMarkdown(path.join(dir, "index.html"), `${SITE}/${rel}/`);
  if (!g) continue;
  write(`${rel}.md`, g.md);
  guidePages.push({ ...g, md_url: `${SITE}/${rel}.md`, rel });
}

const components = [];
const blocks = [];
for (const entry of index.items) {
  if (entry.type !== "component" && entry.type !== "block") continue;
  const it = item(entry.name);
  if (!it) continue;
  if (entry.type === "component") {
    const md = componentMarkdown(it);
    write(`docs/components/${it.name}.md`, md);
    components.push({ ...entry, md, md_url: `${SITE}/docs/components/${it.name}.md` });
  } else {
    const md = blockMarkdown(it);
    write(`blocks/${it.name}.md`, md);
    blocks.push({ ...entry, ...it, md, md_url: `${SITE}/blocks/${it.name}.md` });
  }
}

// --- llms.txt / llms-full.txt -------------------------------------------------------
const intro = `# Vamos UI

> Open-source design layer and React component kit for admin panels (CMS, CRM, HR, partner portals) and websites: CSS tokens with five theme axes (mode, accent, material, density, font), semantic Tailwind classes, ${components.length} components in @vamos-ui/react, ${blocks.length} blocks (whole screens and example websites), a CLI (npx vamos-ui) and an MCP server (https://mcp.vamos.ist/mcp). MIT licensed. English and Turkish first.

Key facts for assistants:
- Install the kit: \`npm i @vamos-ui/react\` and import from "@vamos-ui/react"; or copy sources with \`npx vamos-ui add <name>\`. Start a project with \`npx vamos-ui create\`.
- Style with the kit's semantic classes and tokens (bg-surface, text-fg, text-fg-muted, border-line; accent through data-accent), not raw colours, so all five theme axes keep working.
- Before building UI, read the rules (${SITE}/docs/mcp.md) or call the MCP tools get_rules, plan_screen, get_block and verify_code.
- Websites: \`npx vamos-ui site essentials\` writes robots, sitemap and legal pages; \`npx vamos-ui verify\` reports placeholder contact details, missing pages and launch basics.
- Registry JSON for every item: ${SITE}/r/index.json and ${SITE}/r/<name>.json.`;

const byGroup = new Map();
for (const c of components) {
  const g = c.group ?? "Other";
  if (!byGroup.has(g)) byGroup.set(g, []);
  byGroup.get(g).push(c);
}
const byCategory = new Map();
for (const b of blocks) {
  const g = b.category ?? "Other";
  if (!byCategory.has(g)) byCategory.set(g, []);
  byCategory.get(g).push(b);
}
const link = (title, url, desc) => `- [${title}](${url})${desc ? `: ${String(desc).replace(/\s+/g, " ").trim()}` : ""}`;

const llms = [
  intro,
  "## Docs",
  guidePages.map((g) => link(g.title, g.md_url, g.description)).join("\n"),
  "## Components",
  ...[...byGroup].map(([g, items]) => `### ${g}\n\n${items.map((c) => link(c.title, c.md_url, c.description)).join("\n")}`),
  "## Blocks",
  ...[...byCategory].map(([g, items]) => `### ${g}\n\n${items.map((b) => link(b.title ?? b.name, b.md_url, b.description)).join("\n")}`),
  "## Optional",
  [
    link("Registry index (JSON)", `${SITE}/r/index.json`, "every component, block, lib and style item"),
    link("MCP server", "https://mcp.vamos.ist/mcp", "streamable HTTP, no account needed"),
    link("Source code", "https://github.com/sametburaksari/vamos-ui", "MIT"),
    link("npm: @vamos-ui/react", "https://www.npmjs.com/package/@vamos-ui/react"),
    link("Full text", `${SITE}/llms-full.txt`, "all docs, components and blocks in one file"),
  ].join("\n"),
].join("\n\n");
write("llms.txt", llms);

const full = [intro, ...guidePages.map((g) => g.md), ...components.map((c) => c.md), ...blocks.map((b) => b.md)].join("\n\n---\n\n");
write("llms-full.txt", full);

console.log(`llms: ${guidePages.length} guides, ${components.length} components, ${blocks.length} blocks → llms.txt (${Math.round(llms.length / 1024)} KB), llms-full.txt (${Math.round(full.length / 1024)} KB)`);
