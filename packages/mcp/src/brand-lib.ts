import type { Brand, BrandIssue, GeneratedAccent } from "./types.js";

/** The functions the server uses from "vamos-ui/brand", after normalisation. */
export interface BrandLib {
  generateAccent(colour: string, dark?: string): GeneratedAccent;
  brandCss(brand: Brand): string;
  extractBrandFromHtml(html: string, css: string[], baseUrl: string): ExtractedBrand;
  checkBrand(brand: Brand): BrandIssue[];
  /** The safe fixes `vamos-ui update --fix` applies (palette classes and raw colours to tokens…). Absent in older libraries. */
  fixSource?(code: string, filename: string, options: { accent?: string; fonts?: Brand["fonts"] }): { code: string; changes: FixChange[] };
}

/** One change fixSource() makes; `to` is empty when a class was removed. */
export interface FixChange {
  line: number;
  kind: string;
  from: string;
  to: string;
}

/** What extractBrandFromHtml() found: a partial brand plus the evidence for each guess. */
export interface ExtractedBrand {
  brand: Partial<Brand>;
  evidence: unknown;
  /** Other accent candidates, best first ({ hex, score, reasons } when the library provides them). */
  colours?: unknown[];
}

let loaded: Promise<BrandLib | null> | undefined;
let loadError: string | undefined;

/** The contract says "Partial<Brand> + evidence"; accept { brand, evidence } and { ...brand, evidence }. */
export function normalizeExtracted(raw: unknown): ExtractedBrand {
  if (!raw || typeof raw !== "object") return { brand: {}, evidence: undefined };
  const record = raw as Record<string, unknown>;
  const colours = Array.isArray(record.colours) ? record.colours : undefined;
  if (record.brand && typeof record.brand === "object") {
    return { brand: record.brand as Partial<Brand>, evidence: record.evidence, ...(colours ? { colours } : {}) };
  }
  const { evidence, colours: _c, fonts: maybeFonts, ...brand } = record;
  // `fonts` is a brand field unless it holds candidate lists ({ body: [...] }).
  const fontsIsBrand = maybeFonts && typeof maybeFonts === "object" && !Object.values(maybeFonts).some(Array.isArray);
  return { brand: { ...(brand as Partial<Brand>), ...(fontsIsBrand ? { fonts: maybeFonts as Brand["fonts"] } : {}) }, evidence, ...(colours ? { colours } : {}) };
}

/** checkBrand() issues may be strings or objects with severity/level and path/field. */
export function normalizeIssues(raw: unknown): BrandIssue[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((entry): BrandIssue => {
    if (typeof entry === "string") return { severity: /^warn/i.test(entry) ? "warning" : "error", message: entry };
    const e = (entry ?? {}) as Record<string, unknown>;
    const level = String(e.severity ?? e.level ?? "error").toLowerCase();
    const where = e.path ?? e.field ?? e.key;
    return {
      severity: level.startsWith("warn") || level === "info" ? "warning" : "error",
      message: String(e.message ?? e.text ?? JSON.stringify(entry)),
      ...(where !== undefined ? { path: String(where) } : {}),
    };
  });
}

/** The library expects every container present (fonts, theme, voice, assets); files may omit them. */
export function completeBrand(brand: Brand): Brand {
  return { ...brand, fonts: brand.fonts ?? {}, theme: brand.theme ?? {}, voice: brand.voice ?? {}, assets: brand.assets ?? [] };
}

function wrap(mod: Record<string, unknown>): BrandLib | null {
  const missing = ["generateAccent", "brandCss", "extractBrandFromHtml", "checkBrand"].filter((name) => typeof mod[name] !== "function");
  if (missing.length) {
    loadError = `"vamos-ui/brand" does not export ${missing.join(", ")}.`;
    return null;
  }
  const m = mod as unknown as {
    generateAccent: (c: string, options?: { dark?: string }) => GeneratedAccent;
    brandCss: (b: Brand) => string;
    extractBrandFromHtml: (h: string, c: string[], u: string) => unknown;
    checkBrand: (b: Brand) => unknown;
    fixSource?: (code: string, filename: string, options: { accent?: string; fonts?: Brand["fonts"] }) => { code: string; changes: FixChange[] };
  };
  const fix = m.fixSource;
  return {
    generateAccent: (colour, dark) => m.generateAccent(colour, dark ? { dark } : undefined),
    brandCss: (brand) => m.brandCss(completeBrand(brand)),
    extractBrandFromHtml: (html, css, baseUrl) => normalizeExtracted(m.extractBrandFromHtml(html, css, baseUrl)),
    checkBrand: (brand) => normalizeIssues(m.checkBrand(completeBrand(brand))),
    ...(typeof fix === "function" ? { fixSource: (code: string, filename: string, options: { accent?: string; fonts?: Brand["fonts"] }) => fix(code, filename, options) } : {}),
  };
}

/**
 * Loads the brand library from the CLI package ("vamos-ui/brand"). Bundled into the published
 * server when it can be resolved at build time; otherwise the import fails at runtime and the
 * brand tools explain that instead of crashing the server.
 */
export function loadBrandLib(): Promise<BrandLib | null> {
  loaded ??= import("vamos-ui/brand").then(
    (mod) => wrap(mod as unknown as Record<string, unknown>),
    (error: unknown) => {
      loadError = (error as Error)?.message ?? String(error);
      return null;
    },
  );
  return loaded;
}

export function brandLibLoadError(): string | undefined {
  return loadError;
}

/** Test hook: use a specific library (raw module shape), null to disable, undefined to reset. */
export function setBrandLib(mod: Record<string, unknown> | null | undefined): void {
  if (mod === undefined) {
    loaded = undefined;
    loadError = undefined;
    return;
  }
  loadError = mod === null ? "brand library disabled" : undefined;
  loaded = Promise.resolve(mod === null ? null : wrap(mod));
}
