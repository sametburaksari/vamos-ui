"use client";

import * as React from "react";
import { PackagePlus, Truck } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  Checkbox,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  EmptyState,
  Input,
  cn,
} from "@vamos-ui/react";
import { Stagger } from "@vamos-ui/react/motion";
import { useBlockFormat } from "../../_shared/format";
import { day, daysOfCover, productPhoto, stockState, suggestedQty, suppliers, unitCost, warehouses, type Product } from "./data";

export interface OnOrder {
  po: string;
  qty: number;
  eta: string;
}

export interface ReorderQueueProps {
  products: Product[];
  onOrder: Record<string, OnOrder>;
  onCreate: (lines: Array<{ p: Product; qty: number }>) => void;
}

/**
 * SKUs that will run out before a new delivery could arrive: stock at or below the reorder point,
 * or less cover than the supplier's lead time. Quantities are editable; one PO per supplier.
 */
export function ReorderQueue({ products, onOrder, onCreate }: ReorderQueueProps) {
  const { f, t, c } = useBlockFormat();
  const due = products
    .filter((p) => p.status === "active")
    .filter((p) => stockState(p) !== "ok" || (daysOfCover(p) ?? Infinity) <= suppliers[p.category].leadDays + 7)
    .sort((a, b) => (daysOfCover(a) ?? Infinity) - (daysOfCover(b) ?? Infinity));
  const open = due.filter((p) => !onOrder[p.id]);
  const ordered = due.filter((p) => onOrder[p.id]);

  const [qty, setQty] = React.useState<Record<string, number>>({});
  const [selected, setSelected] = React.useState<Set<string>>(() => new Set(open.map((p) => p.id)));
  const [confirm, setConfirm] = React.useState(false);
  const qtyOf = (p: Product) => qty[p.id] ?? Math.max(suggestedQty(p), suppliers[p.category].casePack);
  const lines = open.filter((p) => selected.has(p.id) && qtyOf(p) > 0).map((p) => ({ p, qty: qtyOf(p) }));
  const total = lines.reduce((s, l) => s + l.qty * unitCost(l.p), 0);
  const groups = Object.values(suppliers).map((s) => ({ s, lines: lines.filter((l) => suppliers[l.p.category].id === s.id) })).filter((g) => g.lines.length);
  const money = (v: number) => f.currency(v, { currency: "TRY", currencyDisplay: "narrowSymbol" }, { maximumFractionDigits: 0 });

  return (
    <Card className="ui-rise flex min-w-0 flex-col" style={{ animationDelay: "100ms" }}>
      <CardHeader
        titleAs="h2"
        title={c("Reorder queue", "Sipariş kuyruğu")}
        description={c("Runs out before a delivery could land. Suggested quantity covers 45 days plus lead time.", "Teslimat gelmeden bitecek ürünler. Önerilen miktar 45 gün + tedarik süresini karşılar.")}
        action={
          <Button size="sm" variant="primary" disabled={!lines.length} onClick={() => setConfirm(true)}>
            <PackagePlus aria-hidden />
            {c("Create PO", "Sipariş oluştur")}
            {lines.length ? <span className="font-mono tabular">· {lines.length}</span> : null}
          </Button>
        }
      />
      {open.length === 0 && ordered.length === 0 ? (
        <EmptyState size="sm" title={c("Nothing to reorder", "Sipariş gereken ürün yok")} description={c("Every SKU here lasts past its next possible delivery.", "Buradaki tüm ürünler bir sonraki teslimata kadar yetiyor.")} />
      ) : (
        <Stagger asChild step={40}>
          <ul className="border-t border-line">
            {open.map((p) => {
              const cover = daysOfCover(p);
              const s = suppliers[p.category];
              const short = cover !== null && cover < s.leadDays;
              return (
                <li key={p.id} className="grid grid-cols-[auto_auto_minmax(0,1fr)] items-center gap-x-3 gap-y-2 border-b border-line px-(--card-p) py-3 sm:grid-cols-[auto_auto_minmax(0,1fr)_auto]">
                  <Checkbox
                    size="sm"
                    aria-label={c(`Include ${t(p.name)}`, `${t(p.name)} dahil et`)}
                    checked={selected.has(p.id)}
                    onCheckedChange={(v) =>
                      setSelected((x) => {
                        const n = new Set(x);
                        if (v === true) n.add(p.id);
                        else n.delete(p.id);
                        return n;
                      })
                    }
                  />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={productPhoto(p, 96)} alt="" className="size-10 rounded-ui-sm bg-surface-2 object-cover" loading="lazy" />
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium text-fg">{t(p.name)}</p>
                    <p className="flex flex-wrap items-center gap-x-2 text-xs text-fg-subtle">
                      <span className="font-mono">{p.sku}</span>
                      <span className={cn("tabular", p.stock <= 0 ? "text-danger" : short ? "text-warning" : "")}>
                        {p.stock <= 0
                          ? c("Out of stock", "Stokta yok")
                          : c(`${p.stock} left · ${f.number(cover ?? 0, { maximumFractionDigits: 0 })} days`, `${p.stock} adet · ${f.number(cover ?? 0, { maximumFractionDigits: 0 })} gün`)}
                      </span>
                      <span>· {s.name} · {c(`${s.leadDays}-day lead`, `${s.leadDays} gün tedarik`)}</span>
                    </p>
                  </div>
                  <div className="col-span-3 flex items-center justify-end gap-2 sm:col-span-1">
                    <label htmlFor={`qty-${p.id}`} className="text-xs text-fg-subtle">{c("Qty", "Adet")}</label>
                    <Input
                      id={`qty-${p.id}`}
                      type="number"
                      inputMode="numeric"
                      min={0}
                      step={s.casePack}
                      size="sm"
                      className="w-20 text-end font-mono tabular"
                      value={qtyOf(p)}
                      onChange={(e) => setQty((q) => ({ ...q, [p.id]: Math.max(0, Math.round(Number(e.target.value) || 0)) }))}
                    />
                  </div>
                </li>
              );
            })}
            {ordered.map((p) => {
              const o = onOrder[p.id]!;
              return (
                <li key={p.id} className="flex items-center gap-3 border-b border-line bg-surface-2/60 px-(--card-p) py-2.5 last:border-b-0">
                  <Truck aria-hidden className="size-4 shrink-0 text-success" />
                  <p className="min-w-0 flex-1 truncate text-[13px] text-fg-muted">{t(p.name)}</p>
                  <Badge size="sm" tone="success" className="font-mono">
                    {o.po} · {o.qty}
                  </Badge>
                  <span className="shrink-0 text-xs text-fg-subtle tabular">{c("ETA", "Varış")} {f.date(o.eta, { month: "short", day: "numeric" })}</span>
                </li>
              );
            })}
          </ul>
        </Stagger>
      )}
      {lines.length ? (
        <p className="mt-auto flex items-center justify-between gap-3 border-t border-line px-(--card-p) py-2.5 text-xs text-fg-muted">
          <span>{c(`${lines.length} lines · ${groups.length} suppliers`, `${lines.length} kalem · ${groups.length} tedarikçi`)}</span>
          <span className="font-mono text-fg tabular">{money(total)}</span>
        </p>
      ) : null}

      <Dialog open={confirm} onOpenChange={setConfirm}>
        <DialogContent size="md">
          <DialogHeader title={c("Send purchase orders", "Satın alma siparişlerini gönder")} description={c(`One order per supplier, delivered to ${warehouses[0]!.name} unless the SKU lives elsewhere.`, `Tedarikçi başına bir sipariş; ürün başka depoda değilse ${warehouses[0]!.name} adresine teslim.`)} />
          <DialogBody className="space-y-4">
            {groups.map(({ s, lines: ls }) => (
              <section key={s.id} className="rounded-ui border border-line">
                <header className="flex items-baseline justify-between gap-3 border-b border-line px-3 py-2">
                  <h3 className="text-[13px] font-medium text-fg">{s.name}</h3>
                  <span className="text-xs text-fg-subtle">{c("Arrives", "Varış")} {f.date(day(s.leadDays), { month: "short", day: "numeric" })}</span>
                </header>
                <ul className="divide-y divide-line">
                  {ls.map((l) => (
                    <li key={l.p.id} className="flex items-center justify-between gap-3 px-3 py-2 text-[13px]">
                      <span className="min-w-0 truncate text-fg">{t(l.p.name)}</span>
                      <span className="shrink-0 font-mono text-fg-muted tabular">
                        {l.qty} × {money(unitCost(l.p))}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
            <p className="flex justify-between border-t border-line pt-3 text-[13px] font-medium text-fg">
              <span>{c("Total at cost, excl. VAT", "KDV hariç maliyet toplamı")}</span>
              <span className="font-mono tabular">{money(total)}</span>
            </p>
          </DialogBody>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setConfirm(false)}>{c("Cancel", "Vazgeç")}</Button>
            <Button
              variant="primary"
              onClick={() => {
                onCreate(lines);
                setConfirm(false);
              }}
            >
              {c(`Send ${groups.length} orders`, `${groups.length} siparişi gönder`)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
