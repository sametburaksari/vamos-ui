import { ex, type DocEntry } from "../types";
import Demo from "../examples/hero/demo";
import Split from "../examples/hero/split-media-spa";
import Bleed from "../examples/hero/full-bleed-restaurant";
import Product from "../examples/hero/product-saas";
import Statement from "../examples/hero/statement";
import Fonts from "../examples/hero/font-presets";

const entry: DocEntry = {
  slug: "hero",
  title: "Hero",
  group: "Site blocks",
  description:
    "The first screen and the page h1, in five characters per sector — editorial (agency), split media (spa, clinic), full bleed (restaurant), product (SaaS) and statement (manifesto). The generic “centred title + two buttons + abstract visual” is deliberately absent. Server component, above the fold, so nothing animates in; the hero image gets fetchpriority=high.",
  source: ["blocks/site/hero.tsx", "blocks/site/hero-video.tsx", "blocks/site/registry-1.ts", "styles/blocks.css"],
  usage: `import { Hero } from "@vamos-cms/ui/blocks";

<Hero
  variant="split-media"
  eyebrow="Day spa · Moda"
  title="Two hours, *nowhere* to be."         // one *emphasis*; renders the page h1
  lead="A marble hammam, a quiet pool…"
  actions={[{ link: { href: "/book", label: "Book a treatment" }, style: "primary" }]}
  media={{ src, alt, width, height, focal: { x: 0.5, y: 0.4 } }}
  caption="Treatment room 3, 2nd floor"
/>`,
  demo: ex("demo", "Editorial (agency)", "hero/demo.tsx", Demo),
  examples: [
    ex("split-media-spa", "Split media (spa)", "hero/split-media-spa.tsx", Split, "7/5 split; the portrait bleeds off the end edge (start edge in RTL) with a mono caption. Phones: photo on top, cropped square."),
    ex("full-bleed-restaurant", "Full bleed (restaurant) with an overlay navbar", "hero/full-bleed-restaurant.tsx", Bleed, "Forced dark under a bottom-up scrim. video={{ src: \"/dusk.mp4\" }} plays muted and looping with a pause button; reduced motion keeps the poster."),
    ex("product-saas", "Product (SaaS)", "hero/product-saas.tsx", Product, "Release chip, two actions, and the product without device frame, cropped by the section edge. screenshot takes an image; visual takes live JSX."),
    ex("statement", "Statement", "hero/statement.tsx", Statement, "No image: one centred sentence at display-2xl, services as slash-separated links."),
    ex("font-presets", "One hero × four font presets", "hero/font-presets.tsx", Fonts, "Italic serif emphasis in editorial; accent-ink emphasis in grotesk, corporate and system; display sizes follow --display-scale."),
  ],
  api: [
    {
      name: "Hero",
      props: [
        { name: "variant", type: '"editorial" | "split-media" | "full-bleed" | "product" | "statement"', default: '"editorial"', description: "Character (see examples)." },
        { name: "title", type: "ReactNode", description: "The page h1. A string supports one *emphasis*. ≤ 9 words reads best (lint)." },
        { name: "eyebrow", type: "ReactNode", description: "Small mono line above the title." },
        { name: "lead", type: "ReactNode", description: "Intro paragraph (≤ 240 characters in the schema)." },
        { name: "actions", type: "SiteCta[]", description: "≤ 2, one primary. Editorial shows the first as a text link." },
        { name: "media", type: "ImageData", description: "editorial strip (21:9), split-media portrait (4:5), full-bleed background / video poster." },
        { name: "video", type: "{ src: string }", description: "full-bleed: muted looping MP4 + pause button (WCAG 2.2.2)." },
        { name: "caption", type: "ReactNode", description: "split-media: mono caption in the photo's corner." },
        { name: "meta", type: "SiteMeta[]", description: "Up to 4 true facts (Founded · 2014)." },
        { name: "screenshot / visual", type: "ImageData / ReactNode", description: "product: the product shot, cropped by the section's bottom edge." },
        { name: "release", type: "{ label; href; tag? }", description: "product: chip above the title." },
        { name: "services", type: "{ label; href }[]", description: "statement: slash-separated links." },
        { name: "aside", type: "{ title; body?; cta? }", description: "full-bleed: the corner card (glassy in glass mode)." },
        { name: "height", type: '"auto" | "screen"', default: '"auto"', description: "full-bleed: screen fills 100svh." },
        { name: "headingLevel", type: "1 | 2 | 3", default: "1", description: "The renderer passes 2 to every hero after the first." },
        { name: "theme / anchor / id / className / labels / locale / components / editMode", type: "BlockBaseProps", description: "Section theming and adapters (full-bleed always forces mode: dark)." },
      ],
    },
  ],
  notes: ["Image sizes hints: split-media (min-width: 56rem) 42vw, 100vw · full-bleed 100vw · product min(100vw, 90rem). Titles use hyphens: manual (automatic hyphenation is unreliable in Turkish)."],
  covers: ["Hero (5 variants)"],
};

export default entry;
