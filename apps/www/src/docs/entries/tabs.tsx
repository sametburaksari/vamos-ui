import { ex, type DocEntry } from "../types";
import TabsDemo from "../examples/tabs/demo";
import TabsVariants from "../examples/tabs/variants";
import TabsWithCount from "../examples/tabs/with-count";
import TabsSegmented from "../examples/tabs/segmented";
import TabsVertical from "../examples/tabs/vertical";
import TabsUrlSync from "../examples/tabs/url-sync";
import TabsLinkTabs from "../examples/tabs/link-tabs";
import TabsOverflow from "../examples/tabs/overflow";

const entry: DocEntry = {
  slug: "tabs",
  title: "Tabs",
  group: "Navigation",
  description:
    "Switch between views of the same context — a record's sections, status filters, a List/Grid switch. Three variants, vertical orientation, counts, scrolling overflow, and route-based link tabs.",
  source: ["components/tabs.tsx", "lib/use-edge-fade.ts", "styles/navigation.css"],
  basedOn: "Radix Tabs",
  usage: `import { Tabs, TabsList, TabsTrigger, TabsContent } from "@vamos-cms/ui";

<Tabs defaultValue="overview">
  <TabsList aria-label="Contact">
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="deals" count={4}>Deals</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">…</TabsContent>
  <TabsContent value="deals">…</TabsContent>
</Tabs>`,
  demo: ex("demo", "Demo", "tabs/demo.tsx", TabsDemo),
  examples: [
    ex("variants", "Variants", "tabs/variants.tsx", TabsVariants, "underline for pages and records, pill for status filters, segmented for a 2–4 option view switch."),
    ex("with-count", "With counts", "tabs/with-count.tsx", TabsWithCount, "count is locale-formatted and capped at 99+. It is part of the accessible name (\"Draft, 12\"). The selected pill tints its count with the accent."),
    ex("segmented", "Segmented view switch", "tabs/segmented.tsx", TabsSegmented, "Controlled with value / onValueChange. For a value picker inside a form use a radio group instead — tabs switch views."),
    ex("vertical", "Vertical (settings)", "tabs/vertical.tsx", TabsVertical, "orientation=\"vertical\" moves the indicator to the start edge; ↑ ↓ move between tabs."),
    ex("url-sync", "Synced with the URL", "tabs/url-sync.tsx", TabsUrlSync, "URL state stays in your app. Read ?tab= on load and replace it on change."),
    ex("link-tabs", "Link tabs (routes)", "tabs/link-tabs.tsx", TabsLinkTabs, "TabsLinkList is a nav of router links with aria-current=\"page\" — not the Tabs pattern. The active tab comes from VamosProvider currentPath; use exact on the index route."),
    ex("overflow", "Overflow", "tabs/overflow.tsx", TabsOverflow, "Tabs that don't fit scroll horizontally with edge fades, and the selected tab is scrolled into view."),
  ],
  api: [
    { name: "Tabs", props: [
      { name: "value", type: "string", description: "Controlled selected tab." },
      { name: "defaultValue", type: "string", description: "Initial tab when uncontrolled." },
      { name: "onValueChange", type: "(value: string) => void", description: "Called when the selection changes." },
      { name: "orientation", type: '"horizontal" | "vertical"', default: '"horizontal"', description: "Vertical puts the list beside the panels and switches arrow keys to ↑ ↓." },
      { name: "activationMode", type: '"automatic" | "manual"', default: '"automatic"', description: "manual: arrows only move focus; Enter / Space selects (heavy panels)." },
      { name: "dir", type: '"ltr" | "rtl"', description: "Reading direction; defaults to the LocaleProvider direction." },
    ] },
    { name: "TabsList", props: [
      { name: "variant", type: '"underline" | "pill" | "segmented"', default: '"underline"', description: "Visual style." },
      { name: "size", type: '"sm" | "md"', default: '"md"', description: "Trigger height and text size; segmented follows --control-h." },
      { name: "fill", type: "boolean", default: "false", description: "Equal-width tabs that fill the row." },
      { name: "overflow", type: '"scroll" | "none"', default: '"scroll"', description: "Horizontal lists scroll with edge fades and keep the selected tab in view." },
      { name: "loop", type: "boolean", default: "true", description: "Arrow keys wrap around." },
    ] },
    { name: "TabsTrigger", props: [
      { name: "value", type: "string", description: "Required. Matches a TabsContent." },
      { name: "icon", type: "ReactNode", description: "Leading icon." },
      { name: "count", type: "number", description: "Trailing count badge (locale-formatted, 99+)." },
      { name: "badgeTone", type: "BadgeProps[\"tone\"]", default: '"neutral"', description: "Tone of the count badge (selected pill / segmented tabs use accent)." },
      { name: "disabled", type: "boolean", default: "false", description: "Skipped by the keyboard." },
    ] },
    { name: "TabsContent", props: [
      { name: "value", type: "string", description: "Required. The tab this panel belongs to." },
      { name: "forceMount", type: "true", description: "Keep the panel mounted while inactive (inactive panels unmount by default)." },
    ] },
    { name: "TabsLinkList / TabsLink", props: [
      { name: "aria-label", type: "string", description: "TabsLinkList: name of the nav landmark." },
      { name: "variant · size · fill · orientation · overflow", type: "—", description: "TabsLinkList: same as TabsList." },
      { name: "href", type: "string", description: "TabsLink: target; rendered with the app's router Link." },
      { name: "exact", type: "boolean", default: "false", description: "TabsLink: active only on this exact path (index routes)." },
      { name: "active", type: "boolean", description: "TabsLink: force the active state instead of deriving it from currentPath." },
      { name: "icon · count · badgeTone · disabled", type: "—", description: "TabsLink: same as TabsTrigger." },
    ] },
  ],
  notes: [
    "Inactive panels unmount, so state inside them resets — lift it up or use forceMount.",
    "A \"More ▾\" overflow menu is planned; today overflow scrolls.",
  ],
  covers: ["Tabs"],
};

export default entry;
