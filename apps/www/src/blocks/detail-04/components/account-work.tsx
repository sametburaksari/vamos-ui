"use client";

import * as React from "react";
import { ArrowUpRight, BellRing, Check, ChevronRight, Mail, MessageSquare, Phone, UserPlus } from "lucide-react";
import {
  Avatar, Badge, Button, Card, CardBody, CardHeader, DescriptionList, Progress,
  Select, Sheet, SheetBody, SheetContent, SheetFooter, SheetHeader, SlaTimer,
} from "@vamos-ui/react";
import { Stagger } from "@vamos-ui/react/motion";
import { useBlockFormat } from "../../_shared/format";
import { dealStages, dealStageLabels, type Deal, type DealStage } from "../../_shared/deals";
import { priorityLabels, queues, ticketStatusLabels, type Ticket } from "../../_shared/tickets";
import { ageingBucket, ageingLabels, invoiceStatusLabels, invoiceStatusTone, type AgeingBucket, type Invoice } from "../../_shared/finance";
import { contactsById } from "../../_shared/companies";
import { person } from "../../_shared/people";
import { NOW_MS, TODAY, daysBetween } from "../../_shared/time";
import { contacts } from "./data";

const open = (d: Deal) => d.stage !== "won" && d.stage !== "lost";

/* ------------------------------------------------------------------ */
/* Deals                                                               */
/* ------------------------------------------------------------------ */

export function DealsPanel({ deals, onStageChange }: { deals: Deal[]; onStageChange: (id: string, stage: DealStage) => void }) {
  const { c, t, f, money } = useBlockFormat();
  const stageItems = dealStages.map((s) => ({ value: s.key, label: t(s.label) }));
  const sorted = [...deals].sort((a, b) => Number(open(b)) - Number(open(a)) || b.closeDate.localeCompare(a.closeDate));

  return (
    <Card>
      <CardHeader
          title={<>{c("Deals", "Fırsatlar")}</>}
          description={<>{c("Move a deal by changing its stage — the timeline records it.", "Aşamayı değiştirerek fırsatı ilerletin; zaman akışına işlenir.")}</>}
        />
      <CardBody className="p-0">
        <Stagger asChild step={50}>
          <ul className="divide-y divide-line border-t border-line">
            {sorted.map((d) => {
              const isOpen = open(d);
              const days = daysBetween(TODAY, d.closeDate);
              return (
                <li key={d.id} className="grid gap-3 px-(--card-p) py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                  <div className="grid min-w-0 gap-1">
                    <p className="truncate font-medium text-fg">{d.title.replace(/^[^·]+· /, "")}</p>
                    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-small text-fg-muted">
                      <span className="font-medium text-fg tabular">{money(d.amount, { whole: true })}</span>
                      <span>
                        {isOpen
                          ? days >= 0
                            ? c(`Closes ${f.date(d.closeDate, "medium")} · in ${days} days`, `Kapanış ${f.date(d.closeDate, "medium")} · ${days} gün sonra`)
                            : c(`Close date passed ${-days} days ago`, `Kapanış tarihi ${-days} gün önce geçti`)
                          : c(`Closed ${f.date(d.closeDate, "medium")}`, `Kapandı ${f.date(d.closeDate, "medium")}`)}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Avatar name={person(d.ownerId).name} size="xs" /> {person(d.ownerId).name}
                      </span>
                    </p>
                    {isOpen ? (
                      <Progress className="mt-1 max-w-64" size="xs" value={d.probability} label={<span className="sr-only">{c("Win probability", "Kazanma olasılığı")}</span>} valueText={`${d.probability}%`} />
                    ) : null}
                  </div>
                  <div className="flex items-center gap-3 sm:justify-end">
                    {isOpen ? <span className="text-small text-fg-subtle tabular">{d.probability}%</span> : null}
                    {isOpen ? (
                      <Select
                        size="sm"
                        aria-label={c(`Stage of ${d.title}`, `${d.title} aşaması`)}
                        value={d.stage}
                        onValueChange={(v) => v && onStageChange(d.id, v as DealStage)}
                        items={stageItems}
                        className="w-44"
                      />
                    ) : (
                      <Badge tone={d.stage === "won" ? "success" : "neutral"} dot>{t(dealStageLabels[d.stage])}</Badge>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </Stagger>
      </CardBody>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Tickets                                                             */
/* ------------------------------------------------------------------ */

const priorityTone = { low: "neutral", normal: "info", high: "warning", urgent: "danger" } as const;
const isActive = (tk: Ticket) => tk.status !== "solved" && tk.status !== "closed";

export function TicketsPanel({ tickets, onAssign }: { tickets: Ticket[]; onAssign: (id: string) => void }) {
  const { c, t, ago } = useBlockFormat();
  const [openId, setOpenId] = React.useState<string | null>(null);
  const current = tickets.find((tk) => tk.id === openId) ?? null;
  const sorted = [...tickets].sort((a, b) => Number(isActive(b)) - Number(isActive(a)) || b.createdAt.localeCompare(a.createdAt));

  return (
    <Card>
      <CardHeader
          title={<>{c("Support", "Destek")}</>}
          description={<>{c("Every ticket from anyone at this company.", "Bu şirketten gelen tüm talepler.")}</>}
        />
      <CardBody className="p-0">
        <ul className="divide-y divide-line border-t border-line">
          {sorted.map((tk) => {
            const requester = contactsById[tk.requesterId];
            return (
              <li key={tk.id}>
                <button
                  type="button"
                  onClick={() => setOpenId(tk.id)}
                  className="focus-ring grid w-full gap-1.5 px-(--card-p) py-3.5 text-start hover:bg-hover sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-4"
                >
                  <span className="grid min-w-0 gap-1">
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="shrink-0 font-mono text-small text-fg-subtle">#{tk.number}</span>
                      <span className={`truncate ${isActive(tk) ? "font-medium text-fg" : "text-fg-muted"}`}>{t(tk.subject)}</span>
                    </span>
                    <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-small text-fg-muted">
                      <span>{requester?.name}</span>
                      <span>{ago(tk.createdAt)}</span>
                      <Badge size="sm" tone={priorityTone[tk.priority]}>{t(priorityLabels[tk.priority])}</Badge>
                    </span>
                  </span>
                  <span className="flex items-center gap-3 sm:justify-end">
                    {isActive(tk) ? (
                      <SlaTimer variant="badge" due={tk.resolveDue} start={tk.createdAt} now={NOW_MS} label={c("Resolve", "Çözüm")} />
                    ) : (
                      <Badge tone="neutral">{t(ticketStatusLabels[tk.status])}</Badge>
                    )}
                    {tk.assigneeId ? <Avatar name={person(tk.assigneeId).name} size="xs" /> : <span className="text-small text-warning">{c("Unassigned", "Atanmadı")}</span>}
                    <ChevronRight className="size-4 text-fg-subtle rtl:rotate-180" aria-hidden />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </CardBody>

      <Sheet open={!!current} onOpenChange={(o) => !o && setOpenId(null)}>
        <SheetContent size="md">
          {current ? (
            <>
              <SheetHeader title={t(current.subject)} description={`#${current.number} · ${t(queues.find((q) => q.key === current.queue)!.label)}`} />
              <SheetBody className="grid content-start gap-6">
                <div className="flex flex-wrap gap-2">
                  <Badge tone={priorityTone[current.priority]}>{t(priorityLabels[current.priority])}</Badge>
                  <Badge tone="outline">{t(ticketStatusLabels[current.status])}</Badge>
                  {current.tags.map((tag) => (
                    <Badge key={tag} tone="neutral">{tag}</Badge>
                  ))}
                </div>
                {isActive(current) ? (
                  <div className="grid gap-4">
                    <SlaTimer variant="bar" due={current.firstResponseDue} start={current.createdAt} completedAt={current.firstRespondedAt} now={NOW_MS} label={c("First response", "İlk yanıt")} />
                    <SlaTimer variant="bar" due={current.resolveDue} start={current.createdAt} now={NOW_MS} label={c("Resolution", "Çözüm")} />
                  </div>
                ) : null}
                <DescriptionList
                  layout="horizontal"
                  size="sm"
                  items={[
                    { key: "req", label: c("Requester", "Talep eden"), value: contactsById[current.requesterId]?.name },
                    { key: "ch", label: c("Channel", "Kanal"), value: current.channel },
                    { key: "as", label: c("Assignee", "Atanan"), value: current.assigneeId ? person(current.assigneeId).name : c("Nobody yet", "Henüz kimse") },
                    { key: "op", label: c("Opened", "Açıldı"), value: ago(current.createdAt) },
                  ]}
                />
              </SheetBody>
              <SheetFooter>
                <Button asChild variant="ghost">
                  <a href={`#ticket-${current.number}`}>
                    <ArrowUpRight /> {c("Open in Support", "Destekte aç")}
                  </a>
                </Button>
                {isActive(current) && current.assigneeId !== "p-defne" ? (
                  <Button variant="primary" onClick={() => onAssign(current.id)}>
                    <UserPlus /> {c("Assign to me", "Bana ata")}
                  </Button>
                ) : null}
              </SheetFooter>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Invoices                                                            */
/* ------------------------------------------------------------------ */

const bucketTone: Record<AgeingBucket, string> = { current: "bg-success", "1-30": "bg-warning", "31-60": "bg-warning", "61-90": "bg-danger", "90+": "bg-danger" };

export function InvoicesPanel({ invoices, reminded, onRemind }: { invoices: Invoice[]; reminded: Set<string>; onRemind: (inv: Invoice) => void }) {
  const { c, t, f, money } = useBlockFormat();
  const openInv = invoices.filter((i) => Number(i.balance.amount) > 0 && i.status !== "void");
  const buckets = openInv.reduce<Partial<Record<AgeingBucket, number>>>((acc, i) => {
    const b = ageingBucket(i);
    acc[b] = (acc[b] ?? 0) + Number(i.balance.amount);
    return acc;
  }, {});
  const totalOpen = Object.values(buckets).reduce((s, v) => s + (v ?? 0), 0);
  const paid12 = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + Number(i.amount.amount), 0);

  return (
    <Card>
      <CardHeader
          title={<>{c("Billing", "Faturalama")}</>}
          description={<>{c(`${money({ amount: String(paid12), currency: "TRY" }, { whole: true })} collected · ${openInv.length} open`, `${money({ amount: String(paid12), currency: "TRY" }, { whole: true })} tahsil edildi · ${openInv.length} açık`)}</>}
          action={<><Button size="sm" variant="ghost" asChild>
            <a href="#statement">
              <Mail /> {c("Email statement", "Ekstre gönder")}
            </a>
          </Button></>}
        />
      <CardBody className="grid gap-4 p-0">
        {totalOpen > 0 ? (
          <div className="grid gap-2 px-(--card-p)">
            <div className="flex h-2 overflow-hidden rounded-full bg-track" role="img" aria-label={c("Open balance by age", "Yaşa göre açık bakiye")}>
              {(Object.keys(buckets) as AgeingBucket[]).map((b) => (
                <span key={b} className={bucketTone[b]} style={{ width: `${((buckets[b] ?? 0) / totalOpen) * 100}%` }} />
              ))}
            </div>
            <ul className="flex flex-wrap gap-x-4 gap-y-1 text-small text-fg-muted">
              {(Object.keys(buckets) as AgeingBucket[]).map((b) => (
                <li key={b} className="inline-flex items-center gap-1.5">
                  <span className={`size-2 rounded-full ${bucketTone[b]}`} aria-hidden />
                  {t(ageingLabels[b])} <span className="text-fg tabular">{money({ amount: String(buckets[b]), currency: "TRY" }, { whole: true })}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <div className="relative overflow-x-auto border-t border-line">
          <table className="w-full text-small whitespace-nowrap sm:min-w-[540px]">
            <caption className="sr-only">{c("Invoices for this account", "Bu hesabın faturaları")}</caption>
            <thead className="text-start text-fg-subtle">
              <tr className="[&>th]:px-(--card-p) [&>th]:py-2.5 [&>th]:text-start [&>th]:font-normal max-sm:[&>th]:px-2 max-sm:[&>th:first-child]:ps-(--card-p)">
                <th scope="col">{c("Invoice", "Fatura")}</th>
                <th scope="col" className="max-sm:hidden">{c("Due", "Vade")}</th>
                <th scope="col" className="text-end!">{c("Amount", "Tutar")}</th>
                <th scope="col" className="max-sm:hidden">{c("Status", "Durum")}</th>
                <th scope="col"><span className="sr-only">{c("Actions", "İşlemler")}</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line border-t border-line">
              {invoices.map((inv) => {
                const chase = inv.status === "sent" || inv.status === "overdue" || inv.status === "partially-paid";
                const done = reminded.has(inv.id);
                return (
                  <tr key={inv.id} className="[&>td]:px-(--card-p) [&>td]:py-3 max-sm:[&>td]:px-2 max-sm:[&>td:first-child]:ps-(--card-p) max-sm:[&>td:last-child]:pe-(--card-p)">
                    <td>
                      <span className="block font-mono text-fg">{inv.number}</span>
                      {/* Phones drop the Due and Status columns; both ride under the number. */}
                      <span className="mt-0.5 flex items-center gap-1.5 text-[12px] text-fg-muted sm:hidden">
                        {f.date(inv.dueDate, "medium")}
                        <Badge size="sm" tone={invoiceStatusTone[inv.status]} dot>{t(invoiceStatusLabels[inv.status])}</Badge>
                      </span>
                    </td>
                    <td className="text-fg-muted max-sm:hidden">{f.date(inv.dueDate, "medium")}</td>
                    <td className="text-end text-fg tabular">{money(inv.amount, { whole: true })}</td>
                    <td className="max-sm:hidden">
                      <Badge tone={invoiceStatusTone[inv.status]} dot>{t(invoiceStatusLabels[inv.status])}</Badge>
                    </td>
                    <td className="text-end">
                      {chase ? (
                        <Button size="sm" variant={done ? "ghost" : "secondary"} disabled={done} onClick={() => onRemind(inv)}>
                          {done ? <Check /> : <BellRing />} <span className="max-sm:sr-only">{done ? c("Reminder sent", "Hatırlatıldı") : c("Remind", "Hatırlat")}</span>
                        </Button>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardBody>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* People at the account                                               */
/* ------------------------------------------------------------------ */

export function ContactsCard() {
  const { c, t } = useBlockFormat();
  return (
    <Card>
      <CardHeader
          title={<>{c("People", "Kişiler")}</>}
          action={<><Button size="sm" variant="ghost" asChild>
            <a href="#contacts">{c("All", "Tümü")}</a>
          </Button></>}
        />
      <CardBody className="p-0">
        <ul className="divide-y divide-line border-t border-line">
          {contacts.map((ct) => (
            <li key={ct.id} className="flex items-center gap-3 px-(--card-p) py-3">
              <Avatar name={ct.name} size="sm" />
              <div className="grid min-w-0 flex-1">
                <span className="flex items-center gap-2 truncate font-medium text-fg">
                  {ct.name}
                  {ct.primary ? <Badge size="sm" tone="accent">{c("Primary", "Birincil")}</Badge> : null}
                </span>
                <span className="truncate text-small text-fg-muted">{t(ct.title)}</span>
              </div>
              <Button size="icon-sm" variant="ghost" asChild>
                <a href={`mailto:${ct.email}`} aria-label={c(`Email ${ct.name}`, `${ct.name} kişisine e-posta`)}>
                  <MessageSquare />
                </a>
              </Button>
              <Button size="icon-sm" variant="ghost" asChild>
                <a href="tel:+902160000045" aria-label={c(`Call ${ct.name}`, `${ct.name} kişisini ara`)}>
                  <Phone />
                </a>
              </Button>
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  );
}
