// Integrations marketplace data. Starts from the shared `integrations` fixture and adds what the
// marketplace screen needs: permissions asked at connect time, what each one syncs, sync logs.
// Every provider is fictional — the block shows the pattern, not real vendors.
import { integrations as base, integrationCategoryLabels, type Integration } from "../../_shared/account";
import type { L } from "../../_shared/l10n";
import { minutesFromNow } from "../../_shared/time";

export { integrationCategoryLabels };
export type Category = Integration["category"];
export type Status = Integration["status"];

export interface SyncObject {
  key: string;
  label: L;
  direction: "in" | "out" | "both";
  enabled: boolean;
}

export interface SyncLogEntry {
  id: string;
  at: string;
  result: "ok" | "warning" | "failed";
  message: L;
  records?: number;
}

export interface MarketIntegration extends Integration {
  /** Who maintains it. */
  publisher: string;
  /** Installs across all workspaces — social proof on the tile. */
  installs: number;
  /** Requested at connect time. `required` ones can't be unticked. */
  scopes: Array<{ key: string; label: L; required?: boolean }>;
  /** What the account field is called on connect ("Store ID", "API key"). */
  credential: { label: L; placeholder: string; pattern: RegExp; hint: L };
  syncs: SyncObject[];
  frequency: "realtime" | "15m" | "hourly" | "daily";
  recordsToday?: number;
  connectedBy?: string;
  log: SyncLogEntry[];
  /** For "coming soon": people who asked to be told. */
  waitlist?: boolean;
  error?: L;
}

const extra: Integration[] = [
  { id: "in-8", name: "Ferrypost", category: "shipping", mark: "FP", status: "available", description: { en: "Same-day courier booking inside Istanbul and Izmir.", tr: "İstanbul ve İzmir içinde aynı gün kurye." } },
  { id: "in-9", name: "Larkledger", category: "accounting", mark: "LL", status: "available", description: { en: "E-invoice and e-archive numbering with your tax office.", tr: "Vergi dairenizle e-fatura ve e-arşiv numaralandırma." } },
  { id: "in-10", name: "Quillsend", category: "marketing", mark: "QS", status: "connected", lastSync: minutesFromNow(-38), description: { en: "Abandoned cart and win-back flows by SMS.", tr: "SMS ile terk edilen sepet ve geri kazanım akışları." } },
  { id: "in-11", name: "Bellwire", category: "communication", mark: "BW", status: "available", description: { en: "Route customer messaging chats to the support inbox.", tr: "Müşteri mesajlaşma sohbetlerini destek kutusuna yönlendirin." } },
  { id: "in-12", name: "Tinmarket", category: "marketplace", mark: "TM", status: "coming-soon", description: { en: "Sell on a regional crafts marketplace.", tr: "Bölgesel el sanatları pazaryerinde satış." } },
];

const scopes = {
  orders: { key: "orders", label: { en: "Read and update orders", tr: "Siparişleri okuma ve güncelleme" }, required: true },
  products: { key: "products", label: { en: "Read products and prices", tr: "Ürün ve fiyatları okuma" } },
  stock: { key: "stock", label: { en: "Update stock levels", tr: "Stok seviyelerini güncelleme" } },
  customers: { key: "customers", label: { en: "Read customer names and addresses", tr: "Müşteri ad ve adreslerini okuma" } },
  invoices: { key: "invoices", label: { en: "Create invoices", tr: "Fatura oluşturma" }, required: true },
  messages: { key: "messages", label: { en: "Send messages on your behalf", tr: "Sizin adınıza mesaj gönderme" }, required: true },
} satisfies Record<string, MarketIntegration["scopes"][number]>;

const apiKey = { label: { en: "API key", tr: "API anahtarı" }, placeholder: "sk_live_…", pattern: /^sk_(live|test)_[A-Za-z0-9]{8,}$/, hint: { en: "Starts with sk_live_ or sk_test_. Find it under Developers → Keys in the provider's panel.", tr: "sk_live_ veya sk_test_ ile başlar. Sağlayıcı panelinde Geliştirici → Anahtarlar altında bulunur." } };
const storeId = { label: { en: "Store ID", tr: "Mağaza kimliği" }, placeholder: "KL-000000", pattern: /^[A-Z]{2}-\d{6}$/, hint: { en: "Two letters and six digits, e.g. KL-204118.", tr: "İki harf ve altı rakam, örn. KL-204118." } };

type Extra = Omit<MarketIntegration, keyof Integration>;

const extras: Record<string, Extra> = {
  "in-1": { publisher: "Paywick Labs", installs: 18_400, scopes: [scopes.orders, scopes.customers], credential: apiKey, frequency: "realtime", recordsToday: 412, connectedBy: "p-felix",
    syncs: [
      { key: "payments", label: { en: "Payments and refunds", tr: "Ödemeler ve iadeler" }, direction: "in", enabled: true },
      { key: "payouts", label: { en: "Payouts to your bank", tr: "Banka hesabınıza aktarımlar" }, direction: "in", enabled: true },
      { key: "disputes", label: { en: "Chargebacks and disputes", tr: "Ters ibraz ve itirazlar" }, direction: "in", enabled: false },
    ],
    log: [
      { id: "l1", at: minutesFromNow(-2), result: "ok", records: 6, message: { en: "6 payments captured", tr: "6 ödeme alındı" } },
      { id: "l2", at: minutesFromNow(-64), result: "ok", records: 1, message: { en: "1 refund matched to order KL-10422", tr: "1 iade KL-10422 siparişiyle eşleşti" } },
      { id: "l3", at: minutesFromNow(-310), result: "warning", message: { en: "Payout delayed by the bank, retried", tr: "Aktarım banka nedeniyle gecikti, tekrar denendi" } },
    ] },
  "in-2": { publisher: "Parcelwright", installs: 9_120, scopes: [scopes.orders, scopes.customers], credential: storeId, frequency: "15m", recordsToday: 138, connectedBy: "p-viktor",
    syncs: [
      { key: "labels", label: { en: "Create shipping labels", tr: "Kargo etiketi oluşturma" }, direction: "out", enabled: true },
      { key: "tracking", label: { en: "Tracking updates", tr: "Takip güncellemeleri" }, direction: "in", enabled: true },
      { key: "returns", label: { en: "Return labels", tr: "İade etiketleri" }, direction: "out", enabled: true },
    ],
    log: [
      { id: "l1", at: minutesFromNow(-15), result: "ok", records: 22, message: { en: "22 tracking updates", tr: "22 takip güncellemesi" } },
      { id: "l2", at: minutesFromNow(-30), result: "ok", records: 9, message: { en: "9 labels printed", tr: "9 etiket basıldı" } },
    ] },
  "in-3": { publisher: "Ledgerfern", installs: 6_340, scopes: [scopes.invoices, scopes.orders, scopes.customers], credential: apiKey, frequency: "hourly", recordsToday: 0, connectedBy: "p-felix",
    error: { en: "The access token expired yesterday at 10:24. 31 invoices are waiting to be sent.", tr: "Erişim anahtarının süresi dün 10:24'te doldu. 31 fatura gönderilmeyi bekliyor." },
    syncs: [
      { key: "invoices", label: { en: "Sales invoices", tr: "Satış faturaları" }, direction: "out", enabled: true },
      { key: "payments", label: { en: "Payments received", tr: "Alınan ödemeler" }, direction: "out", enabled: true },
      { key: "contacts", label: { en: "Customer accounts", tr: "Cari hesaplar" }, direction: "both", enabled: false },
    ],
    log: [
      { id: "l1", at: minutesFromNow(-60), result: "failed", message: { en: "401 Unauthorized — token expired", tr: "401 Yetkisiz — anahtarın süresi doldu" } },
      { id: "l2", at: minutesFromNow(-120), result: "failed", message: { en: "401 Unauthorized — token expired", tr: "401 Yetkisiz — anahtarın süresi doldu" } },
      { id: "l3", at: minutesFromNow(-1440), result: "ok", records: 44, message: { en: "44 invoices sent", tr: "44 fatura gönderildi" } },
    ] },
  "in-4": { publisher: "Postwren", installs: 12_800, scopes: [scopes.customers, scopes.orders], credential: apiKey, frequency: "hourly",
    syncs: [
      { key: "customers", label: { en: "Customers and consent", tr: "Müşteriler ve izinler" }, direction: "out", enabled: true },
      { key: "orders", label: { en: "Order events for flows", tr: "Akışlar için sipariş olayları" }, direction: "out", enabled: true },
    ], log: [] },
  "in-5": { publisher: "Hollerline", installs: 21_050, scopes: [scopes.messages], credential: apiKey, frequency: "realtime",
    syncs: [
      { key: "orders", label: { en: "New order alerts", tr: "Yeni sipariş bildirimleri" }, direction: "out", enabled: true },
      { key: "stock", label: { en: "Low stock alerts", tr: "Düşük stok bildirimleri" }, direction: "out", enabled: true },
    ], log: [] },
  "in-6": { publisher: "Bazaarline", installs: 15_600, scopes: [scopes.orders, scopes.products, scopes.stock], credential: storeId, frequency: "15m", recordsToday: 734, connectedBy: "p-yusuf",
    syncs: [
      { key: "listings", label: { en: "Product listings and prices", tr: "Ürün ilanları ve fiyatlar" }, direction: "out", enabled: true },
      { key: "stock", label: { en: "Stock levels", tr: "Stok seviyeleri" }, direction: "out", enabled: true },
      { key: "orders", label: { en: "Marketplace orders", tr: "Pazaryeri siparişleri" }, direction: "in", enabled: true },
      { key: "questions", label: { en: "Customer questions", tr: "Müşteri soruları" }, direction: "in", enabled: false },
    ],
    log: [
      { id: "l1", at: minutesFromNow(-6), result: "ok", records: 14, message: { en: "14 orders imported", tr: "14 sipariş alındı" } },
      { id: "l2", at: minutesFromNow(-21), result: "warning", records: 2, message: { en: "2 listings rejected: missing barcode", tr: "2 ilan reddedildi: barkod eksik" } },
      { id: "l3", at: minutesFromNow(-36), result: "ok", records: 312, message: { en: "312 stock levels pushed", tr: "312 stok seviyesi gönderildi" } },
    ] },
  "in-7": { publisher: "Scanbright", installs: 0, scopes: [scopes.orders, scopes.stock], credential: storeId, frequency: "realtime", syncs: [], log: [], waitlist: false },
  "in-8": { publisher: "Ferrypost", installs: 2_410, scopes: [scopes.orders, scopes.customers], credential: storeId, frequency: "realtime",
    syncs: [{ key: "bookings", label: { en: "Courier bookings", tr: "Kurye talepleri" }, direction: "out", enabled: true }], log: [] },
  "in-9": { publisher: "Larkledger", installs: 4_980, scopes: [scopes.invoices, scopes.customers], credential: apiKey, frequency: "hourly",
    syncs: [{ key: "einvoice", label: { en: "E-invoices and e-archive", tr: "E-fatura ve e-arşiv" }, direction: "out", enabled: true }], log: [] },
  "in-10": { publisher: "Quillsend", installs: 7_730, scopes: [scopes.customers, scopes.messages], credential: apiKey, frequency: "hourly", recordsToday: 61, connectedBy: "p-defne",
    syncs: [
      { key: "carts", label: { en: "Abandoned carts", tr: "Terk edilen sepetler" }, direction: "out", enabled: true },
      { key: "optouts", label: { en: "SMS opt-outs", tr: "SMS izin iptalleri" }, direction: "in", enabled: true },
    ],
    log: [{ id: "l1", at: minutesFromNow(-38), result: "ok", records: 61, message: { en: "61 cart reminders queued", tr: "61 sepet hatırlatması kuyruğa alındı" } }] },
  "in-11": { publisher: "Bellwire", installs: 3_390, scopes: [scopes.messages, scopes.customers], credential: apiKey, frequency: "realtime",
    syncs: [{ key: "chats", label: { en: "Chats to the support inbox", tr: "Sohbetleri destek kutusuna" }, direction: "in", enabled: true }], log: [] },
  "in-12": { publisher: "Tinmarket", installs: 0, scopes: [], credential: storeId, frequency: "daily", syncs: [], log: [], waitlist: true },
};

export const marketIntegrations: MarketIntegration[] = [...base, ...extra].map((i) => ({ ...i, ...extras[i.id]! }));

export const frequencyLabels: Record<MarketIntegration["frequency"], L> = {
  realtime: { en: "As it happens", tr: "Anında" },
  "15m": { en: "Every 15 minutes", tr: "15 dakikada bir" },
  hourly: { en: "Every hour", tr: "Saatte bir" },
  daily: { en: "Once a day, 03:00", tr: "Günde bir, 03:00" },
};

export const statusLabels: Record<Status, L> = {
  connected: { en: "Connected", tr: "Bağlı" },
  error: { en: "Needs attention", tr: "İlgilenilmeli" },
  available: { en: "Available", tr: "Kullanılabilir" },
  "coming-soon": { en: "Coming soon", tr: "Yakında" },
};

export const directionLabels: Record<SyncObject["direction"], L> = {
  in: { en: "Into Kiln & Linen", tr: "Kiln & Linen'e" },
  out: { en: "From Kiln & Linen", tr: "Kiln & Linen'den" },
  both: { en: "Both ways", tr: "İki yönlü" },
};
