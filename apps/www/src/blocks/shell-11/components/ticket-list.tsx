"use client";

import * as React from "react";
import { ArrowDownWideNarrow, CheckCheck, Mail, MessageCircle, MessagesSquare, PanelLeft, Phone, Search, UserRoundPlus, X, FileText } from "lucide-react";
import {
  Avatar,
  Button,
  Checkbox,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  EmptyState,
  IconButton,
  Input,
  SlaTimer,
  cn,
} from "@vamos-ui/react";
import { Stagger } from "@vamos-ui/react/motion";
import { useBlockFormat } from "../../_shared/format";
import { NOW_MS } from "../../_shared/time";
import { activeSla, agents, companyOf, requester, type Ticket, type TicketChannel } from "./data";

export type SortKey = "sla" | "newest";

const channelIcon: Record<TicketChannel, React.ReactNode> = {
  email: <Mail />,
  chat: <MessagesSquare />,
  phone: <Phone />,
  "web-form": <FileText />,
  whatsapp: <MessageCircle />,
};

const priorityBar: Record<Ticket["priority"], string> = {
  urgent: "bg-danger",
  high: "bg-warning",
  normal: "bg-transparent",
  low: "bg-transparent",
};

export interface TicketListProps {
  title: string;
  tickets: Ticket[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  checked: Set<string>;
  onCheckedChange: (next: Set<string>) => void;
  query: string;
  onQuery: (q: string) => void;
  sort: SortKey;
  onSort: (s: SortKey) => void;
  onBulkAssign: (agentId: string) => void;
  onBulkSolve: () => void;
  onOpenViews: () => void;
  className?: string;
}

/** Middle pane: search, sort, bulk actions and the ticket rows. j / k move, x checks, Enter opens. */
export function TicketList(props: TicketListProps) {
  const { title, tickets, selectedId, onSelect, checked, onCheckedChange, query, onQuery, sort, onSort, onBulkAssign, onBulkSolve, onOpenViews, className } = props;
  const { t, c, ago } = useBlockFormat();
  const listRef = React.useRef<HTMLUListElement>(null);

  const toggle = (id: string) => {
    const next = new Set(checked);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onCheckedChange(next);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLUListElement>) => {
    const ids = tickets.map((x) => x.id);
    const i = selectedId ? ids.indexOf(selectedId) : -1;
    const focusRow = (id: string) => listRef.current?.querySelector<HTMLButtonElement>(`[data-ticket="${id}"]`)?.focus();
    if (e.key === "j" || e.key === "ArrowDown") {
      e.preventDefault();
      const id = ids[Math.min(ids.length - 1, i + 1)];
      if (id) (onSelect(id), focusRow(id));
    } else if (e.key === "k" || e.key === "ArrowUp") {
      e.preventDefault();
      const id = ids[Math.max(0, i - 1)];
      if (id) (onSelect(id), focusRow(id));
    } else if (e.key === "x" && selectedId) {
      e.preventDefault();
      toggle(selectedId);
    }
  };

  const allChecked = tickets.length > 0 && tickets.every((x) => checked.has(x.id));
  const someChecked = checked.size > 0;

  return (
    <section aria-label={title} className={cn("flex min-h-0 min-w-0 flex-col border-e border-line bg-surface", className)}>
      <header className="flex flex-col gap-2.5 border-b border-line px-3 pt-3 pb-2.5">
        <div className="flex items-center gap-2">
          <IconButton label={c("Views and queues", "Görünümler ve kuyruklar")} size="sm" variant="ghost" className="lg:hidden" onClick={onOpenViews}>
            <PanelLeft />
          </IconButton>
          <h1 className="min-w-0 flex-1 truncate font-heading text-[15px] font-semibold tracking-tight">{title}</h1>
          <span className="tabular text-xs text-fg-muted">{tickets.length}</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <IconButton label={c("Sort", "Sırala")} size="sm" variant="ghost">
                <ArrowDownWideNarrow />
              </IconButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{c("Sort by", "Sıralama")}</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={sort} onValueChange={(v) => onSort(v as SortKey)}>
                <DropdownMenuRadioItem value="sla">{c("SLA due first", "SLA süresi yakın olan")}</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="newest">{c("Newest first", "En yeni")}</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Input
          size="sm"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          clearable
          onClear={() => onQuery("")}
          leading={<Search className="size-3.5" />}
          placeholder={c("Search subject, customer or #number", "Konu, müşteri veya #numara ara")}
          aria-label={c("Search tickets", "Taleplerde ara")}
        />
        {someChecked ? (
          <div className="ui-fade flex items-center gap-1.5 rounded-ui-sm bg-surface-2 py-1 ps-2 pe-1">
            <Checkbox
              size="sm"
              checked={allChecked ? true : "indeterminate"}
              onCheckedChange={() => onCheckedChange(allChecked ? new Set() : new Set(tickets.map((x) => x.id)))}
              aria-label={c("Select all", "Tümünü seç")}
            />
            <span className="me-auto text-xs font-medium" aria-live="polite">
              {c(`${checked.size} selected`, `${checked.size} seçili`)}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="xs" variant="ghost">
                  <UserRoundPlus />
                  {c("Assign", "Ata")}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {agents.map((p) => (
                  <DropdownMenuItem key={p.id} onSelect={() => onBulkAssign(p.id)}>
                    <Avatar name={p.name} size="xs" />
                    {p.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button size="xs" variant="ghost" onClick={onBulkSolve}>
              <CheckCheck />
              {c("Solve", "Çöz")}
            </Button>
            <IconButton label={c("Clear selection", "Seçimi temizle")} size="xs" variant="ghost" onClick={() => onCheckedChange(new Set())}>
              <X />
            </IconButton>
          </div>
        ) : null}
      </header>

      {tickets.length === 0 ? (
        <EmptyState className="m-auto px-6" title={query ? c("No tickets match", "Eşleşen talep yok") : c("Inbox zero", "Kutu boş")} description={query ? c("Try the ticket number or the customer's company.", "Talep numarasını veya müşterinin şirketini deneyin.") : c("Nothing waiting in this view. Nice work.", "Bu görünümde bekleyen talep yok.")} />
      ) : (
        <Stagger key={title} asChild effect="fade" step={25}>
          <ul ref={listRef} onKeyDown={onKeyDown} aria-label={c("Tickets", "Talepler")} className="min-h-0 flex-1 overflow-y-auto">
            {tickets.map((tk) => {
              const sla = activeSla(tk);
              const who = requester(tk);
              const active = tk.id === selectedId;
              const open = tk.status !== "solved" && tk.status !== "closed";
              return (
                <li key={tk.id} className={cn("relative border-b border-line", active ? "bg-selected" : "hover:bg-hover")}>
                  <span aria-hidden className={cn("absolute inset-y-2 start-0 w-0.5 rounded-full", priorityBar[tk.priority])} />
                  <div className="flex gap-2.5 py-3 ps-3 pe-3">
                    <Checkbox size="sm" className="mt-0.5" checked={checked.has(tk.id)} onCheckedChange={() => toggle(tk.id)} aria-label={c(`Select #${tk.number}`, `#${tk.number} seç`)} />
                    <button
                      type="button"
                      data-ticket={tk.id}
                      onClick={() => onSelect(tk.id)}
                      aria-current={active ? "true" : undefined}
                      className="min-w-0 flex-1 rounded-ui-sm text-start outline-none focus-ring"
                    >
                      <span className="flex items-center gap-1.5 text-xs text-fg-muted">
                        <span className="[&_svg]:size-3.5" aria-hidden>
                          {channelIcon[tk.channel]}
                        </span>
                        <span className={cn("min-w-0 truncate", tk.unread && "font-semibold text-fg")}>{who.name}</span>
                        <span className="truncate">· {companyOf(tk).name}</span>
                        <span className="ms-auto shrink-0 tabular">{ago(tk.updatedAt)}</span>
                      </span>
                      <span className={cn("mt-1 line-clamp-2 text-[13.5px] leading-snug", tk.unread ? "font-semibold" : "text-fg")}>
                        {tk.unread && <span className="me-1.5 inline-block size-1.5 -translate-y-px rounded-full bg-accent-ink align-middle" aria-label={c("Unread", "Okunmadı")} />}
                        {t(tk.subject)}
                      </span>
                      <span className="mt-2 flex items-center gap-2">
                        <span className="font-mono text-[11px] text-fg-subtle">#{tk.number}</span>
                        {open ? (
                          <SlaTimer
                            due={sla.due}
                            start={sla.start}
                            pausedAt={sla.pausedAt}
                            now={NOW_MS}
                            seconds={false}
                            label={sla.kind === "first" ? c("First response", "İlk yanıt") : c("Resolution", "Çözüm")}
                          />
                        ) : (
                          <span className="text-xs text-fg-muted">{c("Solved", "Çözüldü")} {tk.solvedAt ? ago(tk.solvedAt) : ""}</span>
                        )}
                        {tk.assigneeId ? <Avatar className="ms-auto" name={agents.find((a) => a.id === tk.assigneeId)?.name ?? ""} size="xs" /> : <span className="ms-auto text-[11px] text-fg-subtle">{c("Unassigned", "Atanmadı")}</span>}
                      </span>
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </Stagger>
      )}
    </section>
  );
}
