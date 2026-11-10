"use client";

import * as React from "react";
import { DataTable, DataTableContent, DataTableFilterBar, DataTableFooter, DataTableSavedViews, DataTableToolbar, createListState, toViewState, type DataTableColumn, type SavedView } from "@vamos-cms/ui/data-table";
import { makeContact, stageOptions, type Contact } from "../data-table/_data";

const partners = Array.from({ length: 80 }, (_, i) => makeContact(i + 5000));
const columns: DataTableColumn<Contact>[] = [
  { id: "company", header: "Partner", accessor: "company" },
  { id: "country", header: "Region", accessor: "country", type: "enum", options: [...new Set(partners.map((p) => p.country))].map((c) => ({ value: c, label: c })) },
  { id: "stage", header: "Status", accessor: "stage", type: "enum", options: stageOptions },
  { id: "value", header: "ARR", accessor: "value", type: "currency" },
];
const base = toViewState(createListState());
const seed: SavedView[] = [
  { id: "risk", name: "Partners at risk", scope: "team", state: { ...base, filters: { logic: "and", clauses: [{ id: "r", field: "stage", op: "in", value: ["lost", "lead"] }] }, sort: [{ id: "value", desc: true }] } },
  { id: "top", name: "Top ARR", scope: "personal", state: { ...base, sort: [{ id: "value", desc: true }], columns: { ...base.columns, visible: { country: false } } } },
];

// Full binding: switching applies filters, sort and columns; any change marks the view modified.
export default function SavedViewsWithDataTable() {
  const [views, setViews] = React.useState(seed);
  return (
    <DataTable caption="Partners" columns={columns} data={partners} getRowId={(p) => p.id} defaultState={{ page: { index: 0, size: 8 } }} pageSizes={[8, 25]} className="w-full">
      <DataTableToolbar className="flex-col items-stretch gap-3">
        <DataTableSavedViews
          views={views}
          onSave={({ name, scope, state }) => {
            const v: SavedView = { id: `v_${Date.now().toString(36)}`, name, scope, state: state ?? base };
            setViews((list) => [...list, v]);
            return v;
          }}
          onUpdate={(id, state) => setViews((list) => list.map((v) => (v.id === id ? { ...v, state } : v)))}
          onDelete={(id) => setViews((list) => list.filter((v) => v.id !== id))}
        />
        <DataTableFilterBar />
      </DataTableToolbar>
      <DataTableContent />
      <DataTableFooter />
    </DataTable>
  );
}
