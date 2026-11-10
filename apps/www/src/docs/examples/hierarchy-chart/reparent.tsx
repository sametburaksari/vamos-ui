"use client";

import * as React from "react";
import { HierarchyChart, HierarchyPersonNode, Toaster, toast } from "@vamos-ui/react";

interface Contact {
  id: string;
  parentId: string | null;
  name: string;
  title: string;
  role: "Decision maker" | "Champion" | "Influencer" | "Blocker";
}

const initial: Contact[] = [
  { id: "c1", parentId: null, name: "Olivia Grant", title: "COO, Harborview Hotels", role: "Decision maker" },
  { id: "c2", parentId: "c1", name: "Rafael Costa", title: "Director of IT", role: "Influencer" },
  { id: "c3", parentId: "c1", name: "Naomi Fischer", title: "Head of Guest Experience", role: "Champion" },
  { id: "c4", parentId: "c2", name: "Ibrahim Kaya", title: "IT Security Lead", role: "Blocker" },
  { id: "c5", parentId: "c3", name: "Lea Novak", title: "Front Office Manager", role: "Influencer" },
  { id: "c6", parentId: "c3", name: "Tomás Ruiz", title: "Digital Marketing Lead", role: "Champion" },
];

export default function HierarchyReparent() {
  const [contacts, setContacts] = React.useState(initial);
  return (
    <div className="w-full">
      <Toaster />
      <HierarchyChart
        aria-label="Decision-maker map, Harborview Hotels"
        nodes={contacts}
        nodeSize="compact"
        height="24rem"
        getLabel={(c) => c.name}
        getDescription={(c) => c.title}
        canReparent={(e) => (e.newParentId === "c4" ? "Blockers don't get reports on this map" : true)}
        onReparent={(e) => {
          const prev = contacts;
          setContacts((all) => all.map((c) => (c.id === e.id ? { ...c, parentId: e.newParentId } : c)));
          const name = prev.find((c) => c.id === e.id)!.name;
          toast(`${name} now reports to ${prev.find((c) => c.id === e.newParentId)!.name}`, {
            action: { label: "Undo", onClick: () => setContacts(prev) },
          });
        }}
        renderNode={(c) => <HierarchyPersonNode name={c.name} title={c.role} />}
      />
      <p className="mt-2 text-xs text-fg-muted">Drag a person onto their new manager, or open a node's menu (Shift+F10) and choose Change parent.</p>
    </div>
  );
}
