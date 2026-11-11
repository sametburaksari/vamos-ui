"use client";

import * as React from "react";
import {
  Button, Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader, Field, Input, Select,
} from "@vamos-ui/react";
import { useBlockFormat } from "../../_shared/format";
import { addDecimal, multiplyDecimal } from "../../_shared/money";
import type { Product } from "../../_shared/products";
import { adjustReasons, supplierFor, suppliers } from "../data";

/* ------------------------------------------------------------------ */
/* Adjust stock                                                         */
/* ------------------------------------------------------------------ */

export function AdjustStockDialog({ product, onOpenChange, onConfirm }: { product: Product | null; onOpenChange: (open: boolean) => void; onConfirm: (id: string, delta: number, reason: string) => void }) {
  const { c, t, f } = useBlockFormat();
  const [delta, setDelta] = React.useState("");
  const [reason, setReason] = React.useState<string | null>("count");
  React.useEffect(() => {
    if (product) {
      setDelta("");
      setReason("count");
    }
  }, [product]);
  const n = Number.parseInt(delta, 10);
  const valid = Number.isFinite(n) && n !== 0 && !!product && product.stock + n >= 0;
  const after = product && Number.isFinite(n) ? product.stock + n : product?.stock ?? 0;

  return (
    <Dialog open={!!product} onOpenChange={onOpenChange}>
      <DialogContent size="sm">
        <DialogHeader title={c("Adjust stock", "Stoğu düzelt")} description={product ? `${product.sku} · ${t(product.name)}` : undefined} />
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (valid && product) onConfirm(product.id, n, reason ?? "count");
          }}
        >
          <DialogBody className="grid gap-4">
            <Field
              label={c("Change in units", "Adet değişimi")}
              hint={c("Use a minus sign to remove units, e.g. −4.", "Adet düşmek için eksi kullanın, örn. −4.")}
              error={delta && !valid ? c("The result can't go below zero.", "Sonuç sıfırın altına düşemez.") : undefined}
            >
              <Input inputMode="numeric" value={delta} onChange={(e) => setDelta(e.target.value.replace(/[^\d-]/g, ""))} autoFocus className="font-mono" />
            </Field>
            <Field label={c("Reason", "Neden")}>
              <Select value={reason} onValueChange={setReason} items={adjustReasons.map((r) => ({ value: r.value, label: t(r.label) }))} />
            </Field>
            <div className="flex items-baseline justify-between rounded-ui-sm bg-surface-2 px-3 py-2.5 font-mono text-[12.5px]">
              <span className="text-fg-subtle">{c("On hand", "Eldeki")}</span>
              <span className="tabular text-fg">
                {f.number(product?.stock ?? 0)} → <strong className={after < (product?.reorderPoint ?? 0) ? "text-warning" : "text-fg"}>{f.number(Math.max(after, 0))}</strong>
              </span>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button onClick={() => onOpenChange(false)}>{c("Cancel", "Vazgeç")}</Button>
            <Button variant="primary" type="submit" disabled={!valid}>
              {c("Post adjustment", "Düzeltmeyi kaydet")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/* Purchase order                                                       */
/* ------------------------------------------------------------------ */

/** Order enough to get back to twice the reorder point. */
export const suggestedQty = (p: Product) => Math.max(p.reorderPoint * 2 - p.stock, 0) || p.reorderPoint;

export function PurchaseOrderDialog({
  open, onOpenChange, items, onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: Product[];
  onCreate: (lines: Array<{ id: string; qty: number }>, supplierId: string) => Promise<void>;
}) {
  const { c, t, f, money } = useBlockFormat();
  const [qty, setQty] = React.useState<Record<string, string>>({});
  const [supplier, setSupplier] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  React.useEffect(() => {
    if (!open) return;
    setQty(Object.fromEntries(items.map((p) => [p.id, String(suggestedQty(p))])));
    setSupplier(items[0] ? supplierFor(items[0].category).id : suppliers[0]!.id);
  }, [open, items]);

  const lines = items.map((p) => ({ p, q: Math.max(0, Number.parseInt(qty[p.id] ?? "0", 10) || 0) }));
  const total = addDecimal(lines.map((l) => multiplyDecimal(l.p.cost.amount, String(l.q))));
  const lead = suppliers.find((s) => s.id === supplier)?.leadDays ?? 0;
  const ok = lines.some((l) => l.q > 0) && !!supplier;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <DialogHeader
          title={c("New purchase order", "Yeni satın alma siparişi")}
          description={c("Quantities start at the reorder suggestion: enough to reach twice the reorder point.", "Miktarlar yeniden sipariş önerisiyle başlar: yeniden sipariş noktasının iki katına ulaşacak kadar.")}
        />
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!ok || !supplier) return;
            setBusy(true);
            try {
              await onCreate(lines.filter((l) => l.q > 0).map((l) => ({ id: l.p.id, qty: l.q })), supplier);
            } finally {
              setBusy(false);
            }
          }}
        >
          <DialogBody className="grid gap-4">
            <Field label={c("Supplier", "Tedarikçi")} hint={c(`Usual lead time ${lead} days`, `Olağan teslim süresi ${lead} gün`)}>
              <Select value={supplier} onValueChange={setSupplier} items={suppliers.map((s) => ({ value: s.id, label: s.name }))} />
            </Field>
            <div className="overflow-hidden rounded-ui-sm border border-line">
              <table className="w-full text-[12.5px]">
                <caption className="sr-only">{c("Order lines", "Sipariş satırları")}</caption>
                <thead className="bg-surface-2 text-[11px] tracking-wide text-fg-subtle uppercase">
                  <tr>
                    <th scope="col" className="px-3 py-2 text-start font-medium">{c("Item", "Ürün")}</th>
                    <th scope="col" className="px-3 py-2 text-end font-medium max-sm:hidden">{c("Unit cost", "Birim maliyet")}</th>
                    <th scope="col" className="w-28 px-3 py-2 text-end font-medium">{c("Qty", "Adet")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {lines.map(({ p }) => (
                    <tr key={p.id}>
                      <td className="px-3 py-2">
                        <span className="block font-mono text-[11.5px] text-fg-subtle">{p.sku}</span>
                        <span className="block truncate text-fg">{t(p.name)}</span>
                      </td>
                      <td className="tabular px-3 py-2 text-end text-fg-muted max-sm:hidden">{money(p.cost)}</td>
                      <td className="px-3 py-1.5">
                        <Input
                          size="sm"
                          inputMode="numeric"
                          aria-label={c(`Quantity for ${p.sku}`, `${p.sku} için adet`)}
                          value={qty[p.id] ?? ""}
                          onChange={(e) => setQty((s) => ({ ...s, [p.id]: e.target.value.replace(/\D/g, "") }))}
                          inputClassName="text-end font-mono tabular"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-baseline justify-between border-t border-line pt-3">
              <span className="text-[12.5px] text-fg-muted">{c(`${f.number(lines.filter((l) => l.q > 0).length)} lines · excl. VAT`, `${f.number(lines.filter((l) => l.q > 0).length)} satır · KDV hariç`)}</span>
              <span className="tabular font-display text-[22px] text-fg">{money({ amount: total, currency: "TRY" })}</span>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button onClick={() => onOpenChange(false)}>{c("Cancel", "Vazgeç")}</Button>
            <Button variant="primary" type="submit" disabled={!ok} loading={busy}>
              {c("Create and send", "Oluştur ve gönder")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
