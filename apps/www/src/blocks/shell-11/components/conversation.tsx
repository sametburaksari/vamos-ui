"use client";

import * as React from "react";
import { ArrowLeft, CornerDownLeft, Lock, Paperclip, Sparkles, UserRound } from "lucide-react";
import {
  Avatar,
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  IconButton,
  Kbd,
  Select,
  SlaTimer,
  Textarea,
  ToggleGroup,
  ToggleGroupItem,
  cn,
  type BadgeProps,
} from "@vamos-ui/react";
import { useBlockFormat } from "../../_shared/format";
import { person } from "../../_shared/people";
import { NOW_MS } from "../../_shared/time";
import { agent, agents, companyOf, macros, priorityLabels, requester, ticketStatusLabels, type Ticket, type TicketMessage, type TicketStatus } from "./data";

export type OutgoingMessage = TicketMessage & { pending?: boolean };
type Mode = "reply" | "internal-note";

const priorityTone: Record<Ticket["priority"], BadgeProps["tone"]> = { urgent: "danger", high: "warning", normal: "neutral", low: "outline" };
const statusOrder: TicketStatus[] = ["new", "open", "pending", "on-hold", "solved"];

export interface ConversationProps {
  ticket: Ticket;
  messages: OutgoingMessage[];
  onBack: () => void;
  onSend: (body: string, mode: Mode, solve: boolean) => void;
  onStatus: (s: TicketStatus) => void;
  onAssign: (id: string | null) => void;
  className?: string;
}

/** Right pane: ticket header with SLA clocks, the thread, and a reply / internal-note composer. */
export function Conversation({ ticket, messages, onBack, onSend, onStatus, onAssign, className }: ConversationProps) {
  const { t, c, f, ago } = useBlockFormat();
  const [mode, setMode] = React.useState<Mode>("reply");
  const [draft, setDraft] = React.useState("");
  const endRef = React.useRef<HTMLDivElement>(null);
  const who = requester(ticket);
  const time = (iso: string) => f.time(iso, { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Istanbul" });

  React.useEffect(() => {
    setDraft("");
    setMode("reply");
  }, [ticket.id]);
  React.useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length, ticket.id]);

  const send = (solve = false) => {
    const body = draft.trim();
    if (!body) return;
    onSend(body, mode, solve);
    setDraft("");
  };

  const paused = ticket.status === "pending" || ticket.status === "on-hold" ? ticket.updatedAt : null;

  return (
    <section aria-label={c(`Ticket #${ticket.number}`, `Talep #${ticket.number}`)} className={cn("flex min-h-0 min-w-0 flex-col bg-scene", className)}>
      <header className="border-b border-line bg-surface px-4 pt-3 pb-3 md:px-6">
        <div className="flex items-start gap-2">
          <IconButton label={c("Back to tickets", "Taleplere dön")} size="sm" variant="ghost" className="-ms-1.5 md:hidden" onClick={onBack}>
            <ArrowLeft />
          </IconButton>
          <div className="min-w-0 flex-1">
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-fg-muted">
              <span className="font-mono">#{ticket.number}</span>
              <Badge tone={priorityTone[ticket.priority]} dot={ticket.priority === "urgent"}>
                {t(priorityLabels[ticket.priority])}
              </Badge>
              <span>
                {who.name} · {companyOf(ticket).name}
              </span>
            </p>
            <h2 className="mt-1 font-heading text-lg leading-snug font-semibold tracking-tight text-balance md:text-xl">{t(ticket.subject)}</h2>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <div className="w-44">
          <Select
            size="sm"
            aria-label={c("Status", "Durum")}
            value={ticket.status === "closed" ? "solved" : ticket.status}
            onValueChange={(v) => v && onStatus(v as TicketStatus)}
            items={statusOrder.map((s) => ({ value: s, label: t(ticketStatusLabels[s]) }))}
          />
          </div>
          <div className="w-48">
          <Select
            size="sm"
            aria-label={c("Assignee", "Atanan")}
            value={ticket.assigneeId ?? "none"}
            onValueChange={(v) => onAssign(v === "none" || !v ? null : v)}
            items={[{ value: "none", label: c("Unassigned", "Atanmadı") }, ...agents.map((p) => ({ value: p.id, label: p.id === agent.id ? `${p.name} (${c("you", "siz")})` : p.name }))]}
          />
          </div>
          <div className="flex flex-wrap gap-1">
            {ticket.tags.map((tag) => (
              <Badge key={tag} tone="outline" shape="square">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {ticket.status !== "solved" && ticket.status !== "closed" && (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <SlaTimer variant="bar" label={c("First response", "İlk yanıt")} start={ticket.createdAt} due={ticket.firstResponseDue} completedAt={ticket.firstRespondedAt ?? null} now={NOW_MS} seconds={false} />
            <SlaTimer variant="bar" label={c("Resolution", "Çözüm")} start={ticket.createdAt} due={ticket.resolveDue} pausedAt={paused} now={NOW_MS} seconds={false} />
          </div>
        )}
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 md:px-6" role="log" aria-label={c("Conversation", "Yazışma")}>
        <ol className="mx-auto grid max-w-3xl gap-5">
          {messages.map((m) => {
            if (m.kind === "event") {
              return (
                <li key={m.id} className="flex items-center gap-3 text-xs text-fg-muted">
                  <span className="h-px flex-1 bg-line" aria-hidden />
                  <span className="text-center">
                    {t(m.body)} · {time(m.at)}
                  </span>
                  <span className="h-px flex-1 bg-line" aria-hidden />
                </li>
              );
            }
            const customer = m.authorId === "customer";
            const name = customer ? who.name : person(m.authorId).name;
            const note = m.kind === "internal-note";
            return (
              <li key={m.id} className={cn("ui-fade flex gap-3", m.pending && "opacity-60")}>
                <Avatar name={name} size="sm" className="mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-baseline gap-x-2 text-xs text-fg-muted">
                    <span className="text-[13px] font-semibold text-fg">{name}</span>
                    {customer ? <span>{companyOf(ticket).name}</span> : note ? <span className="inline-flex items-center gap-1"><Lock className="size-3" />{c("Internal note", "İç not")}</span> : <span>{c("Support", "Destek")}</span>}
                    <time dateTime={m.at} className="ms-auto tabular">
                      {m.pending ? c("Sending…", "Gönderiliyor…") : `${time(m.at)} · ${ago(m.at)}`}
                    </time>
                  </p>
                  <div
                    className={cn(
                      "mt-1.5 rounded-ui px-3.5 py-2.5 text-[14px] leading-relaxed text-pretty whitespace-pre-line",
                      customer ? "surface" : note ? "tone-warning tone-soft" : "border border-line bg-surface-2",
                    )}
                  >
                    {t(m.body)}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
        <div ref={endRef} />
      </div>

      <form
        className={cn("border-t border-line px-4 py-3 md:px-6", mode === "internal-note" ? "tone-warning tone-soft" : "bg-surface")}
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center gap-2">
            <ToggleGroup type="single" size="xs" value={mode} onValueChange={(v) => v && setMode(v as Mode)} aria-label={c("Message type", "Mesaj türü")}>
              <ToggleGroupItem value="reply">
                <CornerDownLeft />
                {c("Reply", "Yanıt")}
              </ToggleGroupItem>
              <ToggleGroupItem value="internal-note">
                <Lock />
                {c("Internal note", "İç not")}
              </ToggleGroupItem>
            </ToggleGroup>
            <span className="ms-auto hidden truncate text-xs text-fg-muted sm:inline">
              {mode === "reply" ? c(`To ${who.email}`, `Alıcı ${who.email}`) : c("Only your team sees this", "Yalnızca ekibiniz görür")}
            </span>
          </div>
          <Textarea
            className="mt-2 min-h-20 bg-field"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                send();
              }
            }}
            placeholder={mode === "reply" ? c(`Write to ${who.name.split(" ")[0]}…`, `${who.name.split(" ")[0]} için yazın…`) : c("Mention a teammate with @, add context for the next shift…", "@ ile ekip arkadaşını an, sonraki vardiyaya not bırak…")}
            aria-label={mode === "reply" ? c("Reply", "Yanıt") : c("Internal note", "İç not")}
          />
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="xs" variant="ghost">
                  <Sparkles />
                  {c("Macros", "Hazır yanıtlar")}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuLabel>{c("Insert a saved reply", "Kayıtlı yanıt ekle")}</DropdownMenuLabel>
                {macros.map((m) => (
                  <DropdownMenuItem key={m.id} onSelect={() => setDraft((d) => (d ? `${d}\n\n` : "") + t(m.body))}>
                    {t(m.title)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <IconButton label={c("Attach a file", "Dosya ekle")} size="xs" variant="ghost" type="button">
              <Paperclip />
            </IconButton>
            {!ticket.assigneeId && (
              <Button size="xs" variant="ghost" type="button" onClick={() => onAssign(agent.id)}>
                <UserRound />
                {c("Take it", "Üstlen")}
              </Button>
            )}
            <span className="ms-auto hidden items-center gap-1 text-xs text-fg-subtle md:inline-flex">
              <Kbd keyName="mod" />
              <Kbd keyName="enter" />
            </span>
            {mode === "reply" && (
              <Button size="sm" variant="secondary" type="button" disabled={!draft.trim()} onClick={() => send(true)}>
                {c("Send and solve", "Gönder ve çöz")}
              </Button>
            )}
            <Button size="sm" variant="primary" type="submit" disabled={!draft.trim()}>
              {mode === "reply" ? c("Send", "Gönder") : c("Add note", "Not ekle")}
            </Button>
          </div>
        </div>
      </form>
    </section>
  );
}
