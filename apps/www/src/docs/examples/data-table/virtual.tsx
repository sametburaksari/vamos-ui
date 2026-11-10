"use client";

import { DataTable, type DataTableColumn } from "@vamos-cms/ui/data-table";
import { actionOptions, makeEvents, type AuditEvent } from "./_data";

const events = makeEvents(10000);

const columns: DataTableColumn<AuditEvent>[] = [
  { id: "at", header: "Time", accessor: "at", type: "datetime", size: 200 },
  { id: "actor", header: "Actor", accessor: "actor", type: "user", sortValue: (e) => e.actor.name },
  { id: "action", header: "Action", accessor: "action", type: "enum", options: actionOptions, size: 130 },
  { id: "target", header: "Target", accessor: "target", size: 280, mobile: "title" },
  { id: "ip", header: "IP address", accessor: "ip", size: 140, cell: ({ value }) => <span className="font-mono text-xs text-fg-muted">{String(value)}</span> },
];

// 10,000 rows in client mode: only the visible ones are in the DOM (native <table> semantics kept).
export default function DataTableVirtual() {
  return (
    <DataTable
      caption="Audit log"
      columns={columns}
      data={events}
      getRowId={(e) => e.id}
      pagination="none"
      virtual={{ height: "26rem", estimateRowHeight: 52 }}
      export={{ filename: "audit-log" }}
      className="w-full"
    />
  );
}
