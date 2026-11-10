"use client";

import * as React from "react";
import { Badge } from "@vamos-ui/react";
import {
  FilterBar,
  applyFilters,
  createHistoryAdapter,
  decodeFilters,
  encodeFilters,
  type FilterFieldDef,
  type FilterGroup,
} from "@vamos-ui/react/data-table";
import { makeContact, owners, stageOptions } from "../data-table/_data";

const deals = Array.from({ length: 60 }, (_, i) => makeContact(i + 2000));
const fields: FilterFieldDef[] = [
  { field: "owner", label: "Owner", type: "user", options: owners.map((o) => ({ value: o.id, label: o.name })), quick: true },
  { field: "value", label: "Deal value", type: "currency" },
  { field: "country", label: "Country", type: "text" },
];
const KEY = "board_f";
const adapter = createHistoryAdapter();

// Not a table: the same Filter bar above a board, synced to ?board_f=… on its own.
export default function FilterBarBoard() {
  const [filters, setFilters] = React.useState<FilterGroup>({ logic: "and", clauses: [] });
  React.useEffect(() => {
    const raw = new URLSearchParams(adapter.read()).get(KEY);
    if (raw) setFilters(decodeFilters(raw, fields));
  }, []);
  const change = (g: FilterGroup) => {
    setFilters(g);
    const params = new URLSearchParams(adapter.read());
    const f = encodeFilters(g);
    if (f) params.set(KEY, f);
    else params.delete(KEY);
    adapter.write(params.toString(), "replace");
  };
  const visible = applyFilters(deals, filters, fields);
  return (
    <div className="grid w-full gap-4">
      <FilterBar fields={fields} value={filters} onChange={change} resultCount={visible.length} />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stageOptions.slice(0, 4).map((s) => {
          const cards = visible.filter((d) => d.stage === s.value);
          return (
            <section key={s.value} aria-label={s.label} className="surface-2 grid content-start gap-2 rounded-ui p-2">
              <h4 className="flex items-center justify-between px-1 text-xs font-medium text-fg-muted">
                {s.label} <span className="tabular">{cards.length}</span>
              </h4>
              {cards.slice(0, 4).map((d) => (
                <article key={d.id} className="surface grid gap-1 rounded-ui-sm p-2.5 text-[13px]">
                  <span className="truncate font-medium">{d.company}</span>
                  <span className="flex items-center justify-between text-xs text-fg-muted">
                    {d.owner.name}
                    <Badge tone="outline">${Number(d.value).toLocaleString("en-US")}</Badge>
                  </span>
                </article>
              ))}
            </section>
          );
        })}
      </div>
    </div>
  );
}
