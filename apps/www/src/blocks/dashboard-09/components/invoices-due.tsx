"use client";

import * as React from "react";
import { BellRing, CalendarCheck, Check } from "lucide-react";
import {
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
  Select,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  cn,
} from "@vamos-ui/react";
import { Stagger } from "@vamos-ui/react/motion";
import { useBlockFormat } from "../../_shared/format";
import { day, daysBetween } from "../../_shared/time";
import { TODAY, amountOf, toTry, tryCompact, type Invoice } from "./data";

export interface InvoiceFlags {
  reminded: Set<string>;
  scheduled: Record<string, string>;
}

export interface InvoicesDueProps {
  open: Invoice[];
  flags: InvoiceFlags;
  onRemind: (inv: Invoice) => void;
  onPaid: (inv: Invoice) => void;
  onSchedule: (inv: Invoice, date: string) => void;
}

const paymentRuns = [day(2), day(9), day(16)]; // Fridays

/** What to collect and what to pay, overdue first; each row has the one action it needs. */
export function InvoicesDue({ open, flags, onRemind, onPaid, onSchedule }: InvoicesDueProps) {
  const { f, c } = useBlockFormat();
  const [tab, setTab] = React.useState("ar");
  const [scheduling, setScheduling] = React.useState<Invoice | null>(null);
  const [run, setRun] = React.useState(paymentRuns[0]!);

  const list = (dir: Invoice["direction"]) => open.filter((i) => i.direction === dir).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const ar = list("receivable");
  const ap = list("payable");
  const total = (l: Invoice[]) => tryCompact(f, l.reduce((s, i) => s + toTry(i.balance), 0));

  const row = (inv: Invoice) => {
    const late = daysBetween(inv.dueDate, TODAY);
    const reminded = flags.reminded.has(inv.id);
    const scheduled = flags.scheduled[inv.id];
    return (
      <li key={inv.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 border-b border-line px-(--card-p) py-3 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_7rem_auto]">
        <div className="min-w-0">
          <p className="truncate text-[13px] font-medium text-fg">{inv.counterparty}</p>
          <p className="flex flex-wrap items-center gap-x-2 text-xs text-fg-subtle">
            <span className="font-mono">{inv.number}</span>
            <span className={cn("tabular", late > 0 ? "text-danger" : late > -7 ? "text-warning" : "")}>
              {late > 0 ? c(`${late} days overdue`, `${late} gün gecikti`) : late === 0 ? c("Due today", "Bugün vadeli") : c(`Due ${f.date(inv.dueDate, { month: "short", day: "numeric" })}`, `Vade ${f.date(inv.dueDate, { month: "short", day: "numeric" })}`)}
            </span>
            {inv.status === "partially-paid" ? <Badge size="sm" tone="warning">{c("Part paid", "Kısmi")}</Badge> : null}
            {reminded ? <Badge size="sm" tone="info">{c("Reminder sent", "Hatırlatıldı")}</Badge> : null}
            {scheduled ? <Badge size="sm" tone="success">{c(`Paying ${f.date(scheduled, { month: "short", day: "numeric" })}`, `${f.date(scheduled, { month: "short", day: "numeric" })} ödenecek`)}</Badge> : null}
          </p>
        </div>
        <p className="text-end font-mono text-[13px] font-medium text-fg tabular max-sm:row-start-1 max-sm:col-start-2">{amountOf(f, inv.balance)}</p>
        <div className="flex justify-end gap-1.5 max-sm:col-span-2">
          {inv.direction === "receivable" ? (
            <>
              <Button size="xs" variant="ghost" disabled={reminded} onClick={() => onRemind(inv)}>
                <BellRing aria-hidden />
                {c("Remind", "Hatırlat")}
                <span className="sr-only"> {inv.counterparty}</span>
              </Button>
              <Button size="xs" variant="secondary" onClick={() => onPaid(inv)}>
                <Check aria-hidden />
                {c("Paid", "Ödendi")}
                <span className="sr-only"> {inv.number}</span>
              </Button>
            </>
          ) : (
            <>
              <Button size="xs" variant="ghost" onClick={() => setScheduling(inv)}>
                <CalendarCheck aria-hidden />
                {scheduled ? c("Reschedule", "Yeniden planla") : c("Schedule", "Planla")}
                <span className="sr-only"> {inv.number}</span>
              </Button>
              <Button size="xs" variant="secondary" onClick={() => onPaid(inv)}>
                {c("Pay now", "Şimdi öde")}
                <span className="sr-only"> {inv.number}</span>
              </Button>
            </>
          )}
        </div>
      </li>
    );
  };

  const panel = (items: Invoice[], empty: string) =>
    items.length === 0 ? (
      <EmptyState size="sm" title={empty} />
    ) : (
      <Stagger asChild step={40}>
        <ul className="border-t border-line">{items.map(row)}</ul>
      </Stagger>
    );

  return (
    <Card className="ui-rise min-w-0" style={{ animationDelay: "240ms" }}>
      <Tabs value={tab} onValueChange={setTab}>
        <CardHeader
          titleAs="h2"
          title={c("Invoices due", "Vadesi gelen faturalar")}
          description={c("Overdue first. Paying or collecting updates cash and ageing.", "Önce gecikenler. Tahsilat ve ödemeler nakdi ve yaşlandırmayı günceller.")}
        />
        <div className="overflow-x-auto px-(--card-p)">
          <TabsList>
            <TabsTrigger value="ar">{c("To collect", "Tahsil edilecek")} · {total(ar)}</TabsTrigger>
            <TabsTrigger value="ap">{c("To pay", "Ödenecek")} · {total(ap)}</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="ar">{panel(ar, c("Nothing left to collect", "Tahsil edilecek fatura kalmadı"))}</TabsContent>
        <TabsContent value="ap">{panel(ap, c("All bills are paid", "Tüm faturalar ödendi"))}</TabsContent>
      </Tabs>

      <Dialog open={!!scheduling} onOpenChange={(o) => !o && setScheduling(null)}>
        <DialogContent size="sm">
          <DialogHeader
            title={c("Schedule payment", "Ödeme planla")}
            description={scheduling ? `${scheduling.counterparty} · ${scheduling.number} · ${amountOf(f, scheduling.balance)}` : undefined}
          />
          <DialogBody>
            <label id="run-label" className="mb-1.5 block text-[13px] font-medium text-fg">{c("Payment run", "Ödeme günü")}</label>
            <Select
              aria-labelledby="run-label"
              value={run}
              onValueChange={(v) => v && setRun(v)}
              items={paymentRuns.map((d) => ({ value: d, label: f.date(d, { weekday: "long", month: "long", day: "numeric" }) }))}
            />
            <p className="mt-2 text-xs text-fg-subtle">{c("Runs go out at 11:00 from the main TRY account.", "Ödemeler ana TL hesabından saat 11:00'de çıkar.")}</p>
          </DialogBody>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setScheduling(null)}>{c("Cancel", "Vazgeç")}</Button>
            <Button
              variant="primary"
              onClick={() => {
                if (scheduling) onSchedule(scheduling, run);
                setScheduling(null);
              }}
            >
              {c("Schedule", "Planla")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
