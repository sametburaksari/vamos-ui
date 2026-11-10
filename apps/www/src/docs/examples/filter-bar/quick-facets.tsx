"use client";

import * as React from "react";
import { FilterBar, applyFilters, type FilterFieldDef, type FilterGroup } from "@vamos-cms/ui/data-table";
import { departmentOptions, employeeStatusOptions, makeEmployees, managers } from "../data-table/_data";

const employees = makeEmployees(120);

const fields: FilterFieldDef[] = [
  { field: "department", label: "Department", type: "enum", options: departmentOptions, quick: true },
  { field: "status", label: "Status", type: "enum", options: employeeStatusOptions, quick: true },
  { field: "manager", label: "Manager", type: "user", options: managers.map((m) => ({ value: m.id, label: m.name })), quick: true },
  { field: "location", label: "Location", type: "text" },
  { field: "remote", label: "Remote", type: "boolean" },
];

// Counts per option, computed from the rows that match the other filters.
function facetsFor(group: FilterGroup) {
  const out: Record<string, Record<string, number>> = {};
  for (const field of ["department", "status", "manager"] as const) {
    const others = { ...group, clauses: group.clauses.filter((c) => !("field" in c) || c.field !== field) };
    const counts: Record<string, number> = {};
    for (const e of applyFilters(employees, others, fields)) {
      const key = field === "manager" ? e.manager.id : e[field];
      counts[key] = (counts[key] ?? 0) + 1;
    }
    out[field] = counts;
  }
  return out;
}

export default function FilterBarQuickFacets() {
  const [filters, setFilters] = React.useState<FilterGroup>({ logic: "and", clauses: [] });
  const count = applyFilters(employees, filters, fields).length;
  return (
    <div className="grid w-full gap-3">
      <FilterBar fields={fields} value={filters} onChange={setFilters} facets={facetsFor(filters)} resultCount={count} />
      <p className="text-[13px] text-fg-muted">
        <span className="font-medium text-fg tabular">{count}</span> people
      </p>
    </div>
  );
}
