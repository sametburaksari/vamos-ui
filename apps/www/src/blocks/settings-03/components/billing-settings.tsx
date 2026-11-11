"use client";

import * as React from "react";
import { Alert, Button, toast, useConfirm } from "@vamos-ui/react";
import { useBlockFormat } from "../../_shared/format";
import { cycle, plans, usage, type Interval, type PlanId } from "./billing-data";
import { InvoiceTable } from "./invoice-table";
import { PaymentPanel, UpcomingInvoice } from "./payment-panel";
import { PlanPanel } from "./plan-panel";
import { SettingsFrame } from "./settings-frame";
import { UsageMeters } from "./usage-meters";

/** Plan & billing: plan statement, usage meters, next invoice, card on file and invoice history. */
export function BillingSettings() {
  const { c } = useBlockFormat();
  return (
    <SettingsFrame
      section="billing"
      title={c("Plan & billing", "Plan ve faturalama")}
      description={c("What you pay, what you use and where the invoices go. Only owners and billing admins see this page.", "Ne ödediğiniz, ne kullandığınız ve faturaların nereye gittiği. Bu sayfayı yalnızca sahipler ve fatura yöneticileri görür.")}
    >
      <BillingBody />
    </SettingsFrame>
  );
}

/** Inside the shell, so `useConfirm()` finds the provider AppShell mounts. */
function BillingBody() {
  const { c, f, t } = useBlockFormat();
  const confirm = useConfirm();
  const [planId, setPlanId] = React.useState<PlanId>("scale");
  const [interval, setInterval] = React.useState<Interval>("month");
  const [pendingCancel, setPendingCancel] = React.useState(false);
  const plan = plans.find((p) => p.id === planId)!;
  // Limits follow the plan, so switching plans moves every meter.
  const limits: Record<string, number> = {
    seats: plan.seats,
    orders: plan.orders,
    storage: plan.storageGb * 1_000_000_000,
    api: plan.apiRequests,
  };
  const over = usage.filter((u) => u.used > (limits[u.key] ?? u.limit));

  const cancel = async () => {
    const ok = await confirm({
      tone: "danger",
      title: c(`Cancel the ${t(plan.name)} plan?`, `${t(plan.name)} planı iptal edilsin mi?`),
      description: c(
        `You keep everything until ${f.date(cycle.end, "long")}. After that the workspace is read-only and 24 members lose access to orders and stock.`,
        `${f.date(cycle.end, "long")} tarihine kadar her şey sizde kalır. Sonra çalışma alanı salt okunur olur ve 24 üye sipariş ve stoka erişemez.`,
      ),
      confirmLabel: c("Cancel at renewal", "Yenilemede iptal et"),
      cancelLabel: c("Keep plan", "Planı koru"),
    });
    if (ok) {
      setPendingCancel(true);
      toast(c("Plan set to end at renewal", "Plan yenilemede sona erecek"), { action: { label: c("Undo", "Geri al"), onClick: () => setPendingCancel(false) } });
    }
  };

  return (
    <>
      {over.length && !pendingCancel ? (
        <Alert
          tone="warning"
          className="mb-5"
          title={c(`${f.list(over.map((u) => t(u.label)))} over the plan limit`, `${f.list(over.map((u) => t(u.label)))}: plan limiti aşıldı`)}
          actions={
            <Button size="sm" onClick={() => document.getElementById("usage")?.scrollIntoView({ behavior: "smooth", block: "start" })}>
              {c("See usage", "Kullanımı gör")}
            </Button>
          }
        >
          {c("Nothing stops working. Extra use is added to the next invoice at the overage rate.", "Hiçbir şey durmaz. Fazla kullanım aşım ücretiyle bir sonraki faturaya eklenir.")}
        </Alert>
      ) : null}
      <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(300px,360px)]">
        <div className="grid min-w-0 content-start gap-5">
          <PlanPanel
            planId={planId}
            interval={interval}
            pendingCancel={pendingCancel}
            onChange={(p, i) => {
              setPlanId(p);
              setInterval(i);
            }}
            onCancel={cancel}
            onResume={() => {
              setPendingCancel(false);
              toast.success(c("Your plan continues", "Planınız devam ediyor"));
            }}
          />
          <section id="usage" className="scroll-mt-24">
            <UsageMeters limits={limits} />
          </section>
          <InvoiceTable />
        </div>
        <aside className="grid min-w-0 content-start gap-5 md:grid-cols-2 xl:sticky xl:top-20 xl:grid-cols-1 xl:self-start" aria-label={c("Payment", "Ödeme")}>
          <UpcomingInvoice planId={planId} interval={interval} limits={limits} />
          <PaymentPanel />
        </aside>
      </div>
    </>
  );
}
