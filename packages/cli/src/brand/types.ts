/** The vamos.brand.json contract. Pure: no Node built-ins. */

export const BRAND_FILE = "vamos.brand.json";
export const BRAND_SCHEMA = "https://ui.vamos.ist/r/brand-schema.json";
/** The accent / font axis value the generated brand.css defines. */
export const BRAND_AXIS_VALUE = "brand";

export type BrandRadius = "sharp" | "default" | "round";

export interface BrandColors {
  /** Primary brand colour, any CSS colour. Becomes the accent. */
  accent: string;
  /** Optional fill colour for dark mode (otherwise derived). */
  accentDark?: string;
  /** Optional hue for the page backdrop (--scene); kept very subtle. */
  neutralTint?: string;
}

export interface BrandFonts {
  /** Headings (Google Fonts family name, ideally from the kit catalog). */
  display?: string;
  /** UI and body text. */
  body?: string;
  /** Code, IDs, numbers. */
  mono?: string;
}

export interface BrandTheme {
  dark?: boolean;
  material?: "glass" | "solid";
  density?: "comfortable" | "compact";
  radius?: BrandRadius;
}

export interface BrandVoice {
  /** A few words, e.g. "Warm, direct, no jargon". */
  tone?: string;
  rules?: string[];
  examples?: { do: string; dont?: string }[];
}

export interface BrandAsset {
  /** Project-relative path or URL. */
  path: string;
  /** How to use it, e.g. "Primary logo on light backgrounds; min height 24px". */
  use: string;
}

export interface Brand {
  $schema?: string;
  name: string;
  colors: BrandColors;
  fonts: BrandFonts;
  theme: BrandTheme;
  voice: BrandVoice;
  assets: BrandAsset[];
  source?: { url?: string; importedAt?: string };
}

export type BrandIssueSeverity = "error" | "warning" | "info";

export interface BrandIssue {
  severity: BrandIssueSeverity;
  /** JSON path of the field, e.g. "colors.accent". */
  path: string;
  message: string;
  fix?: string;
}

export const THEME_VALUES = {
  material: ["solid", "glass"],
  density: ["comfortable", "compact"],
  radius: ["default", "sharp", "round"],
} as const;

/** A brand with every container present, for code that fills one in step by step. */
export function emptyBrand(name = ""): Brand {
  return { $schema: BRAND_SCHEMA, name, colors: { accent: "" }, fonts: {}, theme: {}, voice: {}, assets: [] };
}

/** Stable key order and no empty containers, ready for JSON.stringify. */
export function serializeBrand(brand: Brand): string {
  const prune = <T extends object>(o: T | undefined): T | undefined => {
    if (!o) return undefined;
    const entries = Object.entries(o).filter(([, v]) => v !== undefined && v !== "" && !(Array.isArray(v) && v.length === 0));
    return entries.length ? (Object.fromEntries(entries) as T) : undefined;
  };
  const voice = prune({
    tone: brand.voice?.tone,
    rules: brand.voice?.rules?.filter(Boolean),
    examples: brand.voice?.examples?.filter((e) => e.do).map((e) => (e.dont ? { do: e.do, dont: e.dont } : { do: e.do })),
  });
  const ordered = {
    $schema: brand.$schema ?? BRAND_SCHEMA,
    name: brand.name,
    colors: prune({ accent: brand.colors.accent, accentDark: brand.colors.accentDark, neutralTint: brand.colors.neutralTint }) ?? { accent: brand.colors.accent },
    fonts: prune({ display: brand.fonts?.display, body: brand.fonts?.body, mono: brand.fonts?.mono }) ?? {},
    theme: prune({ dark: brand.theme?.dark, material: brand.theme?.material, density: brand.theme?.density, radius: brand.theme?.radius }) ?? {},
    voice: voice ?? {},
    assets: (brand.assets ?? []).map((a) => ({ path: a.path, use: a.use })),
    ...(prune(brand.source) ? { source: prune(brand.source) } : {}),
  };
  return JSON.stringify(ordered, null, 2) + "\n";
}

const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
const KNOWN_KEYS = new Set(["$schema", "name", "colors", "fonts", "theme", "voice", "assets", "source"]);

/**
 * Structural validation. Returns a normalised Brand (best effort, so later checks can run)
 * plus the problems found. `brand` is null only when the input is not an object.
 */
export function parseBrand(raw: unknown): { brand: Brand | null; issues: BrandIssue[] } {
  const issues: BrandIssue[] = [];
  if (!isObj(raw)) return { brand: null, issues: [{ severity: "error", path: "", message: `${BRAND_FILE} must contain a JSON object.` }] };
  const err = (path: string, message: string, fix?: string) => issues.push({ severity: "error", path, message, ...(fix ? { fix } : {}) });
  const warn = (path: string, message: string, fix?: string) => issues.push({ severity: "warning", path, message, ...(fix ? { fix } : {}) });
  const str = (v: unknown) => (typeof v === "string" ? v.trim() : undefined);

  for (const key of Object.keys(raw)) if (!KNOWN_KEYS.has(key)) warn(key, `Unknown key "${key}" is ignored.`);

  const brand = emptyBrand(str(raw.name) ?? "");
  if (typeof raw.$schema === "string") brand.$schema = raw.$schema;
  if (!brand.name) err("name", "name is required.", 'Set "name": "Your brand".');

  if (!isObj(raw.colors)) err("colors", "colors is required.", 'Add "colors": { "accent": "#1d4ed8" }.');
  else {
    brand.colors.accent = str(raw.colors.accent) ?? "";
    if (!brand.colors.accent) err("colors.accent", "colors.accent is required.");
    for (const k of ["accentDark", "neutralTint"] as const) {
      const v = raw.colors[k];
      if (v === undefined) continue;
      if (typeof v !== "string") err(`colors.${k}`, `colors.${k} must be a CSS colour string.`);
      else if (v.trim()) brand.colors[k] = v.trim();
    }
  }

  if (raw.fonts !== undefined) {
    if (!isObj(raw.fonts)) err("fonts", "fonts must be an object.");
    else
      for (const k of ["display", "body", "mono"] as const) {
        const v = raw.fonts[k];
        if (v === undefined) continue;
        if (typeof v !== "string") err(`fonts.${k}`, `fonts.${k} must be a font family name.`);
        else if (v.trim()) brand.fonts[k] = v.trim();
      }
  }

  if (raw.theme !== undefined) {
    if (!isObj(raw.theme)) err("theme", "theme must be an object.");
    else {
      const t = raw.theme;
      if (t.dark !== undefined) {
        if (typeof t.dark !== "boolean") err("theme.dark", "theme.dark must be true or false.");
        else brand.theme.dark = t.dark;
      }
      for (const k of ["material", "density", "radius"] as const) {
        const v = t[k];
        if (v === undefined) continue;
        const allowed = THEME_VALUES[k] as readonly string[];
        if (typeof v !== "string" || !allowed.includes(v)) err(`theme.${k}`, `theme.${k} must be one of: ${allowed.join(", ")}.`);
        else (brand.theme as Record<string, string>)[k] = v;
      }
    }
  }

  if (raw.voice !== undefined) {
    if (!isObj(raw.voice)) err("voice", "voice must be an object.");
    else {
      const v = raw.voice;
      if (v.tone !== undefined) {
        if (typeof v.tone !== "string") err("voice.tone", "voice.tone must be a string.");
        else if (v.tone.trim()) brand.voice.tone = v.tone.trim();
      }
      if (v.rules !== undefined) {
        if (!Array.isArray(v.rules) || v.rules.some((r) => typeof r !== "string")) err("voice.rules", "voice.rules must be an array of strings.");
        else brand.voice.rules = (v.rules as string[]).map((r) => r.trim()).filter(Boolean);
      }
      if (v.examples !== undefined) {
        if (!Array.isArray(v.examples)) err("voice.examples", "voice.examples must be an array.");
        else {
          brand.voice.examples = [];
          v.examples.forEach((e, i) => {
            if (!isObj(e) || typeof e.do !== "string" || (e.dont !== undefined && typeof e.dont !== "string")) {
              err(`voice.examples[${i}]`, 'Each example is { "do": string, "dont"?: string }.');
              return;
            }
            brand.voice.examples!.push(e.dont ? { do: e.do, dont: e.dont as string } : { do: e.do });
          });
        }
      }
    }
  }

  if (raw.assets !== undefined) {
    if (!Array.isArray(raw.assets)) err("assets", "assets must be an array.");
    else
      raw.assets.forEach((a, i) => {
        if (!isObj(a) || typeof a.path !== "string" || !a.path.trim()) {
          err(`assets[${i}]`, 'Each asset is { "path": string, "use": string }.');
          return;
        }
        const use = typeof a.use === "string" ? a.use.trim() : "";
        if (!use) warn(`assets[${i}].use`, `Asset ${a.path} has no "use" note.`, "Say where and how it may be used, e.g. \"Logo on light backgrounds, min 24px high\".");
        brand.assets.push({ path: a.path.trim(), use });
      });
  }

  if (raw.source !== undefined) {
    if (!isObj(raw.source)) warn("source", "source must be an object; ignored.");
    else brand.source = { ...(typeof raw.source.url === "string" ? { url: raw.source.url } : {}), ...(typeof raw.source.importedAt === "string" ? { importedAt: raw.source.importedAt } : {}) };
  }
  return { brand, issues };
}

/** JSON Schema (draft 2020-12) for vamos.brand.json, for the registry to publish at BRAND_SCHEMA. */
export const BRAND_JSON_SCHEMA = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: BRAND_SCHEMA,
  title: "Vamos UI brand",
  description: "One brand definition for Vamos UI: accent, fonts, theme defaults, voice and assets. Apply it with `npx vamos-ui brand apply`.",
  type: "object",
  required: ["name", "colors"],
  additionalProperties: false,
  properties: {
    $schema: { type: "string" },
    name: { type: "string", minLength: 1 },
    colors: {
      type: "object",
      required: ["accent"],
      additionalProperties: false,
      properties: {
        accent: { type: "string", description: "Primary brand colour (hex, rgb(), hsl(), oklch() or a CSS name). Becomes the accent." },
        accentDark: { type: "string", description: "Fill colour for dark mode. Derived when omitted." },
        neutralTint: { type: "string", description: "Hue for the page backdrop (--scene); kept very subtle." },
      },
    },
    fonts: {
      type: "object",
      additionalProperties: false,
      properties: {
        display: { type: "string", description: "Heading family (Google Fonts name, ideally from the kit catalog)." },
        body: { type: "string", description: "UI and body family." },
        mono: { type: "string", description: "Code and numbers family." },
      },
    },
    theme: {
      type: "object",
      additionalProperties: false,
      properties: {
        dark: { type: "boolean" },
        material: { enum: [...THEME_VALUES.material] },
        density: { enum: [...THEME_VALUES.density] },
        radius: { enum: [...THEME_VALUES.radius] },
      },
    },
    voice: {
      type: "object",
      additionalProperties: false,
      properties: {
        tone: { type: "string" },
        rules: { type: "array", items: { type: "string" } },
        examples: {
          type: "array",
          items: { type: "object", required: ["do"], additionalProperties: false, properties: { do: { type: "string" }, dont: { type: "string" } } },
        },
      },
    },
    assets: {
      type: "array",
      items: {
        type: "object",
        required: ["path", "use"],
        additionalProperties: false,
        properties: { path: { type: "string", description: "Project-relative path or URL." }, use: { type: "string", description: "Where and how to use it." } },
      },
    },
    source: { type: "object", properties: { url: { type: "string" }, importedAt: { type: "string" } } },
  },
} as const;
