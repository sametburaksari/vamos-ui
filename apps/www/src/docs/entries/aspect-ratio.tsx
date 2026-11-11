import { ex, type DocEntry } from "../types";
import AspectRatioDemo from "../examples/aspect-ratio/demo";
import AspectRatioRatios from "../examples/aspect-ratio/ratios";
import AspectRatioMap from "../examples/aspect-ratio/map";
import AspectRatioVideo from "../examples/aspect-ratio/video";

const entry: DocEntry = {
  slug: "aspect-ratio",
  title: "Aspect Ratio",
  group: "Media",
  description:
    "Keeps a box at a fixed width-to-height ratio and stretches its child to fill it — an iframe, a video, a map, an image or a placeholder. Pure CSS aspect-ratio, server-safe, no layout shift.",
  source: ["components/aspect-ratio.tsx"],
  basedOn: "CSS aspect-ratio (no dependencies)",
  usage: `import { AspectRatio } from "@vamos-ui/react";

<AspectRatio ratio="16/9" rounded="ui-lg">
  <iframe src="https://player.example.com/embed/7421" title="Product tour" />
</AspectRatio>`,
  demo: ex("demo", "Demo", "aspect-ratio/demo.tsx", AspectRatioDemo),
  examples: [
    ex("ratios", "Ratios", "aspect-ratio/ratios.tsx", AspectRatioRatios, "\"1/1\", \"4/5\", \"4/3\", \"16/9\", \"21/9\" or any number. The width follows the container."),
    ex("map", "Embedded map (site)", "aspect-ratio/map.tsx", AspectRatioMap, "The direct child is positioned to fill the box; iframes lose their default border. tone=\"inset\" shows surface-2 while it loads."),
    ex("video", "Video player (course page)", "aspect-ratio/video.tsx", AspectRatioVideo, "A <video> keeps 16:9 at every width; fit sets its object-fit."),
  ],
  api: [
    { name: "AspectRatio", props: [
      { name: "ratio", type: '"16/9" | "4/3" | `${number}/${number}` | number', default: '"16/9"', description: "Width ÷ height. Strings also accept \"16:9\". Invalid values fall back to 16/9." },
      { name: "rounded", type: '"none" | "ui" | "ui-lg" | "full"', default: '"none"', description: "Corner radius from --radius; the child is clipped." },
      { name: "fit", type: '"cover" | "contain" | "fill"', default: '"cover"', description: "object-fit for a direct <img> or <video>." },
      { name: "tone", type: '"none" | "inset"', default: '"none"', description: "inset: a surface-2 backdrop (letterboxing, loading iframes)." },
      { name: "children", type: "ReactNode", description: "One element; it is stretched to fill the box." },
    ] },
    { name: "Helpers", props: [
      { name: "parseAspectRatio(ratio)", type: "→ number | undefined", description: "\"16/9\" → 1.777…, \"4:3\" → 1.333…, 1.5 → 1.5." },
    ] },
  ],
  notes: [
    "For images use Image with aspect — it also handles srcset, focal point and placeholders. AspectRatio is for everything else.",
    "Nothing is focusable on the box itself; keyboard and screen readers reach the child directly.",
  ],
  covers: ["Aspect Ratio"],
};

export default entry;
