// Account-level data for shells, auth and settings blocks: workspaces, plan & usage,
// API keys, webhook deliveries, sessions, sign-in history, integrations, notification matrix.
// Keys and secrets are obviously fake (`vk_live_…xxxx`) and IPs are documentation ranges.
import type { L } from "./l10n";
import type { Money } from "./money";
import { at, day, minutesFromNow } from "./time";

/* Workspaces ---------------------------------------------------------------- */

export interface Workspace {
  id: string;
  name: string;
  /** Short monogram for the switcher tile. */
  initials: string;
  kind: "company" | "client" | "partner";
  plan: L;
  members: number;
  /** Matches a companies.ts id for client portals. */
  companyId?: string;
}

export const workspaces: Workspace[] = [
  { id: "ws-kiln", name: "Kiln & Linen", initials: "KL", kind: "company", plan: { en: "Scale", tr: "Ölçek" }, members: 24 },
  { id: "ws-velvet", name: "Velvet Anchor Hotels", initials: "VA", kind: "client", plan: { en: "Client portal", tr: "Müşteri portalı" }, members: 6, companyId: "c-velvet" },
  { id: "ws-tidewell", name: "Tidewell Logistics", initials: "TL", kind: "client", plan: { en: "Client portal", tr: "Müşteri portalı" }, members: 4, companyId: "c-tidewell" },
  { id: "ws-halcyon", name: "Halcyon Ferments", initials: "HF", kind: "client", plan: { en: "Client portal", tr: "Müşteri portalı" }, members: 3, companyId: "c-halcyon" },
  { id: "ws-meridyen", name: "Meridyen Digital", initials: "MD", kind: "partner", plan: { en: "Gold partner", tr: "Altın iş ortağı" }, members: 9 },
];

/* Plan & usage --------------------------------------------------------------- */

export const currentPlan = {
  name: { en: "Scale", tr: "Ölçek" } as L,
  price: { amount: "249.00", currency: "USD" } as Money,
  interval: "month" as const,
  renews: day(12),
  seats: { used: 24, included: 25 },
};

export interface UsageMeterData {
  key: string;
  label: L;
  used: number;
  limit: number;
  unit: "count" | "bytes";
  /** Price per extra unit block, when overage is billed. */
  overage?: L;
}

export const usage: UsageMeterData[] = [
  { key: "seats", label: { en: "Team seats", tr: "Ekip koltukları" }, used: 24, limit: 25, unit: "count" },
  { key: "orders", label: { en: "Orders this month", tr: "Bu ayki siparişler" }, used: 8_420, limit: 10_000, unit: "count", overage: { en: "$4 per extra 100 orders", tr: "Her ek 100 sipariş için 4 $" } },
  { key: "storage", label: { en: "Media storage", tr: "Medya depolama" }, used: 41_200_000_000, limit: 50_000_000_000, unit: "bytes" },
  { key: "api", label: { en: "API requests", tr: "API istekleri" }, used: 1_284_000, limit: 1_000_000, unit: "count", overage: { en: "$2 per extra 100k requests", tr: "Her ek 100 bin istek için 2 $" } },
];

/** Card on file. */
export const paymentMethod = { brand: "Credit card", last4: "4242", expMonth: 8, expYear: 2028, holder: "Kiln & Linen Ltd." };

/* API keys & webhooks ---------------------------------------------------------- */

export interface ApiKey {
  id: string;
  name: string;
  /** Visible prefix + last four; the full key is shown once at creation. */
  masked: string;
  scopes: string[];
  createdBy: string;
  created: string;
  lastUsed?: string;
  expires?: string;
  revoked?: boolean;
}

export const apiScopes: Array<{ key: string; label: L }> = [
  { key: "orders:read", label: { en: "Read orders", tr: "Siparişleri okuma" } },
  { key: "orders:write", label: { en: "Create and update orders", tr: "Sipariş oluşturma ve güncelleme" } },
  { key: "products:read", label: { en: "Read products", tr: "Ürünleri okuma" } },
  { key: "stock:write", label: { en: "Update stock levels", tr: "Stok güncelleme" } },
  { key: "customers:read", label: { en: "Read customers", tr: "Müşterileri okuma" } },
  { key: "webhooks:manage", label: { en: "Manage webhooks", tr: "Webhook yönetimi" } },
];

export const apiKeys: ApiKey[] = [
  { id: "key-7", name: "Warehouse sync", masked: "vk_live_…8f2a", scopes: ["orders:read", "stock:write"], createdBy: "p-viktor", created: day(0), lastUsed: minutesFromNow(-3) },
  { id: "key-5", name: "Accounting export", masked: "vk_live_…c41d", scopes: ["orders:read", "customers:read"], createdBy: "p-felix", created: day(-140), lastUsed: minutesFromNow(-600), expires: day(40) },
  { id: "key-4", name: "Marketplace connector", masked: "vk_live_…09be", scopes: ["orders:read", "orders:write", "products:read", "stock:write"], createdBy: "p-yusuf", created: day(-260), lastUsed: minutesFromNow(-1) },
  { id: "key-3", name: "Staging", masked: "vk_test_…77e0", scopes: ["orders:read", "products:read"], createdBy: "p-maya", created: day(-90), lastUsed: minutesFromNow(-4320) },
  { id: "key-2", name: "Old POS bridge", masked: "vk_live_…1a3c", scopes: ["orders:write"], createdBy: "p-defne", created: day(-700), lastUsed: day(-210), revoked: true },
];

export interface WebhookDelivery {
  id: string;
  endpoint: string;
  event: string;
  status: number;
  /** ms */
  duration: number;
  at: string;
  attempt: number;
}

export const webhookEndpoints = [
  { id: "wh-1", url: "https://erp.example.com/hooks/orders", events: ["order.created", "order.paid", "order.refunded"], active: true, successRate: 0.982 },
  { id: "wh-2", url: "https://hooks.example.com/stock", events: ["stock.low"], active: true, successRate: 0.731 },
  { id: "wh-3", url: "https://old-crm.example.com/webhook", events: ["customer.created"], active: false, successRate: 0 },
];

export const webhookDeliveries: WebhookDelivery[] = [
  { id: "dl-1", endpoint: "wh-1", event: "order.paid", status: 200, duration: 182, at: minutesFromNow(-6), attempt: 1 },
  { id: "dl-2", endpoint: "wh-2", event: "stock.low", status: 401, duration: 96, at: minutesFromNow(-26), attempt: 3 },
  { id: "dl-3", endpoint: "wh-1", event: "order.created", status: 200, duration: 204, at: minutesFromNow(-31), attempt: 1 },
  { id: "dl-4", endpoint: "wh-2", event: "stock.low", status: 401, duration: 101, at: minutesFromNow(-52), attempt: 2 },
  { id: "dl-5", endpoint: "wh-1", event: "order.refunded", status: 500, duration: 3_010, at: minutesFromNow(-140), attempt: 1 },
  { id: "dl-6", endpoint: "wh-1", event: "order.refunded", status: 200, duration: 230, at: minutesFromNow(-125), attempt: 2 },
];

/* Security --------------------------------------------------------------------- */

export interface SessionDevice {
  id: string;
  device: string;
  os: string;
  browser: string;
  city: string;
  ip: string;
  lastActive: string;
  current?: boolean;
}

export const sessions: SessionDevice[] = [
  { id: "ss-1", device: "Work laptop", os: "macOS 26", browser: "Safari 26", city: "Istanbul", ip: "203.0.113.24", lastActive: minutesFromNow(0), current: true },
  { id: "ss-2", device: "Phone", os: "iOS 26", browser: "App", city: "Istanbul", ip: "203.0.113.31", lastActive: minutesFromNow(-45) },
  { id: "ss-3", device: "Office desktop", os: "Windows 11", browser: "Edge 142", city: "Ankara", ip: "198.51.100.8", lastActive: minutesFromNow(-2880) },
  { id: "ss-4", device: "Unknown device", os: "Linux", browser: "Firefox 144", city: "Frankfurt", ip: "192.0.2.77", lastActive: minutesFromNow(-8640) },
];

export const signInHistory: Array<{ id: string; at: string; result: "success" | "failed" | "blocked"; method: "password" | "passkey" | "sso" | "magic-link"; city: string; ip: string }> = [
  { id: "si-1", at: minutesFromNow(-12), result: "success", method: "passkey", city: "Istanbul", ip: "203.0.113.24" },
  { id: "si-2", at: at(-1, "08:51"), result: "success", method: "password", city: "Istanbul", ip: "203.0.113.31" },
  { id: "si-3", at: at(-2, "23:14"), result: "failed", method: "password", city: "Frankfurt", ip: "192.0.2.77" },
  { id: "si-4", at: at(-2, "23:15"), result: "failed", method: "password", city: "Frankfurt", ip: "192.0.2.77" },
  { id: "si-5", at: at(-2, "23:16"), result: "blocked", method: "password", city: "Frankfurt", ip: "192.0.2.77" },
  { id: "si-6", at: at(-4, "09:02"), result: "success", method: "sso", city: "Ankara", ip: "198.51.100.8" },
];

export const ipAllowList = ["203.0.113.0/24", "198.51.100.8"];

/** Backup codes shown once after 2FA enrolment (fake). */
export const backupCodes = ["4K7Q-PX2M", "9DTR-H3VA", "B6WN-82ZE", "JX5C-QM4T", "7HLF-R9KD", "WE3P-6YUB", "M2SG-T8NC", "Q9VZ-K4HR", "5RDA-JW7X", "ZC8E-N3LP"];

/** Fake TOTP secret for the enrolment QR (base32). */
export const totpSecret = "JBSWY3DPEHPK3PXP";
export const totpUri = (account: string) => `otpauth://totp/Kiln%20%26%20Linen:${encodeURIComponent(account)}?secret=${totpSecret}&issuer=Kiln%20%26%20Linen&digits=6&period=30`;

/** SSO lookup by email domain. */
export const ssoOrganisations: Array<{ domain: string; name: string; provider: "SAML 2.0" | "OpenID Connect" }> = [
  { domain: "tidewell.example.com", name: "Tidewell Logistics", provider: "SAML 2.0" },
  { domain: "velvetanchor.example.com", name: "Velvet Anchor Hotels", provider: "OpenID Connect" },
  { domain: "larkspur.example.com", name: "Larkspur Analytics", provider: "SAML 2.0" },
];

/* Integrations ------------------------------------------------------------------- */

export interface Integration {
  id: string;
  name: string;
  category: "payments" | "shipping" | "accounting" | "marketing" | "communication" | "marketplace";
  description: L;
  status: "connected" | "error" | "available" | "coming-soon";
  /** One-word monogram for the tile (no third-party logos). */
  mark: string;
  lastSync?: string;
}

export const integrationCategoryLabels: Record<Integration["category"], L> = {
  payments: { en: "Payments", tr: "Ödeme" },
  shipping: { en: "Shipping", tr: "Kargo" },
  accounting: { en: "Accounting", tr: "Muhasebe" },
  marketing: { en: "Marketing", tr: "Pazarlama" },
  communication: { en: "Communication", tr: "İletişim" },
  marketplace: { en: "Marketplaces", tr: "Pazaryerleri" },
};

// Fictional providers on purpose — the block shows the pattern, not real vendors.
export const integrations: Integration[] = [
  { id: "in-1", name: "Paywick", category: "payments", mark: "PW", status: "connected", lastSync: minutesFromNow(-2), description: { en: "Card payments, 3-D Secure and instalments.", tr: "Kartla ödeme, 3-D Secure ve taksit." } },
  { id: "in-2", name: "Parcelwright", category: "shipping", mark: "PR", status: "connected", lastSync: minutesFromNow(-15), description: { en: "Labels and tracking from four carriers.", tr: "Dört kargo firmasından etiket ve takip." } },
  { id: "in-3", name: "Ledgerfern", category: "accounting", mark: "LF", status: "error", lastSync: minutesFromNow(-1440), description: { en: "Push invoices and payments to your books.", tr: "Fatura ve ödemeleri muhasebenize aktarın." } },
  { id: "in-4", name: "Postwren", category: "marketing", mark: "PN", status: "available", description: { en: "Sync customers and send order-based emails.", tr: "Müşterileri senkronlayın, siparişe göre e-posta gönderin." } },
  { id: "in-5", name: "Hollerline", category: "communication", mark: "HL", status: "available", description: { en: "Team alerts for new orders and low stock.", tr: "Yeni sipariş ve düşük stok için ekip bildirimleri." } },
  { id: "in-6", name: "Bazaarline", category: "marketplace", mark: "BL", status: "connected", lastSync: minutesFromNow(-6), description: { en: "List products and import marketplace orders.", tr: "Ürünleri listeleyin, pazaryeri siparişlerini alın." } },
  { id: "in-7", name: "Scanbright", category: "shipping", mark: "SB", status: "coming-soon", description: { en: "Handheld barcode scanning for picking.", tr: "Toplama için el terminaliyle barkod okutma." } },
];

/* Notifications matrix ------------------------------------------------------------- */

export type NotifyChannel = "email" | "push" | "sms" | "in-app";
export const notifyChannels: Array<{ key: NotifyChannel; label: L }> = [
  { key: "in-app", label: { en: "In-app", tr: "Uygulama içi" } },
  { key: "email", label: { en: "Email", tr: "E-posta" } },
  { key: "push", label: { en: "Push", tr: "Anlık bildirim" } },
  { key: "sms", label: { en: "SMS", tr: "SMS" } },
];

export const notifyEvents: Array<{ key: string; group: L; label: L; defaults: NotifyChannel[]; locked?: NotifyChannel[] }> = [
  { key: "order.new", group: { en: "Orders", tr: "Siparişler" }, label: { en: "New order", tr: "Yeni sipariş" }, defaults: ["in-app", "push"] },
  { key: "order.refund", group: { en: "Orders", tr: "Siparişler" }, label: { en: "Refund requested", tr: "İade talebi" }, defaults: ["in-app", "email"] },
  { key: "stock.low", group: { en: "Inventory", tr: "Stok" }, label: { en: "Stock below reorder point", tr: "Stok yeniden sipariş seviyesinin altında" }, defaults: ["in-app", "email"] },
  { key: "ticket.assigned", group: { en: "Support", tr: "Destek" }, label: { en: "Ticket assigned to me", tr: "Bana talep atandı" }, defaults: ["in-app", "email", "push"] },
  { key: "ticket.sla", group: { en: "Support", tr: "Destek" }, label: { en: "SLA about to breach", tr: "SLA süresi dolmak üzere" }, defaults: ["in-app", "push", "sms"] },
  { key: "security.signin", group: { en: "Security", tr: "Güvenlik" }, label: { en: "Sign-in from a new device", tr: "Yeni cihazdan giriş" }, defaults: ["email"], locked: ["email"] },
  { key: "billing.invoice", group: { en: "Billing", tr: "Faturalama" }, label: { en: "Invoice available", tr: "Fatura hazır" }, defaults: ["email"] },
];
