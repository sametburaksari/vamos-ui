"use client";

import * as React from "react";
import { Building2, CalendarClock, Mail, Megaphone, PenLine, Phone, Plus, Tag, Trash2, Upload, UserCheck, UserRound } from "lucide-react";
import { Avatar, Badge, Button, ListContent, ListLayout, PageHeader, toast, useFormat } from "@vamos-ui/react";
import {
  DataTable,
  DataTableContent,
  DataTableExport,
  DataTableFilterBar,
  DataTableFooter,
  DataTableSavedViews,
  DataTableSearch,
  DataTableToolbar,
  DataTableViewOptions,
  ME,
  createListState,
  toViewState,
  useDataTable,
  type DataTableBulkAction,
  type DataTableColumn,
  type SavedView,
} from "@vamos-ui/react/data-table";
import { lifecycleOptions, makeContacts, me, owners, sourceOptions, tagOptions, type Contact } from "./contacts-data";

/** Example data is dated around this day; pass your own `now` or omit it in your app. */
const NOW = new Date("2026-11-10T12:00:00Z");

const tagTone: Record<string, "warning" | "accent" | "info" | "outline"> = { Hot: "warning", "Decision maker": "accent", "Renewal due": "info" };

function LastActivity({ value }: { value: string }) {
  const f = useFormat();
  return (
    <time dateTime={value} title={f.date(value, "long")} className="text-fg-muted">
      {f.relative(value, { now: NOW })}
    </time>
  );
}

const columns: DataTableColumn<Contact>[] = [
  {
    id: "name",
    header: "Name",
    accessor: "name",
    size: 270,
    minSize: 220,
    cell: ({ row }) => (
      <span className="flex min-w-0 items-center gap-2.5">
        <Avatar name={row.name} size="sm" />
        <span className="grid min-w-0 leading-tight">
          <span className="truncate font-medium text-fg">{row.name}</span>
          <span className="truncate text-[12px] text-fg-subtle">{row.email}</span>
        </span>
      </span>
    ),
  },
  {
    id: "company",
    header: "Company",
    accessor: "company",
    size: 230,
    mobile: "subtitle",
    filter: { icon: Building2 },
    cell: ({ row }) => (
      <span className="flex min-w-0 items-center gap-2">
        <Avatar name={row.company} shape="square" size="xs" neutral />
        <span className="grid min-w-0 leading-tight">
          <span className="truncate text-fg">{row.company}</span>
          <span className="truncate text-[12px] text-fg-subtle">{row.jobTitle}</span>
        </span>
      </span>
    ),
  },
  { id: "lifecycle", header: "Lifecycle", accessor: "lifecycle", type: "enum", options: lifecycleOptions, size: 140, filter: { quick: true }, mobile: "badge" },
  {
    id: "owner",
    header: "Owner",
    accessor: "owner",
    type: "user",
    size: 170,
    options: owners.map((o) => ({ value: o.id, label: o.name })),
    sortValue: (c) => c.owner.name,
    filter: { quick: true, icon: UserRound },
  },
  {
    id: "tags",
    header: "Tags",
    accessor: "tags",
    type: "tags",
    options: tagOptions,
    size: 210,
    sortable: false,
    filter: { icon: Tag },
    priority: 3,
    cell: ({ row }) =>
      row.tags.length ? (
        <span className="flex min-w-0 flex-wrap items-center gap-1">
          {row.tags.slice(0, 2).map((t) => (
            <Badge key={t} tone={tagTone[t] ?? "outline"}>
              {t}
            </Badge>
          ))}
          {row.tags.length > 2 ? <span className="tabular text-xs text-fg-subtle">+{row.tags.length - 2}</span> : null}
        </span>
      ) : (
        <span className="text-fg-subtle">—</span>
      ),
  },
  { id: "openDeals", header: "Open deals", accessor: "openDeals", type: "currency", currency: "USD", size: 130, priority: 2 },
  { id: "lastActivity", header: "Last activity", accessor: "lastActivity", type: "date", size: 140, filter: { icon: CalendarClock }, cell: ({ row }) => <LastActivity value={row.lastActivity} /> },
  { id: "source", header: "Source", accessor: "source", type: "enum", options: sourceOptions, size: 140, filter: { icon: Megaphone }, defaultVisible: false },
  { id: "email", header: "Email", accessor: "email", size: 240, searchable: true, defaultVisible: false },
  { id: "city", header: "City", accessor: "city", size: 140, defaultVisible: false },
  { id: "phone", header: "Phone", accessor: "phone", size: 160, sortable: false, filter: false, defaultVisible: false },
];

const base = toViewState(createListState({ sort: [{ id: "lastActivity", desc: true }] }));
const where = (clauses: SavedView["state"]["filters"]["clauses"]) => ({ ...base, filters: { logic: "and" as const, clauses } });

const initialViews: SavedView[] = [
  { id: "mine", name: "My contacts", scope: "personal", state: where([{ id: "o", field: "owner", op: "in", value: [ME] }]) },
  { id: "hot", name: "Hot leads", scope: "team", state: where([{ id: "t", field: "tags", op: "in", value: ["Hot"] }, { id: "l", field: "lifecycle", op: "in", value: ["lead", "qualified", "opportunity"] }]) },
  { id: "customers", name: "Customers", scope: "team", system: true, state: { ...where([{ id: "l", field: "lifecycle", op: "in", value: ["customer"] }]), sort: [{ id: "openDeals", desc: true }] } },
  { id: "renewal", name: "Renewal due", scope: "team", state: where([{ id: "t", field: "tags", op: "in", value: ["Renewal due"] }]) },
];

/** Lifecycle counts across all contacts — shown next to each option in the Filter bar. */
function FilterBarWithFacets() {
  const { props } = useDataTable<Contact>();
  const facets = React.useMemo(() => {
    const lifecycle: Record<string, number> = {};
    const owner: Record<string, number> = {};
    for (const c of props.data) {
      lifecycle[c.lifecycle] = (lifecycle[c.lifecycle] ?? 0) + 1;
      owner[c.owner.id] = (owner[c.owner.id] ?? 0) + 1;
    }
    return { lifecycle, owner };
  }, [props.data]);
  return <DataTableFilterBar facets={facets} />;
}

/** CRM contacts: avatars, company logos, lifecycle, owner, tags, saved views and bulk owner/tag changes. */
export function ContactsList() {
  const [contacts, setContacts] = React.useState(makeContacts);
  const [views, setViews] = React.useState(initialViews);

  const update = (rows: Contact[], patch: (c: Contact) => Contact) => {
    const before = contacts;
    const ids = new Set(rows.map((r) => r.id));
    setContacts((all) => all.map((c) => (ids.has(c.id) ? patch(c) : c)));
    return { undo: () => setContacts(before) };
  };

  const bulkActions: DataTableBulkAction<Contact>[] = [
    { id: "assign", label: "Assign to me", icon: <UserCheck />, run: (_s, rows) => update(rows, (c) => ({ ...c, owner: me })) },
    {
      id: "tag",
      label: "Add to Q4 campaign",
      icon: <Tag />,
      run: (_s, rows) => update(rows, (c) => (c.tags.includes("Q4 campaign") ? c : { ...c, tags: [...c.tags, "Q4 campaign"] })),
    },
    {
      id: "email",
      label: "Send email",
      icon: <Mail />,
      disabled: (_s, rows) => (rows.length > 25 ? "Bulk email is limited to 25 contacts — use a campaign instead" : false),
      run: (_s, rows) => {
        toast.success(`Draft opened for ${rows.length} ${rows.length === 1 ? "contact" : "contacts"}`);
      },
    },
    {
      id: "delete",
      label: "Delete",
      icon: <Trash2 />,
      tone: "danger",
      confirm: { title: "Delete contacts?", description: (n) => `${n} ${n === 1 ? "contact" : "contacts"} and their activity history will be deleted. Deals stay with the company.`, confirmLabel: "Delete" },
      run: (_s, rows) => {
        const before = contacts;
        const ids = new Set(rows.map((r) => r.id));
        setContacts((all) => all.filter((c) => !ids.has(c.id)));
        return { undo: () => setContacts(before) };
      },
    },
  ];

  const customers = contacts.filter((c) => c.lifecycle === "customer").length;
  const mine = contacts.filter((c) => c.owner.id === me.id).length;

  return (
    <ListLayout width="wide" stickyToolbar={false}>
      <PageHeader
        eyebrow="Customers"
        title="Contacts"
        meta={<Badge tone="outline" className="tabular">{contacts.length}</Badge>}
        description={`${customers} customers · ${mine} owned by you`}
        actions={
          <>
            <Button>
              <Upload /> Import CSV
            </Button>
            <Button variant="primary">
              <Plus /> New contact
            </Button>
          </>
        }
      />
      <ListContent className="pt-0">
        <DataTable
          caption="Contacts"
          columns={columns}
          data={contacts}
          getRowId={(c) => c.id}
          selectable
          bulkActions={bulkActions}
          me={me}
          rowHref={(c) => `#/crm/contacts/${c.id}`}
          rowActions={(c) => [
            { id: "open", label: "Open contact", icon: <UserRound />, href: `#/crm/contacts/${c.id}` },
            { id: "email", label: "Email", icon: <Mail />, href: `mailto:${c.email}` },
            { id: "call", label: "Call", icon: <Phone />, href: `tel:${c.phone.replace(/[^\d+]/g, "")}` },
            { id: "log", label: "Log activity", icon: <PenLine />, onSelect: () => toast(`Logging an activity for ${c.name}`) },
            { type: "separator" },
            { id: "delete", label: "Delete", icon: <Trash2 />, tone: "danger", onSelect: () => setContacts((all) => all.filter((x) => x.id !== c.id)) },
          ]}
          defaultState={{ sort: [{ id: "lastActivity", desc: true }], page: { index: 0, size: 25 } }}
          pageSizes={[10, 25, 50]}
          export={{ filename: "contacts" }}
        >
          <DataTableToolbar className="flex-col items-stretch gap-3">
            <DataTableSavedViews
              views={views}
              onSave={({ name, scope, state }) => {
                const view: SavedView = { id: `v-${Date.now().toString(36)}`, name, scope, state: state ?? base };
                setViews((v) => [...v, view]);
                return view;
              }}
              onUpdate={(id, state) => setViews((v) => v.map((x) => (x.id === id ? { ...x, state } : x)))}
              onRename={(id, name) => setViews((v) => v.map((x) => (x.id === id ? { ...x, name } : x)))}
              onDelete={(id) => setViews((v) => v.filter((x) => x.id !== id))}
              permissions={{ canCreateTeam: true }}
            />
            <div className="flex flex-wrap items-start gap-2">
              <DataTableSearch placeholder="Search name, email or company…" />
              <FilterBarWithFacets />
              <div className="ms-auto flex items-center gap-1.5">
                <DataTableViewOptions />
                <DataTableExport />
              </div>
            </div>
          </DataTableToolbar>
          <DataTableContent />
          <DataTableFooter />
        </DataTable>
      </ListContent>
    </ListLayout>
  );
}
