"use client";

import * as React from "react";
import { ArrowUpRight, PanelRight } from "lucide-react";
import { Badge, Button, Card, PageHeader, Sheet, SheetBody, SheetContent, SheetHeader, SlaTimer, toast } from "@vamos-ui/react";
import { useBlockFormat } from "../../_shared/format";
import { person } from "../../_shared/people";
import { priorityLabels, ticketStatusLabels, type TicketStatus } from "../../_shared/tickets";
import { NOW_MS } from "../../_shared/time";
import { Composer, type ComposerSubmit } from "./composer";
import { channelLabels, me, queues, slaPolicy, thread as initialThread, ticket, type ThreadMessage } from "./data";
import { SidePanel, statusTone, type TicketProps } from "./side-panel";
import { Thread } from "./thread";

const minutes = (iso: string, add: number) => Date.parse(iso) + add * 60_000;
const iso = (ms: number) => new Date(ms).toISOString();

/** One support ticket as a full page: SLA clocks, the conversation, a composer and a properties column. */
export function TicketView() {
  const { t, c, ago } = useBlockFormat();
  // The fixtures' clock, advanced every second so the SLA timers count down without using the real date.
  const [now, setNow] = React.useState(NOW_MS);
  React.useEffect(() => {
    const id = window.setInterval(() => setNow((n) => n + 1000), 1000);
    return () => window.clearInterval(id);
  }, []);

  const [props, setProps] = React.useState<TicketProps>({ status: ticket.status, priority: ticket.priority, assigneeId: ticket.assigneeId!, queue: ticket.queue, tags: ticket.tags });
  const [messages, setMessages] = React.useState<ThreadMessage[]>(initialThread);
  const [pausedAt, setPausedAt] = React.useState<number | null>(null);
  const [solvedAt, setSolvedAt] = React.useState<number | null>(null);
  const [sheet, setSheet] = React.useState(false);
  const nowRef = React.useRef(now);
  nowRef.current = now;

  const resolveDue = minutes(ticket.createdAt, slaPolicy[props.priority].resolve);
  const lastCustomer = [...messages].reverse().find((m) => m.authorId === "customer" && m.kind === "reply");
  const lastOurs = [...messages].reverse().find((m) => m.authorId !== "customer" && m.kind === "reply");
  const waitingOnUs = !!lastCustomer && (!lastOurs || Date.parse(lastOurs.at) < Date.parse(lastCustomer.at));

  const event = (en: string, tr: string) => ({ id: `ev-${Math.round(nowRef.current)}-${en.length}`, authorId: me.id, kind: "event" as const, at: iso(nowRef.current), body: { en, tr } });

  const applyStatus = (status: TicketStatus, silent = false) => {
    const at = nowRef.current;
    setPausedAt(status === "pending" || status === "on-hold" ? at : null);
    setSolvedAt(status === "solved" ? at : null);
    setProps((p) => ({ ...p, status }));
    if (!silent) setMessages((m) => [...m, event(`${me.name} set the status to ${ticketStatusLabels[status].en}`, `${me.name} durumu “${ticketStatusLabels[status].tr}” yaptı`)]);
  };

  const change = (patch: Partial<TicketProps>) => {
    if (patch.status && patch.status !== props.status) {
      applyStatus(patch.status);
      return;
    }
    if (patch.priority && patch.priority !== props.priority) {
      const p = patch.priority;
      setMessages((m) => [...m, event(`${me.name} changed priority to ${priorityLabels[p].en}`, `${me.name} önceliği “${priorityLabels[p].tr}” yaptı`)]);
      toast(c("SLA targets updated", "SLA hedefleri güncellendi"), { description: c(`Resolution is now due ${slaPolicy[p].resolve / 60} h after the ticket was opened.`, `Çözüm artık talep açıldıktan ${slaPolicy[p].resolve / 60} saat sonra.`) });
    }
    if (patch.assigneeId && patch.assigneeId !== props.assigneeId) {
      const who = person(patch.assigneeId).name;
      setMessages((m) => [...m, event(`${me.name} assigned the ticket to ${who}`, `${me.name} talebi ${who} kişisine atadı`)]);
      toast.success(c(`Assigned to ${who}`, `${who} kişisine atandı`));
    }
    if (patch.queue && patch.queue !== props.queue) {
      const q = queues.find((x) => x.key === patch.queue)!;
      setMessages((m) => [...m, event(`${me.name} moved the ticket to ${q.label.en}`, `${me.name} talebi ${q.label.tr} kuyruğuna taşıdı`)]);
    }
    setProps((p) => ({ ...p, ...patch }));
  };

  const submit = ({ mode, text, next }: ComposerSubmit) => {
    const id = `m-${Math.round(nowRef.current)}`;
    const msg: ThreadMessage = { id, authorId: me.id, kind: mode, at: iso(nowRef.current), body: { en: text, tr: text }, delivery: mode === "reply" ? "sending" : undefined };
    setMessages((m) => [...m, msg]);
    if (mode === "reply") {
      window.setTimeout(() => setMessages((m) => m.map((x) => (x.id === id ? { ...x, delivery: "delivered" } : x))), 900);
      if (next !== props.status) applyStatus(next, true);
      toast.success(c("Reply sent", "Yanıt gönderildi"), { description: c(`Ticket set to ${ticketStatusLabels[next].en}`, `Talep durumu: ${ticketStatusLabels[next].tr}`) });
    } else {
      toast(c("Internal note added", "İç not eklendi"));
    }
  };

  const channel = t(channelLabels[ticket.channel]);
  const queue = queues.find((q) => q.key === props.queue)!;

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        size="sm"
        back={{ href: "/crm/activities", label: c("Tickets", "Talepler") }}
        eyebrow={
          <span className="font-mono tabular">
            #{ticket.number} · {t(queue.label)} · {channel}
          </span>
        }
        title={t(ticket.subject)}
        meta={
          <>
            <Badge tone={statusTone[props.status]} dot>{t(ticketStatusLabels[props.status])}</Badge>
            <Badge tone={props.priority === "urgent" ? "danger" : props.priority === "high" ? "warning" : "neutral"}>{t(priorityLabels[props.priority])}</Badge>
          </>
        }
        actions={
          <>
            <Button variant="secondary" className="xl:hidden" onClick={() => setSheet(true)}>
              <PanelRight aria-hidden />
              {c("Details", "Ayrıntılar")}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setMessages((m) => [...m, event(`${me.name} escalated to Engineering · INC-2291`, `${me.name} Yazılım ekibine iletti · INC-2291`)]);
                toast.success(c("Escalated to Engineering", "Yazılım ekibine iletildi"), { description: "INC-2291" });
              }}
            >
              <ArrowUpRight aria-hidden />
              {c("Escalate", "İlet")}
            </Button>
          </>
        }
        menu={[
          { id: "merge", label: c("Merge into another ticket", "Başka bir taleple birleştir"), onSelect: () => toast(c("Pick a ticket to merge into", "Birleştirilecek talebi seçin")) },
          { id: "print", label: c("Print conversation", "Yazışmayı yazdır"), onSelect: () => toast(c("Preparing print view", "Yazdırma görünümü hazırlanıyor")) },
          { type: "separator", id: "sep" },
          { id: "spam", label: c("Mark as spam", "İstenmeyen olarak işaretle"), tone: "danger", onSelect: () => toast(c("Not for a VIP customer", "VIP müşteri için olmaz")) },
        ]}
      />

      {/* SLA clocks */}
      <Card variant="outline" className="mb-(--gap) grid gap-x-6 gap-y-4 px-4 py-3.5 sm:grid-cols-3 sm:px-5">
        <SlaTimer variant="bar" label={c("First response", "İlk yanıt")} start={ticket.createdAt} due={ticket.firstResponseDue} completedAt={ticket.firstRespondedAt} now={now} />
        <SlaTimer variant="bar" label={c("Resolution", "Çözüm")} start={ticket.createdAt} due={resolveDue} completedAt={solvedAt} pausedAt={pausedAt} now={now} />
        <div className="grid content-start gap-1 text-sm">
          <span className="text-xs text-fg-subtle">{c("Next move", "Sıradaki adım")}</span>
          {props.status === "solved" ? (
            <span className="text-fg">{c("Solved — survey goes out in 24 h", "Çözüldü — anket 24 saat içinde gider")}</span>
          ) : waitingOnUs ? (
            <span className="text-fg">
              {c("Customer is waiting on us", "Müşteri bizden yanıt bekliyor")} <span className="text-fg-muted">· {ago(lastCustomer!.at)}</span>
            </span>
          ) : (
            <span className="text-fg">{c("Waiting on the customer", "Müşteri bekleniyor")}</span>
          )}
        </div>
      </Card>

      <div className="grid gap-(--gap) xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="grid min-w-0 content-start gap-(--gap)">
          <Thread messages={messages} channel={channel} now={now} />
          <Composer onSubmit={submit} />
        </div>
        <Card as="aside" aria-label={c("Ticket details", "Talep ayrıntıları")} padding="md" className="max-xl:hidden xl:sticky xl:top-20 xl:self-start">
          <SidePanel value={props} onChange={change} idPrefix="col" />
        </Card>
      </div>

      <Sheet open={sheet} onOpenChange={setSheet}>
        <SheetContent side="end" size="sm">
          <SheetHeader title={c("Ticket details", "Talep ayrıntıları")} description={`#${ticket.number} · ${t(ticket.subject)}`} />
          <SheetBody>
            <SidePanel value={props} onChange={change} idPrefix="sheet" />
          </SheetBody>
        </SheetContent>
      </Sheet>
    </div>
  );
}
