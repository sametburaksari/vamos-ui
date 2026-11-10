"use client";

import * as React from "react";
import { Ban, Mail, RotateCcw, ShieldCheck, Trash2, UserCog } from "lucide-react";
import { Avatar, toast } from "@vamos-ui/react";
import { DataTable, type DataTableBulkAction, type DataTableColumn } from "@vamos-ui/react/data-table";
import { roleOptions, statusOptions, type Member } from "./data";

const columns: DataTableColumn<Member>[] = [
  {
    id: "name",
    header: "Name",
    accessor: "name",
    size: 280,
    mobile: "title",
    cell: ({ row }) => (
      <span className="flex min-w-0 items-center gap-2.5">
        <Avatar size="sm" name={row.name} />
        <span className="min-w-0">
          <span className="block truncate font-medium text-fg">{row.name}</span>
          <span className="block truncate text-[12px] text-fg-subtle">{row.email}</span>
        </span>
      </span>
    ),
  },
  { id: "email", header: "Email", accessor: "email", defaultVisible: false },
  { id: "role", header: "Role", accessor: "role", type: "enum", size: 140, options: [...roleOptions], mobile: "badge" },
  { id: "apps", header: "Apps", accessor: "apps", type: "tags", size: 200, priority: 2 },
  { id: "status", header: "Status", accessor: "status", type: "enum", size: 120, options: [...statusOptions] },
  { id: "twoFactor", header: "2-step", accessor: "twoFactor", type: "boolean", size: 116, priority: 3 },
  { id: "lastActive", header: "Last active", accessor: "lastActive", type: "datetime", size: 180, priority: 2 },
];

export function MembersTable({ data, onChange }: { data: Member[]; onChange: (next: Member[]) => void }) {
  const update = (ids: Set<string>, patch: Partial<Member>) => {
    const before = data;
    onChange(data.map((m) => (ids.has(m.id) && m.role !== "owner" ? { ...m, ...patch } : m)));
    return { undo: () => onChange(before) };
  };

  const bulkActions: DataTableBulkAction<Member>[] = [
    {
      id: "suspend",
      label: "Suspend",
      icon: <Ban />,
      disabled: (_, rows) => (rows.some((m) => m.role === "owner") ? "The owner can't be suspended." : false),
      run: (_, rows) => update(new Set(rows.map((m) => m.id)), { status: "suspended" }),
    },
    {
      id: "remove",
      label: "Remove",
      icon: <Trash2 />,
      tone: "danger",
      disabled: (_, rows) => (rows.some((m) => m.role === "owner") ? "Transfer ownership before removing the owner." : false),
      confirm: {
        title: "Remove people from the workspace?",
        description: (n) => `${n} ${n === 1 ? "person loses" : "people lose"} access right away. Their records and comments stay.`,
        confirmLabel: "Remove",
      },
      run: (_, rows) => {
        const ids = new Set(rows.map((m) => m.id));
        const before = data;
        onChange(data.filter((m) => !ids.has(m.id)));
        return { undo: () => onChange(before) };
      },
    },
  ];

  return (
    <DataTable
      caption="Members"
      columns={columns}
      data={data}
      getRowId={(m) => m.id}
      getRowLabel={(m) => m.name}
      defaultState={{ sort: [{ id: "lastActive", desc: true }], page: { index: 0, size: 10 } }}
      pageSizes={[10, 25, 50]}
      selectable
      rowSelectable={(m) => (m.role === "owner" ? "The owner can't be selected." : true)}
      bulkActions={bulkActions}
      rowActions={(m) => [
        { id: "role", label: "Change role", icon: <UserCog />, disabled: m.role === "owner" },
        ...(m.status === "invited"
          ? [{ id: "resend", label: "Resend invitation", icon: <Mail />, onSelect: () => toast.success(`Invitation sent again to ${m.email}`) }]
          : []),
        ...(m.status === "suspended"
          ? [{ id: "restore", label: "Restore access", icon: <RotateCcw />, onSelect: () => update(new Set([m.id]), { status: "active" }) }]
          : []),
        { id: "2fa", label: "Reset two-step verification", icon: <ShieldCheck />, disabled: !m.twoFactor },
        { type: "separator" as const },
        { id: "remove", label: "Remove from workspace", icon: <Trash2 />, tone: "danger" as const, disabled: m.role === "owner", onSelect: () => onChange(data.filter((x) => x.id !== m.id)) },
      ]}
      export={{ filename: "northwind-members" }}
      className="w-full"
    />
  );
}
