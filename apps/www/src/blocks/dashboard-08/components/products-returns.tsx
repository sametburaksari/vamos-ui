"use client";

import { Badge, Button, Card, CardHeader, toast } from "@vamos-ui/react";
import { BarList } from "@vamos-ui/react/charts";
import { Stagger } from "@vamos-ui/react/motion";
import { useBlockFormat } from "../../_shared/format";
import { stockState } from "../../_shared/products";
import { categoryLabels, orders as sampleOrders, returnReasons, returnsCount, topProducts, tryCompact } from "./data";

/** Best sellers by 30-day revenue with stock cover; low stock gets a reorder action. */
export function TopProducts() {
  const { f, t, c } = useBlockFormat();
  const max = topProducts[0]!.revenue;
  return (
    <Card className="ui-rise min-w-0" style={{ animationDelay: "300ms" }}>
      <CardHeader titleAs="h2" title={c("Top products", "En çok satanlar")} description={c("By revenue, last 30 days", "Ciroya göre, son 30 gün")} />
      <Stagger asChild step={60}>
        <ol className="border-t border-line">
          {topProducts.map(({ p, revenue }, i) => {
            const state = stockState(p);
            const cover = Math.round(p.stock / (p.sold30d / 30));
            return (
              <li key={p.id} className="grid grid-cols-[1.5rem_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1.5 border-b border-line px-(--card-p) py-3 last:border-b-0">
                <span className="font-mono text-xs text-fg-subtle tabular">{String(i + 1).padStart(2, "0")}</span>
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-medium text-fg">{t(p.name)}</span>
                  <span className="flex flex-wrap items-center gap-x-2 text-xs text-fg-subtle">
                    <span>{t(categoryLabels[p.category])}</span>
                    <span className="tabular">{c(`${p.sold30d} sold`, `${p.sold30d} adet`)}</span>
                    <span className="tabular">{c(`${cover} days of stock`, `${cover} günlük stok`)}</span>
                    {state !== "ok" ? <span className="text-warning sm:hidden">{state === "out" ? c("Out of stock", "Stokta yok") : c("Low stock", "Stok az")}</span> : null}
                  </span>
                </span>
                <span className="flex items-center gap-2">
                  {state !== "ok" ? (
                    <Button
                      className="max-sm:hidden"
                      size="xs"
                      variant="secondary"
                      onClick={() => toast.success(c(`Reorder drafted for ${t(p.name)}`, `${t(p.name)} için sipariş taslağı oluşturuldu`), { description: c(`${p.reorderPoint * 3} units`, `${p.reorderPoint * 3} adet`) })}
                    >
                      {state === "out" ? c("Out · reorder", "Bitti · sipariş") : c("Low · reorder", "Az · sipariş")}
                    </Button>
                  ) : null}
                  <span className="w-16 text-end font-mono text-[13px] text-fg tabular">{tryCompact(f, revenue)}</span>
                </span>
                <span aria-hidden className="col-start-2 col-end-4 block h-1 overflow-hidden rounded-full bg-track">
                  <span className="block h-full rounded-full bg-chart-2" style={{ width: `${(revenue / max) * 100}%` }} />
                </span>
              </li>
            );
          })}
        </ol>
      </Stagger>
    </Card>
  );
}

/** Return rate and reasons over 30 days. */
export function ReturnsCard({ orders }: { orders: number }) {
  const { f, t, c } = useBlockFormat();
  const refunded = sampleOrders.reduce((s, o) => s + Number(o.refunded?.amount ?? 0), 0) + 18_420;
  const cancelled = sampleOrders.filter((o) => o.status === "cancelled").length;
  const rate = returnsCount / orders;
  return (
    <Card className="ui-rise flex min-w-0 flex-col" style={{ animationDelay: "360ms" }}>
      <CardHeader titleAs="h2" title={c("Returns", "İadeler")} description={c("Last 30 days", "Son 30 gün")} action={<Badge tone={rate > 0.03 ? "warning" : "neutral"}>{c(`${returnsCount} requests`, `${returnsCount} talep`)}</Badge>} />
      <div className="flex flex-1 flex-col gap-5 px-(--card-p) pb-(--card-p)">
        <p className="flex items-baseline gap-2">
          <span className="font-display text-display-l leading-none text-fg">{f.percent(rate, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</span>
          <span className="text-[13px] text-fg-muted">{c("of orders", "sipariş oranı")}</span>
        </p>
        <BarList
          aria-label={c("Return reasons", "İade nedenleri")}
          size="sm"
          variant="track"
          color="chart-4"
          showShare
          data={returnReasons.map((r) => ({ key: r.key, label: t(r.label), value: r.count }))}
        />
        <dl className="mt-auto grid grid-cols-2 gap-px overflow-hidden rounded-ui-sm border border-line bg-line text-[13px]">
          <div className="bg-surface px-3 py-2">
            <dt className="text-xs text-fg-subtle">{c("Refunded", "İade edilen")}</dt>
            <dd className="font-mono text-fg tabular">{tryCompact(f, refunded)}</dd>
          </div>
          <div className="bg-surface px-3 py-2">
            <dt className="text-xs text-fg-subtle">{c("Cancelled orders", "İptal edilen")}</dt>
            <dd className="font-mono text-fg tabular">{cancelled}</dd>
          </div>
        </dl>
        <p className="rounded-ui-sm bg-surface-2 px-3 py-2 text-xs text-fg-muted">
          {c("Damage is the top reason two months running — check the ceramics packing spec.", "Hasar iki aydır ilk sırada — seramik paketleme talimatını gözden geçirin.")}
        </p>
      </div>
    </Card>
  );
}
