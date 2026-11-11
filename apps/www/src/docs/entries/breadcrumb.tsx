import { ex, type DocEntry } from "../types";
import BreadcrumbDemo from "../examples/breadcrumb/demo";
import BreadcrumbCollapsed from "../examples/breadcrumb/collapsed";
import BreadcrumbWithMenu from "../examples/breadcrumb/with-menu";
import BreadcrumbSizes from "../examples/breadcrumb/sizes";
import BreadcrumbCompound from "../examples/breadcrumb/compound";
import BreadcrumbWebsite from "../examples/breadcrumb/website";

const entry: DocEntry = {
  slug: "breadcrumb",
  title: "Breadcrumb",
  group: "Navigation",
  description:
    "Shows where a page sits in a hierarchy and offers a way up. Data-driven or compound, collapses long trails into a menu, jumps to sibling records, and outputs JSON-LD on websites.",
  source: ["components/breadcrumb.tsx"],
  basedOn: "Radix Dropdown Menu (hidden items, siblings)",
  usage: `import { Breadcrumb } from "@vamos-ui/react";

<Breadcrumb items={[
  { label: "Companies", href: "/companies" },
  { label: "Northpoint", href: "/companies/northpoint" },
  { label: "Contacts" },
]} />`,
  demo: ex("demo", "Demo", "breadcrumb/demo.tsx", BreadcrumbDemo),
  examples: [
    ex("collapsed", "Collapsed", "breadcrumb/collapsed.tsx", BreadcrumbCollapsed, "maxItems keeps the first crumb and the last maxItems − 2; the middle goes into a \"Show hidden pages\" menu."),
    ex("with-menu", "Sibling menu (CRM)", "breadcrumb/with-menu.tsx", BreadcrumbWithMenu, "menu on an item adds a ⇅ button that jumps to sibling records without going up a level."),
    ex("sizes", "Sizes and separator", "breadcrumb/sizes.tsx", BreadcrumbSizes, "size sm for dense headers; separator replaces the chevron (which flips in RTL)."),
    ex("compound", "Compound API", "breadcrumb/compound.tsx", BreadcrumbCompound, "Compose the parts for custom content. Long labels truncate at 16rem and keep the full text in title."),
    ex("website", "Website with JSON-LD", "breadcrumb/website.tsx", BreadcrumbWebsite, "jsonLd outputs a schema.org BreadcrumbList; baseUrl makes the URLs absolute."),
  ],
  api: [
    { name: "Breadcrumb", props: [
      { name: "items", type: "{ label; href?; icon?; menu?: { label; href; current? }[] }[]", description: "Data-driven trail; the last item is the current page. Omit for the compound API." },
      { name: "maxItems", type: "number", description: "Collapse the middle when there are more items (first + last maxItems − 2 stay)." },
      { name: "separator", type: "ReactNode", default: "ChevronRight", description: "Separator between crumbs (hidden from assistive tech)." },
      { name: "size", type: '"sm" | "md"', default: '"md"', description: "Text and icon size." },
      { name: "jsonLd", type: "boolean", default: "false", description: "Websites: output BreadcrumbList JSON-LD (items with href and a string label)." },
      { name: "baseUrl", type: "string", description: "Origin prepended to relative hrefs in the JSON-LD." },
      { name: "labels", type: "{ label?; showHidden?; siblings? }", description: "Overrides: nav name (\"Breadcrumb\"), \"Show hidden pages\", \"Pages next to {label}\"." },
    ] },
    { name: "BreadcrumbLink", props: [
      { name: "href", type: "string", description: "Rendered with the app's router Link; external URLs open in a new tab." },
      { name: "icon", type: "ReactNode", description: "Leading icon." },
      { name: "asChild", type: "boolean", default: "false", description: "Render your own element with the crumb styles." },
    ] },
    { name: "BreadcrumbPage", props: [
      { name: "icon", type: "ReactNode", description: "Leading icon." },
      { name: "aria-current", type: '"page" | undefined', default: '"page"', description: "Pass undefined for a non-link crumb in the middle." },
    ] },
    { name: "BreadcrumbEllipsis", props: [
      { name: "items", type: "{ label; href }[]", description: "Hidden crumbs offered in a menu. Without items it is a static \"…\"." },
    ] },
    { name: "BreadcrumbList · BreadcrumbItem · BreadcrumbSeparator", props: [
      { name: "…props", type: "HTML attributes", description: "ol, li and the aria-hidden separator li." },
    ] },
  ],
  covers: ["Breadcrumb"],
};

export default entry;
