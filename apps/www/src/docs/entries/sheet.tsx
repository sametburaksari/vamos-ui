import { ex, type DocEntry } from "../types";
import SheetDemo from "../examples/sheet/demo";
import SheetSides from "../examples/sheet/sides";
import SheetRecordPreview from "../examples/sheet/record-preview";
import SheetMobileFilters from "../examples/sheet/mobile-filters";
import SheetDrawer from "../examples/sheet/drawer";

const entry: DocEntry = {
  slug: "sheet",
  title: "Sheet / Drawer",
  group: "Overlays & feedback",
  description:
    "An edge panel that keeps the list behind it in view — quick edit, record preview, mobile filters and navigation. Logical sides, four widths, an inset floating style, a non-modal preview mode, and a Drawer that closes by dragging down.",
  source: ["components/sheet.tsx", "components/dialog.tsx", "styles/overlays.css"],
  basedOn: "Radix Dialog + pointer events",
  usage: `import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetBody, SheetFooter, Button } from "@vamos-ui/react";

<Sheet>
  <SheetTrigger asChild><Button>Quick edit</Button></SheetTrigger>
  <SheetContent side="end" size="md">
    <SheetHeader title="Edit contact" />
    <SheetBody>…</SheetBody>
    <SheetFooter>…</SheetFooter>
  </SheetContent>
</Sheet>`,
  demo: ex("demo", "Demo", "sheet/demo.tsx", SheetDemo),
  examples: [
    ex("sides", "Sides", "sheet/sides.tsx", SheetSides, "start / end are logical and flip in RTL. inset floats the panel with an 8px gutter."),
    ex("record-preview", "Record preview (CRM)", "sheet/record-preview.tsx", SheetRecordPreview, "modal={false}: no overlay or focus trap, the list stays clickable and switching rows updates the panel. Esc still closes."),
    ex("mobile-filters", "Filters as a bottom sheet", "sheet/mobile-filters.tsx", SheetMobileFilters, "side=\"bottom\" fits its content up to the size cap; the footer keeps the result count visible."),
    ex("drawer", "Drawer", "sheet/drawer.tsx", SheetDrawer, "Drag the handle or header down to close. Drags never start on controls or inside a scrolled body; Esc and × always work."),
  ],
  api: [
    { name: "Sheet / Drawer", props: [
      { name: "open / defaultOpen / onOpenChange", type: "boolean / boolean / (open) => void", description: "Same as Dialog." },
      { name: "modal", type: "boolean", default: "true", description: "false → page stays interactive, no overlay, outside clicks don't close (aria-modal=\"false\")." },
    ] },
    { name: "SheetContent", props: [
      { name: "side", type: '"start" | "end" | "top" | "bottom"', default: '"end"', description: "Logical edge. left / right are accepted as aliases of start / end." },
      { name: "size", type: '"sm" | "md" | "lg" | "xl" | "full"', default: '"md"', description: "start/end width: 360 / 440 / 560 / 720 px. top/bottom height cap: 40 / 60 / 75 / 85 % of the viewport." },
      { name: "inset", type: "boolean", default: "false", description: "8px gutter and full radius — a floating panel." },
      { name: "dismissible / onBeforeClose / hideClose / container / labels", type: "as DialogContent", description: "Shared layer behaviour." },
    ] },
    { name: "DrawerContent", props: [
      { name: "dragToDismiss", type: "boolean", default: "true", description: "Close by dragging down past 30% of the height, or with a quick flick." },
      { name: "handle", type: "boolean", default: "true", description: "Show the grab handle (aria-hidden)." },
      { name: "size", type: "SheetContent size", default: '"lg"', description: "Height cap." },
    ] },
    { name: "Parts", props: [
      { name: "SheetHeader / SheetBody / SheetFooter", type: "LayerHeader / LayerBody / LayerFooter", description: "Same API as the Dialog parts." },
      { name: "DrawerHeader / DrawerBody / DrawerFooter / DrawerHandle", type: "layout parts", description: "Drawer variants; DrawerBody marks the scroll area for drag handling." },
      { name: "SheetTrigger / SheetClose / DrawerTrigger / DrawerClose", type: "Radix parts", description: "Use asChild with a Button." },
      { name: "useDragDismiss()", type: "({ onDismiss, threshold?, velocity?, enabled? }) => { ref, handlers }", description: "The pointer logic, for custom bottom panels." },
    ] },
  ],
  notes: ["Blur turns off while dragging (data-dragging), following the glass budget.", "A docked, resizable preview column belongs to Record detail / List layout, not to Sheet."],
  covers: ["Sheet / Drawer"],
};

export default entry;
