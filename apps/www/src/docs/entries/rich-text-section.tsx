import { ex, type DocEntry } from "../types";
import Demo from "../examples/rich-text-section/demo";
import Aside from "../examples/rich-text-section/aside-heading";
import Two from "../examples/rich-text-section/two-column";

const entry: DocEntry = {
  slug: "rich-text-section",
  title: "Rich text section",
  group: "Site blocks",
  description:
    "Long text — an about page, a privacy notice, a service description — rendered from the RichDoc format by a pure server renderer (no editor code reaches the site). The column sits on grid columns 2–9 rather than dead centre; body headings shift one level below the block title.",
  source: ["blocks/site/rich-text-section.tsx", "blocks/rich-text.tsx", "blocks/site/registry-1.ts", "styles/blocks.css"],
  usage: `import { RichTextSection } from "@vamos-cms/ui/blocks";

<RichTextSection variant="aside-heading" title="Privacy notice" note="Last updated 4 November 2026" body={doc} />
<RichTextSection body={"First paragraph.\\n\\nSecond paragraph."} />   // plain text works too`,
  demo: ex("demo", "Column with a drop cap", "rich-text-section/demo.tsx", Demo),
  examples: [
    ex("aside-heading", "Aside heading (legal)", "rich-text-section/aside-heading.tsx", Aside, "Sticky title + note on the start side, the text on the end side."),
    ex("two-column", "Two columns", "rich-text-section/two-column.tsx", Two, "Newspaper columns from 56rem; one column on phones."),
  ],
  api: [
    {
      name: "RichTextSection",
      props: [
        { name: "variant", type: '"column" | "aside-heading" | "two-column"', default: '"column"', description: "Layout (see examples)." },
        { name: "body", type: "RichDoc | string", description: "Paragraphs, h2–h4, lists, quotes, rules + bold, italic, links. Strings: blank line = paragraph." },
        { name: "title", type: "ReactNode", description: "Optional; when set, stored h2s render as h3." },
        { name: "eyebrow", type: "ReactNode", description: "Mono line above the title." },
        { name: "dropCap", type: "boolean", default: "false", description: "column: large first letter in the display font." },
        { name: "note", type: "ReactNode", description: "aside-heading: meta line under the title." },
        { name: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "Text size of the prose." },
        { name: "theme / anchor / id / className / labels / locale / components / editMode / headingLevel", type: "BlockBaseProps", description: "Links go through components.Link." },
      ],
    },
  ],
  covers: ["Rich text section"],
};

export default entry;
