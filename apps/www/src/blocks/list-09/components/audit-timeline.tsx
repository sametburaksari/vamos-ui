"use client";

import * as React from "react";
import { ArrowRight, Cpu, Globe, KeyRound, Smartphone, Undo2, Webhook } from "lucide-react";
import { Avatar, Badge, cn } from "@vamos-ui/react";
import { Stagger } from "@vamos-ui/react/motion";
import { useBlockFormat } from "../../_shared/format";
import type { L } from "../../_shared/l10n";
import { person } from "../../_shared/people";
import { TODAY, day } from "../../_shared/time";
import { severityLabels, sourceLabels, type AuditEntry, type Source } from "./audit-data";

export const sourceIcon: Record<Source, React.ReactNode> = {
  web: <Globe aria-hidden />,
  mobile: <Smartphone aria-hidden />,
  api: <Webhook aria-hidden />,
  system: <Cpu aria-hidden />,
};

export function actorName(id: string, system: string) {
  if (id === "system") return system;
  if (id.startsWith("key:")) return id.slice(4);
  return person(id).name;
}

/** Avatar for a person; a square glyph for the system and for API keys. */
export function ActorMark({ id, size = "sm" }: { id: string; size?: "xs" | "sm" | "md" }) {
  const { c } = useBlockFormat();
  if (id === "system" || id.startsWith("key:")) {
    const box = size === "xs" ? "size-5 [&_svg]:size-3" : size === "sm" ? "size-6 [&_svg]:size-3.5" : "size-10 [&_svg]:size-5";
    return (
      <span
        role="img"
        aria-label={id === "system" ? c("System", "Sistem") : c(`API key ${id.slice(4)}`, `API anahtarı ${id.slice(4)}`)}
        className={cn("grid shrink-0 place-items-center rounded-ui-sm bg-selected text-fg-muted", box)}
      >
        {id === "system" ? <Cpu aria-hidden /> : <KeyRound aria-hidden />}
      </span>
    );
  }
  return <Avatar name={person(id).name} size={size} />;
}

/** "field_name" → "Field name". */
export const humanize = (field: string) => field.replace(/_/g, " ").replace(/^\w/, (m) => m.toUpperCase());

/** Up to two field changes inline; the rest are counted. */
function DiffPreview({ changes }: { changes: NonNullable<AuditEntry["changes"]> }) {
  const { c } = useBlockFormat();
  const shown = changes.slice(0, 2);
  return (
    <span className="mt-2 grid gap-1 rounded-ui-sm border border-line bg-surface-2 px-2.5 py-2 font-mono text-[11.5px] leading-snug">
      {shown.map((ch) => (
        <span key={ch.field} className="grid min-w-0 grid-cols-[minmax(4.5rem,auto)_minmax(0,1fr)] items-baseline gap-x-2 max-sm:grid-cols-1">
          <span className="truncate text-fg-subtle">{humanize(ch.field)}</span>
          <span className="flex min-w-0 flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
            {ch.from !== null ? (
              <>
                <del className="max-w-full truncate text-fg-subtle decoration-danger/70">{ch.from}</del>
                <ArrowRight className="size-3 shrink-0 translate-y-0.5 text-fg-subtle" aria-label={c("changed to", "şuna değişti")} />
              </>
            ) : (
              <span className="text-fg-subtle">{c("set to", "değer:")}</span>
            )}
            <ins className="max-w-full truncate text-fg no-underline">{ch.to ?? "—"}</ins>
          </span>
        </span>
      ))}
      {changes.length > 2 ? (
        <span className="text-fg-subtle">
          +{changes.length - 2} {c("more", "daha")}
        </span>
      ) : null}
    </span>
  );
}

function dayHeading(date: string, f: ReturnType<typeof useBlockFormat>["f"], c: (en: string, tr: string) => string) {
  if (date === TODAY) return c("Today", "Bugün");
  if (date === day(-1)) return c("Yesterday", "Dün");
  return f.date(date, { weekday: "long", day: "numeric", month: "long" });
}

interface AuditTimelineProps {
  entries: AuditEntry[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

/** Events grouped by day on a vertical rail: time, actor, sentence, target and a diff preview. */
export function AuditTimeline({ entries, selectedId, onSelect }: AuditTimelineProps) {
  const { c, t, f } = useBlockFormat();
  const refs = React.useRef(new Map<string, HTMLButtonElement>());
  const groups: Array<{ date: string; items: AuditEntry[] }> = [];
  for (const e of entries) {
    const d = e.at.slice(0, 10);
    const g = groups.at(-1);
    if (g?.date === d) g.items.push(e);
    else groups.push({ date: d, items: [e] });
  }
  const flat = entries.map((e) => e.id);

  // j / k and arrow keys walk the log like a mail client.
  const onKeyDown = (e: React.KeyboardEvent, id: string) => {
    const i = flat.indexOf(id);
    const next = e.key === "ArrowDown" || e.key === "j" ? i + 1 : e.key === "ArrowUp" || e.key === "k" ? i - 1 : null;
    if (next === null || next < 0 || next >= flat.length) return;
    e.preventDefault();
    refs.current.get(flat[next]!)?.focus();
  };

  return (
    <div className="grid gap-6">
      {groups.map((g) => (
        <section key={g.date} aria-labelledby={`day-${g.date}`}>
          <h2
            id={`day-${g.date}`}
            className="sticky top-14 z-10 -mx-1 mb-2 flex items-baseline gap-2 bg-[color-mix(in_oklch,var(--scene)_86%,transparent)] px-1 py-1.5 backdrop-blur-sm"
          >
            <span className="font-display text-lg leading-none text-fg">{dayHeading(g.date, f, c)}</span>
            {g.date === TODAY || g.date === day(-1) ? <span className="text-xs text-fg-subtle">{f.date(g.date, { day: "numeric", month: "short" })}</span> : null}
            <span className="ms-auto font-mono text-[11px] text-fg-subtle tabular">
              {g.items.length} {g.items.length === 1 ? c("event", "olay") : c("events", "olay")}
            </span>
          </h2>
          <Stagger asChild step={30}>
            <ol className="relative grid">
              {g.items.map((e, i) => {
                const active = e.id === selectedId;
                const last = i === g.items.length - 1;
                return (
                  <li key={e.id} className="relative grid grid-cols-[3rem_1.25rem_minmax(0,1fr)] gap-x-2 sm:grid-cols-[3.5rem_1.5rem_minmax(0,1fr)]">
                    <time dateTime={e.at} className="pt-3 text-end font-mono text-[11.5px] text-fg-subtle tabular">
                      {f.time(e.at, {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                        timeZone: "Europe/Istanbul",
                      })}
                    </time>
                    <span aria-hidden="true" className="relative flex justify-center">
                      {!last ? <span className="absolute top-5 bottom-0 w-px bg-line" /> : null}
                      {i > 0 ? <span className="absolute top-0 h-3.5 w-px bg-line" /> : null}
                      <span
                        className={cn(
                          "relative mt-3.5 size-2.5 rounded-full ring-4 ring-[var(--scene)]",
                          e.severity === "critical" ? "bg-danger" : e.severity === "notice" ? "bg-warning" : "bg-fg-subtle",
                          active && "outline-2 outline-offset-2 outline-accent",
                        )}
                      />
                    </span>
                    <button
                      type="button"
                      ref={(el) => {
                        if (el) refs.current.set(e.id, el);
                        else refs.current.delete(e.id);
                      }}
                      aria-pressed={active}
                      onClick={() => onSelect(e.id)}
                      onKeyDown={(ev) => onKeyDown(ev, e.id)}
                      className={cn("mb-1 min-w-0 rounded-ui px-3 py-2.5 text-start transition-colors focus-ring", active ? "bg-selected" : "hover:bg-hover")}
                    >
                      <span className="flex min-w-0 items-start gap-2.5">
                        <ActorMark id={e.actorId} size="xs" />
                        <span className="min-w-0 text-[13.5px] leading-snug text-fg-muted">
                          <strong className="font-medium text-fg">{actorName(e.actorId, c("System", "Sistem"))}</strong> {t(e.summary)}
                        </span>
                      </span>
                      <span className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 ps-7.5 text-[11.5px] text-fg-subtle">
                        <span className="font-mono text-fg-muted">{e.action}</span>
                        <span className="inline-flex items-center gap-1 [&_svg]:size-3">
                          {sourceIcon[e.source]} {t(sourceLabels[e.source])}
                        </span>
                        {e.ip ? <span className="font-mono tabular max-sm:hidden">{e.ip}</span> : null}
                        {e.severity !== "info" ? (
                          <Badge size="sm" tone={e.severity === "critical" ? "danger" : "warning"}>
                            {t(severityLabels[e.severity] as L)}
                          </Badge>
                        ) : null}
                        {e.revertedBy ? (
                          <Badge size="sm" tone="outline" className="gap-1 [&_svg]:size-3">
                            <Undo2 aria-hidden /> {c("Reverted", "Geri alındı")}
                          </Badge>
                        ) : null}
                      </span>
                      {e.changes?.length ? (
                        <span className="block ps-7.5">
                          <DiffPreview changes={e.changes} />
                        </span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ol>
          </Stagger>
        </section>
      ))}
    </div>
  );
}
