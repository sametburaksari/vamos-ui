"use client";

import * as React from "react";
import { Building2, Mail } from "lucide-react";
import { Avatar, Badge, Button, Field, Progress, Select, TagInput, cn, toast } from "@vamos-ui/react";
import { lifecycleLabels, planLabels } from "../../_shared/companies";
import { useBlockFormat } from "../../_shared/format";
import { person } from "../../_shared/people";
import { priorityLabels, ticketStatusLabels, type TicketPriority, type TicketStatus } from "../../_shared/tickets";
import { agents, company, priorities, queues, related, requester, slaPolicy, tagSuggestions, type ticket } from "./data";

export interface TicketProps {
  status: TicketStatus;
  priority: TicketPriority;
  assigneeId: string;
  queue: (typeof ticket)["queue"];
  tags: string[];
}

export const statusTone: Record<TicketStatus, "info" | "accent" | "warning" | "neutral" | "success"> = {
  new: "info",
  open: "accent",
  pending: "warning",
  "on-hold": "neutral",
  solved: "success",
  closed: "neutral",
};

/** Properties, requester and account, SLA policy and older tickets. Used as a column and in a sheet. */
export function SidePanel({ value, onChange, idPrefix }: { value: TicketProps; onChange: (patch: Partial<TicketProps>) => void; idPrefix: string }) {
  const { f, t, c, ago } = useBlockFormat();
  const policy = slaPolicy[value.priority];
  const owner = person(company.ownerId);
  const minutes = (m: number) => f.duration(m * 60, { style: "short" });

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6">
      <section aria-labelledby={`${idPrefix}-props`} className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-3.5">
        <h2 id={`${idPrefix}-props`} className="text-xs font-medium text-fg-subtle">{c("Ticket", "Talep")}</h2>
        <Field label={c("Status", "Durum")}>
          <Select
            size="sm"
            value={value.status}
            onValueChange={(v) => v && onChange({ status: v as TicketStatus })}
            items={(["open", "pending", "on-hold", "solved"] as TicketStatus[]).map((s) => ({ value: s, label: t(ticketStatusLabels[s]) }))}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3 [&>*]:min-w-0">
          <Field label={c("Priority", "Öncelik")}>
            <Select size="sm" value={value.priority} onValueChange={(v) => v && onChange({ priority: v as TicketPriority })} items={priorities.map((p) => ({ value: p, label: t(priorityLabels[p]) }))} />
          </Field>
          <Field label={c("Queue", "Kuyruk")}>
            <Select size="sm" value={value.queue} onValueChange={(v) => v && onChange({ queue: v as TicketProps["queue"] })} items={queues.map((q) => ({ value: q.key, label: t(q.label) }))} />
          </Field>
        </div>
        <Field label={c("Assignee", "Atanan")}>
          <Select
            size="sm"
            value={value.assigneeId}
            onValueChange={(v) => v && onChange({ assigneeId: v })}
            items={agents.map((a) => ({ value: a.id, label: a.name, description: t(a.title), icon: <Avatar name={a.name} size="xs" status={a.status} /> }))}
          />
        </Field>
        <Field label={c("Tags", "Etiketler")}>
          <TagInput value={value.tags} onValueChange={(tags) => onChange({ tags })} suggestions={tagSuggestions} />
        </Field>
        <p className="text-xs text-fg-subtle">
          {c(
            `${t(priorityLabels[value.priority])} policy: first reply in ${minutes(policy.firstResponse)}, resolve in ${minutes(policy.resolve)}.`,
            `${t(priorityLabels[value.priority])} politikası: ilk yanıt ${minutes(policy.firstResponse)}, çözüm ${minutes(policy.resolve)} içinde.`,
          )}
        </p>
      </section>

      <section aria-labelledby={`${idPrefix}-req`} className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-3 border-t border-line pt-5">
        <h2 id={`${idPrefix}-req`} className="text-xs font-medium text-fg-subtle">{c("Requester", "Talep sahibi")}</h2>
        <div className="flex items-center gap-3">
          <Avatar name={requester.name} size="lg" />
          <div className="min-w-0">
            <p className="truncate font-medium text-fg">{requester.name}</p>
            <p className="truncate text-sm text-fg-muted">{t(requester.title)}</p>
          </div>
        </div>
        <a href={`mailto:${requester.email}`} className="flex items-center gap-2 truncate rounded-ui-sm text-sm text-fg-muted hover:text-fg focus-ring">
          <Mail className="size-3.5 shrink-0" aria-hidden />
          <span className="truncate">{requester.email}</span>
        </a>
        <div className="surface-2 grid gap-3 rounded-ui p-3">
          <div className="flex items-center gap-2.5">
            <Avatar name={company.name} shape="square" size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-fg">{company.name}</p>
              <p className="truncate text-xs text-fg-muted">{t(planLabels[company.plan])} · {company.city}</p>
            </div>
            <Badge tone={company.lifecycle === "customer" ? "success" : "warning"}>{t(lifecycleLabels[company.lifecycle])}</Badge>
          </div>
          <dl className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <dt className="text-fg-subtle">MRR</dt>
              <dd className="font-mono text-sm text-fg tabular">{f.currency(company.mrr.amount, company.mrr.currency, { maximumFractionDigits: 0 })}</dd>
            </div>
            <div>
              <dt className="text-fg-subtle">{c("Account owner", "Hesap sorumlusu")}</dt>
              <dd className="truncate text-sm text-fg">{owner.name}</dd>
            </div>
          </dl>
          <Progress size="xs" value={company.health} tone="auto" label={<span className="text-xs text-fg-subtle">{c("Health score", "Sağlık puanı")}</span>} showValue display="fraction" max={100} />
        </div>
        <Button size="sm" variant="ghost" className="justify-self-start" onClick={() => toast(c(`Opening ${company.name}`, `${company.name} açılıyor`))}>
          <Building2 aria-hidden />
          {c("Open account", "Hesabı aç")}
        </Button>
      </section>

      <section aria-labelledby={`${idPrefix}-rel`} className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-2 border-t border-line pt-5">
        <h2 id={`${idPrefix}-rel`} className="text-xs font-medium text-fg-subtle">{c("Other tickets from this account", "Bu hesabın diğer talepleri")}</h2>
        {related.length ? (
          <ul className="grid grid-cols-[minmax(0,1fr)] gap-1">
            {related.map((r) => (
              <li key={r.id}>
                <a href={`#ticket-${r.number}`} onClick={(e) => { e.preventDefault(); toast(`#${r.number}`, { description: t(r.subject) }); }} className="grid min-w-0 gap-0.5 rounded-ui-sm px-2 py-1.5 hover:bg-hover focus-ring">
                  <span className="flex min-w-0 items-center gap-2 text-sm">
                    <span className="font-mono text-xs text-fg-subtle tabular">#{r.number}</span>
                    <span className="truncate text-fg">{t(r.subject)}</span>
                  </span>
                  <span className={cn("flex items-center gap-2 text-xs text-fg-muted")}>
                    <Badge tone={statusTone[r.status]} size="sm" dot>{t(ticketStatusLabels[r.status])}</Badge>
                    {ago(r.createdAt)}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-fg-muted">{c("No other tickets.", "Başka talep yok.")}</p>
        )}
      </section>
    </div>
  );
}
