"use client";

import * as React from "react";
import { Minus, Plus } from "lucide-react";
import {
  Alert, AlertDescription, Button, Checkbox, Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader, Field, IconButton, Image, Select, Switch, Textarea,
} from "@vamos-ui/react";
import { useBlockFormat } from "../../_shared/format";
import { productPhoto } from "../../_shared/products";
import { addDecimal, multiplyDecimal, subtractDecimal } from "../../_shared/money";
import { lineProducts, order, refundReasons } from "./data";

export interface RefundRequest {
  /** Units per line index. */
  qty: number[];
  shipping: boolean;
  restock: boolean;
  reason: string;
  note: string;
  amount: string;
}

/** Pick units per line, see the amount update, confirm. Nothing above what is still refundable. */
export function RefundDialog({
  open,
  onOpenChange,
  refundedQty,
  refundedTotal,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  refundedQty: number[];
  refundedTotal: string;
  onConfirm: (r: RefundRequest) => void;
}) {
  const { c, t, money } = useBlockFormat();
  const [qty, setQty] = React.useState<number[]>(() => order.lines.map(() => 0));
  const [shipping, setShipping] = React.useState(false);
  const [restock, setRestock] = React.useState(false);
  const [reason, setReason] = React.useState("damaged");
  const [note, setNote] = React.useState("");

  React.useEffect(() => {
    if (!open) return;
    // Pre-fill from the customer's message: one damaged coffee pot.
    setQty(order.lines.map((l, i) => (l.productId === "pr-10" && refundedQty[i]! < l.qty ? 1 : 0)));
    setShipping(false);
    setRestock(false);
    setReason("damaged");
    setNote("");
  }, [open, refundedQty]);

  const itemsAmount = addDecimal(order.lines.map((l, i) => multiplyDecimal(l.unitPrice.amount, qty[i] ?? 0)));
  const amount = addDecimal([itemsAmount, shipping ? order.shipping.amount : "0"]);
  const remaining = subtractDecimal(order.total.amount, refundedTotal);
  const nothing = Number(amount) <= 0;
  const set = (i: number, v: number) => setQty((q) => q.map((x, j) => (j === i ? v : x)));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader title={c("Refund items", "Ürün iadesi")} description={c(`${order.number} · ${money(order.total)} paid by card`, `${order.number} · ${money(order.total)} kartla ödendi`)} />
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (nothing) return;
            onConfirm({ qty, shipping, restock, reason, note: note.trim(), amount });
          }}
        >
          <DialogBody className="grid gap-5">
            <fieldset className="grid gap-0 divide-y divide-line rounded-ui border border-line">
              <legend className="sr-only">{c("Units to refund", "İade edilecek adet")}</legend>
              {order.lines.map((l, i) => {
                const left = l.qty - (refundedQty[i] ?? 0);
                const name = t(l.name);
                return (
                  <div key={l.sku} className="flex items-center gap-3 p-3">
                    <div className="size-10 shrink-0 overflow-hidden rounded-ui">
                      <Image src={productPhoto(lineProducts[i]!, 96)} alt="" width={40} height={40} aspect={1} className="size-full [&_img]:size-full [&_img]:object-cover" />
                    </div>
                    <div className="grid min-w-0 flex-1">
                      <span className="truncate font-medium text-fg">{name}</span>
                      <span className="text-small text-fg-muted">
                        {money(l.unitPrice)} · {left > 0 ? c(`${left} refundable`, `${left} iade edilebilir`) : c("Fully refunded", "Tamamı iade edildi")}
                      </span>
                    </div>
                    <div className="flex items-center gap-1" role="group" aria-label={c(`Units of ${name}`, `${name} adedi`)}>
                      <IconButton size="sm" variant="secondary" label={c(`One fewer ${name}`, `Bir adet az ${name}`)} disabled={(qty[i] ?? 0) <= 0} onClick={() => set(i, (qty[i] ?? 0) - 1)}>
                        <Minus />
                      </IconButton>
                      <output className="w-8 text-center font-medium text-fg tabular" aria-live="polite">
                        {qty[i] ?? 0}
                      </output>
                      <IconButton size="sm" variant="secondary" label={c(`One more ${name}`, `Bir adet fazla ${name}`)} disabled={(qty[i] ?? 0) >= left} onClick={() => set(i, (qty[i] ?? 0) + 1)}>
                        <Plus />
                      </IconButton>
                    </div>
                  </div>
                );
              })}
            </fieldset>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={c("Reason", "Neden")}>
                <Select value={reason} onValueChange={(v) => v && setReason(v)} items={refundReasons.map((r) => ({ value: r.key, label: t(r.label) }))} />
              </Field>
              <div className="grid content-end gap-3 pb-1">
                <Switch checked={restock} onCheckedChange={setRestock} label={c("Put items back in stock", "Ürünleri stoğa geri al")} />
                {Number(order.shipping.amount) > 0 ? (
                  <Checkbox checked={shipping} onCheckedChange={(v) => setShipping(v === true)} label={c(`Refund shipping (${money(order.shipping)})`, `Kargo ücretini iade et (${money(order.shipping)})`)} />
                ) : null}
              </div>
            </div>
            {restock && reason === "damaged" ? (
              <Alert tone="warning">
                <AlertDescription>{c("Damaged items usually go to the seconds shelf, not back into sellable stock.", "Hasarlı ürünler genelde satılabilir stoğa değil, kusurlu rafına gider.")}</AlertDescription>
              </Alert>
            ) : null}
            <Field label={c("Note to customer", "Müşteriye not")} optional hint={c("Added to the refund email.", "İade e-postasına eklenir.")}>
              <Textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder={c("Sorry about the dent — a new pot is on us next time.", "Ezik için üzgünüz; bir dahaki cezve bizden.")} />
            </Field>

            <div className="surface-2 flex items-baseline justify-between gap-4 rounded-ui px-4 py-3">
              <span className="text-fg-muted">
                {c("Refund to card ending 4417", "4417 ile biten karta iade")}
                <span className="block text-small text-fg-subtle">{c(`Up to ${money({ amount: remaining, currency: "TRY" })} left to refund`, `En fazla ${money({ amount: remaining, currency: "TRY" })} iade edilebilir`)}</span>
              </span>
              <span className="font-heading text-[22px] text-fg tabular" aria-live="polite">
                {money({ amount, currency: "TRY" })}
              </span>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              {c("Cancel", "Vazgeç")}
            </Button>
            <Button type="submit" variant="primary" disabled={nothing}>
              {nothing ? c("Choose items", "Ürün seçin") : c(`Refund ${money({ amount, currency: "TRY" })}`, `${money({ amount, currency: "TRY" })} iade et`)}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
