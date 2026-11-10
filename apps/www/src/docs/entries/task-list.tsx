import { ex, type DocEntry } from "../types";
import TaskListDemo from "../examples/task-list/demo";
import TaskListChecklist from "../examples/task-list/checklist";
import TaskListSubtasks from "../examples/task-list/subtasks";
import TaskListReorder from "../examples/task-list/reorder";

const entry: DocEntry = {
  slug: "task-list",
  title: "Task list",
  group: "Data display",
  description:
    "Checkable tasks with assignee, due date, priority and subtasks: deal follow-ups, onboarding, an editorial checklist, project to-dos. Optimistic toggles that revert on failure, inline add and edit, overdue and due-today tones, and a progress header that is announced politely.",
  source: ["components/task-list.tsx"],
  basedOn: "Checkbox + native lists",
  usage: `import { TaskList } from "@vamos-cms/ui";

<TaskList
  title="Follow-ups"
  items={tasks}
  onToggle={(id, done) => api.toggle(id, done)}
  onAdd={(title, parentId) => api.add({ title, parentId })}
/>`,
  demo: ex("demo", "Deal follow-ups (CRM)", "task-list/demo.tsx", TaskListDemo, "Due dates read relatively (\"Today\", \"In 3 days\"); overdue is danger, due today is warning."),
  examples: [
    ex("checklist", "Pre-publish checklist (CMS)", "task-list/checklist.tsx", TaskListChecklist, "variant=\"checklist\": titles only, with optional hints; disabled items are system-checked."),
    ex("subtasks", "Onboarding with subtasks (HR)", "task-list/subtasks.tsx", TaskListSubtasks, "children nest; parents show \"2/3\" and collapse. sortCompleted moves done items down."),
    ex("reorder", "Keyboard reorder (PRM)", "task-list/reorder.tsx", TaskListReorder, "onReorder enables Alt+↑ / Alt+↓ and receives the new sibling order."),
  ],
  api: [
    { name: "TaskList", props: [
      { name: "items", type: "TaskData[]", description: "Tasks, with optional children." },
      { name: "onToggle", type: "(id, done) => void | Promise<void>", description: "Optimistic; a rejection reverts the checkbox and shows a toast." },
      { name: "onAdd", type: "(title, parentId?) => void | Promise<void>", description: "Add input (Enter creates and keeps focus) and \"Add subtask\"." },
      { name: "onEdit", type: "(id, patch) => void | Promise<void>", description: "Inline title edit (pencil or double-click; Enter saves, Esc cancels)." },
      { name: "onRemove", type: "(id) => void | Promise<void>", description: "Delete button per task." },
      { name: "onReorder", type: "(ids, parentId?) => void | Promise<void>", description: "Alt+↑ / Alt+↓ on a task." },
      { name: "title", type: "ReactNode", description: "Heading; labels the group." },
      { name: "variant", type: '"list" | "checklist"', default: '"list"', description: "Rich meta or titles only." },
      { name: "showProgress", type: "boolean", default: "true", description: "\"3 of 7 done\" and a bar." },
      { name: "hideCompleted / defaultHideCompleted / onHideCompletedChange", type: "boolean / boolean / (hide) => void", description: "Header toggle, controlled or not." },
      { name: "sortCompleted", type: "boolean", default: "false", description: "Done tasks below open ones." },
      { name: "today", type: "string | Date", description: "Reference day for due states (default: live clock in the provider time zone)." },
      { name: "readOnly", type: "boolean", default: "false", description: "No edits." },
      { name: "labels", type: "Partial<TaskListLabels>", description: "progress, hideCompleted, add, due, overdue, priority levels, empty, allDone, …" },
    ] },
    { name: "TaskData", props: [
      { name: "id / title / done", type: "string / string / boolean", description: "Basics." },
      { name: "description", type: "string", description: "Second line." },
      { name: "assignee", type: "{ id; name; avatar? }", description: "Avatar + first name; full name for screen readers." },
      { name: "due", type: "YYYY-MM-DD", description: "Due date." },
      { name: "priority", type: '"low" | "medium" | "high" | "urgent"', description: "Flag; low is not shown." },
      { name: "children", type: "TaskData[]", description: "Subtasks." },
      { name: "disabled", type: "boolean", description: "Can't be toggled or edited." },
    ] },
  ],
  notes: ["Drag reorder: wrap the list in the Sortable group when you need pointer dragging; onReorder already provides the keyboard alternative."],
  covers: ["Task / checklist"],
};

export default entry;
