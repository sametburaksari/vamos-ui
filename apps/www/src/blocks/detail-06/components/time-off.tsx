"use client";

import * as React from "react";
import { CalendarPlus, X } from "lucide-react";
import {
  Badge, Button, Card, CardBody, CardHeader, DateRangePicker, Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader, Field, IconButton, Select, Textarea, toast,
} from "@vamos-ui/react";
import { Heatmap, ProgressRing, type HeatmapCell } from "@vamos-ui/react/charts";
import { Stagger } from "@vamos-ui/react/motion";
import { useBlockFormat } from "../../_shared/format";
import { leaveTypeLabels, type LeaveType } from "../../_shared/hr";
import { person } from "../../_shared/people";
import { TODAY } from "../../_shared/time";
import { employment, holidays, manager, sickReference, subject, type LeaveEntry } from "./data";

const holidaySet = new Set(holidays.map((h) => h.date));
const iso = (d: Date) => d.toISOString().slice(0, 10);
const eachDay = (from: string, to: string) => {
  const out: string[] = [];
  for (let d = new Date(`${from}T00:00:00Z`); iso(d) <= to; d.setUTCDate(d.getUTCDate() + 1)) out.push(iso(d));
  return out;
};
const isWeekend = (date: string) => [0, 6].includes(new Date(`${date}T00:00:00Z`).getUTCDay());

/** Working days in a range: weekends and public holidays don't count. */
export function workingDays(from: string, to: string) {
  return eachDay(from, to).filter((d) => !isWeekend(d) && !holidaySet.has(d)).length;
}

const statusTone = { taken: "neutral", approved: "success", pending: "info", declined: "danger" } as const;

export function TimeOff({ leave, setLeave }: { leave: LeaveEntry[]; setLeave: React.Dispatch<React.SetStateAction<LeaveEntry[]>> }) {
  const { c, t, f } = useBlockFormat();
  const [open, setOpen] = React.useState(false);

  const counts = (type: LeaveType, statuses: LeaveEntry["status"][]) => leave.filter((l) => l.type === type && statuses.includes(l.status)).reduce((s, l) => s + l.days, 0);
  const used = counts("annual", ["taken"]);
  const booked = counts("annual", ["approved", "pending"]);
  const entitled = employment.leave.entitlement;
  const left = entitled - used - booked;
  const sick = counts("sick", ["taken"]);

  const cells: HeatmapCell[] = React.useMemo(() => {
    const byDay = new Map<string, string>();
    for (const h of holidays) byDay.set(h.date, "holiday");
    for (const l of leave) {
      if (l.status === "declined") continue;
      for (const d of eachDay(l.start, l.end)) {
        if (isWeekend(d) || holidaySet.has(d)) continue;
        byDay.set(d, l.type === "sick" ? "sick" : l.status === "taken" ? "taken" : l.status === "pending" ? "pending" : "booked");
      }
    }
    return eachDay("2026-01-01", "2026-12-31").map((d) => ({ x: d, value: isWeekend(d) ? null : 1, category: isWeekend(d) ? undefined : byDay.get(d) }));
  }, [leave]);

  const range = (l: LeaveEntry) => (l.start === l.end ? f.date(l.start, "medium") : f.dateRange(l.start, l.end, "medium"));
  const sorted = [...leave].sort((a, b) => b.start.localeCompare(a.start));

  return (
    <div className="grid gap-(--gap)">
      <Card>
        <CardHeader
          title={c("Balance · 2026", "Bakiye · 2026")}
          description={c("Leave year runs January to December. Unused days don't carry over.", "İzin yılı ocak–aralık. Kullanılmayan günler devretmez.")}
          action={
            <Button variant="primary" size="sm" onClick={() => setOpen(true)}>
              <CalendarPlus /> {c("Request leave", "İzin iste")}
            </Button>
          }
        />
        <CardBody>
          <div className="grid gap-6 sm:grid-cols-2 2xl:grid-cols-[1fr_1fr_minmax(220px,0.9fr)]">
            <Ring value={entitled - left} max={entitled} big={left} unit={c("days left", "gün kaldı")} label={t(leaveTypeLabels.annual)} sub={c(`${used} taken · ${booked} booked · ${entitled} a year`, `${used} kullanıldı · ${booked} planlı · yılda ${entitled}`)} />
            <Ring value={sick} max={sickReference} big={sick} unit={c("days", "gün")} label={t(leaveTypeLabels.sick)} sub={c("Doctor's note from day 3", "3. günden itibaren rapor gerekir")} color="chart-4" />
            <div className="grid content-center gap-1.5 rounded-ui border border-dashed border-line p-4 sm:col-span-2 2xl:col-span-1">
              <span className="text-small text-fg-muted">{c("Next time off", "Sıradaki izin")}</span>
              {(() => {
                const next = sorted.filter((l) => l.start >= TODAY && l.status !== "declined").at(-1);
                return next ? (
                  <>
                    <span className="font-heading text-[20px] text-fg">{range(next)}</span>
                    <span className="text-small text-fg-subtle">
                      {t(leaveTypeLabels[next.type])} · {c(`${next.days} working day${next.days === 1 ? "" : "s"}`, `${next.days} iş günü`)}
                    </span>
                  </>
                ) : (
                  <span className="text-fg">{c("Nothing booked", "Planlı izin yok")}</span>
                );
              })()}
            </div>
          </div>
        </CardBody>
      </Card>

      <Card className="min-w-0">
        <CardHeader title={c("Year at a glance", "Yıl görünümü")} description={c("Weekends are blank. Hover a day for details.", "Hafta sonları boş. Ayrıntı için güne gelin.")} />
        <CardBody className="relative overflow-x-auto">
          <Heatmap
            mode="calendar"
            title={c(`Leave calendar 2026, ${subject.name}`, `2026 izin takvimi, ${subject.name}`)}
            data={cells}
            range={{ from: "2026-01-01", to: "2026-12-31" }}
            scale="categorical"
            categories={[
              { value: "taken", label: c("Taken", "Kullanıldı"), color: "chart-2" },
              { value: "booked", label: c("Booked", "Planlı"), color: "chart-1" },
              { value: "pending", label: c("Awaiting approval", "Onay bekliyor"), color: "warning" },
              { value: "sick", label: c("Sick", "Hastalık"), color: "danger" },
              { value: "holiday", label: c("Public holiday", "Resmî tatil"), color: "fg-subtle" },
            ]}
            weekStart={1}
            cellSize="auto"
            today={TODAY}
            className="min-w-[680px]"
          />
        </CardBody>
      </Card>

      <Card className="min-w-0">
        <CardHeader title={c("Requests", "Talepler")} />
        <CardBody className="p-0">
          <Stagger asChild step={50}>
            <ul className="divide-y divide-line border-t border-line">
              {sorted.map((l) => (
                <li key={l.id} className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-(--card-p) py-3.5">
                  <div className="grid min-w-0 flex-1 basis-56">
                    <span className="font-medium text-fg">{range(l)}</span>
                    <span className="text-small text-fg-muted">
                      {t(leaveTypeLabels[l.type])} · {c(`${l.days} working day${l.days === 1 ? "" : "s"}`, `${l.days} iş günü`)}
                      {l.note ? ` · ${t(l.note)}` : ""}
                    </span>
                  </div>
                  {l.approverId && l.status !== "pending" ? <span className="text-small text-fg-subtle">{c(`Approved by ${person(l.approverId).name}`, `Onaylayan: ${person(l.approverId).name}`)}</span> : null}
                  <Badge tone={statusTone[l.status]} dot>
                    {{ taken: c("Taken", "Kullanıldı"), approved: c("Approved", "Onaylandı"), pending: c("Awaiting approval", "Onay bekliyor"), declined: c("Declined", "Reddedildi") }[l.status]}
                  </Badge>
                  {l.status === "pending" ? (
                    <IconButton
                      size="sm"
                      variant="ghost"
                      label={c("Withdraw request", "Talebi geri çek")}
                      onClick={() => {
                        setLeave((all) => all.filter((x) => x.id !== l.id));
                        toast(c("Request withdrawn", "Talep geri çekildi"), { action: { label: c("Undo", "Geri al"), onClick: () => setLeave((all) => [...all, l]) } });
                      }}
                    >
                      <X />
                    </IconButton>
                  ) : null}
                </li>
              ))}
            </ul>
          </Stagger>
        </CardBody>
      </Card>

      <RequestLeaveDialog
        open={open}
        onOpenChange={setOpen}
        left={left}
        onSubmit={(entry) => {
          setLeave((all) => [...all, entry]);
          setOpen(false);
          toast.success(c("Request sent", "Talep gönderildi"), { description: c(`${manager?.name} will get a notification to approve it.`, `${manager?.name} onay için bildirim alacak.`) });
        }}
      />
    </div>
  );
}

function Ring({ value, max, big, unit, label, sub, color = "chart-2" }: { value: number; max: number; big: number; unit: string; label: string; sub: string; color?: "chart-2" | "chart-4" }) {
  return (
    <div className="flex items-center gap-4">
      <ProgressRing value={value} max={max} size="md" color={color} aria-label={`${label}: ${big} ${unit}`} label={<span className="font-heading text-[20px] text-fg tabular">{big}</span>} />
      <div className="grid min-w-0 gap-0.5">
        <span className="font-medium text-fg">{label}</span>
        <span className="text-small text-fg-muted">{unit}</span>
        <span className="text-small text-fg-subtle">{sub}</span>
      </div>
    </div>
  );
}

function RequestLeaveDialog({ open, onOpenChange, left, onSubmit }: { open: boolean; onOpenChange: (o: boolean) => void; left: number; onSubmit: (e: LeaveEntry) => void }) {
  const { c, t } = useBlockFormat();
  const [type, setType] = React.useState<LeaveType>("annual");
  const [range, setRange] = React.useState<{ from: string; to?: string } | null>(null);
  const [note, setNote] = React.useState("");
  const [tried, setTried] = React.useState(false);
  const seq = React.useRef(0);

  React.useEffect(() => {
    if (open) {
      setType("annual");
      setRange({ from: "2026-12-21", to: "2026-12-24" });
      setNote("");
      setTried(false);
    }
  }, [open]);

  const days = range?.from ? workingDays(range.from, range.to ?? range.from) : 0;
  const over = type === "annual" && days > left;
  const error = tried && !days ? c("Pick at least one working day.", "En az bir iş günü seçin.") : over ? c(`Only ${left} days left this year.`, `Bu yıl yalnızca ${left} gün kaldı.`) : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm">
        <DialogHeader title={c("Request leave", "İzin talebi")} description={c(`Goes to ${manager?.name} for approval.`, `Onay için ${manager?.name} kişisine gider.`)} />
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            setTried(true);
            if (!range?.from || !days || over) return;
            onSubmit({ id: `kl-new-${++seq.current}`, type, start: range.from, end: range.to ?? range.from, days, status: "pending", note: note.trim() ? { en: note.trim(), tr: note.trim() } : undefined });
          }}
        >
          <DialogBody className="grid gap-4">
            <Field label={c("Type", "Tür")}>
              <Select value={type} onValueChange={(v) => v && setType(v as LeaveType)} items={(["annual", "sick", "unpaid"] as const).map((k) => ({ value: k, label: t(leaveTypeLabels[k]) }))} />
            </Field>
            <Field
              label={c("Dates", "Tarihler")}
              required
              error={error}
              hint={!error ? (days ? c(`${days} working day${days === 1 ? "" : "s"} · ${type === "annual" ? `${left - days} left after this` : "not deducted from annual leave"}`, `${days} iş günü · ${type === "annual" ? `sonrasında ${left - days} gün kalır` : "yıllık izinden düşmez"}`) : undefined) : undefined}
            >
              <DateRangePicker value={range as never} onValueChange={(v) => setRange(v as never)} min={TODAY} numberOfMonths={1} />
            </Field>
            <Field label={c("Note for your manager", "Yöneticiye not")} optional>
              <Textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder={c("Who covers the queue while you're away", "Yokken kuyruğa kim bakacak")} />
            </Field>
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              {c("Cancel", "Vazgeç")}
            </Button>
            <Button type="submit" variant="primary">
              {c("Send request", "Talebi gönder")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
