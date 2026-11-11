"use client";

import * as React from "react";
import { Check, Copy, Search } from "lucide-react";
import {
  Avatar,
  Badge,
  Button,
  Checkbox,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  Field,
  Input,
  Kbd,
  Sheet,
  SheetBody,
  SheetContent,
  SheetHeader,
  cn,
  toast,
} from "@vamos-ui/react";
import { useBlockFormat } from "../../_shared/format";
import { me } from "../../_shared/people";
import { minutesFromNow, NOW_MS } from "../../_shared/time";
import { apiKeys, apiScopes, initialLogs, keyName, newSecret, requestAt, webhookDeliveries, type ApiKey, type Env, type Page } from "./data";
import { KeysPage, LogsPage, OverviewPage, WebhooksPage, statusTone, useClock } from "./pages";
import { Palette } from "./palette";

const pageKeys: Record<string, Page> = { o: "overview", l: "logs", k: "keys", w: "webhooks" };

/**
 * Developer console with almost no chrome: a one-line header, the page, and a status line.
 * Everything else — navigation, actions, environments, request lookup — lives in ⌘K.
 * Shortcuts: ⌘K or / opens the palette, g then o/l/k/w jumps, c creates a key, p pauses the tail.
 */
export function DevConsole() {
  const { c } = useBlockFormat();
  const clock = useClock();
  const [page, setPage] = React.useState<Page>("overview");
  const [env, setEnv] = React.useState<Env>("live");
  const [paletteOpen, setPaletteOpen] = React.useState(false);
  const [logs, setLogs] = React.useState(initialLogs);
  const [fresh, setFresh] = React.useState<Set<string>>(new Set());
  const [live, setLive] = React.useState(true);
  const [keys, setKeys] = React.useState<ApiKey[]>(apiKeys);
  const [deliveries, setDeliveries] = React.useState(webhookDeliveries);
  const [retrying, setRetrying] = React.useState<Set<string>>(new Set());
  const [requestId, setRequestId] = React.useState<string | null>(null);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [gPending, setGPending] = React.useState(false);
  const counter = React.useRef(60);

  // Live tail: a new request every 2.4 s while streaming (client only, after mount).
  React.useEffect(() => {
    if (!live) return;
    const id = window.setInterval(() => {
      const n = counter.current++;
      const at = NOW_MS + (n - 59) * 2400;
      const next = requestAt(n, at);
      setLogs((all) => [next, ...all].slice(0, 200));
      setFresh(new Set([next.id]));
    }, 2400);
    return () => window.clearInterval(id);
  }, [live]);

  // Global shortcuts (ignored while typing).
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
        return;
      }
      const el = e.target as HTMLElement;
      if (el.closest("input, textarea, [contenteditable=true], [role=dialog]") || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "/") {
        e.preventDefault();
        setPaletteOpen(true);
      } else if (gPending && pageKeys[e.key]) {
        setPage(pageKeys[e.key]!);
        setGPending(false);
      } else if (e.key === "g") {
        setGPending(true);
        window.setTimeout(() => setGPending(false), 1200);
      } else if (e.key === "c") {
        setCreateOpen(true);
      } else if (e.key === "p") {
        setLive((l) => !l);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [gPending]);

  const go = (p: Page) => setPage(p);
  const request = logs.find((l) => l.id === requestId) ?? null;

  const revoke = (id: string) => {
    const key = keys.find((k) => k.id === id)!;
    setKeys((all) => all.map((k) => (k.id === id ? { ...k, revoked: true } : k)));
    toast(c(`“${key.name}” revoked`, `“${key.name}” iptal edildi`), {
      description: c("Requests with this key now get 401.", "Bu anahtarla gelen istekler artık 401 alır."),
      action: { label: c("Undo", "Geri al"), onClick: () => setKeys((all) => all.map((k) => (k.id === id ? { ...k, revoked: false } : k))) },
    });
  };

  const retry = (id: string) => {
    setRetrying((s) => new Set(s).add(id));
    window.setTimeout(() => {
      setRetrying((s) => {
        const n = new Set(s);
        n.delete(id);
        return n;
      });
      setDeliveries((all) => {
        const d = all.find((x) => x.id === id)!;
        const ok = d.status !== 401; // the 401s need the new signing secret first
        if (ok) toast.success(c(`${d.event} delivered`, `${d.event} iletildi`));
        else toast.danger(c("Still failing with 401", "Hâlâ 401 hatası"), { description: c("The endpoint rejects our signature. Update its signing secret, then retry.", "Uç nokta imzamızı reddediyor. İmza anahtarını güncelleyip yeniden deneyin.") });
        return [{ ...d, id: `${id}-r${Date.now()}`, status: ok ? 200 : 401, attempt: d.attempt + 1, at: minutesFromNow(0), duration: ok ? 188 : 92 }, ...all];
      });
    }, 900);
  };

  const titles: Record<Page, string> = { overview: c("overview", "genel-bakis"), logs: "logs", keys: "keys", webhooks: "webhooks" };

  return (
    <div className="relative z-10 flex min-h-dvh flex-col">
      <header className="sticky top-0 z-20 flex h-12 items-center gap-3 border-b border-line bg-bar px-4 backdrop-blur md:px-6">
        <span className="grid size-6 place-items-center rounded-ui-sm bg-fg font-mono text-[11px] font-bold text-scene" aria-hidden>
          {">_"}
        </span>
        <nav aria-label={c("Location", "Konum")} className="min-w-0 truncate font-mono text-[12.5px]">
          <span className="text-fg-muted max-sm:hidden">kiln-linen / </span>
          <button type="button" onClick={() => setPaletteOpen(true)} className={cn("rounded-ui-sm px-1 outline-none hover:bg-hover focus-ring", env === "live" ? "text-fg" : "text-info")}>
            {env}
          </button>
          <span className="text-fg-muted"> / </span>
          <span aria-current="page">{titles[page]}</span>
        </nav>
        <button
          type="button"
          onClick={() => setPaletteOpen(true)}
          className="ms-auto flex h-8 w-full max-w-md items-center gap-2 rounded-ui border border-field-border bg-field px-3 text-[13px] text-fg-muted outline-none transition-colors hover:border-field-border-hover focus-ring max-sm:w-8 max-sm:justify-center max-sm:px-0 sm:mx-auto"
          aria-keyshortcuts="Meta+K Control+K /"
        >
          <Search className="size-3.5 shrink-0" />
          <span className="truncate max-sm:sr-only">{c("Search or run a command", "Ara veya komut çalıştır")}</span>
          <span className="ms-auto flex gap-0.5 max-sm:hidden">
            <Kbd keyName="mod" size="sm" />
            <Kbd size="sm">K</Kbd>
          </span>
        </button>
        <Avatar name={me.name} size="sm" className="sm:ms-0" />
      </header>

      {env === "test" && (
        <div className="tone-info tone-soft border-b border-line px-4 py-1.5 text-center text-xs md:px-6">
          {c("Test mode — data here never touches real orders.", "Test modu — buradaki veriler gerçek siparişlere dokunmaz.")}
        </div>
      )}

      <main className="mx-auto w-full max-w-6xl min-w-0 flex-1 px-4 py-8 md:px-8 md:py-10">
        <div key={page} className="ui-fade">
          {page === "overview" && <OverviewPage logs={logs} keys={keys} onOpen={setRequestId} onGo={go} />}
          {page === "logs" && <LogsPage logs={logs} live={live} onToggleLive={() => setLive((l) => !l)} onOpen={setRequestId} freshIds={fresh} />}
          {page === "keys" && <KeysPage keys={keys} onCreate={() => setCreateOpen(true)} onRevoke={revoke} />}
          {page === "webhooks" && <WebhooksPage deliveries={deliveries} retrying={retrying} onRetry={retry} />}
        </div>
      </main>

      <footer className="sticky bottom-0 flex h-8 items-center gap-4 border-t border-line bg-bar px-4 font-mono text-[11px] text-fg-muted backdrop-blur md:px-6">
        <span className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-success" aria-hidden />
          {c("API operational", "API çalışıyor")}
        </span>
        <span className="max-sm:hidden">eu-central · p95 212 ms</span>
        <span className="ms-auto flex items-center gap-1.5" aria-live="polite">
          {gPending ? <><Kbd size="sm">g</Kbd> {c("then o · l · k · w", "sonra o · l · k · w")}</> : <><Kbd size="sm">/</Kbd> {c("commands", "komutlar")}</>}
        </span>
      </footer>

      <Palette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        page={page}
        env={env}
        live={live}
        logs={logs}
        onGo={go}
        onEnv={(e) => {
          setEnv(e);
          toast(e === "live" ? c("Switched to live", "Canlı ortama geçildi") : c("Switched to test", "Test ortamına geçildi"));
        }}
        onToggleLive={() => setLive((l) => !l)}
        onCreateKey={() => setCreateOpen(true)}
        onTestWebhook={() => toast.promise(new Promise((r) => window.setTimeout(r, 900)), { loading: c("Sending order.created to 2 endpoints…", "order.created 2 uç noktaya gönderiliyor…"), success: c("Test event delivered", "Test olayı iletildi"), error: c("Delivery failed", "Gönderim başarısız") })}
        onOpenRequest={(id) => setRequestId(id)}
        onDocs={(topic) => toast(c(`Docs: ${topic}`, `Doküman: ${topic}`), { description: c("Opens the API reference in a new tab.", "API referansı yeni sekmede açılır.") })}
      />

      <Sheet open={!!request} onOpenChange={(o) => !o && setRequestId(null)}>
        <SheetContent side="end" size="lg">
          {request && (
            <>
              <SheetHeader title={<span className="font-mono">{request.method} {request.path}</span>} description={<span className="font-mono">{request.id}</span>} action={<Badge tone={statusTone(request.status)} shape="square">{request.status}</Badge>} />
              <SheetBody className="grid grid-cols-[minmax(0,1fr)] gap-5">
                <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-[13px]">
                  {[
                    [c("Time", "Saat"), clock(request.at)],
                    [c("Duration", "Süre"), `${request.duration} ms`],
                    [c("API key", "API anahtarı"), keyName(request.keyId)],
                    ["IP", request.ip],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <dt className="text-xs text-fg-muted">{k}</dt>
                      <dd className="mt-0.5 font-mono">{v}</dd>
                    </div>
                  ))}
                </dl>
                <section>
                  <h3 className="mb-1.5 text-xs font-medium text-fg-muted">{c("Response body", "Yanıt gövdesi")}</h3>
                  <pre className="overflow-x-auto rounded-ui border border-line bg-surface-2 p-3 font-mono text-[12px] leading-relaxed">
                    {JSON.stringify(
                      request.status >= 400
                        ? { error: { type: request.status === 429 ? "rate_limited" : request.status >= 500 ? "upstream_timeout" : "invalid_request", message: request.status === 429 ? "Too many requests. Retry after 2 seconds." : request.status >= 500 ? "The warehouse service did not answer in time." : "Field `lines[0].sku` is not a known product.", request_id: request.id } }
                        : { object: request.path.includes("orders") ? "order" : request.path.includes("stock") ? "stock_level" : "list", id: "ord_8KQ2", status: "paid", total: { amount: "4280.00", currency: "TRY" } },
                      null,
                      2,
                    )}
                  </pre>
                </section>
                <Button variant="secondary" className="justify-self-start" onClick={() => { navigator.clipboard?.writeText(`curl -X ${request.method} https://api.example.com${request.path}`).catch(() => {}); toast(c("cURL copied", "cURL kopyalandı")); }}>
                  <Copy />
                  {c("Copy as cURL", "cURL olarak kopyala")}
                </Button>
              </SheetBody>
            </>
          )}
        </SheetContent>
      </Sheet>

      <CreateKeyDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        env={env}
        onCreate={(name, scopes, secret) => {
          setKeys((all) => [{ id: `key-${Date.now()}`, name, masked: `${secret.slice(0, 8)}…${secret.slice(-4)}`, scopes, createdBy: me.id, created: "2026-11-18", lastUsed: undefined }, ...all]);
          setPage("keys");
        }}
      />
    </div>
  );
}

function CreateKeyDialog({ open, onOpenChange, env, onCreate }: { open: boolean; onOpenChange: (o: boolean) => void; env: Env; onCreate: (name: string, scopes: string[], secret: string) => void }) {
  const { c, t } = useBlockFormat();
  const [name, setName] = React.useState("");
  const [scopes, setScopes] = React.useState<string[]>(["orders:read"]);
  const [secret, setSecret] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);
  const [touched, setTouched] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setName("");
      setScopes(["orders:read"]);
      setSecret(null);
      setCopied(false);
      setTouched(false);
    }
  }, [open]);

  const error = touched && !name.trim() ? c("Give the key a name you'll recognise later.", "Anahtara sonra tanıyacağınız bir ad verin.") : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader title={secret ? c("Copy your new key", "Yeni anahtarınızı kopyalayın") : c("Create API key", "API anahtarı oluştur")} description={secret ? c("This is the only time the full key is shown.", "Anahtarın tamamı yalnızca bu kez gösterilir.") : c(`Keys created here work in ${env} mode only.`, `Burada oluşturulan anahtarlar yalnızca ${env} modunda çalışır.`)} />
        {secret ? (
          <DialogBody>
            <div className="flex items-center gap-2 rounded-ui border border-line bg-surface-2 p-2 ps-3">
              <code className="min-w-0 flex-1 truncate font-mono text-[12.5px]">{secret}</code>
              <Button size="sm" variant="secondary" onClick={() => { navigator.clipboard?.writeText(secret).catch(() => {}); setCopied(true); }}>
                {copied ? <Check /> : <Copy />}
                {copied ? c("Copied", "Kopyalandı") : c("Copy", "Kopyala")}
              </Button>
            </div>
          </DialogBody>
        ) : (
          <DialogBody className="grid gap-5">
            <Field label={c("Name", "Ad")} error={error} required>
              <Input value={name} onChange={(e) => setName(e.target.value)} onBlur={() => setTouched(true)} placeholder={c("e.g. Shopfront sync", "ör. Mağaza senkronu")} autoFocus />
            </Field>
            <fieldset>
              <legend className="mb-2 text-[13px] font-medium">{c("Permissions", "İzinler")}</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {apiScopes.map((s) => (
                  <Checkbox
                    key={s.key}
                    checked={scopes.includes(s.key)}
                    onCheckedChange={(v) => setScopes((all) => (v ? [...all, s.key] : all.filter((x) => x !== s.key)))}
                    label={<span className="font-mono text-[12.5px]">{s.key}</span>}
                    description={t(s.label)}
                  />
                ))}
              </div>
            </fieldset>
          </DialogBody>
        )}
        <DialogFooter>
          {secret ? (
            <Button variant="primary" onClick={() => onOpenChange(false)}>{c("Done", "Tamam")}</Button>
          ) : (
            <>
              <Button variant="ghost" onClick={() => onOpenChange(false)}>{c("Cancel", "Vazgeç")}</Button>
              <Button
                variant="primary"
                disabled={scopes.length === 0}
                onClick={() => {
                  setTouched(true);
                  if (!name.trim()) return;
                  const s = newSecret(env, name.length * 131 + scopes.length);
                  setSecret(s);
                  onCreate(name.trim(), scopes, s);
                  toast.success(c(`“${name.trim()}” created`, `“${name.trim()}” oluşturuldu`));
                }}
              >
                {c("Create key", "Anahtar oluştur")}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
