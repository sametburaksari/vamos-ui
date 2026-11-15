import { ex, type DocEntry } from "../types";
import Demo from "../examples/news-ticker/demo";
import Marquee from "../examples/news-ticker/marquee";

const entry: DocEntry = {
  slug: "news-ticker",
  title: "News ticker",
  group: "Site blocks",
  description:
    "A “Trending now” or breaking-news strip. rotate shows one headline at a time with previous / next and a pause button; it pauses while hovered or focused and when the tab is hidden, and never starts under prefers-reduced-motion (WCAG 2.2.2). Headlines are announced only while it is paused, so it never chatters. marquee is a continuous crawl on the kit Marquee (CSS, pausable, static with reduced motion).",
  source: ["blocks/site/news-ticker.tsx", "styles/blocks.css"],
  basedOn: "Marquee",
  usage: `import { NewsTicker } from "@vamos-ui/react/blocks";

<NewsTicker items={[{ title: "Swing bridge closes tonight", href: "/city/bridge", category: "Traffic", breaking: true }, …]} />
<NewsTicker mode="marquee" tone="ink" items={headlines} />`,
  demo: ex("demo", "Rotating headlines", "news-ticker/demo.tsx", Demo),
  examples: [ex("marquee", "Marquee, Turkish", "news-ticker/marquee.tsx", Marquee, "Every headline is listed once for assistive tech; the duplicate track is aria-hidden and inert.")],
  api: [
    {
      name: "NewsTicker",
      props: [
        { name: "items", type: "{ title; href; category?; breaking? }[]", description: "breaking adds a dot (pulses only without reduced motion)." },
        { name: "mode", type: '"rotate" | "marquee"', default: '"rotate"', description: "One at a time, or a crawl." },
        { name: "interval", type: "number", default: "5000", description: "rotate: ms per headline." },
        { name: "autoplay", type: "boolean", default: "true", description: "rotate: advance on its own (never under reduced motion)." },
        { name: "label", type: "ReactNode", default: '"Trending now"', description: "The tag; names the region." },
        { name: "tone", type: '"accent" | "ink" | "danger"', default: '"accent"', description: "Tag colour." },
        { name: "locale / labels / components / className", type: "…", description: "Strings: trendingNow, pause/play, previous/next headline." },
      ],
    },
  ],
  notes: ["Under 28rem the category label and the previous arrow hide; pause and next stay."],
  covers: ["News ticker"],
};

export default entry;
