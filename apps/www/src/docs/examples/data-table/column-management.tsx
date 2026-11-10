"use client";

import { DataTable, type DataTableColumn } from "@vamos-ui/react/data-table";
import { makeContact, owners, stageOptions, type Contact } from "./_data";

const contacts = Array.from({ length: 40 }, (_, i) => makeContact(i));

const columns: DataTableColumn<Contact>[] = [
  { id: "name", header: "Name", accessor: "name", size: 190 },
  { id: "company", header: "Company", accessor: "company", size: 200 },
  { id: "email", header: "Email", accessor: "email", size: 240 },
  { id: "stage", header: "Stage", accessor: "stage", type: "enum", options: stageOptions },
  { id: "value", header: "Deal value", accessor: "value", type: "currency" },
  { id: "owner", header: "Owner", accessor: "owner", type: "user", options: owners.map((o) => ({ value: o.id, label: o.name })) },
  { id: "country", header: "Country", accessor: "country", size: 150 },
  { id: "tags", header: "Tags", accessor: "tags", type: "tags", sortable: false },
  { id: "lastContacted", header: "Last contacted", accessor: "lastContacted", type: "date", defaultVisible: false },
];

// Drag a header edge (or focus it and press ←/→, Shift for bigger steps; double-click autofits).
// Pin from the column menu; hide, reorder and change density in View. Preferences persist per browser.
export default function DataTableColumnManagement() {
  return (
    <DataTable
      caption="Accounts"
      columns={columns}
      data={contacts}
      getRowId={(c) => c.id}
      storageKey="docs-accounts"
      defaultState={{ page: { index: 0, size: 10 }, columns: { visible: { lastContacted: false }, order: [], sizing: { email: 260 }, pinned: { start: ["name"], end: [] } } }}
      pageSizes={[10, 25]}
      mobile="scroll"
      className="w-full"
    />
  );
}
