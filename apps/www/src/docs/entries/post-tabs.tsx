import { ex, type DocEntry } from "../types";
import Demo from "../examples/post-tabs/demo";
import Lazy from "../examples/post-tabs/lazy";

const entry: DocEntry = {
  slug: "post-tabs",
  title: "Post tabs",
  group: "Site blocks",
  description:
    "A tabbed category module (“Don’t miss”): the title on a heavy rule, one tab per section at the end, and the tabs that don’t fit folded into a “More” menu — measured against the real width, so it adapts from a wide column to a phone. The selected tab always stays in the row. Panels come from props (server-rendered PostLayout) or from a load callback on first open, cached per tab. WAI-ARIA tabs on the kit Tabs: arrows, Home / End.",
  source: ["blocks/site/post-tabs.tsx", "blocks/site/post-modules.tsx"],
  basedOn: "Tabs, Dropdown menu",
  usage: `import { PostLayout, PostTabs } from "@vamos-ui/react/blocks";

<PostTabs
  title="Don’t miss"
  tabs={sections.map((s) => ({ id: s.id, label: s.label, content: <PostLayout layout="lead-list" posts={s.posts} /> }))}
/>

// Client-side data: panels without content load on first open
<PostTabs title="Lifestyle" tabs={[{ id: "all", label: "All", content: first }, { id: "travel", label: "Travel" }]}
  load={async (id) => <PostLayout layout="lead-list" posts={await fetchSection(id)} />} />`,
  demo: ex("demo", "Nine sections, overflow into More", "post-tabs/demo.tsx", Demo),
  examples: [ex("lazy", "Lazy panels", "post-tabs/lazy.tsx", Lazy, "The panel shows a card skeleton and aria-busy while load() runs; a failure shows a retry-later line.")],
  api: [
    {
      name: "PostTabs",
      props: [
        { name: "title", type: "ReactNode", description: "Module title; names the region and the tab list." },
        { name: "tabs", type: "{ id; label; content? }[]", description: "content: the panel (usually PostLayout)." },
        { name: "defaultTab / value / onValueChange", type: "string", description: "Uncontrolled or controlled selection." },
        { name: "load", type: "(id) => Promise<ReactNode>", description: "Loads panels without content, once each." },
        { name: "maxVisible", type: "number", default: "5", description: "Tabs shown before measuring (server render)." },
        { name: "loadingFallback", type: "ReactNode", description: "Replaces the card skeleton." },
        { name: "headingLevel", type: "2 | 3", default: "2", description: "Title level." },
        { name: "locale / labels", type: "…", description: "“More”, loading and empty strings (newsLabelsTr)." },
      ],
    },
  ],
  covers: ["Post tabs (tabbed category block)"],
};

export default entry;
