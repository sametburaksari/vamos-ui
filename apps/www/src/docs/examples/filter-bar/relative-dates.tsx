"use client";

import * as React from "react";
import { useFormat } from "@vamos-cms/ui";
import { FilterBar, resolveRelativeDate, type FilterFieldDef, type FilterGroup, type RelativeDate } from "@vamos-cms/ui/data-table";

const fields: FilterFieldDef[] = [
  { field: "startDate", label: "Start date", type: "date", quick: true },
  { field: "probationEnds", label: "Probation ends", type: "date" },
  { field: "lastReview", label: "Last review", type: "datetime" },
];

// "In the last 90 days" stays current: relative values are resolved when the query runs.
export default function FilterBarRelativeDates() {
  const f = useFormat();
  const [filters, setFilters] = React.useState<FilterGroup>({ logic: "and", clauses: [{ id: "s", field: "startDate", op: "relative", value: "last_90_days" }] });
  const clause = filters.clauses.find((c) => "op" in c && c.op === "relative");
  const range = clause && "value" in clause ? resolveRelativeDate(clause.value as RelativeDate, { now: new Date("2026-11-10T12:00:00Z") }) : null;
  return (
    <div className="grid w-full gap-3">
      <FilterBar fields={fields} value={filters} onChange={setFilters} />
      <p className="text-[13px] text-fg-muted">{range ? <>Resolves to <span className="font-medium text-fg">{f.dateRange(range.start, range.end)}</span> (today: Nov 10, 2026).</> : "Pick a relative range to see what it resolves to."}</p>
    </div>
  );
}
