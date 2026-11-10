"use client";

import * as React from "react";
import { TaskList, type TaskData } from "@vamos-ui/react";

export default function TaskListChecklist() {
  const [items, setItems] = React.useState<TaskData[]>([
    { id: "c1", title: "Title under 60 characters", done: true },
    { id: "c2", title: "Meta description written", done: true },
    { id: "c3", title: "Featured image set (WebP, under 300 KB)", done: false },
    { id: "c4", title: "Alt text on every image", done: false, description: "3 of 7 images are missing alt text." },
    { id: "c5", title: "Internal links to two related posts", done: false },
    { id: "c6", title: "Slug checked by an editor", done: true, disabled: true, description: "Locked after the post was scheduled." },
  ]);
  return (
    <div className="w-full max-w-sm rounded-ui border border-line bg-surface p-4">
      <TaskList
        variant="checklist"
        title="Before publishing"
        items={items}
        onToggle={(id, done) => setItems((all) => all.map((t) => (t.id === id ? { ...t, done } : t)))}
      />
    </div>
  );
}
