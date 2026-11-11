"use client";

import * as React from "react";
import { ArrowRightLeft, BookOpen, CornerDownLeft, FlaskConical, Gauge, KeyRound, Pause, Play, Plus, Radio, ScrollText, Send, Webhook } from "lucide-react";
import { Badge, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, Kbd, KbdGroup } from "@vamos-ui/react";
import { useBlockFormat } from "../../_shared/format";
import type { Env, Page, RequestLog } from "./data";

export interface PaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  page: Page;
  env: Env;
  live: boolean;
  logs: RequestLog[];
  onGo: (p: Page) => void;
  onEnv: (e: Env) => void;
  onToggleLive: () => void;
  onCreateKey: () => void;
  onTestWebhook: () => void;
  onOpenRequest: (id: string) => void;
  onDocs: (topic: string) => void;
}

type Sub = null | "env" | "docs";

/** The console's only real navigation: pages, actions, environments, recent requests and docs. */
export function Palette(props: PaletteProps) {
  const { open, onOpenChange, page, env, live, logs, onGo, onEnv, onToggleLive, onCreateKey, onTestWebhook, onOpenRequest, onDocs } = props;
  const { c } = useBlockFormat();
  const [sub, setSub] = React.useState<Sub>(null);
  const [query, setQuery] = React.useState("");

  React.useEffect(() => {
    if (!open) {
      setSub(null);
      setQuery("");
    }
  }, [open]);

  const run = (fn: () => void) => {
    onOpenChange(false);
    fn();
  };

  const pages: Array<{ key: Page; label: string; icon: React.ReactNode; keys: string[] }> = [
    { key: "overview", label: c("Overview", "Genel bakış"), icon: <Gauge />, keys: ["g", "o"] },
    { key: "logs", label: c("Request logs", "İstek kayıtları"), icon: <ScrollText />, keys: ["g", "l"] },
    { key: "keys", label: c("API keys", "API anahtarları"), icon: <KeyRound />, keys: ["g", "k"] },
    { key: "webhooks", label: c("Webhooks", "Webhook'lar"), icon: <Webhook />, keys: ["g", "w"] },
  ];

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title={c("Command palette", "Komut paleti")}
      commandProps={{
        onKeyDown: (e) => {
          if (sub && e.key === "Backspace" && !query) {
            e.preventDefault();
            setSub(null);
          }
        },
      }}
    >
      <CommandInput
        value={query}
        onValueChange={setQuery}
        chip={sub ? <Badge tone="accent" shape="square">{sub === "env" ? c("Environment", "Ortam") : c("Docs", "Dokümanlar")}</Badge> : undefined}
        placeholder={sub === "env" ? c("Switch environment…", "Ortam değiştir…") : sub === "docs" ? c("Search the API reference…", "API referansında ara…") : c("Jump to a page, run an action or paste a request id…", "Sayfaya git, komut çalıştır veya istek kimliği yapıştır…")}
      />
      <CommandList>
        <CommandEmpty />
        {sub === "env" && (
          <CommandGroup heading={c("Environment", "Ortam")}>
            {(["live", "test"] as const).map((e) => (
              <CommandItem key={e} value={`env ${e}`} icon={e === "live" ? <Radio /> : <FlaskConical />} description={e === "live" ? c("Real orders and customers", "Gerçek siparişler ve müşteriler") : c("Sandbox data, no charges", "Deneme verisi, ücret yok")} badge={env === e ? <Badge tone="accent">{c("Current", "Geçerli")}</Badge> : undefined} onSelect={() => run(() => onEnv(e))}>
                {e === "live" ? c("Live", "Canlı") : c("Test", "Test")}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        {sub === "docs" && (
          <CommandGroup heading={c("API reference", "API referansı")}>
            {["Authentication", "Pagination", "Orders", "Stock levels", "Webhook signatures", "Rate limits", "Errors"].map((d) => (
              <CommandItem key={d} value={`docs ${d}`} icon={<BookOpen />} onSelect={() => run(() => onDocs(d))}>
                {d}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        {!sub && (
          <>
            <CommandGroup heading={c("Go to", "Git")}>
              {pages.map((p) => (
                <CommandItem
                  key={p.key}
                  value={`go ${p.label}`}
                  icon={p.icon}
                  badge={
                    <span className="flex items-center gap-1 text-xs text-fg-subtle">
                      {page === p.key && <span className="me-1">{c("here", "buradasınız")}</span>}
                      <Kbd size="sm">G</Kbd>
                      <Kbd size="sm">{p.keys[1]!.toUpperCase()}</Kbd>
                    </span>
                  }
                  onSelect={() => run(() => onGo(p.key))}
                >
                  {p.label}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading={c("Actions", "Komutlar")}>
              <CommandItem value="create api key new" icon={<Plus />} shortcut={["c"]} onSelect={() => run(onCreateKey)}>
                {c("Create API key", "API anahtarı oluştur")}
              </CommandItem>
              <CommandItem value="send test webhook" icon={<Send />} onSelect={() => run(onTestWebhook)}>
                {c("Send a test webhook", "Test webhook'u gönder")}
              </CommandItem>
              <CommandItem value="pause resume live tail logs" icon={live ? <Pause /> : <Play />} shortcut={["p"]} onSelect={() => run(onToggleLive)}>
                {live ? c("Pause live tail", "Canlı akışı duraklat") : c("Resume live tail", "Canlı akışı sürdür")}
              </CommandItem>
              <CommandItem value="switch environment live test" icon={<ArrowRightLeft />} chevron onSelect={() => { setSub("env"); setQuery(""); }}>
                {c("Switch environment…", "Ortam değiştir…")}
              </CommandItem>
              <CommandItem value="search docs api reference" icon={<BookOpen />} chevron onSelect={() => { setSub("docs"); setQuery(""); }}>
                {c("Search the docs…", "Dokümanlarda ara…")}
              </CommandItem>
            </CommandGroup>
            <CommandGroup heading={c("Recent requests", "Son istekler")}>
              {logs.slice(0, query ? 40 : 4).map((l) => (
                <CommandItem key={l.id} value={`${l.id} ${l.method} ${l.path} ${l.status}`} onSelect={() => run(() => onOpenRequest(l.id))} badge={<span className="font-mono text-xs text-fg-subtle tabular">{l.status}</span>}>
                  <span className="font-mono text-[12.5px]">
                    <span className="text-fg-muted">{l.method}</span> {l.path}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
      <div className="flex items-center gap-4 border-t border-line px-4 py-2 text-[11.5px] text-fg-subtle max-sm:hidden">
        <span className="flex items-center gap-1.5"><KbdGroup keys={["up", "down"]} size="sm" /> {c("navigate", "gez")}</span>
        <span className="flex items-center gap-1.5"><CornerDownLeft aria-hidden className="size-3" /> {c("run", "çalıştır")}</span>
        {sub && <span className="flex items-center gap-1.5"><KbdGroup keys={["backspace"]} size="sm" /> {c("back", "geri")}</span>}
        <span className="ms-auto flex items-center gap-1.5"><KbdGroup keys={["esc"]} size="sm" /> {c("close", "kapat")}</span>
      </div>
    </CommandDialog>
  );
}
