// The product story on the left of login-03: three short chapters about what happened in
// Kiln & Linen's back office overnight. Numbers come from the shared fixtures.
import { csatTrend } from "../../_shared/tickets";
import { dailyRevenue } from "../../_shared/metrics";
import { products } from "../../_shared/products";
import type { L } from "../../_shared/l10n";

export interface Chapter {
  id: string;
  tab: L;
  headline: L;
  body: L;
  kpi: { value: number; suffix?: string; label: L; decimals?: number };
  spark: number[];
  log: Array<{ time: string; text: L }>;
}

export const chapters: Chapter[] = [
  {
    id: "orders",
    tab: { en: "Orders", tr: "Siparişler" },
    headline: { en: "Orders that close themselves overnight.", tr: "Gece kendi kendine kapanan siparişler." },
    body: {
      en: "Marketplace, web and shop-floor orders land in one queue, get matched to payments and leave with a label before the team logs in.",
      tr: "Pazaryeri, web ve mağaza siparişleri tek kuyruğa düşer, ödemelerle eşleşir ve ekip giriş yapmadan etiketiyle yola çıkar.",
    },
    kpi: { value: dailyRevenue.reduce((s, d) => s + d.orders, 0), label: { en: "orders in the last 30 days", tr: "son 30 günde sipariş" } },
    spark: dailyRevenue.map((d) => d.orders),
    log: [
      { time: "02:14", text: { en: "41 marketplace orders imported", tr: "41 pazaryeri siparişi alındı" } },
      { time: "02:15", text: { en: "Payments matched · 0 left over", tr: "Ödemeler eşleşti · 0 açık kalem" } },
      { time: "06:30", text: { en: "38 labels printed for the first pickup", tr: "İlk teslim için 38 etiket basıldı" } },
    ],
  },
  {
    id: "stock",
    tab: { en: "Stock", tr: "Stok" },
    headline: { en: "Stock that’s right in every channel.", tr: "Her kanalda doğru stok." },
    body: {
      en: "A sale in the shop updates the marketplace listing in seconds, and reorder points raise a purchase draft before a bestseller runs dry.",
      tr: "Mağazadaki bir satış pazaryeri ilanını saniyeler içinde günceller; yeniden sipariş noktası, çok satan ürün bitmeden satın alma taslağı açar.",
    },
    kpi: { value: products.length * 3, label: { en: "variants synced across 3 channels", tr: "3 kanalda eşitlenen varyant" } },
    spark: [62, 58, 55, 51, 47, 44, 40, 37, 81, 78, 74, 70, 66, 63],
    log: [
      { time: "01:02", text: { en: "Linen duvet · Oat — below reorder point", tr: "Keten nevresim · Yulaf — yeniden sipariş noktasının altında" } },
      { time: "01:02", text: { en: "Purchase draft PO-1188 created", tr: "PO-1188 satın alma taslağı oluşturuldu" } },
      { time: "07:45", text: { en: "Warehouse count confirmed · 0 variance", tr: "Depo sayımı onaylandı · 0 fark" } },
    ],
  },
  {
    id: "support",
    tab: { en: "Support", tr: "Destek" },
    headline: { en: "Customers who hear back before lunch.", tr: "Öğleden önce yanıt alan müşteriler." },
    body: {
      en: "Every ticket arrives with the order, the parcel and the last conversation attached, so replies take minutes instead of a search.",
      tr: "Her talep sipariş, kargo ve son konuşmayla birlikte gelir; yanıtlar arama yerine dakikalar sürer.",
    },
    kpi: { value: csatTrend[csatTrend.length - 1]!, suffix: "%", label: { en: "customer satisfaction this week", tr: "bu hafta müşteri memnuniyeti" } },
    spark: csatTrend,
    log: [
      { time: "08:58", text: { en: "Return approved · refund sent automatically", tr: "İade onaylandı · ücret iadesi otomatik gönderildi" } },
      { time: "09:12", text: { en: "Reply with tracking link · 3 min", tr: "Takip bağlantısıyla yanıt · 3 dk" } },
      { time: "09:40", text: { en: "SLA met on 12 of 12 morning tickets", tr: "12 sabah talebinin 12’sinde SLA tuttu" } },
    ],
  },
];

/** Demo rule for the password step. */
export const isCorrectPassword = (pw: string) => pw.length >= 8;
