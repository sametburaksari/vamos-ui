"use client";

import * as React from "react";
import { ArrowUpToLine, Mail, MessageCircle, MessageSquareReply, Phone, Globe, Smartphone, UserPlus, X } from "lucide-react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardHeader,
  Checkbox,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  EmptyState,
  Field,
  Select,
  SlaTimer,
  Textarea,
  ToggleGroup,
  ToggleGroupItem,
  cn,
} from "@vamos-ui/react";
import { Stagger } from "@vamos-ui/react/motion";
import { useBlockFormat } from "../../_shared/format";
import { peopleById } from "../../_shared/people";
import { macros, type TicketChannel } from "../../_shared/tickets";
import { NOW_MS, agents, clockOf, companyOf, offShift, priorityLabels, priorityRank, queues, requesterOf, type Ticket } from "./data";

const channelIcon: Record<TicketChannel, React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>> = {
  email: Mail,
  chat: MessageCircle,
  phone: Phone,
  "web-form": Globe,
  whatsapp: Smartphone,
};
const priorityBar = { urgent: "bg-danger", high: "bg-warning", normal: "bg-fg-subtle/50", low: "bg-line" } as const;

export interface BreachWatchProps {
  tickets: Ticket[];
  focusId: string | null;
  onFocus?: (id: string | null) => void;
  onAssign: (ids: string[], agentId: string, agentName: string) => void;
  onEscalate: (ids: string[]) => void;
  onReply: (id: string, number: number) => void;
}

/** Open tickets ordered by time left on their SLA clock, with bulk assign/escalate and a first-reply dialog. */
export function BreachWatch({ tickets, focusId, onAssign, onEscalate, onReply }: BreachWatchProps) {
  const { f, t, c } = useBlockFormat();
  const [view, setView] = React.useState<"running" | "paused">("running");
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [assignOpen, setAssignOpen] = React.useState(false);
  const [assignee, setAssignee] = React.useState<string>(agents[0]!.id);
  const [replying, setReplying] = React.useState<Ticket | null>(null);
  const [macro, setMacro] = React.useState(macros[1]!.id);
  const [body, setBody] = React.useState("");
  const listRef = React.useRef<HTMLUListElement>(null);

  const rows = tickets
    .map((x) => ({ x, k: clockOf(x) }))
    .filter((r) => (view === "paused" ? r.k.paused : !r.k.paused))
    .sort((a, b) => a.k.remaining - b.k.remaining || priorityRank[a.x.priority] - priorityRank[b.x.priority]);
  const pausedCount = tickets.filter((x) => clockOf(x).paused).length;
  const visibleIds = rows.map((r) => r.x.id);
  const picked = visibleIds.filter((id) => selected.has(id));
  const allPicked = picked.length > 0 && picked.length === visibleIds.length;

  // A marker on the horizon selects a ticket: switch to its view and bring the row into sight.
  React.useEffect(() => {
    if (!focusId) return;
    const target = tickets.find((x) => x.id === focusId);
    if (target && clockOf(target).paused !== (view === "paused")) setView(clockOf(target).paused ? "paused" : "running");
    requestAnimationFrame(() => listRef.current?.querySelector<HTMLElement>(`[data-ticket="${focusId}"]`)?.scrollIntoView({ block: "nearest", behavior: "smooth" }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusId]);

  const toggle = (id: string, on: boolean) =>
    setSelected((s) => {
      const n = new Set(s);
      if (on) n.add(id);
      else n.delete(id);
      return n;
    });

  const openReply = (x: Ticket) => {
    setReplying(x);
    setMacro(macros[1]!.id);
    setBody(t(macros[1]!.body));
  };

  return (
    <Card className="ui-rise flex min-w-0 flex-col" style={{ animationDelay: "80ms" }}>
      <CardHeader
        titleAs="h2"
        title={c("Breach watch", "Aşım takibi")}
        description={c("Least time left first. Waiting-on-customer clocks are paused.", "En az süre kalan en üstte. Müşteri beklenen taleplerde saat durur.")}
        action={
          <ToggleGroup aria-label={c("Clock state", "Saat durumu")} size="xs" value={view} onValueChange={(v) => v && setView(v as "running" | "paused")}>
            <ToggleGroupItem value="running">{c("Running", "İşleyen")}</ToggleGroupItem>
            <ToggleGroupItem value="paused">
              {c("Paused", "Duran")} <span className="font-mono tabular">{pausedCount}</span>
            </ToggleGroupItem>
          </ToggleGroup>
        }
      />

      <div className={cn("flex min-h-11 flex-wrap items-center gap-2 border-y border-line px-(--card-p) py-1.5", picked.length && "bg-accent-soft/40")}>
        <Checkbox
          size="sm"
          aria-label={c("Select all visible tickets", "Görünen tüm talepleri seç")}
          checked={allPicked ? true : picked.length ? "indeterminate" : false}
          onCheckedChange={(v) => setSelected(v === true ? new Set(visibleIds) : new Set())}
          disabled={!visibleIds.length}
        />
        {picked.length ? (
          <>
            <span className="me-auto text-[13px] font-medium text-fg" aria-live="polite">
              {c(`${picked.length} selected`, `${picked.length} seçili`)}
            </span>
            <Button size="xs" variant="secondary" onClick={() => setAssignOpen(true)}>
              <UserPlus aria-hidden />
              {c("Assign", "Ata")}
            </Button>
            <Button
              size="xs"
              variant="secondary"
              onClick={() => {
                onEscalate(picked);
                setSelected(new Set());
              }}
            >
              <ArrowUpToLine aria-hidden />
              {c("Escalate", "Yükselt")}
            </Button>
            <Button size="xs" variant="ghost" aria-label={c("Clear selection", "Seçimi temizle")} onClick={() => setSelected(new Set())}>
              <X aria-hidden />
            </Button>
          </>
        ) : (
          <span className="text-xs text-fg-subtle">{c(`${rows.length} tickets`, `${rows.length} talep`)}</span>
        )}
      </div>

      {rows.length === 0 ? (
        <EmptyState size="sm" title={view === "paused" ? c("No paused tickets", "Duran talep yok") : c("Every clock is stopped", "İşleyen saat yok")} description={c("Nothing in this queue needs a reply right now.", "Bu kuyrukta şu an yanıt bekleyen talep yok.")} />
      ) : (
        <Stagger asChild step={35}>
          <ul ref={listRef} className="max-h-[560px] flex-1 overflow-y-auto" aria-label={c("Tickets by time left", "Kalan süreye göre talepler")}>
            {rows.map(({ x, k }) => {
              const who = requesterOf(x);
              const co = companyOf(x);
              const agent = x.assigneeId ? peopleById[x.assigneeId] : undefined;
              const Icon = channelIcon[x.channel];
              const focused = focusId === x.id;
              return (
                <li
                  key={x.id}
                  data-ticket={x.id}
                  className={cn(
                    "relative grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-x-3 gap-y-2 border-b border-line py-3 ps-(--card-p) pe-(--card-p) transition-colors last:border-b-0",
                    focused ? "bg-selected" : "hover:bg-hover",
                  )}
                >
                  <span aria-hidden className={cn("absolute inset-y-2 start-0 w-[3px] rounded-e-full", priorityBar[x.priority])} />
                  <Checkbox size="sm" className="mt-0.5" aria-label={c(`Select ticket #${x.number}`, `#${x.number} talebini seç`)} checked={selected.has(x.id)} onCheckedChange={(v) => toggle(x.id, v === true)} />
                  <div className="min-w-0">
                    <p className="flex min-w-0 items-baseline gap-2">
                      <span className="shrink-0 font-mono text-xs text-fg-subtle tabular">#{x.number}</span>
                      <span className={cn("truncate text-[13px] text-fg", x.unread && "font-semibold")}>{t(x.subject)}</span>
                    </p>
                    <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-fg-muted">
                      <Icon className="size-3.5 text-fg-subtle" aria-hidden />
                      <span className="truncate">{co?.name ?? who?.name}</span>
                      <span aria-hidden className="text-fg-subtle">·</span>
                      <span>{t(queues.find((q) => q.key === x.queue)!.label)}</span>
                      {x.priority === "urgent" || x.priority === "high" ? (
                        <Badge size="sm" tone={x.priority === "urgent" ? "danger" : "warning"}>{t(priorityLabels[x.priority])}</Badge>
                      ) : null}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <SlaTimer
                        due={k.due}
                        start={x.createdAt}
                        pausedAt={k.pausedAt}
                        now={NOW_MS}
                        label={k.kind === "first-response" ? c("First response", "İlk yanıt") : c("Resolution", "Çözüm")}
                      />
                      <span className="text-xs text-fg-subtle">
                        {k.kind === "first-response" ? c("first response", "ilk yanıt") : c("resolution", "çözüm")} · {f.relative(x.createdAt, { now: NOW_MS })}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {agent ? (
                      <span className="inline-flex items-center gap-1.5 text-xs text-fg-muted">
                        <Avatar size="xs" name={agent.name} />
                        <span className="max-sm:sr-only">{agent.name.split(" ")[0]}</span>
                      </span>
                    ) : (
                      <Badge size="sm" tone="outline">{c("Unassigned", "Atanmadı")}</Badge>
                    )}
                    {k.kind === "first-response" ? (
                      <Button size="xs" variant={k.state === "breached" ? "primary" : "secondary"} onClick={() => openReply(x)}>
                        <MessageSquareReply aria-hidden />
                        {c("Reply", "Yanıtla")}
                        <span className="sr-only"> #{x.number}</span>
                      </Button>
                    ) : x.priority !== "urgent" ? (
                      <Button size="xs" variant="ghost" onClick={() => onEscalate([x.id])}>
                        <ArrowUpToLine aria-hidden />
                        {c("Escalate", "Yükselt")}
                        <span className="sr-only"> #{x.number}</span>
                      </Button>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        </Stagger>
      )}

      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent size="sm">
          <DialogHeader title={c(`Assign ${picked.length} tickets`, `${picked.length} talebi ata`)} description={c("The agent gets a notification and the tickets move to their view.", "Temsilciye bildirim gider ve talepler onun görünümüne taşınır.")} />
          <DialogBody>
            <Field label={c("Agent", "Temsilci")}>
              <Select
                value={assignee}
                onValueChange={(v) => v && setAssignee(v)}
                items={agents.map((a) => ({ value: a.id, label: offShift.has(a.id) ? `${a.name} · ${c("off shift", "vardiya dışı")}` : a.name }))}
              />
            </Field>
          </DialogBody>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setAssignOpen(false)}>{c("Cancel", "Vazgeç")}</Button>
            <Button
              variant="primary"
              onClick={() => {
                onAssign(picked, assignee, peopleById[assignee]!.name);
                setSelected(new Set());
                setAssignOpen(false);
              }}
            >
              {c("Assign", "Ata")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!replying} onOpenChange={(o) => !o && setReplying(null)}>
        <DialogContent size="md">
          <DialogHeader
            title={replying ? c(`First reply · #${replying.number}`, `İlk yanıt · #${replying.number}`) : ""}
            description={replying ? `${requesterOf(replying)?.name ?? ""} · ${t(replying.subject)}` : undefined}
          />
          <DialogBody className="space-y-4">
            <Field label={c("Start from a macro", "Hazır yanıttan başla")}>
              <Select
                value={macro}
                onValueChange={(v) => {
                  if (!v) return;
                  setMacro(v);
                  setBody(t(macros.find((m) => m.id === v)!.body));
                }}
                items={macros.map((m) => ({ value: m.id, label: t(m.title) }))}
              />
            </Field>
            <Field label={c("Message", "Mesaj")} error={body.trim().length < 10 ? c("Write at least a sentence.", "En az bir cümle yazın.") : undefined}>
              <Textarea rows={5} value={body} onChange={(e) => setBody(e.target.value)} />
            </Field>
          </DialogBody>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setReplying(null)}>{c("Cancel", "Vazgeç")}</Button>
            <Button
              variant="primary"
              disabled={body.trim().length < 10}
              onClick={() => {
                if (replying) onReply(replying.id, replying.number);
                setReplying(null);
              }}
            >
              {c("Send reply", "Yanıtı gönder")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
