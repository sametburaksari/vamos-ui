"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { Button, Checkbox, Input, ListBulkBar, ListContent, ListLayout, ListToolbar } from "@vamos-cms/ui";

const employees = [
  { id: "e1", name: "Selin Öztürk", role: "Product designer", team: "Design" },
  { id: "e2", name: "Marcus Lindqvist", role: "Backend engineer", team: "Platform" },
  { id: "e3", name: "Aylin Çelik", role: "People partner", team: "People" },
  { id: "e4", name: "Tomás Ribeiro", role: "Account executive", team: "Sales" },
];

// HR employees: the bulk bar takes the toolbar's place; "Select all 312" widens the selection
// across pages; Esc or "Clear selection" returns focus to the toolbar.
export default function ListLayoutBulk() {
  const [selected, setSelected] = React.useState<string[]>(["e1", "e3"]);
  const [allPages, setAllPages] = React.useState(false);
  const clear = () => {
    setSelected([]);
    setAllPages(false);
  };
  return (
    <ListLayout stickyToolbar={false} className="w-full max-w-3xl">
      <ListToolbar search={<Input leading={<Search />} placeholder="Search people" aria-label="Search people" />} />
      <ListBulkBar count={allPages ? 312 : selected.length} total={312} allSelected={allPages} onSelectAll={() => setAllPages(true)} onClear={clear}>
        <Button size="sm">Change team</Button>
        <Button size="sm">Export</Button>
      </ListBulkBar>
      <ListContent>
        <ul className="divide-y divide-line rounded-ui-lg border border-line">
          {employees.map((e) => (
            <li key={e.id} className="flex items-center gap-3 px-4 py-3 text-sm">
              <Checkbox
                aria-label={`Select ${e.name}`}
                checked={allPages || selected.includes(e.id)}
                onCheckedChange={(v) => {
                  setAllPages(false);
                  setSelected((s) => (v === true ? [...s, e.id] : s.filter((x) => x !== e.id)));
                }}
              />
              <span className="flex-1 font-medium">{e.name}</span>
              <span className="text-fg-muted">{e.role}</span>
              <span className="w-20 text-end text-[13px] text-fg-subtle">{e.team}</span>
            </li>
          ))}
        </ul>
      </ListContent>
    </ListLayout>
  );
}
