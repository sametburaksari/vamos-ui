"use client";

import * as React from "react";
import { Briefcase, Hourglass, Users } from "lucide-react";
import {
  DataTable,
  DataTableContent,
  DataTableFilterBar,
  DataTableFooter,
  DataTableSavedViews,
  DataTableSearch,
  DataTableToolbar,
  DataTableViewOptions,
  createListState,
  toViewState,
  type DataTableColumn,
  type SavedView,
} from "@vamos-ui/react/data-table";
import { departmentOptions, employeeStatusOptions, makeEmployees, managers, type Employee } from "./_data";

const employees = makeEmployees(48);

const columns: DataTableColumn<Employee>[] = [
  { id: "name", header: "Name", accessor: "name", size: 200 },
  { id: "title", header: "Title", accessor: "title", size: 200, mobile: "subtitle" },
  { id: "department", header: "Department", accessor: "department", type: "enum", options: departmentOptions, filter: { quick: true, icon: Briefcase } },
  { id: "status", header: "Status", accessor: "status", type: "enum", options: employeeStatusOptions, filter: { quick: true } },
  { id: "manager", header: "Manager", accessor: "manager", type: "user", options: managers.map((m) => ({ value: m.id, label: m.name })), sortValue: (e) => e.manager.name, filter: { icon: Users } },
  { id: "startDate", header: "Start date", accessor: "startDate", type: "date", filter: { icon: Hourglass } },
  { id: "remote", header: "Remote", accessor: "remote", type: "boolean", size: 100 },
];

const base = toViewState(createListState());
const initialViews: SavedView[] = [
  { id: "probation", name: "Probation ending", scope: "team", system: true, state: { ...base, filters: { logic: "and", clauses: [{ id: "p", field: "status", op: "in", value: ["probation"] }] }, sort: [{ id: "startDate", desc: false }] } },
  { id: "eng", name: "Engineering", scope: "team", state: { ...base, filters: { logic: "and", clauses: [{ id: "d", field: "department", op: "in", value: ["engineering"] }] } } },
  { id: "remote", name: "Remote people", scope: "personal", state: { ...base, filters: { logic: "and", clauses: [{ id: "r", field: "remote", op: "eq", value: true }] } } },
];

export default function DataTableWithFiltersAndViews() {
  const [views, setViews] = React.useState(initialViews);
  return (
    <DataTable caption="Employees" columns={columns} data={employees} getRowId={(e) => e.id} defaultState={{ page: { index: 0, size: 10 } }} pageSizes={[10, 25]} className="w-full">
      <DataTableToolbar className="flex-col items-stretch gap-3">
        <DataTableSavedViews
          views={views}
          onSave={({ name, scope, state }) => {
            const view: SavedView = { id: `v_${Date.now().toString(36)}`, name, scope, state: state ?? base };
            setViews((v) => [...v, view]);
            return view;
          }}
          onUpdate={(id, state) => setViews((v) => v.map((x) => (x.id === id ? { ...x, state } : x)))}
          onRename={(id, name) => setViews((v) => v.map((x) => (x.id === id ? { ...x, name } : x)))}
          onDelete={(id) => setViews((v) => v.filter((x) => x.id !== id))}
          permissions={{ canCreateTeam: true }}
        />
        <div className="flex flex-wrap items-start gap-2">
          <DataTableSearch placeholder="Search people…" />
          <DataTableFilterBar />
          <DataTableViewOptions className="ms-auto" />
        </div>
      </DataTableToolbar>
      <DataTableContent />
      <DataTableFooter />
    </DataTable>
  );
}
