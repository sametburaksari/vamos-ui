import { ToolError } from "./errors.js";
import { bullets, bytes, cell, fence, itemHeader, oneLine, truncate } from "./format.js";
import { buildTheming, RULES } from "./guidance.js";
import { Registry, RegistryError, normalizeName } from "./registry.js";
import { closestNames, fold, rankItems } from "./search.js";
import type { ItemType, RegistryIndexItem, RegistryItem, VerifyIssue } from "./types.js";
import { loadVerifier, verifierLoadError } from "./verify.js";

export { ToolError };

export const INCLUDE_KEYS = ["files", "examples", "props", "guidance"] as const;
export type IncludeKey = (typeof INCLUDE_KEYS)[number];

const TYPE_ORDER: ItemType[] = ["block", "component", "lib", "style"];
const TYPE_LABEL: Record<ItemType, string> = { block: "Blocks", component: "Components", lib: "Internal libraries", style: "Styles" };

async function wrapRegistry<T>(registry: Registry, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof RegistryError && error.code !== "not_found") {
      throw new ToolError(
        `${error.message}\nRegistry: ${registry.location}. Set VAMOS_REGISTRY (URL or local directory such as apps/www/public/r) if it lives elsewhere.`,
      );
    }
    throw error;
  }
}

async function notFound(registry: Registry, name: string): Promise<never> {
  const items = await registry.items();
  const suggestions = closestNames(name, items);
  throw new ToolError(
    `No registry item named "${name}".` +
      (suggestions.length ? ` Did you mean: ${suggestions.map((s) => `\`${s}\``).join(", ")}?` : "") +
      " Use search or list_items to find names.",
  );
}

async function getFull(registry: Registry, name: string): Promise<RegistryItem> {
  return wrapRegistry(registry, async () => {
    try {
      return await registry.item(name);
    } catch (error) {
      if (error instanceof RegistryError && error.code === "not_found") return notFound(registry, name);
      throw error;
    }
  });
}

/** Loads full items (for guidance-aware ranking) without blocking longer than `timeoutMs`. */
async function withDetails(registry: Registry, items: RegistryIndexItem[], timeoutMs: number): Promise<RegistryItem[]> {
  const wanted = items.filter((item) => item.type === "component" || item.type === "block").map((item) => item.name);
  const loading = registry.manyItems(wanted);
  await Promise.race([loading, new Promise((resolve) => setTimeout(resolve, timeoutMs).unref?.())]);
  return registry.cachedItems();
}

export function buildInstallCommand(registry: Registry, names: string[]): string {
  const flag = registry.isDefault ? "" : ` --registry ${/\s/.test(registry.location) ? JSON.stringify(registry.location) : registry.location}`;
  return `npx vamos-ui add ${names.join(" ")}${flag}`;
}

// --- list_items ---------------------------------------------------------------

export interface ListArgs {
  type?: ItemType;
  group?: string;
  category?: string;
  tag?: string;
}

export async function listItems(registry: Registry, args: ListArgs = {}): Promise<string> {
  const items = await wrapRegistry(registry, () => registry.items());
  const has = (value: string | undefined, needle: string | undefined) => !needle || (value !== undefined && fold(value).includes(fold(needle)));
  const filtered = items.filter(
    (item) =>
      (!args.type || item.type === args.type) &&
      has(item.group, args.group) &&
      has(item.category, args.category) &&
      (!args.tag || (item.tags ?? []).some((t) => fold(t) === fold(args.tag!))),
  );

  const filters = Object.entries(args)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}=${v}`)
    .join(", ");

  if (!filtered.length) {
    const groups = [...new Set(items.map((i) => i.group).filter(Boolean))].sort();
    const categories = [...new Set(items.map((i) => i.category).filter(Boolean))].sort();
    return [
      `No items match ${filters || "the filters"}.`,
      `Component groups: ${groups.join(", ") || "—"}`,
      `Block categories: ${categories.join(", ") || "—"}`,
    ].join("\n");
  }

  const out: string[] = [`${filtered.length} item${filtered.length === 1 ? "" : "s"}${filters ? ` (${filters})` : ""}. Call get_item / get_block with a name for source, props and guidance.`];
  for (const type of TYPE_ORDER) {
    const ofType = filtered.filter((item) => item.type === type);
    if (!ofType.length) continue;
    out.push("", `## ${TYPE_LABEL[type]} (${ofType.length})`);
    const key = (item: RegistryIndexItem) => (type === "block" ? item.category : item.group) ?? "Other";
    const sections = new Map<string, RegistryIndexItem[]>();
    for (const item of ofType) sections.set(key(item), [...(sections.get(key(item)) ?? []), item]);
    for (const [section, list] of [...sections].sort(([a], [b]) => a.localeCompare(b))) {
      if (type === "block" || type === "component") out.push("", `### ${section}`);
      for (const item of list.sort((a, b) => a.name.localeCompare(b.name))) {
        out.push(type === "lib" || type === "style" ? `- \`${item.name}\` ${truncate(item.description || item.title, 100)}` : oneLine(item).replace(/ \[[^\]]+\]/, ""));
      }
    }
  }
  return out.join("\n");
}

// --- search -------------------------------------------------------------------

export interface SearchArgs {
  query: string;
  type?: ItemType;
  limit?: number;
}

export async function search(registry: Registry, args: SearchArgs, detailTimeoutMs = 4000): Promise<string> {
  const query = args.query.trim();
  if (!query) throw new ToolError("query is empty. Describe what you need, e.g. \"date range picker\" or \"tarih seçici\".");
  const items = await wrapRegistry(registry, () => registry.items());
  const pool = args.type ? items.filter((item) => item.type === args.type) : items;
  const details = await withDetails(registry, pool, detailTimeoutMs);
  const hits = rankItems(query, pool, details).slice(0, args.limit ?? 10);
  if (!hits.length) {
    return `Nothing matches "${query}". Try a broader term, a component family ("overlay", "picker", "chart") or list_items.`;
  }
  const out = [`${hits.length} result${hits.length === 1 ? "" : "s"} for "${query}" (best first):`, ""];
  for (const hit of hits) {
    out.push(`${oneLine(hit.item)}`);
    out.push(`  type: ${hit.item.type} · matched: ${hit.matched.join(", ")} · ${hit.item.docs}`);
  }
  out.push("", "Next: get_item(name) for usage/props/examples, or get_block(name) for a full screen.");
  return out.join("\n");
}

// --- get_item / get_block -----------------------------------------------------

export interface GetItemArgs {
  name: string;
  include?: IncludeKey[];
  format?: "markdown" | "json";
}

/** Examples shown when the caller did not ask for them explicitly (keeps get_item small). */
export const DEFAULT_EXAMPLE_LIMIT = 2;

export function renderItem(registry: Registry, item: RegistryItem, include: Set<IncludeKey>, exampleLimit = Infinity): string {
  const out = itemHeader(item, buildInstallCommand(registry, [item.name]));
  if (item.dependencies.length) out.push(`npm dependencies: ${item.dependencies.map((d) => `\`${d}\``).join(", ")}`);
  if (item.registryDependencies.length) out.push(`Registry dependencies (installed automatically): ${item.registryDependencies.map((d) => `\`${d}\``).join(", ")}`);

  if (item.usage) out.push("", "## Usage", "", fence(item.usage, "usage.tsx"));

  if (include.has("guidance")) {
    const g = item.guidance;
    if (g) {
      if (g.whenToUse.length) out.push("", "## When to use", bullets(g.whenToUse));
      if (g.avoidWhen.length) out.push("", "## Avoid when", bullets(g.avoidWhen));
      if (g.related.length) out.push("", "## Related", g.related.map((r) => `\`${r}\``).join(", "));
      if (g.a11y?.length) out.push("", "## Accessibility", bullets(g.a11y));
    }
  }

  if (include.has("props") && item.props?.length) {
    out.push("", "## Props");
    for (const table of item.props) {
      out.push("", `### ${table.component}`, "", "| Prop | Type | Default | Description |", "|---|---|---|---|");
      for (const p of table.props) out.push(`| \`${cell(p.name)}\` | \`${cell(p.type)}\` | ${p.default ? `\`${cell(p.default)}\`` : "—"} | ${cell(p.description)} |`);
    }
  }

  if (include.has("examples") && item.examples?.length) {
    out.push("", "## Examples");
    const shown = item.examples.slice(0, exampleLimit);
    for (const ex of shown) {
      out.push("", `### ${ex.title}`);
      if (ex.description) out.push(ex.description);
      out.push("", fence(ex.code, "example.tsx"));
    }
    const rest = item.examples.slice(shown.length);
    if (rest.length) {
      out.push("", `${rest.length} more example${rest.length === 1 ? "" : "s"}: ${rest.map((e) => e.title).join("; ")}. Call again with include: ["examples"] for all of them.`);
    }
  }

  out.push("", "## Files");
  if (include.has("files")) {
    for (const file of item.files) out.push("", `### ${file.path}`, "", fence(file.content, file.path));
  } else {
    for (const file of item.files) out.push(`- ${file.path} (${bytes(file.content.length)})`);
    if (item.files.length) out.push("", 'Source omitted; call again with include: ["files"] if you need it, or install with the command above.');
  }
  return out.join("\n");
}

export async function getItem(registry: Registry, args: GetItemArgs): Promise<string> {
  const item = await getFull(registry, args.name);
  const explicit = !!args.include?.length;
  const include = new Set<IncludeKey>(explicit ? args.include : ["examples", "props", "guidance"]);
  if (args.format === "json") {
    const copy: Partial<RegistryItem> = { ...item };
    if (!include.has("files")) copy.files = item.files.map((f) => ({ path: f.path, content: `(${bytes(f.content.length)} omitted)` }));
    if (!include.has("examples")) delete copy.examples;
    if (!include.has("props")) delete copy.props;
    if (!include.has("guidance")) delete copy.guidance;
    return JSON.stringify(copy, null, 2);
  }
  return renderItem(registry, item, include, explicit && include.has("examples") ? Infinity : DEFAULT_EXAMPLE_LIMIT);
}

export async function getBlock(registry: Registry, args: { name: string }): Promise<string> {
  const item = await getFull(registry, args.name);
  if (item.type !== "block") {
    throw new ToolError(`\`${item.name}\` is a ${item.type}, not a block. Use get_item for it, or list_items({ type: "block" }) for screens.`);
  }
  const index = await registry.items();
  const kinds = new Map(index.map((entry) => [entry.name, entry.type]));
  const components = item.registryDependencies.filter((dep) => kinds.get(dep) === "component");
  const out = [renderItem(registry, item, new Set<IncludeKey>(["files", "guidance", "examples", "props"]))];
  out.push(
    "",
    "## Adapting this block",
    components.length ? `- Kit components used: ${components.map((c) => `\`${c}\``).join(", ")} — get_item(name) for their props.` : "- Uses only kit primitives listed above.",
    "- Replace the sample data with the real domain (names, amounts, statuses); keep the empty/loading/error states.",
    "- Keep one primary action per region and the token classes as written; run verify_code on the adapted files.",
  );
  return out.join("\n");
}

// --- theming & rules ----------------------------------------------------------

export async function getTheming(registry: Registry, args: { include_tokens?: boolean } = {}): Promise<string> {
  const [axes, tokens] = await wrapRegistry(registry, () => Promise.all([registry.axes(), registry.tokens()]));
  return buildTheming(axes, tokens, { includeTokens: args.include_tokens });
}

export function getRules(): string {
  return RULES;
}

// --- verify_code --------------------------------------------------------------

export function formatIssues(issues: VerifyIssue[], filename: string): string {
  if (!issues.length) return `${filename}: no issues found. Rules that need judgement (one primary action, realistic content, no card walls) are still on you — see get_rules.`;
  const sorted = [...issues].sort((a, b) => (a.severity === b.severity ? a.line - b.line || a.column - b.column : a.severity === "error" ? -1 : 1));
  const errors = issues.filter((i) => i.severity === "error").length;
  const warnings = issues.length - errors;
  const out = [`${filename}: ${errors} error${errors === 1 ? "" : "s"}, ${warnings} warning${warnings === 1 ? "" : "s"}.`, ""];
  for (const issue of sorted) {
    out.push(`${issue.severity === "error" ? "error  " : "warning"} ${filename}:${issue.line}:${issue.column}  [${issue.rule}] ${issue.message}`);
    if (issue.fix) out.push(`        fix: ${issue.fix}`);
  }
  out.push("", errors ? "Fix every error, then run verify_code again." : "No errors. Review the warnings.");
  return out.join("\n");
}

export async function verifyCode(args: { code: string; filename: string }): Promise<{ text: string; issues: VerifyIssue[]; ok: boolean }> {
  const verify = await loadVerifier();
  if (!verify) {
    throw new ToolError(
      `The verifier is not available (${verifierLoadError() ?? "vamos-ui/verify could not be loaded"}). Check the code by hand against get_rules, or run \`npx vamos-ui verify <file>\`.`,
    );
  }
  const issues = verify(args.code, args.filename);
  return { text: formatIssues(issues, args.filename), issues, ok: !issues.some((i) => i.severity === "error") };
}

// --- install_command ----------------------------------------------------------

export async function installCommand(registry: Registry, args: { names: string[] }): Promise<string> {
  const names = [...new Set(args.names.map(normalizeName).filter(Boolean))];
  if (!names.length) throw new ToolError("names is empty. Pass one or more registry item names, e.g. [\"button\", \"dialog\"].");
  const items = await wrapRegistry(registry, () => registry.items());
  const known = new Set(items.map((item) => item.name));
  const unknown = names.filter((name) => !known.has(name));
  if (unknown.length) {
    const hints = unknown.map((name) => {
      const s = closestNames(name, items);
      return `\`${name}\`${s.length ? ` (did you mean ${s.map((x) => `\`${x}\``).join(", ")}?)` : ""}`;
    });
    throw new ToolError(`Unknown item${unknown.length > 1 ? "s" : ""}: ${hints.join(", ")}. Nothing to install for those; fix the names and call again.`);
  }
  const cmd = buildInstallCommand(registry, names);
  return [
    cmd,
    "",
    "Run it from the project root. Registry dependencies (lib-* files, styles, other components) and npm packages are resolved automatically.",
    "First time in this project? Run `npx vamos-ui init` first (writes vamos.json, imports the styles). Useful flags: --dry-run (show files), --yes, --overwrite, --no-install.",
  ].join("\n");
}

// --- plan_screen --------------------------------------------------------------

const CATEGORY_HINTS: { category: string; words: string[]; density: "compact" | "comfortable" }[] = [
  { category: "Authentication", words: ["login", "sign in", "signin", "signup", "sign up", "register", "password", "otp", "2fa", "magic link", "auth", "giris", "kayit", "sifre"], density: "comfortable" },
  { category: "Dashboards", words: ["dashboard", "analytics", "kpi", "metrics", "overview", "report", "stats", "panel", "ozet", "rapor"], density: "compact" },
  { category: "List pages", words: ["list", "table", "index", "directory", "inventory", "orders", "customers", "leads", "contacts", "invoices", "liste", "tablo"], density: "compact" },
  { category: "Detail pages", words: ["detail", "profile", "record", "view", "invoice detail", "customer detail", "detay"], density: "comfortable" },
  { category: "Settings & forms", words: ["settings", "preferences", "form", "edit", "create", "account", "billing", "ayarlar", "ayar"], density: "comfortable" },
  { category: "Onboarding", words: ["onboarding", "wizard", "setup", "getting started", "welcome", "karsilama"], density: "comfortable" },
  { category: "Empty & error states", words: ["empty", "404", "500", "error", "not found", "maintenance", "no access", "forbidden", "bos", "hata", "bakim"], density: "comfortable" },
  { category: "App shells", words: ["shell", "layout", "sidebar", "navigation", "app frame", "admin layout"], density: "compact" },
  { category: "Website pages", words: ["website", "landing", "homepage", "home page", "pricing", "contact", "restaurant", "spa", "agency", "saas site", "site"], density: "comfortable" },
  { category: "Marketing sections", words: ["hero", "features", "testimonials", "faq", "cta", "section", "footer", "logos"], density: "comfortable" },
];

/** Description words → component names worth suggesting (only those that exist are used). */
const COMPONENT_HINTS: { words: string[]; names: string[] }[] = [
  { words: ["table", "rows", "columns", "sort", "tablo"], names: ["data-table", "table", "pagination"] },
  { words: ["filter", "filters", "filtre"], names: ["filter-bar", "data-table"] },
  { words: ["bulk", "bulk actions", "toplu"], names: ["data-table", "alert-dialog"] },
  { words: ["chart", "graph", "trend", "revenue", "grafik"], names: ["area-chart", "bar-chart", "line-chart", "donut-chart", "chart"] },
  { words: ["kpi", "metric", "stat", "stats"], names: ["stat", "sparkline"] },
  { words: ["form", "fields", "input", "edit", "create"], names: ["input", "field", "select", "form"] },
  { words: ["date", "deadline", "due", "tarih"], names: ["date-picker", "date-range-picker"] },
  { words: ["calendar", "schedule", "booking", "appointment", "randevu", "takvim"], names: ["calendar", "scheduler"] },
  { words: ["upload", "attachment", "file", "dosya"], names: ["file-upload", "attachment-list"] },
  { words: ["confirm", "delete", "remove"], names: ["alert-dialog"] },
  { words: ["modal", "dialog", "popup", "pencere"], names: ["dialog", "sheet"] },
  { words: ["menu", "actions", "more"], names: ["dropdown-menu"] },
  { words: ["search", "command", "arama"], names: ["command", "input"] },
  { words: ["tabs", "sekme"], names: ["tabs"] },
  { words: ["notification", "toast", "bildirim"], names: ["toast", "notification-center"] },
  { words: ["kanban", "board", "pipeline"], names: ["sortable", "badge"] },
  { words: ["status", "badge", "state"], names: ["badge", "status-picker"] },
  { words: ["user", "users", "team", "member", "assign", "kullanici"], names: ["avatar", "user-picker"] },
  { words: ["activity", "timeline", "history", "audit"], names: ["activity-timeline", "audit-log", "version-history"] },
  { words: ["comment", "comments", "yorum"], names: ["comment-thread"] },
  { words: ["empty", "no results", "bos"], names: ["empty-state"] },
  { words: ["money", "price", "amount", "currency", "fiyat"], names: ["currency-input"] },
  { words: ["phone", "telefon"], names: ["phone-input"] },
  { words: ["steps", "wizard", "stepper"], names: ["stepper"] },
  { words: ["sidebar", "navigation", "nav"], names: ["sidebar", "app-shell", "top-bar"] },
  { words: ["header", "title", "breadcrumb"], names: ["page-header", "breadcrumb"] },
  { words: ["editor", "rich text", "content"], names: ["editor"] },
];

function containsWord(haystack: string, word: string): boolean {
  return new RegExp(`(^|[^a-z0-9])${fold(word).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z0-9]|$)`).test(haystack);
}

export async function planScreen(registry: Registry, args: { description: string }, detailTimeoutMs = 4000): Promise<string> {
  const description = args.description.trim();
  if (!description) throw new ToolError("description is empty. Describe the screen: who uses it, what data it shows, the main action.");
  const items = await wrapRegistry(registry, () => registry.items());
  const text = fold(description);
  const details = await withDetails(registry, items, detailTimeoutMs);

  const categoryScores = new Map<string, number>();
  for (const hint of CATEGORY_HINTS) {
    const n = hint.words.filter((word) => containsWord(text, word)).length;
    if (n) categoryScores.set(hint.category, n);
  }
  const topCategory = [...categoryScores].sort((a, b) => b[1] - a[1])[0]?.[0];

  const blocks = items.filter((item) => item.type === "block");
  const blockHits = new Map(rankItems(description, blocks, details, "any").map((hit) => [hit.item.name, hit.score]));
  const rankedBlocks = blocks
    .map((block) => ({
      block,
      score: (blockHits.get(block.name) ?? 0) + (block.category ? (categoryScores.get(block.category) ?? 0) * 25 : 0),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.block.name.localeCompare(b.block.name));

  const out: string[] = [`# Plan: ${truncate(description, 120)}`, ""];
  const chosen = rankedBlocks[0]?.block;
  let blockComponents: string[] = [];
  const includedWithBlock = new Set<string>();
  const kinds = new Map(items.map((entry) => [entry.name, entry.type]));

  if (chosen) {
    const full = details.find((d) => d.name === chosen.name) ?? (await registry.item(chosen.name).catch(() => undefined));
    blockComponents = (full?.registryDependencies ?? []).filter((dep) => kinds.get(dep) === "component");
    // Everything the block pulls in transitively is installed with it, so it is not "to add".
    const detailByName = new Map(details.map((d) => [d.name, d]));
    const queue = [...(full?.registryDependencies ?? [])];
    while (queue.length) {
      const dep = queue.shift()!;
      if (includedWithBlock.has(dep)) continue;
      includedWithBlock.add(dep);
      queue.push(...(detailByName.get(dep)?.registryDependencies ?? []));
    }
    out.push(
      "## Start from this block",
      "",
      `**\`${chosen.name}\`** — ${chosen.title}${chosen.category ? ` (${chosen.category})` : ""}`,
      chosen.description ? truncate(chosen.description, 240) : "",
      `Docs: ${chosen.docs}`,
    );
    if (blockComponents.length) out.push(`Already uses: ${blockComponents.map((c) => `\`${c}\``).join(", ")}`);
    const alternatives = rankedBlocks.slice(1, 4).map((entry) => entry.block);
    if (alternatives.length) {
      out.push("", "Alternatives:");
      for (const alt of alternatives) out.push(oneLine(alt));
    }
  } else {
    out.push(
      "## Start from this block",
      "",
      "No block matches closely. Compose the screen from an app shell block (list_items({ type: \"block\", category: \"App shells\" })) plus the components below.",
    );
  }

  // Components: explicit hints first, then free-text ranking.
  const components = items.filter((item) => item.type === "component");
  const componentNames = new Set(components.map((c) => c.name));
  const suggested = new Map<string, string>();
  for (const hint of COMPONENT_HINTS) {
    const word = hint.words.find((w) => containsWord(text, w));
    if (!word) continue;
    for (const name of hint.names) {
      if (componentNames.has(name) && !includedWithBlock.has(name) && !suggested.has(name)) suggested.set(name, `mentions "${word}"`);
    }
  }
  // Free-text hits must match the item itself (name, title or tags), not only prose that mentions
  // the word, and website sections are only offered for website screens.
  const screenCategory = chosen?.category ?? topCategory;
  const siteScreen = screenCategory === "Website pages" || screenCategory === "Marketing sections";
  for (const hit of rankItems(description, components, details).slice(0, 8)) {
    const strong = hit.matched.some((m) => m === "name" || m === "title" || m === "tags");
    if (!strong || (!siteScreen && hit.item.group === "Site blocks")) continue;
    if (!includedWithBlock.has(hit.item.name) && !suggested.has(hit.item.name) && hit.score >= 10) {
      suggested.set(hit.item.name, `matches ${hit.matched.join(", ")}`);
    }
  }
  const picked = [...suggested].slice(0, 8);
  const byName = new Map(details.map((d) => [d.name, d]));
  if (picked.length) {
    out.push("", "## Components to add");
    for (const [name, why] of picked) {
      const entry = components.find((c) => c.name === name)!;
      const use = byName.get(name)?.guidance?.whenToUse[0];
      out.push(`- \`${name}\` ${entry.title} — ${use ? truncate(use, 120) : truncate(entry.description, 120)} (${why})`);
    }
  }

  const install = [...(chosen ? [chosen.name] : []), ...picked.map(([name]) => name)];
  if (install.length) out.push("", "## Install", "", "```sh", buildInstallCommand(registry, install), "```");

  const density = CATEGORY_HINTS.find((hint) => hint.category === (chosen?.category ?? topCategory))?.density ?? "comfortable";
  out.push(
    "",
    "## Build checklist",
    `- Density: \`data-density="${density}"\` suits this kind of screen.`,
    "- One primary action (`<Button variant=\"primary\">`) per region; everything else secondary/ghost.",
    "- Tokens only: semantic classes, no palette colours, no `dark:`, no font literals.",
    "- Realistic domain content and the empty, loading and error states.",
    "- Icon-only buttons get `aria-label`; overlays come from the kit (Dialog/Sheet/DropdownMenu/Tooltip).",
    ...(siteScreen
      ? [
          "",
          "## Website launch checklist",
          "Use it before the site goes live (rule 11 in get_rules has the detail):",
          "- A page for every footer link: legal pages (/privacy or /gizlilik, /kvkk, /cookies, /terms, /accessibility) from `legal-01`, with every [fill-in] replaced and the text reviewed by the business or a lawyer. `npx vamos-ui site essentials` writes them with robots and sitemap.",
          "- robots.txt and sitemap.xml listing every public route.",
          "- `metadataBase`, `alternates.canonical`, `openGraph` and a 120–160 character description in the metadata.",
          "- JSON-LD: the kit `Footer` emits Organization; set the business type or add `<JsonLd>` / `localBusinessJsonLd`.",
          "- The business's real phone, email and map links: no demo numbers (000 00 00), example.com / .example addresses, `href=\"#\"` or invented map short links.",
          "- `sizes` on images that matches the rendered width.",
        ]
      : []),
    "",
    "## Next",
    chosen ? `1. get_block("${chosen.name}") for the full source.` : "1. get_item(name) for each component above.",
    "2. Adapt it; get_item(name) for props of any component you add.",
    "3. verify_code on every file you write.",
  );
  return out.filter((line, i, arr) => !(line === "" && arr[i - 1] === "")).join("\n");
}
