"use client";

import { Avatar, Badge, SlaTimer } from "@vamos-ui/react";

const NOW = Date.parse("2026-11-18T10:24:00+03:00");
const at = (minutes: number) => NOW + minutes * 60_000;

const tickets = [
  { id: 4814, subject: "Webhook deliveries failing with 401", requester: "Nur Şimşek", priority: "Urgent", created: at(-41), due: at(-11) },
  { id: 4812, subject: "Staff can't log in with SSO since this morning", requester: "Femke de Vries", priority: "High", created: at(-35), due: at(25) },
  { id: 4817, subject: "Help importing 3,000 contacts from a spreadsheet", requester: "Mads Kjær", priority: "Normal", created: at(-22), due: at(218) },
  { id: 4809, subject: "Return label never arrived", requester: "Harriet Moss", priority: "Low", created: at(-300), due: at(180), paused: at(-90) },
];

export default function SlaTimerInbox() {
  return (
    <ul className="w-full max-w-xl divide-y divide-line rounded-ui-lg border border-line bg-surface">
      {tickets.map((t) => (
        <li key={t.id} className="flex items-center gap-3 px-4 py-3">
          <Avatar name={t.requester} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium text-fg">{t.subject}</p>
            <p className="text-xs text-fg-muted">
              #{t.id} · {t.requester}
            </p>
          </div>
          <Badge tone={t.priority === "Urgent" ? "danger" : t.priority === "High" ? "warning" : "neutral"}>{t.priority}</Badge>
          <SlaTimer now={NOW} label={`#${t.id} first response`} start={t.created} due={t.due} pausedAt={t.paused} className="w-24 justify-center" />
        </li>
      ))}
    </ul>
  );
}
