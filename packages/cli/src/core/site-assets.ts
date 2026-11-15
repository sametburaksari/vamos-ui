import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { BRAND_CSS_FILE, readBrandCssVars } from "../brand/css";
import { parseColor, toHex } from "../brand/color";
import type { ThemeConfig, VamosConfig } from "./types";

/** The kit accents (mirrors [data-accent] in packages/ui/src/styles.css): the fill and the text on it. */
const ACCENTS: Record<string, { base: string; fg: string }> = {
  lime: { base: "oklch(0.89 0.21 122)", fg: "oklch(0.17 0.02 120)" },
  ocean: { base: "oklch(0.55 0.17 245)", fg: "#fff" },
  ember: { base: "oklch(0.7 0.19 45)", fg: "oklch(0.18 0.03 40)" },
  rose: { base: "oklch(0.58 0.21 10)", fg: "#fff" },
  graphite: { base: "oklch(0.25 0.01 120)", fg: "#fff" },
};

/** Scene and text colours of the light and dark theme (styles.css :root / .dark). */
const SCHEMES = {
  light: { scene: "#eef0ea", fg: "#12150f", muted: "#5a6053" },
  dark: { scene: "#0c0e0a", fg: "#f1f3ec", muted: "#a7ad9c" },
} as const;

export interface SiteColors {
  accent: string;
  accentFg: string;
  scene: string;
  fg: string;
  muted: string;
  /** Corner radius of the icon tile in a 64-unit box. */
  radius: number;
  /** Generic font family for the monogram. */
  serif: boolean;
}

const hex = (css: string | undefined, fallback: string) => {
  const c = css ? parseColor(css) : null;
  return c ? toHex(c) : fallback;
};

/** The site's colours as hex (favicon, Open Graph image): theme accent from vamos.json, brand.css for "brand". */
export function siteColors(root: string, config: Partial<Pick<VamosConfig, "uiDir" | "theme">>): SiteColors {
  const theme: ThemeConfig = config.theme ?? {};
  const scheme = SCHEMES[theme.theme === "dark" ? "dark" : "light"];
  let accent = ACCENTS[theme.accent ?? "lime"] ?? ACCENTS.lime!;
  if (theme.accent === "brand" && config.uiDir) {
    const file = path.join(root, config.uiDir, BRAND_CSS_FILE);
    if (existsSync(file)) {
      const vars = readBrandCssVars(readFileSync(file, "utf8")).light;
      if (vars["--accent-base"] && parseColor(vars["--accent-base"])) accent = { base: vars["--accent-base"], fg: vars["--accent-fg"] ?? "#fff" };
    }
  }
  return {
    accent: hex(accent.base, "#c5e84a"),
    accentFg: hex(accent.fg, "#ffffff"),
    ...scheme,
    radius: theme.radius === "sharp" ? 6 : theme.radius === "round" ? 32 : 14,
    serif: theme.font === "editorial",
  };
}

/** The first letter of the business name, upper-cased for its language ("istanbul" → "İ" in tr). */
export function monogram(name: string, locale?: string): string {
  const letter = [...name.normalize("NFC")].find((ch) => /[\p{L}\p{N}]/u.test(ch)) ?? "•";
  try {
    return letter.toLocaleUpperCase(locale || undefined);
  } catch {
    return letter.toUpperCase();
  }
}

const SANS = "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const SERIF = "ui-serif, Georgia, 'Times New Roman', serif";
const escapeXml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/**
 * app/icon.svg: one letter on a flat accent tile. No gradient, no outline, no effects; the letter
 * sits on an alphabetic baseline so it is optically centred in every renderer (cap height ≈ 0.72 em).
 */
export function iconSvg(name: string, colors: SiteColors, locale?: string): string {
  const letter = escapeXml(monogram(name, locale));
  const size = colors.serif ? 42 : 40;
  const baseline = (32 + size * 0.36).toFixed(1);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="${escapeXml(name)}">
  <rect width="64" height="64" rx="${colors.radius}" fill="${colors.accent}"/>
  <text x="32" y="${baseline}" text-anchor="middle" font-family="${colors.serif ? SERIF : SANS}" font-size="${size}" font-weight="${colors.serif ? 500 : 650}" fill="${colors.accentFg}">${letter}</text>
</svg>
`;
}

/** app/opengraph-image.tsx: business name and description on the site's colours (next/og). */
export function opengraphImage(siteImport: string, colors: SiteColors, locale?: string): string {
  return `// Written by \`vamos-ui site essentials\`. The 1200×630 link-preview image (og:image) from vamos.site.json, in the site's colours. Edit freely; it is never overwritten.
import { ImageResponse } from "next/og";
import { SITE_URL, filled, site } from "${siteImport}";

// The theme colours when this file was written (vamos.json theme / brand.css).
const COLORS = { scene: "${colors.scene}", fg: "${colors.fg}", muted: "${colors.muted}", accent: "${colors.accent}", accentFg: "${colors.accentFg}" };

export const alt = filled(site.name) ?? "Website";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  const name = filled(site.name) ?? "";
  const description = filled(site.description);
  const letter = [...name].find((ch) => /[\\p{L}\\p{N}]/u.test(ch))?.toLocaleUpperCase(${JSON.stringify(locale || "en")}) ?? "";
  const host = SITE_URL.replace(/^https?:\\/\\//, "");
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 80, background: COLORS.scene, color: COLORS.fg }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ width: 72, height: 72, borderRadius: ${Math.round(colors.radius * 1.125)}, background: COLORS.accent, color: COLORS.accentFg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44, fontWeight: 700 }}>{letter}</div>
          <div style={{ fontSize: 28, color: COLORS.muted }}>{host}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div style={{ fontSize: name.length > 28 ? 68 : 84, fontWeight: 700, letterSpacing: -2, lineHeight: 1.05 }}>{name}</div>
          {description ? <div style={{ fontSize: 32, lineHeight: 1.35, color: COLORS.muted, maxWidth: 960 }}>{description.length > 160 ? \`\${description.slice(0, 157)}…\` : description}</div> : null}
        </div>
      </div>
    ),
    size,
  );
}
`;
}
