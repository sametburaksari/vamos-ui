import { ex, type DocEntry } from "../types";
import NavigationMenuDemo from "../examples/navigation-menu/demo";
import NavigationMenuMega from "../examples/navigation-menu/mega";
import NavigationMenuFloating from "../examples/navigation-menu/floating";
import NavigationMenuMobile from "../examples/navigation-menu/mobile";

const entry: DocEntry = {
  slug: "navigation-menu",
  title: "Navigation Menu",
  group: "Navigation",
  description:
    "A website's top navigation with dropdown and mega-menu panels, a floating glass variant, and a matching mobile sheet — all from one nav array. Admin panels use Sidebar instead.",
  source: ["components/navigation-menu.tsx", "components/accordion.tsx", "styles/navigation.css"],
  basedOn: "Radix Navigation Menu, Radix Dialog (mobile)",
  usage: `import { NavigationMenu, MobileNav, type SiteNavItem } from "@vamos-cms/ui";

const nav: SiteNavItem[] = [
  { label: "Products", children: [{ label: "vTag", href: "/vtag", description: "NFC business cards" }] },
  { label: "Pricing", href: "/pricing" },
];

<NavigationMenu items={nav} className="max-md:hidden" />
<MobileNav items={nav} className="md:hidden" />`,
  demo: ex("demo", "Demo", "navigation-menu/demo.tsx", NavigationMenuDemo),
  examples: [
    ex("mega", "Mega menu (company site)", "navigation-menu/mega.tsx", NavigationMenuMega, "Compose the parts: layout=\"featured\" puts a highlight card beside the links, \"grid-2\" lays links in two columns. Panels slide inside one shared, animated viewport."),
    ex("floating", "Floating glass pill", "navigation-menu/floating.tsx", NavigationMenuFloating, "variant=\"floating\" is the site's one permanent blur; its panel turns opaque to keep the glass budget."),
    ex("mobile", "Mobile menu", "navigation-menu/mobile.tsx", NavigationMenuMobile, "MobileNav opens a side sheet with groups as an accordion. Following a link closes it. Narrow the preview to see the switch."),
  ],
  api: [
    { name: "NavigationMenu", props: [
      { name: "items", type: "SiteNavItem[]", description: "Data-driven menu. Or compose NavigationMenuList children." },
      { name: "variant", type: '"bar" | "floating"', default: '"bar"', description: "In a header, or a floating glass pill." },
      { name: "viewport", type: "boolean", default: "true", description: "One shared animated panel; false drops each panel under its trigger." },
      { name: "value · defaultValue · onValueChange", type: "string", description: "The open item (controlled / uncontrolled)." },
      { name: "delayDuration", type: "number", default: "200", description: "Hover-intent delay before a panel opens (ms)." },
      { name: "aria-label", type: "string", default: '"Main"', description: "Name of the nav landmark (labels.label)." },
    ] },
    { name: "SiteNavItem", props: [
      { name: "label · href", type: "string", description: "Text and target (no href when it has children)." },
      { name: "description · icon", type: "string · ReactNode", description: "Shown on panel links." },
      { name: "children", type: "SiteNavItem[]", description: "Makes the item a dropdown." },
      { name: "layout", type: '"list" | "grid-2" | "featured"', default: '"list"', description: "Panel layout." },
      { name: "featured", type: "{ title; description?; href; eyebrow? }", description: "layout=\"featured\": the highlight card." },
    ] },
    { name: "NavigationMenuContent", props: [
      { name: "layout", type: '"list" | "grid-2" | "featured"', default: '"list"', description: "Panel layout." },
      { name: "inline", type: "boolean", default: "false", description: "Without the viewport: render as its own popover." },
    ] },
    { name: "NavigationMenuLink", props: [
      { name: "href", type: "string", description: "Required. Rendered with the app's router Link." },
      { name: "variant", type: '"panel" | "top"', default: '"panel"', description: "Rich panel link or a top-level link in the bar." },
      { name: "title · description · icon", type: "ReactNode", description: "Panel link content (title falls back to children)." },
      { name: "active", type: "boolean", description: "Current page; default derived from VamosProvider currentPath." },
    ] },
    { name: "Parts", props: [
      { name: "NavigationMenuList · NavigationMenuItem · NavigationMenuTrigger", type: "Radix parts", description: "The bar, an item, the panel toggle (chevron included)." },
      { name: "NavigationMenuGroup", type: "{ heading? }", description: "A ul of links; heading is visual text, not a heading element." },
      { name: "NavigationMenuFeatured", type: "{ title; description?; href; eyebrow? }", description: "Highlight card for featured panels." },
      { name: "NavigationMenuViewport · NavigationMenuIndicator", type: "Radix parts", description: "Shared panel container (rendered for you) and an optional arrow." },
    ] },
    { name: "MobileNav", props: [
      { name: "items", type: "SiteNavItem[]", description: "Required. The same array as the desktop menu." },
      { name: "title", type: "ReactNode", default: '"Menu"', description: "Sheet heading (brand)." },
      { name: "footer", type: "ReactNode", description: "Bottom of the sheet: CTA, language switch." },
      { name: "open · defaultOpen · onOpenChange", type: "boolean", description: "Sheet state." },
      { name: "className", type: "string", description: "Trigger button classes; hide it on desktop (md:hidden)." },
      { name: "labels", type: "{ label?; open?; close?; title? }", description: "\"Main\", \"Open menu\", \"Close menu\", \"Menu\"." },
    ] },
  ],
  notes: ["Keyboard: Tab between items, Enter / Space / ↓ open a panel, Tab moves into it, Escape closes and returns focus to the trigger."],
  covers: ["Navigation Menu"],
};

export default entry;
