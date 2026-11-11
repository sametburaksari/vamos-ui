// Page builder data: the Kiln & Linen home page as a list of sections, and the library of
// sections an editor can add. Copy is { en, tr } like every other fixture.
import type { L } from "../../_shared/l10n";

export type SectionType = "nav" | "hero" | "features" | "products" | "quote" | "cta" | "footer";
export type Align = "start" | "center";
export type Tone = "plain" | "inset" | "inverse";

export interface Section {
  id: string;
  type: SectionType;
  name: L;
  hidden?: boolean;
  heading: L;
  body: L;
  button?: L;
  align: Align;
  tone: Tone;
  /** Vertical padding in px. */
  space: number;
}

export const typeLabels: Record<SectionType, L> = {
  nav: { en: "Navigation", tr: "Gezinme" },
  hero: { en: "Hero", tr: "Giriş" },
  features: { en: "Feature row", tr: "Özellik satırı" },
  products: { en: "Product grid", tr: "Ürün ızgarası" },
  quote: { en: "Testimonial", tr: "Yorum" },
  cta: { en: "Call to action", tr: "Eylem çağrısı" },
  footer: { en: "Footer", tr: "Alt bilgi" },
};

export const initialSections: Section[] = [
  { id: "s-nav", type: "nav", name: { en: "Header", tr: "Üst bilgi" }, heading: { en: "Kiln & Linen", tr: "Kiln & Linen" }, body: { en: "Shop · Rooms · Journal · Stores", tr: "Mağaza · Odalar · Günlük · Mağazalarımız" }, align: "start", tone: "plain", space: 20 },
  {
    id: "s-hero",
    type: "hero",
    name: { en: "Winter edit hero", tr: "Kış seçkisi girişi" },
    heading: { en: "Slow mornings, heavier linen.", tr: "Ağır keten, yavaş sabahlar." },
    body: { en: "The winter edit: stonewashed bedding, hand-thrown mugs and wool throws made to be used every day.", tr: "Kış seçkisi: taş yıkamalı nevresimler, elde şekillendirilmiş kupalar ve her gün kullanmak için yün battaniyeler." },
    button: { en: "Shop the edit", tr: "Seçkiyi keşfet" },
    align: "start",
    tone: "inset",
    space: 96,
  },
  {
    id: "s-features",
    type: "features",
    name: { en: "Why us", tr: "Neden biz" },
    heading: { en: "Made slowly, delivered fast", tr: "Yavaş üretilir, hızlı gelir" },
    body: { en: "Free delivery in Istanbul over ₺1,500 · 60-day returns · Made in small workshops", tr: "İstanbul içi ₺1.500 üzeri ücretsiz teslimat · 60 gün iade · Küçük atölyelerde üretim" },
    align: "center",
    tone: "plain",
    space: 64,
  },
  {
    id: "s-products",
    type: "products",
    name: { en: "Best sellers", tr: "Çok satanlar" },
    heading: { en: "Best sellers this week", tr: "Bu haftanın çok satanları" },
    body: { en: "Paper lantern pendant · Speckled stoneware mug · Washed linen duvet cover · Rattan wall mirror", tr: "Kâğıt fener sarkıt · Benekli taş kupa · Yıkanmış keten nevresim · Hasır duvar aynası" },
    button: { en: "See all products", tr: "Tüm ürünler" },
    align: "start",
    tone: "plain",
    space: 64,
  },
  {
    id: "s-quote",
    type: "quote",
    name: { en: "Customer quote", tr: "Müşteri yorumu" },
    heading: { en: "“The duvet got softer with every wash. Ordered a second one for the guest room.”", tr: "“Nevresim her yıkamada daha da yumuşadı. Misafir odası için ikincisini aldım.”" },
    body: { en: "Derin A., Beşiktaş", tr: "Derin A., Beşiktaş" },
    align: "center",
    tone: "inset",
    space: 80,
  },
  {
    id: "s-cta",
    type: "cta",
    name: { en: "Newsletter", tr: "Bülten" },
    heading: { en: "Letters from the workshop", tr: "Atölyeden mektuplar" },
    body: { en: "One email a month: new pieces, care guides and first access to seconds sales.", tr: "Ayda bir e-posta: yeni parçalar, bakım rehberleri ve kusurlu ürün indirimlerine erken erişim." },
    button: { en: "Subscribe", tr: "Abone ol" },
    align: "center",
    tone: "inverse",
    space: 72,
  },
  { id: "s-footer", type: "footer", name: { en: "Footer", tr: "Alt bilgi" }, heading: { en: "Kiln & Linen", tr: "Kiln & Linen" }, body: { en: "hello@example.com · +90 216 000 00 00", tr: "hello@example.com · +90 216 000 00 00" }, align: "start", tone: "plain", space: 40 },
];

/** Sections the "Add section" dialog offers. */
export const library: Array<Omit<Section, "id">> = [
  { type: "hero", name: { en: "Hero", tr: "Giriş" }, heading: { en: "A new season at home", tr: "Evde yeni bir mevsim" }, body: { en: "Short, specific promise. One sentence.", tr: "Kısa, net bir vaat. Tek cümle." }, button: { en: "Shop now", tr: "Alışverişe başla" }, align: "center", tone: "inset", space: 88 },
  { type: "features", name: { en: "Feature row", tr: "Özellik satırı" }, heading: { en: "Three reasons to stay", tr: "Kalmanız için üç neden" }, body: { en: "Free repairs · Lifetime care guide · Carbon-neutral delivery", tr: "Ücretsiz onarım · Ömür boyu bakım rehberi · Karbon nötr teslimat" }, align: "center", tone: "plain", space: 64 },
  { type: "products", name: { en: "Product grid", tr: "Ürün ızgarası" }, heading: { en: "New in", tr: "Yeni gelenler" }, body: { en: "Wool throw · Linen napkins · Stoneware bowl · Brass hook", tr: "Yün battaniye · Keten peçete · Taş kase · Pirinç askı" }, button: { en: "View all", tr: "Tümünü gör" }, align: "start", tone: "plain", space: 64 },
  { type: "quote", name: { en: "Testimonial", tr: "Yorum" }, heading: { en: "“Exactly as pictured, and it arrived the next morning.”", tr: "“Fotoğraftaki gibi, ertesi sabah geldi.”" }, body: { en: "Ilgın E., Kadıköy", tr: "Ilgın E., Kadıköy" }, align: "center", tone: "inset", space: 80 },
  { type: "cta", name: { en: "Call to action", tr: "Eylem çağrısı" }, heading: { en: "Visit a store", tr: "Mağazaya uğrayın" }, body: { en: "Five stores in Istanbul, open every day until 21:00.", tr: "İstanbul'da beş mağaza, her gün 21:00'e kadar açık." }, button: { en: "Find a store", tr: "Mağaza bul" }, align: "center", tone: "inverse", space: 72 },
];

export const libraryHints: Record<SectionType, L> = {
  nav: { en: "", tr: "" },
  footer: { en: "", tr: "" },
  hero: { en: "Big headline, one action", tr: "Büyük başlık, tek eylem" },
  features: { en: "Three short selling points", tr: "Üç kısa satış noktası" },
  products: { en: "Four products from a collection", tr: "Bir koleksiyondan dört ürün" },
  quote: { en: "One customer, one sentence", tr: "Bir müşteri, bir cümle" },
  cta: { en: "Full-width band with a button", tr: "Butonlu tam genişlik bant" },
};
