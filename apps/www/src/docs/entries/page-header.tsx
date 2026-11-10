import { ex, type DocEntry } from "../types";
import PageHeaderDemo from "../examples/page-header/demo";
import PageHeaderWithBreadcrumb from "../examples/page-header/with-breadcrumb";
import PageHeaderRecord from "../examples/page-header/record";
import PageHeaderWithTabs from "../examples/page-header/with-tabs";
import PageHeaderSizes from "../examples/page-header/sizes";
import PageHeaderLoading from "../examples/page-header/loading";

const entry: DocEntry = {
  slug: "page-header",
  title: "Page header",
  group: "Page layouts",
  description:
    "The title block of a page: breadcrumb or eyebrow, the page's one h1 in the display font, description, status meta, actions and sub-tabs. Server-compatible; the automatic breadcrumb reads the App shell's active trail.",
  source: ["components/page-header.tsx"],
  usage: `import { PageHeader, Button } from "@vamos-ui/react";

<PageHeader
  eyebrow="Content"
  title="Posts"
  description="128 posts · 6 scheduled"
  actions={<Button variant="primary">New post</Button>}
/>`,
  demo: ex("demo", "Demo", "page-header/demo.tsx", PageHeaderDemo),
  examples: [
    ex("with-breadcrumb", "Automatic breadcrumb", "page-header/with-breadcrumb.tsx", PageHeaderWithBreadcrumb, "breadcrumb=\"auto\" uses the shell's resolveActive trail, the same one that highlights the sidebar. Pass your own <Breadcrumb> otherwise."),
    ex("record", "Record page", "page-header/record.tsx", PageHeaderRecord, "back links up a level; meta sits next to the title; menu puts secondary actions in a “⋯” dropdown."),
    ex("with-tabs", "With sub-tabs", "page-header/with-tabs.tsx", PageHeaderWithTabs, "tabs attaches route tabs to the header's bottom edge."),
    ex("sizes", "Sizes", "page-header/sizes.tsx", PageHeaderSizes, "lg 40px for dashboards, md 30px for lists, sm 22px for records — scaled by the font preset. <em> follows the preset (italic in serif headings)."),
    ex("loading", "Loading", "page-header/loading.tsx", PageHeaderLoading, "loading keeps the h1 in place with a skeleton line."),
  ],
  api: [
    { name: "PageHeader", props: [
      { name: "title", type: "ReactNode", description: "The page's one <h1>." },
      { name: "eyebrow", type: "ReactNode", description: "Small line above the title. Not uppercased with CSS (Turkish i/İ)." },
      { name: "breadcrumb", type: 'ReactNode | "auto"', description: '"auto": built from the App shell trail.' },
      { name: "back", type: "{ href: string; label: string }", description: "“← Contacts” link above the title." },
      { name: "description", type: "ReactNode", description: "One or two lines under the title." },
      { name: "meta", type: "ReactNode", description: "Badges, “Updated 2h ago” — next to the title." },
      { name: "actions", type: "ReactNode", description: "Buttons; wrap under the title on narrow screens." },
      { name: "menu", type: "MenuEntry[]", description: "Secondary actions in a “⋯” menu." },
      { name: "tabs", type: "ReactNode", description: "Sub-navigation on the bottom edge." },
      { name: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "22 / 30 / 40 px × --display-scale." },
      { name: "align", type: '"start" | "center"', default: '"start"', description: "Centered for empty pages and onboarding." },
      { name: "sticky", type: "boolean", default: "false", description: "Sticks under the top bar on the bar surface." },
      { name: "loading", type: "boolean", default: "false", description: "Skeleton in the h1 (aria-busy)." },
    ] },
    { name: "PageHeaderTitle · PageHeaderEyebrow · PageHeaderDescription · PageHeaderActions · PageHeaderTabs", props: [
      { name: "size", type: '"sm" | "md" | "lg"', description: "PageHeaderTitle only." },
      { name: "className", type: "string", description: "Parts for custom layouts." },
    ] },
  ],
  covers: ["Page header"],
};

export default entry;
