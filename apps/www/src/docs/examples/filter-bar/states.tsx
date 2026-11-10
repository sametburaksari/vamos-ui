"use client";

import * as React from "react";
import { FilterBar, type FilterFieldDef, type FilterGroup } from "@vamos-cms/ui/data-table";
import { stageOptions } from "../data-table/_data";

const fields: FilterFieldDef[] = [
  { field: "stage", label: "Stage", type: "enum", options: stageOptions },
  { field: "value", label: "Deal value", type: "currency" },
  { field: "closeDate", label: "Close date", type: "date" },
];
const shared: FilterGroup = {
  logic: "and",
  clauses: [
    { id: "a", field: "stage", op: "notIn", value: ["lost"] },
    { id: "b", field: "value", op: "between", value: ["10000", "50000"] },
    { id: "c", field: "closeDate", op: "relative", value: "this_quarter" },
  ],
};

export default function FilterBarStates() {
  const [filters, setFilters] = React.useState(shared);
  return (
    <div className="grid w-full gap-6">
      <div className="grid gap-2">
        <p className="text-xs font-medium text-fg-subtle">Read-only (a shared link preview)</p>
        <FilterBar fields={fields} value={shared} readOnly />
      </div>
      <div className="grid gap-2">
        <p className="text-xs font-medium text-fg-subtle">Sheet layout (automatic under 480px of width)</p>
        <FilterBar fields={fields} value={filters} onChange={setFilters} layout="sheet" />
      </div>
      <div className="grid gap-2">
        <p className="text-xs font-medium text-fg-subtle">Collapsed chips · small · disabled</p>
        <FilterBar fields={fields} value={filters} onChange={setFilters} maxVisibleChips={1} size="sm" />
        <FilterBar fields={fields} value={filters} disabled size="sm" />
      </div>
    </div>
  );
}
