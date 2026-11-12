import { existsSync, readFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { loadBrandLib } from "./brand-lib.js";
import {
  BRAND_APPLY_COMMAND,
  BRAND_CHECK_COMMAND,
  UPDATE_DRY_RUN_COMMAND,
  UPDATE_FIX_COMMAND,
  PRESET_ACCENTS,
  MIN_TEXT_CONTRAST,
  accentCss,
  brandIssues,
  contrastRows,
  formatBrandIssues,
  formatPlan,
  generateAccentSafe,
  planAlignment,
  readBrand,
  requireBrandLib,
  validateBrandShape,
  withSchema,
  type DesignPlan,
} from "./brand.js";
import { ToolError } from "./errors.js";
import { truncate } from "./format.js";
import {
  BRAND_FILE,
  BRAND_SCHEMA,
  DEFAULT_ROOTS,
  MAX_FILES,
  collectSourceFiles,
  insideProject,
  listProjectPaths,
  publicImageSizes,
  readProjectConfig,
  resolveProjectDir,
  toPosix,
} from "./project.js";
import { formatIssues } from "./tools.js";
import type { Brand, BrandIssue, GeneratedAccent, VerifyIssue } from "./types.js";
import { loadProjectVerifier, loadVerifier, verifierLoadError, type VerifyProject } from "./verify.js";

/** A tool answer: readable text plus the same facts as structured content. */
export interface ToolAnswer {
  text: string;
  data: Record<string, unknown>;
}

function brandSummary(brand: Brand, accent: GeneratedAccent | null): string[] {
  const out = [`# Brand: ${brand.name}`, ""];
  const c = brand.colors;
  out.push("## Colours", `- accent: \`${c.accent}\`${c.accentDark ? ` · accentDark: \`${c.accentDark}\`` : ""}${c.neutralTint ? ` · neutralTint: \`${c.neutralTint}\`` : ""}`);
  if (accent) out.push("", "Generated accent (`data-accent=\"brand\"`):", "", "```css", accentCss(accent), "```");
  const fonts = brand.fonts ?? {};
  if (fonts.display || fonts.body || fonts.mono) {
    out.push("", "## Fonts", ...(["display", "body", "mono"] as const).filter((k) => fonts[k]).map((k) => `- ${k}: ${fonts[k]}`));
  }
  const t = brand.theme ?? {};
  const themeParts = [t.dark !== undefined ? (t.dark ? "dark" : "light") : "", t.material ?? "", t.density ?? "", t.radius ? `radius ${t.radius}` : ""].filter(Boolean);
  if (themeParts.length) out.push("", "## Theme defaults", `- ${themeParts.join(" · ")}`);
  const v = brand.voice;
  if (v) {
    out.push("", "## Voice (follow it in every label, empty state, error and button)");
    if (v.tone) out.push(`- Tone: ${v.tone}`);
    for (const rule of v.rules ?? []) out.push(`- ${rule}`);
    for (const ex of v.examples ?? []) out.push(`- Do: "${ex.do}"${ex.dont ? ` — not: "${ex.dont}"` : ""}`);
  }
  if (brand.assets?.length) {
    out.push("", "## Assets (use these files as they are; never redraw or recolour a logo)");
    for (const a of brand.assets) out.push(`- \`${a.path}\` — ${a.use || "(no use note)"}`);
  }
  if (brand.source?.url) out.push("", `Source: ${brand.source.url}${brand.source.importedAt ? ` (imported ${brand.source.importedAt})` : ""}`);
  return out;
}

// --- get_brand --------------------------------------------------------------------

export async function getBrand(args: { projectDir?: string } = {}): Promise<ToolAnswer> {
  const root = resolveProjectDir(args.projectDir);
  const loaded = readBrand(root);
  if (!loaded) {
    return {
      text: [
        `No ${BRAND_FILE} in ${root}.`,
        "",
        "The project uses the kit accents (data-accent) until a brand profile exists. To create one:",
        "- from a website: import_design_system({ url }) → confirm with the user → save the draft as vamos.brand.json;",
        "- from a colour only: propose_accent({ colour }) and write a minimal profile ({ name, colors: { accent } });",
        `- then apply it: apply_design_system({ projectDir }) or \`${BRAND_APPLY_COMMAND}\`.`,
        "",
        "Do not invent brand colours, fonts or logos: ask the user.",
      ].join("\n"),
      data: { found: false, file: null, brand: null, issues: [] },
    };
  }
  const lib = await loadBrandLib();
  const issues = brandIssues(loaded.raw, root, lib);
  let accent: GeneratedAccent | null = null;
  if (loaded.brand && lib) {
    try {
      accent = lib.generateAccent(loaded.brand.colors.accent, loaded.brand.colors.accentDark);
    } catch (error) {
      issues.unshift({ severity: "error", path: "colors.accent", message: `Not a usable colour: ${(error as Error).message}` });
    }
  }
  const out = loaded.brand ? brandSummary(loaded.brand, accent) : [`# ${BRAND_FILE} (invalid)`];
  out.push("", issues.length ? `## Issues (${issues.length})` : "No issues found.");
  if (issues.length) out.push(...formatBrandIssues(issues));
  out.push("", `File: ${loaded.file}. Apply or re-sync with apply_design_system or \`${BRAND_APPLY_COMMAND}\`.`);
  return { text: out.join("\n"), data: { found: true, file: loaded.file, brand: loaded.raw, accent, issues } };
}

// --- propose_accent ---------------------------------------------------------------

export async function proposeAccent(args: { colour: string; dark?: string }): Promise<ToolAnswer> {
  const colour = args.colour?.trim();
  if (!colour) throw new ToolError('colour is empty. Pass a CSS colour, e.g. "#0f766e" or "oklch(0.55 0.1 180)".');
  const lib = await requireBrandLib();
  const accent = generateAccentSafe(lib, colour, args.dark);
  const failing = [accent.contrast.fgOnBase, accent.contrast.inkLightOnLight, accent.contrast.inkDarkOnDark, accent.dark ? accent.contrast.darkFgOnBase : undefined].some(
    (r) => r !== undefined && r < MIN_TEXT_CONTRAST,
  );
  const out = [
    `Accent from \`${colour}\`:`,
    "",
    "```css",
    accentCss(accent),
    "```",
    "",
    ...contrastRows(accent),
  ];
  if (accent.warnings.length) out.push("", "Adjustments and warnings:", ...accent.warnings.map((w) => `- ${w}`));
  out.push(
    "",
    failing
      ? "At least one pair is below 4.5:1. Do not use that variable for text; tell the user and suggest a darker or lighter source colour."
      : "All text pairs pass. Put the colour in vamos.brand.json (colors.accent) and apply it; never paste these values into components.",
  );
  return { text: out.join("\n"), data: { colour, accent, ok: !failing } };
}

// --- import_design_system ---------------------------------------------------------

const MAX_HTML_BYTES = 3_000_000;
const MAX_CSS_BYTES = 1_500_000;
const MAX_STYLESHEETS = 10;
const FETCH_TIMEOUT_MS = 15_000;

type Fetch = typeof fetch;

async function fetchText(fetchImpl: Fetch, url: string, maxBytes: number, accept: string): Promise<{ text: string; url: string; contentType: string; truncated: boolean }> {
  const response = await fetchImpl(url, {
    redirect: "follow",
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    headers: { accept, "user-agent": "vamos-ui-mcp (+https://ui.vamos.ist)" },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}`.trim());
  const contentType = response.headers.get("content-type") ?? "";
  if (!response.body) return { text: await response.text(), url: response.url || url, contentType, truncated: false };
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  let truncated = false;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    chunks.push(value);
    if (size >= maxBytes) {
      truncated = true;
      await reader.cancel().catch(() => undefined);
      break;
    }
  }
  return { text: Buffer.concat(chunks).toString("utf8"), url: response.url || url, contentType, truncated };
}

/** Linked stylesheets worth fetching (Google Fonts CSS is skipped: the link itself is the evidence). */
export function stylesheetLinks(html: string, baseUrl: string): string[] {
  const links: string[] = [];
  for (const match of html.matchAll(/<link\b[^>]*>/gi)) {
    const tag = match[0];
    if (!/\brel\s*=\s*["']?[^"'>]*\bstylesheet\b/i.test(tag)) continue;
    const href = /\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i.exec(tag);
    const value = href?.[1] ?? href?.[2] ?? href?.[3];
    if (!value) continue;
    try {
      const abs = new URL(value, baseUrl);
      if (!/^https?:$/.test(abs.protocol) || abs.hostname === "fonts.googleapis.com") continue;
      links.push(abs.href);
    } catch {
      /* ignore malformed href */
    }
  }
  return [...new Set(links)].slice(0, MAX_STYLESHEETS);
}

function renderEvidence(evidence: unknown, limit = 30): string[] {
  if (evidence === undefined || evidence === null) return [];
  const line = (v: unknown) => {
    if (v && typeof v === "object" && "field" in v && "value" in v) {
      const e = v as { field: unknown; value: unknown; reason?: unknown };
      return truncate(`\`${String(e.field)}\` = ${String(e.value)}${e.reason ? ` — ${String(e.reason)}` : ""}`, 200);
    }
    return truncate(typeof v === "string" ? v : JSON.stringify(v), 180);
  };
  const out: string[] = [];
  if (Array.isArray(evidence)) {
    for (const e of evidence.slice(0, limit)) out.push(`- ${line(e)}`);
    if (evidence.length > limit) out.push(`- … ${evidence.length - limit} more`);
  }
  else if (typeof evidence === "object") {
    for (const [key, value] of Object.entries(evidence as Record<string, unknown>)) {
      if (out.length >= limit) break;
      if (Array.isArray(value)) {
        if (!value.length) continue;
        out.push(`- **${key}:** ${value.slice(0, 6).map(line).join("; ")}${value.length > 6 ? ` (+${value.length - 6} more)` : ""}`);
      } else if (value !== undefined && value !== null && value !== "") out.push(`- **${key}:** ${line(value)}`);
    }
  } else out.push(`- ${line(evidence)}`);
  return out;
}

export interface ImportArgs {
  url?: string;
  html?: string;
  css?: string[];
  base_url?: string;
  name?: string;
}

export async function importDesignSystem(args: ImportArgs, deps: { fetch?: Fetch } = {}): Promise<ToolAnswer> {
  const url = args.url?.trim();
  const inlineHtml = args.html;
  if (!url === !inlineHtml) throw new ToolError("Pass exactly one of url (a page to read) or html (page source you already have).");
  const lib = await requireBrandLib();
  const fetchImpl = deps.fetch ?? fetch;

  let html: string;
  let baseUrl: string;
  const css = [...(args.css ?? [])];
  const fetched: { url: string; ok: boolean; note?: string }[] = [];
  if (url) {
    let parsed: URL;
    try {
      parsed = new URL(/^[a-z][a-z0-9+.-]*:/i.test(url) ? url : `https://${url}`);
    } catch {
      throw new ToolError(`"${url}" is not a valid URL.`);
    }
    if (!/^https?:$/.test(parsed.protocol)) throw new ToolError(`Only http(s) URLs can be imported, not ${parsed.protocol}`);
    let page;
    try {
      page = await fetchText(fetchImpl, parsed.href, MAX_HTML_BYTES, "text/html,application/xhtml+xml");
    } catch (error) {
      throw new ToolError(`Could not load ${parsed.href}: ${(error as Error).message}. If the site blocks bots or needs a login, save the page source and pass it as html.`);
    }
    if (page.contentType && !/html|xml/i.test(page.contentType)) throw new ToolError(`${page.url} returned ${page.contentType}, not an HTML page.`);
    html = page.text;
    baseUrl = page.url;
    fetched.push({ url: page.url, ok: true, ...(page.truncated ? { note: "truncated at 3 MB" } : {}) });
    const sheets = stylesheetLinks(html, baseUrl);
    const results = await Promise.allSettled(sheets.map((href) => fetchText(fetchImpl, href, MAX_CSS_BYTES, "text/css,*/*;q=0.1")));
    results.forEach((result, i) => {
      if (result.status === "fulfilled") {
        css.push(result.value.text);
        fetched.push({ url: sheets[i]!, ok: true });
      } else fetched.push({ url: sheets[i]!, ok: false, note: (result.reason as Error)?.message ?? String(result.reason) });
    });
  } else {
    html = inlineHtml!;
    baseUrl = args.base_url?.trim() || "https://example.invalid/";
  }

  let extracted;
  try {
    extracted = lib.extractBrandFromHtml(html, css, baseUrl);
  } catch (error) {
    throw new ToolError(`Could not read the page: ${(error as Error).message}`);
  }
  const found = extracted.brand;
  const host = (() => {
    try {
      return new URL(baseUrl).hostname.replace(/^www\./, "");
    } catch {
      return "";
    }
  })();
  const name = args.name?.trim() || (isText(found.name) ? found.name : "") || (host && host !== "example.invalid" ? host : "");
  const accentColour = found.colors?.accent;

  const draft: Record<string, unknown> = {
    $schema: BRAND_SCHEMA,
    name,
    colors: { ...found.colors },
    ...(found.fonts && Object.keys(found.fonts).length ? { fonts: found.fonts } : {}),
    ...(found.theme && Object.keys(found.theme).length ? { theme: found.theme } : {}),
    ...(found.voice && Object.keys(found.voice).length ? { voice: found.voice } : {}),
    assets: (found.assets ?? []).map((a) => ({ path: a.path, use: a.use ?? "" })),
    source: { ...(url ? { url: baseUrl } : found.source?.url ? { url: found.source.url } : {}), importedAt: new Date().toISOString() },
  };

  let accent: GeneratedAccent | null = null;
  if (isText(accentColour)) accent = generateAccentSafe(lib, accentColour, found.colors?.accentDark);

  const missing: string[] = [];
  if (!name) missing.push("name — ask the user for the brand or product name");
  if (!isText(accentColour)) missing.push("colors.accent — no brand colour was found; ask the user (do not pick one)");
  if (!found.fonts?.body && !found.fonts?.display) missing.push("fonts — none detected; keep a kit pairing (data-font) or ask");
  if (!found.voice?.tone && !found.voice?.rules?.length) missing.push("voice — only page text hints; ask how the brand speaks (tone, words to avoid)");
  if (!(found.assets ?? []).length) missing.push("assets — no logo found; ask the user for logo files (SVG preferred)");
  const remoteAssets = (found.assets ?? []).filter((a) => /^(https?:)?\/\//i.test(a.path));

  const sheets = css.length ? ` and ${css.length} stylesheet${css.length === 1 ? "" : "s"}` : "";
  const out = [`# Design system draft${name ? `: ${name}` : ""}`, "", `Read ${url ? baseUrl : "the given HTML"}${sheets}.`];
  const failed = fetched.filter((f) => !f.ok);
  if (failed.length) out.push(`Could not load: ${failed.map((f) => `${f.url} (${f.note})`).join("; ")}.`);
  if (accent) {
    out.push("", "## Accent", "", "```css", accentCss(accent), "```", "", ...contrastRows(accent));
    if (accent.warnings.length) out.push("", ...accent.warnings.map((w) => `- ${w}`));
  }
  const evidence = renderEvidence(extracted.evidence);
  if (evidence.length) out.push("", "## Evidence (why each value was picked)", ...evidence);
  const alternatives = (extracted.colours ?? [])
    .map((c) => (c && typeof c === "object" && "hex" in c ? (c as { hex: string; reasons?: string[] }) : null))
    .filter((c): c is { hex: string; reasons?: string[] } => !!c && c.hex.toLowerCase() !== String(accentColour ?? "").toLowerCase())
    .slice(0, 4);
  if (alternatives.length) {
    out.push("", "## Other colour candidates (offer them if the accent looks wrong)", ...alternatives.map((c) => `- \`${c.hex}\`${c.reasons?.length ? ` — ${truncate(c.reasons.join("; "), 140)}` : ""}`));
  }
  if (missing.length) out.push("", "## Missing — ask, do not guess", ...missing.map((m) => `- ${m}`));
  out.push("", "## Draft vamos.brand.json", "", "```json", JSON.stringify(draft, null, 2), "```");
  out.push(
    "",
    "## Next",
    "1. Show the draft to the user and confirm every value (colours, fonts, voice). Extraction picks the most-used colours, which is not always the brand colour.",
    remoteAssets.length
      ? `2. Download the logos (${remoteAssets.length}) into the project (e.g. brand/), set each path to the local file and write a "use" note (where it goes, light/dark background, minimum size).`
      : "2. Add logo files to the project (e.g. brand/) with a \"use\" note for each.",
    `3. Save vamos.brand.json at the project root, then apply_design_system({ projectDir }) or \`${BRAND_APPLY_COMMAND}\`.`,
  );
  return { text: out.join("\n"), data: { brand: draft, accent, missing, evidence: extracted.evidence ?? null, colourCandidates: extracted.colours ?? [], fetched } };
}

function isText(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

// --- apply_design_system ----------------------------------------------------------

export interface ApplyArgs {
  projectDir: string;
  brand?: unknown;
  write?: boolean;
}

function planData(plan: DesignPlan) {
  return {
    edits: plan.edits.map((e) => ({ path: e.path, action: e.action, reason: e.reason, content: e.content })),
    manual: plan.manual,
    problems: plan.problems,
    inSync: plan.inSync,
  };
}

export async function applyDesignSystem(args: ApplyArgs): Promise<ToolAnswer> {
  const root = resolveProjectDir(args.projectDir);
  let brand: Brand;
  const fromArgs = args.brand !== undefined && args.brand !== null;
  if (fromArgs) {
    const raw = typeof args.brand === "string" ? parseJson(args.brand) : args.brand;
    const shape = validateBrandShape(raw).filter((i) => i.severity === "error");
    if (shape.length) throw new ToolError(["The brand is not valid:", ...formatBrandIssues(shape)].join("\n"));
    brand = withSchema(raw as Brand);
  } else {
    const loaded = readBrand(root);
    if (!loaded) throw new ToolError(`No ${BRAND_FILE} in ${root}. Pass brand, or create the file first (import_design_system or the vamos-import-design-system skill).`);
    if (!loaded.brand) throw new ToolError([`${BRAND_FILE} is not valid:`, ...formatBrandIssues(validateBrandShape(loaded.raw).filter((i) => i.severity === "error"))].join("\n"));
    brand = loaded.brand;
  }
  const lib = await loadBrandLib();
  const plan = planAlignment(root, brand, lib, { writeBrandFile: fromArgs });
  const blocking = plan.problems.filter((p) => p.severity === "error");

  const written: string[] = [];
  if (args.write) {
    if (blocking.length) throw new ToolError(["Nothing written; fix these first:", ...formatBrandIssues(blocking)].join("\n"));
    if (!lib) throw new ToolError(`Nothing written: brand.css cannot be generated here. Run \`${BRAND_APPLY_COMMAND}\` in ${root}.`);
    for (const e of plan.edits) {
      const abs = insideProject(root, e.path);
      await mkdir(path.dirname(abs), { recursive: true });
      insideProject(root, e.path); // re-check after mkdir (symlinked parents)
      await writeFile(abs, e.content);
      written.push(e.path);
    }
  }

  const out: string[] = [`# Apply design system "${brand.name}" to ${root}`, ""];
  if (args.write) out.push(written.length ? `Wrote ${written.length} file${written.length === 1 ? "" : "s"}: ${written.join(", ")}.` : "Nothing to write; the files are already in line.", "");
  else {
    out.push(
      "Recommended: run the CLI from the project root. It makes the file edits below, keeps formatting and records them:",
      "",
      "```sh",
      `${BRAND_APPLY_COMMAND}${fromArgs ? "   # after saving the brand as vamos.brand.json" : ""}`,
      "```",
      "",
      plan.edits.length ? "Or make these edits yourself (nothing was written):" : "No file edits needed.",
      "",
    );
  }
  out.push(...formatPlan(plan, { showContent: !args.write }));
  out.push(
    "After applying: build or change screens with the vamos-apply-design-system skill, then verify_design({ projectDir }).",
  );
  return {
    text: out.join("\n").replace(/\n{3,}/g, "\n\n"),
    data: { projectDir: root, command: BRAND_APPLY_COMMAND, written, ok: !blocking.length, ...planData(plan) },
  };
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new ToolError(`brand is not valid JSON: ${(error as Error).message}`);
  }
}

// --- verify_design ----------------------------------------------------------------

export interface VerifyDesignArgs {
  code?: string;
  filename?: string;
  projectDir?: string;
  paths?: string[];
}

interface FileResult {
  file: string;
  issues: VerifyIssue[];
}

async function requireVerifier() {
  const verify = await loadVerifier();
  if (!verify) throw new ToolError(`The verifier is not available (${verifierLoadError() ?? "vamos-ui/verify could not be loaded"}). Run \`npx vamos-ui verify\` instead.`);
  return verify;
}

function verifyProjectFiles(root: string, verify: (code: string, filename: string) => VerifyIssue[], paths: string[] | undefined, project: VerifyProject | null = null) {
  const config = readProjectConfig(root);
  const inputs = paths?.length ? paths : DEFAULT_ROOTS.filter((r) => existsSync(path.join(root, r)));
  const exclude = !paths?.length && config ? [config.uiDir] : [];
  const collected = collectSourceFiles(root, inputs, exclude);
  const results: FileResult[] = [];
  const sources: { path: string; content: string }[] = [];
  for (const abs of collected.files) {
    const rel = toPosix(path.relative(root, abs));
    const content = readFileSync(abs, "utf8");
    sources.push({ path: rel, content });
    const issues = verify(content, rel);
    if (issues.length) results.push({ file: rel, issues });
  }
  // Whole-project checks (links to missing routes, website launch basics) only when no paths narrow it.
  if (project && !paths?.length) {
    const all = listProjectPaths(root);
    const siteFile = path.join(root, "vamos.site.json");
    const siteJson = existsSync(siteFile) ? readFileSync(siteFile, "utf8") : undefined;
    for (const { file, ...issue } of project({ paths: all, sources, sizes: publicImageSizes(root, all), siteJson })) {
      let entry = results.find((r) => r.file === file);
      if (!entry) results.push((entry = { file, issues: [] }));
      entry.issues.push(issue);
    }
  }
  const count = (s: VerifyIssue["severity"]) => results.reduce((n, r) => n + r.issues.filter((i) => i.severity === s).length, 0);
  return { inputs, collected, results, errors: count("error"), warnings: count("warning") };
}

export async function verifyDesign(args: VerifyDesignArgs): Promise<ToolAnswer> {
  if (args.code !== undefined) {
    const verify = await requireVerifier();
    const filename = args.filename?.trim() || "component.tsx";
    const issues = verify(args.code, filename);
    const ok = !issues.some((i) => i.severity === "error");
    return { text: formatIssues(issues, filename), data: { mode: "code", ok, issues } };
  }
  if (!args.projectDir) throw new ToolError("Pass code (+ filename) to check one file, or projectDir to check the project and its brand.");
  const root = resolveProjectDir(args.projectDir);
  const verify = await requireVerifier();
  const lib = await loadBrandLib();
  const code = verifyProjectFiles(root, verify, args.paths, await loadProjectVerifier());

  const loaded = readBrand(root);
  let brandProblems: BrandIssue[] = [];
  let plan: DesignPlan | null = null;
  if (!loaded) brandProblems = [{ severity: "warning", path: BRAND_FILE, message: "No brand profile; brand checks skipped. The kit accents are in use." }];
  else if (!loaded.brand) brandProblems = brandIssues(loaded.raw, root, lib);
  else {
    plan = planAlignment(root, loaded.brand, lib);
    brandProblems = [
      ...plan.problems,
      ...plan.edits.map((e): BrandIssue => ({ severity: "error", path: e.path, message: `Out of line with the brand: ${e.reason}` })),
      ...plan.manual.map((m): BrandIssue => ({ severity: "warning", ...(m.path ? { path: m.path } : {}), message: `${m.message}${m.snippet ? ` ${m.snippet}` : ""}` })),
    ];
  }
  const brandErrors = brandProblems.filter((p) => p.severity === "error").length;
  const ok = code.errors === 0 && brandErrors === 0;

  const out = [
    `# Design check: ${root}`,
    "",
    `Code: ${code.collected.files.length} file${code.collected.files.length === 1 ? "" : "s"} in ${code.inputs.join(", ") || "(none)"} — ${code.errors} error${code.errors === 1 ? "" : "s"}, ${code.warnings} warning${code.warnings === 1 ? "" : "s"}.`,
  ];
  if (code.collected.truncated) out.push(`Stopped at ${MAX_FILES} files; pass paths to check the rest.`);
  if (code.collected.skippedLarge.length) out.push(`Skipped (over 1 MB): ${code.collected.skippedLarge.join(", ")}.`);
  for (const r of code.results.slice(0, 25)) {
    out.push("", `## ${r.file}`);
    for (const i of r.issues) out.push(`- ${i.severity === "error" ? "error  " : "warning"} ${i.line}:${i.column} [${i.rule}] ${i.message}${i.fix ? ` → ${i.fix}` : ""}`);
  }
  if (code.results.length > 25) out.push("", `${code.results.length - 25} more files with issues; run \`npx vamos-ui verify --json\` for all of them.`);
  out.push("", `## Brand (${loaded ? BRAND_FILE : "none"}; same checks as \`${BRAND_CHECK_COMMAND}\`)`);
  out.push(...(brandProblems.length ? formatBrandIssues(brandProblems) : ["- In line with vamos.brand.json."]));
  out.push(
    "",
    "## Not checked by this tool",
    "- How it looks: screenshot desktop (1440px) and mobile (375px) in light and dark, solid and glass. Report what you see; do not assume.",
    "- Copy against voice.tone / voice.rules, one primary action per view, logos used per their \"use\" note.",
    "",
    ok ? "No blocking issues." : `Not in line. Fix the errors, or see the plan with update_design({ projectDir }) / \`${UPDATE_DRY_RUN_COMMAND}\`.`,
  );
  return {
    text: out.join("\n"),
    data: { mode: "project", ok, files: code.collected.files.length, errors: code.errors, warnings: code.warnings, results: code.results, brand: brandProblems },
  };
}

// --- update_design ----------------------------------------------------------------

export async function updateDesign(args: { projectDir: string; paths?: string[] }): Promise<ToolAnswer> {
  const root = resolveProjectDir(args.projectDir);
  const lib = await loadBrandLib();
  const loaded = readBrand(root);
  const verify = await loadVerifier();

  const out = [`# Update plan: ${root}`, "", `This is what \`${UPDATE_DRY_RUN_COMMAND}\` reports. Nothing was changed.`, ""];
  let plan: DesignPlan | null = null;
  const data: Record<string, unknown> = { projectDir: root, command: UPDATE_DRY_RUN_COMMAND };

  if (!loaded) out.push("## Brand", `- No ${BRAND_FILE}: the brand step is skipped. Create one with the vamos-import-design-system skill to bring the project in line with a brand.`, "");
  else if (!loaded.brand) {
    const issues = brandIssues(loaded.raw, root, lib);
    out.push("## Brand", `- ${BRAND_FILE} is invalid; fix it first:`, ...formatBrandIssues(issues), "");
    data.brandIssues = issues;
  } else {
    plan = planAlignment(root, loaded.brand, lib);
    out.push(`## Brand "${loaded.brand.name}"`, "");
    out.push(...(plan.edits.length || plan.manual.length || plan.problems.length ? formatPlan(plan) : ["Already in line with vamos.brand.json.", ""]));
    Object.assign(data, planData(plan));
  }

  // Safe automatic fixes: the same library call `vamos-ui update --fix` makes.
  let fixable = 0;
  if (verify && lib?.fixSource) {
    const config = readProjectConfig(root);
    const accent = loaded?.brand?.colors?.accent ?? PRESET_ACCENTS[config?.theme?.accent ?? "lime"];
    const fonts = loaded?.brand?.fonts;
    const inputs = args.paths?.length ? args.paths : DEFAULT_ROOTS.filter((r) => existsSync(path.join(root, r)));
    const collected = collectSourceFiles(root, inputs, !args.paths?.length && config ? [config.uiDir] : []);
    const counts = new Map<string, { from: string; to: string; count: number }>();
    const files: { file: string; changes: number; remaining: number }[] = [];
    for (const abs of collected.files) {
      const rel = toPosix(path.relative(root, abs));
      const { code, changes } = lib.fixSource(readFileSync(abs, "utf8"), rel, { accent, fonts });
      if (!changes.length) continue;
      files.push({ file: rel, changes: changes.length, remaining: verify(code, rel).length });
      for (const c of changes) {
        const key = `${c.from}\u0000${c.to}`;
        const entry = counts.get(key) ?? { from: c.from, to: c.to, count: 0 };
        entry.count++;
        counts.set(key, entry);
      }
    }
    fixable = files.reduce((n, f) => n + f.changes, 0);
    const mappings = [...counts.values()].sort((a, b) => b.count - a.count || a.from.localeCompare(b.from));
    out.push(`## Automatic fixes (\`${UPDATE_FIX_COMMAND}\`)`, "");
    if (!files.length) out.push("- Nothing to fix automatically.");
    else {
      out.push(`${fixable} change${fixable === 1 ? "" : "s"} in ${files.length} file${files.length === 1 ? "" : "s"}:`, "");
      for (const f of files.slice(0, 20)) out.push(`- ${f.file}: ${f.changes} change${f.changes === 1 ? "" : "s"}${f.remaining ? `, ${f.remaining} issue${f.remaining === 1 ? "" : "s"} left for a person` : ""}`);
      if (files.length > 20) out.push(`- … ${files.length - 20} more files`);
      out.push("", "| From | To | × |", "|---|---|---|");
      for (const m of mappings.slice(0, 20)) out.push(`| \`${m.from}\` | ${m.to ? `\`${m.to}\`` : "(removed)"} | ${m.count} |`);
      if (mappings.length > 20) out.push(`| … | ${mappings.length - 20} more | |`);
    }
    out.push("");
    data.fixes = { changes: fixable, files, mappings };
  }

  if (verify) {
    const code = verifyProjectFiles(root, verify, args.paths, await loadProjectVerifier());
    const byRule = new Map<string, { count: number; files: Set<string> }>();
    for (const r of code.results) for (const i of r.issues) {
      const entry = byRule.get(i.rule) ?? { count: 0, files: new Set<string>() };
      entry.count++;
      entry.files.add(r.file);
      byRule.set(i.rule, entry);
    }
    out.push(`## Code (${code.collected.files.length} files: ${code.errors} errors, ${code.warnings} warnings)`, "");
    if (!byRule.size) out.push("- No rule violations.");
    for (const [rule, entry] of [...byRule].sort((a, b) => b[1].count - a[1].count)) {
      const files = [...entry.files];
      out.push(`- \`${rule}\` × ${entry.count} in ${files.slice(0, 4).join(", ")}${files.length > 4 ? ` (+${files.length - 4})` : ""}`);
    }
    out.push("");
    data.code = { files: code.collected.files.length, errors: code.errors, warnings: code.warnings, byRule: Object.fromEntries([...byRule].map(([k, v]) => [k, { count: v.count, files: [...v.files] }])) };
  } else out.push("## Code", `- Verifier unavailable here (${verifierLoadError() ?? "not loaded"}); \`npx vamos-ui verify\` lists the violations.`, "");

  out.push(
    "## Order",
    `1. \`${UPDATE_DRY_RUN_COMMAND}\` — the diff of the automatic fixes${plan?.edits.length ? " and the brand.css update" : ""}. Show it to the user.`,
    `2. \`${UPDATE_FIX_COMMAND}\` — applies them${fixable ? ` (${fixable} change${fixable === 1 ? "" : "s"})` : ""} and regenerates a stale brand.css. Without --fix, \`vamos-ui update\` only reports.`,
    "3. Fix what is left by hand, file by file (colours with no safe token, hand-rolled overlays → kit components, z-index, labels); copy follows the brand voice.",
    "4. verify_design({ projectDir }) until clean, then screenshot desktop + mobile, light + dark.",
    "Kit components that changed upstream are a separate step: `npx vamos-ui upgrade` (edited files are kept unless --overwrite).",
  );
  return { text: out.join("\n").replace(/\n{3,}/g, "\n\n"), data };
}

