import { ex, type DocEntry } from "../types";
import SortableDemo from "../examples/sortable/demo";
import SortableGridExample from "../examples/sortable/grid";
import SortableMultiContainer from "../examples/sortable/multi-container";
import SortableMoveMenuExample from "../examples/sortable/move-menu";
import SortableHorizontal from "../examples/sortable/horizontal";
import SortableStates from "../examples/sortable/states";
import SortableComposable from "../examples/sortable/composable";
import SortableVirtualized from "../examples/sortable/virtualized";
import SortablePointerDrag from "../examples/sortable/pointer-drag";

const entry: DocEntry = {
  slug: "sortable",
  title: "Sortable",
  group: "Editors & drag-and-drop",
  description:
    "The kit's one reordering primitive: lists, grids, tables and multi-list boards with pointer, touch and keyboard dragging, spoken announcements and a Move menu on every item so nothing requires dragging. Also ships usePointerDrag and useTimeScale, the drag and time-axis hooks behind the scheduler and Gantt.",
  source: ["sortable/sortable.tsx", "sortable/sortable-list.tsx", "sortable/use-pointer-drag.ts", "scheduler/core/time-scale.ts"],
  basedOn: "dnd-kit (internal; no engine types in the public API)",
  usage: `import { SortableList } from "@vamos-ui/react/sortable";

<SortableList
  aria-label="Main menu"
  items={pages}
  getLabel={(p) => p.title}
  onReorder={setPages}
  renderItem={(p) => p.title}
/>

// compose your own markup
<Sortable items={lines} onReorder={setLines}>
  {lines.map((l) => (
    <SortableItem key={l.id} id={l.id} as="tr"><td><SortableHandle /></td>…<td><SortableMoveMenu /></td></SortableItem>
  ))}
  <SortableOverlay>{(id) => <Row id={id} />}</SortableOverlay>
</Sortable>`,
  demo: ex("demo", "Demo", "sortable/demo.tsx", SortableDemo),
  examples: [
    ex("grid", "Grid", "sortable/grid.tsx", SortableGridExample, "A CMS article gallery. The whole tile is the drag activator; arrow keys move in two dimensions and the Move menu says Earlier / Later."),
    ex("multi-container", "Between lists", "sortable/multi-container.tsx", SortableMultiContainer, "HR export columns: drag between Included and Available, or use Move to list. onMoveBetween fires once on drop with the final index."),
    ex("move-menu", "Move menu", "sortable/move-menu.tsx", SortableMoveMenuExample, "CRM pipeline stages. Every row has a Move menu (WCAG 2.5.7): up, down, to top, to bottom; impossible moves are disabled and the result is announced."),
    ex("horizontal", "Horizontal", "sortable/horizontal.tsx", SortableHorizontal, "Saved views in a toolbar. Left and right arrows move the lifted item and follow the visual order, so they mirror in RTL."),
    ex("states", "Disabled items and empty", "sortable/states.tsx", SortableStates, "Required onboarding steps keep their position (no handle, no menu). An empty list renders the empty slot."),
    ex("composable", "Composable parts", "sortable/composable.tsx", SortableComposable, "Invoice lines in a table: Sortable + SortableItem as tr + SortableHandle + SortableMoveMenu, and a custom overlay. Amounts use exact decimal strings."),
    ex("virtualized", "1,000 rows, virtualized", "sortable/virtualized.tsx", SortableVirtualized, "keepMountedRange (a rangeExtractor for @tanstack/react-virtual, or any windowing) keeps the dragged row mounted while it scrolls out of view; the overlay carries the clone."),
    ex("pointer-drag", "usePointerDrag + useTimeScale", "sortable/pointer-drag.tsx", SortablePointerDrag, "The non-list drag hook used by the scheduler and Gantt: pointer capture, axis lock, 15-minute snapping on a time scale in Europe/Istanbul, Esc to cancel, and an arrow-key alternative."),
  ],
  api: [
    { name: "SortableList / SortableGrid", props: [
      { name: "items", type: "T[]", description: "Items in their current order." },
      { name: "onReorder", type: "(next: T[], e: { id, from, to }) => void", description: "Called on drop or Move-menu move with the reordered array." },
      { name: "renderItem", type: "(item, { index, isDragging, overlay, disabled }) => ReactNode", description: "Row / tile content. Also renders the dragged clone (overlay: true)." },
      { name: "getId", type: "(item) => string", default: "item.id", description: "Stable id." },
      { name: "getLabel", type: "(item) => string", default: "label / title / name", description: "Spoken in announcements and control names (\"Reorder About us\")." },
      { name: "disabled", type: "boolean | (item) => boolean", description: "Fixed items: no handle, no Move menu, not draggable." },
      { name: "moveMenu", type: "boolean", default: "true", description: "Move menu on every item: the non-drag alternative." },
      { name: "renderActions", type: "(item) => ReactNode", description: "Trailing actions beside the Move menu." },
      { name: "empty", type: "ReactNode", description: "Rendered instead of the list when items is empty." },
      { name: "orientation", type: '"vertical" | "horizontal"', default: '"vertical"', description: "SortableList only. Grid always moves in 2-D." },
      { name: "handle", type: "boolean", default: "List true · Grid false", description: "Drag only from the grip handle, or from the whole item." },
      { name: "variant", type: '"card" | "inset" | "plain"', default: '"card"', description: "SortableList only. Separate rows, one box with dividers, or no chrome." },
      { name: "size", type: '"sm" | "md"', default: '"md"', description: "SortableList only. Row height follows --control-h." },
      { name: "minItemWidth", type: "string", default: '"10rem"', description: "SortableGrid only. Columns auto-fill at this minimum width." },
      { name: "labels", type: "Partial<SortableLabels>", description: "Built-in strings (announcements, menu). Dictionary namespace: sortable." },
      { name: "aria-label / aria-labelledby", type: "string", description: "Name of the list. Required for a meaningful list." },
    ] },
    { name: "Sortable", props: [
      { name: "items / getId / getLabel / onReorder / disabled / labels", type: "as above", description: "Same as SortableList." },
      { name: "orientation", type: '"vertical" | "horizontal" | "grid"', default: '"vertical"', description: "Keyboard axes, sorting strategy and the axis lock." },
      { name: "handle", type: "boolean", default: "true", description: "true: put a SortableHandle in each item. false: the SortableItem itself is the activator." },
      { name: "containers", type: "{ id, label?, items: string[] }[]", description: "Multi-list mode (boards, Included / Available). items must hold every item." },
      { name: "onMoveBetween", type: "(e: { id, from, to, index, fromIndex }) => void", description: "Multi-list mode: called once per drop or menu move, also within one list." },
      { name: "renderOverlay", type: "(item) => ReactNode", description: "Default content of <SortableOverlay/>." },
      { name: "onDragStart / onDragEnd", type: "(id) => void / (id, cancelled) => void", description: "Lifecycle. <html data-dragging> is set while dragging so glass blur can switch off." },
    ] },
    { name: "SortableItem", props: [
      { name: "id", type: "string", description: "Item id." },
      { name: "as", type: '"div" | "li" | "tr" | "section" | "article"', default: '"div"', description: "Element. Keep handle mode inside lists and tables so row semantics stay intact." },
      { name: "disabled", type: "boolean", description: "Overrides the root disabled rule." },
    ] },
    { name: "SortableHandle", props: [
      { name: "size", type: '"sm" | "md"', default: '"md"', description: "24 or 28 px. Named \"Reorder {item}\"; hidden for disabled items." },
      { name: "children", type: "ReactNode", default: "grip icon", description: "Custom icon." },
    ] },
    { name: "SortableOverlay", props: [
      { name: "children", type: "ReactNode | (id) => ReactNode", description: "The dragged clone. Portaled, opaque popover, never blurred. Add vui-sortable-clone to your root for the lifted style." },
    ] },
    { name: "SortableMoveMenu", props: [
      { name: "id", type: "string", default: "surrounding item", description: "Item to move." },
      { name: "size", type: '"xs" | "sm" | "md"', default: '"sm"', description: "Trigger size." },
      { name: "trigger", type: "ReactElement", description: "Custom trigger (asChild)." },
      { name: "align", type: '"start" | "end"', default: '"end"', description: "Menu alignment." },
    ] },
    { name: "SortableContainer", props: [
      { name: "id", type: "string", description: "Container id from containers." },
      { name: "as", type: '"div" | "ul" | "ol" | "section"', default: '"div"', description: "Element. Also the drop target when empty (data-empty, data-over)." },
      { name: "children", type: "(ids: string[], { isOver, isEmpty }) => ReactNode", description: "Renders the live (preview) order while dragging." },
    ] },
    { name: "useSortableItem(id)", props: [
      { name: "returns", type: "{ ref, handleProps, style, isDragging, isPlaceholder, disabled, index, label }", description: "For kit consumers with custom markup: spread handleProps on the activator, ref + style on the root." },
    ] },
    { name: "usePointerDrag(options)", props: [
      { name: "axis", type: '"x" | "y" | "both"', default: '"both"', description: "Axis lock." },
      { name: "snap", type: "(delta, state) => delta", description: "Map raw movement to a grid; snapToGrid({ y: 12 }) is provided." },
      { name: "threshold", type: "number", default: "3 (touch 6)", description: "Pixels before a press becomes a drag; below it onTap fires." },
      { name: "scrollContainer / autoScrollEdge / autoScrollSpeed", type: "RefObject | () => el / number / number", default: "— / 32 / 14", description: "Auto-scroll near the container edges; scroll is added to delta." },
      { name: "onStart / onMove / onEnd / onCancel / onTap", type: "(state) => void", description: "state: { origin, delta, rawDelta, pointerType, altKey, shiftKey, target }. Esc and pointercancel call onCancel." },
      { name: "returns", type: "{ bind, isDragging, cancel }", description: "Spread bind on the element (pointer down + touch-action)." },
    ] },
    { name: "useTimeScale(options) / createTimeScale", props: [
      { name: "start / end", type: "Date | number | ISO string | YYYY-MM-DD", description: "Range. Date-only values are local midnight in timeZone." },
      { name: "scale", type: '"hour" | "day" | "week" | "month" | "quarter"', default: '"day"', description: "Zoom preset (px per day + tick units)." },
      { name: "pxPerDay / timeZone / locale / workCalendar", type: "number / string / string / WorkCalendar", default: '— / "UTC" / "en-US" / —', description: "Density, zone for ticks, week start, working-day marks on day ticks." },
      { name: "returns", type: "TimeScale", description: "toPx, toTime, durationToPx, pxToDuration, snap(t, unit | minutes), ticks(unit), visibleRange(scrollLeft, width), dateOf, width." },
    ] },
  ],
  notes: [
    "Keyboard: focus a handle, Space or Enter lifts, arrow keys move, Space or Enter drops, Escape cancels. Instructions are attached to every handle via aria-describedby.",
    "Announcements come from the sortable dictionary namespace, e.g. \"Picked up About us. Position 2 of 6.\" (tr: \"Hakkımızda alındı. Konum 2 / 6.\").",
    "Repeated items never blur. The overlay is an opaque popover without backdrop-filter, so it renders the same in glass and solid. Reduced motion turns off the item-shift and drop animations.",
    "Touch: long press (220 ms) lifts, so the list still scrolls. The Move menu is the dependable path on touch screens.",
    "Tree reordering: projectTreeMove, flattenTree and moveTreeNode (core) are ready; the SortableTree component is documented under Sortable list / tree (/docs/components/sortable-list).",
  ],
  covers: [],
};

export default entry;
