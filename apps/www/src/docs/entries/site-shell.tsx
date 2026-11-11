import { ex, type DocEntry } from "../types";
import Demo from "../examples/site-shell/demo";
import Accent from "../examples/site-shell/accent";
import Locales from "../examples/site-shell/locales";
import Dark from "../examples/site-shell/dark";
import CustomNav from "../examples/site-shell/custom-nav";

const entry: DocEntry = {
  slug: "site-shell",
  title: "Site shell",
  group: "Site blocks",
  description:
    "The frame of a whole website block: its own look (an accent from one brand colour, plus font, material and density) scoped to the site root, an EN / TR switch and inner pages — all from server-rendered blocks. Links like ?page=pricing, ?page=home#faq and ?lang=tr inside the shell switch in place; a page change scrolls to the top, moves focus to the page’s h1, marks matching links aria-current=\"page\" and follows back/forward. Overlays opened inside keep the site’s theme.",
  source: ["blocks/site/site-shell.tsx", "blocks/site/shared/site-accent.ts", "blocks/site/shared/site-routing.ts"],
  basedOn: "ThemeScope",
  usage: `import { SiteShell, SiteShellLocale, SiteShellPage, Navbar, Hero, PageIntro, sitePageHref } from "@vamos-ui/react/blocks";

export default function Site() {
  return (
    <SiteShell accent="#B4532A" font="editorial" material="solid" density="comfortable" pages={["home", "shop"]}>
      <SiteShellLocale code="en">
        <Navbar
          items={[{ label: "Shop", href: sitePageHref("shop") }, { label: "FAQ", href: sitePageHref("home", "faq") }]}
          locales={[{ code: "en", href: "?lang=en" }, { code: "tr", href: "?lang=tr" }]}
          …
        />
        <SiteShellPage id="home"><Hero … /></SiteShellPage>
        <SiteShellPage id="shop"><PageIntro title="Shop" … /></SiteShellPage>
      </SiteShellLocale>
      <SiteShellLocale code="tr">…</SiteShellLocale>
    </SiteShell>
  );
}`,
  demo: ex("demo", "Two pages, one brand colour", "site-shell/demo.tsx", Demo, "Navbar and footer stay; the page between them switches. Try the navbar links and the hero buttons."),
  examples: [
    ex("accent", "Accent from one colour", "site-shell/accent.tsx", Accent, "siteAccent() is the same OKLCH maths as `vamos-ui brand`: the fill keeps the brand colour where it can, text on it is white or dark ink, and accent ink is darkened (light) or lightened (dark) until it reaches 4.5:1."),
    ex("locales", "EN / TR switch", "site-shell/locales.tsx", Locales, "Each SiteShellLocale renders only while active and carries its own lang attribute. Keep one locale per page for money, dates and times (12- or 24-hour, never both)."),
    ex("dark", "Very dark brand colour on a dark site", "site-shell/dark.tsx", Dark, "Colours too dark for dark surfaces get a lighter dark-mode fill; light sections inside get the brand fill back."),
    ex("custom-nav", "Own page navigation (client)", "site-shell/custom-nav.tsx", CustomNav, "useSiteShell() gives page, locale and navigate(); SiteShellLink sets aria-current for you."),
  ],
  api: [
    {
      name: "SiteShell",
      props: [
        { name: "accent", type: "string", description: "A preset name (lime, ocean, ember, rose, graphite, or your own like brand) → data-accent. A colour (#hex, rgb(), oklch()) → the four accent variables on the root, contrast-checked." },
        { name: "accentDark", type: "string", description: "Explicit dark-mode fill for a colour accent; derived when the colour is too dark." },
        { name: "font", type: "string", description: "→ data-font (editorial, grotesk, corporate, system or your own)." },
        { name: "material", type: '"glass" | "solid"', description: "→ data-material. Websites usually want solid." },
        { name: "density", type: '"comfortable" | "compact" | "spacious"', description: "→ data-density." },
        { name: "theme", type: '"light" | "dark"', description: "Force a mode for the whole site. Default: inherit." },
        { name: "dir", type: '"ltr" | "rtl"', description: "Direction (also for Radix parts)." },
        { name: "locales / defaultLocale", type: "string[] / string", default: '["en", "tr"] / first', description: "Locale codes; the default is left out of the URL." },
        { name: "locale / onLocaleChange", type: "string / (locale) => void", description: "Controlled locale." },
        { name: "pages / defaultPage", type: "string[] / string", default: '["home"] / first', description: "Page ids; the default page has a clean URL." },
        { name: "page / onPageChange", type: "string / (page) => void", description: "Controlled page." },
        { name: "routing", type: '"search" | "hash" | "memory"', default: '"search"', description: "Where the page lives: ?page=, #page= or nowhere (previews, docs). The locale uses ?lang= unless memory." },
        { name: "pageParam / localeParam", type: "string", default: '"page" / "lang"', description: "URL keys." },
        { name: "className", type: "string", description: "Merged onto the root (vb-scope font-sans text-fg). Add the scene colour and min height here." },
      ],
    },
    { name: "SiteShellPage", props: [{ name: "id", type: "string", description: "Page id from pages; rendered only while current." }, { name: "title", type: "string", description: "document.title after navigating to this page." }] },
    { name: "SiteShellLocale", props: [{ name: "code", type: "string", description: "Locale code; rendered only while current, inside a lang wrapper." }] },
    { name: "SiteShellLink", props: [{ name: "page / anchor", type: "string", description: "Target page and optional in-page anchor; aria-current when it is the current page." }] },
    { name: "useSiteShell()", props: [{ name: "returns", type: "{ page, locale, pages, locales, navigate(to), hrefFor(page, anchor?) }", description: "For client components inside the shell." }] },
    {
      name: "Helpers (server-safe)",
      props: [
        { name: "sitePageHref(page, anchor?)", type: "string", description: '"?page=shop", "?page=home#faq" — for Navbar, Footer and CTA hrefs in server components.' },
        { name: "siteLocaleHref(code)", type: "string", description: '"?lang=tr".' },
        { name: "siteAccent(colour, { dark? })", type: "SiteAccentPalette", description: "base, fg, inkLight, inkDark, dark?, measured contrast and warnings. Throws on a non-colour." },
        { name: "siteAccentCss(palette, key)", type: "string", description: 'The scoped stylesheet under [data-site-accent="key"] (the shell renders it for you).' },
      ],
    },
  ],
  notes: [
    "Every language and page is rendered on the server; the shell only shows one. For a real multi-route site, route per page and locale and keep SiteShell for the look (or use ThemeScope).",
    "Plain #anchor links keep working on the current page. Links to another page's section use sitePageHref(\"home\", \"faq\").",
  ],
  covers: [],
};

export default entry;
