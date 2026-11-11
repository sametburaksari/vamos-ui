"use client";

import * as React from "react";
import { toast } from "@vamos-ui/react";
import { Reveal } from "@vamos-ui/react/motion";
import { useBlockFormat } from "../../_shared/format";
import { dealStageLabels, type Deal, type DealStage } from "../../_shared/deals";
import { invoiceStatusLabels, type Invoice } from "../../_shared/finance";
import { contactsById } from "../../_shared/companies";
import { me } from "../../_shared/people";
import { day, minutesFromNow } from "../../_shared/time";
import type { Ticket } from "../../_shared/tickets";
import { AccountHeader, type AccountKpis } from "./account-header";
import { AccountTimeline } from "./account-timeline";
import { ContactsCard, DealsPanel, InvoicesPanel, TicketsPanel } from "./account-work";
import { LogCallDialog, NewDealDialog, outcomeLabel } from "./account-dialogs";
import { contacts, deals as initialDeals, initialNotes, invoices, loggedActivity, tickets as initialTickets, type HistoryEvent, type Note } from "./data";

const isOpenDeal = (d: Deal) => d.stage !== "won" && d.stage !== "lost";
const probability: Record<DealStage, number> = { discovery: 10, qualified: 25, proposal: 50, negotiation: 75, won: 100, lost: 0 };

/** History the fixtures already imply: deals opened/closed, tickets raised, invoices issued and paid. */
function derivedHistory(deals: Deal[], tickets: Ticket[], invs: Invoice[]): HistoryEvent[] {
  const out: HistoryEvent[] = [];
  for (const d of deals) {
    const name = d.title.replace(/^[^·]+· /, "");
    out.push({ id: `dc-${d.id}`, kind: "deal", at: `${d.createdDate}T10:00:00+03:00`, actorId: d.ownerId, title: { en: `Deal opened: ${name}`, tr: `Fırsat açıldı: ${name}` } });
    if (d.stage === "won") out.push({ id: `dw-${d.id}`, kind: "deal", at: `${d.closeDate}T15:30:00+03:00`, actorId: d.ownerId, title: { en: `Deal won: ${name}`, tr: `Fırsat kazanıldı: ${name}` } });
  }
  for (const tk of tickets) {
    const who = contactsById[tk.requesterId]?.name ?? "";
    out.push({ id: `tk-${tk.id}`, kind: "ticket", at: tk.createdAt, title: { en: `${who} opened #${tk.number}`, tr: `${who} #${tk.number} talebini açtı` }, body: tk.subject });
  }
  for (const inv of invs) {
    out.push({ id: `iv-${inv.id}`, kind: "invoice", at: `${inv.issueDate}T09:00:00+03:00`, actorId: "p-gizem", title: { en: `Invoice ${inv.number} issued`, tr: `${inv.number} faturası kesildi` } });
    if (inv.paidDate) out.push({ id: `ip-${inv.id}`, kind: "invoice", at: `${inv.paidDate}T12:00:00+03:00`, title: { en: `Invoice ${inv.number} paid`, tr: `${inv.number} faturası ödendi` } });
  }
  return out;
}

/**
 * Customer 360 for an at-risk account: health, revenue, pipeline, support and billing on one
 * screen, with every change written to the account history.
 */
export function Customer360() {
  const { c, t, money } = useBlockFormat();
  const [deals, setDeals] = React.useState<Deal[]>(initialDeals);
  const [tickets, setTickets] = React.useState<Ticket[]>(initialTickets);
  const [notes, setNotes] = React.useState<Note[]>(initialNotes);
  const [events, setEvents] = React.useState<HistoryEvent[]>(() => [...loggedActivity, ...derivedHistory(initialDeals, initialTickets, invoices)]);
  const [reminded, setReminded] = React.useState<Set<string>>(new Set());
  const [callOpen, setCallOpen] = React.useState(false);
  const [dealOpen, setDealOpen] = React.useState(false);
  const seq = React.useRef(0);
  const nextId = (p: string) => `${p}-${++seq.current}`;
  const log = (e: Omit<HistoryEvent, "id" | "at">) => setEvents((all) => [{ ...e, id: nextId("ev"), at: minutesFromNow(0) }, ...all]);

  const kpis: AccountKpis = React.useMemo(() => {
    const openDeals = deals.filter(isOpenDeal);
    const active = tickets.filter((tk) => tk.status !== "solved" && tk.status !== "closed");
    const next = [...active].sort((a, b) => a.resolveDue.localeCompare(b.resolveDue))[0];
    const outstandingInv = invoices.filter((i) => i.status !== "paid" && i.status !== "void");
    return {
      openDeals: openDeals.length,
      pipelineOpen: openDeals.reduce((s, d) => s + Number(d.amount.amount), 0),
      pipelineWeighted: Math.round(openDeals.reduce((s, d) => s + (Number(d.amount.amount) * d.probability) / 100, 0)),
      openTickets: active.length,
      nextDue: next ? { due: next.resolveDue, start: next.createdAt } : undefined,
      outstanding: outstandingInv.reduce((s, i) => s + Number(i.balance.amount), 0),
      overdueCount: outstandingInv.filter((i) => i.status === "overdue").length,
    };
  }, [deals, tickets]);

  const changeStage = (id: string, stage: DealStage) => {
    const deal = deals.find((d) => d.id === id);
    if (!deal || deal.stage === stage) return;
    const before = deal.stage;
    setDeals((all) => all.map((d) => (d.id === id ? { ...d, stage, probability: probability[stage], stageAge: 0, closeDate: isOpenDeal({ ...d, stage }) ? d.closeDate : day(0) } : d)));
    const name = deal.title.replace(/^[^·]+· /, "");
    log({ kind: "deal", actorId: me.id, title: { en: `${name}: ${dealStageLabels[before].en} → ${dealStageLabels[stage].en}`, tr: `${name}: ${dealStageLabels[before].tr} → ${dealStageLabels[stage].tr}` } });
    toast.success(c(`Moved to ${dealStageLabels[stage].en}`, `${dealStageLabels[stage].tr} aşamasına taşındı`), {
      description: name,
      action: {
        label: c("Undo", "Geri al"),
        onClick: () => setDeals((all) => all.map((d) => (d.id === id ? { ...d, stage: before, probability: probability[before], closeDate: deal.closeDate } : d))),
      },
    });
  };

  const assignToMe = (id: string) => {
    const tk = tickets.find((x) => x.id === id)!;
    setTickets((all) => all.map((x) => (x.id === id ? { ...x, assigneeId: me.id } : x)));
    log({ kind: "ticket", actorId: me.id, title: { en: `${me.name} took #${tk.number}`, tr: `${me.name} #${tk.number} talebini üstlendi` } });
    toast.success(c(`#${tk.number} is yours`, `#${tk.number} size atandı`));
  };

  const remind = (inv: Invoice) => {
    setReminded((s) => new Set(s).add(inv.id));
    const to = contacts.find((ct) => ct.id === "ct-lodestar-fin")!;
    log({ kind: "invoice", actorId: me.id, title: { en: `Payment reminder for ${inv.number} sent to ${to.name}`, tr: `${inv.number} için ödeme hatırlatması ${to.name} kişisine gönderildi` }, body: { en: `${money(inv.balance)} · ${invoiceStatusLabels[inv.status].en}`, tr: `${money(inv.balance)} · ${invoiceStatusLabels[inv.status].tr}` } });
    toast.success(c("Reminder sent", "Hatırlatma gönderildi"), { description: `${inv.number} → ${to.email}` });
  };

  const addNote = (text: string) => {
    const id = nextId("n");
    setNotes((all) => [{ id, authorId: me.id, at: minutesFromNow(0), body: { en: text, tr: text }, status: "saving" }, ...all]);
    window.setTimeout(() => {
      setNotes((all) => all.map((n) => (n.id === id ? { ...n, status: undefined } : n)));
      toast.success(c("Note saved", "Not kaydedildi"));
    }, 700);
  };

  const togglePin = (id: string) => setNotes((all) => all.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n)));

  return (
    <div className="mx-auto grid w-full max-w-[1520px] gap-(--gap)">
      <AccountHeader kpis={kpis} onLogCall={() => setCallOpen(true)} onNewDeal={() => setDealOpen(true)} />

      <div className="grid items-start gap-(--gap) xl:grid-cols-[minmax(0,1fr)_minmax(360px,420px)]">
        <div className="grid min-w-0 gap-(--gap)">
          <Reveal effect="fade">
            <DealsPanel deals={deals} onStageChange={changeStage} />
          </Reveal>
          <div className="grid min-w-0 gap-(--gap) 2xl:grid-cols-2">
            <Reveal effect="fade" delay={60} className="min-w-0">
              <TicketsPanel tickets={tickets} onAssign={assignToMe} />
            </Reveal>
            <Reveal effect="fade" delay={120} className="min-w-0">
              <InvoicesPanel invoices={invoices} reminded={reminded} onRemind={remind} />
            </Reveal>
          </div>
        </div>
        <div className="grid min-w-0 gap-(--gap)">
          <ContactsCard />
          <AccountTimeline events={events} notes={notes} onAddNote={addNote} onTogglePin={togglePin} />
        </div>
      </div>

      <LogCallDialog
        open={callOpen}
        onOpenChange={setCallOpen}
        onSave={(l) => {
          const ct = contacts.find((x) => x.id === l.contactId)!;
          const o = outcomeLabel(l.outcome);
          log({ kind: "call", actorId: me.id, title: { en: `Call with ${ct.name} · ${o.en}`, tr: `${ct.name} ile görüşme · ${o.tr}` }, body: l.summary ? { en: l.summary, tr: l.summary } : undefined });
          setCallOpen(false);
          toast.success(c("Call logged", "Görüşme kaydedildi"));
        }}
      />
      <NewDealDialog
        open={dealOpen}
        onOpenChange={setDealOpen}
        onCreate={(d) => {
          const id = nextId("deal");
          setDeals((all) => [
            { id, title: `Lodestar Freight · ${d.title}`, companyId: "c-lodestar", ownerId: me.id, stage: d.stage, amount: { amount: d.amount, currency: "TRY" }, probability: probability[d.stage], createdDate: day(0), closeDate: day(45), stageAge: 0 },
            ...all,
          ]);
          log({ kind: "deal", actorId: me.id, title: { en: `Deal opened: ${d.title}`, tr: `Fırsat açıldı: ${d.title}` } });
          setDealOpen(false);
          toast.success(c("Deal created", "Fırsat oluşturuldu"), { description: `${d.title} · ${t(dealStageLabels[d.stage])}` });
        }}
      />
    </div>
  );
}
