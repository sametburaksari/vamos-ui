"use client";

import * as React from "react";
import { Check, X } from "lucide-react";
import {
  Avatar,
  AvatarGroup,
  Badge,
  Button,
  Card,
  CardHeader,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  EmptyState,
  Textarea,
  cn,
} from "@vamos-ui/react";
import { Stagger } from "@vamos-ui/react/motion";
import { useBlockFormat } from "../../_shared/format";
import { person } from "../../_shared/people";
import { TODAY, calendarDays, isWeekend, leaveColor, leaveTypeLabels, type LeaveRequest } from "./data";

export interface LeaveBoardProps {
  requests: LeaveRequest[];
  onDecide: (id: string, status: "approved" | "declined", reason?: string) => void;
}

const first = calendarDays[0]!;
const last = calendarDays.at(-1)!;
const cols = `minmax(8.5rem,10rem) repeat(${calendarDays.length}, minmax(1.75rem,1fr))`;

/** Three weeks of who is out, and the requests waiting for a decision. */
export function LeaveBoard({ requests, onDecide }: LeaveBoardProps) {
  const { f, t, c } = useBlockFormat();
  const [declining, setDeclining] = React.useState<LeaveRequest | null>(null);
  const [reason, setReason] = React.useState("");

  const visible = requests
    .filter((r) => r.status !== "declined" && r.end >= first && r.start <= last)
    .sort((a, b) => a.start.localeCompare(b.start));
  const outToday = requests.filter((r) => r.status === "approved" && r.start <= TODAY && r.end >= TODAY);
  const pending = requests.filter((r) => r.status === "pending");

  return (
    <div className="grid gap-(--gap) xl:grid-cols-[minmax(0,1fr)_340px]">
      <Card className="ui-rise min-w-0" style={{ animationDelay: "180ms" }}>
        <CardHeader
          titleAs="h2"
          title={c("Who's out", "Kim izinde")}
          description={f.dateRange(first, last)}
          action={
            outToday.length ? (
              <span className="flex items-center gap-2 text-[13px] text-fg-muted">
                <AvatarGroup max={4} size="xs">
                  {outToday.map((r) => (
                    <Avatar key={r.id} name={person(r.personId).name} />
                  ))}
                </AvatarGroup>
                {c(`${outToday.length} out today`, `bugün ${outToday.length} kişi izinde`)}
              </span>
            ) : null
          }
        />
        <div className="relative overflow-x-auto border-t border-line focus-ring" tabIndex={0} role="region" aria-label={c("Leave calendar, scrolls sideways", "İzin takvimi, yana kaydırılabilir")}>
          <div className="min-w-[760px]" role="table" aria-label={c("Leave calendar", "İzin takvimi")}>
            <div role="row" className="grid border-b border-line text-center" style={{ gridTemplateColumns: cols }}>
              <span role="columnheader" className="px-(--card-p) py-2 text-start text-xs text-fg-subtle">{c("Person", "Kişi")}</span>
              {calendarDays.map((d) => (
                <span
                  role="columnheader"
                  key={d}
                  aria-label={f.date(d, { weekday: "long", month: "long", day: "numeric" })}
                  className={cn("py-1.5 text-[11px] leading-tight", isWeekend(d) ? "bg-surface-2 text-fg-subtle" : "text-fg-muted", d === TODAY && "font-medium text-fg")}
                >
                  <span className="block">{f.date(d, { weekday: "narrow" })}</span>
                  <span className={cn("mx-auto mt-0.5 grid size-5 place-items-center rounded-full font-mono tabular", d === TODAY && "bg-accent text-accent-fg")}>{f.date(d, { day: "numeric" })}</span>
                </span>
              ))}
            </div>
            <Stagger step={50}>
              {visible.map((r) => {
                const p = person(r.personId);
                const s = Math.max(0, calendarDays.indexOf(r.start < first ? first : r.start));
                const e = calendarDays.indexOf(r.end > last ? last : r.end);
                const pendingBar = r.status === "pending";
                return (
                  <div role="row" key={r.id} className="grid items-center border-b border-line last:border-b-0" style={{ gridTemplateColumns: cols }}>
                    <span role="rowheader" className="col-start-1 row-start-1 flex min-w-0 items-center gap-2 px-(--card-p) py-2.5">
                      <Avatar name={p.name} size="xs" aria-hidden />
                      <span className="truncate text-[13px] text-fg">{p.name}</span>
                    </span>
                    {calendarDays.map((d, i) => (
                      <span key={d} aria-hidden className={cn("row-start-1 h-full", isWeekend(d) && "bg-surface-2", d === TODAY && "border-x border-accent/40")} style={{ gridColumn: i + 2 }} />
                    ))}
                    <span
                      role="cell"
                      className={cn(
                        "row-start-1 mx-0.5 flex h-6 min-w-0 items-center overflow-hidden rounded-ui-sm px-1.5 text-[11px] font-medium whitespace-nowrap",
                        pendingBar ? "border border-dashed border-fg-subtle text-fg-muted" : "border-s-[3px] text-fg",
                        r.start < first && "rounded-s-none",
                        r.end > last && "rounded-e-none",
                      )}
                      style={{
                        gridColumn: `${s + 2} / ${e + 3}`,
                        background: pendingBar
                          ? `repeating-linear-gradient(135deg, color-mix(in oklab, ${leaveColor[r.type]} 22%, transparent) 0 4px, transparent 4px 8px)`
                          : `color-mix(in oklab, ${leaveColor[r.type]} 24%, var(--color-surface))`,
                        borderInlineStartColor: pendingBar ? undefined : leaveColor[r.type],
                      }}
                    >
                      <span className="truncate">
                        {t(leaveTypeLabels[r.type])}
                        {pendingBar ? ` · ${c("pending", "onay bekliyor")}` : ""}
                      </span>
                      <span className="sr-only">
                        {f.dateRange(r.start, r.end)}, {c(`${r.days} days`, `${r.days} gün`)}
                      </span>
                    </span>
                  </div>
                );
              })}
            </Stagger>
          </div>
        </div>
        <p className="flex flex-wrap gap-x-4 gap-y-1 border-t border-line px-(--card-p) py-2.5 text-xs text-fg-subtle">
          {(Object.keys(leaveColor) as Array<keyof typeof leaveColor>).map((k) => (
            <span key={k} className="inline-flex items-center gap-1.5">
              <span aria-hidden className="size-2.5 rounded-[3px]" style={{ background: leaveColor[k] }} />
              {t(leaveTypeLabels[k])}
            </span>
          ))}
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden className="size-2.5 rounded-[3px] border border-dashed border-fg-subtle" />
            {c("Awaiting approval", "Onay bekliyor")}
          </span>
        </p>
      </Card>

      <Card className="ui-rise min-w-0" style={{ animationDelay: "240ms" }}>
        <CardHeader
          titleAs="h2"
          title={c("Needs your decision", "Onayınızı bekleyenler")}
          action={pending.length ? <Badge tone="warning" count={pending.length} /> : null}
        />
        {pending.length === 0 ? (
          <EmptyState size="sm" title={c("All caught up", "Bekleyen talep yok")} description={c("New leave requests will show up here.", "Yeni izin talepleri burada görünür.")} />
        ) : (
          <ul className="border-t border-line">
            {pending.map((r) => {
              const p = person(r.personId);
              return (
                <li key={r.id} className="flex flex-col gap-3 border-b border-line px-(--card-p) py-3.5 last:border-b-0">
                  <div className="flex items-start gap-3">
                    <Avatar name={p.name} size="sm" status={p.status} aria-hidden />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium text-fg">{p.name}</p>
                      <p className="text-xs text-fg-muted">
                        {t(leaveTypeLabels[r.type])} · {f.dateRange(r.start, r.end)} · {c(`${r.days} days`, `${r.days} gün`)}
                      </p>
                      {r.note ? <p className="mt-1 text-xs text-fg-subtle">“{t(r.note)}”</p> : null}
                    </div>
                  </div>
                  <div className="flex gap-2 ps-11">
                    <Button size="sm" variant="secondary" onClick={() => setDeclining(r)}>
                      <X aria-hidden />
                      {c("Decline", "Reddet")}
                    </Button>
                    <Button size="sm" variant="primary" onClick={() => onDecide(r.id, "approved")}>
                      <Check aria-hidden />
                      {c("Approve", "Onayla")}
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <Dialog open={!!declining} onOpenChange={(o) => !o && setDeclining(null)}>
        <DialogContent size="sm">
          <DialogHeader
            title={c("Decline leave request", "İzin talebini reddet")}
            description={declining ? `${person(declining.personId).name} · ${f.dateRange(declining.start, declining.end)}` : undefined}
          />
          <DialogBody>
            <label htmlFor="decline-reason" className="mb-1.5 block text-[13px] font-medium text-fg">
              {c("Reason (sent to the employee)", "Gerekçe (çalışana iletilir)")}
            </label>
            <Textarea id="decline-reason" value={reason} onChange={(e) => setReason(e.target.value)} rows={3} placeholder={c("Overlaps with the year-end stock count", "Yıl sonu sayımıyla çakışıyor")} />
          </DialogBody>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDeclining(null)}>{c("Cancel", "Vazgeç")}</Button>
            <Button
              variant="danger"
              onClick={() => {
                if (declining) onDecide(declining.id, "declined", reason.trim() || undefined);
                setDeclining(null);
                setReason("");
              }}
            >
              {c("Decline request", "Talebi reddet")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
