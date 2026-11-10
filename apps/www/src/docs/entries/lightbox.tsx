import { ex, type DocEntry } from "../types";
import LightboxDemo from "../examples/lightbox/demo";
import LightboxZoom from "../examples/lightbox/zoom";
import LightboxVideo from "../examples/lightbox/video";
import LightboxControlled from "../examples/lightbox/controlled";
import LightboxInfoPanel from "../examples/lightbox/info-panel";

const entry: DocEntry = {
  slug: "lightbox",
  title: "Lightbox",
  group: "Media",
  description:
    "Full-screen viewer for images and video: swipe or arrow keys to browse, pinch / wheel / double-tap zoom with pan, thumbnails, captions, download and a file-details panel for the media library. Dialog pattern: focus trap, Esc closes, focus returns to the thumbnail.",
  source: ["media/lightbox.tsx", "media/use-pan-zoom.ts"],
  basedOn: "Radix Dialog + Carousel + usePanZoom",
  usage: `import { Lightbox, LightboxTrigger } from "@vamos-ui/react/media";

<Lightbox items={photos} download>
  {photos.map((p, i) => (
    <LightboxTrigger key={p.id} index={i} aria-label={\`Enlarge image: \${p.alt}\`}>
      <Image src={p.src} alt="" aspect="1/1" />
    </LightboxTrigger>
  ))}
</Lightbox>`,
  demo: ex("demo", "Demo", "lightbox/demo.tsx", LightboxDemo),
  examples: [
    ex("zoom", "Zoom", "lightbox/zoom.tsx", LightboxZoom, "Pinch, wheel, double-tap, or + − 0. While zoomed, dragging pans instead of switching images. backdrop=\"dim\" shows the page behind."),
    ex("video", "Images and video", "lightbox/video.tsx", LightboxVideo, "Items with kind: \"video\" play in the kit's Video player. Opened from a Gallery with lightbox={{ backdrop: \"blur\" }}."),
    ex("controlled", "Controlled", "lightbox/controlled.tsx", LightboxControlled, "open and index live in your state (or your router's ?photo=); no trigger needed."),
    ex("info-panel", "File details (media library)", "lightbox/info-panel.tsx", LightboxInfoPanel, "info adds a panel with alt text, file name, type, size, dimensions and uploader, formatted with the current locale."),
  ],
  api: [
    { name: "Lightbox", props: [
      { name: "items", type: "(MediaAsset | MediaSource)[]", description: "Images and videos. MediaSource: { src, alt, width?, height?, caption?, kind?, poster?, placeholder? }." },
      { name: "open / defaultOpen / onOpenChange", type: "boolean / boolean / (o) => void", default: "— / false", description: "Controlled or uncontrolled." },
      { name: "index / defaultIndex / onIndexChange", type: "number / number / (i) => void", default: "— / 0", description: "Current item. Sync it to the URL yourself if you want." },
      { name: "zoom", type: "boolean | { max?: number }", default: "true (max 3)", description: "Image zoom with pan." },
      { name: "thumbnails", type: "boolean", default: "true with 2+ items", description: "Thumbnail strip." },
      { name: "download", type: "boolean", default: "false", description: "Download button for the original." },
      { name: "info", type: "boolean", default: "false", description: "File-details panel toggle (uses MediaAsset fields)." },
      { name: "loop", type: "boolean", default: "true", description: "Wrap at the ends." },
      { name: "backdrop", type: '"solid" | "dim" | "blur"', default: '"solid"', description: "solid: the scene at 96%; dim: --overlay (chrome switches to dark); blur: overlay + blur (the only blurred layer)." },
      { name: "chrome", type: '"minimal" | "full"', default: '"full"', description: "minimal hides the caption and thumbnails." },
      { name: "labels", type: "Partial<LightboxLabels>", description: "viewer, counter, close, zoomIn… (dictionary namespace lightbox)." },
      { name: "children", type: "ReactNode", description: "Triggers or a gallery; they can call useLightbox()." },
    ] },
    { name: "LightboxTrigger", props: [
      { name: "index", type: "number", description: "Item to open." },
      { name: "asChild", type: "boolean", default: "false", description: "Use your own element (a Button)." },
    ] },
    { name: "useLightbox()", props: [{ name: "→", type: "{ open(index?), close(), isOpen, index }", description: "Open the surrounding viewer from custom UI." }] },
    { name: "usePanZoom(options)", props: [
      { name: "min / max / step", type: "number", default: "1 / 3 / 0.5", description: "Zoom range and button step." },
      { name: "doubleTapScale", type: "number", default: "2", description: "Double click / tap toggles to this." },
      { name: "→ returns", type: "{ bind, style, scale, zoomed, zoomIn, zoomOut, reset, zoomTo }", description: "Spread bind on the viewport and style on the content." },
    ] },
  ],
  notes: ["Keys: ←/→ browse (mirrored in RTL), Home/End, + / − / 0 zoom, Esc close.", "The counter is aria-live: \"Image 4 of 12: Office entrance\"."],
  covers: ["Lightbox"],
};

export default entry;
