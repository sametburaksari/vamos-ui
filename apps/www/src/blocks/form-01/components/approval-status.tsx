"use client";

import * as React from "react";
import { BellRing, CalendarCheck2, Send, ShieldCheck, UserCheck } from "lucide-react";
import { ActivityTimeline, Alert, Badge, Button, Card, CardBody, CardFooter, CardHeader, toast, useConfirm, useFormat, type PickerUser } from "@vamos-ui/react";
import { approvers, type LeaveType } from "./data";

export interface ApprovalStatusProps {
  type: LeaveType;
  range: { from: string; to: string };
  days: number;
  cover: PickerUser | null;
  submittedAt: string;
  onWithdraw: () => void;
}

/** After sending: where the request is in the approval chain, with reminder and withdraw. */
export function ApprovalStatus({ type, range, days, cover, submittedAt, onWithdraw }: ApprovalStatusProps) {
  const f = useFormat();
  const confirm = useConfirm();
  const [reminded, setReminded] = React.useState(false);
  const [manager, hr] = approvers;

  const withdraw = async () => {
    const ok = await confirm({
      title: "Withdraw this request?",
      description: `${manager!.name} won’t be asked to approve it. You can send a new one any time.`,
      confirmLabel: "Withdraw request",
      tone: "danger",
    });
    if (ok) {
      onWithdraw();
      toast("Request withdrawn");
    }
  };

  return (
    <Card className="min-w-0">
      <CardHeader
        divider
        eyebrow="Request LV-2026-0418"
        title={`${type.label} · ${f.number(days)} ${days === 1 ? "day" : "days"}`}
        description={f.dateRange(range.from, range.to, "long")}
        action={<Badge tone="warning">Waiting for approval</Badge>}
      />
      <CardBody className="grid gap-5 py-6">
        <Alert tone="success" size="sm" title="Sent to Meltem for approval" live="polite">
          {cover ? `${cover.name} was told they’re covering for you.` : "Nobody was asked to cover."} We’ll email you when it moves on.
        </Alert>
        <ActivityTimeline
          variant="steps"
          items={[
            { id: "sent", at: submittedAt, status: "done", icon: Send, title: "You sent the request" },
            {
              id: "manager",
              at: submittedAt,
              status: "current",
              icon: UserCheck,
              title: `${manager!.name} · ${manager!.role}`,
              body: "Usually replies within a day. Reminders go out after 48 hours.",
            },
            { id: "hr", at: submittedAt, status: "upcoming", icon: ShieldCheck, title: `${hr!.name} · ${hr!.role}`, body: "Checks the balance and payroll impact." },
            { id: "calendar", at: submittedAt, status: "upcoming", icon: CalendarCheck2, title: "Added to the team calendar", body: "Your status shows “Away” on these days." },
          ]}
        />
      </CardBody>
      <CardFooter className="flex flex-wrap justify-end gap-2 border-t border-line">
        <Button variant="danger-ghost" onClick={withdraw}>
          Withdraw
        </Button>
        <Button
          disabled={reminded}
          onClick={() => {
            setReminded(true);
            toast.success(`Reminder sent to ${manager!.name}`);
          }}
        >
          <BellRing /> {reminded ? "Reminder sent" : "Send reminder"}
        </Button>
      </CardFooter>
    </Card>
  );
}
