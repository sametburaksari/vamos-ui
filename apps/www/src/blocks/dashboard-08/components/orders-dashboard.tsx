"use client";

import * as React from "react";
import { Download } from "lucide-react";
import { Badge, Button, PageHeader, ToggleGroup, ToggleGroupItem, toast } from "@vamos-ui/react";
import { useBlockFormat } from "../../_shared/format";
import type { FulfilmentStep } from "../../_shared/orders";
import { minutesFromNow } from "../../_shared/time";
import { FulfilmentDesk } from "./fulfilment-desk";
import { KpiStrip } from "./kpi-strip";
import { ReturnsCard, TopProducts } from "./products-returns";
import { ConversionCard, RevenueCard } from "./sales-charts";
import { nextStatus, orders as seed, periodStats, type Order, type OrderStatus, type Range } from "./data";

const stepFor: Partial<Record<OrderStatus, FulfilmentStep[]>> = {
  paid: ["paid"],
  fulfilling: ["picked", "packed"],
  shipped: ["shipped"],
  delivered: ["delivered"],
};

/** E-commerce orders desk: KPIs for a range, revenue, funnel, the fulfilment queue, best sellers and returns. */
export function OrdersDashboard() {
  const { c } = useBlockFormat();
  const [range, setRange] = React.useState<Range>(7);
  const [orders, setOrders] = React.useState<Order[]>(seed);
  const stats = periodStats(range);

  // Optimistic: move the orders on at once, undo restores the previous versions.
  const advance = (ids: string[]) => {
    const before = orders.filter((o) => ids.includes(o.id));
    if (!before.length) return;
    setOrders((all) =>
      all.map((o) => {
        const to = ids.includes(o.id) ? nextStatus[o.status] : undefined;
        if (!to) return o;
        const steps = [...o.steps, ...(stepFor[to] ?? []).map((step) => ({ step, at: minutesFromNow(0) }))];
        return { ...o, status: to, steps, carrier: to === "shipped" ? "Martı Express" : o.carrier, tracking: to === "shipped" ? `KL${o.id.replace(/\D/g, "")}5531` : o.tracking };
      }),
    );
    const n = before.length;
    toast.success(n === 1 ? c(`${before[0]!.number} moved on`, `${before[0]!.number} ilerletildi`) : c(`${n} orders moved on`, `${n} sipariş ilerletildi`), {
      action: { label: c("Undo", "Geri al"), onClick: () => setOrders((all) => all.map((o) => before.find((b) => b.id === o.id) ?? o)) },
    });
  };

  return (
    <div className="mx-auto max-w-[1320px]">
      <PageHeader
        size="lg"
        eyebrow={c("Kiln & Linen · Online store", "Kiln & Linen · Online mağaza")}
        title={c("Orders", "Siparişler")}
        description={c("Sales, conversion and everything that still has to leave the warehouse today.", "Satışlar, dönüşüm ve bugün depodan çıkması gereken her şey.")}
        meta={<Badge tone="success" dot>{c("Store open", "Mağaza açık")}</Badge>}
        actions={
          <>
            <ToggleGroup aria-label={c("Date range", "Tarih aralığı")} value={String(range)} onValueChange={(v) => v && setRange(Number(v) as Range)}>
              <ToggleGroupItem value="7">{c("7 days", "7 gün")}</ToggleGroupItem>
              <ToggleGroupItem value="14">{c("14 days", "14 gün")}</ToggleGroupItem>
              <ToggleGroupItem value="30">{c("30 days", "30 gün")}</ToggleGroupItem>
            </ToggleGroup>
            <Button variant="secondary" onClick={() => toast(c("Orders exported", "Siparişler dışa aktarıldı"), { description: `orders-last-${range}-days.csv` })}>
              <Download aria-hidden />
              {c("Export", "Dışa aktar")}
            </Button>
          </>
        }
      />

      <KpiStrip stats={stats} />

      <div className="mt-(--gap) grid gap-(--gap) lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <RevenueCard stats={stats} range={range} />
        <ConversionCard />
      </div>

      <div className="mt-(--gap)">
        <FulfilmentDesk orders={orders} onAdvance={advance} />
      </div>

      <div className="mt-(--gap) grid gap-(--gap) lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <TopProducts />
        <ReturnsCard orders={periodStats(30).orders} />
      </div>
    </div>
  );
}
