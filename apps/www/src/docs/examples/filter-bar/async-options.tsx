"use client";

import * as React from "react";
import { Avatar } from "@vamos-ui/react";
import { FilterBar, type FilterFieldDef, type FilterGroup, type FilterOption } from "@vamos-ui/react/data-table";

const directory = [
  "Ada Park", "Selin Kaya", "Marcus Webb", "Leila Haddad", "Tom Brennan", "Ines Laurent", "Omar Haddad", "Grace Whitfield",
  "Kerem Yıldız", "Priya Raman", "Lucas Moreau", "Hana Kimura", "Zeynep Çelik", "Jonas Berg", "Freya Andersen", "Ravi Iyer",
].map((name, i) => ({ id: `u_${i}`, name }));

// Stand-in for GET /users?search=… — options can be a function that resolves per keystroke.
async function searchUsers(q: string): Promise<FilterOption[]> {
  await new Promise((r) => setTimeout(r, 300));
  const needle = q.trim().toLocaleLowerCase("en");
  return directory
    .filter((u) => !needle || u.name.toLocaleLowerCase("en").includes(needle))
    .slice(0, 8)
    .map((u) => ({ value: u.id, label: u.name, icon: <Avatar name={u.name} size="xs" /> }));
}

const fields: FilterFieldDef[] = [
  { field: "assignee", label: "Assignee", type: "user", options: searchUsers, quick: true },
  { field: "reviewer", label: "Reviewer", type: "user", options: searchUsers },
  { field: "title", label: "Title", type: "text" },
];

export default function FilterBarAsyncOptions() {
  const [filters, setFilters] = React.useState<FilterGroup>({ logic: "and", clauses: [] });
  return <FilterBar fields={fields} value={filters} onChange={setFilters} me={{ id: "u_0", name: "Ada Park" }} className="w-full" />;
}
