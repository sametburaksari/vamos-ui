"use client";

import * as React from "react";
import { Card, CardBody, CardHeader, TaskList, type TaskData } from "@vamos-cms/ui";

const iso = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const initial: TaskData[] = [
  { id: "t1", title: "Send revised quote with 12-month price lock", done: false, due: iso(0), priority: "high", assignee: { id: "u1", name: "Ayşe Kaya" } },
  { id: "t2", title: "Confirm SSO requirements with IT", done: false, due: iso(-2), priority: "urgent", assignee: { id: "u4", name: "Mehmet Yılmaz" } },
  { id: "t3", title: "Book on-site demo in Rotterdam", done: false, due: iso(3), priority: "medium", assignee: { id: "u2", name: "Daniel Brooks" } },
  { id: "t4", title: "Share security questionnaire", done: true, due: iso(-5), assignee: { id: "u4", name: "Mehmet Yılmaz" } },
  { id: "t5", title: "Draft order form", done: false, due: iso(9), priority: "low" },
];

export default function TaskListDemo() {
  const [tasks, setTasks] = React.useState(initial);
  return (
    <Card className="w-full max-w-lg">
      <CardHeader eyebrow="Deal" title="Northwind renewal 2027" />
      <CardBody>
        <TaskList
          title="Follow-ups"
          items={tasks}
          onToggle={async (id, done) => {
            await new Promise((r) => setTimeout(r, 250));
            setTasks((all) => all.map((t) => (t.id === id ? { ...t, done } : t)));
          }}
          onAdd={(title) => setTasks((all) => [...all, { id: crypto.randomUUID(), title, done: false }])}
          onEdit={(id, patch) => setTasks((all) => all.map((t) => (t.id === id ? { ...t, ...patch } : t)))}
          onRemove={(id) => setTasks((all) => all.filter((t) => t.id !== id))}
        />
      </CardBody>
    </Card>
  );
}
