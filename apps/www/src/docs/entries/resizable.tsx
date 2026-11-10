import { ex, type DocEntry } from "../types";
import ResizableDemo from "../examples/resizable/demo";
import ResizableSplitView from "../examples/resizable/split-view";
import ResizableNested from "../examples/resizable/nested";
import ResizableCollapsible from "../examples/resizable/collapsible";

const entry: DocEntry = {
  slug: "resizable",
  title: "Resizable",
  group: "Page layouts",
  description:
    "User-sized panes for split views: inbox + message, media grid + details, editor + preview. Keyboard resizing, pixel or percent limits, collapsible panes, nested groups and a remembered layout.",
  source: ["components/resizable.tsx", "styles/navigation.css"],
  basedOn: "react-resizable-panels v4",
  usage: `import { ResizableGroup, ResizablePanel, ResizableHandle } from "@vamos-ui/react";

<ResizableGroup autoSaveId="inbox" className="h-[560px]">
  <ResizablePanel id="list" defaultSize="35%" minSize="25%">…</ResizablePanel>
  <ResizableHandle withGrip />
  <ResizablePanel id="detail">…</ResizablePanel>
</ResizableGroup>`,
  demo: ex("demo", "Demo", "resizable/demo.tsx", ResizableDemo),
  examples: [
    ex("split-view", "Split view with saved layout (CRM inbox)", "resizable/split-view.tsx", ResizableSplitView, "autoSaveId stores the layout in localStorage (safe when storage is blocked). Panels need stable ids. Pixel limits keep the list readable on any width."),
    ex("nested", "Nested groups (CMS editor)", "resizable/nested.tsx", ResizableNested, "A vertical group inside a horizontal one. Double-click a handle to reset its panes."),
    ex("collapsible", "Collapsible pane (HR directory)", "resizable/collapsible.tsx", ResizableCollapsible, "collapsible + collapsedSize; drive it with useResizablePanelRef() → collapse() / expand()."),
  ],
  api: [
    { name: "ResizableGroup", props: [
      { name: "orientation", type: '"horizontal" | "vertical"', default: '"horizontal"', description: "Panes side by side or stacked. direction is an alias." },
      { name: "autoSaveId", type: "string", description: "Persist the layout under this key." },
      { name: "storage", type: "{ getItem; setItem }", default: "safe localStorage", description: "Storage for autoSaveId (e.g. a cookie adapter so the server renders the saved layout)." },
      { name: "defaultLayout", type: "Record<panelId, number>", description: "Initial layout in percentages." },
      { name: "onLayoutChanged", type: "(layout, meta) => void", description: "After a resize ends (pointer released / key pressed)." },
      { name: "onLayoutChange", type: "(layout) => void", description: "On every pointer move while resizing." },
      { name: "groupRef", type: "Ref<ResizableGroupHandle>", description: "getLayout() / setLayout(). See useResizableGroupRef()." },
      { name: "disabled", type: "boolean", default: "false", description: "Turn resizing off." },
    ] },
    { name: "ResizablePanel", props: [
      { name: "id", type: "string", description: "Stable id (required for saved layouts)." },
      { name: "defaultSize", type: "number | string", description: "Number = px; \"35\" or \"35%\" = percent; also rem, em, vh, vw." },
      { name: "minSize · maxSize", type: "number | string", default: '"0%" · "100%"', description: "Limits, same units as defaultSize." },
      { name: "collapsible", type: "boolean", default: "false", description: "Collapses when dragged below minSize." },
      { name: "collapsedSize", type: "number | string", default: '"0%"', description: "Size when collapsed." },
      { name: "onResize", type: "(size: { asPercentage; inPixels }) => void", description: "Called when the size changes." },
      { name: "panelRef", type: "Ref<ResizablePanelHandle>", description: "collapse(), expand(), resize(), getSize(), isCollapsed(). See useResizablePanelRef()." },
    ] },
    { name: "ResizableHandle", props: [
      { name: "withGrip", type: "boolean", default: "false", description: "A visible grip in the middle of the line." },
      { name: "aria-label", type: "string", description: "Name of the splitter, e.g. \"Resize thread list\"." },
      { name: "disabled", type: "boolean", default: "false", description: "This handle can't be dragged." },
      { name: "disableDoubleClick", type: "boolean", default: "false", description: "Turn off double-click to reset." },
    ] },
  ],
  notes: [
    "Keyboard (WAI-ARIA Window Splitter): focus the handle, then ← → (or ↑ ↓), Home / End; Enter collapses a collapsible pane.",
    "Glass mode: surfaces inside the group stop blurring while a handle is dragged, to avoid flicker.",
    "On phones, show one pane and open the other in a Sheet — this is not automatic.",
  ],
  covers: ["Resizable"],
};

export default entry;
