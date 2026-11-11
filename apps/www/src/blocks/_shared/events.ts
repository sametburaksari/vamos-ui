// Things that happen over time: calendar bookings (list-06 agenda, dashboard-07 leave calendar)
// and an activity / audit stream (list-09 audit log, list-11 feed, detail timelines).
import type { L } from "./l10n";
import { at, minutesFromNow } from "./time";

export interface Booking {
  id: string;
  /** ISO date-time (+03:00). */
  start: string;
  end: string;
  title: L;
  customer: string;
  resourceId: string;
  location: L;
  status: "confirmed" | "tentative" | "cancelled" | "checked-in";
}

export interface ActivityEvent {
  id: string;
  at: string;
  /** people.ts id, or "system". */
  actorId: string;
  /** Machine action, e.g. "invoice.sent". */
  action: string;
  /** Human sentence without the actor: "sent invoice INV-2026-0331". */
  summary: L;
  entity: { type: "invoice" | "order" | "deal" | "ticket" | "user" | "product" | "api-key" | "settings"; id: string; label: string };
  /** Field-level changes for diff previews. */
  changes?: Array<{ field: string; from: string | null; to: string | null }>;
  ip?: string;
  source: "web" | "api" | "mobile" | "system";
}

export const bookingStatusLabels: Record<Booking["status"], L> = {
  confirmed: { en: "Confirmed", tr: "Onaylandı" },
  tentative: { en: "Tentative", tr: "Ön kayıt" },
  cancelled: { en: "Cancelled", tr: "İptal" },
  "checked-in": { en: "Checked in", tr: "Giriş yaptı" },
};

/** Meeting rooms / resources for bookings. */
export const resources: Array<{ id: string; name: L }> = [
  { id: "rs-1", name: { en: "Studio A", tr: "Stüdyo A" } },
  { id: "rs-2", name: { en: "Studio B", tr: "Stüdyo B" } },
  { id: "rs-3", name: { en: "Showroom", tr: "Showroom" } },
];

const b = (id: string, d: number, s: string, e: string, en: string, tr: string, customer: string, resourceId: string, status: Booking["status"] = "confirmed"): Booking => ({
  id,
  start: at(d, s),
  end: at(d, e),
  title: { en, tr },
  customer,
  resourceId,
  location: resources.find((r) => r.id === resourceId)!.name,
  status,
});

/** 16 bookings over the next week (some today, one cancelled). */
export const bookings: Booking[] = [
  b("bk-1", 0, "09:30", "10:30", "Kitchen design consultation", "Mutfak tasarım danışmanlığı", "Aslı Korkmaz", "rs-3", "checked-in"),
  b("bk-2", 0, "11:00", "11:45", "Fabric sample review", "Kumaş numune incelemesi", "Emre Doğan", "rs-1"),
  b("bk-3", 0, "14:00", "15:30", "Lighting plan walkthrough", "Aydınlatma planı sunumu", "Sophie Laurent", "rs-2", "tentative"),
  b("bk-4", 0, "16:00", "16:30", "Order pickup", "Sipariş teslim alma", "Murat Tekin", "rs-3"),
  b("bk-5", 1, "10:00", "11:00", "Showroom tour", "Showroom turu", "Lea Fischer", "rs-3"),
  b("bk-6", 1, "13:30", "14:30", "Ceramics workshop", "Seramik atölyesi", "Ilgın Er", "rs-1"),
  b("bk-7", 1, "15:00", "15:45", "Return inspection", "İade kontrolü", "Rafael Mendes", "rs-2", "cancelled"),
  b("bk-8", 2, "09:00", "10:00", "Wholesale buyer meeting", "Toptan alıcı görüşmesi", "Nil Başaran", "rs-3"),
  b("bk-9", 2, "11:30", "12:30", "Bedroom textiles consultation", "Yatak odası tekstil danışmanlığı", "Oğuz Kalkan", "rs-1"),
  b("bk-10", 3, "10:30", "11:15", "Custom glaze approval", "Özel sır onayı", "Tara Whitfield", "rs-2"),
  b("bk-11", 3, "14:00", "16:00", "Ceramics workshop", "Seramik atölyesi", "Sena Gürel", "rs-1"),
  b("bk-12", 4, "09:30", "10:00", "Order pickup", "Sipariş teslim alma", "Cansu Yalçın", "rs-3"),
  b("bk-13", 4, "12:00", "13:00", "Hotel suite styling", "Otel süiti stil danışmanlığı", "Kaan Toprak", "rs-3", "tentative"),
  b("bk-14", 6, "11:00", "12:30", "Weekend open studio", "Hafta sonu açık stüdyo", "Walk-ins", "rs-1"),
  b("bk-15", 7, "10:00", "11:00", "Kitchen design consultation", "Mutfak tasarım danışmanlığı", "Murat Tekin", "rs-3"),
  b("bk-16", 7, "15:00", "15:30", "Fabric sample review", "Kumaş numune incelemesi", "Lea Fischer", "rs-2"),
];

const ev = (id: string, minutesAgo: number, actorId: string, action: string, en: string, tr: string, entity: ActivityEvent["entity"], source: ActivityEvent["source"], changes?: ActivityEvent["changes"], ip?: string): ActivityEvent => ({
  id,
  at: minutesFromNow(-minutesAgo),
  actorId,
  action,
  summary: { en, tr },
  entity,
  source,
  changes,
  ip,
});

/** 18 events, newest first, spanning ~3 days. IPs are documentation ranges (RFC 5737). */
export const activity: ActivityEvent[] = [
  ev("ev-1", 2, "p-aylin", "deal.stage_changed", "moved Halcyon Ferments · Renewal to Negotiation", "Halcyon Ferments · Yenileme fırsatını Pazarlık aşamasına taşıdı", { type: "deal", id: "d-3", label: "Halcyon Ferments · Renewal" }, "web", [{ field: "stage", from: "Proposal sent", to: "Negotiation" }, { field: "probability", from: "50", to: "75" }], "203.0.113.24"),
  ev("ev-2", 6, "system", "order.paid", "captured payment for order #KL-24228", "#KL-24228 siparişinin ödemesini aldı", { type: "order", id: "o-1048", label: "#KL-24228" }, "system"),
  ev("ev-3", 11, "p-oskar", "ticket.replied", "replied to ticket #4814", "#4814 numaralı talebi yanıtladı", { type: "ticket", id: "t-4814", label: "#4814" }, "web"),
  ev("ev-4", 19, "p-felix", "invoice.sent", "sent invoice INV-2026-0331 to Velvet Anchor Hotels", "INV-2026-0331 faturasını Velvet Anchor Hotels'e gönderdi", { type: "invoice", id: "inv-14", label: "INV-2026-0331" }, "web", undefined, "203.0.113.7"),
  ev("ev-5", 34, "p-viktor", "api_key.created", "created API key “Warehouse sync”", "“Depo senkronu” API anahtarını oluşturdu", { type: "api-key", id: "key-7", label: "Warehouse sync" }, "web", [{ field: "scopes", from: null, to: "orders:read, stock:write" }], "198.51.100.42"),
  ev("ev-6", 52, "p-ruth", "product.updated", "changed stock for Waffle cotton bath towel", "Petek dokuma banyo havlusunun stoğunu değiştirdi", { type: "product", id: "pr-05", label: "KL-TEX-208" }, "mobile", [{ field: "stock", from: "24", to: "0" }, { field: "status", from: "In stock", to: "Out of stock" }]),
  ev("ev-7", 75, "p-ece", "user.invited", "invited arda.koc@example.com as Editor", "arda.koc@example.com adresini Editör olarak davet etti", { type: "user", id: "p-arda", label: "Arda Koç" }, "web", [{ field: "role", from: null, to: "Editor" }], "203.0.113.24"),
  ev("ev-8", 130, "p-defne", "settings.updated", "turned on two-factor authentication for all admins", "tüm yöneticiler için iki adımlı doğrulamayı açtı", { type: "settings", id: "security", label: "Security" }, "web", [{ field: "require_2fa", from: "false", to: "true" }], "203.0.113.24"),
  ev("ev-9", 190, "system", "invoice.overdue", "marked INV-2026-0322 as overdue", "INV-2026-0322 faturasını vadesi geçmiş olarak işaretledi", { type: "invoice", id: "inv-5", label: "INV-2026-0322" }, "system"),
  ev("ev-10", 260, "p-tomas", "deal.created", "created deal Calderwood Labs · Pilot", "Calderwood Labs · Pilot fırsatını oluşturdu", { type: "deal", id: "d-12", label: "Calderwood Labs · Pilot" }, "web", [{ field: "amount", from: null, to: "$12,000.00" }]),
  ev("ev-11", 420, "p-kerem", "ticket.merged", "merged ticket #4822 into #4818", "#4822 numaralı talebi #4818 ile birleştirdi", { type: "ticket", id: "t-4818", label: "#4818" }, "web"),
  ev("ev-12", 610, "p-gizem", "invoice.paid", "recorded payment of ₺48,500.00 on INV-2026-0319", "INV-2026-0319 için ₺48.500,00 ödeme kaydetti", { type: "invoice", id: "inv-2", label: "INV-2026-0319" }, "web", [{ field: "balance", from: "₺48,500.00", to: "₺0.00" }]),
  ev("ev-13", 900, "system", "api_key.revoked", "revoked unused API key “Old POS bridge”", "kullanılmayan “Eski POS köprüsü” API anahtarını iptal etti", { type: "api-key", id: "key-2", label: "Old POS bridge" }, "system"),
  ev("ev-14", 1220, "p-arda", "settings.updated", "changed the default currency to EUR for the EU store", "AB mağazası için varsayılan para birimini EUR yaptı", { type: "settings", id: "store-eu", label: "EU store" }, "web", [{ field: "currency", from: "USD", to: "EUR" }], "198.51.100.17"),
  ev("ev-15", 1500, "p-ruth", "order.shipped", "shipped order #KL-24211 with Martı Express", "#KL-24211 siparişini Martı Express ile gönderdi", { type: "order", id: "o-1031", label: "#KL-24211" }, "mobile"),
  ev("ev-16", 2300, "p-defne", "user.role_changed", "changed Gizem Uysal's role from Viewer to Accountant", "Gizem Uysal'ın rolünü Görüntüleyici'den Muhasebeci'ye değiştirdi", { type: "user", id: "p-gizem", label: "Gizem Uysal" }, "web", [{ field: "role", from: "Viewer", to: "Accountant" }], "203.0.113.24"),
  ev("ev-17", 3100, "system", "user.locked", "locked hana.kobayashi@example.com after 5 failed sign-ins", "5 başarısız girişten sonra hana.kobayashi@example.com hesabını kilitledi", { type: "user", id: "p-hana", label: "Hana Kobayashi" }, "system", undefined, "192.0.2.199"),
  ev("ev-18", 4200, "p-camille", "product.updated", "updated the SEO title of Linen duvet cover", "Keten nevresimin SEO başlığını güncelledi", { type: "product", id: "pr-04", label: "KL-TEX-201" }, "web", [{ field: "seo_title", from: "Linen duvet cover", to: "Washed linen duvet cover — breathable, pre-softened" }]),
];
