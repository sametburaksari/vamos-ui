import { ex, type DocEntry } from "../types";
import Demo from "../examples/media-text/demo";
import Overlap from "../examples/media-text/overlap";
import Bleed from "../examples/media-text/bleed-video";
import Alternating from "../examples/media-text/alternating";

const entry: DocEntry = {
  slug: "media-text",
  title: "Media + text",
  group: "Site blocks",
  description:
    "The most used body section: an image or video beside text — “Our kitchen”, “How we work”, a feature deep-dive. Text is top-aligned with the image, not vertically centred. Video is a click-to-load facade (YouTube via youtube-nocookie, Vimeo with dnt, or MP4), so no third-party request happens before the visitor asks.",
  source: ["blocks/site/media-text.tsx", "blocks/site/embed-facade.tsx", "blocks/site/registry-1.ts", "styles/blocks.css"],
  usage: `import { MediaText } from "@vamos-ui/react/blocks";

<MediaText
  eyebrow="The kitchen"
  title="Fish from the *morning* boats"
  body="What he buys decides the menu…"
  bullets={["Sea bass in season", "Meze made the same morning"]}
  media={{ src, alt, width, height }}
  video={{ provider: "youtube", url: "https://www.youtube.com/watch?v=…" }}   // optional facade
  mediaSide="end"
/>`,
  demo: ex("demo", "Side by side (restaurant)", "media-text/demo.tsx", Demo),
  examples: [
    ex("overlap", "Overlap (boutique hotel)", "media-text/overlap.tsx", Overlap, "The image takes 8 columns; a surface panel overlaps its corner (counts as a card section; glassy in glass mode)."),
    ex("bleed-video", "Bleed + video facade", "media-text/bleed-video.tsx", Bleed, "The image runs to the section edge. “Play video: …” swaps in the player and moves focus to it."),
    ex("alternating", "Alternating sides", "media-text/alternating.tsx", Alternating, "mediaSide is logical (start / end), so RTL mirrors the page."),
  ],
  api: [
    {
      name: "MediaText",
      props: [
        { name: "variant", type: '"side" | "overlap" | "bleed"', default: '"side"', description: "Layout (see examples)." },
        { name: "title", type: "ReactNode", description: "Section title (h2), one *emphasis*." },
        { name: "eyebrow", type: "ReactNode", description: "Mono line above the title." },
        { name: "body", type: "RichDoc | string", description: "Text; stored headings shift below the title." },
        { name: "bullets", type: "ReactNode[]", description: "≤ 6 points with accent dashes between hairlines." },
        { name: "cta", type: "SiteCta", description: "One action." },
        { name: "media", type: "ImageData", description: "Required; also the video poster." },
        { name: "video", type: '{ provider: "youtube" | "vimeo" | "mp4"; url; title? }', description: "Facade → iframe / video on click." },
        { name: "mediaSide", type: '"start" | "end"', default: '"start"', description: "Logical side of the image." },
        { name: "aspect", type: '"4:5" | "3:2" | "1:1"', default: '"4:5"', description: "Crop ratio (overlap uses 3:2)." },
        { name: "theme / anchor / id / className / labels / locale / components / editMode / headingLevel", type: "BlockBaseProps", description: "labels.playVideo / video name the facade." },
      ],
    },
    { name: "videoEmbedUrl(video)", props: [{ name: "returns", type: "string", description: "youtube-nocookie / player.vimeo.com embed URL with autoplay." }] },
  ],
  covers: ["Media + text"],
};

export default entry;
