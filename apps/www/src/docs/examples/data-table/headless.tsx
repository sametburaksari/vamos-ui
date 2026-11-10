"use client";

import { Download } from "lucide-react";
import { Badge, Button } from "@vamos-cms/ui";
import { DataTable, DataTableContent, DataTableFooter, useDataTable, type DataTableColumn } from "@vamos-cms/ui/data-table";
import { makeContact, stageOptions, type Contact } from "./_data";

const contacts = Array.from({ length: 60 }, (_, i) => makeContact(i + 900));
const columns: DataTableColumn<Contact>[] = [
  { id: "name", header: "Name", accessor: "name" },
  { id: "company", header: "Company", accessor: "company" },
  { id: "stage", header: "Stage", accessor: "stage", type: "enum", options: stageOptions },
  { id: "value", header: "Deal value", accessor: "value", type: "currency" },
];

// Your own toolbar from useDataTable(): stage pills that write straight into the list state.
function StagePills() {
  const { state, setState, filteredRows, exportCsv } = useDataTable<Contact>();
  const active = state.filters.clauses.find((c) => "field" in c && c.field === "stage");
  const current = active && "value" in active ? (active.value as string[])[0] : null;
  return (
    <div className="flex flex-wrap items-center gap-1.5 px-(--cell-px) py-3">
      {[{ value: null, label: "All" }, ...stageOptions].map((o) => (
        <Button
          key={o.label}
          size="xs"
          variant={current === o.value ? "soft" : "ghost"}
          aria-pressed={current === o.value}
          onClick={() => setState({ filters: { logic: "and", clauses: o.value ? [{ id: "stage", field: "stage", op: "in", value: [o.value] }] : [] } }, "filters")}
        >
          {o.label}
        </Button>
      ))}
      <Badge className="ms-2" tone="outline">
        {filteredRows.length} contacts
      </Badge>
      <Button size="xs" variant="ghost" className="ms-auto" onClick={() => exportCsv({ scope: "all", filename: "pipeline" })}>
        <Download /> CSV
      </Button>
    </div>
  );
}

export default function DataTableHeadless() {
  return (
    <DataTable caption="Pipeline" columns={columns} data={contacts} getRowId={(c) => c.id} defaultState={{ page: { index: 0, size: 8 } }} pageSizes={[8, 25]} className="w-full">
      <StagePills />
      <DataTableContent />
      <DataTableFooter />
    </DataTable>
  );
}
