"use client";

import * as React from "react";
import { StatusPicker, type StatusDef } from "@vamos-cms/ui";

const statuses: StatusDef[] = [
  { value: "backlog", label: "Backlog", category: "todo" },
  { value: "todo", label: "To do", category: "todo" },
  { value: "in_progress", label: "In progress", category: "active" },
  { value: "in_review", label: "In review", category: "active", tone: "warning" },
  { value: "done", label: "Done", category: "done" },
  { value: "cancelled", label: "Cancelled", category: "cancelled" },
];

const initial = [
  { id: "WEB-311", title: "Hero block: video background option", status: "in_progress" },
  { id: "WEB-314", title: "Cookie banner copy for Turkish locale", status: "in_review" },
  { id: "WEB-318", title: "Blog list: author filter", status: "todo" },
  { id: "WEB-302", title: "Footer social icons in RTL", status: "done" },
];

export default function StatusPickerDemo() {
  const [tasks, setTasks] = React.useState(initial);
  return (
    <ul className="w-full max-w-lg divide-y divide-line rounded-ui border border-line">
      {tasks.map((task) => (
        <li key={task.id} className="flex items-center gap-3 px-4 py-2.5">
          <span className="w-16 shrink-0 font-mono text-xs text-fg-subtle">{task.id}</span>
          <span className="min-w-0 flex-1 truncate text-sm">{task.title}</span>
          <StatusPicker
            size="sm"
            statuses={statuses}
            value={task.status}
            onValueChange={(status) => setTasks((list) => list.map((t) => (t.id === task.id ? { ...t, status } : t)))}
          />
        </li>
      ))}
    </ul>
  );
}
