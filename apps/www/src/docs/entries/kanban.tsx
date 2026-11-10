import { ex, type DocEntry } from "../types";
import KanbanDemo from "../examples/kanban/demo";
import KanbanContentWorkflow from "../examples/kanban/content-workflow";
import KanbanSwimlanes from "../examples/kanban/swimlanes";
import KanbanRules from "../examples/kanban/rules";
import KanbanWithFilterBar from "../examples/kanban/with-filter-bar";
import KanbanVirtualized from "../examples/kanban/virtualized";
import KanbanStates from "../examples/kanban/states";

const entry: DocEntry = {
  slug: "kanban",
  title: "Kanban",
  group: "Editors & drag-and-drop",
  description:
    "Items in stage columns: deal pipelines, editorial workflows, recruiting, support queues. Drag between columns, or move with the card menu and Alt + arrow keys. Column totals, WIP limits, collapsible columns, swimlanes, quick add, move rules with reasons, optimistic saves with rollback, and virtualized columns for thousands of cards.",
  source: ["sortable/kanban.tsx", "sortable/kanban-core.ts", "sortable/sortable.tsx"],
  basedOn: "Sortable (multi-container) + @tanstack/react-virtual",
  usage: `import { Kanban, KanbanCardTitle, applyKanbanMove, sumBy, type Stage } from "@vamos-ui/react/sortable";

const stages: Stage[] = [
  { key: "lead", label: "Lead", tone: "chart-1", probability: 0.1 },
  { key: "proposal", label: "Proposal", tone: "chart-3", probability: 0.5, wipLimit: 6 },
  { key: "won", label: "Won", tone: "success", category: "done", probability: 1 },
];

<Kanban
  aria-label="Sales pipeline"
  stages={stages}
  items={deals}
  getStageKey={(d) => d.stage}
  summary={(items) => format.currency(sumBy(items, (d) => d.value))}
  renderCard={(d) => <KanbanCardTitle>{d.title}</KanbanCardTitle>}
  onMove={(e) => setDeals((all) => applyKanbanMove(all, e, {
    getId: (d) => d.id,
    getStageKey: (d) => d.stage,
    update: (d, stage) => ({ ...d, stage }),
  }))}
/>`,
  demo: ex("demo", "Deal pipeline", "kanban/demo.tsx", KanbanDemo, "CRM pipeline: each header shows the count, the exact Σ value and the probability-weighted value. Proposal has a WIP limit of 4."),
  examples: [
    ex("content-workflow", "Content workflow", "kanban/content-workflow.tsx", KanbanContentWorkflow, "A CMS editorial board with compact cards and narrow columns. Ideas starts collapsed (a vertical label with the count; it still accepts drops). In review warns above 3 stories. Quick add at the bottom of every column."),
    ex("swimlanes", "Swimlanes", "kanban/swimlanes.tsx", KanbanSwimlanes, "HR recruiting, one lane per recruiter. Each lane × stage cell is its own drop target named \"Interview, Dilan Çelik, 2 items\"; moving between lanes reassigns the candidate."),
    ex("rules", "Move rules and confirmation", "kanban/rules.tsx", KanbanRules, "canMove returns a reason: the target column turns red while dragging, the menu item is disabled with the reason, and a blocked drop is announced. beforeMove opens a Lost reason dialog and cancels the move when it is dismissed."),
    ex("with-filter-bar", "With a filter bar", "kanban/with-filter-bar.tsx", KanbanWithFilterBar, "The toolbar slot holds a Filter bar with search. Pass the filtered items plus filtered so empty columns read \"No items match\"; apply moves to the full list."),
    ex("virtualized", "2,000 cards, virtualized", "kanban/virtualized.tsx", KanbanVirtualized, "Columns above 60 cards render only what is in view. The dragged card stays mounted while it scrolls out of sight; set a board height so columns scroll."),
    ex("states", "Loading, saving and errors", "kanban/states.tsx", KanbanStates, "loading shows three skeleton cards per column. An async onMove keeps the card in its new place, dimmed and aria-busy; a rejection snaps it back and a toast offers Retry."),
  ],
  api: [
    { name: "Kanban", props: [
      { name: "stages", type: "Stage[]", description: "Columns in order. Stage: { key, label, tone?, category?, probability?, wipLimit?, collapsed? }." },
      { name: "items", type: "T[]", description: "Cards. Column order follows the order of items." },
      { name: "getStageKey", type: "(item) => string", description: "Stage key of an item." },
      { name: "renderCard", type: "(item, { isDragging, compact, overlay, saving, stage }) => ReactNode", description: "Card content inside the kit's card frame. Also renders the dragged clone (overlay: true)." },
      { name: "onMove", type: "(e: KanbanMoveEvent) => void | Promise<void>", description: "Once per drop, menu move or shortcut. e: { id, from, to, index, fromIndex, lane?, fromLane? }. A promise keeps the move optimistic; a rejection rolls it back with a Retry toast." },
      { name: "getId", type: "(item) => string", default: "item.id", description: "Stable id." },
      { name: "getLabel", type: "(item) => string", default: "title / name / label", description: "Card name: the article's accessible name, menu names, announcements." },
      { name: "canMove", type: "(e) => true | string", description: "A string blocks the move and is shown as the reason (danger outline while dragging, disabled menu item, announcement)." },
      { name: "beforeMove", type: "(e) => boolean | Promise<boolean>", description: "Last check before onMove, e.g. a dialog. false cancels and the card returns." },
      { name: "summary", type: "(items, stage) => ReactNode", description: "Under the column label (Σ, weighted Σ). Also the column's accessible description." },
      { name: "onQuickAdd", type: "(stageKey, title, lane?) => void | Promise<void>", description: "Adds a quick-add row to every column and a + button to the header. The input stays open for rapid entry; Esc closes." },
      { name: "reorderStages", type: "(next: Stage[]) => void", description: "Enables Move column left / right in the column menu." },
      { name: "lanes / getLaneKey", type: "{ key, label, icon? }[] / (item) => string", description: "Swimlanes. Each lane × stage is its own drop target; lanes collapse." },
      { name: "collapsedStages / defaultCollapsedStages / onCollapsedStagesChange", type: "string[] / string[] / (keys) => void", default: "stages with collapsed: true", description: "Collapsed columns show a vertical label and count and still accept drops." },
      { name: "cardMenu", type: "(item) => ReactNode", description: "Extra DropdownMenuItems at the end of each card's menu (Open, Archive…)." },
      { name: "virtualize", type: "boolean | { estimateSize?, threshold? }", default: "false · { 96, 60 }", description: "Render only visible cards in columns longer than threshold." },
      { name: "height", type: "number | string", default: "— (36rem when virtualizing)", description: "Board height; columns scroll inside it." },
      { name: "cardSize", type: '"compact" | "comfortable"', default: '"comfortable"', description: "Card padding; passed to renderCard as compact." },
      { name: "columnWidth", type: '"sm" | "md" | "lg"', default: '"md"', description: "15.5 / 18.5 / 22 rem." },
      { name: "filtered", type: "boolean", description: "Empty columns say \"No items match\" instead of \"Drop items here\"." },
      { name: "loading", type: "boolean", description: "Three skeleton cards per column, aria-busy on the board." },
      { name: "toolbar", type: "ReactNode", description: "Slot above the board: Filter bar, Saved views, a layout switch." },
      { name: "labels", type: "Partial<KanbanLabels>", description: "Built-in strings. Dictionary namespace: kanban." },
      { name: "sortableLabels", type: "Partial<SortableLabels>", description: "Drag announcements of the underlying Sortable." },
      { name: "aria-label", type: "string", default: '"Board"', description: "Name of the board region." },
    ] },
    { name: "KanbanCardTitle / KanbanCardMeta / KanbanCardFooter", props: [
      { name: "…HTMLAttributes", type: "h4 / div / div", description: "Typographic helpers for card content. Put a link in the title for the card's main action." },
    ] },
    { name: "Core (React-free)", props: [
      { name: "applyKanbanMove(items, e, { getId, getStageKey, getLaneKey?, update })", type: "T[]", description: "Applies a move to a flat array: updates stage (and lane) and places the item at e.index in its new column." },
      { name: "groupByStage(items, stages, getStageKey)", type: "Map<string, T[]>", description: "Items per stage in stage order." },
      { name: "sumBy(items, getValue)", type: "string", description: "Exact decimal-string sum (money is never a float)." },
      { name: "weightedSum(items, stage, getValue)", type: "string", description: "Σ value × stage.probability as a decimal string." },
      { name: "stageToneColor(tone)", type: "string", description: "Token colour for a Stage tone (semantic or chart-1…6)." },
    ] },
  ],
  notes: [
    "Columns are role=\"group\" named \"Proposal, 12 items\" with the summary as description. Cards are focusable articles named by getLabel; inner links and buttons keep their own focus.",
    "Keyboard: on a focused card, Space or Enter lifts it (arrow keys move across columns, Space drops, Esc cancels). Alt + ← / → moves to the adjacent stage (mirrored in RTL), Alt + ↑ / ↓ within the column. The card menu has Move up / down and Move to ▸ every stage. Every move is announced and focus stays on the card.",
    "Cards never blur, even in glass mode. The dragged clone is an opaque popover; blur turns off page-wide while dragging.",
    "Stage is shared with Funnel, Approval flow and Status picker. Money summaries go through useFormat().currency with decimal strings.",
    "A Toaster must be mounted (App shell has one) for the error and blocked-move toasts.",
  ],
  covers: ["Kanban"],
};

export default entry;
