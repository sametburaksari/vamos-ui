"use client";

import * as React from "react";
import { Button, toast, Toaster } from "@vamos-cms/ui";

const initial = ["Elif Demir", "Can Yıldız", "Ayşe Kaya", "Mert Aksoy"];

export default function ToastActionUndo() {
  const [contacts, setContacts] = React.useState(initial);

  const trash = (name: string) => {
    const index = contacts.indexOf(name);
    setContacts((list) => list.filter((n) => n !== name));
    toast(`${name} moved to trash`, {
      action: {
        label: "Undo",
        onClick: () => setContacts((list) => [...list.slice(0, index), name, ...list.slice(index)]),
      },
    });
  };

  return (
    <div className="w-full max-w-sm">
      <Toaster />
      <ul className="divide-y divide-line rounded-ui border border-line bg-surface text-sm">
        {contacts.map((name) => (
          <li key={name} className="flex items-center justify-between px-4 py-2.5">
            {name}
            <Button size="xs" variant="danger-ghost" onClick={() => trash(name)}>
              Trash
            </Button>
          </li>
        ))}
        {contacts.length === 0 ? <li className="px-4 py-6 text-center text-fg-muted">All contacts are in the trash.</li> : null}
      </ul>
      <Button size="sm" variant="ghost" className="mt-2" onClick={() => setContacts(initial)}>
        Reset list
      </Button>
    </div>
  );
}
