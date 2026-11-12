import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createTwoFilesPatch } from "diff";
import { bool, str, type ParsedArgs } from "../args";
import { generateAccent, SURFACES, type AccentPalette } from "../brand/accent";
import { accentVarContrast, checkBrand } from "../brand/check";
import { parseColor, toRgb255 } from "../brand/color";
import { BRAND_CSS_FILE, brandCss, brandHasFonts, readBrandCssVars } from "../brand/css";
import type { BrandEvidence, ExtractedBrand } from "../brand/extract";
import { fontPairings, getFont, googleFontsLinks, nextFontSnippet, searchFonts, type FontRole } from "../brand/fonts";
import { importFromPath, importFromUrl, type ImportResult } from "../brand/node/sources";
import { BRAND_AXIS_VALUE, BRAND_FILE, emptyBrand, parseBrand, serializeBrand, THEME_VALUES, type Brand, type BrandIssue } from "../brand/types";
import { readConfig, requireConfig, writeConfig, findProjectRoot } from "../core/config";
import { addBrandImport, brandImportPath, stylesImportPath } from "../core/css";
import { detectProject } from "../core/project";
import { CliError, type ThemeConfig, type VamosConfig } from "../core/types";
import { colorDiff, confirm, out, p, pad, pc, plural, printJson, spinner, unwrap, type Context } from "../ui";
import { htmlAttributes } from "./theme";

/** Where the theme attributes live: the root layout or the HTML entry. */
const ROOT_DOCUMENTS = [
  "src/app/layout.tsx",
  "app/layout.tsx",
  "src/app/layout.jsx",
  "app/layout.jsx",
  "src/app/layout.js",
  "app/layout.js",
  "index.html",
  "src/index.html",
  "pages/_document.tsx",
  "src/pages/_document.tsx",
];

const BRAND_HELP = `${pc.bold("vamos-ui brand")}  Define the brand once; the kit follows it.

${pc.bold("Usage")}
  npx vamos-ui brand <command>

${pc.bold("Commands")}
  init                 Create vamos.brand.json step by step (accent, fonts, theme, voice)
                       --name, --accent, --accent-dark, --display, --body, --mono,
                       --dark, --material, --density, --radius, --tone
  import <url|path>    Propose a brand from a website, a folder of brand files or a logo
                       --yes accepts the proposal, --no-download keeps remote asset URLs
  apply                Write <uiDir>/brand.css, import it, set vamos.json and print the <html> setup
  check                Contrast and consistency report (exit 1 on errors)

${pc.dim("The brand file is vamos.brand.json in the project root. Docs: https://ui.vamos.ist/docs/theming")}`;

// ---------------------------------------------------------------------------
// Files
// ---------------------------------------------------------------------------

export interface LoadedBrand {
  brand: Brand;
  issues: BrandIssue[];
  file: string;
}

export async function loadBrand(root: string): Promise<LoadedBrand | null> {
  const file = path.join(root, BRAND_FILE);
  if (!existsSync(file)) return null;
  let raw: unknown;
  try {
    raw = JSON.parse(await readFile(file, "utf8"));
  } catch (err) {
    throw new CliError(`${BRAND_FILE} is not valid JSON.`, (err as Error).message);
  }
  const { brand, issues } = parseBrand(raw);
  if (!brand) throw new CliError(issues[0]!.message);
  return { brand, issues: checkBrand(raw), file };
}

async function requireBrand(root: string): Promise<LoadedBrand> {
  const loaded = await loadBrand(root);
  if (!loaded) throw new CliError(`No ${BRAND_FILE} found in ${root}.`, "Run `npx vamos-ui brand init` or `npx vamos-ui brand import <url|folder>`.");
  return loaded;
}

async function writeBrand(root: string, brand: Brand): Promise<string> {
  const file = path.join(root, BRAND_FILE);
  await writeFile(file, serializeBrand(brand));
  return file;
}

function safePalette(brand: Brand): AccentPalette | null {
  try {
    return generateAccent(brand.colors.accent, { dark: brand.colors.accentDark });
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Terminal output
// ---------------------------------------------------------------------------

const truecolor = (env: NodeJS.ProcessEnv) => pc.isColorSupported && !env.NO_COLOR;

/** A coloured chip: `text` in `fg` on `bg`. Falls back to plain text without colour support. */
function chip(ctx: Context, bg: string, fg: string, text: string): string {
  const b = parseColor(bg);
  const f = parseColor(fg);
  if (!truecolor(ctx.env) || !b || !f) return text.trim() ? `[${text.trim()}]`.padEnd(text.length) : "";
  const [br, bgc, bb] = toRgb255(b);
  const [fr, fgc, fb] = toRgb255(f);
  return `\x1b[48;2;${br};${bgc};${bb}m\x1b[38;2;${fr};${fgc};${fb}m${text}\x1b[0m`;
}

/** A colour square followed by a space, or nothing without colour support. */
const swatch = (ctx: Context, colour: string, width = 4) => (truecolor(ctx.env) ? `${chip(ctx, colour, colour, " ".repeat(width))} ` : "");

const tick = (ratio: number) => (ratio >= 4.5 ? pc.green("✔") : pc.red("✖"));

export function paletteLines(ctx: Context, palette: AccentPalette): string[] {
  const row = (label: string, sample: string, value: string, ratio: number | undefined, against: string) =>
    `${pad(label, 11)}${sample}  ${pc.dim(pad(value, 26))}${ratio === undefined ? "" : `${tick(ratio)} ${ratio.toFixed(2)}:1 ${pc.dim(against)}`}`;
  const lines = [
    row("Fill", chip(ctx, palette.base, palette.fg, "  Button  "), palette.base, palette.contrast.fgOnBase, "text on fill"),
    row("Ink light", chip(ctx, SURFACES.light.hardest, palette.inkLight, "  Link    "), palette.inkLight, palette.contrast.inkLightOnLight, "on light"),
    row("Ink dark", chip(ctx, SURFACES.dark.hardest, palette.inkDark, "  Link    "), palette.inkDark, palette.contrast.inkDarkOnDark, "on dark"),
  ];
  if (palette.dark) lines.push(row("Dark fill", chip(ctx, palette.dark.base, palette.dark.fg, "  Button  "), palette.dark.base, palette.contrast.darkFgOnBase, "dark mode"));
  return lines;
}

function showPalette(ctx: Context, palette: AccentPalette, title = "Accent"): void {
  const lines = paletteLines(ctx, palette);
  for (const w of palette.warnings) lines.push(pc.yellow(`! ${w}`));
  p.note(lines.join("\n"), title);
}

function printIssues(issues: BrandIssue[], showInfo = true): void {
  for (const i of issues) {
    if (i.severity === "info" && !showInfo) continue;
    const label = i.severity === "error" ? pc.red("error  ") : i.severity === "warning" ? pc.yellow("warning") : pc.dim("info   ");
    // Long paths (src/app/layout.tsx) get the message on the next line.
    const long = !!i.path && i.path.length >= 18;
    out(`  ${label}  ${i.path ? pc.dim(long ? i.path : pad(i.path, 18)) : ""}${long ? `\n  ${" ".repeat(9)}${" ".repeat(18)}` : ""}${i.message}`);
    if (i.fix) out(`  ${" ".repeat(9)}${" ".repeat(i.path ? 18 : 0)}${pc.dim("→ " + i.fix)}`);
  }
}

// ---------------------------------------------------------------------------
// brand init
// ---------------------------------------------------------------------------

/** A text prompt that always resolves to a trimmed string (Ctrl+C cancels). */
async function ask(opts: Parameters<typeof p.text>[0]): Promise<string> {
  const value = unwrap(await p.text(opts));
  return typeof value === "string" ? value.trim() : "";
}

async function askColour(message: string, initial: string, optional = false): Promise<string> {
  return ask({
    message,
    initialValue: initial,
    placeholder: optional ? "leave empty to derive it" : "#1d4ed8, rgb(…), hsl(…) or oklch(…)",
    validate: (v) => {
      const s = (v ?? "").trim();
      if (!s) return optional ? undefined : "Enter a colour.";
      return parseColor(s) ? undefined : "Not a colour. Use hex, rgb(), hsl() or oklch().";
    },
  });
}

async function pickFont(role: FontRole, current: string | undefined): Promise<string | undefined> {
  const label = { display: "Heading font", body: "Body / UI font", mono: "Mono font" }[role];
  const keep = current ? `Keep ${current}` : "Kit default";
  const options = [
    { value: "", label: keep, hint: current ? "" : role === "mono" ? "JetBrains Mono" : "from the data-font preset" },
    ...searchFonts("", role).map((f) => ({ value: f.family, label: f.family, hint: `${f.category}${f.style ? " · " + f.style : ""} — ${f.use}` })),
  ];
  const value = unwrap(
    await p.autocomplete({
      message: `${label} ${pc.dim("(type to search the catalog)")}`,
      options,
      placeholder: "Search by name, style or use…",
      maxItems: 8,
    }),
  );
  return value === "" ? current : value;
}

export async function brandInit(ctx: Context, args: ParsedArgs): Promise<number> {
  const root = findProjectRoot(ctx.cwd);
  const existing = await loadBrand(root).catch(() => null);
  const brand: Brand = existing?.brand ?? emptyBrand();
  const flags = args.flags;
  const pkgName = await readFile(path.join(root, "package.json"), "utf8").then((t) => (JSON.parse(t) as { name?: string }).name ?? "", () => "");

  // Flags first (scripts, agents), then prompts for anything still open.
  if (str(flags, "name")) brand.name = str(flags, "name")!;
  if (str(flags, "accent")) brand.colors.accent = str(flags, "accent")!;
  if (str(flags, "accent-dark")) brand.colors.accentDark = str(flags, "accent-dark")!;
  for (const role of ["display", "body", "mono"] as const) if (str(flags, role)) brand.fonts[role] = getFont(str(flags, role)!)?.family ?? str(flags, role)!;
  if (flags.dark !== undefined) brand.theme.dark = bool(flags, "dark");
  for (const k of ["material", "density", "radius"] as const) {
    const v = str(flags, k);
    if (v === undefined) continue;
    if (!(THEME_VALUES[k] as readonly string[]).includes(v)) throw new CliError(`Unknown ${k} "${v}". Choose one of: ${THEME_VALUES[k].join(", ")}.`);
    (brand.theme as Record<string, string>)[k] = v;
  }
  if (str(flags, "tone")) brand.voice.tone = str(flags, "tone")!;

  const pickAll = async () => {
    for (const role of ["display", "body", "mono"] as const) brand.fonts[role] = await pickFont(role, brand.fonts[role]);
  };

  if (ctx.interactive) {
    p.intro(pc.bold(existing ? "Vamos UI brand · edit" : "Vamos UI brand"));
    brand.name = await ask({ message: "Brand name", initialValue: brand.name || pkgName, validate: (v) => ((v ?? "").trim() ? undefined : "Enter a name.") });

    for (;;) {
      brand.colors.accent = await askColour("Accent colour", brand.colors.accent);
      const palette = generateAccent(brand.colors.accent, { dark: brand.colors.accentDark });
      showPalette(ctx, palette, `Accent · ${brand.colors.accent}`);
      if (unwrap(await p.confirm({ message: "Use this accent?", initialValue: true }))) break;
    }
    const darkFill = await askColour(`Dark-mode fill ${pc.dim("(optional)")}`, brand.colors.accentDark ?? "", true);
    brand.colors.accentDark = darkFill || undefined;
    if (darkFill) showPalette(ctx, generateAccent(brand.colors.accent, { dark: darkFill }), "Accent with dark-mode fill");

    const mode = unwrap(
      await p.select({
        message: "Fonts",
        initialValue: brand.fonts.body || brand.fonts.display ? "keep" : "pairing",
        options: [
          ...(brand.fonts.body || brand.fonts.display ? [{ value: "keep", label: `Keep ${[brand.fonts.display, brand.fonts.body, brand.fonts.mono].filter(Boolean).join(" · ")}` }] : []),
          { value: "pairing", label: "Start from a curated pairing" },
          { value: "pick", label: "Pick each font from the catalog" },
          { value: "none", label: "Use the kit presets (data-font)" },
        ],
      }),
    );
    if (mode === "pairing") {
      const pairing = unwrap(
        await p.select({
          message: "Pairing",
          options: fontPairings.filter((x) => x.id !== "system").map((x) => ({ value: x.id, label: x.label, hint: `${x.heading} · ${x.body} — ${x.description}` })),
          maxItems: 10,
        }),
      );
      const chosen = fontPairings.find((x) => x.id === pairing)!;
      brand.fonts = { display: chosen.heading, body: chosen.body, mono: chosen.mono };
      if (unwrap(await p.confirm({ message: "Adjust individual fonts?", initialValue: false }))) await pickAll();
    } else if (mode === "pick") await pickAll();
    else if (mode === "none") brand.fonts = {};

    const scheme = unwrap(await p.select({ message: "Default theme", initialValue: brand.theme.dark ? "dark" : "light", options: [{ value: "light", label: "Light" }, { value: "dark", label: "Dark" }] }));
    brand.theme.dark = scheme === "dark";
    brand.theme.material = unwrap(await p.select({ message: "Material", initialValue: brand.theme.material ?? "solid", options: [{ value: "solid", label: "Solid" }, { value: "glass", label: "Glass", hint: "translucent surfaces with blur" }] })) as Brand["theme"]["material"];
    brand.theme.density = unwrap(await p.select({ message: "Density", initialValue: brand.theme.density ?? "comfortable", options: [{ value: "comfortable", label: "Comfortable" }, { value: "compact", label: "Compact", hint: "dense admin screens" }] })) as Brand["theme"]["density"];
    brand.theme.radius = unwrap(await p.select({ message: "Corners", initialValue: brand.theme.radius ?? "default", options: [{ value: "sharp", label: "Sharp", hint: "6px" }, { value: "default", label: "Default", hint: "14px" }, { value: "round", label: "Round", hint: "20px" }] })) as Brand["theme"]["radius"];
    if (brand.theme.radius === "default") delete brand.theme.radius;

    brand.voice.tone = (await ask({ message: `Voice: tone ${pc.dim("(optional)")}`, initialValue: brand.voice.tone ?? "", placeholder: "Warm, direct, no jargon" })) || undefined;
    const rules: string[] = [];
    const prior = brand.voice.rules ?? [];
    for (let i = 0; i < 8; i++) {
      const r = await ask({ message: `Voice rule ${i + 1} ${pc.dim("(empty to finish)")}`, initialValue: prior[i] ?? "", placeholder: i === 0 ? "Say what the button does: 'Save changes', not 'Submit'" : "" });
      if (!r) break;
      rules.push(r);
    }
    brand.voice.rules = rules;
  } else {
    if (!brand.name) brand.name = pkgName;
    if (!brand.colors.accent) throw new CliError("An accent colour is required.", "Pass --accent <colour> (and --name), or run in a terminal for the guided setup.");
    if (!brand.name) throw new CliError("A brand name is required.", "Pass --name <name>.");
  }

  const issues = checkBrand(JSON.parse(serializeBrand(brand)));
  const errors = issues.filter((i) => i.severity === "error");
  if (errors.length) {
    if (ctx.json) printJson({ written: false, issues });
    else printIssues(errors);
    return 1;
  }
  const palette = generateAccent(brand.colors.accent, { dark: brand.colors.accentDark });
  if (ctx.json) {
    if (!bool(flags, "dry-run")) await writeBrand(root, brand);
    printJson({ written: !bool(flags, "dry-run"), file: BRAND_FILE, brand: JSON.parse(serializeBrand(brand)), palette, issues });
    return 0;
  }
  if (!ctx.interactive) showPalette(ctx, palette, `Accent · ${brand.colors.accent}`);
  if (bool(flags, "dry-run")) {
    p.log.info(pc.dim(`Dry run: would write ${BRAND_FILE}.`));
    out(serializeBrand(brand));
    return 0;
  }
  await writeBrand(root, brand);
  p.log.success(`Wrote ${BRAND_FILE}`);
  printIssues(issues.filter((i) => i.severity === "warning"));
  const config = await readConfig(root);
  if (config && (ctx.yes || (ctx.interactive && (await confirm(ctx, "Apply it now (brand.css, vamos.json)?", true))))) return applyAndReport(ctx, root, config, brand, palette, args);
  p.outro(`Next: ${pc.cyan("npx vamos-ui brand apply")}`);
  return 0;
}

// ---------------------------------------------------------------------------
// brand import
// ---------------------------------------------------------------------------

function evidenceFor(evidence: BrandEvidence[], field: string, max = 3): string {
  const rs = evidence.filter((e) => e.field === field).map((e) => e.reason);
  if (!rs.length) return "";
  return pc.dim(`← ${rs.slice(0, max).join("; ")}${rs.length > max ? ` +${rs.length - max}` : ""}`);
}

function describeProposal(ctx: Context, result: ExtractedBrand, brand: Brand): void {
  const ev = result.evidence;
  const lines: string[] = [];
  lines.push(`${pad("Name", 12)}${brand.name || pc.dim("(not found)")}  ${evidenceFor(ev, "name", 1)}`);
  const accent = brand.colors.accent;
  lines.push(`${pad("Accent", 12)}${accent ? `${swatch(ctx, accent)}${accent}` : pc.red("(not found)")}  ${evidenceFor(ev, "colors.accent")}`);
  if (brand.colors.accentDark) lines.push(`${pad("Dark fill", 12)}${swatch(ctx, brand.colors.accentDark)}${brand.colors.accentDark}  ${evidenceFor(ev, "colors.accentDark", 2)}`);
  const others = result.colours.filter((c) => c.hex !== accent).slice(0, 5);
  if (others.length) lines.push(`${pad("Also seen", 12)}${others.map((c) => `${swatch(ctx, c.hex, 2)}${c.hex}`).join("  ")}`);
  for (const role of ["display", "body", "mono"] as const) {
    const fam = brand.fonts[role];
    if (fam) lines.push(`${pad(role === "display" ? "Headings" : role === "body" ? "Body" : "Mono", 12)}${fam}${getFont(fam) ? "" : pc.yellow(" (not in catalog)")}  ${evidenceFor(ev, `fonts.${role}`, 2)}`);
  }
  const theme = [brand.theme.dark ? "dark" : null, brand.theme.radius ? `${brand.theme.radius} corners` : null].filter(Boolean);
  if (theme.length) lines.push(`${pad("Theme", 12)}${theme.join(", ")}  ${evidenceFor(ev, "theme.dark", 1)}`);
  if (brand.voice.tone) lines.push(`${pad("Tone", 12)}${brand.voice.tone}`);
  if (brand.voice.rules?.length) lines.push(`${pad("Voice rules", 12)}${plural(brand.voice.rules.length, "rule")}`);
  for (const e of brand.voice.examples?.slice(0, 2) ?? []) lines.push(`${pad("Copy", 12)}${pc.italic(`"${e.do.length > 90 ? e.do.slice(0, 87) + "…" : e.do}"`)}`);
  for (const a of brand.assets.slice(0, 6)) lines.push(`${pad("Asset", 12)}${a.path.length > 70 ? "…" + a.path.slice(-69) : a.path}  ${pc.dim(a.use.split(".")[0]!)}`);
  p.note(lines.join("\n"), "Proposed brand");
}

/** Merges an extraction into an existing brand: extracted values fill gaps and replace colours/fonts. */
function mergeProposal(base: Brand | null, result: ExtractedBrand): Brand {
  const b = base ? (JSON.parse(serializeBrand(base)) as Brand) : emptyBrand();
  b.colors ??= { accent: "" };
  b.fonts ??= {};
  b.theme ??= {};
  b.voice ??= {};
  b.assets ??= [];
  const d = result.brand;
  if (d.name && !b.name) b.name = d.name;
  if (d.colors?.accent) {
    b.colors.accent = d.colors.accent;
    if (d.colors.accentDark) b.colors.accentDark = d.colors.accentDark;
  }
  if (d.fonts) b.fonts = { ...b.fonts, ...d.fonts };
  if (d.theme) b.theme = { ...b.theme, ...d.theme };
  if (d.voice) {
    b.voice.tone ??= d.voice.tone;
    if (d.voice.rules?.length) b.voice.rules = [...new Set([...(b.voice.rules ?? []), ...d.voice.rules])];
    if (d.voice.examples?.length && !b.voice.examples?.length) b.voice.examples = d.voice.examples;
  }
  for (const a of d.assets ?? []) if (!b.assets.some((x) => x.path === a.path)) b.assets.push(a);
  if (d.source) b.source = { ...d.source, importedAt: new Date().toISOString().slice(0, 10) };
  return b;
}

async function adjustProposal(ctx: Context, result: ExtractedBrand, brand: Brand): Promise<boolean> {
  for (;;) {
    describeProposal(ctx, result, brand);
    const palette = safePalette(brand);
    if (palette) showPalette(ctx, palette, "Accent palette");
    const action = unwrap(
      await p.select({
        message: "Use this brand?",
        options: [
          { value: "accept", label: "Yes, write vamos.brand.json" },
          { value: "accent", label: "Change the accent" },
          { value: "fonts", label: "Change fonts" },
          { value: "name", label: "Change the name" },
          { value: "cancel", label: "Cancel" },
        ],
      }),
    );
    if (action === "accept") {
      if (!brand.colors.accent) {
        p.log.warn("An accent is required.");
        continue;
      }
      if (!brand.name) {
        p.log.warn("A name is required.");
        continue;
      }
      return true;
    }
    if (action === "cancel") return false;
    if (action === "name") brand.name = await ask({ message: "Brand name", initialValue: brand.name });
    if (action === "accent") {
      const options = [
        ...result.colours.slice(0, 6).map((c) => ({ value: c.hex, label: `${swatch(ctx, c.hex, 2)}${c.hex}`, hint: c.reasons.slice(0, 2).join("; ") })),
        { value: "__custom", label: "Enter a colour…" },
      ];
      const v = unwrap(await p.select({ message: "Accent", options, initialValue: brand.colors.accent }));
      brand.colors.accent = v === "__custom" ? await askColour("Accent colour", brand.colors.accent) : v;
    }
    if (action === "fonts") {
      for (const role of ["display", "body", "mono"] as const) {
        const found = result.fonts[role].slice(0, 4);
        const options = [
          { value: "__keep", label: brand.fonts[role] ? `Keep ${brand.fonts[role]}` : "Kit default" },
          ...found.filter((f) => f.family !== brand.fonts[role]).map((f) => ({ value: f.family, label: f.family, hint: `${f.inCatalog ? "" : "not in catalog · "}${f.reasons[0] ?? ""}` })),
          { value: "__search", label: "Search the catalog…" },
          ...(brand.fonts[role] ? [{ value: "__none", label: "None (kit default)" }] : []),
        ];
        const v = unwrap(await p.select({ message: role === "display" ? "Heading font" : role === "body" ? "Body font" : "Mono font", options }));
        if (v === "__search") brand.fonts[role] = await pickFont(role, brand.fonts[role]);
        else if (v === "__none") delete brand.fonts[role];
        else if (v !== "__keep") brand.fonts[role] = v;
      }
    }
  }
}

/** Saves remote logos/icons into brand/ so the brand works offline and the paths are stable. */
async function downloadAssets(root: string, brand: Brand): Promise<{ saved: string[]; failed: string[] }> {
  const saved: string[] = [];
  const failed: string[] = [];
  const dir = path.join(root, "brand");
  // Logos first (the collector lists them first), then icons and the share image.
  const remote = brand.assets.filter((a) => /^https?:\/\//.test(a.path) && /^(Logo|App icon|Favicon|Pinned-tab icon|Social share image)/.test(a.use)).slice(0, 6);
  for (const a of remote) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    try {
      const res = await fetch(a.path, { signal: ctrl.signal, headers: { "user-agent": "vamos-ui-brand-import/1.0" } });
      const type = res.headers.get("content-type") ?? "";
      if (!res.ok || !/^image\//.test(type)) throw new Error(res.ok ? `not an image (${type})` : `HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length > 2_000_000) throw new Error("larger than 2 MB");
      const ext = /svg/.test(type) ? ".svg" : /png/.test(type) ? ".png" : /jpe?g/.test(type) ? ".jpg" : /webp/.test(type) ? ".webp" : /icon/.test(type) ? ".ico" : "";
      let base = path.posix.basename(new URL(a.path).pathname).replace(/\.[a-z0-9]+$/i, "").replace(/[^\w.-]+/g, "-").slice(0, 60) || "asset";
      let name = `${base}${ext}`;
      for (let n = 2; saved.includes(`brand/${name}`); n++) name = `${base}-${n}${ext}`;
      await mkdir(dir, { recursive: true });
      await writeFile(path.join(dir, name), buf);
      a.path = `brand/${name}`;
      saved.push(a.path);
    } catch (err) {
      failed.push(`${a.path} (${(err as Error).message})`);
    } finally {
      clearTimeout(timer);
    }
  }
  return { saved, failed };
}

export async function brandImport(ctx: Context, args: ParsedArgs): Promise<number> {
  const target = args.positionals[1];
  if (!target) throw new CliError("Pass a URL or a path.", "npx vamos-ui brand import https://example.com   or   npx vamos-ui brand import ./brand");
  const root = findProjectRoot(ctx.cwd);
  const isUrl = /^https?:\/\//i.test(target) || /^[\w-]+(\.[\w-]+)+(\/|$)/.test(target) && !existsSync(path.resolve(ctx.cwd, target));
  const spin = ctx.json ? null : spinner();
  let result: ImportResult;
  spin?.start(`Reading ${target}`);
  try {
    result = isUrl ? await importFromUrl(/^https?:/i.test(target) ? target : `https://${target}`) : importFromPath(path.relative(root, path.resolve(ctx.cwd, target)) || ".", root);
    spin?.stop(`Read ${plural(result.log.read.length, "source")}${result.log.skipped.length ? pc.dim(` (${result.log.skipped.length} skipped)`) : ""}`);
  } catch (err) {
    spin?.error(`Could not read ${target}`);
    throw new CliError((err as Error).message, isUrl ? "Check the URL, or save the page and import the folder instead." : undefined);
  }

  const existing = await loadBrand(root).catch(() => null);
  const brand = mergeProposal(existing?.brand ?? null, result);
  if (!brand.name) brand.name = result.brand.name ?? "";
  if (str(args.flags, "accent")) brand.colors.accent = str(args.flags, "accent")!;
  if (str(args.flags, "name")) brand.name = str(args.flags, "name")!;

  if (ctx.json) {
    const issues = brand.colors.accent ? checkBrand(JSON.parse(serializeBrand(brand))) : [];
    let written = false;
    if (ctx.yes && brand.colors.accent && brand.name && !bool(args.flags, "dry-run")) {
      if (isUrl && bool(args.flags, "download", true)) await downloadAssets(root, brand);
      await writeBrand(root, brand);
      written = true;
    }
    printJson({ written, brand: JSON.parse(serializeBrand(brand)), evidence: result.evidence, colours: result.colours, fonts: result.fonts, log: result.log, issues });
    return brand.colors.accent ? 0 : 1;
  }

  for (const s of result.log.skipped.slice(0, 6)) p.log.message(pc.dim(`skipped ${s.what}: ${s.why}`));
  let accepted: boolean;
  if (ctx.interactive) accepted = await adjustProposal(ctx, result, brand);
  else {
    describeProposal(ctx, result, brand);
    const palette = safePalette(brand);
    if (palette) showPalette(ctx, palette, "Accent palette");
    if (!brand.colors.accent) throw new CliError("No brand colour found.", "Pass --accent <colour>, or run in a terminal to pick one.");
    if (!brand.name) throw new CliError("No brand name found.", "Pass --name <name>.");
    accepted = ctx.yes;
    if (!accepted) {
      p.log.info(`Re-run with ${pc.cyan("--yes")} to write ${BRAND_FILE}.`);
      return 0;
    }
  }
  if (!accepted) {
    p.cancel("Nothing written.");
    return 0;
  }
  if (bool(args.flags, "dry-run")) {
    p.log.info(pc.dim(`Dry run: would write ${BRAND_FILE}.`));
    out(serializeBrand(brand));
    return 0;
  }
  if (isUrl && bool(args.flags, "download", true)) {
    const { saved, failed } = await downloadAssets(root, brand);
    if (saved.length) p.log.step(`Saved ${saved.map((s) => pc.dim(s)).join(", ")}`);
    for (const f of failed) p.log.warn(`Could not download ${f}; the URL is kept.`);
  }
  await writeBrand(root, brand);
  p.log.success(`Wrote ${BRAND_FILE}${existing ? " (merged with the existing brand)" : ""}`);
  printIssues(checkBrand(JSON.parse(serializeBrand(brand))).filter((i) => i.severity !== "info"));
  p.log.message(pc.dim("Imported values are a proposal: review the voice rules and asset notes in the file."));
  const config = await readConfig(root);
  if (config && (ctx.yes || (ctx.interactive && (await confirm(ctx, "Apply it now (brand.css, vamos.json)?", true))))) {
    const palette = generateAccent(brand.colors.accent, { dark: brand.colors.accentDark });
    return applyAndReport(ctx, root, config, brand, palette, args);
  }
  p.outro(`Next: ${pc.cyan("npx vamos-ui brand apply")}`);
  return 0;
}

// ---------------------------------------------------------------------------
// brand apply
// ---------------------------------------------------------------------------

export interface ApplyResult {
  cssFile: string;
  css: string;
  cssChanged: boolean;
  previousCss: string | null;
  entry: { file: string; result: "added" | "present" | "missing"; afterStyles: boolean };
  theme: ThemeConfig;
  configChanged: boolean;
}

/** Brand theme on top of the current vamos.json theme. */
export function brandTheme(current: ThemeConfig | undefined, brand: Brand): ThemeConfig {
  const t: ThemeConfig = { ...current, accent: BRAND_AXIS_VALUE };
  if (brandHasFonts(brand)) t.font = BRAND_AXIS_VALUE;
  else if (t.font === BRAND_AXIS_VALUE) delete t.font;
  if (brand.theme.dark !== undefined) t.theme = brand.theme.dark ? "dark" : "light";
  if (brand.theme.material) t.material = brand.theme.material;
  if (brand.theme.density) t.density = brand.theme.density;
  // Corners are the data-radius axis (vamos.json theme.radius), not part of brand.css.
  if (brand.theme.radius === "sharp" || brand.theme.radius === "round") t.radius = brand.theme.radius;
  else if (brand.theme.radius === "default") delete t.radius;
  return t;
}

/** Writes brand.css, the CSS import and vamos.json. With dryRun nothing is written. */
export async function applyBrand(root: string, config: VamosConfig, brand: Brand, opts: { dryRun?: boolean; palette?: AccentPalette } = {}): Promise<ApplyResult> {
  const cssFile = path.posix.join(config.uiDir.replace(/\\/g, "/"), BRAND_CSS_FILE);
  const abs = path.join(root, cssFile);
  const css = brandCss(brand, { palette: opts.palette });
  const previousCss = existsSync(abs) ? await readFile(abs, "utf8") : null;
  const cssChanged = previousCss !== css;

  const entryAbs = path.join(root, config.css);
  let entry: ApplyResult["entry"] = { file: config.css, result: "missing", afterStyles: false };
  let nextEntry: string | null = null;
  if (existsSync(entryAbs)) {
    const current = await readFile(entryAbs, "utf8");
    const added = addBrandImport(current, brandImportPath(config.css, config.uiDir), stylesImportPath(config.css, config.uiDir));
    entry = { file: config.css, result: added ? "added" : "present", afterStyles: added ? added.afterStyles : true };
    nextEntry = added?.css ?? null;
  }
  const theme = brandTheme(config.theme, brand);
  const configChanged = JSON.stringify(theme) !== JSON.stringify(config.theme ?? {});
  if (!opts.dryRun) {
    if (cssChanged) {
      await mkdir(path.dirname(abs), { recursive: true });
      await writeFile(abs, css);
    }
    if (nextEntry !== null) await writeFile(entryAbs, nextEntry);
    if (configChanged) await writeConfig(root, { ...config, theme });
  }
  return { cssFile, css, cssChanged, previousCss, entry, theme, configChanged };
}

/** The <html> attributes and font setup for the project's framework. */
export function setupSnippets(root: string, brand: Brand, theme: ThemeConfig): { html: string; fonts: string | null; framework: string } {
  const project = detectProject(root);
  const attrs = htmlAttributes(theme);
  const next = project.framework === "next";
  const nf = next ? nextFontSnippet(brand.fonts) : null;
  const pairs = Object.entries(attrs).filter(([k]) => k !== "class");
  const classes = attrs.class ? [attrs.class] : [];
  let html: string;
  if (next) {
    const cls = nf ? `className={\`${[...classes, ...nf.classNames].join(" ")}\`}` : classes.length ? `className="${classes.join(" ")}"` : "";
    html = `<html lang="en" ${[cls, ...pairs.map(([k, v]) => `${k}="${v}"`)].filter(Boolean).join(" ")}>`;
  } else html = `<html lang="en" ${Object.entries(attrs).map(([k, v]) => `${k}="${v}"`).join(" ")}>`;
  const fonts = next ? nf?.code ?? null : googleFontsLinks(brand.fonts);
  return { html, fonts, framework: project.framework };
}

async function applyAndReport(ctx: Context, root: string, config: VamosConfig, brand: Brand, palette: AccentPalette, args: ParsedArgs): Promise<number> {
  const dryRun = bool(args.flags, "dry-run");
  const res = await applyBrand(root, config, brand, { dryRun, palette });
  const snippets = setupSnippets(root, brand, res.theme);
  if (ctx.json) {
    printJson({ dryRun, cssFile: res.cssFile, cssChanged: res.cssChanged, entry: res.entry, theme: res.theme, configChanged: res.configChanged, html: snippets.html, fonts: snippets.fonts, palette });
    return 0;
  }
  if (dryRun) {
    if (res.cssChanged) out(colorDiff(createTwoFilesPatch(res.cssFile, res.cssFile, res.previousCss ?? "", res.css, "", "", { context: 2 })));
    p.log.info(pc.dim(`Dry run: nothing was written.${res.entry.result === "added" ? ` Would import brand.css in ${res.entry.file}.` : ""}${res.configChanged ? " Would update vamos.json." : ""}`));
  } else {
    p.log.step(res.cssChanged ? `${res.previousCss === null ? "Created" : "Updated"} ${res.cssFile}` : pc.dim(`${res.cssFile} is up to date`));
    if (res.entry.result === "added") p.log.step(`Imported brand.css in ${res.entry.file}`);
    if (res.configChanged) p.log.step(`Set the theme in vamos.json (accent: brand${res.theme.font === BRAND_AXIS_VALUE ? ", font: brand" : ""})`);
  }
  if (res.entry.result === "missing") p.log.warn(`${config.css} does not exist. Import ${brandImportPath(config.css, config.uiDir)} after the Vamos UI styles yourself.`);
  else if (!res.entry.afterStyles) p.log.warn(`No Vamos UI styles import found in ${res.entry.file}; brand.css must come after it.`);
  for (const w of palette.warnings) p.log.warn(w);
  const hint = snippets.framework === "next" ? pc.dim("// app/layout.tsx") : pc.dim("<!-- index.html -->");
  p.note(`${hint}\n${snippets.html}`, "Set these attributes on <html>");
  if (snippets.fonts) p.note(snippets.fonts, snippets.framework === "next" ? "Load the fonts (next/font)" : "Load the fonts (in <head>)");
  if (!ctx.interactive || dryRun) return 0;
  p.outro(`Check it: ${pc.cyan("npx vamos-ui brand check")}  ${pc.dim("·")}  ${pc.cyan("npx vamos-ui update --fix")}`);
  return 0;
}

export async function brandApply(ctx: Context, args: ParsedArgs): Promise<number> {
  const root = findProjectRoot(ctx.cwd);
  const config = await requireConfig(root);
  const { brand, issues } = await requireBrand(root);
  const errors = issues.filter((i) => i.severity === "error");
  if (errors.length) {
    if (ctx.json) printJson({ applied: false, issues });
    else {
      p.log.error(`${BRAND_FILE} has ${plural(errors.length, "error")}:`);
      printIssues(errors);
    }
    return 1;
  }
  const palette = generateAccent(brand.colors.accent, { dark: brand.colors.accentDark });
  return applyAndReport(ctx, root, config, brand, palette, args);
}

// ---------------------------------------------------------------------------
// brand check
// ---------------------------------------------------------------------------

export interface ProjectBrandStatus {
  issues: BrandIssue[];
  cssFile: string | null;
  stale: boolean;
}

/** Checks the applied state: brand.css present, current and readable, imported, selected in vamos.json, assets on disk. */
export async function projectBrandIssues(root: string, config: VamosConfig | null, brand: Brand): Promise<ProjectBrandStatus> {
  const issues: BrandIssue[] = [];
  const add = (severity: BrandIssue["severity"], p: string, message: string, fix?: string) => issues.push({ severity, path: p, message, ...(fix ? { fix } : {}) });
  for (const [i, a] of brand.assets.entries()) {
    if (/^(https?:|data:)/.test(a.path)) continue;
    if (!existsSync(path.resolve(root, a.path))) add("error", `assets[${i}]`, `${a.path} does not exist.`, "Fix the path or remove the entry.");
  }
  if (!config) {
    add("info", "vamos.json", "No vamos.json, so brand.css is not checked.", "Run `npx vamos-ui init`, then `npx vamos-ui brand apply`.");
    return { issues, cssFile: null, stale: false };
  }
  const cssFile = path.posix.join(config.uiDir, BRAND_CSS_FILE);
  const abs = path.join(root, cssFile);
  if (!existsSync(abs)) {
    add("warning", cssFile, "brand.css has not been generated yet.", "Run `npx vamos-ui brand apply`.");
    return { issues, cssFile, stale: true };
  }
  const css = await readFile(abs, "utf8");
  let expected: string | null = null;
  try {
    expected = brandCss(brand);
  } catch {
    /* invalid colours are reported by checkBrand */
  }
  const stale = expected !== null && css !== expected;
  if (stale) add("warning", cssFile, `brand.css does not match ${BRAND_FILE} (edited by hand or out of date).`, "Run `npx vamos-ui brand apply` (or `vamos-ui update --fix`).");
  const vars = readBrandCssVars(css);
  for (const [scope, set] of [["light", vars.light], ["dark", vars.dark]] as const) {
    if (scope === "dark" && !Object.keys(set).length) continue;
    const merged = scope === "dark" ? { ...vars.light, ...set } : set;
    for (const r of accentVarContrast(scope === "dark" ? { "--accent-base": merged["--accent-base"]!, "--accent-fg": merged["--accent-fg"]! } : merged)) {
      if (!r.ok) add("error", cssFile, `${r.name}${scope === "dark" ? " (dark mode)" : ""} is ${r.ratio}:1; text needs 4.5:1.`, "Run `npx vamos-ui brand apply` to regenerate compliant values.");
    }
  }
  if (!vars.light["--accent-base"]) add("error", cssFile, 'brand.css has no [data-accent="brand"] { --accent-base … } block.');
  const entry = path.join(root, config.css);
  if (existsSync(entry)) {
    const text = await readFile(entry, "utf8");
    const imp = brandImportPath(config.css, config.uiDir);
    if (!text.includes(imp)) add("warning", config.css, `${config.css} does not import ${imp}.`, "Run `npx vamos-ui brand apply`.");
    else if (text.indexOf(imp) < text.indexOf(stylesImportPath(config.css, config.uiDir))) add("error", config.css, "brand.css is imported before the kit styles, so the kit accents win.", "Move the brand.css import below the styles.css import.");
  }
  if (config.theme?.accent !== BRAND_AXIS_VALUE) add("warning", "vamos.json", `vamos.json theme.accent is "${config.theme?.accent ?? "lime"}", not "brand".`, 'Run `npx vamos-ui brand apply` and use data-accent="brand" on <html>.');
  if (brandHasFonts(brand) && config.theme?.font !== BRAND_AXIS_VALUE) add("info", "vamos.json", 'The brand defines fonts but vamos.json theme.font is not "brand".');

  // The root element must select the brand, or the kit accent (lime) stays in place.
  const doc = ROOT_DOCUMENTS.find((f) => existsSync(path.join(root, f)));
  if (doc) {
    const htmlTag = /<html\b(?:[^>"'{]|"[^"]*"|'[^']*'|\{[^}]*\})*>/i.exec(await readFile(path.join(root, doc), "utf8"))?.[0];
    if (htmlTag) {
      const attr = (name: string) => new RegExp(`\\b${name}\\s*=\\s*(?:\\{\\s*)?(["'\`])([^"'\`]*)\\1|\\b${name}\\s*=\\s*\\{`).exec(htmlTag);
      const snippet = setupSnippets(root, brand, config.theme ?? {}).html;
      const accent = attr("data-accent");
      if (!accent) add("warning", doc, `<html> in ${doc} has no data-accent, so the kit accent is used instead of the brand.`, `Set the attributes: ${snippet}`);
      else if (accent[2] !== undefined && accent[2] !== BRAND_AXIS_VALUE) add("warning", doc, `<html> in ${doc} has data-accent="${accent[2]}", not "brand".`, `Set the attributes: ${snippet}`);
      if (brandHasFonts(brand)) {
        const font = attr("data-font");
        if (!font || (font[2] !== undefined && font[2] !== BRAND_AXIS_VALUE)) add("info", doc, `<html> in ${doc} does not set data-font="brand", so the brand fonts are not used.`);
      }
    }
  }
  return { issues, cssFile, stale };
}

export async function brandCheck(ctx: Context, _args: ParsedArgs): Promise<number> {
  const root = findProjectRoot(ctx.cwd);
  const { brand, issues } = await requireBrand(root);
  const config = await readConfig(root).catch(() => null);
  const project = await projectBrandIssues(root, config, brand);
  const all = [...issues, ...project.issues];
  const errors = all.filter((i) => i.severity === "error").length;
  const warnings = all.filter((i) => i.severity === "warning").length;
  const palette = safePalette(brand);
  if (ctx.json) {
    printJson({ ok: errors === 0, errors, warnings, issues: all, palette });
    return errors ? 1 : 0;
  }
  out(`${pc.bold(brand.name || "(unnamed brand)")} ${pc.dim(BRAND_FILE)}`);
  if (palette) for (const l of paletteLines(ctx, palette)) out(`  ${l}`);
  out("");
  printIssues(all);
  out("");
  if (!errors && !warnings) out(`${pc.green("✔")} Brand is consistent.`);
  else out(`${errors ? pc.red("✖") : pc.yellow("!")} ${[errors && pc.red(plural(errors, "error")), warnings && pc.yellow(plural(warnings, "warning"))].filter(Boolean).join(", ")}`);
  return errors ? 1 : 0;
}

// ---------------------------------------------------------------------------
// Dispatcher
// ---------------------------------------------------------------------------

export async function brand(ctx: Context, args: ParsedArgs): Promise<number> {
  const sub = args.positionals[0];
  if (bool(args.flags, "help")) {
    out(BRAND_HELP);
    return 0;
  }
  switch (sub) {
    case "init":
    case "new":
      return brandInit(ctx, args);
    case "import":
      return brandImport(ctx, args);
    case "apply":
      return brandApply(ctx, args);
    case "check":
    case "lint":
      return brandCheck(ctx, args);
    case undefined:
    case "help":
      out(BRAND_HELP);
      return sub ? 0 : 1;
    default:
      out(`${pc.red("Unknown brand command")} "${sub}".\n\n${BRAND_HELP}`);
      return 1;
  }
}
