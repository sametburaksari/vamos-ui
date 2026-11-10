import { ex, type DocEntry } from "../types";
import HierarchyChartDemo from "../examples/hierarchy-chart/demo";
import HierarchyPartnerNetwork from "../examples/hierarchy-chart/partner-network";
import HierarchyReparent from "../examples/hierarchy-chart/reparent";
import HierarchyListView from "../examples/hierarchy-chart/list-view";
import HierarchyLarge from "../examples/hierarchy-chart/large";
import HierarchyExport from "../examples/hierarchy-chart/export";

const entry: DocEntry = {
  slug: "hierarchy-chart",
  title: "Hierarchy chart",
  group: "Editors & drag-and-drop",
  description:
    "A pannable, zoomable tidy-tree diagram of any hierarchy: org charts, partner networks, decision-maker maps, site structure, branch trees. Collapsible subtrees, search highlight, focus-to-node, drag-to-reparent with a Change parent dialog as the non-drag path, viewport culling for thousands of nodes, SVG and PNG export, and a list view over the same data.",
  source: ["components/hierarchy-chart.tsx", "components/tree-view.tsx"],
  basedOn: "d3-hierarchy (tidy tree layout) + own pan / zoom",
  usage: `import { HierarchyChart, HierarchyPersonNode } from "@vamos-cms/ui";

// Flat rows: { id, parentId } — parentId null for the root.
<HierarchyChart
  aria-label="Organization"
  nodes={people}
  getLabel={(p) => p.name}
  getDescription={(p) => p.title}
  renderNode={(p) => <HierarchyPersonNode name={p.name} title={p.title} src={p.photo} />}
  onReparent={(e) => movePerson(e.id, e.newParentId)}
/>`,
  demo: ex("demo", "Organization chart", "hierarchy-chart/demo.tsx", HierarchyChartDemo, "Person nodes with Avatar, a vacant role (dashed), controlled selection. Drag the canvas or use the wheel to pan, Ctrl / ⌘ + wheel to zoom, the badge under a node to collapse its team."),
  examples: [
    ex("partner-network", "Partner network", "hierarchy-chart/partner-network.tsx", HierarchyPartnerNetwork, "PRM: distributor → reseller → sub-reseller, left to right, with tier badges and yearly volume. In RTL the root sits on the right."),
    ex("reparent", "Drag to reparent", "hierarchy-chart/reparent.tsx", HierarchyReparent, "A CRM decision-maker map. Drag a contact onto another to change who they report to; cycles and canReparent reasons turn the target red. The node menu's Change parent… opens a searchable picker. An Undo toast restores the previous map."),
    ex("list-view", "Search and list view", "hierarchy-chart/list-view.tsx", HierarchyListView, "A restaurant site structure. highlight marks matching nodes (locale-folded) and opens their ancestors; view=\"list\" renders the same data with Tree view."),
    ex("large", "2,000 nodes", "hierarchy-chart/large.tsx", HierarchyLarge, "Large trees render only the nodes near the viewport. Here defaultCollapsed={{ depth: 1 }} starts at the directors (without it, trees beyond 500 nodes start collapsed below two levels). focusNode() opens the ancestors and pans to a person."),
    ex("export", "Export SVG / PNG", "hierarchy-chart/export.tsx", HierarchyExport, "Branch structure of a multi-branch business. toSVG() returns a standalone SVG with the theme's colours resolved; toPNG(scale) renders it to a Blob."),
  ],
  api: [
    { name: "HierarchyChart", props: [
      { name: "nodes", type: "T[] (T extends { id, parentId })", description: "Flat rows. Several roots are allowed; unknown parents become roots." },
      { name: "renderNode", type: "(node, { depth, childCount, descendantCount, collapsed, selected, matched, orientation }) => ReactNode", default: "HierarchyNodeCard", description: "Content inside the kit's node frame (selection ring, match tint, menu, collapse badge are added for you)." },
      { name: "getLabel / getDescription", type: "(node) => string", default: "name / label / title", description: "Text for type-ahead, search, export, the parent picker and the list view." },
      { name: "isPlaceholder", type: "(node) => boolean", description: "Vacant / placeholder nodes get a dashed frame." },
      { name: "orientation / defaultOrientation / onOrientationChange", type: '"vertical" | "horizontal"', default: '"vertical"', description: "Top-to-bottom or start-to-end. The controls toggle it." },
      { name: "nodeSize", type: '{ width, height } | "compact" | "card"', default: '"card"', description: "Node box in px: compact 184 × 56, card 236 × 84." },
      { name: "gap", type: "{ x, y }", default: "{ x: 28, y: 56 }", description: "Space between siblings and between levels." },
      { name: "collapsed / defaultCollapsed / onCollapsedChange", type: "string[] / string[] | { depth } / (ids) => void", default: "{ depth: 2 } beyond 500 nodes", description: "Collapsed nodes hide their subtree and show +N on the badge." },
      { name: "selected / defaultSelected / onSelectedChange", type: "string | null", description: "Click, Enter or Space selects. The path to the root is drawn in accent." },
      { name: "focusId", type: "string | null", description: "Pans and zooms to this node when it changes (opens ancestors)." },
      { name: "highlight", type: "string", description: "Search text. Matching nodes get the accent tint; their ancestors open." },
      { name: "onReparent", type: "(e: { id, newParentId, oldParentId }) => void | Promise<void>", description: "Enables drag-to-reparent and Change parent…. A promise keeps the move optimistic; a rejection rolls back with Retry." },
      { name: "canReparent", type: "(e) => true | string", description: "A string blocks the move with that reason. Cycles are always blocked." },
      { name: "nodeMenu", type: "(node) => ReactNode", description: "Extra DropdownMenuItems in each node's action menu." },
      { name: "view", type: '"chart" | "list"', default: '"chart"', description: "list renders the same data as a Tree view." },
      { name: "controls", type: "boolean", default: "true", description: "Floating zoom, fit, orientation, expand all / collapse all." },
      { name: "height", type: "number | string", default: '"32rem"', description: "Canvas height." },
      { name: "loading / empty", type: "boolean / ReactNode", description: "Skeleton tree, or the empty message." },
      { name: "labels", type: "Partial<HierarchyChartLabels>", description: "Built-in strings. Dictionary namespace: hierarchyChart." },
      { name: "ref", type: "HierarchyChartHandle", description: "fit(), zoomIn(), zoomOut(), focusNode(id), expandAll(), collapseAll(), toSVG(): string, toPNG(scale?): Promise<Blob>." },
    ] },
    { name: "HierarchyPersonNode", props: [
      { name: "name / title / src", type: "string / string / string | null", description: "Avatar (initials fallback), name and job title." },
      { name: "meta / badge", type: "ReactNode", description: "Bottom line (team size, location) and a badge after the name." },
      { name: "vacant", type: "boolean", description: "Open position: dashed avatar, muted name. Pair with isPlaceholder." },
    ] },
    { name: "HierarchyNodeCard", props: [
      { name: "title / subtitle / meta", type: "ReactNode", description: "Three lines of text." },
      { name: "icon / badge", type: "ReactNode", description: "Leading visual and trailing badge (tier, status)." },
    ] },
    { name: "layoutHierarchy(nodes, options)", props: [
      { name: "returns", type: "{ nodes: { id, x, y, depth, parentId, … }[], width, height }", description: "The pure tidy-tree layout, for server-side rendering or custom drawings." },
    ] },
  ],
  notes: [
    "Accessibility follows the Tree view pattern on the nodes: role=\"tree\" with levels, positions and expanded state. ↑ / ↓ go through nodes in reading order, → opens or enters, ← closes or goes to the parent, Home / End, * opens siblings, Enter or Space selects, type-ahead by first letter. The focused node is panned into view.",
    "The canvas itself is focusable: arrow keys pan (Shift for bigger steps), + / − zoom, 0 fits. Shift+F10 on a node opens its menu (expand, center, Change parent…).",
    "Nodes never blur; the controls are the one floating surface. Blur turns off while dragging. Reduced motion turns off animated pan and zoom.",
    "Canvas coordinates are physical; in RTL the layout itself is mirrored so the root and the first sibling sit on the inline-start side.",
  ],
  covers: ["Hierarchy chart"],
};

export default entry;
