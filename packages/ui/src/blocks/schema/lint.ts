// lintPage(): the D6 "doesn't look AI-generated" rules + structure + translation completeness.
// Warnings, not locks — builders surface them next to the block.

import { walkFields } from "./walk";
import { isLocaleMap, type LocaleCode } from "./localized";
import { stripEmphasis } from "./emphasis";
import { countWords, richToText, type RichDoc } from "./rich-doc";
import { isCoreTextType } from "./nodes";
import { localizeProps } from "./localize";
import type { BlockRegistry } from "./define-block";
import type { BlockNode, VamosDoc } from "./types";
import type { LintIssue, LintIssueInput } from "./lint-types";

/** Stock phrases that make copy read machine-written (D6-6). Matched case-insensitively. */
export const CLICHE_PHRASES: Record<string, readonly string[]> = {
  en: ["unlock", "seamless", "elevate", "supercharge", "revolutionize", "revolutionise", "next-gen", "next generation", "ai-powered", "empower", "take it to the next level", "lorem ipsum", "game-changer", "cutting-edge", "world-class", "best-in-class"],
  tr: ["yeni nesil", "dijital dönüşüm", "bir üst seviyeye taşı", "işinizi büyütün", "sınırları zorlayın", "fark yaratın"],
};

export interface LintOptions {
  /** Locales to check translations for. Default: `doc.locales`. */
  locales?: readonly LocaleCode[];
  /** Max words in a heading before a warning. Default 9. */
  maxHeadingWords?: number;
  /** Max card-like (`surface`) sections per page. Default 2. */
  maxCardSections?: number;
}

export interface LintReport {
  issues: LintIssue[];
  /** Per-locale translation completeness, 0–100 (only when more than one locale). */
  completeness: Record<LocaleCode, number>;
  errorCount: number;
  warningCount: number;
}

const lower = (s: string) => s.toLocaleLowerCase("tr").replace(/\s+/g, " ");

function textOf(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && (value as RichDoc).type === "doc") return richToText(value as RichDoc);
  return "";
}

/** Hue of an `oklch(L C H)` string, or null. */
export function oklchHue(color: string): number | null {
  const m = /^oklch\(\s*[\d.]+%?\s+([\d.]+)\s+([\d.]+)/.exec(color);
  if (!m) return null;
  return Number(m[1]) < 0.03 ? null : Number(m[2]);
}

/**
 * Checks a document against the registry and the kit's editorial rules.
 *
 * ```ts
 * const { issues, completeness } = lintPage(doc, siteBlocks);
 * // completeness → { en: 100, tr: 82 }
 * ```
 */
export function lintPage(doc: VamosDoc, registry: BlockRegistry, opts: LintOptions = {}): LintReport {
  const issues: LintIssue[] = [];
  const locales = opts.locales ?? doc.locales ?? (doc.lang ? [doc.lang] : ["en"]);
  const maxWords = opts.maxHeadingWords ?? 9;
  const ids = new Map<string, number>();
  const anchors = new Map<string, number>();
  const filled: Record<string, number> = Object.fromEntries(locales.map((l) => [l, 0]));
  let localizedTotal = 0;
  let coreH1 = 0;
  let pageTitleBlocks = 0;
  let cardSections = 0;
  let hasImagery = false;
  const surfaces = new Set<string>();
  let bodyCount = 0;

  const add = (node: BlockNode | undefined, i: LintIssueInput & { locale?: string }) =>
    issues.push({ severity: i.severity ?? "warning", code: i.code, message: i.message, path: i.path, locale: i.locale, blockId: node?.id, blockType: node?.type });

  const visit = (node: BlockNode, region: string) => {
    ids.set(node.id, (ids.get(node.id) ?? 0) + 1);
    if (node.anchor) anchors.set(node.anchor, (anchors.get(node.anchor) ?? 0) + 1);
    if (region === "body") {
      bodyCount++;
      surfaces.add(`${node.theme?.surface ?? "scene"}/${node.theme?.mode ?? "inherit"}`);
    }
    if (node.theme?.surface === "surface") cardSections++;
    if (node.theme?.surface === "media") hasImagery = true;
    if (typeof node.theme?.accent === "string") {
      const hue = oklchHue(node.theme.accent);
      if (hue !== null && hue >= 265 && hue <= 320) add(node, { code: "violet-accent", message: "Purple/violet custom accents read as generic; prefer a hue outside 265–320°." });
    }

    if (isCoreTextType(node.type) && !registry.has(node.type)) {
      if (node.type === "heading" && (node.props as { level?: number } | undefined)?.level === 1) coreH1++;
    } else {
      const def = registry.get(node.type);
      if (!def) {
        add(node, { code: "unknown-block", message: `Unknown block type "${node.type}". It is kept but not rendered.` });
      } else {
        if ((node.v ?? 1) > def.version) add(node, { code: "newer-version", message: `Saved with v${node.v}; this site knows v${def.version}.` });
        if (def.supports.pageTitle) pageTitleBlocks++;
        const parsed = def.schema.safeParse(node.props ?? {});
        if (!parsed.success) {
          for (const iss of parsed.error.issues) add(node, { severity: "error", code: "invalid-props", message: iss.message, path: ["props", ...iss.path.map(String)].join(".") });
        }
        let primaries = 0;
        walkFields(def.schema, node.props, (f) => {
          const kind = f.meta?.field;
          if (kind === "image" && f.value) hasImagery = true;
          if (kind === "cta" && (f.value as { style?: string } | undefined)?.style === "primary") primaries++;
          if (!f.localized) return;
          // translation completeness
          if (locales.length > 1) {
            localizedTotal++;
            for (const l of locales) {
              const has = !isLocaleMap(f.value) ? textOf(f.value) !== "" || typeof f.value !== "string" : textOf((f.value as Record<string, unknown>)[l]) !== "";
              if (has) filled[l] = (filled[l] ?? 0) + 1;
              else add(node, { severity: "info", code: "missing-translation", message: `Missing ${l} translation.`, path: `props.${f.path}`, locale: l });
            }
          }
          // copy rules, per locale value
          const values: [string | undefined, unknown][] = isLocaleMap(f.value) ? Object.entries(f.value) : [[undefined, f.value]];
          for (const [loc, raw] of values) {
            const t = textOf(raw);
            if (!t) continue;
            if (kind === "heading" && countWords(stripEmphasis(t)) > maxWords) add(node, { code: "heading-too-long", message: `Headings read best under ${maxWords + 1} words.`, path: `props.${f.path}`, locale: loc });
            const lt = lower(t);
            const lists = loc ? [CLICHE_PHRASES[loc.split("-")[0]!] ?? [], CLICHE_PHRASES.en!] : Object.values(CLICHE_PHRASES);
            const hit = lists.flat().find((p) => lt.includes(p));
            if (hit) add(node, { code: "cliche-copy", message: `“${hit}” is stock copy; say what the business actually does.`, path: `props.${f.path}`, locale: loc });
          }
        });
        if (primaries > 1) add(node, { code: "multiple-primary-cta", message: "Use one primary action per block; make the others secondary." });
        if (def.lint && parsed.success) {
          const plain = localizeProps(def.schema, parsed.data, { locale: locales[0] ?? "en", fallback: locales.slice(1) });
          for (const i of def.lint(plain as never, node)) add(node, i);
        }
      }
    }
    for (const list of Object.values(node.slots ?? {})) for (const c of list) visit(c, "slot");
  };

  for (const n of doc.layout?.header ?? []) visit(n, "header");
  for (const n of doc.blocks) visit(n, "body");
  for (const n of doc.layout?.footer ?? []) visit(n, "footer");
  for (const n of doc.layout?.overlay ?? []) visit(n, "overlay");

  for (const [id, n] of ids) if (n > 1) add(undefined, { severity: "error", code: "duplicate-id", message: `Block id "${id}" is used ${n} times; ids must be unique.` });
  for (const [a, n] of anchors) if (n > 1) add(undefined, { severity: "error", code: "duplicate-anchor", message: `Anchor "#${a}" is used ${n} times.` });
  const h1s = coreH1 + (pageTitleBlocks > 0 ? 1 : 0);
  if (h1s > 1) add(undefined, { severity: "error", code: "multiple-h1", message: "A page has one h1. Demote the extra level-1 headings." });
  if (h1s === 0 && bodyCount > 0) add(undefined, { severity: "info", code: "missing-h1", message: "No page title: start with a hero or page intro, or add a level-1 heading." });
  if (cardSections > (opts.maxCardSections ?? 2)) add(undefined, { code: "too-many-cards", message: `${cardSections} card sections; keep at most ${opts.maxCardSections ?? 2} and let the rest breathe on the page.` });
  if (bodyCount >= 4 && surfaces.size === 1 && !hasImagery) add(undefined, { severity: "info", code: "monotone-page", message: "Every section has the same background and there is no imagery; vary one surface or add a photo." });

  const completeness: Record<string, number> = {};
  if (locales.length > 1) for (const l of locales) completeness[l] = localizedTotal ? Math.round(((filled[l] ?? 0) / localizedTotal) * 100) : 100;

  return { issues, completeness, errorCount: issues.filter((i) => i.severity === "error").length, warningCount: issues.filter((i) => i.severity === "warning").length };
}

