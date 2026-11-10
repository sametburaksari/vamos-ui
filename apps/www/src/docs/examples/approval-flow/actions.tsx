"use client";

import * as React from "react";
import { toast } from "@vamos-ui/react";
import { ApprovalActions, ApprovalFlow, type ApprovalStageData } from "@vamos-ui/react/business";

const initial: ApprovalStageData[] = [
  { id: "sales", title: "Sales manager", mode: "all", condition: "Discount > 15%", status: "active", approvers: [{ id: "me", name: "You", role: "Sales manager" }] },
  { id: "cfo", title: "CFO", mode: "all", condition: "Discount > 25%", status: "waiting", approvers: [{ id: "cfo", name: "Hana Kobayashi" }] },
];

export default function ApprovalFlowActions() {
  const [stages, setStages] = React.useState(initial);
  const decide = (value: "approved" | "rejected" | "changes_requested", note?: string) =>
    new Promise<void>((resolve) =>
      setTimeout(() => {
        setStages((s) =>
          s.map((st, i) =>
            i === 0
              ? { ...st, status: value, approvers: st.approvers.map((a) => ({ ...a, decision: { value, at: new Date().toISOString(), note } })) }
              : value === "approved"
                ? { ...st, status: "active" }
                : { ...st, status: "skipped" },
          ),
        );
        resolve();
      }, 500),
    );
  const canAct = stages[0]!.status === "active";
  return (
    <div className="flex w-full max-w-xl flex-col gap-5">
      <div className="rounded-ui-lg border border-line p-4">
        <p className="text-sm font-medium text-fg">Quote Q-2026-207 · Northwind Traders</p>
        <p className="mt-0.5 text-[13px] text-fg-muted">18% discount on 120 seats — requested by Pınar Güneş</p>
        <ApprovalActions
          className="mt-4"
          canAct={canAct}
          cantActReason="You've decided on this quote."
          onApprove={(note) => decide("approved", note).then(() => void toast.success("Discount approved"))}
          onReject={(note) => decide("rejected", note)}
          onRequestChanges={(note) => decide("changes_requested", note)}
          onDelegate={(to) => decide("approved", `Delegated to ${to.name}`)}
          delegates={[
            { id: "d1", name: "Mateo Rossi" },
            { id: "d2", name: "Lina Haddad" },
          ]}
        />
      </div>
      <ApprovalFlow aria-label="Discount approval" stages={stages} />
    </div>
  );
}
