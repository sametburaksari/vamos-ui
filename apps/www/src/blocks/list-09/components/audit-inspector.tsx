"use client";

import * as React from "react";
import { Check, Copy, ExternalLink, Undo2 } from "lucide-react";
import { Badge, Button, FieldDiff, cn, type FieldDiffField } from "@vamos-ui/react";
import { useBlockFormat } from "../../_shared/format";
import { person } from "../../_shared/people";
import { clientFor, entityLabels, ipPlaces, revertible, severityLabels, sourceLabels, type AuditEntry } from "./audit-data";
import { ActorMark, actorName, humanize, sourceIcon } from "./audit-timeline";

function CopyValue({ value, label }: { value: string; label: string }) {
  const { c } = useBlockFormat();
  const [done, setDone] = React.useState(false);
  return (
    <span className="flex min-w-0 items-center gap-1">
      <span className="truncate font-mono text-[12px] text-fg">{value}</span>
      <Button
        size="icon-xs"
        variant="ghost"
        aria-label={c(`Copy ${label}`, `${label} kopyala`)}
        onClick={() => {
          void navigator.clipboard?.writeText(value).catch(() => {});
          setDone(true);
          window.setTimeout(() => setDone(false), 1400);
        }}
      >
        {done ? <Check /> : <Copy />}
      </Button>
      <span role="status" className="sr-only">
        {done ? c("Copied", "Kopyalandı") : ""}
      </span>
    </span>
  );
}

interface AuditInspectorProps {
  entry: AuditEntry;
  onRevert: (entry: AuditEntry) => void;
  className?: string;
}

/** Everything known about one event: who, from where, the full field diff and the raw record. */
export function AuditInspector({ entry, onRevert, className }: AuditInspectorProps) {
  const { c, t, f, ago } = useBlockFormat();
  const isPerson = entry.actorId !== "system" && !entry.actorId.startsWith("key:");
  const before = Object.fromEntries((entry.changes ?? []).map((ch) => [ch.field, ch.from]));
  const after = Object.fromEntries((entry.changes ?? []).map((ch) => [ch.field, ch.to]));
  const fields: FieldDiffField[] = (entry.changes ?? []).map((ch) => ({
    key: ch.field,
    label: humanize(ch.field),
    type: (ch.from?.length ?? 0) > 40 || (ch.to?.length ?? 0) > 40 ? "text-long" : "text",
  }));
  const raw = {
    id: entry.id,
    request_id: entry.requestId,
    occurred_at: entry.at,
    actor: entry.actorId,
    action: entry.action,
    target: entry.entity,
    source: entry.source,
    ip: entry.ip ?? null,
    changes: entry.changes ?? [],
  };
  const canRevert = revertible.has(entry.action) && !!entry.changes?.length && !entry.revertedBy;

  const rows: Array<[string, React.ReactNode]> = [
    [
      c("When", "Ne zaman"),
      <span key="w" className="tabular">
        {f.dateTime(entry.at, { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Istanbul" })} <span className="text-fg-subtle">· {ago(entry.at)}</span>
      </span>,
    ],
    [
      c("Target", "Hedef"),
      <span key="t">
        {t(entityLabels[entry.entity.type])} · <span className="font-mono text-[12px]">{entry.entity.label}</span>
      </span>,
    ],
    [
      c("Source", "Kaynak"),
      <span key="s" className="inline-flex items-center gap-1.5 [&_svg]:size-3.5 [&_svg]:text-fg-subtle">
        {sourceIcon[entry.source]} {t(sourceLabels[entry.source])} · {clientFor[entry.source]}
      </span>,
    ],
    [
      c("IP address", "IP adresi"),
      entry.ip ? (
        <span key="i">
          <span className="font-mono text-[12px]">{entry.ip}</span> <span className="text-fg-subtle">· {ipPlaces[entry.ip] ?? c("Unknown", "Bilinmiyor")}</span>
        </span>
      ) : (
        <span key="i" className="text-fg-subtle">
          {c("Internal", "Dahili")}
        </span>
      ),
    ],
    [c("Request ID", "İstek kimliği"), <CopyValue key="r" value={entry.requestId} label={c("request ID", "istek kimliğini")} />],
  ];

  return (
    <div className={cn("grid gap-5", className)}>
      <header className="flex items-start gap-3">
        <ActorMark id={entry.actorId} size="md" />
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-medium text-fg">{actorName(entry.actorId, c("System", "Sistem"))}</p>
          <p className="text-xs text-fg-subtle">
            {isPerson
              ? `${t(person(entry.actorId).title)} · ${person(entry.actorId).email}`
              : entry.actorId === "system"
                ? c("Automated job", "Otomatik iş")
                : c("API key", "API anahtarı")}
          </p>
        </div>
        <Badge tone={entry.severity === "critical" ? "danger" : entry.severity === "notice" ? "warning" : "neutral"} dot>
          {t(severityLabels[entry.severity])}
        </Badge>
      </header>

      <p className="font-display text-[1.25rem] leading-snug text-fg">
        {actorName(entry.actorId, c("System", "Sistem"))} {t(entry.summary)}
      </p>

      <dl className="grid grid-cols-[7rem_minmax(0,1fr)] gap-x-3 gap-y-2.5 text-[13px]">
        {rows.map(([k, v]) => (
          <React.Fragment key={k}>
            <dt className="text-fg-subtle">{k}</dt>
            <dd className="min-w-0 text-fg-muted">{v}</dd>
          </React.Fragment>
        ))}
      </dl>

      <section aria-labelledby={`chg-${entry.id}`} className="grid gap-2">
        <h3 id={`chg-${entry.id}`} className="text-[13px] font-medium text-fg">
          {c("Changes", "Değişiklikler")}
        </h3>
        {entry.changes?.length ? (
          <FieldDiff before={before} after={after} fields={fields} beforeLabel={c("Before", "Önce")} afterLabel={c("After", "Sonra")} />
        ) : (
          <p className="rounded-ui-sm bg-surface-2 px-3 py-2.5 text-[13px] text-fg-subtle">{c("No field changes on this event.", "Bu olayda alan değişikliği yok.")}</p>
        )}
      </section>

      <details className="group rounded-ui-sm border border-line">
        <summary className="cursor-pointer rounded-ui-sm px-3 py-2 text-[13px] text-fg-muted focus-ring">{c("Raw event", "Ham olay")}</summary>
        <pre className="max-h-64 overflow-auto border-t border-line px-3 py-2.5 font-mono text-[11.5px] leading-relaxed text-fg-muted">{JSON.stringify(raw, null, 2)}</pre>
      </details>

      <div className="flex flex-wrap gap-2">
        <Button size="sm" asChild>
          <a href={`#/${entry.entity.type}/${entry.entity.id}`}>
            <ExternalLink /> {c("Open", "Aç")} {entry.entity.label}
          </a>
        </Button>
        {canRevert ? (
          <Button size="sm" variant="ghost" onClick={() => onRevert(entry)}>
            <Undo2 /> {c("Revert this change", "Bu değişikliği geri al")}
          </Button>
        ) : null}
        {entry.revertedBy ? <Badge tone="outline">{c("Already reverted", "Zaten geri alındı")}</Badge> : null}
      </div>
    </div>
  );
}
