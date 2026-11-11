// Store admin navigation: top-level sections, each with its own sub-tabs.
import type { L } from "../_shared/l10n";

export interface SubTab {
  id: string;
  label: L;
}

export interface StoreSection {
  id: string;
  label: L;
  tabs: SubTab[];
}

export const storeNav: StoreSection[] = [
  { id: "home", label: { en: "Home", tr: "Ana sayfa" }, tabs: [{ id: "overview", label: { en: "Overview", tr: "Genel bakış" } }, { id: "tasks", label: { en: "To do", tr: "Yapılacaklar" } }] },
  {
    id: "orders", label: { en: "Orders", tr: "Siparişler" },
    tabs: [
      { id: "all", label: { en: "All orders", tr: "Tüm siparişler" } },
      { id: "unfulfilled", label: { en: "Unfulfilled", tr: "Gönderilmeyen" } },
      { id: "unpaid", label: { en: "Awaiting payment", tr: "Ödeme bekleyen" } },
      { id: "returns", label: { en: "Returns & refunds", tr: "İade ve geri ödemeler" } },
      { id: "abandoned", label: { en: "Abandoned checkouts", tr: "Terk edilen ödemeler" } },
    ],
  },
  {
    id: "products", label: { en: "Products", tr: "Ürünler" },
    tabs: [
      { id: "catalog", label: { en: "Catalogue", tr: "Katalog" } },
      { id: "collections", label: { en: "Collections", tr: "Koleksiyonlar" } },
      { id: "inventory", label: { en: "Inventory", tr: "Stok" } },
      { id: "gift-cards", label: { en: "Gift cards", tr: "Hediye kartları" } },
    ],
  },
  {
    id: "customers", label: { en: "Customers", tr: "Müşteriler" },
    tabs: [
      { id: "list", label: { en: "All customers", tr: "Tüm müşteriler" } },
      { id: "segments", label: { en: "Segments", tr: "Segmentler" } },
      { id: "reviews", label: { en: "Reviews", tr: "Değerlendirmeler" } },
    ],
  },
  {
    id: "marketing", label: { en: "Marketing", tr: "Pazarlama" },
    tabs: [
      { id: "discounts", label: { en: "Discounts", tr: "İndirimler" } },
      { id: "campaigns", label: { en: "Campaigns", tr: "Kampanyalar" } },
      { id: "automations", label: { en: "Automations", tr: "Otomasyonlar" } },
    ],
  },
  {
    id: "analytics", label: { en: "Analytics", tr: "Analiz" },
    tabs: [
      { id: "sales", label: { en: "Sales", tr: "Satışlar" } },
      { id: "behaviour", label: { en: "Behaviour", tr: "Davranış" } },
      { id: "live", label: { en: "Live view", tr: "Canlı görünüm" } },
    ],
  },
];

export interface Storefront {
  id: string;
  name: L;
  domain: string;
}

export const storefronts: Storefront[] = [
  { id: "online", name: { en: "Online store", tr: "Çevrimiçi mağaza" }, domain: "shop.kilnlinen.example.com" },
  { id: "showroom", name: { en: "Karaköy showroom (POS)", tr: "Karaköy showroom (POS)" }, domain: "pos · 2 registers" },
  { id: "wholesale", name: { en: "Wholesale portal", tr: "Toptan satış portalı" }, domain: "trade.kilnlinen.example.com" },
];

/** Same fictional carriers as the shared order fixtures. */
export const carriers = ["Kırlangıç Kargo", "Martı Express", "Pusula Parcel", "Atlas Courier"];
