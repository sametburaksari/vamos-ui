"use client";

import * as React from "react";
import { ArrowRight, Check } from "lucide-react";
import {
  Badge, Button, Card, Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader, ToggleGroup, ToggleGroupItem, cn, toast,
} from "@vamos-ui/react";
import { useBlockFormat } from "../../_shared/format";
import { cycle, plans, usage, type Interval, type Plan, type PlanId } from "./billing-data";

const yearlyMonths = 10;

/** Price per month for a plan on an interval (yearly bills ten months up front). */
export const pricePerMonth = (p: Plan, interval: Interval) => (interval === "year" ? (p.monthly * yearlyMonths) / 12 : p.monthly);

/**
 * The plan "statement": name and price in the display face, a day ruler for the billing
 * cycle, seats as a row of marks, and the change-plan dialog.
 */
export function PlanPanel({
  planId,
  interval,
  pendingCancel,
  onChange,
  onCancel,
  onResume,
}: {
  planId: PlanId;
  interval: Interval;
  pendingCancel: boolean;
  onChange: (plan: PlanId, interval: Interval) => void;
  onCancel: () => void;
  onResume: () => void;
}) {
  const { c, f, t } = useBlockFormat();
  const plan = plans.find((p) => p.id === planId)!;
  const seats = usage.find((u) => u.key === "seats")!;
  const [open, setOpen] = React.useState(false);
  const price = pricePerMonth(plan, interval);

  return (
    <Card className="overflow-hidden">
      <div className="grid gap-6 p-(--card-p) lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[13px] text-fg-muted">{c("Current plan", "Mevcut plan")}</span>
            {pendingCancel ? <Badge tone="warning">{c("Ends at renewal", "Yenilemede bitiyor")}</Badge> : <Badge tone="success">{c("Active", "Etkin")}</Badge>}
            {interval === "year" ? <Badge tone="accent">{c("Yearly", "Yıllık")}</Badge> : null}
          </div>
          <p className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <span className="font-display text-[clamp(2.2rem,1.6rem+2vw,3.25rem)] leading-none text-fg">{t(plan.name)}</span>
            <span className="font-mono text-lg text-fg tabular">
              {f.currency(price, { currency: "USD" }, { maximumFractionDigits: 0 })}
              <span className="text-[13px] text-fg-subtle"> / {c("month", "ay")}</span>
            </span>
          </p>
          <p className="mt-2 max-w-[56ch] text-[13.5px] text-pretty text-fg-muted">
            {pendingCancel
              ? c(`Your workspace switches to read-only on ${f.date(cycle.end, "long")}. Exports stay available for 90 days.`, `Çalışma alanınız ${f.date(cycle.end, "long")} tarihinde salt okunur olur. Dışa aktarımlar 90 gün açık kalır.`)
              : c(
                  `${interval === "year" ? "Billed yearly" : "Billed monthly"} to the card ending ${"4242"}. Renews ${f.date(cycle.end, "long")}.`,
                  `${interval === "year" ? "Yıllık" : "Aylık"} olarak 4242 ile biten karttan alınır. ${f.date(cycle.end, "long")} tarihinde yenilenir.`,
                )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 lg:justify-end">
          {pendingCancel ? (
            <Button variant="primary" onClick={onResume}>
              {c("Keep my plan", "Planımı koru")}
            </Button>
          ) : (
            <>
              <Button variant="ghost" onClick={onCancel}>
                {c("Cancel plan", "Planı iptal et")}
              </Button>
              <Button variant="primary" onClick={() => setOpen(true)}>
                {c("Change plan", "Planı değiştir")}
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid border-t border-line sm:grid-cols-2">
        <div className="p-(--card-p)">
          <div className="flex items-baseline justify-between gap-3 text-xs text-fg-muted">
            <span>{c("Billing cycle", "Fatura dönemi")}</span>
            <span className="font-mono tabular">{c(`${cycle.left} days left`, `${cycle.left} gün kaldı`)}</span>
          </div>
          {/* One tick per day; filled ticks are behind us. */}
          <div aria-hidden className="mt-3 flex h-6 items-end gap-[3px]">
            {Array.from({ length: cycle.length }, (_, i) => (
              <span
                key={i}
                className={cn("min-w-0 flex-1 rounded-[1px]", i === cycle.elapsed - 1 ? "h-full bg-accent-ink" : i < cycle.elapsed ? "h-3 bg-fg-muted" : "h-3 bg-track")}
              />
            ))}
          </div>
          <div className="mt-1.5 flex justify-between font-mono text-[11px] text-fg-subtle tabular">
            <span>{f.date(cycle.start, { month: "short", day: "numeric" })}</span>
            <span>{f.date(cycle.end, { month: "short", day: "numeric" })}</span>
          </div>
        </div>
        <div className="border-t border-line p-(--card-p) sm:border-t-0 sm:border-s">
          <div className="flex items-baseline justify-between gap-3 text-xs text-fg-muted">
            <span>{c("Seats", "Koltuklar")}</span>
            <span className="font-mono tabular">
              {seats.used} / {plan.seats}
            </span>
          </div>
          {/* One mark per seat (grouped by five above 30 seats), so the free ones are countable. */}
          <div aria-hidden className="mt-3 flex h-6 items-end gap-[3px]">
            {Array.from({ length: plan.seats > 30 ? Math.ceil(plan.seats / 5) : plan.seats }, (_, i) => {
              const per = plan.seats > 30 ? 5 : 1;
              const filled = Math.min(per, Math.max(0, seats.used - i * per)) / per;
              return (
                <span key={i} className="relative h-3 min-w-0 flex-1 overflow-hidden rounded-[1px] bg-track">
                  <span className="absolute inset-y-0 start-0 bg-fg-muted" style={{ width: `${filled * 100}%` }} />
                </span>
              );
            })}
          </div>
          <div className="mt-1.5 flex justify-between font-mono text-[11px] text-fg-subtle tabular">
            <span>0</span>
            <span>{plan.seats}</span>
          </div>
          <p className="mt-2 text-xs text-fg-subtle">
            {seats.used > plan.seats
              ? c(`${seats.used - plan.seats} seats over — they are billed at $12 each.`, `${seats.used - plan.seats} koltuk fazla — her biri 12 $.`)
              : c(`${plan.seats - seats.used} free · invite from Users & roles`, `${plan.seats - seats.used} boş · Kullanıcılar ve roller'den davet edin`)}
          </p>
        </div>
      </div>

      <ChangePlanDialog
        open={open}
        onOpenChange={setOpen}
        current={planId}
        currentInterval={interval}
        onConfirm={(p, i) => {
          onChange(p, i);
          setOpen(false);
        }}
      />
    </Card>
  );
}

function ChangePlanDialog({
  open,
  onOpenChange,
  current,
  currentInterval,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  current: PlanId;
  currentInterval: Interval;
  onConfirm: (plan: PlanId, interval: Interval) => void;
}) {
  const { c, f, t } = useBlockFormat();
  const [pick, setPick] = React.useState<PlanId>(current);
  const [interval, setInterval] = React.useState<Interval>(currentInterval);
  const [busy, setBusy] = React.useState(false);
  React.useEffect(() => {
    if (open) {
      setPick(current);
      setInterval(currentInterval);
      setBusy(false);
    }
  }, [open, current, currentInterval]);

  const from = plans.find((p) => p.id === current)!;
  const to = plans.find((p) => p.id === pick)!;
  const seats = usage.find((u) => u.key === "seats")!.used;
  const tooSmall = to.seats < seats;
  const same = pick === current && interval === currentInterval;
  // Unused days of the current plan come back as credit; the new plan starts today.
  const credit = (pricePerMonth(from, currentInterval) * cycle.left) / cycle.length;
  const charge = interval === "year" ? to.monthly * yearlyMonths : (to.monthly * cycle.left) / cycle.length;
  const due = Math.max(0, charge - credit);
  const radios = React.useRef<Array<HTMLButtonElement | null>>([]);

  const onKey = (e: React.KeyboardEvent, i: number) => {
    const dir = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const next = (i + dir + plans.length) % plans.length;
    setPick(plans[next]!.id);
    radios.current[next]?.focus();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="xl" mobile="fullscreen">
        <DialogHeader
          title={c("Change plan", "Planı değiştir")}
          description={c("Changes apply today. Unused days on your current plan become credit.", "Değişiklik bugün geçerli olur. Mevcut planınızda kalan günler krediye döner.")}
        />
        <DialogBody>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <ToggleGroup aria-label={c("Billing interval", "Faturalama aralığı")} value={interval} onValueChange={(v) => v && setInterval(v as Interval)}>
              <ToggleGroupItem value="month">{c("Monthly", "Aylık")}</ToggleGroupItem>
              <ToggleGroupItem value="year">{c("Yearly · 2 months free", "Yıllık · 2 ay bedava")}</ToggleGroupItem>
            </ToggleGroup>
            <span className="text-xs text-fg-subtle">{c("Prices exclude 20% VAT.", "Fiyatlara %20 KDV dahil değildir.")}</span>
          </div>
          <div role="radiogroup" aria-label={c("Plan", "Plan")} className="mt-4 grid gap-3 md:grid-cols-3">
            {plans.map((p, i) => {
              const on = p.id === pick;
              const small = p.seats < seats;
              return (
                <button
                  key={p.id}
                  ref={(el) => {
                    radios.current[i] = el;
                  }}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  tabIndex={on ? 0 : -1}
                  onClick={() => setPick(p.id)}
                  onKeyDown={(e) => onKey(e, i)}
                  className={cn(
                    "relative flex flex-col rounded-ui-lg border p-4 text-start transition-[border-color,background-color] focus-ring",
                    on ? "border-fg bg-selected" : "border-line hover:border-field-border-hover hover:bg-hover",
                  )}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-display text-xl text-fg">{t(p.name)}</span>
                    {p.id === current ? <Badge tone="outline">{c("Current", "Mevcut")}</Badge> : null}
                  </span>
                  <span className="mt-1 text-[13px] text-fg-muted">{t(p.pitch)}</span>
                  <span className="mt-4 font-mono text-[1.5rem] leading-none text-fg tabular">
                    {f.currency(pricePerMonth(p, interval), { currency: "USD" }, { maximumFractionDigits: 0 })}
                    <span className="text-xs text-fg-subtle"> / {c("mo", "ay")}</span>
                  </span>
                  <span className="mt-4 grid gap-1.5 border-t border-line pt-3 text-[13px] text-fg">
                    <span className={cn(small && "text-danger")}>{c(`${p.seats} seats`, `${p.seats} koltuk`)}</span>
                    <span>{c(`${f.number(p.orders)} orders / mo`, `Ayda ${f.number(p.orders)} sipariş`)}</span>
                    <span>{c(`${f.compact(p.apiRequests)} API requests`, `${f.compact(p.apiRequests)} API isteği`)}</span>
                    {p.features.map((x) => (
                      <span key={x.en} className="flex items-start gap-1.5 text-fg-muted">
                        <Check aria-hidden className="mt-0.5 size-3.5 shrink-0" /> {t(x)}
                      </span>
                    ))}
                  </span>
                  {small ? <span className="mt-3 text-xs text-danger">{c(`You use ${seats} seats. Remove members first.`, `${seats} koltuk kullanıyorsunuz. Önce üye çıkarın.`)}</span> : null}
                </button>
              );
            })}
          </div>

          <div className="mt-5 grid gap-1.5 rounded-ui surface-2 p-4 text-[13px]" aria-live="polite">
            <div className="flex items-center gap-2 font-medium text-fg">
              {t(from.name)} <ArrowRight aria-hidden className="size-3.5 text-fg-subtle rtl:rotate-180" /> {t(to.name)}
              <span className="text-fg-subtle">· {interval === "year" ? c("yearly", "yıllık") : c("monthly", "aylık")}</span>
            </div>
            {same ? (
              <p className="text-fg-muted">{c("This is your current plan.", "Bu sizin mevcut planınız.")}</p>
            ) : (
              <dl className="grid grid-cols-[1fr_auto] gap-x-6 gap-y-1 font-mono tabular">
                <dt className="font-sans text-fg-muted">{interval === "year" ? c("12 months, billed as 10", "12 ay, 10 ay olarak") : c(`${cycle.left} days of ${t(to.name)}`, `${cycle.left} gün ${t(to.name)}`)}</dt>
                <dd className="text-end text-fg">{f.currency(charge, { currency: "USD" })}</dd>
                <dt className="font-sans text-fg-muted">{c("Credit for unused days", "Kullanılmayan gün kredisi")}</dt>
                <dd className="text-end text-fg">−{f.currency(credit, { currency: "USD" })}</dd>
                <dt className="border-t border-line pt-1.5 font-sans font-medium text-fg">{c("Due today, before VAT", "Bugün ödenecek, KDV hariç")}</dt>
                <dd className="border-t border-line pt-1.5 text-end font-medium text-fg">{f.currency(due, { currency: "USD" })}</dd>
              </dl>
            )}
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {c("Keep current plan", "Mevcut planda kal")}
          </Button>
          <Button
            variant="primary"
            disabled={same || tooSmall}
            loading={busy}
            onClick={() => {
              setBusy(true);
              window.setTimeout(() => {
                onConfirm(pick, interval);
                toast.success(c(`You're on ${t(to.name)} now`, `Artık ${t(to.name)} planındasınız`), {
                  description: due > 0 ? c(`${f.currency(due * 1.2, { currency: "USD" })} charged to the card ending 4242.`, `4242 ile biten karttan ${f.currency(due * 1.2, { currency: "USD" })} alındı.`) : c("The credit covers the change.", "Değişikliği kredi karşıladı."),
                });
              }, 700);
            }}
          >
            {c("Confirm change", "Değişikliği onayla")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
