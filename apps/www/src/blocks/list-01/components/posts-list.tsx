"use client";

import * as React from "react";
import { Archive, CalendarClock, Copy, Eye, FileUp, FolderOpen, PenLine, Plus, Send, Tag, Trash2, UserRound } from "lucide-react";
import { Badge, Button, ListContent, ListLayout, PageHeader, toast, useFormat } from "@vamos-ui/react";
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
  type DataTableBulkAction,
  type DataTableColumn,
  type SavedView,
} from "@vamos-ui/react/data-table";
import { authors, categoryOptions, makePosts, me, statusOptions, type Post, type PostStatus } from "./posts-data";

const dateLabel: Record<PostStatus, string> = {
  published: "Published",
  scheduled: "Scheduled for",
  review: "Last modified",
  draft: "Last modified",
  archived: "Archived",
};

function PostDate({ post }: { post: Post }) {
  const f = useFormat();
  return (
    <span className="grid leading-tight">
      <span className="text-[11.5px] text-fg-subtle">{dateLabel[post.status]}</span>
      <time dateTime={post.updatedAt} className="tabular">
        {f.date(post.updatedAt, { month: "short", day: "numeric", year: "numeric" })}
      </time>
    </span>
  );
}

const columns: DataTableColumn<Post>[] = [
  {
    id: "title",
    header: "Title",
    accessor: "title",
    size: 380,
    minSize: 240,
    cell: ({ row }) => (
      <span className="grid min-w-0 gap-0.5">
        <span className="truncate font-medium text-fg">{row.title}</span>
        <span className="truncate font-mono text-[11.5px] text-fg-subtle">/blog/{row.slug}</span>
      </span>
    ),
  },
  { id: "status", header: "Status", accessor: "status", type: "enum", options: statusOptions, size: 130, filter: { quick: true }, mobile: "badge" },
  {
    id: "author",
    header: "Author",
    accessor: "author",
    type: "user",
    size: 180,
    options: authors.map((a) => ({ value: a.id, label: a.name })),
    sortValue: (p) => p.author.name,
    filter: { quick: true, icon: UserRound },
  },
  { id: "category", header: "Category", accessor: "category", type: "enum", options: categoryOptions, size: 150, filter: { quick: true, icon: FolderOpen } },
  { id: "tags", header: "Tags", accessor: "tags", type: "tags", size: 190, filter: { icon: Tag }, defaultVisible: false },
  { id: "views", header: "Views", accessor: "views", type: "number", size: 100, priority: 2 },
  { id: "comments", header: "Comments", accessor: "comments", type: "number", size: 110, priority: 3 },
  { id: "date", header: "Date", accessor: "updatedAt", type: "date", size: 150, cell: ({ row }) => <PostDate post={row} />, filter: { icon: CalendarClock } },
];

const base = toViewState(createListState({ sort: [{ id: "date", desc: true }] }));
const where = (clauses: SavedView["state"]["filters"]["clauses"]) => ({ ...base, filters: { logic: "and" as const, clauses } });

const initialViews: SavedView[] = [
  { id: "mine", name: "My drafts", scope: "personal", state: where([{ id: "a", field: "author", op: "in", value: [ME] }, { id: "s", field: "status", op: "in", value: ["draft", "review"] }]) },
  { id: "review", name: "Needs review", scope: "team", system: true, state: where([{ id: "s", field: "status", op: "in", value: ["review"] }]) },
  { id: "scheduled", name: "Scheduled", scope: "team", state: { ...where([{ id: "s", field: "status", op: "in", value: ["scheduled"] }]), sort: [{ id: "date", desc: false }] } },
  { id: "top", name: "Most read", scope: "team", state: { ...where([{ id: "s", field: "status", op: "in", value: ["published"] }]), sort: [{ id: "views", desc: true }] } },
];

/** CMS posts index: saved views, search, filter chips, column options, CSV, bulk actions with undo. */
export function PostsList() {
  const [posts, setPosts] = React.useState(makePosts);
  const [views, setViews] = React.useState(initialViews);

  const setStatus = (ids: Set<string>, status: PostStatus) => {
    const before = posts;
    setPosts((all) => all.map((p) => (ids.has(p.id) ? { ...p, status } : p)));
    return { undo: () => setPosts(before) };
  };

  const bulkActions: DataTableBulkAction<Post>[] = [
    {
      id: "publish",
      label: "Publish",
      icon: <Send />,
      disabled: (_s, rows) => (rows.every((r) => r.status === "published") ? "Everything selected is already published" : false),
      run: (_s, rows) => setStatus(new Set(rows.map((r) => r.id)), "published"),
    },
    { id: "draft", label: "Move to draft", icon: <PenLine />, run: (_s, rows) => setStatus(new Set(rows.map((r) => r.id)), "draft") },
    { id: "archive", label: "Archive", icon: <Archive />, run: (_s, rows) => setStatus(new Set(rows.map((r) => r.id)), "archived") },
    {
      id: "trash",
      label: "Move to trash",
      icon: <Trash2 />,
      tone: "danger",
      confirm: { title: "Move posts to trash?", description: (n) => `${n} ${n === 1 ? "post" : "posts"} will be unpublished and kept in Trash for 30 days.`, confirmLabel: "Move to trash" },
      run: (_s, rows) => {
        const before = posts;
        const ids = new Set(rows.map((r) => r.id));
        setPosts((all) => all.filter((p) => !ids.has(p.id)));
        return { undo: () => setPosts(before) };
      },
    },
  ];

  const scheduled = posts.filter((p) => p.status === "scheduled").length;
  const inReview = posts.filter((p) => p.status === "review").length;

  return (
    <ListLayout width="wide" stickyToolbar={false}>
      <PageHeader
        eyebrow="Content"
        title="Posts"
        meta={<Badge tone="outline" className="tabular">{posts.length}</Badge>}
        description={`${scheduled} scheduled · ${inReview} waiting for review · Blog at northpoint.studio/blog`}
        actions={
          <>
            <Button>
              <FileUp /> Import
            </Button>
            <Button variant="primary">
              <Plus /> New post
            </Button>
          </>
        }
      />
      <ListContent className="pt-0">
        <DataTable
          caption="Posts"
          columns={columns}
          data={posts}
          getRowId={(p) => p.id}
          selectable
          bulkActions={bulkActions}
          me={me}
          rowHref={(p) => `#/site/posts/${p.id}`}
          rowActions={(p) => [
            { id: "edit", label: "Edit", icon: <PenLine />, href: `#/site/posts/${p.id}` },
            { id: "view", label: p.status === "published" ? "View on site" : "Preview", icon: <Eye />, href: `#/blog/${p.slug}` },
            { id: "duplicate", label: "Duplicate", icon: <Copy />, onSelect: () => toast.success(`Copied “${p.title}” as a draft`) },
            { type: "separator" },
            { id: "trash", label: "Move to trash", icon: <Trash2 />, tone: "danger", onSelect: () => setPosts((all) => all.filter((x) => x.id !== p.id)) },
          ]}
          defaultState={{ sort: [{ id: "date", desc: true }], page: { index: 0, size: 25 } }}
          pageSizes={[10, 25, 50]}
          export={{ filename: "posts" }}
          getRowLabel={(p) => p.title}
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
              <DataTableSearch placeholder="Search titles and tags…" />
              <DataTableFilterBar />
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
