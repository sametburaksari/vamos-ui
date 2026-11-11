"use client";

import * as React from "react";
import { Download } from "lucide-react";
import { Badge, Button, PageHeader, toast } from "@vamos-ui/react";
import { useBlockFormat } from "../../_shared/format";
import { AgeingCard, CashFlowCard } from "./flow-ageing";
import { InvoicesDue, type InvoiceFlags } from "./invoices-due";
import { RunwayCard } from "./runway-card";
import { FX, TODAY, amountOf, burn, openInvoices, toTry, type Invoice, type Scenario } from "./data";

/** Finance cash flow: cash and runway with scenarios, monthly in/out, AR/AP ageing and invoices due. */
export function CashDashboard() {
  const { f, c } = useBlockFormat();
  const [open, setOpen] = React.useState<Invoice[]>(openInvoices);
  const [cash, setCash] = React.useState(Number(burn.cash));
  const [scenario, setScenario] = React.useState<Scenario>("base");
  const [flags, setFlags] = React.useState<InvoiceFlags>({ reminded: new Set(), scheduled: {} });

  // Optimistic: the invoice leaves the list and cash moves at once; undo puts both back.
  const paid = (inv: Invoice) => {
    const delta = (inv.direction === "receivable" ? 1 : -1) * toTry(inv.balance);
    setOpen((l) => l.filter((i) => i.id !== inv.id));
    setCash((v) => v + delta);
    toast.success(
      inv.direction === "receivable" ? c(`${inv.number} marked paid`, `${inv.number} ödendi`) : c(`${inv.number} paid`, `${inv.number} ödendi`),
      {
        description: `${inv.direction === "receivable" ? "+" : "−"}${amountOf(f, inv.balance)} · ${inv.counterparty}`,
        action: {
          label: c("Undo", "Geri al"),
          onClick: () => {
            setOpen((l) => [...l, inv]);
            setCash((v) => v - delta);
          },
        },
      },
    );
  };
  const remind = (inv: Invoice) => {
    setFlags((s) => ({ ...s, reminded: new Set(s.reminded).add(inv.id) }));
    toast.success(c(`Reminder sent to ${inv.counterparty}`, `${inv.counterparty} firmasına hatırlatma gönderildi`), { description: c("With the invoice PDF and a payment link", "Fatura PDF'i ve ödeme bağlantısıyla") });
  };
  const schedule = (inv: Invoice, date: string) => {
    setFlags((s) => ({ ...s, scheduled: { ...s.scheduled, [inv.id]: date } }));
    toast.success(c(`${inv.number} scheduled`, `${inv.number} planlandı`), { description: f.date(date, { weekday: "long", month: "long", day: "numeric" }) });
  };

  return (
    <div className="mx-auto max-w-[1320px]">
      <PageHeader
        size="lg"
        eyebrow={c(`Finance · as of ${f.date(TODAY, "long")}`, `Finans · ${f.date(TODAY, "long")} itibarıyla`)}
        title={c("Cash flow", "Nakit akışı")}
        description={c("How much cash there is, how long it lasts and which invoices move it next.", "Ne kadar nakit var, ne kadar yeter ve sıradaki hangi faturalar onu değiştirecek.")}
        meta={
          <Badge tone="neutral" shape="square" className="font-mono">
            USD {FX.USD} · EUR {FX.EUR}
          </Badge>
        }
        actions={
          <Button variant="secondary" onClick={() => toast(c("Cash report exported", "Nakit raporu dışa aktarıldı"), { description: "cash-flow-2026-11.xlsx" })}>
            <Download aria-hidden />
            {c("Export", "Dışa aktar")}
          </Button>
        }
      />

      <RunwayCard cash={cash} scenario={scenario} onScenario={setScenario} />

      <div className="mt-(--gap) grid gap-(--gap) lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <CashFlowCard />
        <AgeingCard open={open} />
      </div>

      <div className="mt-(--gap)">
        <InvoicesDue open={open} flags={flags} onRemind={remind} onPaid={paid} onSchedule={schedule} />
      </div>
    </div>
  );
}
