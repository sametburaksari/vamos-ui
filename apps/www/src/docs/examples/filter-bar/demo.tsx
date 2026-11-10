"use client";

import * as React from "react";
import { Building2, CalendarClock, CircleDollarSign, Flag, Tags, UserRound } from "lucide-react";
import { FilterBar, applyFilters, type FilterFieldDef, type FilterGroup } from "@vamos-ui/react/data-table";
import { makeContact, owners, stageOptions } from "../data-table/_data";

const deals = Array.from({ length: 400 }, (_, i) => makeContact(i));

const fields: FilterFieldDef[] = [
  { field: "stage", label: "Stage", type: "enum", icon: Flag, options: stageOptions, group: "Deal" },
  { field: "value", label: "Deal value", type: "currency", icon: CircleDollarSign, group: "Deal" },
  { field: "lastContacted", label: "Last contacted", type: "date", icon: CalendarClock, group: "Deal" },
  { field: "owner", label: "Owner", type: "user", icon: UserRound, options: owners.map((o) => ({ value: o.id, label: o.name })), group: "Deal" },
  { field: "company", label: "Company", type: "text", icon: Building2, group: "Company" },
  { field: "country", label: "Country", type: "enum", options: ["United States", "United Kingdom", "Germany", "Türkiye", "France"].map((c) => ({ value: c, label: c })), group: "Company" },
  { field: "tags", label: "Tags", type: "tags", icon: Tags, options: ["Enterprise", "Inbound", "Partner", "Renewal", "Event", "Referral", "Trial"].map((t) => ({ value: t, label: t })), group: "Company" },
];

export default function FilterBarDemo() {
  const [filters, setFilters] = React.useState<FilterGroup>({
    logic: "and",
    clauses: [
      { id: "stage", field: "stage", op: "in", value: ["proposal", "won"] },
      { id: "value", field: "value", op: "gte", value: "5000" },
    ],
  });
  const matches = applyFilters(deals, filters, fields, { me: "u_ada" });

  return (
    <div className="grid w-full gap-4">
      <FilterBar fields={fields} value={filters} onChange={setFilters} resultCount={matches.length} me={{ id: "u_ada", name: "Ada Park" }} />
      <p className="text-[13px] text-fg-muted">
        <span className="font-medium text-fg tabular">{matches.length}</span> of {deals.length} deals match.
      </p>
    </div>
  );
}
