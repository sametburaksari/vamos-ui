import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/** First line of the root layout `vamos-ui create` writes. */
export const CREATE_LAYOUT_MARKER = "// vamos-ui create: starter root layout.";

/** First line of the layout once `site essentials` has filled it in. */
export const ESSENTIALS_LAYOUT_HEADER =
  "// Root layout. `vamos-ui site essentials` set the language, metadata (canonical, Open Graph) and JSON-LD from vamos.site.json via ./site. Edit freely; it is not rewritten again.";

function nextLayoutTemplate(): string | null {
  let dir = path.dirname(fileURLToPath(import.meta.url));
  for (let i = 0; i < 5; i++) {
    const file = path.join(dir, "templates", "next", "src", "app", "layout.tsx");
    if (existsSync(file)) return readFileSync(file, "utf8");
    dir = path.dirname(dir);
  }
  return null;
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const normalize = (s: string) => s.replace(/\r\n/g, "\n").replace(/[ \t]+$/gm, "").trimEnd();

let cached: RegExp | null | undefined;

/**
 * The create template as a pattern: only the title, the <html> theme attributes (`vamos-ui theme`
 * and `brand apply` change those) and lang may differ. The marker line is optional so layouts from
 * releases before it still match. Anything else edited → not the starter layout.
 */
function templatePattern(): RegExp | null {
  if (cached !== undefined) return cached;
  const text = nextLayoutTemplate();
  if (!text) return (cached = null);
  const lines = normalize(text).split("\n");
  const marker = lines[0]!.startsWith(CREATE_LAYOUT_MARKER) ? `(?:${escape(lines.shift()!)}\\n)?` : "";
  const body = escape(lines.join("\n"))
    .replace(escape("__APP_TITLE__"), '[^"\\\\\\n]*')
    .replace(escape("__LANG__"), "[A-Za-z0-9-]*")
    .replace(` ${escape("__HTML_ATTRS_JSX__")}`, '(?: [^>\\n]*)?');
  return (cached = new RegExp(`^${marker}${body}$`));
}

/** The <title> `vamos-ui create` derives from the package name ("kuzey-cicek" → "Kuzey Cicek"). */
export function appTitle(name: string): string {
  return name.replace(/[-_.]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * True when the layout is still the one `vamos-ui create` wrote (lang and theme attributes aside).
 * With `packageName`, the title must also be the one create derived from it, so a layout whose
 * title the user changed counts as edited.
 */
export function isCreatedLayout(text: string, packageName?: string): boolean {
  const re = templatePattern();
  if (!re || !re.test(normalize(text))) return false;
  if (packageName === undefined) return true;
  const title = /^ {2}title: "([^"]*)",$/m.exec(text)?.[1];
  return title === appTitle(packageName);
}

export interface LayoutImports {
  /** Module specifier of app/site.ts as seen from the layout. */
  site: string;
  /** Module specifier of app/site-json-ld.tsx as seen from the layout. */
  jsonLd: string;
}

/**
 * The create layout filled in from vamos.site.json: <html lang> from site.locale, metadata with
 * metadataBase / canonical / og:url / Open Graph / Twitter card, and <SiteJsonLd /> once in <body>.
 * Only call it on a layout isCreatedLayout() accepted.
 */
export function fillCreatedLayout(text: string, imports: LayoutImports, fallbackLang = "en"): string {
  let out = normalize(text);
  out = out.startsWith(CREATE_LAYOUT_MARKER) ? out.replace(/^[^\n]*\n/, `${ESSENTIALS_LAYOUT_HEADER}\n`) : `${ESSENTIALS_LAYOUT_HEADER}\n${out}`;
  out = out.replace('import "./globals.css";\n', () =>
    `import "./globals.css";\nimport { SITE_URL, filled, site } from "${imports.site}";\nimport { SiteJsonLd } from "${imports.jsonLd}";\n`);
  out = out.replace(/export const metadata: Metadata = \{\n[\s\S]*?\n\};/, () =>
    `const description = filled(site.description);

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: site.name, template: \`%s — \${site.name}\` },
  description,
  alternates: { canonical: "/" },
  // og:image comes from ./opengraph-image.tsx, the favicon from ./icon.svg.
  openGraph: { type: "website", url: "/", siteName: site.name, title: site.name, description, locale: filled(site.locale)?.replace("-", "_") },
  twitter: { card: "summary_large_image", title: site.name, description },
};`);
  out = out.replace(/<html lang="[^"]*"/, () => `<html lang={filled(site.locale) ?? ${JSON.stringify(fallbackLang)}}`);
  out = out.replace(/(<body\b[^>]*>)\{children\}<\/body>/, "$1\n        <SiteJsonLd />\n        {children}\n      </body>");
  return `${out}\n`;
}
