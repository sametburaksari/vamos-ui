"use client";

import * as React from "react";
import { BarChart, type ChartConfig } from "@vamos-cms/ui/charts";

const categories = [
  { category: "Product news", posts: 18, ids: ["Release 4.2 is out", "Offline mode, explained", "New billing page"] },
  { category: "Guides", posts: 31, ids: ["Import contacts from CSV", "Set up SSO", "Roles and permissions"] },
  { category: "Case studies", posts: 9, ids: ["How Kale Bakery cut no-shows", "Northwind's first 90 days"] },
  { category: "Engineering", posts: 14, ids: ["Our move to Postgres 17", "Profiling glass UIs"] },
];

const config = { posts: { label: "Posts" } } satisfies ChartConfig;

export default function ChartDrillDown() {
  const [selected, setSelected] = React.useState<(typeof categories)[number] | null>(null);
  return (
    <div className="grid w-full gap-4 md:grid-cols-[1fr_16rem]">
      <BarChart
        title="Posts by category"
        data={categories}
        x="category"
        config={config}
        height="md"
        tableToggle
        highlight={selected ? (row) => row.category === selected.category : undefined}
        onPointClick={(row) => setSelected(row)}
      />
      <div className="surface-2 rounded-ui p-4 text-[13px]">
        {selected ? (
          <>
            <p className="font-medium">{selected.category}</p>
            <ul className="mt-2 grid gap-1.5 text-fg-muted">
              {selected.ids.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </>
        ) : (
          <p className="text-fg-muted">Click a bar (or a row in the table view) to list its posts.</p>
        )}
      </div>
    </div>
  );
}
