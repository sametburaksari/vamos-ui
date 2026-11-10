import { ex, type DocEntry } from "../types";
import Demo from "../examples/logo-strip/demo";
import Marquee from "../examples/logo-strip/marquee";
import Grid from "../examples/logo-strip/grid";

const entry: DocEntry = {
  slug: "logo-strip",
  title: "Logo strip",
  group: "Site blocks",
  description:
    "“Brands we work with” proof for agency and SaaS homepages. Logos sit at an equal optical height, greyscale until hover; dark sections use each logo's dark artwork instead of invert(). The marquee is pure CSS and stops on hover, focus and reduced motion.",
  source: ["blocks/site/logo-strip.tsx", "blocks/site/registry-1.ts", "styles/blocks.css"],
  usage: `import { LogoStrip } from "@vamos-cms/ui/blocks";

<LogoStrip
  caption="Running the sites of 120+ businesses since 2014"
  logos={[{ name: "Kıyı Meyhane", image: { src: "/logos/kiyi.svg", width: 160, height: 40 }, imageDark: { … } }]}
/>`,
  demo: ex("demo", "Row", "logo-strip/demo.tsx", Demo),
  examples: [
    ex("marquee", "Marquee", "logo-strip/marquee.tsx", Marquee, "Endless band with masked edges; the duplicate copy is aria-hidden and not focusable. Fewer than 4 logos render as a row (lint suggests row below 6)."),
    ex("grid", "Grid with gridlines", "logo-strip/grid.tsx", Grid, "4–6 columns separated by 1px lines; linked logos go to the case study."),
  ],
  api: [
    {
      name: "LogoStrip",
      props: [
        { name: "variant", type: '"row" | "marquee" | "grid"', default: '"row"', description: "Layout (see examples)." },
        { name: "caption", type: "ReactNode", description: "Small caption; also names the region." },
        { name: "logos", type: "LogoItem[]", description: "{ name, image, imageDark?, link? } — name is the alt text." },
        { name: "monochrome", type: "boolean", default: "true", description: "grayscale(1) at 70% opacity; full colour on hover/focus." },
        { name: "columns", type: "4 | 5 | 6", default: "5", description: "grid: columns on wide containers." },
        { name: "speed", type: "number (s)", default: "40", description: "marquee: seconds per loop." },
        { name: "theme / anchor / id / className / labels / locale / components / editMode", type: "BlockBaseProps", description: "Shared block props." },
      ],
    },
  ],
  notes: ["If the logo strip scrolls, nothing else on the page should move continuously (D6-10)."],
  covers: ["Logo strip"],
};

export default entry;
