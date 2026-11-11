"use client";

import { Building2, Mail, Phone } from "lucide-react";
import { Avatar, Badge, Progress, cn } from "@vamos-ui/react";
import { planLabels } from "../../_shared/companies";
import { useBlockFormat } from "../../_shared/format";
import { person } from "../../_shared/people";
import { companyOf, requester, ticketStatusLabels, type Ticket } from "./data";

/** Fourth column on very wide screens: who is asking, their account and their other tickets. */
export function CustomerPanel({ ticket, tickets, onSelect, className }: { ticket: Ticket; tickets: Ticket[]; onSelect: (id: string) => void; className?: string }) {
  const { t, c, money, f, ago } = useBlockFormat();
  const who = requester(ticket);
  const co = companyOf(ticket);
  const others = tickets.filter((x) => x.companyId === co.id && x.id !== ticket.id).slice(0, 5);
  const solved = tickets.filter((x) => x.companyId === co.id && x.csat);
  const csat = solved.length ? solved.reduce((s, x) => s + (x.csat ?? 0), 0) / solved.length : null;

  return (
    <aside aria-label={c("Customer", "Müşteri")} className={cn("min-h-0 overflow-y-auto border-s border-line bg-surface px-5 py-5", className)}>
      <div className="flex items-center gap-3">
        <Avatar name={who.name} size="lg" />
        <div className="min-w-0">
          <p className="truncate font-semibold">{who.name}</p>
          <p className="truncate text-xs text-fg-muted">{t(who.title)}</p>
        </div>
      </div>
      <ul className="mt-4 grid gap-2 text-[13px] text-fg-muted [&_svg]:size-3.5 [&_svg]:shrink-0">
        <li className="flex items-center gap-2"><Mail /><span className="truncate">{who.email}</span></li>
        <li className="flex items-center gap-2"><Phone /><span className="tabular">{co.phone}</span></li>
        <li className="flex items-center gap-2"><Building2 /><span className="truncate">{co.name} · {co.city}</span></li>
      </ul>

      <dl className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-ui border border-line bg-line text-[13px]">
        <div className="bg-surface-2 px-3 py-2.5">
          <dt className="text-xs text-fg-muted">{c("Plan", "Paket")}</dt>
          <dd className="mt-0.5 font-medium">{t(planLabels[co.plan])}</dd>
        </div>
        <div className="bg-surface-2 px-3 py-2.5">
          <dt className="text-xs text-fg-muted">MRR</dt>
          <dd className="mt-0.5 font-medium tabular">{money(co.mrr, { whole: true })}</dd>
        </div>
        <div className="bg-surface-2 px-3 py-2.5">
          <dt className="text-xs text-fg-muted">{c("Customer since", "Müşteri tarihi")}</dt>
          <dd className="mt-0.5 font-medium">{f.date(co.customerSince, { month: "short", year: "numeric" })}</dd>
        </div>
        <div className="bg-surface-2 px-3 py-2.5">
          <dt className="text-xs text-fg-muted">CSAT</dt>
          <dd className="mt-0.5 font-medium tabular">{csat ? `${csat.toFixed(1)} / 5` : "—"}</dd>
        </div>
      </dl>

      <div className="mt-5">
        <Progress value={co.health} size="xs" tone="auto" label={c("Account health", "Hesap sağlığı")} showValue />
        <p className="mt-1.5 text-xs text-fg-muted">
          {c("Account owner", "Hesap sorumlusu")}: {person(co.ownerId).name}
        </p>
      </div>

      <h3 className="mt-6 text-xs font-medium tracking-[0.08em] text-fg-muted uppercase">{c("Other tickets", "Diğer talepler")}</h3>
      {others.length === 0 ? (
        <p className="mt-2 text-[13px] text-fg-muted">{c("First time this company has written in.", "Bu şirketin ilk talebi.")}</p>
      ) : (
        <ul className="mt-2 grid gap-1">
          {others.map((o) => (
            <li key={o.id}>
              <button type="button" onClick={() => onSelect(o.id)} className="w-full rounded-ui-sm px-2 py-1.5 text-start outline-none hover:bg-hover focus-ring">
                <span className="line-clamp-1 text-[13px]">{t(o.subject)}</span>
                <span className="mt-0.5 flex items-center gap-2 text-xs text-fg-muted">
                  <span className="font-mono">#{o.number}</span>
                  <Badge size="sm" tone={o.status === "solved" || o.status === "closed" ? "success" : "neutral"}>{t(ticketStatusLabels[o.status])}</Badge>
                  <span className="ms-auto">{ago(o.updatedAt)}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
