"use client";

import { KanbanSquare, Plus, Search, Table2 } from "lucide-react";
import { Button, Input, ListContent, ListLayout, ListToolbar, ListViewSwitch, PageHeader, Select } from "@vamos-ui/react";

const partners = [
  { name: "Atlas Distribution", tier: "Gold", region: "EMEA" },
  { name: "Brightline Resellers", tier: "Silver", region: "North America" },
  { name: "Kumo Partners", tier: "Gold", region: "APAC" },
];

// PRM partners at phone width: filters fold into a "Filters (3)" sheet, the view switch shows icons only.
export default function ListLayoutMobile() {
  return (
    <div className="w-[380px] max-w-full overflow-hidden rounded-[28px] border border-line bg-scene px-4 pt-5 [--page-px:1rem]">
      <ListLayout stickyToolbar={false}>
        <PageHeader title="Partners" size="sm" actions={<Button variant="primary" size="sm"><Plus /> Add</Button>} />
        <ListToolbar
          search={<Input leading={<Search />} placeholder="Search partners" aria-label="Search partners" />}
          filters={
            <>
              <Select aria-label="Tier" items={[{ value: "gold", label: "Gold" }, { value: "silver", label: "Silver" }]} defaultValue="gold" />
              <Select aria-label="Region" items={[{ value: "emea", label: "EMEA" }, { value: "apac", label: "APAC" }]} defaultValue="emea" />
              <Select aria-label="Status" items={[{ value: "active", label: "Active" }, { value: "paused", label: "Paused" }]} defaultValue="active" />
            </>
          }
          filterCount={3}
          viewSwitch={
            <ListViewSwitch
              defaultValue="table"
              options={[
                { value: "table", label: "Table", icon: <Table2 /> },
                { value: "board", label: "Board", icon: <KanbanSquare /> },
              ]}
            />
          }
        />
        <ListContent>
          <ul className="grid gap-2">
            {partners.map((p) => (
              <li key={p.name} className="surface rounded-ui p-3 text-sm">
                <p className="font-medium">{p.name}</p>
                <p className="text-[13px] text-fg-subtle">
                  {p.tier} · {p.region}
                </p>
              </li>
            ))}
          </ul>
        </ListContent>
      </ListLayout>
    </div>
  );
}
