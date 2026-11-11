// Audit trail for the Kiln & Linen workspace: the shared activity stream plus older events,
// each with who did it (person, system or API key), where from, and field-level changes.
// IP addresses are documentation ranges (RFC 5737); everything else is fictional.
import { activity, type ActivityEvent } from "../../_shared/events";
import type { L } from "../../_shared/l10n";
import { minutesFromNow } from "../../_shared/time";

export type EntityType = "invoice" | "order" | "deal" | "ticket" | "user" | "product" | "api-key" | "settings";
export type Source = ActivityEvent["source"];
export type Severity = "info" | "notice" | "critical";

export interface AuditEntry {
  id: string;
  at: string;
  /** people.ts id, "system", or "key:<name>" for an API key. */
  actorId: string;
  action: string;
  summary: L;
  entity: { type: EntityType; id: string; label: string };
  changes?: Array<{ field: string; from: string | null; to: string | null }>;
  ip?: string;
  source: Source;
  severity: Severity;
  requestId: string;
  /** Set when a later event undid this one. */
  revertedBy?: string;
}

export const entityLabels: Record<EntityType, L> = {
  invoice: { en: "Invoices", tr: "Faturalar" },
  order: { en: "Orders", tr: "Siparişler" },
  deal: { en: "Deals", tr: "Fırsatlar" },
  ticket: { en: "Tickets", tr: "Talepler" },
  user: { en: "Users", tr: "Kullanıcılar" },
  product: { en: "Products", tr: "Ürünler" },
  "api-key": { en: "API keys", tr: "API anahtarları" },
  settings: { en: "Settings", tr: "Ayarlar" },
};

export const sourceLabels: Record<Source, L> = {
  web: { en: "Web app", tr: "Web uygulaması" },
  mobile: { en: "Mobile app", tr: "Mobil uygulama" },
  api: { en: "API", tr: "API" },
  system: { en: "System", tr: "Sistem" },
};

export const severityLabels: Record<Severity, L> = {
  info: { en: "Info", tr: "Bilgi" },
  notice: { en: "Notice", tr: "Dikkat" },
  critical: { en: "Critical", tr: "Kritik" },
};

/** Where an IP was seen (documentation ranges, invented places). */
export const ipPlaces: Record<string, string> = {
  "203.0.113.24": "Istanbul, TR",
  "203.0.113.7": "Berlin, DE",
  "198.51.100.42": "Sofia, BG",
  "198.51.100.17": "Istanbul, TR",
  "192.0.2.199": "Unknown network, NL",
  "198.51.100.88": "Dublin, IE",
  "203.0.113.61": "Kocaeli, TR",
  "192.0.2.14": "Hosted · eu-central",
};

/** Client strings shown in the inspector. */
export const clientFor: Record<Source, string> = {
  web: "Chrome 131 · macOS",
  mobile: "Kiln Ops for iOS 4.2.1",
  api: "kiln-sync/2.3 (node)",
  system: "Scheduler",
};

const critical = new Set(["user.locked", "api_key.created", "settings.updated", "user.role_changed", "api_key.scopes_changed", "user.removed", "export.created"]);
const notice = new Set(["invoice.overdue", "api_key.revoked", "user.invited", "order.cancelled", "invoice.voided", "user.new_device", "user.password_reset", "product.updated"]);
const severityOf = (action: string, changes?: AuditEntry["changes"]): Severity =>
  action === "settings.updated" && !changes?.some((c) => c.field.startsWith("require") || c.field.includes("session"))
    ? "notice"
    : critical.has(action)
      ? "critical"
      : notice.has(action)
        ? "notice"
        : "info";

const rid = (n: number) => `req_${(0x5a3f00 + n * 7919).toString(36)}${(n * 31).toString(36).padStart(3, "0")}`;

type Extra = [
  minutesAgo: number,
  actorId: string,
  action: string,
  en: string,
  tr: string,
  entity: AuditEntry["entity"],
  source: Source,
  changes?: AuditEntry["changes"],
  ip?: string,
];

const extra: Extra[] = [
  [
    38,
    "key:Warehouse sync",
    "stock.adjusted",
    "adjusted stock for Ash-glaze dinner plate after a cycle count",
    "döngüsel sayım sonrası Kül sırlı servis tabağının stoğunu düzeltti",
    { type: "product", id: "pr-02", label: "KL-CER-104" },
    "api",
    [{ field: "stock", from: "104", to: "96" }],
    "192.0.2.14",
  ],
  [
    95,
    "p-camille",
    "product.published",
    "published Brass task lamp",
    "Pirinç çalışma lambasını yayınladı",
    { type: "product", id: "pr-08", label: "KL-LGT-306" },
    "web",
    [
      { field: "status", from: "Draft", to: "Active" },
      { field: "price", from: "₺3,990.00", to: "₺4,290.00" },
    ],
    "203.0.113.24",
  ],
  [
    170,
    "p-maya",
    "settings.updated",
    "changed the order webhook endpoint",
    "sipariş webhook adresini değiştirdi",
    { type: "settings", id: "webhooks", label: "Webhooks" },
    "web",
    [
      {
        field: "url",
        from: "https://hooks.example.com/kiln/orders",
        to: "https://events.example.com/v2/orders",
      },
    ],
    "198.51.100.42",
  ],
  [
    320,
    "system",
    "user.new_device",
    "flagged a sign-in for Noah Brennan from a new device",
    "Noah Brennan için yeni bir cihazdan girişi işaretledi",
    { type: "user", id: "p-noah", label: "Noah Brennan" },
    "system",
    undefined,
    "198.51.100.88",
  ],
  [
    480,
    "p-aylin",
    "deal.won",
    "marked Halcyon Ferments · Expansion as won",
    "Halcyon Ferments · Genişleme fırsatını kazanıldı olarak işaretledi",
    { type: "deal", id: "d-7", label: "Halcyon Ferments · Expansion" },
    "web",
    [
      { field: "stage", from: "Negotiation", to: "Won" },
      { field: "amount", from: "$28,000.00", to: "$31,500.00" },
    ],
    "203.0.113.24",
  ],
  [
    700,
    "p-felix",
    "export.created",
    "exported 312 invoices to CSV",
    "312 faturayı CSV olarak dışa aktardı",
    { type: "invoice", id: "export-88", label: "invoices-2026-11-17.csv" },
    "web",
    [{ field: "reason", from: null, to: "Quarterly VAT reconciliation" }],
    "203.0.113.7",
  ],
  [
    1080,
    "p-ruth",
    "order.cancelled",
    "cancelled order #KL-24203 at the customer's request",
    "#KL-24203 siparişini müşteri isteğiyle iptal etti",
    { type: "order", id: "o-1023", label: "#KL-24203" },
    "mobile",
    [{ field: "status", from: "Paid", to: "Cancelled" }],
    "203.0.113.61",
  ],
  [
    1390,
    "p-ruth",
    "product.updated",
    "raised the price of Ash-glaze dinner plate",
    "Kül sırlı servis tabağının fiyatını artırdı",
    { type: "product", id: "pr-02", label: "KL-CER-104" },
    "web",
    [
      { field: "price", from: "₺499.00", to: "₺529.00" },
      { field: "marketplace_price", from: "₺559.00", to: "₺591.00" },
    ],
    "203.0.113.61",
  ],
  [
    1720,
    "p-zeynep",
    "ticket.priority_changed",
    "raised ticket #4809 to urgent",
    "#4809 numaralı talebin önceliğini acil yaptı",
    { type: "ticket", id: "t-4809", label: "#4809" },
    "web",
    [{ field: "priority", from: "Normal", to: "Urgent" }],
  ],
  [
    2050,
    "p-defne",
    "settings.updated",
    "shortened admin sessions from 12 to 8 hours",
    "yönetici oturumlarını 12 saatten 8 saate indirdi",
    { type: "settings", id: "security", label: "Security" },
    "web",
    [{ field: "session_timeout", from: "12h", to: "8h" }],
    "203.0.113.24",
  ],
  [
    2600,
    "system",
    "user.password_reset",
    "sent a password reset to hana.kobayashi@example.com",
    "hana.kobayashi@example.com adresine şifre sıfırlama gönderdi",
    { type: "user", id: "p-hana", label: "Hana Kobayashi" },
    "system",
  ],
  [
    2900,
    "p-gizem",
    "invoice.voided",
    "voided INV-2026-0317 (duplicate)",
    "INV-2026-0317 faturasını iptal etti (mükerrer)",
    { type: "invoice", id: "inv-9", label: "INV-2026-0317" },
    "web",
    [
      { field: "status", from: "Sent", to: "Void" },
      { field: "balance", from: "₺12,240.00", to: "₺0.00" },
    ],
    "198.51.100.17",
  ],
  [
    3600,
    "p-viktor",
    "api_key.scopes_changed",
    "added write access to the Marketplace feed key",
    "Pazaryeri akışı anahtarına yazma izni ekledi",
    { type: "api-key", id: "key-4", label: "Marketplace feed" },
    "web",
    [
      {
        field: "scopes",
        from: "products:read",
        to: "products:read, products:write",
      },
    ],
    "198.51.100.42",
  ],
  [
    4700,
    "key:Marketplace feed",
    "order.created",
    "imported 18 marketplace orders",
    "18 pazaryeri siparişini içe aktardı",
    { type: "order", id: "batch-311", label: "Batch 311" },
    "api",
    undefined,
    "192.0.2.14",
  ],
  [
    5600,
    "p-kerem",
    "settings.updated",
    "edited the “Refund approved” reply macro",
    "“İade onaylandı” yanıt makrosunu düzenledi",
    { type: "settings", id: "macros", label: "Support macros" },
    "web",
    [
      {
        field: "body",
        from: "Your refund is on its way and should arrive in 5 working days.",
        to: "Your refund is on its way. Card refunds usually arrive within 3–5 working days.",
      },
    ],
  ],
  [
    6900,
    "p-ece",
    "user.role_changed",
    "made Arda Koç an Admin",
    "Arda Koç'u Yönetici yaptı",
    { type: "user", id: "p-arda", label: "Arda Koç" },
    "web",
    [{ field: "role", from: "Editor", to: "Admin" }],
    "203.0.113.24",
  ],
  [
    8200,
    "p-defne",
    "user.removed",
    "removed jun.park@example.com from the workspace",
    "jun.park@example.com hesabını çalışma alanından çıkardı",
    { type: "user", id: "p-jun", label: "Jun Park" },
    "web",
    [{ field: "status", from: "Active", to: "Removed" }],
    "203.0.113.24",
  ],
  [
    9400,
    "system",
    "backup.completed",
    "finished the weekly backup (2.4 GB)",
    "haftalık yedeği tamamladı (2,4 GB)",
    { type: "settings", id: "backups", label: "Backups" },
    "system",
  ],
];

const fromShared: AuditEntry[] = activity.map((e, i) => ({
  ...e,
  entity: e.entity as AuditEntry["entity"],
  severity: severityOf(e.action, e.changes),
  requestId: rid(i + 1),
}));

const fromExtra: AuditEntry[] = extra.map(([minutesAgo, actorId, action, en, tr, entity, source, changes, ip], i) => ({
  id: `ev-x${i + 1}`,
  at: minutesFromNow(-minutesAgo),
  actorId,
  action,
  summary: { en, tr },
  entity,
  source,
  changes,
  ip,
  severity: severityOf(action, changes),
  requestId: rid(100 + i),
}));

/** Newest first. */
export const auditEntries: AuditEntry[] = [...fromShared, ...fromExtra].sort((a, b) => (a.at < b.at ? 1 : -1));

/** Actions that can be undone from the log (a new event is written; nothing is erased). */
export const revertible = new Set(["product.updated", "settings.updated", "user.role_changed", "product.published", "ticket.priority_changed"]);
