"use client";

import * as React from "react";
import { TaskList, type TaskData } from "@vamos-ui/react";

export default function TaskListReorder() {
  const [tasks, setTasks] = React.useState<TaskData[]>([
    { id: "r1", title: "Wireframes for the partner portal", done: true, assignee: { id: "u3", name: "Selin Arslan" } },
    { id: "r2", title: "Commission rules spec", done: false, priority: "high", assignee: { id: "u1", name: "Ayşe Kaya" } },
    { id: "r3", title: "Partner onboarding emails", done: false, assignee: { id: "u5", name: "İlker Şahin" } },
    { id: "r4", title: "Payout export (CSV)", done: false, priority: "medium" },
  ]);
  return (
    <div className="grid w-full max-w-lg gap-2">
      <TaskList
        title="Partner portal · Sprint 14"
        showProgress={false}
        items={tasks}
        onToggle={(id, done) => setTasks((all) => all.map((t) => (t.id === id ? { ...t, done } : t)))}
        onReorder={(ids) => setTasks((all) => ids.map((id) => all.find((t) => t.id === id)!))}
      />
      <p className="text-xs text-fg-subtle">Focus a checkbox and press Alt+↑ / Alt+↓ to move a task.</p>
    </div>
  );
}
