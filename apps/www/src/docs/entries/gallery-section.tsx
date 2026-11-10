import { ex, type DocEntry } from "../types";
import Demo from "../examples/gallery-section/demo";
import Filmstrip from "../examples/gallery-section/filmstrip";
import GridLightbox from "../examples/gallery-section/grid-lightbox";
import SplitCaption from "../examples/gallery-section/split-caption";

const entry: DocEntry = {
  slug: "gallery-section",
  title: "Gallery section",
  group: "Site blocks",
  description:
    "Venue, food and project photos. A server-rendered grid — mosaic with author-chosen spans, a scroll-snapped filmstrip, equal cells, or a sticky caption beside an image stream — with the Media group's Lightbox as an island: thumbnails are buttons (“Open image 3 of 12”), the viewer traps focus, closes on Esc and navigates with arrows. Alt text is required.",
  source: ["blocks/site/gallery-section.tsx", "blocks/site/shared/gallery-lightbox.tsx", "media/lightbox.tsx", "blocks/site/registry-2.ts", "styles/blocks.css"],
  basedOn: "Lightbox (Media group)",
  usage: `import { GallerySection } from "@vamos-cms/ui/blocks";

<GallerySection
  title="The *room*"
  images={[
    { image: { src: "/img/dining-room.jpg", alt: "The dining room at dusk", width: 2000, height: 1333 }, span: "big" },
    { image: { src: "/img/bar.jpg", alt: "The rakı shelf", width: 1200, height: 1500 }, span: "tall" },
  ]}
/>`,
  demo: ex("demo", "Mosaic (restaurant)", "gallery-section/demo.tsx", Demo),
  examples: [
    ex("filmstrip", "Filmstrip (spa)", "gallery-section/filmstrip.tsx", Filmstrip, "One scroll-snapped row of equal heights, running off the end edge; the track is keyboard-scrollable."),
    ex("grid-lightbox", "Grid + lightbox", "gallery-section/grid-lightbox.tsx", GridLightbox, "Equal cells at a fixed ratio (aspect) with small captions."),
    ex("split-caption", "Split caption (case study)", "gallery-section/split-caption.tsx", SplitCaption, "Sticky title on the start side, images with long numbered captions on the end side; lightbox off."),
  ],
  api: [
    {
      name: "GallerySection",
      props: [
        { name: "variant", type: '"mosaic" | "filmstrip" | "grid" | "split-caption"', default: '"mosaic"', description: "A mosaic with fewer than 5 images becomes grid." },
        { name: "images", type: "{ image: { src; alt; width; height; focal? }; caption?; span? }[]", description: "3–40 images; span: 1 · wide · tall · big (mosaic)." },
        { name: "lightbox", type: "boolean", default: "true", description: "Open images in the full-screen viewer." },
        { name: "aspect", type: '"mixed" | "3:2" | "1:1" | "4:5"', default: '"3:2"', description: "Cell ratio for grid." },
        { name: "eyebrow / title / lead", type: "ReactNode", description: "Section header." },
        { name: "labels / locale", type: "Partial<Site2Labels> / string", description: "Open image {index} of {total}, {count} photos." },
        { name: "theme / anchor / id / className / headingLevel / components / editMode", type: "BlockBaseProps", description: "Shared block props." },
      ],
    },
  ],
  covers: ["Gallery section"],
};

export default entry;
