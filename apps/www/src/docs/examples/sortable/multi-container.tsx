"use client";

import * as React from "react";
import { Columns3 } from "lucide-react";
import { Sortable, SortableContainer, SortableHandle, SortableItem, SortableMoveMenu, SortableOverlay, type SortableMoveBetweenEvent } from "@vamos-ui/react/sortable";

interface Column {
  id: string;
  label: string;
  hint: string;
}

const columns: Column[] = [
  { id: "name", label: "Full name", hint: "Text" },
  { id: "email", label: "Work email", hint: "Email" },
  { id: "department", label: "Department", hint: "Select" },
  { id: "manager", label: "Manager", hint: "Relation" },
  { id: "start", label: "Start date", hint: "Date" },
  { id: "salary", label: "Gross salary", hint: "Money" },
  { id: "iban", label: "IBAN", hint: "Bank" },
];

const byId = new Map(columns.map((c) => [c.id, c]));

function applyMove(lists: { id: string; label: string; items: string[] }[], e: SortableMoveBetweenEvent) {
  const without = lists.map((l) => ({ ...l, items: l.items.filter((x) => x !== e.id) }));
  return without.map((l) => (l.id === e.to ? { ...l, items: [...l.items.slice(0, e.index), e.id, ...l.items.slice(e.index)] } : l));
}

export default function SortableMultiContainer() {
  const [lists, setLists] = React.useState([
    { id: "included", label: "Included in export", items: ["name", "email", "department", "start"] },
    { id: "available", label: "Available columns", items: ["manager", "salary", "iban"] },
  ]);
  return (
    <Sortable items={columns} getLabel={(c) => c.label} containers={lists} onMoveBetween={(e) => setLists((l) => applyMove(l, e))}>
      <div className="grid w-full gap-3 sm:grid-cols-2">
        {lists.map((list) => (
          <section key={list.id} aria-labelledby={`${list.id}-title`} className="min-w-0">
            <h3 id={`${list.id}-title`} className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-fg-muted">
              {list.id === "included" && <Columns3 className="size-3.5" />}
              {list.label}
              <span className="tabular ms-auto text-fg-subtle">{list.items.length}</span>
            </h3>
            <SortableContainer id={list.id} as="ul" className="flex min-h-32 flex-col gap-1 rounded-ui-lg bg-surface-2 p-1.5">
              {(ids, { isEmpty }) =>
                isEmpty ? (
                  <li className="grid flex-1 place-items-center text-xs text-fg-subtle">Drop columns here</li>
                ) : (
                  ids.map((id) => (
                    <SortableItem key={id} id={id} as="li" className="flex min-h-9 items-center gap-1.5 rounded-ui border border-line bg-surface ps-1 pe-1 text-sm">
                      <SortableHandle size="sm" />
                      <span className="min-w-0 flex-1 truncate">{byId.get(id)!.label}</span>
                      <span className="text-[11px] text-fg-subtle">{byId.get(id)!.hint}</span>
                      <SortableMoveMenu size="xs" />
                    </SortableItem>
                  ))
                )
              }
            </SortableContainer>
          </section>
        ))}
      </div>
      <SortableOverlay>
        {(id) => (
          <div className="vui-sortable-clone flex min-h-9 w-64 items-center gap-2 rounded-ui border border-line px-2.5 text-sm">
            {byId.get(id)!.label}
          </div>
        )}
      </SortableOverlay>
    </Sortable>
  );
}
