"use client";

import * as React from "react";
import { Button, Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader, Field, Textarea, Toaster, useFormat } from "@vamos-cms/ui";
import { Kanban, KanbanCardMeta, KanbanCardTitle, applyKanbanMove, type KanbanMoveEvent, type Stage } from "@vamos-cms/ui/sortable";

interface Deal {
  id: string;
  title: string;
  stage: string;
  value: string | null;
  lostReason?: string;
}

const stages: Stage[] = [
  { key: "proposal", label: "Proposal", tone: "chart-3" },
  { key: "negotiation", label: "Negotiation", tone: "chart-4" },
  { key: "won", label: "Won", tone: "success", category: "done" },
  { key: "lost", label: "Lost", tone: "danger", category: "canceled" },
];

export default function KanbanRules() {
  const format = useFormat();
  const [deals, setDeals] = React.useState<Deal[]>([
    { id: "r1", title: "Harborview Hotels — guest app", stage: "proposal", value: "54000.00" },
    { id: "r2", title: "Pinecrest Schools — LMS pilot", stage: "negotiation", value: null },
    { id: "r3", title: "Atlas Freight — tracking portal", stage: "negotiation", value: "72500.00" },
  ]);
  const [asking, setAsking] = React.useState<{ e: KanbanMoveEvent; resolve: (ok: boolean) => void } | null>(null);
  const [reason, setReason] = React.useState("");

  const apply = (e: KanbanMoveEvent, extra?: Partial<Deal>) =>
    setDeals((all) =>
      applyKanbanMove(all, e, { getId: (d) => d.id, getStageKey: (d) => d.stage, update: (d, stage) => ({ ...d, stage, ...extra }) }),
    );

  return (
    <div className="w-full">
      <Toaster />
      <Kanban
        aria-label="Deals with stage rules"
        stages={stages}
        items={deals}
        getStageKey={(d) => d.stage}
        canMove={(e) => {
          const d = deals.find((x) => x.id === e.id)!;
          if (e.to === "won" && !d.value) return "Add a deal value before marking it as Won";
          if (e.from === "won") return "Won deals are locked. Reopen them from the deal page";
          return true;
        }}
        beforeMove={(e) =>
          e.to === "lost"
            ? new Promise<boolean>((resolve) => {
                setReason("");
                setAsking({ e, resolve });
              })
            : true
        }
        onMove={(e) => apply(e, e.to === "lost" ? { lostReason: reason } : undefined)}
        renderCard={(d) => (
          <>
            <KanbanCardTitle>{d.title}</KanbanCardTitle>
            <KanbanCardMeta>
              {d.value ? <span className="tabular font-medium text-fg">{format.currency(d.value, "USD")}</span> : <span className="text-warning">No value yet</span>}
              {d.lostReason ? <span className="truncate">Lost: {d.lostReason}</span> : null}
            </KanbanCardMeta>
          </>
        )}
      />
      <Dialog
        open={!!asking}
        onOpenChange={(open) => {
          if (!open && asking) {
            asking.resolve(false);
            setAsking(null);
          }
        }}
      >
        <DialogContent size="sm">
          <DialogHeader title="Why was this deal lost?" description="Loss reasons feed the quarterly win/loss report." />
          <DialogBody>
            <Field label="Reason" required>
              <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Chose a cheaper vendor, budget frozen until Q2…" rows={3} />
            </Field>
          </DialogBody>
          <DialogFooter>
            <Button
              onClick={() => {
                asking?.resolve(false);
                setAsking(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              disabled={!reason.trim()}
              onClick={() => {
                asking?.resolve(true);
                setAsking(null);
              }}
            >
              Mark as lost
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
