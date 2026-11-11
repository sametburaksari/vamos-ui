// Sample content for "Petal & Stem", a fictional florist in Kuzguncuk, Istanbul. Every
// human-readable field is `Localized` ({ en, tr }) and resolved with `pickLocale`. Prices are
// whole Turkish lira; times are "HH:mm" in Europe/Istanbul on the 24-hour clock.
import { blockLabelsTr, pickLocale, site1LabelsTr, site2LabelsTr, type Branch, type Localized, type OpeningHours } from "@vamos-ui/react/blocks";
import { createFormatter } from "@vamos-ui/react/format";

export type SiteLocale = "en" | "tr";
export type L = Localized<string>;

/** Fictional contact details only. */
export const PHONE = "+902160000000";
export const EMAIL = "studio@petalandstem.example.com";
export const ISSUE = { no: 46, week: "2026-11-09" };

const unsplash = (id: string, w: number, h: number) => ({ src: `https://images.unsplash.com/photo-${id}?w=${w}&q=70&auto=format&fit=crop`, width: w, height: h });

export const intlOf = (locale: SiteLocale) => (locale === "tr" ? "tr-TR" : "en-GB");
export const pick = (v: L, locale: SiteLocale) => pickLocale(v, locale) ?? "";
/** "₺1.450" / "1.450 ₺" per locale, whole lira. */
export const liraOf = (locale: SiteLocale) => {
  const f = createFormatter(intlOf(locale), { currency: "TRY", timeZone: "Europe/Istanbul" });
  return (n: number) => f.currency(n, "TRY", { minimumFractionDigits: 0, maximumFractionDigits: 0, currencyDisplay: "narrowSymbol" });
};

export function copyFor(locale: SiteLocale) {
  const t = (value: L) => pick(value, locale);
  const intl = intlOf(locale);
  const date = (iso: string, o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(intl, { ...o, timeZone: "UTC" }).format(new Date(`${iso}T12:00:00Z`));
  const img = <I extends { alt: L }>(image: I) => ({ ...image, alt: t(image.alt) });
  return { t, date, img, intl, locale, lira: liraOf(locale), labels: locale === "tr" ? { ...blockLabelsTr, ...site1LabelsTr, ...site2LabelsTr } : undefined };
}
export type Copy = ReturnType<typeof copyFor>;

export const photos = {
  shop: { ...unsplash("1487070183336-b863922373d4", 1600, 1100), alt: { en: "Buckets of fresh flowers on tiered shelves outside the shop", tr: "Dükkânın önünde kademeli raflarda kovalar dolusu taze çiçek" } as L },
};

/* ------------------------------------------------------------------ */
/* Bouquets                                                             */
/* ------------------------------------------------------------------ */

export type Size = "s" | "m" | "l";
export type Tag = "edit" | "lasting" | "under1500";
export interface Bouquet {
  id: string;
  name: L;
  line: L;
  stems: L;
  prices: Record<Size, number>;
  /** In this week's edit. */
  edit?: boolean;
  /** Dried or long-lasting (two weeks and more). */
  lasting?: boolean;
  photo: { src: string; width: number; height: number; alt: L };
}

export const SIZE_STEMS: Record<Size, L> = {
  s: { en: "Small · about 9 stems", tr: "Küçük · yaklaşık 9 dal" },
  m: { en: "Medium · about 15 stems", tr: "Orta · yaklaşık 15 dal" },
  l: { en: "Large · about 25 stems", tr: "Büyük · yaklaşık 25 dal" },
};
export const SIZE_NAME: Record<Size, L> = { s: { en: "Small", tr: "Küçük" }, m: { en: "Medium", tr: "Orta" }, l: { en: "Large", tr: "Büyük" } };

export const bouquets: Bouquet[] = [
  {
    id: "apricot",
    edit: true,
    name: { en: "The Apricot", tr: "Kayısı" },
    line: { en: "Soft peach and cream, loose and a little wild.", tr: "Yumuşak şeftali ve krem; dağınık ve biraz vahşi." },
    stems: { en: "Ranunculus · lisianthus · spray carnation · silver-dollar eucalyptus", tr: "Düğün çiçeği · lisianthus · dal karanfil · gümüş dolar okaliptüs" },
    prices: { s: 1450, m: 2150, l: 2950 },
    photo: { ...unsplash("1563241527-3004b7be0ffd", 1000, 1250), alt: { en: "A loose peach and cream bouquet in a glass jar on a wooden table", tr: "Ahşap masada cam kavanozda dağınık şeftali ve krem rengi buket" } },
  },
  {
    id: "blue-hour",
    edit: true,
    name: { en: "Blue Hour", tr: "Mavi Saat" },
    line: { en: "Last of the autumn hydrangeas, heavy and inky.", tr: "Sonbaharın son ortancaları; dolgun ve mürekkep mavisi." },
    stems: { en: "Hydrangea · scabiosa pods · olive branch", tr: "Ortanca · uyuz otu tohumu · zeytin dalı" },
    prices: { s: 1350, m: 1990, l: 2750 },
    photo: { ...unsplash("1471696035578-3d8c78d99684", 1000, 1250), alt: { en: "Dense heads of deep blue hydrangea filling the frame", tr: "Kadrajı dolduran koyu mavi ortanca başları" } },
  },
  {
    id: "cafe-au-lait",
    edit: true,
    name: { en: "Café au Lait", tr: "Sütlü Kahve" },
    line: { en: "Dinner-plate dahlias from a grower in Bursa, while they last.", tr: "Bursa’daki bir üreticiden tabak dalya, bitene kadar." },
    stems: { en: "Dahlia · cosmos · grasses · rust beech leaves", tr: "Dalya · kozmos · çimen · pas rengi kayın yaprağı" },
    prices: { s: 1590, m: 2390, l: 3290 },
    photo: { ...unsplash("1507290439931-a861b5a38200", 1000, 1250), alt: { en: "A single pink dahlia in full bloom against a dark background", tr: "Koyu zeminde tam açmış tek bir pembe dalya" } },
  },
  {
    id: "tulips",
    name: { en: "Kuzguncuk Tulips", tr: "Kuzguncuk Lalesi" },
    line: { en: "Twenty pink tulips, nothing else. They keep growing in the vase.", tr: "Yirmi pembe lale, başka hiçbir şey. Vazoda uzamaya devam ederler." },
    stems: { en: "Tulips, 20 or 40 stems", tr: "Lale, 20 ya da 40 dal" },
    prices: { s: 1190, m: 1690, l: 2890 },
    photo: { ...unsplash("1561181286-d3fee7d55364", 1000, 1250), alt: { en: "Pink tulips in a clear glass vase against a white wall", tr: "Beyaz duvar önünde şeffaf cam vazoda pembe laleler" } },
  },
  {
    id: "sunflower",
    name: { en: "Field Day", tr: "Tarla Günü" },
    line: { en: "Sunflowers for the office that never opens its blinds.", tr: "Perdelerini hiç açmayan ofis için ayçiçekleri." },
    stems: { en: "Sunflower · solidago · wheat", tr: "Ayçiçeği · altınbaşak · buğday" },
    prices: { s: 1250, m: 1790, l: 2490 },
    photo: { ...unsplash("1455659817273-f96807779a8a", 1000, 1250), alt: { en: "A crowd of sunflowers with dark centres", tr: "Koyu göbekli kalabalık ayçiçekleri" } },
  },
  {
    id: "posy",
    name: { en: "A Handful", tr: "Bir Avuç" },
    line: { en: "A small, bright posy that fits on a bedside table.", tr: "Komodine sığan küçük, canlı bir demet." },
    stems: { en: "Whatever is best on Monday, in oranges and yellows", tr: "Pazartesi en güzel ne varsa, turuncu ve sarı tonlarda" },
    prices: { s: 890, m: 1290, l: 1790 },
    photo: { ...unsplash("1490750967868-88aa4486c946", 1000, 1250), alt: { en: "Orange poppies and yellow wildflowers against a blue sky", tr: "Mavi gökyüzü önünde turuncu gelincikler ve sarı kır çiçekleri" } },
  },
  {
    id: "branch",
    lasting: true,
    name: { en: "Branch & Bud", tr: "Dal ve Tomurcuk" },
    line: { en: "Flowering branches that open slowly over two weeks.", tr: "İki hafta boyunca yavaşça açan çiçekli dallar." },
    stems: { en: "Forced blossom · pussy willow · two bud vases", tr: "Erken açtırılmış çiçek dalı · söğüt püskülü · iki tomurcuk vazo" },
    prices: { s: 1490, m: 2190, l: 2990 },
    photo: { ...unsplash("1490312278390-ab64016e0aa9", 1000, 1250), alt: { en: "Two milk-white bud vases with blossom branches on a wooden stand", tr: "Ahşap bir standın üzerinde çiçekli dallar olan iki süt beyazı vazo" } },
  },
  {
    id: "quiet",
    lasting: true,
    name: { en: "The Quiet One", tr: "Sessiz Olan" },
    line: { en: "A single eucalyptus sprig in a grey vase. Lasts a month.", tr: "Gri bir vazoda tek okaliptüs dalı. Bir ay dayanır." },
    stems: { en: "Eucalyptus cinerea · stoneware bud vase to keep", tr: "Okaliptüs · sizde kalacak taş tomurcuk vazo" },
    prices: { s: 790, m: 1150, l: 1590 },
    photo: { ...unsplash("1581783342308-f792dbdd27c5", 1000, 1250), alt: { en: "A fog-grey bud vase holding a eucalyptus sprig", tr: "Okaliptüs dalı taşıyan sis grisi bir tomurcuk vazo" } },
  },
];
export const bouquetById = (id: string | null | undefined) => bouquets.find((b) => b.id === id);

/* ------------------------------------------------------------------ */
/* Delivery                                                             */
/* ------------------------------------------------------------------ */

export interface District {
  id: string;
  name: string;
  side: "asia" | "europe";
  fee: number;
}
/** Asian-side districts get same-day delivery; free from 2,500 TL. */
export const FREE_FROM = 2500;
export const CUTOFF = "14:00";
export const districts: District[] = [
  { id: "uskudar", name: "Üsküdar", side: "asia", fee: 0 },
  { id: "kadikoy", name: "Kadıköy", side: "asia", fee: 150 },
  { id: "beykoz", name: "Beykoz", side: "asia", fee: 150 },
  { id: "atasehir", name: "Ataşehir", side: "asia", fee: 200 },
  { id: "besiktas", name: "Beşiktaş", side: "europe", fee: 250 },
  { id: "sisli", name: "Şişli", side: "europe", fee: 300 },
  { id: "sariyer", name: "Sarıyer", side: "europe", fee: 350 },
];

export type SlotId = "morning" | "afternoon" | "evening";
export const slots: { id: SlotId; from: string; to: string; label: L; sameDayUntil: string | null }[] = [
  { id: "morning", from: "10:00", to: "13:00", label: { en: "Morning", tr: "Sabah" }, sameDayUntil: null },
  { id: "afternoon", from: "13:00", to: "17:00", label: { en: "Afternoon", tr: "Öğleden sonra" }, sameDayUntil: "11:00" },
  { id: "evening", from: "17:00", to: "20:00", label: { en: "Evening", tr: "Akşam" }, sameDayUntil: CUTOFF },
];

export const cardStyles: { id: "plain" | "letterpress" | "none"; name: L; detail: L; price: number }[] = [
  { id: "plain", name: { en: "Plain card", tr: "Sade kart" }, detail: { en: "Recycled cotton, handwritten by us", tr: "Geri dönüştürülmüş pamuk, el yazımızla" }, price: 0 },
  { id: "letterpress", name: { en: "Letterpress card", tr: "Baskı kart" }, detail: { en: "Coral-pressed, with an envelope", tr: "Mercan baskılı, zarflı" }, price: 90 },
  { id: "none", name: { en: "No card", tr: "Kart yok" }, detail: { en: "The flowers speak for themselves", tr: "Çiçekler kendini anlatır" }, price: 0 },
];

export const cardIdeas: L[] = [
  { en: "Happy birthday — another year of you, finally.", tr: "İyi ki doğdun — bir yıl daha seninle, nihayet." },
  { en: "Thinking of you today, and every day this week.", tr: "Bugün seni düşünüyorum, bu hafta her gün de." },
  { en: "Congratulations. We always knew.", tr: "Tebrikler. Hep biliyorduk." },
  { en: "Sorry. These are better at saying it than I am.", tr: "Özür dilerim. Bunlar söylemekte benden iyi." },
];

export const shopHours: OpeningHours = {
  timeZone: "Europe/Istanbul",
  weekly: {
    mon: [{ open: "08:30", close: "19:00" }],
    tue: [{ open: "09:00", close: "19:00" }],
    wed: [{ open: "09:00", close: "19:00" }],
    thu: [{ open: "09:00", close: "19:00" }],
    fri: [{ open: "09:00", close: "20:00" }],
    sat: [{ open: "09:00", close: "18:00" }],
  },
};

const streetMap = {
  src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 900'%3E%3Cdefs%3E%3Cpattern id='b' width='80' height='70' patternUnits='userSpaceOnUse'%3E%3Crect width='80' height='70' fill='%23f7f7f4'/%3E%3Crect x='5' y='5' width='70' height='60' rx='3' fill='%23ebeae5'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='1200' height='900' fill='url(%23b)'/%3E%3Cpath d='M820 0C760 220 800 520 700 900H1200V0Z' fill='%23d8dde0' stroke='%23c6cdd0' stroke-width='3'/%3E%3Cg fill='none' stroke-linecap='round'%3E%3Cg stroke='%23d6d5ce' stroke-width='26'%3E%3Cpath d='M760 -20C700 240 740 520 640 920'/%3E%3Cpath d='M-20 420C220 400 480 450 720 420'/%3E%3C/g%3E%3Cg stroke='%23fff' stroke-width='16'%3E%3Cpath d='M760 -20C700 240 740 520 640 920'/%3E%3Cpath d='M-20 420C220 400 480 450 720 420'/%3E%3C/g%3E%3C/g%3E%3Crect x='300' y='180' width='170' height='130' rx='4' fill='%23dcdfd2'/%3E%3C/svg%3E",
  width: 1200,
  height: 900,
  alt: "",
};

export function shop(t: (v: L) => string): Branch {
  return {
    name: "Petal & Stem",
    address: { line: "İcadiye Caddesi 41", district: "Kuzguncuk", city: "Üsküdar", region: "İstanbul", postalCode: "34674", country: "TR", geo: { lat: 41.0369, lng: 29.0327 } },
    phone: PHONE,
    email: EMAIL,
    hours: shopHours,
    mapImage: streetMap,
    notes: t({ en: "Three doors up from the bakery. Monday mornings we’re back from the market by 08:30 — the best time to come.", tr: "Fırının üç kapı yukarısı. Pazartesi sabahları 08:30’da halden dönmüş oluruz — gelmek için en iyi zaman." }),
  };
}

export const faq: { q: L; a: L }[] = [
  { q: { en: "Why no red roses?", tr: "Neden kırmızı gül yok?" }, a: { en: "Most are flown in from far away and look the same in every shop. We buy what is good at the Monday market and from four growers we know by name.", tr: "Çoğu uzaklardan uçakla gelir ve her dükkânda aynı görünür. Biz pazartesi halinde iyi olanı ve adını bildiğimiz dört üreticiden alırız." } },
  { q: { en: "Will my bouquet look like the photo?", tr: "Buketim fotoğraftaki gibi mi olacak?" }, a: { en: "The colours, mood and size, yes. The exact stems change with the market; if something runs out we swap like for like and tell you.", tr: "Renkler, hava ve boyut evet. Dallar hale göre değişir; bir şey biterse benzeriyle değiştirir ve size haber veririz." } },
  { q: { en: "How late can I order for today?", tr: "Bugün için en geç ne zaman sipariş verebilirim?" }, a: { en: "Until 14:00 for an evening delivery on the Asian side, or 11:00 for the afternoon. The European side is next day.", tr: "Anadolu yakasına akşam teslimat için 14:00’e, öğleden sonra için 11:00’e kadar. Avrupa yakası ertesi gün." } },
  { q: { en: "What if nobody is home?", tr: "Evde kimse yoksa?" }, a: { en: "We call the recipient, then you. If we can’t reach anyone we leave it with a neighbour or the building manager and send you a photo.", tr: "Önce alıcıyı, sonra sizi ararız. Kimseye ulaşamazsak komşuya ya da yöneticiye bırakır, size fotoğraf göndeririz." } },
  { q: { en: "Is the wrapping plastic-free?", tr: "Ambalaj plastiksiz mi?" }, a: { en: "Yes: paper, cotton ribbon and a water pouch made from compostable film. No floral foam, ever.", tr: "Evet: kâğıt, pamuk kurdele ve kompostlanabilir filmden su kesesi. Çiçek süngeri asla." } },
];
