"use client";

import * as React from "react";
import { ArrowRight, Check } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  Checkbox,
  Sheet,
  SheetBody,
  SheetContent,
  SheetFooter,
  SheetHeader,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableContainer,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
  cn,
} from "@vamos-ui/react";
import { useBlockFormat } from "../../_shared/format";
import { fulfilmentLabels, orderStatusLabels, orderStatusTone, paymentLabels } from "../../_shared/orders";
import { channelLabels } from "../../_shared/products";
import { NOW_MS } from "../../_shared/time";
import { customersById, laneOf, lanes, nextStatus, tryWhole, type Lane, type Order, type OrderStatus } from "./data";
import { LiveCount } from "./live-count";

const actionLabel: Partial<Record<OrderStatus, { en: string; tr: string }>> = {
  pending: { en: "Mark paid", tr: "Ödendi yap" },
  paid: { en: "Mark picked", tr: "Toplandı yap" },
  fulfilling: { en: "Print label & ship", tr: "Etiket bas, kargola" },
  shipped: { en: "Mark delivered", tr: "Teslim edildi yap" },
};

export interface FulfilmentDeskProps {
  orders: Order[];
  onAdvance: (ids: string[]) => void;
}

/** The packing floor: four lanes as filters, a selectable queue with bulk actions and an order sheet. */
export function FulfilmentDesk({ orders, onAdvance }: FulfilmentDeskProps) {
  const { f, t, c } = useBlockFormat();
  const [lane, setLane] = React.useState<Lane>("pick");
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [openId, setOpenId] = React.useState<string | null>(null);

  const status = lanes.find((l) => l.key === lane)!.status;
  const rows = orders.filter((o) => o.status === status);
  const counts = Object.fromEntries(lanes.map((l) => [l.key, orders.filter((o) => o.status === l.status).length])) as Record<Lane, number>;
  const allOn = rows.length > 0 && rows.every((o) => selected.has(o.id));
  const someOn = rows.some((o) => selected.has(o.id));
  const chosen = rows.filter((o) => selected.has(o.id)).map((o) => o.id);
  const act = actionLabel[status];

  const pickLane = (l: Lane) => {
    setLane(l);
    setSelected(new Set());
  };
  const advance = (ids: string[]) => {
    onAdvance(ids);
    setSelected(new Set());
  };
  const open = orders.find((o) => o.id === openId) ?? null;

  return (
    <Card className="ui-rise min-w-0" style={{ animationDelay: "240ms" }}>
      <CardHeader titleAs="h2" title={c("Fulfilment", "Sipariş hazırlama")} description={c("Pick a lane to see its queue. Select orders to move them on together.", "Kuyruğunu görmek için bir aşama seçin. Birden fazla siparişi birlikte ilerletebilirsiniz.")} />

      <div role="group" aria-label={c("Fulfilment lanes", "Hazırlama aşamaları")} className="grid grid-cols-2 border-y border-line md:grid-cols-4">
        {lanes.map((l, i) => {
          const on = l.key === lane;
          return (
            <button
              key={l.key}
              type="button"
              aria-pressed={on}
              onClick={() => pickLane(l.key)}
              className={cn(
                "relative flex min-w-0 flex-col items-start gap-1 border-line px-(--card-p) py-4 text-start transition-colors focus-ring hover:bg-hover",
                i % 2 === 1 && "border-s",
                i >= 2 && "max-md:border-t md:border-s",
                on && "bg-selected hover:bg-selected",
              )}
            >
              {on ? <span aria-hidden className="absolute inset-x-0 top-0 h-0.5 bg-accent" /> : null}
              <span className="flex w-full items-center gap-2 text-[13px] text-fg-muted">
                <span className="font-mono text-[11px] text-fg-subtle tabular">0{i + 1}</span>
                <span className="truncate">{t(l.label)}</span>
                {i < lanes.length - 1 ? <ArrowRight className="ms-auto size-3.5 shrink-0 text-fg-subtle max-md:hidden" aria-hidden /> : null}
              </span>
              <span className="font-display text-display-m leading-none text-fg">
                <LiveCount value={counts[l.key]} />
              </span>
              <span className="truncate text-xs text-fg-subtle">{t(l.hint)}</span>
            </button>
          );
        })}
      </div>

      <div className="flex min-h-12 flex-wrap items-center gap-3 px-(--card-p) py-2">
        <Checkbox
          checked={allOn ? true : someOn ? "indeterminate" : false}
          disabled={rows.length === 0}
          onCheckedChange={(v) => setSelected(v === true ? new Set(rows.map((o) => o.id)) : new Set())}
          label={someOn ? c(`${chosen.length} selected`, `${chosen.length} seçili`) : c("Select all", "Tümünü seç")}
        />
        {act ? (
          <Button size="sm" variant={someOn ? "primary" : "secondary"} className="ms-auto" disabled={!someOn} onClick={() => advance(chosen)}>
            <Check aria-hidden />
            {c(act.en, act.tr)}
          </Button>
        ) : null}
      </div>

      <TableContainer className="border-t border-line">
        <Table hover>
          <TableCaption visuallyHidden>{c(`Orders in ${t(lanes.find((l) => l.key === lane)!.label)}`, `${t(lanes.find((l) => l.key === lane)!.label)} siparişleri`)}</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10"><span className="sr-only">{c("Select", "Seç")}</span></TableHead>
              <TableHead>{c("Order", "Sipariş")}</TableHead>
              <TableHead className="max-md:hidden">{c("Items", "Ürünler")}</TableHead>
              <TableHead className="max-sm:hidden">{c("Placed", "Tarih")}</TableHead>
              <TableHead numeric>{c("Total", "Tutar")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableEmpty colSpan={5} title={c("Lane is clear", "Bu aşama boş")} description={c("Nothing waiting here right now.", "Şu an burada bekleyen sipariş yok.")} />
            ) : (
              rows.map((o) => {
                const cu = customersById[o.customerId]!;
                const items = o.lines.reduce((s, l) => s + l.qty, 0);
                return (
                  <TableRow key={o.id} selected={selected.has(o.id)}>
                    <TableCell>
                      <Checkbox
                        aria-label={c(`Select ${o.number}`, `${o.number} seç`)}
                        checked={selected.has(o.id)}
                        onCheckedChange={(v) =>
                          setSelected((s) => {
                            const n = new Set(s);
                            if (v === true) n.add(o.id);
                            else n.delete(o.id);
                            return n;
                          })
                        }
                      />
                    </TableCell>
                    <TableCell rowHeader>
                      <button type="button" onClick={() => setOpenId(o.id)} className="rounded-ui-sm font-mono text-[13px] font-medium text-fg focus-ring hover:underline">
                        {o.number}
                      </button>
                      <div className="max-w-[11rem] truncate text-xs text-fg-subtle sm:max-w-none">
                        {cu.name} · {cu.city} · {t(channelLabels[o.channel])}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[18rem] max-md:hidden">
                      <span className="block truncate text-fg-muted">{o.lines.map((l) => `${l.qty}× ${t(l.name)}`).join(", ")}</span>
                      <span className="text-xs text-fg-subtle tabular">{c(`${items} items`, `${items} ürün`)}</span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-fg-muted tabular max-sm:hidden">{f.relative(o.placedAt, { now: NOW_MS })}</TableCell>
                    <TableCell numeric className="font-medium text-fg">{tryWhole(f, o.total.amount)}</TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <OrderSheet order={open} onClose={() => setOpenId(null)} onAdvance={(id) => advance([id])} />
    </Card>
  );
}

function OrderSheet({ order, onClose, onAdvance }: { order: Order | null; onClose: () => void; onAdvance: (id: string) => void }) {
  const { f, t, c } = useBlockFormat();
  const [shown, setShown] = React.useState(order);
  React.useEffect(() => {
    if (order) setShown(order);
  }, [order]);
  const o = order ?? shown;
  if (!o) return null;
  const cu = customersById[o.customerId]!;
  const act = actionLabel[o.status];
  const money = (v: string) => f.currency(v, { currency: "TRY", currencyDisplay: "narrowSymbol" });

  return (
    <Sheet open={!!order} onOpenChange={(v) => !v && onClose()}>
      <SheetContent size="md">
        <SheetHeader
          title={<span className="font-mono">{o.number}</span>}
          description={`${cu.name} · ${cu.email}`}
          action={<Badge tone={orderStatusTone[o.status]}>{t(orderStatusLabels[o.status])}</Badge>}
        />
        <SheetBody className="space-y-6">
          <ul className="divide-y divide-line rounded-ui border border-line">
            {o.lines.map((l) => (
              <li key={l.sku} className="flex items-center gap-3 px-3 py-2.5 text-[13px]">
                <span className="grid size-7 shrink-0 place-items-center rounded-ui-sm bg-surface-2 font-mono text-xs text-fg-muted tabular">{l.qty}×</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-fg">{t(l.name)}</span>
                  <span className="font-mono text-[11px] text-fg-subtle">{l.sku}</span>
                </span>
                <span className="font-mono text-fg tabular">{money(l.total.amount)}</span>
              </li>
            ))}
          </ul>
          <dl className="space-y-1.5 text-[13px]">
            {[
              [c("Subtotal", "Ara toplam"), money(o.subtotal.amount)],
              [c("Shipping", "Kargo"), Number(o.shipping.amount) ? money(o.shipping.amount) : c("Free", "Ücretsiz")],
              [c("VAT included (20%)", "Dahil KDV (%20)"), money(o.tax.amount)],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 text-fg-muted">
                <dt>{k}</dt>
                <dd className="font-mono tabular">{v}</dd>
              </div>
            ))}
            <div className="flex justify-between gap-4 border-t border-line pt-2 font-medium text-fg">
              <dt>{c("Total", "Toplam")}</dt>
              <dd className="font-mono tabular">{money(o.total.amount)}</dd>
            </div>
            <p className="text-xs text-fg-subtle">{t(paymentLabels[o.payment])}</p>
          </dl>
          <div>
            <h3 className="mb-2 text-[13px] font-medium text-fg">{c("Progress", "Süreç")}</h3>
            <ol className="relative space-y-3 border-s border-line ps-4">
              {o.steps.map((s) => (
                <li key={s.step} className="relative text-[13px]">
                  <span aria-hidden className="absolute -start-[21px] top-1 size-2.5 rounded-full border-2 border-surface bg-accent" />
                  <span className="text-fg">{t(fulfilmentLabels[s.step])}</span>
                  <span className="block text-xs text-fg-subtle">{f.dateTime(s.at, { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Istanbul" })}</span>
                </li>
              ))}
            </ol>
            {o.carrier ? (
              <p className="mt-3 text-xs text-fg-muted">
                {o.carrier} · <span className="font-mono">{o.tracking}</span>
              </p>
            ) : null}
          </div>
        </SheetBody>
        {act && nextStatus[o.status] ? (
          <SheetFooter>
            <Button variant="secondary" onClick={onClose}>{c("Close", "Kapat")}</Button>
            <Button variant="primary" onClick={() => onAdvance(o.id)} disabled={!laneOf(o.status)}>
              <Check aria-hidden />
              {c(act.en, act.tr)}
            </Button>
          </SheetFooter>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
