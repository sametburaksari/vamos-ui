"use client";

import * as React from "react";
import { DataTable, type DataTableColumn } from "@vamos-ui/react/data-table";
import { makeContact, owners, stageOptions, type Contact } from "./_data";

const contacts = Array.from({ length: 5 }, (_, i) => makeContact(i + 300));

const columns: DataTableColumn<Contact>[] = [
  { id: "name", header: "Name", accessor: "name", mobile: "title" },
  { id: "company", header: "Company", accessor: "company", mobile: "subtitle" },
  { id: "stage", header: "Stage", accessor: "stage", type: "enum", options: stageOptions, mobile: "badge" },
  { id: "value", header: "Deal value", accessor: "value", type: "currency" },
  { id: "owner", header: "Owner", accessor: "owner", type: "user", options: owners.map((o) => ({ value: o.id, label: o.name })) },
  { id: "lastContacted", header: "Last contacted", accessor: "lastContacted", type: "date" },
  { id: "email", header: "Email", accessor: "email", mobile: "hidden" },
];

// The layout follows the container, not the viewport: drag the slider below 640px.
export default function DataTableMobileCards() {
  const [width, setWidth] = React.useState(380);
  return (
    <div className="grid w-full gap-3">
      <label className="flex items-center gap-3 text-[13px] text-fg-muted">
        Container width
        <input type="range" min={320} max={960} step={10} value={width} onChange={(e) => setWidth(Number(e.target.value))} className="accent-(--accent-ink)" />
        <span className="font-mono tabular">{width}px</span>
      </label>
      <div style={{ width, maxWidth: "100%" }}>
        <DataTable caption="Pipeline" columns={columns} data={contacts} getRowId={(c) => c.id} selectable rowActions={() => [{ id: "open", label: "Open contact" }, { id: "log", label: "Log a call" }]} pagination="none" />
      </div>
    </div>
  );
}
