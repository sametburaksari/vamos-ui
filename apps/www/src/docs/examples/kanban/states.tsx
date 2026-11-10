"use client";

import * as React from "react";
import { Switch, Label, Toaster } from "@vamos-cms/ui";
import { Kanban, KanbanCardTitle, applyKanbanMove, type Stage } from "@vamos-cms/ui/sortable";

interface Task {
  id: string;
  title: string;
  status: string;
}

const stages: Stage[] = [
  { key: "todo", label: "To do", tone: "neutral" },
  { key: "doing", label: "In progress", tone: "chart-1", wipLimit: 2 },
  { key: "done", label: "Done", tone: "success", category: "done" },
];

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function KanbanStates() {
  const [loading, setLoading] = React.useState(false);
  const [flaky, setFlaky] = React.useState(true);
  const [tasks, setTasks] = React.useState<Task[]>([
    { id: "k1", title: "Write the Q4 onboarding email", status: "todo" },
    { id: "k2", title: "Audit role permissions", status: "doing" },
    { id: "k3", title: "Fix broken links on /pricing", status: "doing" },
    { id: "k4", title: "Translate the help centre to Turkish", status: "doing" },
  ]);
  return (
    <div className="flex w-full flex-col gap-3">
      <Toaster />
      <div className="flex flex-wrap items-center gap-5 text-sm">
        <span className="flex items-center gap-2">
          <Switch id="kb-loading" checked={loading} onCheckedChange={setLoading} />
          <Label htmlFor="kb-loading">Loading</Label>
        </span>
        <span className="flex items-center gap-2">
          <Switch id="kb-flaky" checked={flaky} onCheckedChange={setFlaky} />
          <Label htmlFor="kb-flaky">Saving fails (card snaps back, toast offers Retry)</Label>
        </span>
      </div>
      <Kanban
        aria-label="Team tasks"
        stages={stages}
        items={tasks}
        loading={loading}
        cardSize="compact"
        getStageKey={(t) => t.status}
        onMove={async (e) => {
          await wait(900);
          if (flaky) throw new Error("Network error");
          setTasks((all) => applyKanbanMove(all, e, { getId: (t) => t.id, getStageKey: (t) => t.status, update: (t, status) => ({ ...t, status }) }));
        }}
        renderCard={(t) => <KanbanCardTitle>{t.title}</KanbanCardTitle>}
      />
    </div>
  );
}
