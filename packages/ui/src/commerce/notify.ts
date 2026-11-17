/**
 * What happens after a paid order: an email to the business and a receipt to the buyer (Resend
 * HTTP API, no SDK), and an optional signed webhook so another system (a panel, a sheet, an ERP)
 * can keep the order. All of it is plain fetch: edge runtimes and Node alike.
 */
import { hmacSha256, toHex } from "../payments/crypto";
import type { PaidOrder } from "./order";
import { formatMoney } from "./pricing";

type Lang = "tr" | "en";

const T = {
  tr: {
    newOrder: "Yeni sipariş",
    thanks: "Siparişiniz alındı",
    hello: (n: string) => `Merhaba ${n},`,
    received: "Ödemeniz alındı, siparişiniz hazırlanıyor. Özeti aşağıda:",
    order: "Sipariş",
    items: "Ürünler",
    shipping: "Kargo",
    total: "Toplam",
    vat: "KDV dahil",
    buyer: "Alıcı",
    address: "Adres",
    company: "Fatura",
    note: "Not",
    payment: "Ödeme",
    installment: (n: number) => (n > 1 ? `${n} taksit` : "tek çekim"),
    reply: "Sorunuz olursa bu e-postayı yanıtlayabilirsiniz.",
  },
  en: {
    newOrder: "New order",
    thanks: "We have your order",
    hello: (n: string) => `Hello ${n},`,
    received: "Your payment went through and we are preparing your order. Summary:",
    order: "Order",
    items: "Items",
    shipping: "Shipping",
    total: "Total",
    vat: "incl. VAT",
    buyer: "Buyer",
    address: "Address",
    company: "Invoice to",
    note: "Note",
    payment: "Payment",
    installment: (n: number) => (n > 1 ? `${n} instalments` : "single payment"),
    reply: "Reply to this email if you have a question.",
  },
} as const;

/** Plain-text order summary (also the body of both emails). */
export function orderText(order: PaidOrder, opts: { lang?: Lang; forBusiness?: boolean } = {}): string {
  const lang = opts.lang ?? order.locale;
  const t = T[lang];
  const fmt = (m: number) => formatMoney(m, order.quote.currency, lang === "tr" ? "tr-TR" : "en-GB");
  const b = order.buyer;
  const out: string[] = [];
  if (!opts.forBusiness) out.push(t.hello(b.name), "", t.received, "");
  out.push(`${t.order}: ${order.id}`, "", `${t.items}:`);
  for (const l of order.quote.lines) out.push(`  ${l.qty} × ${l.name} — ${fmt(l.total)}`);
  if (order.quote.shipping > 0) out.push(`  ${t.shipping} — ${fmt(order.quote.shipping)}`);
  out.push(`${t.total}: ${fmt(order.quote.total)} (${t.vat}: ${fmt(order.quote.vat)})`);
  if (order.installment) out.push(`${t.payment}: ${t.installment(order.installment)}`);
  out.push("", `${t.buyer}: ${b.name} ${b.surname} · ${b.email} · ${b.phone}`);
  out.push(`${t.address}: ${[b.address, b.district, b.city, b.zipCode, b.country].filter(Boolean).join(", ")}`);
  if (b.company) out.push(`${t.company}: ${[b.company.name, b.company.taxOffice, b.company.taxNumber].filter(Boolean).join(" · ")}`);
  if (opts.forBusiness && b.identityNumber) out.push(`TCKN: ${b.identityNumber}`);
  if (order.note) out.push(`${t.note}: ${order.note}`);
  if (opts.forBusiness && order.paymentId) out.push(`iyzico paymentId: ${order.paymentId}`);
  if (!opts.forBusiness) out.push("", t.reply);
  return out.join("\n");
}

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export interface ResendNotifierOptions {
  apiKey: string;
  /** Sender on the store's own domain: "Mağaza <siparis@ornek.com.tr>". */
  from: string;
  /** Where new orders go (the business). */
  to: string | string[];
  /** Shown in subjects. */
  siteName?: string;
  /** Also send the buyer a receipt. Default true. */
  receipt?: boolean;
  fetch?: typeof fetch;
}

/** Emails each paid order to the business and a receipt to the buyer through the Resend API. */
export function resendNotifier(opts: ResendNotifierOptions): (order: PaidOrder) => Promise<void> {
  const send = opts.fetch ?? fetch;
  const post = async (payload: Record<string, unknown>) => {
    const res = await send("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${opts.apiKey}`, "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (!res.ok) throw new Error(`Resend answered ${res.status}`);
  };
  return async (order) => {
    const t = T[order.locale];
    const site = opts.siteName ? `${opts.siteName} · ` : "";
    const business = orderText(order, { forBusiness: true });
    const tasks = [post({ from: opts.from, to: opts.to, reply_to: order.buyer.email, subject: `${site}${t.newOrder} ${order.id}`, text: business, html: `<pre style="font:14px/1.5 ui-monospace,monospace">${escapeHtml(business)}</pre>` })];
    if (opts.receipt !== false) {
      const receipt = orderText(order);
      const replyTo = Array.isArray(opts.to) ? opts.to[0] : opts.to;
      tasks.push(post({ from: opts.from, to: order.buyer.email, reply_to: replyTo, subject: `${site}${t.thanks} · ${order.id}`, text: receipt, html: `<pre style="font:14px/1.5 ui-monospace,monospace;white-space:pre-wrap">${escapeHtml(receipt)}</pre>` }));
    }
    const results = await Promise.allSettled(tasks);
    const failed = results.filter((r) => r.status === "rejected");
    if (failed.length) throw new Error(`${failed.length} of ${results.length} order emails failed`);
  };
}

export interface WebhookNotifierOptions {
  url: string;
  /** Signs the body: header `X-Vamos-Signature: sha256=<hex HMAC>`. */
  secret?: string;
  fetch?: typeof fetch;
}

/** POSTs each paid order as JSON (event "order.paid") to your own endpoint. */
export function webhookNotifier(opts: WebhookNotifierOptions): (order: PaidOrder) => Promise<void> {
  const send = opts.fetch ?? fetch;
  return async (order) => {
    const body = JSON.stringify({ event: "order.paid", order });
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (opts.secret) headers["X-Vamos-Signature"] = `sha256=${toHex(await hmacSha256(opts.secret, body))}`;
    const res = await send(opts.url, { method: "POST", headers, body });
    if (!res.ok) throw new Error(`order webhook answered ${res.status}`);
  };
}

/** Runs several notifiers; one failing does not stop the others. Throws after all ran if any failed. */
export function notifyAll(...notifiers: ((order: PaidOrder) => Promise<void> | void)[]): (order: PaidOrder) => Promise<void> {
  return async (order) => {
    const results = await Promise.allSettled(notifiers.map((n) => n(order)));
    const errors = results.flatMap((r) => (r.status === "rejected" ? [String((r.reason as Error)?.message ?? r.reason)] : []));
    if (errors.length) throw new Error(errors.join("; "));
  };
}
