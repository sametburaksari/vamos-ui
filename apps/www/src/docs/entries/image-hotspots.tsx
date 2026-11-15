import { ex, type DocEntry } from "../types";
import ImageHotspotsDemo from "../examples/image-hotspots/demo";
import ImageHotspotsProduct from "../examples/image-hotspots/product";
import ImageHotspotsMultiple from "../examples/image-hotspots/multiple";

const entry: DocEntry = {
  slug: "image-hotspots",
  title: "Image hotspots",
  group: "Media",
  description:
    "A picture with labelled, selectable spots — rooms on a floor plan, parts of a product, buildings on a campus map. Each spot is a real button placed in % of the picture; pick one (a radio group) or several (toggle buttons), with a tooltip, an optional callout, or your own detail panel.",
  source: ["components/image-hotspots.tsx"],
  basedOn: "WAI-ARIA radio group / toggle button",
  usage: `import { ImageHotspots } from "@vamos-ui/react";

<ImageHotspots aria-label="Third floor" aspectRatio={16 / 10} hotspots={rooms} value={room} onValueChange={setRoom}>
  <img src="/plans/floor-3.svg" alt="" />
</ImageHotspots>`,
  demo: ex("demo", "Floor plan with a detail panel", "image-hotspots/demo.tsx", ImageHotspotsDemo, "callout={false} and the detail rendered beside the plan from value."),
  examples: [
    ex("product", "Product parts", "image-hotspots/product.tsx", ImageHotspotsProduct, "numbered markers and the default callout (label + description)."),
    ex("multiple", "Multiple selection", "image-hotspots/multiple.tsx", ImageHotspotsMultiple, "type=\"multiple\" with always-visible labels; disabled spots are skipped by the arrow keys."),
  ],
  api: [
    { name: "ImageHotspots", props: [
      { name: "hotspots", type: "{ id, x, y, label, description?, marker?, disabled? }[]", description: "x / y in % (0–100) from the top-left of the picture. label is the accessible name." },
      { name: "children", type: "ReactNode", description: "The picture: an img, inline SVG or any element. img / svg children fill the box." },
      { name: "aspectRatio", type: "number | string", description: "Box ratio; also used for the arrow-key geometry. Omit to size from the children." },
      { name: "type", type: '"single" | "multiple"', default: '"single"', description: "Radio group (arrows move and select) or toggle buttons (arrows move, Space toggles)." },
      { name: "value / defaultValue / onValueChange", type: "string | null  ·  string[]", description: "Selection, per type." },
      { name: "numbered", type: "boolean", description: "1, 2, 3… in the markers." },
      { name: "showLabels", type: "boolean", description: "Labels always visible instead of a hover / focus tooltip." },
      { name: "callout", type: "false | (spot) => ReactNode", description: "Popover by the selected spot (single). Default: label + description when there is one." },
      { name: "aria-label", type: "string", description: "Required: what the picture shows." },
    ] },
  ],
  notes: ["One tab stop; arrow keys go to the nearest spot in that direction, Home / End to the first / last, Escape clears.", "Coordinates are physical (the picture does not mirror in RTL); left / right arrows follow the reading direction.", "For geographic coordinates use pin-map."],
  covers: [],
};

export default entry;
