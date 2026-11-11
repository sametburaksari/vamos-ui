"use client";

import * as React from "react";
import { ArrowLeft, Copy, CreditCard, Mail, MapPin, RotateCcw, ShieldCheck } from "lucide-react";
import {
  ActionMenu, Avatar, Badge, Button, Card, CardBody, CardHeader, Image, RecordPager, Stepper, toast, type StepItem,
} from "@vamos-ui/react";
import { Reveal, Stagger } from "@vamos-ui/react/motion";
import { useBlockFormat } from "../../_shared/format";
import { fulfilmentLabels, orderStatusLabels, paymentLabels } from "../../_shared/orders";
import { channelLabels, productPhoto } from "../../_shared/products";
import { addDecimal, subtractDecimal } from "../../_shared/money";
import { minutesFromNow } from "../../_shared/time";
import { card, customer, customerMessage, initialLedger, lineProducts, order, orderCount, orderIndex, shippingAddress, type LedgerEntry } from "./data";
import { RefundDialog, type RefundRequest } from "./refund-dialog";
import { ShippingLabel } from "./shipping-label";

const ledgerLabel = {
  authorisation: { en: "Authorised", tr: "Provizyon alındı" },
  capture: { en: "Captured", tr: "Tahsil edildi" },
  refund: { en: "Refund", tr: "İade" },
};

/** One order: fulfilment, lines, money in and out, customer and the printed label. */
export function OrderDetail() {
  const { c, t, f, money, ago } = useBlockFormat();
  const [ledger, setLedger] = React.useState<LedgerEntry[]>(initialLedger);
  const [refundedQty, setRefundedQty] = React.useState<number[]>(() => order.lines.map(() => 0));
  const [refundOpen, setRefundOpen] = React.useState(false);
  const [pos, setPos] = React.useState(orderIndex);
  const seq = React.useRef(0);

  const refunds = ledger.filter((l) => l.kind === "refund" && l.status !== "failed");
  const refundedTotal = refunds.length ? addDecimal(refunds.map((r) => r.amount)) : "0.00";
  const net = subtractDecimal(order.total.amount, refundedTotal);
  const fully = Number(net) <= 0;
  const statusLabel = refunds.length ? (fully ? c("Refunded", "İade edildi") : c("Partially refunded", "Kısmen iade edildi")) : t(orderStatusLabels[order.status]);
  const dt = (iso: string) => f.dateTime(iso, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Istanbul" });

  const steps: StepItem[] = order.steps.map((s) => ({ id: s.step, title: t(fulfilmentLabels[s.step]), description: dt(s.at), status: "complete" }));

  const confirmRefund = (r: RefundRequest) => {
    const id = `rf-${++seq.current}`;
    const units = r.qty.reduce((a, b) => a + b, 0);
    setLedger((l) => [...l, { id, kind: "refund", at: minutesFromNow(0), amount: r.amount, status: "pending", reference: `RF-${8800 + seq.current}`, note: { en: `${units} item${units === 1 ? "" : "s"}${r.restock ? " · restocked" : ""}`, tr: `${units} ürün${r.restock ? " · stoğa alındı" : ""}` } }]);
    setRefundedQty((q) => q.map((x, i) => x + (r.qty[i] ?? 0)));
    setRefundOpen(false);
    toast.loading(c("Sending refund to the card network…", "İade kart ağına gönderiliyor…"), { id });
    window.setTimeout(() => {
      setLedger((l) => l.map((e) => (e.id === id ? { ...e, status: "succeeded" } : e)));
      toast.success(c(`${money({ amount: r.amount, currency: "TRY" })} refunded`, `${money({ amount: r.amount, currency: "TRY" })} iade edildi`), {
        id,
        description: c(`${customer.name} gets an email now; the bank shows it in 3–7 days.`, `${customer.name} şimdi e-posta alıyor; banka 3–7 gün içinde yansıtır.`),
      });
    }, 1100);
  };

  return (
    <div className="mx-auto grid w-full max-w-[1400px] gap-(--gap)">
      <header className="grid gap-5">
        <div className="flex items-center justify-between gap-3">
          <a href="#orders" className="focus-ring inline-flex items-center gap-1.5 rounded-ui text-small text-fg-muted hover:text-fg">
            <ArrowLeft className="size-3.5" aria-hidden /> {c("Orders", "Siparişler")}
          </a>
          <RecordPager index={pos} total={orderCount} onPrevious={() => setPos((p) => Math.max(0, p - 1))} onNext={() => setPos((p) => Math.min(orderCount - 1, p + 1))} shortcuts={false} />
        </div>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="grid gap-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="font-mono text-[length:calc(28px*var(--display-scale,1))] leading-none font-medium tracking-tight text-fg">{order.number}</h1>
              <Badge tone={refunds.length ? "warning" : "success"} dot>{statusLabel}</Badge>
              <Badge tone="outline">{t(channelLabels[order.channel])}</Badge>
            </div>
            <p className="text-fg-muted">
              {c("Placed", "Verildi")} {dt(order.placedAt)} · {customer.name} · {money(order.total)}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={() => toast.success(c("Order confirmation sent again", "Sipariş onayı yeniden gönderildi"), { description: customer.email })}>
              <Mail /> {c("Resend receipt", "Fişi yeniden gönder")}
            </Button>
            <Button variant="primary" onClick={() => setRefundOpen(true)} disabled={fully}>
              <RotateCcw /> {c("Refund", "İade et")}
            </Button>
            <ActionMenu
              triggerLabel={c("More actions", "Diğer işlemler")}
              items={[
                { id: "dup", label: c("Duplicate as draft", "Taslak olarak kopyala"), onSelect: () => toast(c("Draft order created", "Taslak sipariş oluşturuldu")) },
                { id: "invoice", label: c("Download e-invoice (PDF)", "e-Arşiv faturayı indir (PDF)"), onSelect: () => toast(c("Preparing PDF…", "PDF hazırlanıyor…")) },
                { type: "separator", id: "s" },
                { id: "cancel", label: c("Cancel order", "Siparişi iptal et"), disabled: true },
              ]}
            />
          </div>
        </div>
        <Reveal effect="fade" className="surface relative overflow-x-auto rounded-ui-lg px-4 py-5 sm:px-6">
          <Stepper aria-label={c("Fulfilment", "Gönderim süreci")} value={steps.length - 1} steps={steps} size="sm" responsive />
        </Reveal>
      </header>

      <div className="grid items-start gap-(--gap) lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_400px]">
        <div className="grid min-w-0 gap-(--gap)">
          <Card className="min-w-0">
            <CardHeader title={c("Items", "Ürünler")} description={c(`${order.lines.reduce((s, l) => s + l.qty, 0)} units · shipped from Gebze Central`, `${order.lines.reduce((s, l) => s + l.qty, 0)} adet · Gebze Central deposundan`)} />
            <CardBody className="p-0">
              <Stagger asChild step={60}>
                <ul className="divide-y divide-line border-y border-line">
                  {order.lines.map((l, i) => (
                    <li key={l.sku} className="grid grid-cols-[56px_minmax(0,1fr)] gap-x-4 gap-y-2 px-(--card-p) py-4 sm:grid-cols-[64px_minmax(0,1fr)_auto] sm:items-center">
                      <div className="row-span-2 size-14 self-start overflow-hidden rounded-ui sm:row-span-1 sm:size-16 sm:self-center">
                        <Image src={productPhoto(lineProducts[i]!, 160)} alt={t(l.name)} width={64} height={64} aspect={1} className="size-full [&_img]:size-full [&_img]:object-cover" />
                      </div>
                      <div className="grid min-w-0 gap-0.5">
                        <span className="flex flex-wrap items-center gap-2 font-medium text-fg">
                          {t(l.name)}
                          {refundedQty[i] ? <Badge size="sm" tone="warning">{c(`${refundedQty[i]} refunded`, `${refundedQty[i]} iade`)}</Badge> : null}
                        </span>
                        <span className="font-mono text-small text-fg-subtle">{l.sku}</span>
                      </div>
                      <div className="flex items-baseline gap-4 text-fg-muted sm:justify-end">
                        <span className="tabular">
                          {l.qty} × {money(l.unitPrice)}
                        </span>
                        <span className="min-w-24 text-end font-medium text-fg tabular">{money(l.total)}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </Stagger>
              <dl className="grid gap-2 px-(--card-p) py-4 text-fg-muted [&>div]:flex [&>div]:justify-between [&>div]:gap-4 [&_dd]:tabular">
                <div>
                  <dt>{c("Subtotal", "Ara toplam")}</dt>
                  <dd>{money(order.subtotal)}</dd>
                </div>
                <div>
                  <dt>{c("Shipping", "Kargo")}</dt>
                  <dd>{Number(order.shipping.amount) ? money(order.shipping) : c(`Free over ${money({ amount: "1500", currency: "TRY" }, { whole: true })}`, `${money({ amount: "1500", currency: "TRY" }, { whole: true })} üzeri ücretsiz`)}</dd>
                </div>
                <div className="text-small">
                  <dt>{c("Includes VAT 20%", "KDV %20 dahil")}</dt>
                  <dd>{money(order.tax)}</dd>
                </div>
                <div className="border-t border-line pt-2 font-medium text-fg">
                  <dt>{c("Total paid", "Ödenen toplam")}</dt>
                  <dd>{money(order.total)}</dd>
                </div>
                {refunds.length ? (
                  <>
                    <div className="text-warning">
                      <dt>{c("Refunded", "İade edilen")}</dt>
                      <dd>−{money({ amount: refundedTotal, currency: "TRY" })}</dd>
                    </div>
                    <div className="font-heading text-[18px] text-fg">
                      <dt>{c("Net", "Net")}</dt>
                      <dd>{money({ amount: net, currency: "TRY" })}</dd>
                    </div>
                  </>
                ) : null}
              </dl>
            </CardBody>
          </Card>

          <Card className="min-w-0">
            <CardHeader
              title={c("Payments", "Ödemeler")}
              description={
                <span className="inline-flex flex-wrap items-center gap-1.5">
                  <CreditCard className="size-3.5" aria-hidden /> {t(paymentLabels[order.payment])} •••• {card.last4} · {c("expires", "SKT")} {card.expiry}
                  {card.threeDs ? (
                    <Badge size="sm" tone="success">
                      <ShieldCheck /> 3-D Secure
                    </Badge>
                  ) : null}
                </span>
              }
            />
            <CardBody className="p-0">
              <div className="relative overflow-x-auto border-t border-line">
                <table className="w-full text-small whitespace-nowrap sm:min-w-[520px]">
                  <caption className="sr-only">{c("Payment ledger", "Ödeme hareketleri")}</caption>
                  <thead className="text-fg-subtle">
                    <tr className="[&>th]:px-(--card-p) [&>th]:py-2.5 [&>th]:text-start [&>th]:font-normal max-sm:[&>th]:px-2 max-sm:[&>th:first-child]:ps-(--card-p) max-sm:[&>th:last-child]:pe-(--card-p)">
                      <th scope="col">{c("Type", "Tür")}</th>
                      <th scope="col" className="max-sm:hidden">{c("When", "Zaman")}</th>
                      <th scope="col" className="max-sm:hidden">{c("Reference", "Referans")}</th>
                      <th scope="col">{c("Status", "Durum")}</th>
                      <th scope="col" className="text-end!">{c("Amount", "Tutar")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line border-t border-line">
                    {ledger.map((e) => (
                      <tr key={e.id} className="[&>td]:px-(--card-p) [&>td]:py-3 max-sm:[&>td]:px-2 max-sm:[&>td:first-child]:ps-(--card-p) max-sm:[&>td:last-child]:pe-(--card-p)">
                        <td className="text-fg max-sm:whitespace-normal">
                          {t(ledgerLabel[e.kind])}
                          {e.note ? <span className="ms-2 text-fg-subtle max-sm:ms-0 max-sm:block">{t(e.note)}</span> : null}
                          {/* Phones drop the When and Reference columns; both ride under the type. */}
                          <span className="block text-[12px] text-fg-muted sm:hidden">
                            {e.kind === "refund" ? ago(e.at) : dt(e.at)} · <span className="font-mono">{e.reference}</span>
                          </span>
                        </td>
                        <td className="text-fg-muted max-sm:hidden">{e.kind === "refund" ? ago(e.at) : dt(e.at)}</td>
                        <td className="max-sm:hidden">
                          <button
                            type="button"
                            className="focus-ring inline-flex items-center gap-1 rounded-ui font-mono text-fg-muted hover:text-fg"
                            onClick={() => {
                              void navigator.clipboard?.writeText(e.reference).catch(() => {});
                              toast(c("Reference copied", "Referans kopyalandı"));
                            }}
                            aria-label={c(`Copy reference ${e.reference}`, `${e.reference} referansını kopyala`)}
                          >
                            {e.reference} <Copy className="size-3" aria-hidden />
                          </button>
                        </td>
                        <td>
                          <Badge size="sm" tone={e.status === "succeeded" ? "success" : e.status === "pending" ? "info" : "danger"} dot>
                            {e.status === "succeeded" ? c("Succeeded", "Başarılı") : e.status === "pending" ? c("Processing", "İşleniyor") : c("Failed", "Başarısız")}
                          </Badge>
                        </td>
                        <td className={`text-end tabular ${e.kind === "refund" ? "text-warning" : "text-fg"}`}>
                          {e.kind === "refund" ? "−" : ""}
                          {money({ amount: e.amount, currency: "TRY" })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="grid min-w-0 gap-(--gap)">
          <Card>
            <CardHeader title={c("Customer", "Müşteri")} />
            <CardBody className="grid gap-4">
              <div className="flex items-center gap-3">
                <Avatar name={customer.name} size="md" />
                <div className="grid min-w-0">
                  <span className="font-medium text-fg">{customer.name}</span>
                  <a className="focus-ring truncate rounded-ui text-small text-fg-muted hover:text-fg" href={`mailto:${customer.email}`}>
                    {customer.email}
                  </a>
                </div>
                <Badge className="ms-auto" tone="neutral">
                  {c(`${customer.lifetimeOrders + 1} orders`, `${customer.lifetimeOrders + 1} sipariş`)}
                </Badge>
              </div>
              <address className="flex gap-2.5 text-fg-muted not-italic">
                <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
                <span>
                  {shippingAddress.line1}, {shippingAddress.line2}
                  <br />
                  {shippingAddress.postcode} {shippingAddress.city}, {shippingAddress.country}
                </span>
              </address>
              <blockquote className="surface-2 grid gap-1.5 rounded-ui p-3">
                <span className="text-small text-fg-subtle">
                  {c("Message", "Mesaj")} · {ago(customerMessage.at)}
                </span>
                <p className="text-pretty text-fg">“{t(customerMessage.body)}”</p>
              </blockquote>
            </CardBody>
          </Card>
          <ShippingLabel />
        </div>
      </div>

      <RefundDialog open={refundOpen} onOpenChange={setRefundOpen} refundedQty={refundedQty} refundedTotal={refundedTotal} onConfirm={confirmRefund} />
    </div>
  );
}
