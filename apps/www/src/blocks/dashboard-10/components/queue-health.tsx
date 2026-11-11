"use client";

import { Avatar, Badge, Card, CardHeader, Progress, cn } from "@vamos-ui/react";
import { useBlockFormat } from "../../_shared/format";
import { NOW_MS, agents, clockOf, offShift, queues, type Ticket } from "./data";
import type { QueueFilter } from "./sla-dashboard";

const segs = [
  { key: "breached", cls: "bg-danger" },
  { key: "at-risk", cls: "bg-warning" },
  { key: "on-track", cls: "bg-success" },
  { key: "paused", cls: "bg-fg-subtle/40" },
] as const;

/** One row per queue: open count, oldest ticket and how the clocks split. Rows filter the page. */
export function QueueHealth({ active, queue, onQueue }: { active: Ticket[]; queue: QueueFilter; onQueue: (q: QueueFilter) => void }) {
  const { f, t, c } = useBlockFormat();
  const segLabel = { breached: c("breached", "aşıldı"), "at-risk": c("at risk", "riskte"), "on-track": c("on track", "yolunda"), paused: c("paused", "duran") };

  return (
    <Card className="ui-rise min-w-0" style={{ animationDelay: "140ms" }}>
      <CardHeader titleAs="h2" title={c("Queue health", "Kuyruk sağlığı")} description={c("Select a queue to focus the page on it.", "Sayfayı bir kuyruğa odaklamak için seçin.")} />
      <ul className="px-2 pb-2">
        {queues.map((q) => {
          const list = active.filter((x) => x.queue === q.key);
          const split = { breached: 0, "at-risk": 0, "on-track": 0, paused: 0 };
          for (const x of list) {
            const s = clockOf(x).state;
            split[s === "breached" || s === "at-risk" || s === "paused" ? s : "on-track"]++;
          }
          const oldest = list.reduce<string | null>((o, x) => (!o || x.createdAt < o ? x.createdAt : o), null);
          const on = queue === q.key;
          const summary = segs.filter((s) => split[s.key]).map((s) => `${split[s.key]} ${segLabel[s.key]}`).join(", ");
          return (
            <li key={q.key}>
              <button
                type="button"
                aria-pressed={on}
                onClick={() => onQueue(on ? "all" : q.key)}
                className={cn("focus-ring grid w-full grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-2 rounded-ui px-3 py-2.5 text-start transition-colors", on ? "bg-selected" : "hover:bg-hover")}
              >
                <span className="min-w-0">
                  <span className="block text-[13px] font-medium text-fg">{t(q.label)}</span>
                  <span className="block truncate text-xs text-fg-subtle">
                    {oldest ? c(`Oldest ${f.relative(oldest, { now: NOW_MS })}`, `En eski ${f.relative(oldest, { now: NOW_MS })}`) : c("Empty", "Boş")}
                  </span>
                </span>
                <span className="text-end">
                  <span className="block font-mono text-[15px] font-medium text-fg tabular">{list.length}</span>
                  {split.breached ? <span className="block font-mono text-[11px] text-danger tabular">{c(`${split.breached} late`, `${split.breached} geç`)}</span> : null}
                </span>
                <span className="col-span-2 flex h-1.5 gap-px overflow-hidden rounded-full bg-track" role="img" aria-label={summary || c("No open tickets", "Açık talep yok")}>
                  {segs.map((s) => (split[s.key] ? <span key={s.key} className={cn("h-full transition-[flex-grow] duration-500", s.cls)} style={{ flexGrow: split[s.key] }} /> : null))}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

/** Agents on today's rota with their open load and how much of it is late. */
export function AgentsCard({ active }: { active: Ticket[] }) {
  const { t, c } = useBlockFormat();
  const unassigned = active.filter((x) => !x.assigneeId).length;
  return (
    <Card className="ui-rise min-w-0" style={{ animationDelay: "200ms" }}>
      <CardHeader
        titleAs="h2"
        title={c("On the rota", "Vardiyada")}
        description={unassigned ? c(unassigned === 1 ? "1 open ticket has no owner" : `${unassigned} open tickets have no owner`, `${unassigned} açık talebin sahibi yok`) : c("Every open ticket has an owner", "Her açık talebin bir sahibi var")}
      />
      <ul className="space-y-3 px-(--card-p) pb-(--card-p)">
        {agents.map((a) => {
          const mine = active.filter((x) => x.assigneeId === a.id);
          const late = mine.filter((x) => clockOf(x).state === "breached").length;
          const off = offShift.has(a.id);
          return (
            <li key={a.id} className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
              <Avatar size="sm" name={a.name} status={off ? "offline" : a.status} />
              <div className="min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <p className={cn("truncate text-[13px] font-medium", off ? "text-fg-muted" : "text-fg")}>{a.name}</p>
                  <p className="shrink-0 font-mono text-xs text-fg-muted tabular">
                    {mine.length}
                    {late ? <span className="text-danger"> · {c(`${late} late`, `${late} geç`)}</span> : null}
                  </p>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <Progress size="xs" value={mine.length} max={6} tone="auto" aria-label={c(`${a.name}: ${mine.length} of 6 open tickets`, `${a.name}: 6 talepten ${mine.length}`)} className="flex-1" />
                  {off ? <Badge size="sm" tone="neutral">{c("Off shift", "Vardiya dışı")}</Badge> : <span className="text-[11px] text-fg-subtle">{t(a.title)}</span>}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
