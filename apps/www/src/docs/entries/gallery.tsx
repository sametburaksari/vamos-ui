import { ex, type DocEntry } from "../types";
import GalleryDemo from "../examples/gallery/demo";
import GalleryMasonry from "../examples/gallery/masonry";
import GalleryJustified from "../examples/gallery/justified";
import GalleryCaptions from "../examples/gallery/captions";
import GalleryEditable from "../examples/gallery/editable";
import GalleryResponsiveColumns from "../examples/gallery/responsive-columns";

const entry: DocEntry = {
  slug: "gallery",
  title: "Gallery grid",
  group: "Media",
  description:
    "Lays out an image collection as an even grid, masonry columns or justified rows, opens items in the Lightbox, and has an edit mode for listings and gallery blocks: reorder by drag or keyboard (with a Move menu as the non-drag alternative), remove, caption and add.",
  source: ["media/gallery.tsx", "media/gallery-layout.ts"],
  basedOn: "Own layout math (deterministic, SSR-safe) · Sortable for edit mode",
  usage: `import { Gallery } from "@vamos-ui/react/media";

<Gallery items={photos} layout="masonry" columns={{ base: 2, md: 3 }} lightbox />`,
  demo: ex("demo", "Demo", "gallery/demo.tsx", GalleryDemo),
  examples: [
    ex("masonry", "Masonry", "gallery/masonry.tsx", GalleryMasonry, "Items go to the shortest column by their known ratio, so the layout is the same on the server and the client."),
    ex("justified", "Justified rows", "gallery/justified.tsx", GalleryJustified, "Equal-height rows that fill the width exactly; the last row keeps the target height. A proportional flex layout renders before the first measurement."),
    ex("captions", "Captions", "gallery/captions.tsx", GalleryCaptions, "below renders a <figcaption>; overlay paints it on a scrim at the bottom of the tile."),
    ex("editable", "Edit mode", "gallery/editable.tsx", GalleryEditable, "Drag by the handle or press Space, arrows, Space. Each tile also has a Move menu (WCAG 2.5.7), Remove, and an inline caption. onAdd opens your Media picker."),
    ex("responsive-columns", "Responsive columns (team page)", "gallery/responsive-columns.tsx", GalleryResponsiveColumns, "columns follows the gallery's own width (container queries), so it works the same in a sidebar or full width."),
  ],
  api: [
    { name: "Gallery", props: [
      { name: "items", type: "(MediaAsset | MediaSource)[]", description: "Assets or plain { src, alt, width, height, caption }. width/height drive masonry and justified layouts." },
      { name: "layout", type: '"grid" | "masonry" | "justified"', default: '"grid"', description: "Even tiles, columns by ratio, or equal-height rows." },
      { name: "columns", type: "number | { base?, sm?, md?, lg? }", default: "{ base: 2, sm: 3, lg: 4 }", description: "Columns for grid and masonry, by container width." },
      { name: "aspect", type: "ImageAspect", default: '"1/1"', description: "Tile ratio in the grid layout and edit mode." },
      { name: "rowHeight", type: "number", default: "220", description: "Target row height in px (justified)." },
      { name: "captions", type: '"none" | "below" | "overlay"', default: '"none"', description: "Where captions show." },
      { name: "gap", type: '"sm" | "md" | "lg"', default: '"md"', description: "6 / 12 / 20 px between tiles." },
      { name: "rounded", type: '"none" | "ui" | "ui-lg"', default: '"ui"', description: "Tile corners." },
      { name: "lightbox", type: "boolean | LightboxProps (without items)", default: "false", description: "Tiles become \"Enlarge image: {alt}\" buttons that open the Lightbox; pass an object for its options." },
      { name: "sizes", type: "string", description: "sizes for every image. Default derived from the column count." },
      { name: "loading / skeletonCount", type: "boolean / number", default: "false / 6", description: "Skeleton tiles that keep their ratio." },
      { name: "label", type: "string", default: '"Gallery"', description: "Accessible name of the list." },
      { name: "editable", type: "boolean", default: "false", description: "Edit mode (grid layout): handle drag + keyboard reorder, Move menu, Remove, caption input, Add tile." },
      { name: "onReorder", type: "(ids: string[]) => void", description: "New order of item ids. Without it the items can't be moved." },
      { name: "onRemove", type: "(id: string) => void", description: "Shows a Remove button per tile." },
      { name: "onCaptionChange", type: "(id: string, caption: string) => void", description: "Shows an inline caption field (commits on blur / Enter)." },
      { name: "onAdd", type: "() => void", description: "\"Add images\" tile (a large drop-style tile when the gallery is empty)." },
      { name: "labels", type: "Partial<GalleryLabels>", description: "enlarge, remove, caption, add… (dictionary namespace gallery)." },
    ] },
    { name: "Layout helpers", props: [
      { name: "masonryColumns(ratios, columns)", type: "→ number[][]", description: "Item indexes per column, shortest column first." },
      { name: "justifyRows(ratios, width, rowHeight, gap?)", type: "→ { items, height, justified }[]", description: "Flickr-style rows." },
    ] },
  ],
  notes: ["Tiles never get backdrop-filter. The hover layer uses --overlay; selection and focus use --ring.", "In view mode an empty gallery renders nothing; in edit mode it shows the Add tile."],
  covers: ["Gallery grid"],
};

export default entry;
