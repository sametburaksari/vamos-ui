import { ex, type DocEntry } from "../types";
import Demo from "../examples/navbar/demo";
import Split from "../examples/navbar/split-restaurant";
import Minimal from "../examples/navbar/minimal-overlay";
import Rail from "../examples/navbar/rail-saas";
import Mega from "../examples/navbar/mega";

const entry: DocEntry = {
  slug: "navbar",
  title: "Navbar",
  group: "Site blocks",
  description:
    "Site top navigation in four characters — corporate bar, restaurant split, minimal full-screen menu, SaaS rail. Server component: the mobile menu is a native popover (0 JS), submenus a ~1 KB disclosure island rendered only when items have children, and the scrolled background a CSS scroll timeline.",
  source: ["blocks/site/navbar.tsx", "blocks/site/navbar-submenu.tsx", "blocks/site/registry-1.ts", "styles/blocks.css"],
  basedOn: "Native popover + disclosure pattern",
  usage: `import { Navbar } from "@vamos-cms/ui/blocks";

<Navbar
  wordmark="Kıyı"
  items={[{ label: "Menu", href: "/menu" }, { label: "Private dining", href: "/private-dining", children: [...] }]}
  phone="+902168072907"            // E.164; shown as 0216 807 29 07 for tr, tel: link
  actions={[{ link: { href: "/reservations", label: "Book a table" }, style: "primary" }]}
  currentPath={pathname}            // aria-current="page"
  sticky
/>`,
  demo: ex("demo", "Corporate bar", "navbar/demo.tsx", Demo),
  examples: [
    ex("split-restaurant", "Split (restaurant)", "navbar/split-restaurant.tsx", Split, "Logo dead centre, links on both sides, the CTA as a text link, EN / TR switch with hreflang."),
    ex("minimal-overlay", "Minimal over a full-bleed hero", "navbar/minimal-overlay.tsx", Minimal, "overlay starts transparent with light text and pulls the hero up under it. “Menu” opens a full-screen popover with display-size links and address/hours."),
    ex("rail-saas", "Rail (SaaS)", "navbar/rail-saas.tsx", Rail, "Links inside one framed pill (glassy in glass mode), Sign in + Try free at the end."),
    ex("mega", "Submenus with descriptions", "navbar/mega.tsx", Mega, "A disclosure dropdown: Enter/Space toggles, ArrowDown/Up move through links, Escape closes and returns focus, leaving the group closes it. The group is marked active when the current page is inside it."),
  ],
  api: [
    {
      name: "Navbar",
      props: [
        { name: "variant", type: '"bar" | "split" | "minimal" | "rail"', default: '"bar"', description: "Layout character (see examples)." },
        { name: "wordmark", type: "ReactNode", description: "Text mark (display font). Used when there's no logo, or beside it." },
        { name: "logo / logoDark", type: "ImageData", description: "Logo, and the artwork shown inside dark sections (never invert())." },
        { name: "homeHref", type: "string", default: '"/"', description: "Brand link." },
        { name: "items", type: "NavbarItem[]", default: "[]", description: "{ label, href, description?, newTab?, children?: NavbarLink[] } — ≤ 7 items, ≤ 8 children." },
        { name: "actions", type: "SiteCta[]", description: "≤ 2; later primaries are demoted. bar/minimal show one; split shows a text link; rail shows ghost + primary." },
        { name: "phone", type: "string (E.164)", description: "National format in the number's own locale, international elsewhere; tel: link with data-track=\"call\"." },
        { name: "locales", type: "{ code; href; current? }[]", description: "Language switch (“EN / TR”), hreflang + lang on each link." },
        { name: "sticky", type: "boolean", default: "false", description: "Sticks to the top; background and hairline fill in on scroll (animation-timeline: scroll(); glass blur in glass mode)." },
        { name: "overlay", type: "boolean", default: "false", description: "Transparent with light text over a hero; overlaps the next section by the bar height." },
        { name: "currentPath", type: "string", description: "Sets aria-current=\"page\" (+ 2px accent underline) and the active group." },
        { name: "panelMeta", type: "SiteMeta[]", description: "Facts at the bottom of the full-screen menu (address, hours)." },
        { name: "skipLink", type: "boolean", default: "true", description: "Renders “Skip to content” first in the DOM." },
        { name: "labels", type: "Partial<Site1Labels>", description: "mainNavigation, openMenu, closeMenu, menuDialog, languages, callUs, phoneLabel." },
        { name: "locale / components / id / anchor / className", type: "BlockBaseProps", description: "Intl locale, framework Link/Image adapters, ids." },
      ],
    },
    {
      name: "formatSitePhone(e164, locale)",
      props: [{ name: "returns", type: "string", description: "“0216 807 29 07” for a TR number in tr, “+90 216 807 29 07” elsewhere." }],
    },
  ],
  notes: ["The navbar lays out by its own width (container queries): links appear from 56rem, the phone from 72rem — so it behaves the same in a builder iframe and on a phone."],
  covers: ["Navbar"],
};

export default entry;
