"use client";

import * as React from "react";
import { Kanban, KanbanCardMeta, KanbanCardTitle, applyKanbanMove, type Stage } from "@vamos-cms/ui/sortable";

interface Order {
  id: string;
  ref: string;
  customer: string;
  items: number;
  status: string;
}

const stages: Stage[] = [
  { key: "received", label: "Received", tone: "info" },
  { key: "picking", label: "Picking", tone: "chart-2" },
  { key: "packed", label: "Packed", tone: "chart-3" },
  { key: "shipped", label: "Shipped", tone: "success", category: "done" },
];

const first = ["Amara", "Bastian", "Chiara", "Deniz", "Emeka", "Freya", "Goran", "Hiroshi", "Isla", "Jonas", "Kerem", "Leila"];
const last = ["Okafor", "Lindqvist", "Romano", "Aydın", "Mensah", "Larsen", "Petrović", "Tanaka", "Murray", "Weber", "Şahin", "Haddad"];

// 2,000 orders, most of them waiting in "Received".
const initial: Order[] = Array.from({ length: 2000 }, (_, i) => ({
  id: `o${i}`,
  ref: `#${(48210 + i).toString()}`,
  customer: `${first[i % first.length]} ${last[(i * 7) % last.length]}`,
  items: 1 + ((i * 13) % 6),
  status: i < 1500 ? "received" : i < 1800 ? "picking" : i < 1950 ? "packed" : "shipped",
}));

export default function KanbanVirtualized() {
  const [orders, setOrders] = React.useState(initial);
  return (
    <Kanban
      aria-label="Fulfilment board"
      stages={stages}
      items={orders}
      height="30rem"
      virtualize={{ estimateSize: 74 }}
      cardSize="compact"
      columnWidth="sm"
      getStageKey={(o) => o.status}
      getLabel={(o) => `Order ${o.ref}`}
      onMove={(e) => setOrders((all) => applyKanbanMove(all, e, { getId: (o) => o.id, getStageKey: (o) => o.status, update: (o, status) => ({ ...o, status }) }))}
      renderCard={(o) => (
        <>
          <KanbanCardTitle className="tabular">Order {o.ref}</KanbanCardTitle>
          <KanbanCardMeta>
            <span className="truncate">{o.customer}</span>
            <span className="tabular ms-auto">
              {o.items} {o.items === 1 ? "item" : "items"}
            </span>
          </KanbanCardMeta>
        </>
      )}
    />
  );
}
