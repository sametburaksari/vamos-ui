"use client";

import * as React from "react";
import { Headset } from "lucide-react";
import { Avatar, DialogTitle, Sheet, SheetContent, Switch, cn, toast } from "@vamos-ui/react";
import { CountUp } from "@vamos-ui/react/motion";
import { csatTrend } from "../../_shared/tickets";
import { useBlockFormat } from "../../_shared/format";
import { person } from "../../_shared/people";
import { Conversation, type OutgoingMessage } from "./conversation";
import { CustomerPanel } from "./customer-panel";
import { QueueRail } from "./queue-rail";
import { TicketList, type SortKey } from "./ticket-list";
import { activeSla, agent, atRisk, initialTickets, isOpen, nowIso, queues, queueTest, requester, companyOf, threadFor, views, type Ticket, type TicketStatus, type ViewKey } from "./data";

/**
 * Three-pane support desk: views and queues · ticket list · conversation (+ customer context on
 * very wide screens). Tablets fold the views into a sheet; phones show one pane at a time.
 */
export function SupportDesk() {
  const { t, c } = useBlockFormat();
  const [tickets, setTickets] = React.useState<Ticket[]>(initialTickets);
  const [threads, setThreads] = React.useState<Record<string, OutgoingMessage[]>>({});
  const [view, setView] = React.useState<ViewKey>("all");
  const [query, setQuery] = React.useState("");
  const [sort, setSort] = React.useState<SortKey>("sla");
  const [checked, setChecked] = React.useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = React.useState<string | null>("t-4814");
  const [mobilePane, setMobilePane] = React.useState<"list" | "conversation">("list");
  const [viewsOpen, setViewsOpen] = React.useState(false);
  const [available, setAvailable] = React.useState(true);

  const viewDef = view.startsWith("queue:") ? null : views.find((v) => v.key === view)!;
  const queueKey = view.startsWith("queue:") ? (view.slice(6) as Ticket["queue"]) : null;
  const title = viewDef ? t(viewDef.label) : t(queues.find((q) => q.key === queueKey)!.label);
  const test = viewDef ? viewDef.test : queueTest(queueKey!);

  const q = query.trim().toLowerCase().replace(/^#/, "");
  const visible = tickets
    .filter(test)
    .filter((x) => !q || String(x.number).includes(q) || t(x.subject).toLowerCase().includes(q) || requester(x).name.toLowerCase().includes(q) || companyOf(x).name.toLowerCase().includes(q))
    .sort((a, b) => (sort === "sla" ? Date.parse(activeSla(a).due) - Date.parse(activeSla(b).due) : Date.parse(b.createdAt) - Date.parse(a.createdAt)));

  const selected = tickets.find((x) => x.id === selectedId) ?? null;
  const messages = selected ? (threads[selected.id] ?? threadFor(selected)) : [];

  const patch = (ids: string[], fn: (t: Ticket) => Partial<Ticket>) => setTickets((all) => all.map((x) => (ids.includes(x.id) ? { ...x, ...fn(x) } : x)));
  const snapshot = (ids: string[]) => {
    const before = tickets.filter((x) => ids.includes(x.id));
    return () => setTickets((all) => all.map((x) => before.find((b) => b.id === x.id) ?? x));
  };

  const select = (id: string) => {
    setSelectedId(id);
    setMobilePane("conversation");
    patch([id], () => ({ unread: false }));
  };

  const setStatus = (ids: string[], status: TicketStatus) => {
    const undo = snapshot(ids);
    const at = nowIso();
    patch(ids, (x) => ({ status, updatedAt: at, solvedAt: status === "solved" ? at : undefined, assigneeId: x.assigneeId ?? (status === "solved" ? agent.id : undefined) }));
    if (status === "solved") {
      toast.success(ids.length > 1 ? c(`${ids.length} tickets solved`, `${ids.length} talep çözüldü`) : c(`Ticket #${tickets.find((x) => x.id === ids[0])?.number} solved`, `#${tickets.find((x) => x.id === ids[0])?.number} çözüldü`), {
        description: c("The customer gets a satisfaction survey in 24 hours.", "Müşteriye 24 saat içinde memnuniyet anketi gider."),
        action: { label: c("Undo", "Geri al"), onClick: undo },
      });
    }
  };

  const assign = (ids: string[], id: string | null) => {
    const undo = snapshot(ids);
    patch(ids, (x) => ({ assigneeId: id ?? undefined, status: x.status === "new" && id ? "open" : x.status }));
    const name = id ? person(id).name : c("nobody", "kimse");
    toast(ids.length > 1 ? c(`${ids.length} tickets assigned to ${name}`, `${ids.length} talep ${name} kişisine atandı`) : c(`Assigned to ${name}`, `${name} kişisine atandı`), { action: { label: c("Undo", "Geri al"), onClick: undo } });
  };

  const send = (body: string, mode: "reply" | "internal-note", solve: boolean) => {
    if (!selected) return;
    const id = `local-${Date.now()}`;
    const msg: OutgoingMessage = { id, ticketId: selected.id, authorId: agent.id, kind: mode, at: nowIso(), body: { en: body, tr: body }, pending: true };
    const base = threads[selected.id] ?? threadFor(selected);
    setThreads((all) => ({ ...all, [selected.id]: [...base, msg] }));
    if (mode === "reply") patch([selected.id], (x) => ({ firstRespondedAt: x.firstRespondedAt ?? nowIso(), status: solve ? x.status : x.status === "new" ? "open" : x.status, assigneeId: x.assigneeId ?? agent.id }));
    // Optimistic: the message shows at once and settles when the "server" answers.
    window.setTimeout(() => {
      setThreads((all) => ({ ...all, [selected.id]: (all[selected.id] ?? []).map((m) => (m.id === id ? { ...m, pending: false } : m)) }));
      if (mode === "reply") toast.success(c(`Reply sent to ${requester(selected).name}`, `Yanıt ${requester(selected).name} kişisine gönderildi`));
      else toast(c("Internal note added", "İç not eklendi"));
    }, 700);
    if (solve) setStatus([selected.id], "solved");
  };

  const openCount = tickets.filter(isOpen).length;
  const riskCount = tickets.filter(atRisk).length;

  return (
    <div className="relative z-10 flex h-dvh flex-col">
      <header className="flex h-12 shrink-0 items-center gap-3 border-b border-line bg-surface px-3 md:px-4">
        <span className="grid size-7 place-items-center rounded-ui-sm bg-fg text-scene" aria-hidden>
          <Headset className="size-4" />
        </span>
        <p className="min-w-0 truncate text-[13px]">
          <span className="font-semibold">Kiln & Linen</span>
          <span className="text-fg-muted"> / {c("Support", "Destek")}</span>
        </p>
        <dl className="ms-4 hidden items-center gap-5 text-xs text-fg-muted lg:flex" aria-label={c("Desk pulse", "Masa özeti")}>
          <div className="flex items-baseline gap-1.5">
            <dt>{c("Open", "Açık")}</dt>
            <dd className="font-semibold text-fg tabular"><CountUp value={openCount} duration={700} /></dd>
          </div>
          <div className="flex items-baseline gap-1.5">
            <dt>{c("At risk", "Riskte")}</dt>
            <dd className={cn("font-semibold tabular", riskCount ? "text-danger" : "text-fg")}><CountUp value={riskCount} duration={700} /></dd>
          </div>
          <div className="flex items-baseline gap-1.5">
            <dt>{c("CSAT, this week", "Bu hafta CSAT")}</dt>
            <dd className="font-semibold text-fg tabular"><CountUp value={csatTrend.at(-1)!} duration={900} />%</dd>
          </div>
        </dl>
        <div className="ms-auto flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-fg-muted">
            <span className="hidden sm:inline">{available ? c("Taking tickets", "Talep alıyor") : c("Paused", "Duraklatıldı")}</span>
            <Switch size="sm" checked={available} onCheckedChange={(v) => { setAvailable(v); toast(v ? c("You're back in the rotation", "Atama sırasına geri döndünüz") : c("New tickets won't be routed to you", "Yeni talepler size yönlendirilmeyecek")); }} aria-label={c("Available for new tickets", "Yeni taleplere açık")} />
          </label>
          <Avatar name={agent.name} size="sm" status={available ? "online" : "away"} />
        </div>
      </header>

      <div className="grid min-h-0 flex-1 md:grid-cols-[minmax(300px,360px)_1fr] lg:grid-cols-[220px_minmax(320px,380px)_1fr] 2xl:grid-cols-[232px_400px_1fr_320px]">
        <QueueRail className="hidden lg:flex" tickets={tickets} view={view} onView={(v) => { setView(v); setChecked(new Set()); }} />
        <TicketList
          className={cn(mobilePane === "conversation" && "max-md:hidden")}
          title={title}
          tickets={visible}
          selectedId={selectedId}
          onSelect={select}
          checked={checked}
          onCheckedChange={setChecked}
          query={query}
          onQuery={setQuery}
          sort={sort}
          onSort={setSort}
          onBulkAssign={(id) => { assign([...checked], id); setChecked(new Set()); }}
          onBulkSolve={() => { setStatus([...checked], "solved"); setChecked(new Set()); }}
          onOpenViews={() => setViewsOpen(true)}
        />
        {selected ? (
          <>
            <Conversation
              className={cn(mobilePane === "list" && "max-md:hidden")}
              ticket={selected}
              messages={messages}
              onBack={() => setMobilePane("list")}
              onSend={send}
              onStatus={(s) => setStatus([selected.id], s)}
              onAssign={(id) => assign([selected.id], id)}
            />
            <CustomerPanel className="hidden 2xl:block" ticket={selected} tickets={tickets} onSelect={select} />
          </>
        ) : (
          <div className="hidden place-items-center text-fg-muted md:grid">{c("Pick a ticket to read it.", "Okumak için bir talep seçin.")}</div>
        )}
      </div>

      <Sheet open={viewsOpen} onOpenChange={setViewsOpen}>
        <SheetContent side="start" size="sm" hideClose className="max-w-[86vw] border-0 p-0">
          <DialogTitle className="sr-only">{c("Views and queues", "Görünümler ve kuyruklar")}</DialogTitle>
          <QueueRail
            className="h-full"
            tickets={tickets}
            view={view}
            onView={(v) => { setView(v); setChecked(new Set()); setViewsOpen(false); setMobilePane("list"); }}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
