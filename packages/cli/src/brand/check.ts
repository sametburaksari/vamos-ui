/** checkBrand: structure, contrast and consistency checks for vamos.brand.json. Pure. */
import { generateAccent, SURFACES, TEXT_CONTRAST } from "./accent";
import { contrastRatio, deltaE, parseColor, roundContrast } from "./color";
import { getFont, isGenericFamily } from "./fonts";
import { parseBrand, type Brand, type BrandIssue } from "./types";

/**
 * Checks a brand (raw JSON or a parsed Brand). Errors make the brand unusable (missing
 * name or accent, invalid colours or theme values); warnings are worth fixing; info is advice.
 */
export function checkBrand(input: unknown): BrandIssue[] {
  const { brand, issues } = parseBrand(input);
  if (!brand) return issues;
  const add = (severity: BrandIssue["severity"], path: string, message: string, fix?: string) =>
    issues.push({ severity, path, message, ...(fix ? { fix } : {}) });

  // Colours
  const accentOk = !!brand.colors.accent && !!parseColor(brand.colors.accent);
  if (brand.colors.accent && !accentOk) add("error", "colors.accent", `"${brand.colors.accent}" is not a colour.`, "Use hex (#1d4ed8), rgb(), hsl() or oklch().");
  if (brand.colors.accentDark && !parseColor(brand.colors.accentDark)) add("error", "colors.accentDark", `"${brand.colors.accentDark}" is not a colour.`);
  if (brand.colors.neutralTint && !parseColor(brand.colors.neutralTint)) add("error", "colors.neutralTint", `"${brand.colors.neutralTint}" is not a colour.`);
  if (accentOk && (!brand.colors.accentDark || parseColor(brand.colors.accentDark))) {
    const palette = generateAccent(brand.colors.accent, { dark: brand.colors.accentDark });
    for (const w of palette.warnings) {
      // The light-mode fill differing from the brand colour is worth a look; derived dark-mode values are expected.
      const field = /^(accentDark|Dark-mode fill)/.test(w) ? "colors.accentDark" : "colors.accent";
      const severity = /^(Fill lightness|Near-white|Transparency|accentDark)/.test(w) ? "warning" : "info";
      add(severity, field, w);
    }
    const accent = parseColor(brand.colors.accent)!;
    if (brand.colors.accentDark) {
      const dark = parseColor(brand.colors.accentDark)!;
      if (deltaE(dark, accent) < 0.02) add("info", "colors.accentDark", "accentDark is the same as accent; remove it to let the dark-mode fill be derived.");
    }
    if (brand.colors.neutralTint) {
      const tint = parseColor(brand.colors.neutralTint)!;
      if (tint.c < 0.005) add("info", "colors.neutralTint", "neutralTint has no hue, so the backdrop stays neutral. Remove it or use a tinted colour.");
    }
    // Danger/success are fixed kit colours; an accent too close to them makes states ambiguous.
    const danger = parseColor("#d0303c")!;
    const success = parseColor("#0f8a5f")!;
    if (deltaE(accent, danger) < 0.08) add("warning", "colors.accent", "The accent is very close to the danger colour; primary and destructive actions will look alike.", "Use the soft or outline button for primary actions near destructive ones, or adjust the accent.");
    else if (deltaE(accent, success) < 0.06) add("info", "colors.accent", "The accent is close to the success colour; success states will look like the accent.");
  }

  // Fonts
  const roles = ["display", "body", "mono"] as const;
  for (const role of roles) {
    const fam = brand.fonts[role];
    if (!fam) continue;
    if (isGenericFamily(fam)) {
      add("info", `fonts.${role}`, `"${fam}" is a system/generic family; nothing is loaded and the kit default stack is kept.`);
      continue;
    }
    const font = getFont(fam);
    if (!font) {
      add("warning", `fonts.${role}`, `"${fam}" is not in the kit font catalog (59 families with latin-ext).`, "It still loads from Google Fonts by name if it exists there; check Turkish/latin-ext glyphs or pick a catalog family (vamos-ui brand init).");
      continue;
    }
    if (font.family !== fam) add("info", `fonts.${role}`, `Catalog name is "${font.family}".`);
    if (role === "mono" && font.category !== "mono") add("warning", "fonts.mono", `${font.family} is not monospaced; code and tabular IDs will not align.`, "Pick a mono family (JetBrains Mono, Geist Mono, IBM Plex Mono …).");
    if (role === "body" && ["display", "handwriting", "mono"].includes(font.category)) add("warning", "fonts.body", `${font.family} is a ${font.category} face; it is hard to read at UI sizes.`, "Use it for display only and pick a sans or text serif for body.");
    if (role === "body" && font.category === "condensed") add("info", "fonts.body", `${font.family} is condensed; keep it for headings and labels if long text feels tight.`);
  }
  const loaded = new Set(roles.map((r) => brand.fonts[r]).filter((f): f is string => !!f && !isGenericFamily(f)).map((f) => getFont(f)?.family ?? f));
  if (loaded.size > 3) add("warning", "fonts", "More than three families; every one is a download.");

  // Voice
  if (!brand.voice.tone && !brand.voice.rules?.length)
    add(
      "info",
      "voice",
      brand.voice.examples?.length
        ? "Voice has examples but no tone or rules. A tone and two or three rules help people and agents write copy that sounds like the brand."
        : "No voice yet. A tone and two or three rules help people and agents write copy that sounds like the brand.",
    );
  for (const [i, e] of (brand.voice.examples ?? []).entries()) {
    if (e.dont && e.dont.trim() === e.do.trim()) add("warning", `voice.examples[${i}]`, '"do" and "dont" are the same text.');
  }
  const seen = new Set<string>();
  for (const r of brand.voice.rules ?? []) {
    const k = r.toLowerCase();
    if (seen.has(k)) add("info", "voice.rules", `Duplicate rule: "${r}".`);
    seen.add(k);
  }

  // Assets
  const paths = new Set<string>();
  for (const [i, a] of brand.assets.entries()) {
    if (paths.has(a.path)) add("warning", `assets[${i}]`, `${a.path} is listed twice.`);
    paths.add(a.path);
  }
  if (!brand.assets.some((a) => /logo|wordmark/i.test(`${a.path} ${a.use}`))) add("info", "assets", "No logo listed. Add one with a use note so it is placed correctly.");

  return issues;
}

/** Contrast of four accent variables as written in a stylesheet (for checking hand edits). */
export function accentVarContrast(vars: Record<string, string>): { name: string; ratio: number; against: string; ok: boolean }[] {
  const out: { name: string; ratio: number; against: string; ok: boolean }[] = [];
  const base = vars["--accent-base"];
  const fg = vars["--accent-fg"];
  if (base && fg) {
    const r = contrastRatio(fg, base);
    if (Number.isFinite(r)) out.push({ name: "--accent-fg on --accent-base", ratio: roundContrast(r), against: base, ok: r >= TEXT_CONTRAST });
  }
  const light = vars["--accent-ink-light"];
  if (light) {
    const r = contrastRatio(light, SURFACES.light.hardest);
    if (Number.isFinite(r)) out.push({ name: "--accent-ink-light on light surfaces", ratio: roundContrast(r), against: SURFACES.light.hardest, ok: r >= TEXT_CONTRAST });
  }
  const dark = vars["--accent-ink-dark"];
  if (dark) {
    const r = contrastRatio(dark, SURFACES.dark.hardest);
    if (Number.isFinite(r)) out.push({ name: "--accent-ink-dark on dark surfaces", ratio: roundContrast(r), against: SURFACES.dark.hardest, ok: r >= TEXT_CONTRAST });
  }
  return out;
}

export type { Brand };
