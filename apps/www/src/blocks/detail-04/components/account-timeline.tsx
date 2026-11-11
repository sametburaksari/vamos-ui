"use client";

import * as React from "react";
import { CalendarCheck, CircleDollarSign, Handshake, LifeBuoy, Mail, PhoneCall, Pin, PinOff, StickyNote } from "lucide-react";
import {
  ActivityTimeline, Avatar, Badge, Button, Card, CardBody, CardHeader, IconButton, Textarea, ToggleGroup, ToggleGroupItem, type TimelineEntry,
} from "@vamos-ui/react";
import { Stagger } from "@vamos-ui/react/motion";
import { useBlockFormat } from "../../_shared/format";
import { person } from "../../_shared/people";
import { NOW_MS } from "../../_shared/time";
import type { HistoryEvent, HistoryKind, Note } from "./data";

type Filter = "all" | "sales" | "support" | "billing" | "notes";
const filterKinds: Record<Filter, HistoryKind[] | null> = {
  all: null,
  sales: ["deal", "call", "meeting", "email"],
  support: ["ticket"],
  billing: ["invoice"],
  notes: ["note"],
};
const kindIcon = { deal: Handshake, ticket: LifeBuoy, invoice: CircleDollarSign, call: PhoneCall, meeting: CalendarCheck, email: Mail, note: StickyNote };
const kindTone = { deal: "accent", ticket: "warning", invoice: "info", call: "neutral", meeting: "neutral", email: "neutral", note: "neutral" } as const;

/** Notes composer, pinned notes and the account's merged history. */
export function AccountTimeline({
  events,
  notes,
  onAddNote,
  onTogglePin,
}: {
  events: HistoryEvent[];
  notes: Note[];
  onAddNote: (text: string) => void;
  onTogglePin: (id: string) => void;
}) {
  const { c, t, ago } = useBlockFormat();
  const [filter, setFilter] = React.useState<Filter>("all");
  const [draft, setDraft] = React.useState("");
  const [limit, setLimit] = React.useState(8);
  const pinned = notes.filter((n) => n.pinned);

  const all: HistoryEvent[] = [
    ...events,
    ...notes.map((n) => ({ id: `note-${n.id}`, kind: "note" as const, at: n.at, actorId: n.authorId, title: { en: "added a note", tr: "not ekledi" }, body: n.body })),
  ];
  const kinds = filterKinds[filter];
  const items: TimelineEntry[] = all
    .filter((e) => !kinds || kinds.includes(e.kind))
    .map((e) => {
      const actor = e.actorId ? person(e.actorId).name : undefined;
      const note = e.kind === "note" ? notes.find((n) => `note-${n.id}` === e.id) : undefined;
      return {
        id: e.id,
        at: e.at,
        icon: e.kind === "note" ? undefined : kindIcon[e.kind],
        avatar: e.kind === "note" && actor ? { name: actor } : undefined,
        tone: kindTone[e.kind],
        actor: e.kind === "note" ? actor : undefined,
        title: (
          <span className="inline-flex flex-wrap items-center gap-2">
            {t(e.title)}
            {note?.status === "saving" ? <Badge size="sm" tone="neutral">{c("Saving…", "Kaydediliyor…")}</Badge> : null}
          </span>
        ),
        body: e.body ? t(e.body) : undefined,
      };
    });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    onAddNote(text);
    setDraft("");
    setFilter((f) => (f === "all" || f === "notes" ? f : "all"));
  };

  return (
    <Card>
      <CardHeader title={c("Notes & history", "Notlar ve geçmiş")} description={c("Calls, emails, deal moves, tickets and invoices in one place.", "Görüşmeler, e-postalar, fırsat hareketleri, talepler ve faturalar tek yerde.")} />
      <CardBody className="grid gap-5">
        <form onSubmit={submit} className="grid gap-2">
          <label htmlFor="account-note" className="sr-only">
            {c("Add a note", "Not ekle")}
          </label>
          <Textarea
            id="account-note"
            rows={3}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit(e);
            }}
            placeholder={c("Write a note for the team… (⌘ Enter to save)", "Ekip için not yazın… (⌘ Enter ile kaydet)")}
          />
          <div className="flex items-center justify-between gap-3">
            <span className="text-small text-fg-subtle">{c("Only your workspace sees notes.", "Notları yalnızca çalışma alanınız görür.")}</span>
            <Button type="submit" size="sm" disabled={!draft.trim()}>
              {c("Add note", "Not ekle")}
            </Button>
          </div>
        </form>

        {pinned.length ? (
          <Stagger asChild step={60}>
            <ul className="grid gap-2" aria-label={c("Pinned notes", "Sabitlenmiş notlar")}>
              {pinned.map((n) => (
                <li key={n.id} className="surface-2 grid grid-cols-[auto_minmax(0,1fr)_auto] gap-3 rounded-ui p-3">
                  <Avatar name={person(n.authorId).name} size="sm" />
                  <div className="grid gap-1">
                    <p className="text-small text-fg-muted">
                      <span className="font-medium text-fg">{person(n.authorId).name}</span> · {ago(n.at)}
                    </p>
                    <p className="text-pretty text-fg">{t(n.body)}</p>
                  </div>
                  <IconButton size="sm" variant="ghost" label={c("Unpin note", "Sabitlemeyi kaldır")} onClick={() => onTogglePin(n.id)}>
                    <PinOff />
                  </IconButton>
                </li>
              ))}
            </ul>
          </Stagger>
        ) : null}

        <ActivityTimeline
          aria-label={c("Account history", "Hesap geçmişi")}
          items={[...items].sort((a, b) => String(b.at).localeCompare(String(a.at))).slice(0, limit)}
          hasMore={items.length > limit}
          onLoadMore={() => setLimit((l) => l + 10)}
          groupBy="day"
          now={NOW_MS}
          empty={c("Nothing here yet.", "Henüz bir şey yok.")}
          filter={
            <ToggleGroup type="single" size="sm" variant="segmented" value={filter} onValueChange={(v) => v && setFilter(v as Filter)} aria-label={c("Show", "Göster")} className="max-w-full overflow-x-auto">
              <ToggleGroupItem value="all">{c("All", "Tümü")}</ToggleGroupItem>
              <ToggleGroupItem value="sales">{c("Sales", "Satış")}</ToggleGroupItem>
              <ToggleGroupItem value="support">{c("Support", "Destek")}</ToggleGroupItem>
              <ToggleGroupItem value="billing">{c("Billing", "Fatura")}</ToggleGroupItem>
              <ToggleGroupItem value="notes">{c("Notes", "Notlar")}</ToggleGroupItem>
            </ToggleGroup>
          }
        />

        {notes.some((n) => !n.pinned) ? (
          <div className="grid gap-2 border-t border-line pt-4">
            <p className="text-small text-fg-muted">{c("Pin a note to keep it above the history:", "Geçmişin üstünde tutmak için notu sabitleyin:")}</p>
            <ul className="flex flex-wrap gap-2">
              {notes
                .filter((n) => !n.pinned && n.status !== "saving")
                .map((n) => (
                  <li key={n.id}>
                    <Button size="sm" variant="secondary" onClick={() => onTogglePin(n.id)} className="max-w-72">
                      <Pin /> <span className="truncate">{t(n.body)}</span>
                    </Button>
                  </li>
                ))}
            </ul>
          </div>
        ) : null}
      </CardBody>
    </Card>
  );
}
