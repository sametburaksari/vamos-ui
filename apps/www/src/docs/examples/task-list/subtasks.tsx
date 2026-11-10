"use client";

import * as React from "react";
import { TaskList, type TaskData } from "@vamos-ui/react";

function update(items: TaskData[], id: string, fn: (t: TaskData) => TaskData): TaskData[] {
  return items.map((t) => (t.id === id ? fn(t) : { ...t, children: t.children ? update(t.children, id, fn) : undefined }));
}

export default function TaskListSubtasks() {
  const [tasks, setTasks] = React.useState<TaskData[]>([
    {
      id: "w1",
      title: "Day 1 — Welcome",
      done: false,
      due: "2026-11-16",
      assignee: { id: "hr", name: "Zeynep Arıkan" },
      children: [
        { id: "w1a", title: "Laptop and badge handed over", done: true },
        { id: "w1b", title: "Accounts: Google Workspace, Slack, Figma", done: true },
        { id: "w1c", title: "Lunch with the design team", done: false },
      ],
    },
    {
      id: "w2",
      title: "Week 1 — Paperwork",
      done: false,
      due: "2026-11-20",
      priority: "high",
      assignee: { id: "hr", name: "Zeynep Arıkan" },
      children: [
        { id: "w2a", title: "Signed employment contract", done: false },
        { id: "w2b", title: "SGK registration", done: false },
        { id: "w2c", title: "Bank details for payroll", done: true },
      ],
    },
    { id: "w3", title: "30-day check-in with manager", done: false, due: "2026-12-14", assignee: { id: "m", name: "Can Demir" } },
  ]);
  return (
    <div className="w-full max-w-lg">
      <TaskList
        title="Onboarding · Selin Arslan"
        today="2026-11-17"
        items={tasks}
        sortCompleted
        onToggle={(id, done) => setTasks((all) => update(all, id, (t) => ({ ...t, done })))}
        onAdd={(title, parentId) =>
          setTasks((all) =>
            parentId
              ? update(all, parentId, (t) => ({ ...t, children: [...(t.children ?? []), { id: crypto.randomUUID(), title, done: false }] }))
              : [...all, { id: crypto.randomUUID(), title, done: false }],
          )
        }
      />
    </div>
  );
}
