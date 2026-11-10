import { ex, type DocEntry } from "../types";
import Demo from "../examples/feature-grid/demo";
import Icons from "../examples/feature-grid/grid-icons";
import Tabs from "../examples/feature-grid/tabs-saas";
import Sticky from "../examples/feature-grid/sticky-media";

const entry: DocEntry = {
  slug: "feature-grid",
  title: "Feature grid",
  group: "Site blocks",
  description:
    "Services, treatments or product modules — without the card wall. Card-less by default: hairline rules, mono index numbers and whitespace. The tabs variant is a Radix Tabs island; sticky media swaps images with CSS view timelines and no JS.",
  source: ["blocks/site/feature-grid.tsx", "blocks/site/feature-tabs.tsx", "blocks/site/_site-icon-1.tsx", "blocks/site/registry-1.ts", "styles/blocks.css"],
  basedOn: "Radix Tabs (tabs variant only)",
  usage: `import { FeatureGrid } from "@vamos-ui/react/blocks";

<FeatureGrid
  eyebrow="Services"
  title="What we *build*"
  items={[
    { title: "Restaurant sites", text: "Menus your staff edit from a phone…", link: { href: "/services/restaurants" } },
    { title: "Clinic & spa sites", text: "Treatment pages that rank for the district…" },
  ]}
/>`,
  demo: ex("demo", "List (agency services)", "feature-grid/demo.tsx", Demo),
  examples: [
    ex("grid-icons", "Grid with icons (spa)", "feature-grid/grid-icons.tsx", Icons, "icon takes a lucide name from the f.icon() allow-list (or a node); 20px, stroke 1.5, muted — never boxed. Two items always fall back to the list."),
    ex("tabs-saas", "Tabs (SaaS)", "feature-grid/tabs-saas.tsx", Tabs, "WAI-ARIA tabs with vertical arrow keys; the active tab carries a vertical accent rule. Below 56rem every feature is stacked, nothing hidden."),
    ex("sticky-media", "Sticky media", "feature-grid/sticky-media.tsx", Sticky, "Each item names a view timeline; the sticky frame cross-fades on it. Without support or with reduced motion, each item shows its own image inline."),
  ],
  api: [
    {
      name: "FeatureGrid",
      props: [
        { name: "variant", type: '"list" | "grid" | "tabs" | "sticky-media"', default: '"list"', description: "Layout (see examples)." },
        { name: "eyebrow / title / lead", type: "ReactNode", description: "Section header; with a lead the header splits title | lead on wide containers." },
        { name: "actions", type: "SiteCta[]", description: "Header links (link style by default)." },
        { name: "items", type: "FeatureItem[]", description: "{ title, text?, icon?, media?, link? } — 2–12 items. A linked item is clickable as a whole through one stretched link (no nested links)." },
        { name: "numbered", type: "boolean", default: "true for list", description: "Mono 01, 02… index." },
        { name: "columns", type: "2 | 3 | 4", default: "3", description: "grid: columns on wide containers (@2xl 2, @4xl 3, @6xl 4)." },
        { name: "headingLevel", type: "1 | 2 | 3", default: "2", description: "Title level; item titles are one level below." },
        { name: "theme / anchor / id / className / labels / locale / components / editMode", type: "BlockBaseProps", description: "Shared block props." },
      ],
    },
  ],
  notes: ["No bento variant: it is the most recognisable AI-site pattern of 2025–26."],
  covers: ["Feature grid"],
};

export default entry;
