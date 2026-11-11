"use client";

import * as React from "react";
import { Check, Mail } from "lucide-react";
import { Badge, Button, Field, Input, Select, SheetBody, SheetFooter, SheetHeader, cn } from "@vamos-ui/react";
import { useBlockFormat } from "../../_shared/format";
import { customersById, fulfilmentLabels, orderStatusLabels, orderStatusTone, paymentLabels, type FulfilmentStep, type Order } from "../../_shared/orders";
import { productPhoto, productsById } from "../../_shared/products";
import { carriers } from "../data";

const allSteps: FulfilmentStep[] = ["placed", "paid", "picked", "packed", "shipped", "delivered"];

/** Order preview: lines, totals, fulfilment steps, and a fulfil form while it's unshipped. */
export function OrderSheetBody({ order: o, onFulfil }: { order: Order; onFulfil: (id: string, carrier: string, tracking: string) => void }) {
  const { c, t, f, money } = useBlockFormat();
  const cu = customersById[o.customerId]!;
  const [carrier, setCarrier] = React.useState<string | null>(carriers[0]!);
  const [tracking, setTracking] = React.useState("");
  const open = o.status === "paid" || o.status === "fulfilling";
  const reached = new Map(o.steps.map((s) => [s.step, s.at]));

  return (
    <>
      <SheetHeader
        title={<span className="font-mono">{o.number}</span>}
        description={`${cu.name} · ${f.dateTime(o.placedAt, { dateStyle: "medium", timeStyle: "short" })}`}
        action={<Badge tone={orderStatusTone[o.status]} dot>{t(orderStatusLabels[o.status])}</Badge>}
      />
      <SheetBody className="grid gap-6">
        <ul className="grid gap-3">
          {o.lines.map((l) => {
            const p = productsById[l.productId]!;
            return (
              <li key={l.sku} className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={productPhoto(p, 96)} alt="" className="size-12 shrink-0 rounded-ui-sm bg-surface-2 object-cover" loading="lazy" />
                <span className="min-w-0 flex-1 leading-tight">
                  <span className="block truncate text-[13px] text-fg">{t(l.name)}</span>
                  <span className="block font-mono text-[11px] text-fg-subtle">{l.sku}</span>
                </span>
                <span className="tabular text-end text-[12.5px] text-fg-muted">
                  {f.number(l.qty)} × {money(l.unitPrice)}
                  <span className="block font-medium text-fg">{money(l.total)}</span>
                </span>
              </li>
            );
          })}
        </ul>

        <dl className="grid grid-cols-[1fr_auto] gap-y-1.5 border-t border-line pt-4 text-[13px]">
          <dt className="text-fg-muted">{c("Subtotal", "Ara toplam")}</dt>
          <dd className="tabular text-end">{money(o.subtotal)}</dd>
          <dt className="text-fg-muted">{c("Shipping", "Kargo")}</dt>
          <dd className="tabular text-end">{Number(o.shipping.amount) === 0 ? c("Free", "Ücretsiz") : money(o.shipping)}</dd>
          <dt className="text-fg-subtle">{c("incl. 20% VAT", "%20 KDV dahil")}</dt>
          <dd className="tabular text-end text-fg-subtle">{money(o.tax)}</dd>
          <dt className="mt-1 border-t border-line pt-2 font-medium text-fg">{c("Total", "Toplam")}</dt>
          <dd className="tabular mt-1 border-t border-line pt-2 text-end font-display text-[20px] text-fg">{money(o.total)}</dd>
          <dt className="text-fg-subtle">{c("Paid with", "Ödeme")}</dt>
          <dd className="text-end text-fg-muted">{t(paymentLabels[o.payment])}</dd>
        </dl>

        <section aria-label={c("Fulfilment", "Sevkiyat")}>
          <h3 className="text-[11.5px] font-semibold tracking-[0.14em] text-fg-subtle uppercase">{c("Fulfilment", "Sevkiyat")}</h3>
          <ol className="mt-3 grid gap-0">
            {allSteps.map((s, i) => {
              const when = reached.get(s);
              return (
                <li key={s} className="relative flex gap-3 pb-3 last:pb-0">
                  {i < allSteps.length - 1 ? <span aria-hidden className={cn("absolute start-[7px] top-4 bottom-0 w-px", when ? "bg-fg-muted" : "bg-line")} /> : null}
                  <span aria-hidden className={cn("relative mt-0.5 grid size-[15px] shrink-0 place-items-center rounded-full border", when ? "border-fg bg-fg text-scene" : "border-line bg-surface")}>
                    {when ? <Check className="size-2.5" strokeWidth={3} /> : null}
                  </span>
                  <span className={cn("flex-1 text-[13px]", when ? "text-fg" : "text-fg-subtle")}>
                    {t(fulfilmentLabels[s])}
                    {when ? <span className="ms-2 text-[11.5px] text-fg-subtle">{f.dateTime(when, { dateStyle: "short", timeStyle: "short" })}</span> : <span className="sr-only">, {c("not yet", "henüz değil")}</span>}
                    {s === "shipped" && o.tracking ? <span className="block font-mono text-[11.5px] text-fg-muted">{o.carrier} · {o.tracking}</span> : null}
                  </span>
                </li>
              );
            })}
          </ol>
        </section>

        {open ? (
          <form
            id="fulfil-form"
            className="grid gap-3 rounded-ui border border-line bg-surface-2 p-4"
            onSubmit={(e) => {
              e.preventDefault();
              onFulfil(o.id, carrier ?? carriers[0]!, tracking.trim());
            }}
          >
            <Field label={c("Carrier", "Kargo firması")}>
              <Select value={carrier} onValueChange={setCarrier} items={carriers.map((x) => ({ value: x, label: x }))} />
            </Field>
            <Field label={c("Tracking number", "Takip numarası")} optional hint={c("The customer gets it in the shipping email.", "Müşteri bunu kargo e-postasında alır.")}>
              <Input value={tracking} onChange={(e) => setTracking(e.target.value)} className="font-mono" placeholder="KL0073012345" />
            </Field>
          </form>
        ) : null}
      </SheetBody>
      <SheetFooter>
        <Button>
          <Mail aria-hidden /> {c("Email customer", "Müşteriye yaz")}
        </Button>
        {open ? (
          <Button variant="primary" type="submit" form="fulfil-form">
            {c("Fulfil order", "Siparişi gönder")}
          </Button>
        ) : null}
      </SheetFooter>
    </>
  );
}
