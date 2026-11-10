"use client";

import * as React from "react";
import { Copy, Eye, Pencil, Send, Trash2 } from "lucide-react";
import { DataTable, type DataTableBulkAction, type DataTableColumn } from "@vamos-ui/react/data-table";
import { posts as initialPosts, type Post } from "./_data";

const columns: DataTableColumn<Post>[] = [
  { id: "title", header: "Title", accessor: "title", size: 320, mobile: "title" },
  {
    id: "status",
    header: "Status",
    accessor: "status",
    type: "enum",
    size: 130,
    options: [
      { value: "published", label: "Published", tone: "success" },
      { value: "scheduled", label: "Scheduled", tone: "info" },
      { value: "review", label: "In review", tone: "warning" },
      { value: "draft", label: "Draft", tone: "neutral" },
    ],
  },
  { id: "author", header: "Author", accessor: "author", type: "user", sortValue: (p) => p.author.name },
  { id: "category", header: "Category", accessor: "category", size: 130 },
  { id: "views", header: "Views", accessor: "views", type: "number", size: 110 },
  { id: "updatedAt", header: "Last updated", accessor: "updatedAt", type: "datetime", size: 190 },
];

export default function DataTableDemo() {
  const [posts, setPosts] = React.useState(initialPosts);

  const bulkActions: DataTableBulkAction<Post>[] = [
    {
      id: "publish",
      label: "Publish",
      icon: <Send />,
      disabled: (_, rows) => (rows.every((p) => p.status === "published") ? "Everything selected is already live." : false),
      run: (_, rows) => {
        const ids = new Set(rows.map((p) => p.id));
        const before = posts;
        setPosts((list) => list.map((p) => (ids.has(p.id) ? { ...p, status: "published" } : p)));
        return { undo: () => setPosts(before) };
      },
    },
    {
      id: "trash",
      label: "Move to trash",
      icon: <Trash2 />,
      tone: "danger",
      confirm: { title: "Move posts to trash?", description: (n) => `${n} ${n === 1 ? "post" : "posts"} will leave the site. You can restore them for 30 days.`, confirmLabel: "Move to trash" },
      run: (_, rows) => {
        const ids = new Set(rows.map((p) => p.id));
        const before = posts;
        setPosts((list) => list.filter((p) => !ids.has(p.id)));
        return { undo: () => setPosts(before) };
      },
    },
  ];

  return (
    <DataTable
      caption="Posts"
      columns={columns}
      data={posts}
      getRowId={(p) => p.id}
      defaultState={{ sort: [{ id: "updatedAt", desc: true }], page: { index: 0, size: 10 } }}
      pageSizes={[10, 25, 50]}
      selectable
      bulkActions={bulkActions}
      rowActions={(p) => [
        { id: "edit", label: "Edit", icon: <Pencil /> },
        { id: "view", label: "View on site", icon: <Eye />, disabled: p.status !== "published" },
        { id: "duplicate", label: "Duplicate", icon: <Copy /> },
        { type: "separator" },
        { id: "trash", label: "Move to trash", icon: <Trash2 />, tone: "danger", onSelect: () => setPosts((l) => l.filter((x) => x.id !== p.id)) },
      ]}
      export={{ filename: "posts" }}
      className="w-full"
    />
  );
}
