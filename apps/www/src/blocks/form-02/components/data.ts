// Campaign wizard data: audience segments with sizes, city split, consent rates, senders and
// channel costs. Numbers are fictional but internally consistent, so the reach estimate is believable.
import type { L } from "../../_shared/l10n";
import { m, type Money } from "../../_shared/money";
import { TODAY } from "../../_shared/time";

export { TODAY };
export type Channel = "email" | "sms" | "push";
export type SendMode = "now" | "later" | "smart";

export interface Segment {
  id: string;
  name: L;
  rule: L;
  size: number;
  /** Share that opened or clicked anything in the last 90 days — drives the open-rate guess. */
  engaged: number;
}

export const segments: Segment[] = [
  { id: "all", name: { en: "Everyone subscribed", tr: "Tüm aboneler" }, rule: { en: "Any customer who can receive marketing", tr: "Pazarlama iletisi alabilen tüm müşteriler" }, size: 18_420, engaged: 0.31 },
  { id: "recent", name: { en: "Bought in the last 90 days", tr: "Son 90 günde alışveriş yapanlar" }, rule: { en: "1+ paid order since 20 Aug", tr: "20 Ağustos'tan beri 1+ ödenmiş sipariş" }, size: 6_214, engaged: 0.52 },
  { id: "vip", name: { en: "Regulars", tr: "Müdavimler" }, rule: { en: "5+ orders or ₺15,000+ lifetime", tr: "5+ sipariş veya toplam ₺15.000+" }, size: 842, engaged: 0.68 },
  { id: "lapsed", name: { en: "Gone quiet", tr: "Sessizleşenler" }, rule: { en: "Last order 6–18 months ago", tr: "Son siparişi 6–18 ay önce" }, size: 3_980, engaged: 0.14 },
  { id: "carts", name: { en: "Left a cart this week", tr: "Bu hafta sepet bırakanlar" }, rule: { en: "Cart over ₺500, no order in 7 days", tr: "₺500 üzeri sepet, 7 gündür sipariş yok" }, size: 1_126, engaged: 0.44 },
];

export const cities: Array<{ id: string; name: string; share: number }> = [
  { id: "ist", name: "Istanbul", share: 0.46 },
  { id: "ank", name: "Ankara", share: 0.16 },
  { id: "izm", name: "Izmir", share: 0.13 },
  { id: "bur", name: "Bursa", share: 0.07 },
  { id: "ant", name: "Antalya", share: 0.06 },
  { id: "other", name: "Elsewhere", share: 0.12 },
];

/** Share of customers with consent on each channel (İYS-style opt-in). */
export const consent: Record<Channel, number> = { email: 0.87, sms: 0.58, push: 0.34 };

export const channelInfo: Record<Channel, { label: L; hint: L; unitCost?: Money }> = {
  email: { label: { en: "Email", tr: "E-posta" }, hint: { en: "Rich layout, cheapest per person", tr: "Zengin görünüm, kişi başı en ucuz" }, unitCost: m("0.02") },
  sms: { label: { en: "SMS", tr: "SMS" }, hint: { en: "Read within minutes, billed per segment", tr: "Dakikalar içinde okunur, parça başına ücretli" }, unitCost: m("0.32") },
  push: { label: { en: "App push", tr: "Uygulama bildirimi" }, hint: { en: "Free, only people with the app", tr: "Ücretsiz, yalnızca uygulaması olanlara" } },
};

export const senders = [
  { value: "studio", label: "Kiln & Linen Studio", description: "hello@kilnlinen.example.com" },
  { value: "defne", label: "Defne from Kiln & Linen", description: "defne@kilnlinen.example.com" },
  { value: "orders", label: "Kiln & Linen Orders", description: "orders@kilnlinen.example.com" },
];

export const mergeTags = [
  { tag: "{first_name}", sample: "Elif", label: { en: "First name", tr: "Ad" } },
  { tag: "{city}", sample: "Izmir", label: { en: "City", tr: "Şehir" } },
  { tag: "{last_product}", sample: "Ash glaze mug", label: { en: "Last product", tr: "Son ürün" } },
] as const;

export const fillTags = (text: string) => mergeTags.reduce((s, m) => s.split(m.tag).join(m.sample), text);

export interface CampaignDraft {
  name: string;
  segment: string | null;
  cities: string[];
  excludeRecentBuyers: boolean;
  excludeFatigued: boolean;
  channel: Channel;
  sender: string;
  subject: string;
  preheader: string;
  body: string;
  cta: string;
  url: string;
  sms: string;
  pushTitle: string;
  mode: SendMode;
  date: string | null;
  time: string | null;
  quietHours: boolean;
  throttle: string;
}

export const initialDraft: CampaignDraft = {
  name: "Black Friday early access",
  segment: null,
  cities: cities.map((c) => c.id),
  excludeRecentBuyers: true,
  excludeFatigued: true,
  channel: "email",
  sender: "studio",
  subject: "{first_name}, the kiln opens early for you",
  preheader: "48 hours before everyone else: 25% off stoneware and linen.",
  body: "Hi {first_name},\n\nOur Black Friday pieces come out of the kiln on Thursday. As one of our regulars you get two days before everyone else — 25% off stoneware, linen and the new ash glaze collection.\n\nQuantities are small; most glazes are made in batches of 40.",
  cta: "Shop early access",
  url: "https://kilnlinen.example.com/early-access",
  sms: "Kiln & Linen: {first_name}, Black Friday starts early for you. 25% off stoneware & linen until Sunday: kl.example.com/ea",
  pushTitle: "Early access is open",
  mode: "later",
  date: "2026-11-26",
  time: "10:00",
  quietHours: true,
  throttle: "none",
};

/** SMS segments: 160 GSM-7 characters, or 70 when Turkish/other Unicode characters appear. */
export function smsSegments(text: string) {
  const unicode = /[^\x20-\x7E\n£¥èéùìòÇØøÅåÄÖÑÜ§¿äöñüà]/.test(text);
  const per = unicode ? (text.length > 70 ? 67 : 70) : text.length > 160 ? 153 : 160;
  return { unicode, per, count: Math.max(1, Math.ceil(text.length / per)), length: text.length };
}

export const throttles = [
  { value: "none", label: { en: "As fast as possible", tr: "Olabildiğince hızlı" } },
  { value: "2h", label: { en: "Spread over 2 hours", tr: "2 saate yay" } },
  { value: "6h", label: { en: "Spread over 6 hours", tr: "6 saate yay" } },
];
