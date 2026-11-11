// Sample content for "Nöbet", a fictional streetwear label from Yeldeğirmeni, Kadıköy.
// Clothes drop in numbered runs; the next one has a fixed date and a live countdown.
// Every human-readable field is `{ en, tr }`. Prices are decimal strings per currency;
// the English site sells in USD, the Turkish one in TRY (one currency per page).
import { blockLabelsTr, pickLocale, site1LabelsTr, site2LabelsTr, type Localized } from "@vamos-ui/react/blocks";
import { createFormatter } from "@vamos-ui/react/format";

export type SiteLocale = "en" | "tr";
export type Currency = "USD" | "TRY";
export type L = { en: string; tr: string };

/** Fictional contact details only. */
export const PHONE = "+902160000000";
export const EMAIL = "crew@nobet.example.com";
export const ADDRESS = "Karakolhane Cad. 00, Yeldeğirmeni, 34716 Kadıköy / İstanbul";

export const intlOf = (locale: SiteLocale) => (locale === "tr" ? "tr-TR" : "en-US");
export const currencyOf = (locale: SiteLocale): Currency => (locale === "tr" ? "TRY" : "USD");

export function copyFor(locale: SiteLocale) {
  const t = (value: Localized<string>) => pickLocale(value, locale) ?? "";
  return {
    t,
    intl: intlOf(locale),
    labels: locale === "tr" ? { ...blockLabelsTr, ...site1LabelsTr, ...site2LabelsTr } : undefined,
  };
}

/** Kit formatter, Istanbul time — every drop time on the site is TSİ / Istanbul time. */
export const formatterOf = (locale: SiteLocale) => createFormatter(intlOf(locale), { currency: currencyOf(locale), timeZone: "Europe/Istanbul" });

export function money(value: number | string, locale: SiteLocale) {
  return formatterOf(locale).currency(value, currencyOf(locale), { maximumFractionDigits: 0, minimumFractionDigits: 0 });
}

const unsplash = (id: string, w: number, h: number, focal?: { x: number; y: number }) => ({
  src: `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&q=72&auto=format&fit=crop`,
  width: w,
  height: h,
  ...(focal ? { focal } : null),
});

export type Photo = ReturnType<typeof unsplash> & { alt: L };

/* ------------------------------------------------------------------ */
/* Drops                                                              */
/* ------------------------------------------------------------------ */

export interface Drop {
  no: number;
  name: L;
  /** ISO instant the drop opens. */
  opens: string;
}

/** Drop 07 opens Saturday 21 November 2026, 20:00 Istanbul time (17:00 UTC). */
export const NEXT_DROP: Drop = { no: 7, name: { en: "Night Shift", tr: "Gece Vardiyası" }, opens: "2026-11-21T17:00:00.000Z" };
export const LIVE_DROP: Drop = { no: 6, name: { en: "Ferry Line", tr: "Vapur Hattı" }, opens: "2026-10-24T17:00:00.000Z" };

/* ------------------------------------------------------------------ */
/* Products                                                           */
/* ------------------------------------------------------------------ */

export type Category = "tops" | "outerwear" | "bottoms" | "accessories";
export const categories: { id: Category; label: L }[] = [
  { id: "tops", label: { en: "Tops", tr: "Üst" } },
  { id: "outerwear", label: { en: "Outerwear", tr: "Dış giyim" } },
  { id: "bottoms", label: { en: "Bottoms", tr: "Alt" } },
  { id: "accessories", label: { en: "Accessories", tr: "Aksesuar" } },
];

export const SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;
export type Size = (typeof SIZES)[number] | "OS";

export interface Product {
  id: string;
  /** Style code printed on the swing tag. */
  code: string;
  name: L;
  category: Category;
  drop: number;
  price: Record<Currency, string>;
  colour: L;
  /** Units left per size; `OS` = one size. */
  stock: Partial<Record<Size, number>>;
  /** Total made in the run. */
  run: number;
  photos: Photo[];
  fit: L;
  fabric: L;
  details: L[];
}

export const products: Product[] = [
  {
    id: "ferry-hoodie",
    code: "NB-06-01",
    name: { en: "Ferry Line Hoodie", tr: "Vapur Hattı Kapüşonlu" },
    category: "tops",
    drop: 6,
    price: { USD: "98", TRY: "3450" },
    colour: { en: "Heather grey", tr: "Gri melanj" },
    stock: { XS: 0, S: 3, M: 7, L: 4, XL: 2, XXL: 0 },
    run: 120,
    photos: [
      { ...unsplash("1556821840-3a63f95609a7", 900, 1125, { x: 0.5, y: 0.4 }), alt: { en: "Back of a person in a grey hooded sweatshirt, hood up, outdoors", tr: "Kapüşonu başında gri kapüşonlu sweatshirt giyen birinin sırtı, dış mekân" } },
    ],
    fit: { en: "Boxy, dropped shoulder. Size down for a regular fit.", tr: "Kutu kesim, düşük omuz. Normal kalıp için bir beden küçük alın." },
    fabric: { en: "480 g/m² brushed-back cotton fleece, made in Denizli", tr: "480 g/m² şardonlu pamuk polar, Denizli üretimi" },
    details: [
      { en: "Double-layer hood, no drawcords", tr: "Çift katlı kapüşon, ipsiz" },
      { en: "Route map of the Kadıköy–Karaköy line printed inside the hood", tr: "Kapüşon içinde Kadıköy–Karaköy hat haritası baskısı" },
    ],
  },
  {
    id: "peace-tee",
    code: "NB-06-02",
    name: { en: "Peace Hand Tee", tr: "Barış Eli Tişört" },
    category: "tops",
    drop: 6,
    price: { USD: "42", TRY: "1450" },
    colour: { en: "Washed black", tr: "Yıkanmış siyah" },
    stock: { XS: 2, S: 5, M: 0, L: 6, XL: 3, XXL: 1 },
    run: 200,
    photos: [
      { ...unsplash("1503341455253-b2e723bb3dbb", 900, 1125, { x: 0.5, y: 0.35 }), alt: { en: "Man in a black T-shirt with a white skeleton hand print against a concrete wall", tr: "Beton duvar önünde beyaz iskelet el baskılı siyah tişört giyen adam" } },
      { ...unsplash("1503342217505-b0a15ec3261c", 900, 1125, { x: 0.5, y: 0.4 }), alt: { en: "Woman wearing the same black skeleton hand T-shirt against a pink wall", tr: "Pembe duvar önünde aynı siyah iskelet el tişörtünü giyen kadın" } },
    ],
    fit: { en: "Regular fit, true to size.", tr: "Normal kalıp, bedeninizi alın." },
    fabric: { en: "240 g/m² heavyweight cotton jersey, garment washed", tr: "240 g/m² kalın pamuk süprem, parça yıkamalı" },
    details: [{ en: "Water-based screen print, front", tr: "Su bazlı serigrafi baskı, ön" }],
  },
  {
    id: "shift-jacket",
    code: "NB-06-03",
    name: { en: "Night Shift Leather Jacket", tr: "Gece Vardiyası Deri Ceket" },
    category: "outerwear",
    drop: 6,
    price: { USD: "420", TRY: "14900" },
    colour: { en: "Black", tr: "Siyah" },
    stock: { S: 1, M: 2, L: 0, XL: 1 },
    run: 24,
    photos: [
      { ...unsplash("1551028719-00167b16eac5", 900, 1125), alt: { en: "Black leather biker jacket laid flat on white sheets", tr: "Beyaz çarşaf üzerine serilmiş siyah deri motorcu ceket" } },
    ],
    fit: { en: "Cropped at the hip. Take your usual size.", tr: "Kalçada biter. Her zamanki bedeninizi alın." },
    fabric: { en: "Vegetable-tanned lamb leather, cupro lining", tr: "Bitkisel tabaklanmış kuzu derisi, kupro astar" },
    details: [
      { en: "Numbered inside pocket, 01–24", tr: "İç cepte numara, 01–24" },
      { en: "Free repairs for the life of the jacket", tr: "Ceket ömrü boyunca ücretsiz tamir" },
    ],
  },
  {
    id: "rust-bomber",
    code: "NB-06-04",
    name: { en: "Pier Bomber", tr: "İskele Bomber" },
    category: "outerwear",
    drop: 6,
    price: { USD: "190", TRY: "6800" },
    colour: { en: "Rust", tr: "Pas" },
    stock: { XS: 1, S: 4, M: 3, L: 2, XL: 0 },
    run: 60,
    photos: [
      { ...unsplash("1591047139829-d91aecb6caea", 900, 1125), alt: { en: "Rust-coloured bomber jacket on a hanger against a white wall", tr: "Beyaz duvar önünde askıda pas rengi bomber ceket" } },
    ],
    fit: { en: "Relaxed. Ribbed cuffs and hem.", tr: "Rahat kesim. Ribanalı kol ve etek." },
    fabric: { en: "Recycled nylon shell, light padding", tr: "Geri dönüştürülmüş naylon dış yüz, hafif dolgu" },
    details: [{ en: "Two-way zip, hidden phone pocket", tr: "Çift yönlü fermuar, gizli telefon cebi" }],
  },
  {
    id: "panel-cap",
    code: "NB-06-05",
    name: { en: "Five-Panel Cap", tr: "Beş Panel Şapka" },
    category: "accessories",
    drop: 6,
    price: { USD: "32", TRY: "1150" },
    colour: { en: "Chalk", tr: "Tebeşir" },
    stock: { OS: 18 },
    run: 150,
    photos: [
      { ...unsplash("1588850561407-ed78c282e89b", 900, 1125), alt: { en: "White five-panel cap on a white background", tr: "Beyaz zemin üzerinde beyaz beş panel şapka" } },
    ],
    fit: { en: "One size, adjustable strap.", tr: "Tek beden, ayarlanabilir kayış." },
    fabric: { en: "Cotton twill, unstructured", tr: "Pamuk dimi, yapısız" },
    details: [{ en: "Embroidered drop number under the brim", tr: "Siperlik altında nakış drop numarası" }],
  },
  {
    id: "commuter-pack",
    code: "NB-06-06",
    name: { en: "Commuter Pack 18L", tr: "Yolcu Sırt Çantası 18L" },
    category: "accessories",
    drop: 6,
    price: { USD: "110", TRY: "3900" },
    colour: { en: "Navy", tr: "Lacivert" },
    stock: { OS: 0 },
    run: 80,
    photos: [
      { ...unsplash("1553062407-98eeb64c6a62", 900, 1125), alt: { en: "Navy backpack standing on a pale floor", tr: "Açık renk zeminde duran lacivert sırt çantası" } },
    ],
    fit: { en: "Fits a 15-inch laptop and a ferry ticket.", tr: "15 inç dizüstü ve bir vapur bileti sığar." },
    fabric: { en: "Waxed canvas, leather base", tr: "Mumlu kanvas, deri taban" },
    details: [{ en: "Back pocket for a transit card", tr: "Ulaşım kartı için arka cep" }],
  },
  {
    id: "work-cargo",
    code: "NB-05-01",
    name: { en: "Work Denim Cargo", tr: "İş Denim Kargo" },
    category: "bottoms",
    drop: 5,
    price: { USD: "118", TRY: "4200" },
    colour: { en: "Raw indigo", tr: "Ham indigo" },
    stock: { S: 2, M: 0, L: 3, XL: 1 },
    run: 90,
    photos: [
      { ...unsplash("1624378439575-d8705ad7ae80", 900, 1125), alt: { en: "Dark indigo cargo jeans hanging against a white wall", tr: "Beyaz duvar önünde asılı koyu indigo kargo kot" } },
    ],
    fit: { en: "Wide straight leg. Waist runs small.", tr: "Geniş düz paça. Bel dar kalıp." },
    fabric: { en: "14 oz selvedge denim", tr: "14 oz kenar dokuma denim" },
    details: [{ en: "Bar-tacked cargo pockets", tr: "Punteriz dikişli kargo cepleri" }],
  },
  {
    id: "blank-crew",
    code: "NB-05-02",
    name: { en: "Blank Crewneck", tr: "Düz Bisiklet Yaka" },
    category: "tops",
    drop: 5,
    price: { USD: "74", TRY: "2650" },
    colour: { en: "Off-white", tr: "Kırık beyaz" },
    stock: { XS: 4, S: 6, M: 8, L: 5, XL: 3, XXL: 2 },
    run: 160,
    photos: [
      { ...unsplash("1620799140408-edc6dcb6d633", 900, 1125), alt: { en: "Off-white crewneck sweatshirt laid flat beside a pair of sneakers", tr: "Bir çift spor ayakkabının yanına serilmiş kırık beyaz sweatshirt" } },
    ],
    fit: { en: "Regular fit.", tr: "Normal kalıp." },
    fabric: { en: "Loopback cotton, 380 g/m²", tr: "Pamuk iki iplik, 380 g/m²" },
    details: [{ en: "No logo outside — the drop number is on the neck tape", tr: "Dışta logo yok — drop numarası ense bandında" }],
  },
  {
    id: "logo-tee",
    code: "NB-04-01",
    name: { en: "Crew Logo Tee", tr: "Ekip Logolu Tişört" },
    category: "tops",
    drop: 4,
    price: { USD: "38", TRY: "1350" },
    colour: { en: "Black", tr: "Siyah" },
    stock: { S: 0, M: 0, L: 0, XL: 0 },
    run: 300,
    photos: [
      { ...unsplash("1618354691373-d851c5c3a990", 900, 1125), alt: { en: "Black T-shirt with a small round chest logo on a wooden hanger", tr: "Ahşap askıda göğsünde küçük yuvarlak logo olan siyah tişört" } },
    ],
    fit: { en: "Regular fit.", tr: "Normal kalıp." },
    fabric: { en: "Organic cotton jersey", tr: "Organik pamuk süprem" },
    details: [{ en: "Sold out in 11 minutes", tr: "11 dakikada tükendi" }],
  },
  {
    id: "moss-tee",
    code: "NB-04-02",
    name: { en: "Garment-Dyed Tee", tr: "Parça Boyalı Tişört" },
    category: "tops",
    drop: 4,
    price: { USD: "36", TRY: "1250" },
    colour: { en: "Moss", tr: "Yosun" },
    stock: { S: 3, M: 4, L: 2, XL: 0 },
    run: 180,
    photos: [
      { ...unsplash("1523381210434-271e8be1f52b", 900, 1125), alt: { en: "Moss-green T-shirts on wooden hangers", tr: "Ahşap askılarda yosun yeşili tişörtler" } },
    ],
    fit: { en: "Slightly oversized.", tr: "Hafif bol kalıp." },
    fabric: { en: "Cotton jersey, dyed after sewing", tr: "Pamuk süprem, dikimden sonra boyalı" },
    details: [{ en: "Every piece is a slightly different shade", tr: "Her parça biraz farklı tonda" }],
  },
  {
    id: "dusk-jogger",
    code: "NB-03-01",
    name: { en: "Track Jogger", tr: "Eşofman Altı" },
    category: "bottoms",
    drop: 3,
    price: { USD: "68", TRY: "2450" },
    colour: { en: "Dusk pink", tr: "Akşam pembesi" },
    stock: { XS: 1, S: 0, M: 2, L: 1 },
    run: 100,
    photos: [
      { ...unsplash("1594633312681-425c7b97ccd1", 900, 1125), alt: { en: "Pale pink jogging trousers worn with the hem gathered at the ankle", tr: "Paçası bilekte toplanan açık pembe eşofman altı" } },
    ],
    fit: { en: "Tapered, elastic cuffs.", tr: "Daralan paça, lastikli bilek." },
    fabric: { en: "Peached cotton fleece", tr: "Şeftali tüyü pamuk polar" },
    details: [{ en: "Zip back pocket", tr: "Fermuarlı arka cep" }],
  },
  {
    id: "wash-denim-jacket",
    code: "NB-03-02",
    name: { en: "Wash Denim Jacket", tr: "Yıkamalı Kot Ceket" },
    category: "outerwear",
    drop: 3,
    price: { USD: "145", TRY: "5200" },
    colour: { en: "Bleach blue", tr: "Ağartılmış mavi" },
    stock: { S: 2, M: 1, L: 0, XL: 2 },
    run: 70,
    photos: [
      { ...unsplash("1495105787522-5334e3ffa0ef", 900, 1125, { x: 0.5, y: 0.3 }), alt: { en: "Light-blue denim jacket worn open over a white T-shirt", tr: "Beyaz tişört üzerine açık giyilmiş açık mavi kot ceket" } },
    ],
    fit: { en: "Boxy, cropped.", tr: "Kutu kesim, kısa." },
    fabric: { en: "12 oz cotton denim, bleach washed", tr: "12 oz pamuk denim, ağartma yıkamalı" },
    details: [{ en: "Enamel pin included", tr: "Emaye rozet hediye" }],
  },
];

export const productById = (id: string) => products.find((p) => p.id === id) ?? products[0]!;
export const totalStock = (p: Product) => Object.values(p.stock).reduce((n, v) => n + (v ?? 0), 0);
export const sizesOf = (p: Product) => (Object.keys(p.stock) as Size[]);

/** Pieces in the next drop: visible, priced, locked until the countdown ends. */
export interface PreviewItem {
  id: string;
  code: string;
  name: L;
  price: Record<Currency, string>;
  run: number;
  photo: Photo;
}

export const nextDropItems: PreviewItem[] = [
  { id: "signal-hoodie", code: "NB-07-01", name: { en: "Signal Hoodie", tr: "Sinyal Kapüşonlu" }, price: { USD: "104", TRY: "3650" }, run: 140, photo: { ...unsplash("1517841905240-472988babdf9", 900, 1125, { x: 0.5, y: 0.35 }), alt: { en: "Woman in a blue hooded jacket smiling against a blue wall", tr: "Mavi duvar önünde gülümseyen mavi kapüşonlu ceketli kadın" } } },
  { id: "rooftop-jacket", code: "NB-07-02", name: { en: "Rooftop Moto Jacket", tr: "Çatı Moto Ceket" }, price: { USD: "440", TRY: "15600" }, run: 20, photo: { ...unsplash("1520975954732-35dd22299614", 900, 1125, { x: 0.5, y: 0.35 }), alt: { en: "Man in sunglasses and a black leather jacket crouching on a rooftop ledge", tr: "Bir çatı kenarında çömelmiş güneş gözlüklü, siyah deri ceketli adam" } } },
  { id: "hi-vis-set", code: "NB-07-03", name: { en: "Hi-Vis Track Set", tr: "Yüksek Görünürlük Eşofman Takımı" }, price: { USD: "160", TRY: "5700" }, run: 50, photo: { ...unsplash("1515886657613-9f3515b0c78f", 900, 1125, { x: 0.5, y: 0.4 }), alt: { en: "Woman in a bright yellow tracksuit on an empty sports court", tr: "Boş bir spor sahasında parlak sarı eşofman takımlı kadın" } } },
  { id: "late-knit", code: "NB-07-04", name: { en: "Last Ferry Knit", tr: "Son Vapur Triko" }, price: { USD: "128", TRY: "4500" }, run: 60, photo: { ...unsplash("1516826957135-700dedea698c", 900, 1125, { x: 0.5, y: 0.4 }), alt: { en: "Man in a pale pink sweater and jeans leaning on a dumpster", tr: "Açık pembe kazak ve kot giymiş, bir konteynere yaslanan adam" } } },
];

/** Drop 06 campaign, shot on the Kadıköy pier. */
export const lookbook: (Photo & { caption: L })[] = [
  { ...unsplash("1503342217505-b0a15ec3261c", 800, 1000, { x: 0.5, y: 0.4 }), alt: { en: "Woman in a black skeleton hand T-shirt against a pink wall", tr: "Pembe duvar önünde siyah iskelet el tişörtlü kadın" }, caption: { en: "Peace Hand Tee, washed black", tr: "Barış Eli Tişört, yıkanmış siyah" } },
  { ...unsplash("1578587018452-892bacefd3f2", 800, 1000, { x: 0.5, y: 0.35 }), alt: { en: "Woman in an orange sweater pulling at its sleeve", tr: "Kolunu çeken turuncu kazaklı kadın" }, caption: { en: "Stylist’s own knit, Pier Bomber off-frame", tr: "Stilistin kendi kazağı, İskele Bomber kadraj dışında" } },
  { ...unsplash("1622445275463-afa2ab738c34", 800, 1000, { x: 0.5, y: 0.3 }), alt: { en: "Young man in a plain white T-shirt standing in a park", tr: "Parkta duran düz beyaz tişörtlü genç adam" }, caption: { en: "Blank tee under everything", tr: "Her şeyin altında düz tişört" } },
  { ...unsplash("1529139574466-a303027c1d8b", 800, 1000, { x: 0.5, y: 0.35 }), alt: { en: "Woman in sunglasses and a red top against a teal backdrop", tr: "Turkuaz fon önünde güneş gözlüklü, kırmızı üstlü kadın" }, caption: { en: "Colour test for Drop 07", tr: "Drop 07 için renk denemesi" } },
];

/** Measurements in cm, laid flat. */
export const sizeChart: { size: (typeof SIZES)[number]; chest: number; length: number; sleeve: number }[] = [
  { size: "XS", chest: 54, length: 66, sleeve: 58 },
  { size: "S", chest: 57, length: 68, sleeve: 59 },
  { size: "M", chest: 60, length: 70, sleeve: 60 },
  { size: "L", chest: 63, length: 72, sleeve: 61 },
  { size: "XL", chest: 66, length: 74, sleeve: 62 },
  { size: "XXL", chest: 69, length: 76, sleeve: 63 },
];

/* ------------------------------------------------------------------ */
/* Interface strings                                                  */
/* ------------------------------------------------------------------ */

export const ui = {
  cart: { en: "Bag", tr: "Çanta" },
  bagTitle: { en: "Your bag", tr: "Çantanız" },
  bagEmpty: { en: "Nothing in the bag yet. Drop 06 is still live.", tr: "Çantanız boş. Drop 06 hâlâ açık." },
  added: { en: "Added to bag", tr: "Çantaya eklendi" },
  addToBag: { en: "Add to bag", tr: "Çantaya ekle" },
  pickSize: { en: "Pick a size", tr: "Beden seçin" },
  sizeOf: { en: "Size for {name}", tr: "{name} için beden" },
  quickAdd: { en: "Add {name}, size {size}", tr: "{name}, {size} beden ekle" },
  soldOut: { en: "Sold out", tr: "Tükendi" },
  left: { en: "{n} left", tr: "{n} adet kaldı" },
  ofRun: { en: "{left} of {run} left", tr: "{run} adetten {left} kaldı" },
  remove: { en: "Remove", tr: "Kaldır" },
  removeItem: { en: "Remove {name}", tr: "{name} ürününü kaldır" },
  quantityOf: { en: "Quantity of {name}", tr: "{name} adedi" },
  subtotal: { en: "Subtotal", tr: "Ara toplam" },
  shipping: { en: "Shipping", tr: "Kargo" },
  shippingNote: { en: "Calculated at checkout. Free pick-up from the shop.", tr: "Ödemede hesaplanır. Dükkândan teslim ücretsiz." },
  checkout: { en: "Check out", tr: "Ödemeye geç" },
  checkoutDone: { en: "Demo store — no order was placed.", tr: "Demo mağaza — sipariş oluşturulmadı." },
  limit: { en: "Limit one per size per customer.", tr: "Kişi başı her bedenden bir adet." },
  limitHit: { en: "One per size per customer — that size is already in your bag.", tr: "Kişi başı her bedenden bir adet — bu beden zaten çantanızda." },
  locked: { en: "Locked", tr: "Kilitli" },
  remind: { en: "Remind me", tr: "Hatırlat" },
  reminding: { en: "Reminder on", tr: "Hatırlatma açık" },
  remindOf: { en: "Remind me when {name} drops", tr: "{name} çıkınca hatırlat" },
  reminderSet: { en: "We’ll text you 10 minutes before the drop.", tr: "Drop’tan 10 dakika önce SMS göndereceğiz." },
  reminderOff: { en: "Reminder removed.", tr: "Hatırlatma kaldırıldı." },
  liveNow: { en: "Live now", tr: "Şimdi açık" },
  days: { en: "Days", tr: "Gün" },
  hours: { en: "Hrs", tr: "Saat" },
  minutes: { en: "Min", tr: "Dk" },
  seconds: { en: "Sec", tr: "Sn" },
  timer: { en: "Drop {no} opens in {d} days, {h} hours and {m} minutes", tr: "Drop {no} {d} gün, {h} saat ve {m} dakika sonra açılıyor" },
  timerLive: { en: "Drop {no} is live", tr: "Drop {no} açıldı" },
  view: { en: "View", tr: "İncele" },
  drop: { en: "Drop {no}", tr: "Drop {no}" },
  run: { en: "Run of {n}", tr: "{n} adetlik seri" },
} satisfies Record<string, L>;

export type UiKey = keyof typeof ui;

export const fill = (s: string, vars: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? `{${k}}`));
