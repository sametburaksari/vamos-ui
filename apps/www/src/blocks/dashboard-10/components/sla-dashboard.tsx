"use client";

import * as React from "react";
import { Radio } from "lucide-react";
import { Badge, Button, PageHeader, ToggleGroup, ToggleGroupItem, toast } from "@vamos-ui/react";
import { useBlockFormat } from "../../_shared/format";
import { tickets as seed } from "../../_shared/tickets";
import { BreachWatch } from "./breach-watch";
import { ArrivalsCard, CsatCard } from "./arrivals-csat";
import { DeadlineHorizon } from "./deadline-horizon";
import { AgentsCard, QueueHealth } from "./queue-health";
import { NOW, isActive, nextPriority, queues, type QueueKey, type Ticket } from "./data";

export type QueueFilter = QueueKey | "all";

/** Support SLA: what breaches next, queue health, who is carrying the load, arrivals and CSAT. */
export function SlaDashboard() {
  const { f, t, c } = useBlockFormat();
  const [all, setAll] = React.useState<Ticket[]>(seed);
  const [queue, setQueue] = React.useState<QueueFilter>("all");
  const [focusId, setFocusId] = React.useState<string | null>(null);

  const active = all.filter(isActive);
  const inQueue = queue === "all" ? active : active.filter((x) => x.queue === queue);

  /** Optimistic update with undo: the change shows at once, the toast can put it back. */
  const patch = (ids: string[], change: (t: Ticket) => Partial<Ticket>, message: string, description?: string) => {
    const before = all.filter((x) => ids.includes(x.id));
    setAll((list) => list.map((x) => (ids.includes(x.id) ? { ...x, ...change(x) } : x)));
    toast.success(message, {
      description,
      action: { label: c("Undo", "Geri al"), onClick: () => setAll((list) => list.map((x) => before.find((b) => b.id === x.id) ?? x)) },
    });
  };

  const assign = (ids: string[], agentId: string, agentName: string) =>
    patch(
      ids,
      (x) => ({ assigneeId: agentId, status: x.status === "new" ? "open" : x.status, updatedAt: NOW }),
      ids.length === 1 ? c(`Assigned to ${agentName}`, `${agentName} kişisine atandı`) : c(`${ids.length} tickets assigned to ${agentName}`, `${ids.length} talep ${agentName} kişisine atandı`),
    );
  const escalate = (ids: string[]) =>
    patch(
      ids,
      (x) => ({ priority: nextPriority[x.priority], updatedAt: NOW }),
      ids.length === 1 ? c("Priority raised", "Öncelik yükseltildi") : c(`${ids.length} tickets escalated`, `${ids.length} talep yükseltildi`),
      c("The SLA target stays; the ticket moves up in every queue.", "SLA hedefi değişmez; talep tüm kuyruklarda öne çıkar."),
    );
  const reply = (id: string, number: number) =>
    patch([id], (x) => ({ firstRespondedAt: NOW, status: "open", updatedAt: NOW, unread: false, assigneeId: x.assigneeId ?? "p-kerem" }), c(`First reply sent on #${number}`, `#${number} için ilk yanıt gönderildi`), c("The clock now counts towards resolution.", "Saat artık çözüm hedefine göre işliyor."));

  const counts = Object.fromEntries(queues.map((q) => [q.key, active.filter((x) => x.queue === q.key).length])) as Record<QueueKey, number>;

  return (
    <div className="mx-auto max-w-[1360px]">
      <PageHeader
        size="lg"
        eyebrow={c(`Support · ${f.date(NOW, { weekday: "long", month: "long", day: "numeric" })}`, `Destek · ${f.date(NOW, { weekday: "long", month: "long", day: "numeric" })}`)}
        title={c("Service levels", "Hizmet seviyeleri")}
        description={c("Which tickets miss their target next, and who can take them.", "Hangi talepler hedefini ilk kaçıracak ve onları kim alabilir.")}
        meta={
          <Badge tone="success" shape="square" className="gap-1.5">
            <Radio aria-hidden />
            {c("Live", "Canlı")} · {f.dateTime(NOW, { timeStyle: "short", timeZone: "Europe/Istanbul" })}
          </Badge>
        }
        actions={
          <Button variant="secondary" onClick={() => toast(c("SLA report scheduled", "SLA raporu planlandı"), { description: c("Every Monday 09:00 to support-leads@example.com", "Her pazartesi 09:00'da support-leads@example.com adresine") })}>
            {c("Weekly report", "Haftalık rapor")}
          </Button>
        }
      />

      <div className="-mx-1 mb-(--gap) overflow-x-auto px-1 pb-1">
        <ToggleGroup aria-label={c("Queue", "Kuyruk")} size="sm" value={queue} onValueChange={(v) => v && setQueue(v as QueueFilter)}>
          <ToggleGroupItem value="all">
            {c("All queues", "Tüm kuyruklar")} <span className="font-mono text-fg-subtle tabular">{active.length}</span>
          </ToggleGroupItem>
          {queues.map((q) => (
            <ToggleGroupItem key={q.key} value={q.key}>
              {t(q.label)} <span className="font-mono text-fg-subtle tabular">{counts[q.key]}</span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <DeadlineHorizon tickets={inQueue} all={queue === "all" ? all : all.filter((x) => x.queue === queue)} focusId={focusId} onFocus={setFocusId} />

      <div className="mt-(--gap) grid gap-(--gap) xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,1fr)]">
        <BreachWatch tickets={inQueue} focusId={focusId} onFocus={setFocusId} onAssign={assign} onEscalate={escalate} onReply={reply} />
        <div className="grid min-w-0 content-start gap-(--gap) md:max-xl:grid-cols-2">
          <QueueHealth active={active} queue={queue} onQueue={setQueue} />
          <AgentsCard active={active} />
        </div>
      </div>

      <div className="mt-(--gap) grid gap-(--gap) lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <ArrivalsCard />
        <CsatCard />
      </div>
    </div>
  );
}
