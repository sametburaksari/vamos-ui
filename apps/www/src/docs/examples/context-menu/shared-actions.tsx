"use client";

import * as React from "react";
import { CheckCircle2, Copy, Pencil, Trash2, UserPlus } from "lucide-react";
import { ActionMenu, Badge, ContextMenu, type MenuEntry } from "@vamos-ui/react";

const tasks = [
  { id: "T-318", title: "Collect signed offer letter from new barista", owner: "Mira Castell", due: "Nov 12" },
  { id: "T-319", title: "Book onboarding session for the Kadıköy team", owner: "Daniel Okafor", due: "Nov 14" },
  { id: "T-320", title: "Order uniforms (sizes S–XL)", owner: "Unassigned", due: "Nov 20" },
];

export default function ContextMenuSharedActions() {
  const [done, setDone] = React.useState<string[]>([]);

  // One menu model drives both the right-click menu and the keyboard/touch "⋯" button.
  const actions = (id: string): MenuEntry[] => [
    { id: "done", label: done.includes(id) ? "Mark as open" : "Mark as done", icon: <CheckCircle2 />, shortcut: "d", onSelect: () => setDone((d) => (d.includes(id) ? d.filter((x) => x !== id) : [...d, id])) },
    { id: "assign", label: "Assign to me", icon: <UserPlus />, shortcut: "i" },
    { id: "edit", label: "Edit", icon: <Pencil />, shortcut: "e" },
    { id: "copy", label: "Copy link", icon: <Copy /> },
    { type: "separator" },
    { id: "delete", label: "Delete task", icon: <Trash2 />, tone: "danger" },
  ];

  return (
    <ul className="w-full max-w-xl divide-y divide-line overflow-hidden rounded-ui-lg surface">
      {tasks.map((t) => (
        <ContextMenu key={t.id} items={actions(t.id)}>
          <li className="flex items-center gap-3 px-4 py-2.5 data-[state=open]:bg-hover">
            <span className="w-12 font-mono text-xs text-fg-subtle">{t.id}</span>
            <span className={done.includes(t.id) ? "min-w-0 flex-1 truncate text-sm text-fg-subtle line-through" : "min-w-0 flex-1 truncate text-sm text-fg"}>{t.title}</span>
            <span className="hidden text-xs text-fg-muted sm:inline">{t.owner}</span>
            <Badge tone={done.includes(t.id) ? "success" : "neutral"}>{done.includes(t.id) ? "Done" : t.due}</Badge>
            <ActionMenu items={actions(t.id)} triggerLabel={`Actions for ${t.id}`} triggerSize="xs" size="sm" />
          </li>
        </ContextMenu>
      ))}
    </ul>
  );
}
