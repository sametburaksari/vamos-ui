"use client";

import * as React from "react";
import { Copy, Pause, Play, Plus, RotateCw, Search } from "lucide-react";
import {
  Avatar,
  Badge,
  Button,
  EmptyState,
  IconButton,
  Input,
  Progress,
  Sparkline,
  ToggleGroup,
  ToggleGroupItem,
  cn,
  type BadgeProps,
} from "@vamos-ui/react";
import { CountUp, Stagger } from "@vamos-ui/react/motion";
import { useBlockFormat } from "../../_shared/format";
import { person } from "../../_shared/people";
import { NOW_MS } from "../../_shared/time";
import { apiScopes, errorsHourly, hourly, keyName, statusClass, webhookEndpoints, type ApiKey, type RequestLog, type WebhookDelivery } from "./data";

export const statusTone = (s: number): BadgeProps["tone"] => (s >= 500 ? "danger" : s >= 400 ? "warning" : "success");

export function useClock() {
  const { f } = useBlockFormat();
  return (at: number | string) => f.time(typeof at === "number" ? new Date(at) : at, { hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23", timeZone: "Europe/Istanbul" });
}

function PageTitle({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <h1 className="me-auto font-heading text-2xl font-semibold tracking-tight md:text-[28px]">{title}</h1>
      {children}
    </div>
  );
}

/** One request row, used by Overview and Logs. */
function LogLine({ l, onOpen, fresh }: { l: RequestLog; onOpen: (id: string) => void; fresh?: boolean }) {
  const clock = useClock();
  return (
    <li className={cn(fresh && "ui-fade")}>
      <button type="button" onClick={() => onOpen(l.id)} className="grid w-full grid-cols-[4.5rem_3.25rem_minmax(0,1fr)_2.75rem] items-center gap-x-3 px-3 py-2 text-start font-mono text-[12.5px] outline-none hover:bg-hover focus-ring sm:grid-cols-[4.5rem_3.5rem_minmax(0,1fr)_3rem_4.5rem_8rem]">
        <span className="text-fg-subtle tabular">{clock(l.at)}</span>
        <span className={cn("font-medium", l.method === "GET" ? "text-fg-muted" : "text-fg")}>{l.method}</span>
        <span className="truncate">{l.path}</span>
        <span className={cn("text-end tabular", l.status >= 500 ? "font-semibold text-danger" : l.status >= 400 ? "text-warning" : "text-fg-muted")}>{l.status}</span>
        <span className="hidden text-end text-fg-subtle tabular sm:block">{l.duration} ms</span>
        <span className="hidden truncate text-end text-fg-subtle sm:block">{keyName(l.keyId)}</span>
      </button>
    </li>
  );
}

/* Overview ---------------------------------------------------------------- */

export function OverviewPage({ logs, keys, onOpen, onGo }: { logs: RequestLog[]; keys: ApiKey[]; onOpen: (id: string) => void; onGo: (p: "logs" | "keys") => void }) {
  const { c, f } = useBlockFormat();
  const total = hourly.reduce((a, b) => a + b, 0);
  const errors = errorsHourly.reduce((a, b) => a + b, 0);
  const kpis = [
    { label: c("Requests · 24h", "İstek · 24 sa"), value: total, format: undefined, spark: hourly },
    { label: c("Error rate", "Hata oranı"), value: (errors / total) * 100, format: { maximumFractionDigits: 2 }, suffix: "%", spark: errorsHourly },
    { label: c("p95 latency", "p95 gecikme"), value: 212, suffix: " ms" },
    { label: c("Webhook success", "Webhook başarısı"), value: 97.4, format: { maximumFractionDigits: 1 }, suffix: "%" },
  ];
  return (
    <div className="grid gap-8">
      <PageTitle title={c("Overview", "Genel bakış")}>
        <span className="text-xs text-fg-muted">{c("Last 24 hours", "Son 24 saat")}</span>
      </PageTitle>
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-ui border border-line bg-line lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="bg-surface px-4 py-4">
            <dt className="font-mono text-[11px] tracking-wide text-fg-muted uppercase">{k.label}</dt>
            <dd className="mt-2">
              <span className="font-heading text-2xl font-semibold tabular">
                <CountUp value={k.value} format={k.format} duration={900} />
                {k.suffix && <span className="text-base font-normal text-fg-muted">{k.suffix}</span>}
              </span>
              {k.spark && <Sparkline className="mt-3" values={k.spark} variant="bars" width="100%" height={28} color={k.spark === errorsHourly ? "danger" : undefined} label={k.label} />}
            </dd>
          </div>
        ))}
      </dl>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section aria-labelledby="recent-h" className="min-w-0">
          <div className="mb-2 flex items-center">
            <h2 id="recent-h" className="me-auto text-[13px] font-semibold">{c("Latest requests", "Son istekler")}</h2>
            <Button size="xs" variant="ghost" onClick={() => onGo("logs")}>{c("All logs", "Tüm kayıtlar")}</Button>
          </div>
          <Stagger asChild step={30} effect="fade">
            <ul className="divide-y divide-line overflow-hidden rounded-ui border border-line bg-surface">
              {logs.slice(0, 8).map((l) => <LogLine key={l.id} l={l} onOpen={onOpen} />)}
            </ul>
          </Stagger>
        </section>
        <section aria-labelledby="keys-h">
          <div className="mb-2 flex items-center">
            <h2 id="keys-h" className="me-auto text-[13px] font-semibold">{c("Active keys", "Etkin anahtarlar")}</h2>
            <Button size="xs" variant="ghost" onClick={() => onGo("keys")}>{c("Manage", "Yönet")}</Button>
          </div>
          <ul className="grid gap-2">
            {keys.filter((k) => !k.revoked).map((k) => (
              <li key={k.id} className="flex items-center gap-3 rounded-ui border border-line bg-surface px-3 py-2.5">
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium">{k.name}</span>
                  <span className="block truncate font-mono text-[11.5px] text-fg-muted">{k.masked}</span>
                </span>
                <span className="text-xs text-fg-subtle">{k.lastUsed ? f.relative(k.lastUsed, { now: NOW_MS }) : "—"}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 rounded-ui border border-line bg-surface px-3 py-3">
            <Progress value={61} size="xs" tone="auto" label={c("Rate limit, this minute", "Hız sınırı, bu dakika")} showValue hint={c("610 of 1,000 requests", "1.000 isteğin 610'u")} />
          </div>
        </section>
      </div>
    </div>
  );
}

/* Logs -------------------------------------------------------------------- */

type StatusFilter = "all" | "2xx" | "4xx" | "5xx";

export function LogsPage({ logs, live, onToggleLive, onOpen, freshIds }: { logs: RequestLog[]; live: boolean; onToggleLive: () => void; onOpen: (id: string) => void; freshIds: Set<string> }) {
  const { c } = useBlockFormat();
  const [filter, setFilter] = React.useState<StatusFilter>("all");
  const [q, setQ] = React.useState("");
  const rows = logs.filter((l) => (filter === "all" || statusClass(l.status) === filter) && (!q || `${l.id} ${l.path} ${l.method}`.toLowerCase().includes(q.toLowerCase())));
  return (
    <div className="grid gap-5">
      <PageTitle title={c("Request logs", "İstek kayıtları")}>
        <Button size="sm" variant={live ? "secondary" : "soft"} onClick={onToggleLive} aria-pressed={live}>
          {live ? <Pause /> : <Play />}
          {live ? c("Pause tail", "Akışı duraklat") : c("Resume tail", "Akışı sürdür")}
        </Button>
      </PageTitle>
      <div className="flex flex-wrap items-center gap-2">
        <ToggleGroup type="single" size="sm" value={filter} onValueChange={(v) => v && setFilter(v as StatusFilter)} aria-label={c("Status", "Durum")}>
          <ToggleGroupItem value="all">{c("All", "Tümü")}</ToggleGroupItem>
          <ToggleGroupItem value="2xx">2xx</ToggleGroupItem>
          <ToggleGroupItem value="4xx">4xx</ToggleGroupItem>
          <ToggleGroupItem value="5xx">5xx</ToggleGroupItem>
        </ToggleGroup>
        <Input size="sm" className="w-full sm:w-72" value={q} onChange={(e) => setQ(e.target.value)} clearable onClear={() => setQ("")} leading={<Search className="size-3.5" />} placeholder={c("Path or request id", "Yol veya istek kimliği")} aria-label={c("Filter requests", "İstekleri filtrele")} />
        <span className="ms-auto flex items-center gap-2 text-xs text-fg-muted" aria-live="polite">
          <span className={cn("size-1.5 rounded-full", live ? "bg-success" : "bg-fg-subtle")} aria-hidden />
          {live ? c("Streaming", "Canlı akış") : c("Paused", "Duraklatıldı")} · {rows.length}
        </span>
      </div>
      {rows.length === 0 ? (
        <EmptyState title={c("No requests match", "Eşleşen istek yok")} description={c("Clear the filter or widen the status range.", "Filtreyi temizleyin veya durum aralığını genişletin.")} />
      ) : (
        <div className="overflow-hidden rounded-ui border border-line bg-surface">
          <div className="hidden grid-cols-[4.5rem_3.5rem_minmax(0,1fr)_3rem_4.5rem_8rem] gap-x-3 border-b border-line bg-surface-2 px-3 py-2 font-mono text-[11px] tracking-wide text-fg-muted uppercase sm:grid" aria-hidden>
            <span>{c("Time", "Saat")}</span><span>{c("Method", "Metot")}</span><span>{c("Path", "Yol")}</span><span className="text-end">{c("Status", "Durum")}</span><span className="text-end">{c("Duration", "Süre")}</span><span className="text-end">{c("Key", "Anahtar")}</span>
          </div>
          <ul className="divide-y divide-line" aria-label={c("Requests", "İstekler")}>
            {rows.slice(0, 80).map((l) => <LogLine key={l.id} l={l} onOpen={onOpen} fresh={freshIds.has(l.id)} />)}
          </ul>
        </div>
      )}
    </div>
  );
}

/* Keys -------------------------------------------------------------------- */

export function KeysPage({ keys, onCreate, onRevoke }: { keys: ApiKey[]; onCreate: () => void; onRevoke: (id: string) => void }) {
  const { c, t, f } = useBlockFormat();
  return (
    <div className="grid gap-5">
      <PageTitle title={c("API keys", "API anahtarları")}>
        <Button size="sm" variant="primary" onClick={onCreate}>
          <Plus />
          {c("Create key", "Anahtar oluştur")}
        </Button>
      </PageTitle>
      <Stagger asChild step={40} effect="fade">
        <ul className="grid gap-3">
          {keys.map((k) => (
            <li key={k.id} className={cn("rounded-ui border border-line bg-surface p-4", k.revoked && "opacity-60")}>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <p className="font-medium">{k.name}</p>
                {k.revoked ? <Badge tone="outline">{c("Revoked", "İptal edildi")}</Badge> : k.masked.startsWith("vk_test") ? <Badge tone="info">{c("Test", "Test")}</Badge> : <Badge tone="accent">{c("Live", "Canlı")}</Badge>}
                {k.expires && !k.revoked && <Badge tone="warning">{c(`Expires ${f.date(k.expires, { day: "numeric", month: "short" })}`, `${f.date(k.expires, { day: "numeric", month: "short" })} tarihinde bitiyor`)}</Badge>}
                <span className="ms-auto flex items-center gap-1">
                  <IconButton label={c("Copy key id", "Anahtar kimliğini kopyala")} size="xs" variant="ghost" onClick={() => navigator.clipboard?.writeText(k.masked).catch(() => {})}>
                    <Copy />
                  </IconButton>
                  {!k.revoked && (
                    <Button size="xs" variant="danger-ghost" onClick={() => onRevoke(k.id)}>
                      {c("Revoke", "İptal et")}
                    </Button>
                  )}
                </span>
              </div>
              <p className="mt-1 font-mono text-[12.5px] text-fg-muted">{k.masked}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {k.scopes.map((s) => (
                  <Badge key={s} tone="neutral" shape="square" title={t(apiScopes.find((x) => x.key === s)?.label ?? { en: s, tr: s })}>
                    <span className="font-mono">{s}</span>
                  </Badge>
                ))}
              </div>
              <p className="mt-3 flex items-center gap-2 text-xs text-fg-muted">
                <Avatar name={person(k.createdBy).name} size="xs" />
                {c(`Created by ${person(k.createdBy).name} · ${f.date(k.created)}`, `${person(k.createdBy).name} oluşturdu · ${f.date(k.created)}`)}
                {k.lastUsed && <> · {c(`last used ${f.relative(k.lastUsed, { now: NOW_MS })}`, `son kullanım ${f.relative(k.lastUsed, { now: NOW_MS })}`)}</>}
              </p>
            </li>
          ))}
        </ul>
      </Stagger>
    </div>
  );
}

/* Webhooks ---------------------------------------------------------------- */

export function WebhooksPage({ deliveries, retrying, onRetry }: { deliveries: WebhookDelivery[]; retrying: Set<string>; onRetry: (id: string) => void }) {
  const { c, f } = useBlockFormat();
  return (
    <div className="grid gap-6">
      <PageTitle title={c("Webhooks", "Webhook'lar")} />
      <ul className="grid gap-3 lg:grid-cols-3">
        {webhookEndpoints.map((e) => (
          <li key={e.id} className="rounded-ui border border-line bg-surface p-4">
            <div className="flex items-center gap-2">
              <span className={cn("size-2 rounded-full", e.active ? (e.successRate > 0.95 ? "bg-success" : "bg-warning") : "bg-fg-subtle")} aria-hidden />
              <span className="text-xs text-fg-muted">{e.active ? c("Enabled", "Etkin") : c("Disabled", "Devre dışı")}</span>
            </div>
            <p className="mt-2 truncate font-mono text-[12.5px]" title={e.url}>{e.url.replace("https://", "")}</p>
            <p className="mt-1 truncate text-xs text-fg-muted">{e.events.join(", ")}</p>
            {e.active && <Progress className="mt-3" value={e.successRate * 100} size="xs" tone="auto" label={c("Success, 7 days", "Başarı, 7 gün")} showValue={(v) => f.percent(v / 100)} />}
          </li>
        ))}
      </ul>
      <section aria-labelledby="dl-h">
        <h2 id="dl-h" className="mb-2 text-[13px] font-semibold">{c("Recent deliveries", "Son gönderimler")}</h2>
        <ul className="divide-y divide-line overflow-hidden rounded-ui border border-line bg-surface">
          {deliveries.map((d) => {
            const failed = d.status >= 300;
            const busy = retrying.has(d.id);
            return (
              <li key={d.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2.5 font-mono text-[12.5px]">
                <Badge tone={statusTone(d.status)} shape="square" className="w-12 justify-center">{d.status}</Badge>
                <span className="min-w-0 flex-1 truncate">{d.event}</span>
                <span className="text-fg-subtle">{c(`attempt ${d.attempt}`, `deneme ${d.attempt}`)}</span>
                <span className="w-16 text-end text-fg-subtle tabular">{d.duration} ms</span>
                <span className="w-28 text-end font-sans text-xs text-fg-muted">{f.relative(d.at, { now: NOW_MS })}</span>
                <span className="w-20 text-end">
                  {failed && (
                    <Button size="xs" variant="ghost" loading={busy} onClick={() => onRetry(d.id)}>
                      <RotateCw />
                      {c("Retry", "Yeniden")}
                    </Button>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
