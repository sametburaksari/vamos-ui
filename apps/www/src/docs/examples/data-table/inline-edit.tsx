"use client";

import * as React from "react";
import { DataTable, type DataTableColumn } from "@vamos-ui/react/data-table";
import { departmentOptions, makeEmployees, type Employee } from "./_data";

const BAND_MAX = 180000;

const columns: DataTableColumn<Employee>[] = [
  { id: "name", header: "Name", accessor: "name", size: 200 },
  { id: "title", header: "Title", accessor: "title", size: 210, edit: { type: "text", validate: (v) => (String(v).trim() ? null : "A title is required.") } },
  { id: "department", header: "Department", accessor: "department", type: "enum", options: departmentOptions, edit: { type: "select" } },
  {
    id: "salary",
    header: "Salary",
    accessor: "salary",
    type: "currency",
    edit: { type: "currency", validate: (v) => (Number(v) > BAND_MAX ? `Above the top band (${BAND_MAX.toLocaleString("en-US")}).` : null) },
  },
  { id: "startDate", header: "Start date", accessor: "startDate", type: "date", edit: { type: "date" } },
  { id: "remote", header: "Remote", accessor: "remote", type: "boolean", size: 100, edit: { type: "boolean" } },
];

export default function DataTableInlineEdit() {
  const [rows, setRows] = React.useState(() => makeEmployees(8));

  // Simulated PATCH /employees/:id. Kerem's record is locked by payroll, so saving fails and rolls back.
  const save = async ({ rowId, columnId, value }: { rowId: string; columnId: string; value: unknown }) => {
    await new Promise((r) => setTimeout(r, 600));
    if (rowId === rows[3]?.id) throw new Error("Payroll is closing November — this record is locked until Dec 1.");
    setRows((list) => list.map((e) => (e.id === rowId ? { ...e, [columnId]: value } : e)));
  };

  return (
    <div className="grid w-full gap-2">
      <DataTable caption="Compensation" columns={columns} data={rows} getRowId={(e) => e.id} onCellEdit={save} pagination="none" className="w-full" />
      <p className="text-xs text-fg-subtle">Click a value to edit. Enter saves, Escape cancels. The fourth row is locked and rolls back.</p>
    </div>
  );
}
