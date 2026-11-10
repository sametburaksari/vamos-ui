/**
 * vamos-ui/brand — brand tooling for Vamos UI: accent generation with WCAG contrast,
 * brand.css output, brand extraction from pages and documents, checks and safe code fixes.
 * Pure: no Node built-ins and no dependencies, so it bundles into editors, agents and servers.
 */
export { generateAccent, SURFACES, TEXT_CONTRAST, UI_CONTRAST, type AccentContrast, type AccentPalette, type GenerateAccentOptions } from "./accent";
export { brandCss, brandHasFonts, readBrandCssVars, BRAND_CSS_FILE, type BrandCssOptions } from "./css";
export {
  createBrandCollector,
  extractBrandFromHtml,
  googleFontsFamilies,
  linkedStylesheets,
  parseCss,
  type BrandCollector,
  type BrandDraft,
  type BrandEvidence,
  type ColourCandidate,
  type CssInput,
  type CssRule,
  type ExtractedBrand,
  type FontCandidate,
} from "./extract";
export { accentVarContrast, checkBrand } from "./check";
export { fixClassList, fixSource, FIX_MAPPINGS, type FixChange, type FixKind, type FixOptions, type FixResult } from "./fix";
export { brandFontsUrl, googleFontsLinks, nextFontSnippet, searchFonts, type FontRole } from "./fonts";
export { contrastRatio, deltaE, formatOklch, parseColor, toHex, type Oklch } from "./color";
export {
  BRAND_AXIS_VALUE,
  BRAND_FILE,
  BRAND_JSON_SCHEMA,
  BRAND_SCHEMA,
  emptyBrand,
  parseBrand,
  serializeBrand,
  type Brand,
  type BrandAsset,
  type BrandColors,
  type BrandFonts,
  type BrandIssue,
  type BrandIssueSeverity,
  type BrandRadius,
  type BrandTheme,
  type BrandVoice,
} from "./types";
