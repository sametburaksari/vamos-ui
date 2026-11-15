import { ex, type DocEntry } from "../types";
import ReadingProgressDemo from "../examples/reading-progress/demo";
import ReadingProgressPage from "../examples/reading-progress/page";

const entry: DocEntry = {
  slug: "reading-progress",
  title: "Reading progress",
  group: "Navigation",
  description:
    "How far the reader is through an article or the page: a thin accent bar pinned to the top of the window (or inline), an announced value with minutes left, and an optional floating indicator. Tracks a target element by ref or selector, or the whole page.",
  source: ["components/reading-progress.tsx"],
  basedOn: "WAI-ARIA progressbar role",
  usage: `import { ReadingProgress } from "@vamos-ui/react";

const articleRef = React.useRef<HTMLElement>(null);
<ReadingProgress target={articleRef} minutes={8} indicator />
<article ref={articleRef}>…</article>

<ReadingProgress />  // the whole page`,
  demo: ex("demo", "Demo", "reading-progress/demo.tsx", ReadingProgressDemo),
  examples: [
    ex("page", "Whole page", "reading-progress/page.tsx", ReadingProgressPage, "Without a target the bar follows the page scroll. position=\"top\" (default) pins it to the window."),
  ],
  api: [
    { name: "ReadingProgress", props: [
      { name: "target", type: "RefObject<HTMLElement> | HTMLElement | string", description: "What is being read: a ref, an element or a CSS selector. Omit for the whole page." },
      { name: "offset", type: "number", default: "0.3", description: "The reading line as a share of the window height: progress is how far it has moved through the target." },
      { name: "minutes", type: "number", description: "Reading time; adds \"3 min left\" to the announced value and the indicator." },
      { name: "position", type: '"top" | "bottom" | "inline"', default: '"top"', description: "Pinned to the top or bottom of the window, or a bar in the flow." },
      { name: "indicator", type: "boolean", default: "false", description: "Floating pill (bottom end) with the percentage and minutes left while reading." },
      { name: "portal", type: "boolean", default: "true when pinned", description: "Render the pinned bar in the theme's portal container so sticky headers and transformed ancestors never clip it." },
      { name: "onProgressChange", type: "(progress: number) => void", description: "Progress 0…1 as it changes." },
      { name: "labels", type: "Partial<ReadingProgressLabels>", description: 'Dictionary namespace "readingProgress": label, minutesLeft, done.' },
    ] },
    { name: "useReadingProgress(target?, options?)", props: [
      { name: "options", type: "{ offset?, onChange? }", description: "Same measuring as the component, for custom indicators." },
      { name: "returns", type: "{ progress: number; started: boolean }", description: "progress 0…1; started once the target's top passes the reading line." },
    ] },
  ],
  notes: ["A target that ends near the bottom of the page counts as finished when the page can't scroll further.", "For a purely decorative page bar with no announced value, ScrollProgress in @vamos-ui/react/motion uses CSS scroll timelines."],
  covers: [],
};

export default entry;
