"use client";

import * as React from "react";
import { Avatar, StatusPicker, type StatusDef } from "@vamos-ui/react";

const leave: StatusDef[] = [
  { value: "pending", label: "Pending", category: "todo", tone: "warning" },
  { value: "approved", label: "Approved", category: "done" },
  { value: "rejected", label: "Rejected", category: "cancelled", tone: "danger" },
];

export default function StatusPickerConfirm() {
  const [status, setStatus] = React.useState("pending");
  const [note, setNote] = React.useState<string>();
  return (
    <div className="grid w-full max-w-md gap-3 rounded-ui border border-line bg-surface p-4">
      <div className="flex items-center gap-3">
        <Avatar name="Can Yıldız" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">Can Yıldız · Annual leave</p>
          <p className="text-xs text-fg-muted">Dec 22 – Jan 2 · 7 working days</p>
        </div>
        <StatusPicker
          statuses={leave}
          fieldLabel="Leave request"
          transitions={{ pending: ["approved", "rejected"], approved: ["pending"], rejected: ["pending"] }}
          value={status}
          confirm={(next) =>
            next.value === "rejected"
              ? { title: "Reject this leave request?", description: "Can will get an email with your reason.", requireNote: true, noteLabel: "Reason", confirmLabel: "Reject request", tone: "danger" }
              : next.value === "approved"
                ? { title: "Approve 7 days of leave?", description: "Days are deducted from the 2026 allowance.", confirmLabel: "Approve" }
                : false
          }
          onValueChange={(v, _prev, meta) => {
            setStatus(v);
            setNote(meta.note);
          }}
        />
      </div>
      {note ? <p className="rounded-ui-sm bg-surface-2 px-3 py-2 text-xs text-fg-muted">Reason sent: “{note}”</p> : null}
    </div>
  );
}
