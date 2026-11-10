import { ex, type DocEntry } from "../types";
import Demo from "../examples/steps/demo";
import Horizontal from "../examples/steps/horizontal";
import Split from "../examples/steps/split";

const entry: DocEntry = {
  slug: "steps",
  title: "Process / steps",
  group: "Site blocks",
  description:
    "“How we work”: discovery → design → launch, a spa's first visit, SaaS setup. An ordered list — the order is announced, the numbers are visual — with hairline rules instead of cards; only the first step's marker carries the accent.",
  source: ["blocks/site/process.tsx", "blocks/site/registry-1.ts", "styles/blocks.css"],
  usage: `import { Steps } from "@vamos-ui/react/blocks";

<Steps
  title="Six weeks from *brief* to launch"
  steps={[
    { title: "Discovery", text: "Two hours at your place…", duration: "Week 1" },
    { title: "Design", text: "Real copy from day one…", duration: "Weeks 2–3" },
  ]}
/>`,
  demo: ex("demo", "Vertical (agency)", "steps/demo.tsx", Demo),
  examples: [
    ex("horizontal", "Horizontal (spa first visit)", "steps/horizontal.tsx", Horizontal, "A timeline from 56rem: numbers above the line, text below. Narrow containers turn it vertical."),
    ex("split", "Split (SaaS setup)", "steps/split.tsx", Split, "Sticky title + action on the start side, display-size numbers on the end side."),
  ],
  api: [
    {
      name: "Steps",
      props: [
        { name: "variant", type: '"vertical" | "horizontal" | "split"', default: '"vertical"', description: "Layout (see examples)." },
        { name: "steps", type: "StepsItem[]", description: "{ title, text?, duration?, media? } — 2–8 steps." },
        { name: "eyebrow / title / lead", type: "ReactNode", description: "Section header." },
        { name: "actions", type: "SiteCta[]", description: "≤ 2, beside the header (vertical, split) or under the steps (horizontal)." },
        { name: "theme / anchor / id / className / labels / locale / components / editMode / headingLevel", type: "BlockBaseProps", description: "Step titles are one heading level below the title." },
      ],
    },
  ],
  covers: ["Process / steps"],
};

export default entry;
