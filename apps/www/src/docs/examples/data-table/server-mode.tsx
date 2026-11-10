"use client";

import * as React from "react";
import { DataTable, applyFilters, filterFieldsFromColumns, searchRows, type DataTableColumn, type ListState } from "@vamos-cms/ui/data-table";
import { makeContact, owners, stageOptions, type Contact } from "./_data";

const TOTAL = 12480;
const all = Array.from({ length: TOTAL }, (_, i) => makeContact(i));

const columns: DataTableColumn<Contact>[] = [
  { id: "name", header: "Name", accessor: "name", size: 200 },
  { id: "company", header: "Company", accessor: "company", size: 200, mobile: "subtitle" },
  { id: "stage", header: "Stage", accessor: "stage", type: "enum", options: stageOptions, size: 130 },
  { id: "value", header: "Deal value", accessor: "value", type: "currency", size: 140 },
  { id: "owner", header: "Owner", accessor: "owner", type: "user", options: owners.map((o) => ({ value: o.id, label: o.name })), sortValue: (c) => c.owner.name },
  { id: "lastContacted", header: "Last contacted", accessor: "lastContacted", type: "date" },
];
const fields = filterFieldsFromColumns(columns);

// Stand-in for your API: GET /contacts?q=…&f=…&sort=…&page=…
async function fetchContacts(s: ListState): Promise<{ rows: Contact[]; total: number }> {
  await new Promise((r) => setTimeout(r, 350));
  let rows = applyFilters(searchRows(all, s.q, (c) => `${c.name} ${c.company} ${c.email}`), s.filters, fields);
  const sort = s.sort[0];
  if (sort) {
    const key = sort.id as keyof Contact;
    rows = [...rows].sort((a, b) => {
      const x = key === "value" ? Number(a.value) : key === "owner" ? a.owner.name : String(a[key]);
      const y = key === "value" ? Number(b.value) : key === "owner" ? b.owner.name : String(b[key]);
      return (x < y ? -1 : x > y ? 1 : 0) * (sort.desc ? -1 : 1);
    });
  }
  const page = "index" in s.page ? s.page : { index: 0, size: s.page.size };
  return { rows: rows.slice(page.index * page.size, (page.index + 1) * page.size), total: rows.length };
}

export default function DataTableServerMode() {
  const [result, setResult] = React.useState<{ rows: Contact[]; total: number }>({ rows: [], total: 0 });
  const [loading, setLoading] = React.useState(true);
  const latest = React.useRef(0);

  // One entry point: every change arrives with an increasing requestId — apply only the latest.
  const load = React.useCallback(async (state: ListState, _reason: string, requestId: number) => {
    latest.current = requestId;
    setLoading(true);
    const next = await fetchContacts(state);
    if (latest.current !== requestId) return;
    setResult(next);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    void load({ q: "", filters: { logic: "and", clauses: [] }, sort: [{ id: "lastContacted", desc: true }], page: { index: 0, size: 25 }, columns: { visible: {}, order: [], sizing: {}, pinned: { start: [], end: [] } } }, "reset", 0);
  }, [load]);

  return (
    <DataTable
      caption="Contacts"
      mode="server"
      columns={columns}
      data={result.rows}
      rowCount={result.total}
      loading={loading}
      getRowId={(c) => c.id}
      defaultState={{ sort: [{ id: "lastContacted", desc: true }] }}
      onStateChange={load}
      urlState={{ prefix: "contacts_" }}
      selectable
      bulkActions={[{ id: "assign", label: "Assign owner", run: async () => new Promise((r) => setTimeout(r, 500)) }]}
      className="w-full"
    />
  );
}
