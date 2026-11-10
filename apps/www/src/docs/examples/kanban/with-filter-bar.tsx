"use client";

import * as React from "react";
import { Flag, User } from "lucide-react";
import { Avatar, Badge, useLocale } from "@vamos-cms/ui";
import { FilterBar, applyFilters, emptyFilterGroup, searchRows, type FilterFieldDef, type FilterGroup } from "@vamos-cms/ui/data-table";
import { Kanban, KanbanCardFooter, KanbanCardTitle, applyKanbanMove, type Stage } from "@vamos-cms/ui/sortable";

interface Ticket {
  id: string;
  key: string;
  title: string;
  status: string;
  priority: "urgent" | "high" | "normal" | "low";
  assignee: string;
}

const stages: Stage[] = [
  { key: "new", label: "New", tone: "info" },
  { key: "open", label: "Open", tone: "chart-3", wipLimit: 5 },
  { key: "pending", label: "Waiting on customer", tone: "warning" },
  { key: "solved", label: "Solved", tone: "success", category: "done" },
];

const priorityTone = { urgent: "danger", high: "warning", normal: "neutral", low: "outline" } as const;

const fields: FilterFieldDef[] = [
  { field: "priority", label: "Priority", type: "enum", icon: Flag, quick: true, options: [
    { value: "urgent", label: "Urgent", tone: "danger" },
    { value: "high", label: "High", tone: "warning" },
    { value: "normal", label: "Normal" },
    { value: "low", label: "Low" },
  ] },
  { field: "assignee", label: "Assignee", type: "enum", icon: User, quick: true, options: ["Noor Haddad", "Felix Wagner", "Asli Tan"].map((n) => ({ value: n, label: n })) },
];

const initial: Ticket[] = [
  { id: "t1", key: "SUP-2041", title: "Card reader disconnects after update", status: "new", priority: "urgent", assignee: "Noor Haddad" },
  { id: "t2", key: "SUP-2039", title: "Invoice PDF shows wrong VAT number", status: "new", priority: "high", assignee: "Felix Wagner" },
  { id: "t3", key: "SUP-2033", title: "Can't invite a second admin", status: "open", priority: "normal", assignee: "Asli Tan" },
  { id: "t4", key: "SUP-2030", title: "Export to CSV times out on 50k rows", status: "open", priority: "high", assignee: "Noor Haddad" },
  { id: "t5", key: "SUP-2027", title: "Wrong opening hours on the booking page", status: "pending", priority: "low", assignee: "Felix Wagner" },
  { id: "t6", key: "SUP-2019", title: "Refund stuck in processing", status: "pending", priority: "urgent", assignee: "Asli Tan" },
  { id: "t7", key: "SUP-2012", title: "Dark mode logo is invisible", status: "solved", priority: "normal", assignee: "Noor Haddad" },
];

export default function KanbanWithFilterBar() {
  const { locale } = useLocale();
  const [tickets, setTickets] = React.useState(initial);
  const [filters, setFilters] = React.useState<FilterGroup>(emptyFilterGroup());
  const [q, setQ] = React.useState("");
  const visible = searchRows(applyFilters(tickets, filters, fields), q, (t) => `${t.key} ${t.title}`, locale);
  const isFiltered = visible.length !== tickets.length;
  return (
    <Kanban
      aria-label="Support queue"
      toolbar={<FilterBar className="w-full" fields={fields} value={filters} onChange={setFilters} q={q} onQChange={setQ} searchPlaceholder="Search tickets" resultCount={visible.length} />}
      stages={stages}
      items={visible}
      filtered={isFiltered}
      cardSize="compact"
      getStageKey={(t) => t.status}
      getLabel={(t) => `${t.key} ${t.title}`}
      onMove={(e) =>
        // Apply to the full list, not the filtered one.
        setTickets((all) => applyKanbanMove(all, e, { getId: (t) => t.id, getStageKey: (t) => t.status, update: (t, status) => ({ ...t, status }) }))
      }
      renderCard={(t) => (
        <>
          <KanbanCardTitle>{t.title}</KanbanCardTitle>
          <KanbanCardFooter className="mt-1.5">
            <span className="flex items-center gap-1.5">
              <span className="font-mono text-[11px] text-fg-subtle">{t.key}</span>
              <Badge size="sm" tone={priorityTone[t.priority]} className="capitalize">{t.priority}</Badge>
            </span>
            <Avatar name={t.assignee} size="xs" />
          </KanbanCardFooter>
        </>
      )}
    />
  );
}
