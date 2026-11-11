"use client";

import * as React from "react";
import { Check, CheckCheck, Lock, Paperclip } from "lucide-react";
import { Avatar, Badge, Spinner, cn } from "@vamos-ui/react";
import { Stagger } from "@vamos-ui/react/motion";
import { useBlockFormat } from "../../_shared/format";
import { peopleById } from "../../_shared/people";
import { requester, type ThreadMessage } from "./data";

/** "@Kerem" → a highlighted mention. */
function withMentions(text: string) {
  return text.split(/(@[A-ZÇĞİÖŞÜ][\p{L}]+)/u).map((part, i) =>
    part.startsWith("@") ? (
      <span key={i} className="rounded-ui-sm bg-accent-soft px-1 font-medium text-accent-ink">
        {part}
      </span>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    ),
  );
}

/** The conversation: customer and agent emails, internal notes and ticket events, oldest first. */
export function Thread({ messages, channel, now }: { messages: ThreadMessage[]; channel: string; now: number }) {
  const { f, t, c, lang } = useBlockFormat();
  const ago = (iso: string) => (Math.abs(Date.parse(iso) - now) < 45_000 ? c("just now", "az önce") : f.relative(iso, { now }));
  return (
    <Stagger asChild effect="fade" step={50}>
      <ol className="grid gap-3" aria-label={c("Conversation", "Yazışma")}>
        {messages.map((m) => {
          const text = t(m.body);
          if (m.kind === "event") {
            return (
              <li key={m.id} className="flex items-center gap-3 py-1 text-xs text-fg-subtle">
                <span aria-hidden className="h-px flex-1 bg-line" />
                <span className="text-center">
                  {text} · <time dateTime={m.at}>{f.time(m.at, { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Istanbul" })}</time>
                </span>
                <span aria-hidden className="h-px flex-1 bg-line" />
              </li>
            );
          }
          const isCustomer = m.authorId === "customer";
          const author = isCustomer ? { name: requester.name, title: t(requester.title) } : { name: peopleById[m.authorId]?.name ?? "", title: peopleById[m.authorId] ? t(peopleById[m.authorId]!.title) : "" };
          const note = m.kind === "internal-note";
          return (
            <li
              key={m.id}
              className={cn(
                "relative rounded-ui-lg px-4 py-3.5 sm:px-5",
                note ? "tone-warning border border-dashed border-warning/45 bg-warning/8" : isCustomer ? "surface" : "surface-2 border-s-2 border-s-accent",
              )}
            >
              <header className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                <Avatar name={author.name} size="sm" />
                <span className="text-sm font-medium text-fg">{author.name}</span>
                <span className="text-xs text-fg-subtle max-sm:hidden">{author.title}</span>
                {note ? (
                  <Badge tone="warning" size="sm" className="gap-1">
                    <Lock className="size-3" aria-hidden />
                    {c("Internal note", "İç not")}
                  </Badge>
                ) : isCustomer ? (
                  <Badge tone="outline" size="sm">{c(`via ${channel}`, `${channel} ile`)}</Badge>
                ) : null}
                <time dateTime={m.at} className="ms-auto text-xs text-fg-subtle tabular" title={f.date(m.at, { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Istanbul" })}>
                  {ago(m.at)}
                </time>
              </header>
              <p lang={lang} className="mt-2.5 max-w-[68ch] whitespace-pre-line text-[0.9375rem] leading-relaxed text-fg">
                {withMentions(text)}
              </p>
              {m.attachments?.length ? (
                <ul className="mt-3 flex flex-wrap gap-2">
                  {m.attachments.map((a) => (
                    <li key={a.name} className="inline-flex items-center gap-1.5 rounded-ui-sm border border-line px-2 py-1 text-xs text-fg-muted">
                      <Paperclip className="size-3.5" aria-hidden />
                      <span className="font-mono">{a.name}</span>
                      <span className="text-fg-subtle">{f.bytes(a.size)}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
              {m.delivery ? (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-fg-subtle" aria-live="polite">
                  {m.delivery === "sending" ? <Spinner className="size-3" /> : m.delivery === "opened" ? <CheckCheck className="size-3.5 text-success" aria-hidden /> : <Check className="size-3.5" aria-hidden />}
                  {m.delivery === "sending" ? c("Sending…", "Gönderiliyor…") : m.delivery === "opened" ? c(`Opened by ${requester.name.split(" ")[0]}`, `${requester.name.split(" ")[0]} açtı`) : c("Delivered", "İletildi")}
                </p>
              ) : null}
            </li>
          );
        })}
      </ol>
    </Stagger>
  );
}
