// Commerce overview fixtures for the product tour: today's numbers, the order queue and low stock
// come from the shared fixtures; the tours themselves are copy plus `data-tour` targets.
import { dailyRevenue } from "../../_shared/metrics";
import { orders, customersById, type Order } from "../../_shared/orders";
import { products, stockState } from "../../_shared/products";
import type { L } from "../../_shared/l10n";

export type QueueTab = "pack" | "packed" | "returns";

export const queue: Record<QueueTab, Order[]> = {
  pack: orders.filter((o) => o.status === "paid"),
  /** Fills up as orders are marked packed; the courier collects at 16:00. */
  packed: [],
  returns: orders.filter((o) => o.status === "refunded").slice(0, 2),
};

export const customerName = (o: Order) => customersById[o.customerId]?.name ?? "—";

export const lowStock = products.filter((p) => p.status === "active" && stockState(p) !== "ok").slice(0, 4);

const last14 = dailyRevenue.slice(-14);
export const kpis = {
  revenue: { value: Number(last14.at(-1)!.revenue), prev: Number(last14.at(-8)!.revenue), trend: last14.map((d) => Number(d.revenue)) },
  orders: { value: last14.at(-1)!.orders, prev: last14.at(-8)!.orders, trend: last14.map((d) => d.orders) },
  conversion: { value: 0.0284, prev: 0.0261, trend: [2.4, 2.5, 2.3, 2.6, 2.7, 2.5, 2.6, 2.8, 2.7, 2.6, 2.9, 2.8, 2.7, 2.84] },
  visitors: { value: 1912, prev: 1788, trend: [1420, 1510, 1388, 1602, 1655, 1590, 1720, 1810, 1690, 1744, 1866, 1802, 1835, 1912] },
};

export type TourId = "basics" | "orders";

export interface TourDef {
  id: TourId;
  title: L;
  description: L;
  minutes: number;
  steps: Array<{ id: string; target?: string; side?: "top" | "right" | "bottom" | "left"; align?: "start" | "center" | "end"; title: L; description: L }>;
}

export const tours: TourDef[] = [
  {
    id: "basics",
    title: { en: "The basics", tr: "Temel bilgiler" },
    description: { en: "Where things live: search, today's numbers, the order queue, stock and the create button.", tr: "Neyin nerede olduğu: arama, bugünün rakamları, sipariş kuyruğu, stok ve oluştur düğmesi." },
    minutes: 2,
    steps: [
      { id: "welcome", title: { en: "Welcome to your store's back office", tr: "Mağazanızın yönetim paneline hoş geldiniz" }, description: { en: "Six quick stops. Use the arrow keys to move and Esc to leave — you can replay this any time.", tr: "Altı kısa durak. Ok tuşlarıyla ilerleyin, Esc ile çıkın — istediğiniz zaman yeniden izleyebilirsiniz." } },
      { id: "search", target: "[data-slot=top-bar-search]", side: "bottom", align: "start", title: { en: "Search runs everything", tr: "Arama her şeyi yapar" }, description: { en: "Find an order, a customer or a setting, or type a command like “refund”.", tr: "Bir sipariş, müşteri ya da ayar bulun veya “iade” gibi bir komut yazın." } },
      { id: "kpis", target: "[data-tour=kpis]", side: "bottom", title: { en: "Today at a glance", tr: "Bugün bir bakışta" }, description: { en: "Revenue, orders, conversion and visitors so far today, against the same day last week.", tr: "Bugüne kadarki ciro, sipariş, dönüşüm ve ziyaretçi; geçen haftanın aynı günüyle kıyaslı." } },
      { id: "queue", target: "[data-tour=queue]", side: "top", align: "start", title: { en: "Orders that need you", tr: "Sizi bekleyen siparişler" }, description: { en: "Paid orders wait here until they are packed and handed to the courier.", tr: "Ödenen siparişler paketlenip kargoya verilene kadar burada bekler." } },
      { id: "stock", target: "[data-tour=stock]", side: "top", align: "start", title: { en: "Stock warnings", tr: "Stok uyarıları" }, description: { en: "Products at or under their reorder point. Reorder straight from the list.", tr: "Yeniden sipariş seviyesindeki veya altındaki ürünler. Listeden doğrudan sipariş verin." } },
      { id: "create", target: "[data-tour=create]", side: "bottom", align: "end", title: { en: "Create from here", tr: "Buradan oluşturun" }, description: { en: "Draft an order for a phone or showroom sale. Products and customers start from the same menu.", tr: "Telefon veya mağaza satışı için taslak sipariş açın. Ürün ve müşteri de aynı menüden." } },
      { id: "replay", target: "[data-tour=tours]", side: "left", align: "start", title: { en: "Replay any time", tr: "İstediğiniz zaman tekrar izleyin" }, description: { en: "Every tour lives here, with your progress. New features get a short tour of their own.", tr: "Tüm turlar ilerlemenizle burada. Yeni özelliklerin de kısa bir turu olur." } },
    ],
  },
  {
    id: "orders",
    title: { en: "Handling an order", tr: "Bir siparişi işlemek" },
    description: { en: "From paid to packed: the queue tabs, the row action and printing labels in bulk.", tr: "Ödendiden paketlendiye: kuyruk sekmeleri, satır işlemi ve toplu etiket basımı." },
    minutes: 1,
    steps: [
      { id: "tabs", target: "[data-tour=queue-tabs]", side: "bottom", align: "start", title: { en: "One queue, three stages", tr: "Tek kuyruk, üç aşama" }, description: { en: "To pack, packed and returns. The counts update as your team works.", tr: "Paketlenecek, paketlenen ve iadeler. Sayılar ekip çalıştıkça güncellenir." } },
      { id: "row", target: "[data-tour=queue-action]", side: "left", title: { en: "Pack in one click", tr: "Tek tıkla paketleyin" }, description: { en: "Mark an order packed and it moves to “Packed” for the 16:00 pickup. The customer gets an email.", tr: "Siparişi paketlendi olarak işaretleyin, 16:00 alımı için “Paketlenen”e geçer. Müşteriye e-posta gider." } },
      { id: "labels", target: "[data-tour=labels]", side: "bottom", align: "end", title: { en: "Labels for the whole batch", tr: "Tüm parti için etiket" }, description: { en: "Print courier labels for every order in the tab as one PDF.", tr: "Sekmedeki tüm siparişlerin kargo etiketlerini tek PDF olarak basın." } },
    ],
  },
];
