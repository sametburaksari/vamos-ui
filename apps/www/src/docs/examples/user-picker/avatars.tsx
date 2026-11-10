"use client";

import * as React from "react";
import { UserPicker, type PickerUser } from "@vamos-cms/ui";

const people: PickerUser[] = [
  { id: "ay", name: "Ayşe Demir", meta: "Sales", status: "online" },
  { id: "me", name: "Mehmet Kaya", meta: "Support", status: "busy" },
  { id: "pr", name: "Priya Raman", meta: "Design", status: "away" },
  { id: "to", name: "Tom Hollis", meta: "Engineering", status: "online" },
  { id: "le", name: "Léa Martin", meta: "Marketing" },
];

const initial = [
  { id: "T-482", title: "Migrate pricing page to new CMS blocks", due: "Nov 14", assignees: ["pr", "to"] },
  { id: "T-487", title: "Q4 renewal emails for Growth plan", due: "Nov 18", assignees: ["ay", "le", "me", "to"] },
  { id: "T-491", title: "Fix SLA timer on reopened tickets", due: "Nov 21", assignees: [] as string[] },
];

export default function UserPickerAvatars() {
  const [tasks, setTasks] = React.useState(initial);
  return (
    <div className="w-full max-w-xl overflow-hidden rounded-ui border border-line">
      <table className="w-full text-sm">
        <thead className="bg-surface-2 text-start text-xs text-fg-muted">
          <tr>
            <th className="px-4 py-2 text-start font-medium">Task</th>
            <th className="px-4 py-2 text-start font-medium">Due</th>
            <th className="px-4 py-2 text-start font-medium">Assignees</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id} className="border-t border-line">
              <td className="px-4 py-2.5">
                <span className="me-2 font-mono text-xs text-fg-subtle">{task.id}</span>
                {task.title}
              </td>
              <td className="px-4 py-2.5 tabular text-fg-muted">{task.due}</td>
              <td className="px-4 py-1.5">
                <UserPicker
                  multiple
                  trigger="avatars"
                  size="sm"
                  source={people}
                  roleLabel={`Assignees of ${task.id}`}
                  value={task.assignees}
                  onValueChange={(ids) => setTasks((list) => list.map((t) => (t.id === task.id ? { ...t, assignees: ids } : t)))}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
