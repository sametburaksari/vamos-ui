import { ex, type DocEntry } from "../types";
import PinMapDemo from "../examples/pin-map/demo";
import PinMapVisitors from "../examples/pin-map/visitors";
import PinMapDispatch from "../examples/pin-map/dispatch";
import PinMapLabels from "../examples/pin-map/labels";

const entry: DocEntry = {
  slug: "pin-map",
  title: "Pin map",
  group: "Data display",
  description:
    "Markers on a projected sheet — stores, field jobs, vehicles, live visitors — without a tile provider or API key. Pins sit in Web Mercator inside your bounds over a quiet coordinate grid with a scale bar; pass a backdrop to lay them over your own static map. Selection syncs with a list, and arrow keys move to the nearest pin in that direction.",
  source: ["components/pin-map.tsx"],
  basedOn: "Web Mercator · roving tabindex",
  usage: `import { PinMap } from "@vamos-ui/react";

<PinMap aria-label="Stores" pins={stores.map((s) => ({ id: s.id, lat: s.lat, lng: s.lng, label: s.name }))}
  selectedId={selected} onSelectedIdChange={setSelected} />`,
  demo: ex("demo", "Demo", "pin-map/demo.tsx", PinMapDemo),
  examples: [
    ex("dispatch", "Dispatch with a synced list (ops)", "pin-map/dispatch.tsx", PinMapDispatch, "Status tones, a pulse for vehicles en route, icons in the markers, and selection shared with the list."),
    ex("visitors", "Live visitors (analytics)", "pin-map/visitors.tsx", PinMapVisitors, "variant=\"bubble\" sizes by value (area, not radius); children overlay the map."),
    ex("labels", "Labels and dots", "pin-map/labels.tsx", PinMapLabels, "Without bounds the map fits every pin; showLabels for a handful of sites."),
  ],
  api: [
    { name: "PinMap", props: [
      { name: "pins", type: "MapPin[]", description: "{ id, lat, lng, label, description?, tone?, value?, pulse?, icon? }. label is the accessible name." },
      { name: "aria-label", type: "string", description: "Required. What the map shows." },
      { name: "bounds", type: "{ north, south, west, east }", description: "Visible area. Omit to fit every pin. Always widened to the aspect ratio so shapes stay true." },
      { name: "aspectRatio", type: "number", default: "16 / 10", description: "Width ÷ height." },
      { name: "variant", type: '"pin" | "dot" | "bubble"', default: '"pin"', description: "Markers, small dots or value-sized bubbles." },
      { name: "selectedId / defaultSelectedId / onSelectedIdChange", type: "string | null", description: "Selection (controlled or not). Clicking a selected pin clears it; Escape too." },
      { name: "callout", type: "false | (pin) => ReactNode", description: "Card above the selected pin. Default: label + description; it also becomes the pin's accessible description." },
      { name: "showLabels", type: "boolean", description: "Labels beside every marker." },
      { name: "backdrop", type: "ReactNode", description: "Your own layer under the pins (a static map image, district outlines)." },
      { name: "bare", type: "boolean", description: "Hide coordinate ticks and the scale bar." },
      { name: "children", type: "ReactNode", description: "Overlay content (legend, totals), positioned by you." },
    ] },
  ],
  notes: [
    "Keyboard: Tab enters on the selected (or first) pin, arrows go to the nearest pin in that direction, Home/End jump, Enter/Space toggles selection, Escape clears.",
    "Not a slippy map: no panning or zoom. For street-level navigation use a map provider and keep PinMap for overviews and placeholders.",
  ],
  covers: [],
};

export default entry;
