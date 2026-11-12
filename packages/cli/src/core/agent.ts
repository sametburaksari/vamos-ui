import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Registry } from "./registry";
import type { VamosConfig } from "./types";

const START = "<!-- vamos-ui:start -->";
const END = "<!-- vamos-ui:end -->";

export function agentRules(config: VamosConfig): string {
  const alias = config.importAlias;
  return `${START}
## Vamos UI

This project uses Vamos UI (docs: https://ui.vamos.ist). Kit source lives in \`${config.uiDir}\`, blocks in \`${config.blocksDir}\`.

**Build screens**
- Start from a block: \`npx vamos-ui list --type block\`, then \`npx vamos-ui add <block>\`.
- Add components with \`npx vamos-ui add <name>\` and import them from \`${alias}\` (subpaths: \`${alias}/charts\`, \`${alias}/data-table\`, …).
- Look before you build: \`npx vamos-ui search <query>\` and \`npx vamos-ui view <name>\` show usage, props and guidance. Never hand-roll a modal, dropdown, tooltip, select or table the kit already has.
- Before editing a kit file in \`${config.uiDir}\`, prefer composition; local edits show up in \`npx vamos-ui diff\` and are protected on \`upgrade\`.

**Design rules**
- Tokens only. No hex/rgb/hsl/oklch literals, no Tailwind palette classes (\`bg-blue-500\`, \`text-zinc-900\`) and no \`dark:\` variants. Use semantic classes: \`bg-surface\`, \`bg-surface-2\`, \`text-fg\`, \`text-fg-muted\`, \`border-line\`, \`bg-accent\`, \`text-accent-ink\`, \`text-danger\` …
- Theming is five attributes on \`<html>\`: \`class="dark"\`, \`data-material\`, \`data-accent\`, \`data-density\`, \`data-font\`. Never fork styles per theme. Brand colours go in \`--accent-base\`.
- One primary action per view (\`variant="primary"\`); everything else is secondary, ghost or link.
- Fonts come from \`data-font\` (\`font-sans\`, \`font-display\`, \`font-mono\`). Never hard-code a font-family.
- Glass is for chrome (navigation, popovers, dialogs), not for dense data surfaces.
- Respect density: use the kit's spacing and sizes instead of fixed paddings and heights.
- Use the z tokens (\`--z-sticky\`, \`--z-nav\`, \`--z-overlay\`, \`--z-popover\`, \`--z-toast\`, \`--z-tooltip\`), never arbitrary z-index values.
- No decorative filler: no gradient text, glowing blobs, emoji headings, card-in-card layouts or stock "hero" copy.

**Accessibility**
- Icon-only actions use \`<IconButton label="…">\`. Every image has \`alt\` (\`alt=""\` when decorative).
- Clickable things are buttons or links, never \`<div onClick>\`. No positive \`tabIndex\`.

**Websites** (projects with \`site-*\` / \`page-*\` blocks)
- A new website starts with the plan: \`npx vamos-ui new\` (or the MCP tool \`start_project\`) asks about the business, domain, hosting, current site, pages, store or booking, forms, measurement and legal, and writes \`vamos.project.json\`. Build what its plan lists (pages, components, legal pages, tasks) and ask the user its open questions; with a current site, \`npx vamos-ui site import <url>\` / \`import_site\` reads its details, navigation and texts first.
- Business details live in \`vamos.site.json\` (\`npx vamos-ui site init\`): name, contact, address, opening hours, legal ids, analytics ids. Read them from there; never invent a phone, email, address, map link or tracking id, and never leave a placeholder (\`000 00 00\`, \`example.com\`, \`href="#"\`, \`[fill-in]\`) in shipped code.
- \`npx vamos-ui site essentials\` writes robots, sitemap, llms.txt, JSON-LD and the legal pages (legal-01). Legal presets are template text: the business or a lawyer reviews them.
- One H1 per page, a title under 60 characters, a 120–160 character description, \`alternates.canonical\` and Open Graph on every page.
- Before launch: \`npx vamos-ui audit <url>\` on the deployed site.

**Docs for agents**
- Every docs page has a Markdown version: https://ui.vamos.ist/llms.txt (index), https://ui.vamos.ist/docs/components/<name>.md, https://ui.vamos.ist/blocks/<name>.md.
- MCP server (optional): \`npx vamos-ui mcp add\`, or the hosted https://mcp.vamos.ist/mcp.

**Check your work**
- \`npx vamos-ui verify\` must pass with no errors before you finish.
${END}`;
}

/** Inserts or replaces the vamos-ui block in a markdown file. */
export function upsertBlock(existing: string | null, block: string): string {
  if (!existing || !existing.trim()) return block + "\n";
  const s = existing.indexOf(START);
  const e = existing.indexOf(END);
  if (s !== -1 && e > s) return existing.slice(0, s) + block + existing.slice(e + END.length);
  return existing.replace(/\s*$/, "") + "\n\n" + block + "\n";
}

export function skillMarkdown(config: VamosConfig): string {
  return `---
name: vamos-ui
description: Build and review UI with the Vamos UI kit (tokens, 6 theme axes, components and blocks). Use when creating screens, adding components, theming, or reviewing UI code in this project.
---

# Vamos UI

Docs: https://ui.vamos.ist . Registry: ${config.registry} .

## Workflow
1. Find a starting point: \`npx vamos-ui list --type block\` or \`npx vamos-ui search "<what you need>"\`.
2. Read the item: \`npx vamos-ui view <name>\` (usage, props, when to use / avoid).
3. Install: \`npx vamos-ui add <names...>\` (dependencies are resolved for you).
4. Import from \`${config.importAlias}\` and compose. Do not copy kit markup by hand.
5. Run \`npx vamos-ui verify\` and fix every error.

${agentRules(config).replace(START, "").replace(END, "").replace("## Vamos UI\n", "## Rules\n").trim()}
`;
}

/** Cursor rule file (.cursor/rules/vamos-ui.mdc): the same rules, scoped to UI source files. */
export function cursorRules(config: VamosConfig): string {
  const body = agentRules(config).replace(START, "").replace(END, "").trim();
  return `---
description: Vamos UI kit rules (tokens, theme axes, components, blocks, website launch checks)
globs: ["**/*.tsx", "**/*.jsx", "**/*.css", "vamos.site.json"]
alwaysApply: false
---

${body}
`;
}

export interface AgentResult {
  written: string[];
  skillSource: "registry" | "builtin";
}

export async function writeAgentFiles(root: string, config: VamosConfig, registry: Registry): Promise<AgentResult> {
  const block = agentRules(config);
  const written: string[] = [];
  // AGENTS.md (Codex, Cursor, Gemini, …), CLAUDE.md (Claude Code) and GitHub Copilot read a
  // markdown file; the vamos-ui block is upserted so the rest of each file stays untouched.
  for (const name of ["AGENTS.md", "CLAUDE.md", ".github/copilot-instructions.md"]) {
    const file = path.join(root, name);
    const current = existsSync(file) ? await readFile(file, "utf8") : null;
    const next = upsertBlock(current, block);
    if (next !== current) {
      await mkdir(path.dirname(file), { recursive: true });
      await writeFile(file, next);
      written.push(name);
    }
  }
  // Cursor project rules: a file of our own, applied to UI files.
  const cursorFile = path.join(root, ".cursor/rules/vamos-ui.mdc");
  const cursor = cursorRules(config);
  if (!existsSync(cursorFile) || (await readFile(cursorFile, "utf8")) !== cursor) {
    await mkdir(path.dirname(cursorFile), { recursive: true });
    await writeFile(cursorFile, cursor);
    written.push(".cursor/rules/vamos-ui.mdc");
  }
  let skill: string;
  let skillSource: AgentResult["skillSource"] = "registry";
  try {
    skill = await registry.text("skills/vamos-ui/SKILL.md");
  } catch {
    skill = skillMarkdown(config);
    skillSource = "builtin";
  }
  const skillDir = path.join(root, ".claude/skills/vamos-ui");
  const skillFile = path.join(skillDir, "SKILL.md");
  await mkdir(skillDir, { recursive: true });
  await writeFile(skillFile, skill);
  written.push(".claude/skills/vamos-ui/SKILL.md");
  if (skillSource === "registry") {
    // SKILL.md links to references/*.md (rules, theming, catalogs); fetch the ones it names.
    const refs = [...new Set([...skill.matchAll(/\]\((references\/[\w.-]+\.md)\)/g)].map((m) => m[1]!))];
    for (const ref of refs) {
      try {
        const text = await registry.text(`skills/vamos-ui/${ref}`);
        await mkdir(path.join(skillDir, "references"), { recursive: true });
        await writeFile(path.join(skillDir, ref), text);
        written.push(`.claude/skills/vamos-ui/${ref}`);
      } catch {
        // A missing reference only weakens the skill; SKILL.md itself is complete enough to use.
      }
    }
  }
  return { written, skillSource };
}
