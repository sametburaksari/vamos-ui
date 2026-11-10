"use client";

import { NotificationCenter, NotificationItem, createMemoryNotificationAdapter, toast } from "@vamos-cms/ui";
import { inboxSeed } from "./data";

const approvals = inboxSeed().filter((n) => n.actions);
const inbox = createMemoryNotificationAdapter(
  [
    ...approvals,
    {
      id: "n-2001",
      title: "Expense claim from Jonas Becker",
      body: "Client dinner, Acme GmbH · €184.50",
      createdAt: new Date(Date.now() - 3 * 36e5).toISOString(),
      actor: { name: "Jonas Becker" },
      app: "People",
      actions: [
        { id: "approve", label: "Approve", variant: "primary" },
        { id: "reject", label: "Reject" },
      ],
    },
  ],
  {
    latency: 700,
    onAction: (id, action) => {
      toast.success(action === "approve" ? "Approved" : "Rejected", { description: `Request ${id}` });
    },
  },
);

/** Inline actions run onAction with a spinner on the button and disappear on success. */
export default function NotificationInlineActions() {
  return (
    <div className="flex items-start gap-8">
      <NotificationCenter adapter={inbox} tabs={[{ id: "all", label: "Approvals" }]} />
      <div className="surface hidden w-80 rounded-ui-lg p-1.5 lg:block">
        <NotificationItem notification={approvals[0]!} onAction={(a) => toast(`Clicked ${a}`)} />
      </div>
    </div>
  );
}
