// API & webhooks data: the shared keys, scopes and deliveries plus what this screen needs on top —
// per-key request history, delivery payloads and the endpoint signing secrets (all fake).
import { apiKeys, apiScopes, webhookDeliveries, webhookEndpoints, type ApiKey, type WebhookDelivery } from "../../_shared/account";
import type { L } from "../../_shared/l10n";
import { series } from "../../_shared/random";
import { minutesFromNow } from "../../_shared/time";

export { apiKeys, apiScopes, webhookEndpoints, type ApiKey };

/** Resources and the access levels a key can get; scope keys are `resource:level`. */
export const resources: Array<{ key: string; label: L; levels: Array<"read" | "write" | "manage"> }> = [
  { key: "orders", label: { en: "Orders", tr: "Siparişler" }, levels: ["read", "write"] },
  { key: "products", label: { en: "Products", tr: "Ürünler" }, levels: ["read"] },
  { key: "stock", label: { en: "Stock levels", tr: "Stok seviyeleri" }, levels: ["write"] },
  { key: "customers", label: { en: "Customers", tr: "Müşteriler" }, levels: ["read"] },
  { key: "webhooks", label: { en: "Webhooks", tr: "Webhook'lar" }, levels: ["manage"] },
];

export const levelLabels: Record<"read" | "write" | "manage", L> = {
  read: { en: "Read", tr: "Okuma" },
  write: { en: "Write", tr: "Yazma" },
  manage: { en: "Manage", tr: "Yönetim" },
};

/** Requests per day over the last 14 days, oldest first. */
export const keyTraffic: Record<string, number[]> = {
  "key-7": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1_840],
  "key-5": series(14, { start: 420, noise: 0.25, seed: 51, weekly: [1.2, 1, 1, 1, 1.1, 0.2, 0.1] }),
  "key-4": series(14, { start: 38_000, drift: 0.01, noise: 0.12, seed: 44, weekly: [1, 1, 1, 1.05, 1.2, 1.3, 1.1] }),
  "key-3": series(14, { start: 160, noise: 0.6, seed: 33 }),
  "key-2": Array(14).fill(0),
};

export const expiryOptions = [
  { value: "30", label: { en: "30 days", tr: "30 gün" } },
  { value: "90", label: { en: "90 days", tr: "90 gün" } },
  { value: "365", label: { en: "1 year", tr: "1 yıl" } },
  { value: "never", label: { en: "No expiry", tr: "Süresiz" } },
] as const;

/** All webhook events the workspace can send. */
export const webhookEvents: Array<{ key: string; label: L }> = [
  { key: "order.created", label: { en: "Order created", tr: "Sipariş oluşturuldu" } },
  { key: "order.paid", label: { en: "Order paid", tr: "Sipariş ödendi" } },
  { key: "order.refunded", label: { en: "Order refunded", tr: "Sipariş iade edildi" } },
  { key: "stock.low", label: { en: "Stock low", tr: "Stok azaldı" } },
  { key: "customer.created", label: { en: "Customer created", tr: "Müşteri oluşturuldu" } },
  { key: "product.updated", label: { en: "Product updated", tr: "Ürün güncellendi" } },
];

/** Last 24 hourly success ratios per endpoint (for the health strip). */
export const endpointHealth: Record<string, Array<number | null>> = {
  "wh-1": series(24, { start: 0.985, noise: 0.01, seed: 11 }).map((v) => Math.min(1, v)),
  "wh-2": [...Array(16).fill(1), 0.6, 0.2, 0, 0, 0, 0, 0, 0],
  "wh-3": Array<number | null>(24).fill(null),
};

export interface Delivery extends WebhookDelivery {
  /** "pending" while a manual redelivery is in flight. */
  pending?: boolean;
  request: string;
  response: string;
}

const payload = (event: string, i: number) =>
  JSON.stringify(
    event.startsWith("order")
      ? { id: `evt_${9120 + i}`, type: event, created: "2026-11-18T10:18:00+03:00", data: { order: `KL-10${482 - i}`, total: "1840.00", currency: "TRY", channel: "web" } }
      : { id: `evt_${9120 + i}`, type: event, created: "2026-11-18T09:58:00+03:00", data: { sku: "KL-TEX-201-M", warehouse: "Istanbul DC", on_hand: 6, reorder_point: 20 } },
    null,
    2,
  );

const responseFor = (status: number) =>
  status === 200 ? '{ "ok": true }' : status === 401 ? '{ "error": "invalid_signature", "message": "Signature header did not match" }' : "<html><body>502 Bad Gateway</body></html>";

export const deliveries: Delivery[] = [
  ...webhookDeliveries,
  { id: "dl-7", endpoint: "wh-1", event: "order.created", status: 200, duration: 171, at: minutesFromNow(-188), attempt: 1 },
  { id: "dl-8", endpoint: "wh-2", event: "stock.low", status: 200, duration: 88, at: minutesFromNow(-460), attempt: 1 },
  { id: "dl-9", endpoint: "wh-1", event: "order.paid", status: 200, duration: 195, at: minutesFromNow(-512), attempt: 1 },
]
  .sort((a, b) => b.at.localeCompare(a.at))
  .map((d, i) => ({ ...d, request: payload(d.event, i), response: responseFor(d.status) }));

export { responseFor };

/** Shown once after creation — obviously fake. */
export function fakeSecret(prefix: string, seed: number) {
  const abc = "abcdefghijkmnopqrstuvwxyz0123456789";
  let s = "";
  let x = seed * 9301 + 49297;
  for (let i = 0; i < 32; i++) {
    x = (x * 9301 + 49297) % 233280;
    s += abc[x % abc.length];
  }
  return `${prefix}${s}`;
}
