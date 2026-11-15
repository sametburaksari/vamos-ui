import { ex, type DocEntry } from "../types";
import SectionNavDemo from "../examples/section-nav/demo";
import SectionNavPlain from "../examples/section-nav/plain";

const entry: DocEntry = {
  slug: "section-nav",
  title: "Section nav",
  group: "Navigation",
  description:
    "A scroll-spy table of contents: a sticky in-page nav that marks the section being read with aria-current=\"location\" and slides an accent rule to it. Plain #id links that work without JavaScript; with it, clicks scroll smoothly, update the hash and move focus.",
  source: ["components/section-nav.tsx"],
  basedOn: "IntersectionObserver",
  usage: `import { SectionNav } from "@vamos-ui/react";

<SectionNav
  title="On this page"
  items={[{ id: "overview", label: "Overview" }, { id: "setup", label: "Setup" }]}
/>
<section id="overview">…</section>`,
  demo: ex("demo", "Demo", "section-nav/demo.tsx", SectionNavDemo),
  examples: [
    ex("plain", "Static contents list", "section-nav/plain.tsx", SectionNavPlain, "sticky={false} and no meta: a compact list at the top of a page."),
  ],
  api: [
    { name: "SectionNav", props: [
      { name: "items", type: "{ id: string; label: ReactNode; meta?: ReactNode }[]", description: "Sections on the page, by element id. meta is a small leading number or count." },
      { name: "title", type: "ReactNode", description: "Visible heading above the list; also names the landmark." },
      { name: "sticky", type: "boolean", default: "true", description: "Stick while the page scrolls." },
      { name: "top", type: "number | string", default: '"1.5rem"', description: "Sticky offset (clear a fixed header)." },
      { name: "rootMargin", type: "string", default: '"-20% 0px -55% 0px"', description: "The band of the window that counts as being read." },
      { name: "onActiveChange", type: "(id: string | null) => void", description: "The current section changed." },
      { name: "labels", type: "Partial<SectionNavLabels>", description: 'Dictionary namespace "sectionNav": label (the landmark name without a title).' },
    ] },
  ],
  notes: ["Give the sections scroll-margin-top (scroll-mt-*) when the page has a fixed header.", "Between sections the last one stays current, so the marker never blinks off."],
  covers: [],
};

export default entry;
