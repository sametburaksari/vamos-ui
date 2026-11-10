// Contract of the CLI's brand library entry ("vamos-ui/brand"). Keeps this package
// typecheck-clean whether or not packages/cli has built it; the real module must match.
// Loaded lazily through src/brand-lib.ts, which normalises the looser parts of the shape.
declare module "vamos-ui/brand" {
  export interface BrandColors {
    accent: string;
    accentDark?: string;
    neutralTint?: string;
  }
  export interface BrandFonts {
    display?: string;
    body?: string;
    mono?: string;
  }
  export interface BrandTheme {
    dark?: boolean;
    material?: "glass" | "solid";
    density?: "comfortable" | "compact";
    radius?: "sharp" | "default" | "round";
  }
  export interface BrandVoice {
    tone?: string;
    rules?: string[];
    examples?: { do: string; dont?: string }[];
  }
  export interface BrandAsset {
    path: string;
    use: string;
  }
  export interface Brand {
    $schema?: string;
    name: string;
    colors: BrandColors;
    fonts?: BrandFonts;
    theme?: BrandTheme;
    voice?: BrandVoice;
    assets?: BrandAsset[];
    source?: { url?: string; importedAt?: string };
  }
  export interface GeneratedAccent {
    base: string;
    fg: string;
    inkLight: string;
    inkDark: string;
    contrast: { fgOnBase: number; inkLightOnLight: number; inkDarkOnDark: number };
    warnings: string[];
  }
  export function generateAccent(colour: string, options?: { dark?: string }): GeneratedAccent;
  export function brandCss(brand: Brand): string;
  export function extractBrandFromHtml(html: string, css: string[], baseUrl: string): unknown;
  export function checkBrand(brand: Brand): unknown[];
  export function fixSource(code: string, filename: string, options?: { accent?: string; fonts?: BrandFonts }): { code: string; changes: { line: number; kind: string; from: string; to: string }[] };
}
