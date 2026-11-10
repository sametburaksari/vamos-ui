"use client";

import * as React from "react";
import { Briefcase, CalendarDays, LayoutGrid, MapPin, Network, Table2, UserPlus, Users } from "lucide-react";
import { Badge, Button, EmptyState, EntityCard, ListContent, ListLayout, ListViewSwitch, PageHeader, useFormat } from "@vamos-ui/react";
import {
  DataTable,
  DataTableContent,
  DataTableExport,
  DataTableFilterBar,
  DataTableFooter,
  DataTableSearch,
  DataTableToolbar,
  DataTableViewOptions,
  useDataTable,
  type DataTableColumn,
} from "@vamos-ui/react/data-table";
import { departmentOptions, locationOptions, makeEmployees, statusOptions, workModeOptions, type Employee } from "./employees-data";

const employees = makeEmployees();
const deptLabel = Object.fromEntries(departmentOptions.map((d) => [d.value, d.label]));
const modeLabel = Object.fromEntries(workModeOptions.map((d) => [d.value, d.label]));

const columns: DataTableColumn<Employee>[] = [
  { id: "name", header: "Name", accessor: "name", size: 220 },
  { id: "title", header: "Title", accessor: "title", size: 220, mobile: "subtitle" },
  { id: "department", header: "Department", accessor: "department", type: "enum", options: departmentOptions, size: 160, filter: { quick: true, icon: Briefcase } },
  { id: "location", header: "Location", accessor: "location", type: "enum", options: locationOptions, size: 150, filter: { quick: true, icon: MapPin } },
  { id: "workMode", header: "Works", accessor: "workMode", type: "enum", options: workModeOptions, size: 110, priority: 3 },
  {
    id: "manager",
    header: "Manager",
    accessor: (e) => e.manager,
    type: "user",
    size: 190,
    options: [...new Map(employees.flatMap((e) => (e.manager ? [[e.manager.id, e.manager.name] as const] : []))).entries()].map(([value, label]) => ({ value, label })),
    sortValue: (e) => e.manager?.name ?? "",
    filter: { icon: Users },
    priority: 2,
  },
  { id: "startDate", header: "Start date", accessor: "startDate", type: "date", size: 130, filter: { icon: CalendarDays } },
  { id: "status", header: "Status", accessor: "status", type: "enum", options: statusOptions, size: 130, filter: { quick: true } },
  { id: "email", header: "Email", accessor: "email", size: 230, searchable: true, defaultVisible: false },
];

const statusTone = { active: "success", onboarding: "info", leave: "warning" } as const;

/** People on the current page as cards — reads the Data Table's filtered, sorted, paged rows. */
function EmployeeCards() {
  const { pageRows, total } = useDataTable<Employee>();
  const f = useFormat();
  if (total === 0) {
    return (
      <div className="py-10">
        <EmptyState kind="no-results" title="No one matches these filters" description="Try another department or location." />
      </div>
    );
  }
  return (
    <ul aria-label="Employees" className="grid grid-cols-1 gap-(--gap) py-(--gap) @xl/list:grid-cols-2 @4xl/list:grid-cols-3 @7xl/list:grid-cols-4">
      {pageRows.map((e) => (
        <li key={e.id} className="min-w-0">
          <EntityCard
            className="h-full"
            headingAs="h2"
            name={e.name}
            subtitle={e.title}
            href={`#/people/employees/${e.id}`}
            badges={<Badge tone="outline">{deptLabel[e.department]}</Badge>}
            status={e.status === "active" ? undefined : { tone: statusTone[e.status], label: statusOptions.find((s) => s.value === e.status)!.label }}
            fields={[
              { key: "location", label: "Location", value: `${e.location} · ${modeLabel[e.workMode]}` },
              { key: "manager", label: "Manager", value: e.manager?.name ?? "—" },
              { key: "start", label: "Started", value: f.date(e.startDate, { month: "short", year: "numeric" }) },
            ]}
            contact={{ email: e.email, phone: e.phone }}
          />
        </li>
      ))}
    </ul>
  );
}

function DirectoryBody({ view }: { view: string }) {
  return view === "cards" ? <EmployeeCards /> : <DataTableContent />;
}

/** HR directory: one data source, two presentations — cards for browsing, a table for scanning. */
export function EmployeeDirectory() {
  const [view, setView] = React.useState("cards");
  const onLeave = employees.filter((e) => e.status === "leave").length;
  const onboarding = employees.filter((e) => e.status === "onboarding").length;
  return (
    <ListLayout width="wide" stickyToolbar={false}>
      <PageHeader
        eyebrow="Team"
        title="Employees"
        meta={<Badge tone="outline" className="tabular">{employees.length}</Badge>}
        description={`${departmentOptions.length} departments · ${onboarding} onboarding · ${onLeave} on leave this week`}
        actions={
          <>
            <Button asChild>
              <a href="#/people/org">
                <Network /> Org chart
              </a>
            </Button>
            <Button variant="primary">
              <UserPlus /> Add employee
            </Button>
          </>
        }
      />
      <ListContent className="pt-0">
        <DataTable
          caption="Employees"
          columns={columns}
          data={employees}
          getRowId={(e) => e.id}
          rowHref={(e) => `#/people/employees/${e.id}`}
          defaultState={{ sort: [{ id: "name", desc: false }], page: { index: 0, size: 12 } }}
          pageSizes={[12, 24, 48]}
          export={{ filename: "employees" }}
          variant={view === "cards" ? "flush" : "card"}
        >
          <DataTableToolbar>
            <DataTableSearch placeholder="Search people, titles or email…" />
            <DataTableFilterBar />
            <div className="ms-auto flex items-center gap-1.5">
              <ListViewSwitch
                label="Layout"
                value={view}
                onValueChange={setView}
                options={[
                  { value: "cards", label: "Cards", icon: <LayoutGrid /> },
                  { value: "table", label: "Table", icon: <Table2 /> },
                ]}
              />
              {view === "table" ? <DataTableViewOptions /> : null}
              <DataTableExport />
            </div>
          </DataTableToolbar>
          <DirectoryBody view={view} />
          <DataTableFooter />
        </DataTable>
      </ListContent>
    </ListLayout>
  );
}
