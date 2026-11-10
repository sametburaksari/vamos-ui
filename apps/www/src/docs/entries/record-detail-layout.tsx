import { ex, type DocEntry } from "../types";
import RecordLayoutDemo from "../examples/record-detail-layout/demo";
import RecordLayoutResizable from "../examples/record-detail-layout/resizable";
import RecordLayoutPager from "../examples/record-detail-layout/pager";
import RecordLayoutResponsive from "../examples/record-detail-layout/responsive";
import RecordLayoutStates from "../examples/record-detail-layout/states";

const entry: DocEntry = {
  slug: "record-detail-layout",
  title: "Record detail layout",
  group: "Page layouts",
  description:
    "The \"show one record\" page: a record header (media, h1, status, key facts, actions, previous/next pager), a main column for tabs, activity and related lists, and a side column of details. It responds to its own width — below 42rem (672px) of layout width the side column moves under the header, its sections fold and the key facts become a scrolling strip. It measures itself, not the viewport.",
  source: ["components/record-detail-layout.tsx", "styles/navigation.css"],
  basedOn: "CSS grid + container queries · Radix Collapsible (aside sections)",
  usage: `import { RecordLayout, RecordHeader, RecordPager, RecordMain, RecordSection, RecordAside, RecordAsideSection } from "@vamos-cms/ui";

<RecordLayout>
  <RecordHeader
    back={{ href: "/crm/contacts", label: "Contacts" }}
    media={<Avatar name="Laura Callahan" size="xl" />}
    title="Laura Callahan"
    subtitle="Head of Operations · Northwind Traders"
    status={<Badge tone="success">Customer</Badge>}
    facts={[{ label: "Owner", value: "Meltem Aydın" }, { label: "Lifetime value", value: "$48,500" }]}
    actions={<Button variant="primary">Log call</Button>}
    pager={<RecordPager index={3} total={128} prevHref="/crm/contacts/41" nextHref="/crm/contacts/43" />}
  />
  <RecordMain>
    <RecordSection title="Activity"><ActivityTimeline items={activity} /></RecordSection>
  </RecordMain>
  <RecordAside>
    <RecordAsideSection title="Details"><DescriptionList items={details} /></RecordAsideSection>
  </RecordAside>
</RecordLayout>`,
  demo: ex("demo", "Demo", "record-detail-layout/demo.tsx", RecordLayoutDemo),
  examples: [
    ex("resizable", "Resizable side column", "record-detail-layout/resizable.tsx", RecordLayoutResizable, "resizable adds a window-splitter handle on the side column's edge: drag it, or focus it and use ←/→ (Shift ×4), Home/End; double-click or Enter resets."),
    ex("pager", "Previous / next", "record-detail-layout/pager.tsx", RecordLayoutPager, "RecordPager shows \"1 of 4\" and registers j (next) and k (previous) — ignored while typing. With prevHref/nextHref the buttons are links and the shortcuts navigate through VamosProvider."),
    ex("responsive", "Narrow container", "record-detail-layout/responsive.tsx", RecordLayoutResponsive, "Below 672px of layout width the aside sits under the header, every section folds and the facts scroll sideways."),
    ex("states", "States", "record-detail-layout/states.tsx", RecordLayoutStates, "state=\"loading\" renders a skeleton page; not-found and forbidden render a full-page empty state with the page's h1. readOnly hides header actions."),
  ],
  api: [
    { name: "RecordLayout", props: [
      { name: "asidePosition", type: '"end" | "start"', default: '"end"', description: "Logical side of the side column (flips in RTL)." },
      { name: "asideWidth · defaultAsideWidth · onAsideWidthChange", type: "number", default: "320", description: "Side column width in px, controlled or not." },
      { name: "resizable", type: "boolean", default: "false", description: "Window-splitter handle on the side column." },
      { name: "minAsideWidth · maxAsideWidth", type: "number", default: "260 · 520", description: "Resize limits." },
      { name: "state", type: '"ready" | "loading" | "not-found" | "forbidden"', default: '"ready"', description: "Built-in page states." },
      { name: "notFound · forbidden", type: "ReactNode", description: "Replace the default state pages." },
      { name: "readOnly", type: "boolean", default: "false", description: "Hides RecordHeader actions." },
      { name: "labels", type: "RecordLayoutLabels", description: "Overrides for the record namespace." },
    ] },
    { name: "RecordHeader", props: [
      { name: "title", type: "ReactNode", description: "The page's <h1>." },
      { name: "subtitle · status · media", type: "ReactNode", description: "Role and company, a status badge, an avatar or logo." },
      { name: "facts", type: "{ label: ReactNode; value: ReactNode }[]", description: "Key facts as a <dl>; a scrolling strip at phone width." },
      { name: "actions", type: "ReactNode", description: "Header buttons (hidden when readOnly)." },
      { name: "back", type: "{ href: string; label: string }", description: "\"← Contacts\" link." },
      { name: "pager", type: "ReactNode", description: "A RecordPager at the top end." },
      { name: "saving", type: "boolean", description: "\"Saving…\" status next to the title." },
      { name: "size", type: '"sm" | "md"', default: '"md"', description: "Title 20 / 28 px × --display-scale." },
      { name: "loading", type: "boolean", description: "Skeleton title and subtitle." },
    ] },
    { name: "RecordPager", props: [
      { name: "index · total", type: "number", description: "1-based position and list length: \"3 of 128\"." },
      { name: "prevHref · nextHref", type: "string", description: "Links; j/k navigate through VamosProvider." },
      { name: "onPrevious · onNext", type: "() => void", description: "Callbacks instead of links." },
      { name: "shortcuts", type: "boolean", default: "true", description: "Register j / k (aria-keyshortcuts)." },
    ] },
    { name: "RecordMain · RecordSection", props: [
      { name: "tabs", type: "ReactNode", description: "RecordMain: route tabs above the content." },
      { name: "title · description · action", type: "ReactNode", description: "RecordSection: a titled card (<section aria-labelledby>)." },
      { name: "padding", type: '"md" | "none"', default: '"md"', description: "RecordSection body padding." },
    ] },
    { name: "RecordAside · RecordAsideSection", props: [
      { name: "aria-label", type: "string", default: '"Details"', description: "RecordAside: name of the complementary landmark." },
      { name: "title · action", type: "ReactNode", description: "RecordAsideSection header." },
      { name: "collapsible", type: "boolean", default: "false", description: "Fold on wide layouts too (narrow layouts always fold)." },
      { name: "defaultOpen · open · onOpenChange", type: "boolean", default: "true", description: "Open state." },
      { name: "headingLevel", type: "2 | 3", default: "2", description: "Heading level of the title." },
    ] },
    { name: "SidePaneHandle", props: [
      { name: "value · onValueChange", type: "number", description: "Pane width in px. Shared by Record detail and Editor layouts for custom side columns." },
      { name: "min · max · defaultValue", type: "number", description: "Limits and the reset width." },
      { name: "edge", type: '"start" | "end"', default: '"start"', description: "Which edge of the pane the handle sits on." },
      { name: "step", type: "number", default: "16", description: "Arrow-key step (Shift ×4)." },
    ] },
  ],
  covers: ["Record detail layout"],
};

export default entry;
