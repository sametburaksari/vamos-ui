"use client";

import * as React from "react";
import { Download, KanbanSquare, Plus, Search, Table2 } from "lucide-react";
import {
  Avatar,
  Badge,
  Button,
  Checkbox,
  Input,
  ListBulkBar,
  ListContent,
  ListFooter,
  ListLayout,
  ListToolbar,
  ListViewSwitch,
  PageHeader,
  PaginationBar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from "@vamos-ui/react";

type Stage = "Lead" | "Qualified" | "Proposal" | "Customer";
const contacts: { id: string; name: string; company: string; stage: Stage; owner: string; value: string }[] = [
  { id: "c1", name: "Laura Callahan", company: "Northwind Traders", stage: "Customer", owner: "Meltem Aydın", value: "$48,500" },
  { id: "c2", name: "Jonas Weber", company: "Kessler Logistik", stage: "Proposal", owner: "Can Demir", value: "$22,000" },
  { id: "c3", name: "Priya Nair", company: "Lotus Health", stage: "Qualified", owner: "Meltem Aydın", value: "$15,750" },
  { id: "c4", name: "Kenji Sato", company: "Hikari Studio", stage: "Lead", owner: "Ece Yılmaz", value: "$6,200" },
  { id: "c5", name: "Amara Okafor", company: "Baobab Energy", stage: "Customer", owner: "Can Demir", value: "$91,300" },
];
const stageTone = { Lead: "neutral", Qualified: "info", Proposal: "warning", Customer: "success" } as const;

// CRM contacts: search, filters, table/board switch, selection with a bulk bar, pagination.
export default function ListLayoutDemo() {
  const [view, setView] = React.useState("table");
  const [selected, setSelected] = React.useState<string[]>([]);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(20);
  const all = selected.length === contacts.length;

  return (
    <div className="h-[600px] w-full overflow-y-auto rounded-ui-lg border border-line bg-scene px-6 pt-6 [--page-px:1.5rem]">
      <ListLayout stickyTop={0}>
        <PageHeader
          title="Contacts"
          meta={<Badge>1,284</Badge>}
          actions={
            <Button variant="primary">
              <Plus /> New contact
            </Button>
          }
          className="mb-2"
        />
        <ListToolbar
          search={<Input leading={<Search />} placeholder="Search name, company or email" aria-label="Search contacts" clearable />}
          filters={
            <>
              <Button size="sm" variant="secondary">Stage: Customer, Proposal</Button>
              <Button size="sm" variant="secondary">Owner: Meltem Aydın</Button>
              <Button size="sm" variant="ghost">Add filter</Button>
            </>
          }
          filterCount={2}
          viewSwitch={
            <ListViewSwitch
              value={view}
              onValueChange={setView}
              options={[
                { value: "table", label: "Table", icon: <Table2 /> },
                { value: "board", label: "Board", icon: <KanbanSquare /> },
              ]}
            />
          }
          actions={
            <Button aria-label="Export">
              <Download />
            </Button>
          }
        />
        <ListBulkBar count={selected.length} total={1284} onSelectAll={() => setSelected(contacts.map((c) => c.id))} onClear={() => setSelected([])}>
          <Button size="sm">Assign owner</Button>
          <Button size="sm">Add tag</Button>
          <Button size="sm" variant="danger-ghost">Delete</Button>
        </ListBulkBar>
        <ListContent state="ready" resultCount={1284}>
          {view === "table" ? (
            <div className="surface overflow-hidden rounded-ui-lg">
              <TableContainer aria-label="Contacts">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">
                        <Checkbox
                          aria-label="Select all on this page"
                          checked={all ? true : selected.length ? "indeterminate" : false}
                          onCheckedChange={(v) => setSelected(v === true ? contacts.map((c) => c.id) : [])}
                        />
                      </TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Stage</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead numeric>Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contacts.map((c) => {
                      const on = selected.includes(c.id);
                      return (
                        <TableRow key={c.id} selected={on}>
                          <TableCell>
                            <Checkbox aria-label={`Select ${c.name}`} checked={on} onCheckedChange={(v) => setSelected((s) => (v === true ? [...s, c.id] : s.filter((x) => x !== c.id)))} />
                          </TableCell>
                          <TableCell rowHeader>
                            <span className="flex items-center gap-2.5">
                              <Avatar name={c.name} size="sm" />
                              <span>
                                <span className="block font-medium text-fg">{c.name}</span>
                                <span className="block text-[12px] text-fg-subtle">{c.company}</span>
                              </span>
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge tone={stageTone[c.stage]}>{c.stage}</Badge>
                          </TableCell>
                          <TableCell>{c.owner}</TableCell>
                          <TableCell numeric>{c.value}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 @3xl/list:grid-cols-4">
              {(["Lead", "Qualified", "Proposal", "Customer"] as const).map((stage) => (
                <section key={stage} aria-label={stage} className="surface-2 rounded-ui-lg p-2.5">
                  <h3 className="flex items-center justify-between px-1 pb-2 text-[13px] font-semibold">
                    {stage}
                    <span className="tabular text-fg-subtle">{contacts.filter((c) => c.stage === stage).length}</span>
                  </h3>
                  <ul className="grid gap-2">
                    {contacts
                      .filter((c) => c.stage === stage)
                      .map((c) => (
                        <li key={c.id} className="surface rounded-ui p-3 text-[13px]">
                          <p className="font-medium">{c.name}</p>
                          <p className="text-fg-subtle">{c.company}</p>
                          <p className="tabular mt-2 font-mono text-[12px]">{c.value}</p>
                        </li>
                      ))}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </ListContent>
        <ListFooter className="sticky bottom-0 bg-scene pb-3">
          <PaginationBar total={1284} page={page} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={setPageSize} className="w-full" />
        </ListFooter>
      </ListLayout>
    </div>
  );
}
