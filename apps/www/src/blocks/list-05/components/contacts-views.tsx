"use client";

import * as React from "react";
import { Building2, CalendarClock, Gauge, Globe2, Mail, Megaphone, Share2, Tag, Trash2, UserPlus, UserRound } from "lucide-react";
import { Avatar, Badge, Button, PageHeader, toast } from "@vamos-ui/react";
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
  applyViewState,
  createListState,
  useDataTable,
  type DataTableBulkAction,
  type DataTableColumn,
  type FilterOption,
} from "@vamos-ui/react/data-table";
import { useBlockFormat } from "../../_shared/format";
import { me } from "../../_shared/people";
import { NOW_MS } from "../../_shared/time";
import { countryLabels, crmContacts, owners, sourceLabels, stageLabels, stageTone, tagLabels, type CrmContact } from "./contacts-data";
import { ShareViewDialog } from "./share-view-dialog";
import { ViewHeader, ViewsRail } from "./views-rail";
import { initialViews, type ContactView } from "./views-data";

const ME_USER = { id: me.id, name: me.name };

const options = <K extends string>(labels: Record<K, { en: string; tr: string }>, t: (l: { en: string; tr: string }) => string, tones?: Record<K, FilterOption["tone"]>): FilterOption[] =>
  (Object.keys(labels) as K[]).map((k) => ({ value: k, label: t(labels[k]), tone: tones?.[k] }));

/** Columns are built per language: headers and option labels are the filter bar's words too. */
function useColumns(): DataTableColumn<CrmContact>[] {
  const { c, t, f } = useBlockFormat();
  return React.useMemo(
    () => [
      {
        id: "name",
        header: c("Name", "Ad"),
        accessor: "name",
        size: 240,
        minSize: 210,
        hideable: false,
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
        header: c("Company", "Şirket"),
        accessor: "company",
        size: 200,
        filter: { icon: Building2 },
        mobile: "subtitle",
        cell: ({ row }) => (
          <span className="grid min-w-0 leading-tight">
            <span className="truncate text-fg">{row.company}</span>
            <span className="truncate text-[12px] text-fg-subtle">{t(row.title)}</span>
          </span>
        ),
      },
      { id: "stage", header: c("Stage", "Aşama"), accessor: "stage", type: "enum", options: options(stageLabels, t, stageTone), size: 124, filter: { quick: true }, mobile: "badge" },
      {
        id: "owner",
        header: c("Owner", "Sorumlu"),
        accessor: "owner",
        type: "user",
        size: 168,
        options: owners.map((o) => ({ value: o.id, label: o.name })),
        sortValue: (r) => r.owner?.name ?? "",
        filter: { quick: true, icon: UserRound },
      },
      {
        id: "score",
        header: c("Score", "Puan"),
        accessor: "score",
        type: "number",
        size: 104,
        filter: { icon: Gauge },
        cell: ({ row }) => (
          <span className="inline-flex items-center gap-2">
            <span aria-hidden className="h-1 w-10 overflow-hidden rounded-full bg-track">
              <span className={row.score >= 70 ? "block h-full bg-accent" : "block h-full bg-fg-subtle"} style={{ width: `${row.score}%` }} />
            </span>
            <span className="tabular">{row.score}</span>
          </span>
        ),
      },
      {
        id: "lastTouch",
        header: c("Last touch", "Son temas"),
        accessor: "lastTouch",
        type: "date",
        size: 124,
        filter: { icon: CalendarClock },
        cell: ({ row }) => (
          <time dateTime={row.lastTouch} title={f.date(row.lastTouch, "long")} className="text-fg-muted">
            {f.relative(`${row.lastTouch}T09:00:00+03:00`, { now: NOW_MS })}
          </time>
        ),
      },
      { id: "source", header: c("Source", "Kaynak"), accessor: "source", type: "enum", options: options(sourceLabels, t), size: 132, filter: { icon: Megaphone } },
      { id: "country", header: c("Country", "Ülke"), accessor: "country", type: "enum", options: options(countryLabels, t), size: 140, filter: { icon: Globe2 }, defaultVisible: false },
      { id: "tags", header: c("Tags", "Etiketler"), accessor: "tags", type: "tags", options: options(tagLabels, t), size: 210, filter: { icon: Tag }, defaultVisible: false },
      { id: "phone", header: c("Phone", "Telefon"), accessor: "phone", size: 170, defaultVisible: false, cell: ({ row }) => <span className="tabular whitespace-nowrap text-fg-muted">{row.phone}</span> },
      { id: "created", header: c("Created", "Oluşturuldu"), accessor: "created", type: "date", size: 130, defaultVisible: false },
    ],
    [c, t, f],
  );
}

/** CRM contacts with saved views you can share: a views rail with live counts, the filter bar, a column chooser. */
export function ContactsViews() {
  const { c } = useBlockFormat();
  const columns = useColumns();
  const [rows, setRows] = React.useState(crmContacts);
  const [views, setViews] = React.useState<ContactView[]>(initialViews);

  const reassign = (ids: Set<string>, owner: CrmContact["owner"]) => {
    const before = rows;
    setRows((all) => all.map((r) => (ids.has(r.id) ? { ...r, owner } : r)));
    return { undo: () => setRows(before) };
  };

  const bulkActions: DataTableBulkAction<CrmContact>[] = [
    { id: "assign", label: c("Assign to me", "Bana ata"), icon: <UserPlus />, run: (_s, sel) => reassign(new Set(sel.map((r) => r.id)), ME_USER) },
    {
      id: "email",
      label: c("Add to sequence", "Akışa ekle"),
      icon: <Mail />,
      run: (_s, sel) => void toast.success(c(`${sel.length} contacts added to “Q4 follow-up”`, `${sel.length} kişi “4. çeyrek takibi” akışına eklendi`)),
    },
    {
      id: "delete",
      label: c("Delete", "Sil"),
      icon: <Trash2 />,
      tone: "danger",
      confirm: {
        title: c("Delete contacts?", "Kişiler silinsin mi?"),
        description: (n) => c(`${n} contacts and their activity history will be removed.`, `${n} kişi ve etkinlik geçmişleri silinecek.`),
        confirmLabel: c("Delete", "Sil"),
      },
      run: (_s, sel) => {
        const before = rows;
        const ids = new Set(sel.map((r) => r.id));
        setRows((all) => all.filter((r) => !ids.has(r.id)));
        return { undo: () => setRows(before) };
      },
    },
  ];

  const def = views.find((v) => v.isDefault);

  return (
    <div className="mx-auto w-full max-w-[1440px]">
      <PageHeader
        eyebrow="CRM"
        title={c("Contacts", "Kişiler")}
        meta={<Badge tone="outline" className="tabular">{rows.length}</Badge>}
        description={c("Pick a view on the left, change the filters, then save it or share a link with your team.", "Soldan bir görünüm seçin, filtreleri değiştirin, sonra kaydedin ya da ekibinizle bağlantısını paylaşın.")}
      />
      <DataTable
        caption={c("Contacts", "Kişiler")}
        columns={columns}
        data={rows}
        getRowId={(r) => r.id}
        variant="flush"
        selectable
        bulkActions={bulkActions}
        me={ME_USER}
        rowHref={(r) => `#/crm/contacts/${r.id}`}
        getRowLabel={(r) => r.name}
        defaultState={def ? applyViewState(createListState({}, 25), def.state, def.id) : { page: { index: 0, size: 25 } }}
        pageSizes={[25, 50]}
        export={{ filename: "contacts" }}
        className="mt-6 grid gap-6 lg:grid-cols-[15.5rem_minmax(0,1fr)]"
      >
        <ViewsRail views={views} setViews={setViews} className="max-lg:hidden" />
        <Workspace views={views} setViews={setViews} />
      </DataTable>
    </div>
  );
}

function Workspace({ views, setViews }: { views: ContactView[]; setViews: React.Dispatch<React.SetStateAction<ContactView[]>> }) {
  const { c, t } = useBlockFormat();
  // The kit's view switcher shows `name`; give it the name in the current language.
  const named = React.useMemo(() => views.map((v) => ({ ...v, name: t(v.label) })), [views, t]);
  const { state } = useDataTable<CrmContact>();
  const [sharing, setSharing] = React.useState(false);
  const active = views.find((v) => v.id === state.view) ?? null;
  return (
    <section aria-label={c("Contact list", "Kişi listesi")} className="surface min-w-0 overflow-hidden rounded-ui-lg">
      <ViewHeader
        view={active}
        actions={
          <Button size="sm" onClick={() => setSharing(true)}>
            <Share2 /> {c("Share", "Paylaş")}
          </Button>
        }
      />
      <DataTableToolbar className="flex-col items-stretch gap-3 border-b border-line">
        <div className="lg:hidden">
          <DataTableSavedViews
            views={named}
            variant="select"
            onSave={({ name, scope, state: s }) => {
              const view: ContactView = { id: `v-${views.length + 1}`, name, label: { en: name, tr: name }, description: { en: "", tr: "" }, scope, audience: scope === "team" ? "sales" : "private", ownerId: me.id, state: s ?? views[0]!.state };
              setViews((v) => [...v, view]);
              return view;
            }}
            onUpdate={(id, s) => setViews((v) => v.map((x) => (x.id === id ? { ...x, state: s } : x)))}
          />
        </div>
        <div className="flex flex-wrap items-start gap-2">
          <DataTableSearch placeholder={c("Search names, emails, companies…", "Ad, e-posta, şirket ara…")} />
          <DataTableFilterBar />
          <div className="ms-auto flex items-center gap-1.5">
            <DataTableViewOptions />
            <DataTableExport />
          </div>
        </div>
      </DataTableToolbar>
      <DataTableContent />
      <DataTableFooter />
      <ShareViewDialog open={sharing} onOpenChange={setSharing} view={active} onAudienceChange={(id, audience) => setViews((v) => v.map((x) => (x.id === id ? { ...x, audience, scope: audience === "private" ? "personal" : "team" } : x)))} />
    </section>
  );
}
