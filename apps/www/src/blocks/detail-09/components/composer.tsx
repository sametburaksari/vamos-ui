"use client";

import * as React from "react";
import { Lock, Paperclip, Reply, Send, Sparkles } from "lucide-react";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  IconButton,
  Kbd,
  Select,
  Textarea,
  ToggleGroup,
  ToggleGroupItem,
  cn,
  toast,
} from "@vamos-ui/react";
import { useBlockFormat } from "../../_shared/format";
import type { TicketStatus } from "../../_shared/tickets";
import { failedDeliveries, macros, requester } from "./data";

export type ComposerMode = "reply" | "internal-note";
export interface ComposerSubmit {
  mode: ComposerMode;
  text: string;
  /** Status after sending (replies only). */
  next: TicketStatus;
}

/** Reply or internal note, with macros, a next-status choice and ⌘/Ctrl + Enter to send. */
export function Composer({ onSubmit, disabled }: { onSubmit: (s: ComposerSubmit) => void; disabled?: boolean }) {
  const { t, c } = useBlockFormat();
  const [mode, setMode] = React.useState<ComposerMode>("reply");
  const [text, setText] = React.useState("");
  const [next, setNext] = React.useState<TicketStatus>("pending");
  const [error, setError] = React.useState(false);
  const ref = React.useRef<HTMLTextAreaElement>(null);
  const first = requester.name.split(" ")[0];

  const insert = (snippet: string) => {
    setText((v) => (v.trim() ? `${v.trimEnd()}\n\n${snippet}` : snippet));
    setError(false);
    requestAnimationFrame(() => ref.current?.focus());
  };

  const submit = () => {
    if (!text.trim()) {
      setError(true);
      ref.current?.focus();
      return;
    }
    onSubmit({ mode, text: text.trim(), next: mode === "reply" ? next : "open" });
    setText("");
  };

  const statusOptions = [
    { value: "pending", label: c("Pending (waiting on customer)", "Beklemede (müşteri bekleniyor)") },
    { value: "open", label: c("Open", "Açık") },
    { value: "solved", label: c("Solved", "Çözüldü") },
  ];
  const note = mode === "internal-note";

  return (
    <section
      aria-label={c("Reply to the ticket", "Talebi yanıtla")}
      className={cn("rounded-ui-lg border transition-colors has-[textarea:focus-visible]:outline-2 has-[textarea:focus-visible]:outline-ring", note ? "border-dashed border-warning/55 bg-warning/6" : "surface border-transparent")}
    >
      <div className="flex flex-wrap items-center gap-2 border-b border-line px-3 py-2">
        <ToggleGroup type="single" value={mode} onValueChange={(v) => v && setMode(v as ComposerMode)} aria-label={c("Message type", "Mesaj türü")} size="sm">
          <ToggleGroupItem value="reply">
            <Reply aria-hidden />
            {c(`Reply to ${first}`, `${first} yanıtla`)}
          </ToggleGroupItem>
          <ToggleGroupItem value="internal-note">
            <Lock aria-hidden />
            {c("Internal note", "İç not")}
          </ToggleGroupItem>
        </ToggleGroup>
        <div className="ms-auto flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost">
                <Sparkles aria-hidden />
                {c("Macros", "Makrolar")}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
              <DropdownMenuLabel>{c("Insert a saved reply", "Kayıtlı yanıt ekle")}</DropdownMenuLabel>
              <DropdownMenuItem
                onSelect={() =>
                  insert(
                    c(
                      `Good news: once the secret matches, failed deliveries are retried automatically for 72 hours. I've just replayed the ${failedDeliveries.count} from last night, so they should show as delivered within a few minutes.`,
                      `İyi haber: anahtar eşleştiğinde başarısız gönderimler 72 saat boyunca otomatik olarak yeniden denenir. Dün geceki ${failedDeliveries.count} gönderimi az önce yeniden başlattım; birkaç dakika içinde iletildi olarak görünecekler.`,
                    ),
                  )
                }
              >
                <span className="grid">
                  <span>{c("Deliveries replayed", "Gönderimler yeniden başlatıldı")}</span>
                  <span className="text-xs text-fg-muted">{c("Suggested for this ticket", "Bu talep için öneri")}</span>
                </span>
              </DropdownMenuItem>
              {macros.map((m) => (
                <DropdownMenuItem key={m.id} onSelect={() => insert(t(m.body))}>
                  {t(m.title)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <IconButton size="sm" variant="ghost" label={c("Attach a file", "Dosya ekle")} onClick={() => toast(c("File picker would open here", "Dosya seçici burada açılır"))}>
            <Paperclip aria-hidden />
          </IconButton>
        </div>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <label htmlFor="ticket-composer" className="sr-only">
          {note ? c("Internal note, only your team sees it", "İç not, yalnızca ekibiniz görür") : c(`Reply to ${requester.name}`, `${requester.name} için yanıt`)}
        </label>
        <Textarea
          id="ticket-composer"
          ref={ref}
          rows={4}
          value={text}
          invalid={error}
          aria-describedby={error ? "composer-error" : undefined}
          onChange={(e) => {
            setText(e.target.value);
            setError(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder={note ? c("Only your team sees this. Use @ to mention someone.", "Bunu yalnızca ekibiniz görür. Birini anmak için @ kullanın.") : c(`Write to ${first}…`, `${first} için yazın…`)}
          className="min-h-28 resize-y rounded-none border-0 bg-transparent px-4 py-3 shadow-none focus-visible:outline-none"
        />
        {error ? (
          <p id="composer-error" className="px-4 pb-1 text-xs text-danger">
            {c("Write something first.", "Önce bir şey yazın.")}
          </p>
        ) : null}
        <div className="flex flex-wrap items-center gap-2 border-t border-line px-3 py-2">
          <span className="text-xs text-fg-subtle max-sm:hidden">
            <Kbd>⌘</Kbd> <Kbd>↵</Kbd> {c("to send", "ile gönder")}
          </span>
          <div className="ms-auto flex min-w-0 flex-wrap items-center justify-end gap-2 sm:flex-nowrap">
            {!note ? (
              <div className="w-60 max-w-full">
              <Select
                aria-label={c("Status after sending", "Gönderdikten sonraki durum")}
                size="sm"
                value={next}
                onValueChange={(v) => v && setNext(v as TicketStatus)}
                items={statusOptions}
                triggerClassName="w-full"
              />
              </div>
            ) : null}
            <Button type="submit" variant={note ? "secondary" : "primary"} size="sm" disabled={disabled}>
              <Send aria-hidden />
              {note ? c("Add note", "Not ekle") : c("Send", "Gönder")}
            </Button>
          </div>
        </div>
      </form>
    </section>
  );
}
