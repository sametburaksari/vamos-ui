// Sample content for "Lumen Room", a fictional daylight + strobe photo studio in Kadıköy.
// Every human-readable field is `{ en, tr }`. Prices are invented; VAT 20 %.
import { blockLabelsTr, pickLocale, site1LabelsTr, site2LabelsTr, type Branch, type Localized, type OpeningHours } from "@vamos-ui/react/blocks";
import { createFormatter } from "@vamos-ui/react/format";

export type SiteLocale = "en" | "tr";
export type L = { en: string; tr: string };

/** Black and white: near-black fill in light mode; SiteShell derives a near-white fill for dark mode. */
export const ACCENT = "#141414";

export const PHONE = "+902160000000";
export const EMAIL = "book@lumenroom.example.com";

export const intlOf = (locale: SiteLocale) => (locale === "tr" ? "tr-TR" : "en-GB");

export function copyFor(locale: SiteLocale) {
  const t = (value: Localized<string>) => pickLocale(value, locale) ?? "";
  return { t, intl: intlOf(locale), labels: locale === "tr" ? { ...blockLabelsTr, ...site1LabelsTr, ...site2LabelsTr } : undefined };
}

export const tl = (value: string | number, locale: SiteLocale) => createFormatter(intlOf(locale), { currency: "TRY" }).currency(value, "TRY", { currencyDisplay: "narrowSymbol", maximumFractionDigits: 0 });
export const fill = (s: string, vars: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ""));
export const num = (n: number, locale: SiteLocale, digits = 0) => new Intl.NumberFormat(intlOf(locale), { maximumFractionDigits: digits }).format(n);

const unsplash = (id: string, w: number, h: number) => ({ src: `https://images.unsplash.com/photo-${id}?w=${w}&q=74&auto=format&fit=crop`, width: w, height: h });

export const photos = {
  studio: { ...unsplash("1471341971476-ae15ff5dd4ea", 2000, 1333), alt: { en: "The white cyclorama with softboxes and strobes set up for a shoot", tr: "Çekim için softbox ve flaşlarla kurulmuş beyaz sonsuz fon" } },
  lens: { ...unsplash("1516035069371-29a1b244cc32", 1400, 1050), alt: { en: "A camera body and two lenses on a black surface", tr: "Siyah bir yüzeyde fotoğraf makinesi gövdesi ve iki objektif" } },
  hands: { ...unsplash("1520390138845-fd2d229dd553", 1400, 1050), alt: { en: "Hands holding a camera with a large lens", tr: "Büyük objektifli bir fotoğraf makinesini tutan eller" } },
};

/** Portfolio frames: contact-sheet numbering is part of the look. */
export const work: { image: { src: string; width: number; height: number; alt: L }; caption: L; span?: "wide" | "tall" | "big" }[] = [
  { image: { ...unsplash("1534528741775-53994a69daeb", 1200, 1500), alt: { en: "Portrait of a woman against a lilac backdrop", tr: "Lila fon önünde bir kadın portresi" } }, caption: { en: "Portrait · lilac paper", tr: "Portre · lila kâğıt fon" }, span: "big" },
  { image: { ...unsplash("1488161628813-04466f872be2", 1200, 1500), alt: { en: "A man in a jacket sitting in a round window", tr: "Yuvarlak bir pencerede oturan ceketli bir adam" } }, caption: { en: "Lookbook · location day", tr: "Lookbook · mekân günü" }, span: "tall" },
  { image: { ...unsplash("1452587925148-ce544e77e70d", 1400, 1050), alt: { en: "A vintage camera with printed photographs on a wooden table", tr: "Ahşap masada baskı fotoğraflarla eski bir fotoğraf makinesi" } }, caption: { en: "Still life · props", tr: "Natürmort · aksesuar" } },
  { image: { ...unsplash("1611042553365-9b101441c135", 1200, 1500), alt: { en: "A woman in a wide-brimmed hat, hand on her cheek", tr: "Geniş kenarlı şapkalı, eli yanağında bir kadın" } }, caption: { en: "Editorial · one light", tr: "Editoryal · tek ışık" } },
  { image: { ...unsplash("1529626455594-4ff0802cfb7e", 1200, 1500), alt: { en: "Close portrait of a woman with auburn hair", tr: "Kumral saçlı bir kadının yakın portresi" } }, caption: { en: "Headshot · window light", tr: "Vesikalık · pencere ışığı" } },
  { image: { ...unsplash("1551730459-92db2a308d6a", 1400, 1050), alt: { en: "Black and white photo of a dog giving its paw to a hand", tr: "Bir ele patisini veren köpeğin siyah-beyaz fotoğrafı" } }, caption: { en: "Pets · black & white", tr: "Evcil dostlar · siyah-beyaz" }, span: "wide" },
  { image: { ...unsplash("1519741497674-611481863552", 1200, 1500), alt: { en: "A bouquet of white flowers held in low light", tr: "Loş ışıkta tutulan beyaz çiçek buketi" } }, caption: { en: "Product · florals", tr: "Ürün · çiçek" } },
];

// ---------------------------------------------------------------- the package builder

export type SessionId = "portrait" | "headshots" | "product" | "editorial";

export interface Session {
  id: SessionId;
  name: L;
  text: L;
  /** Price of the base package (hours + images included). */
  base: number;
  hours: number;
  images: number;
  extraHour: number;
  extraImage: number;
  /** Builder ranges. */
  maxHours: number;
  maxImages: number;
  /** Headshots are priced per person instead of per hour. */
  people?: { included: number; extra: number; max: number };
}

export const sessions: Session[] = [
  { id: "portrait", name: { en: "Portrait", tr: "Portre" }, text: { en: "One person or a couple. Two looks, one backdrop.", tr: "Bir kişi ya da bir çift. İki stil, bir fon." }, base: 3900, hours: 1, images: 10, extraHour: 2400, extraImage: 350, maxHours: 4, maxImages: 40 },
  { id: "headshots", name: { en: "Team headshots", tr: "Ekip vesikalıkları" }, text: { en: "Consistent light for a whole team, two retouched frames each.", tr: "Tüm ekip için tutarlı ışık; kişi başı iki rötuşlu kare." }, base: 5800, hours: 2, images: 8, extraHour: 2000, extraImage: 300, maxHours: 6, maxImages: 80, people: { included: 4, extra: 1250, max: 30 } },
  { id: "product", name: { en: "Product & still life", tr: "Ürün ve natürmort" }, text: { en: "Packshots on white plus styled frames for social and print.", tr: "Beyaz fonda ürün çekimleri ve sosyal medya ile baskı için kurgulu kareler." }, base: 6400, hours: 3, images: 15, extraHour: 2200, extraImage: 280, maxHours: 8, maxImages: 80 },
  { id: "editorial", name: { en: "Editorial & lookbook", tr: "Editoryal ve lookbook" }, text: { en: "A half-day for a collection: several looks, moving light.", tr: "Bir koleksiyon için yarım gün: birçok stil, değişen ışık." }, base: 12500, hours: 4, images: 25, extraHour: 2600, extraImage: 320, maxHours: 10, maxImages: 100 },
];
export const sessionById = (id: SessionId) => sessions.find((s) => s.id === id)!;

export type AddonId = "mua" | "stylist" | "paper" | "paint" | "raw" | "print" | "rush";
export interface Addon {
  id: AddonId;
  name: L;
  text: L;
  /** Flat price, or a share of the subtotal (`rush`). */
  price?: number;
  percent?: number;
}
export const addons: Addon[] = [
  { id: "mua", name: { en: "Hair & make-up artist", tr: "Saç ve makyaj sanatçısı" }, text: { en: "On set for the whole session, touch-ups included.", tr: "Tüm çekim boyunca sette; rötuşlar dahil." }, price: 3200 },
  { id: "stylist", name: { en: "Stylist", tr: "Stilist" }, text: { en: "Pulls and steams outfits, keeps the looks consistent.", tr: "Kıyafetleri seçer, ütüler, stilleri tutarlı tutar." }, price: 2800 },
  { id: "paper", name: { en: "Coloured paper backdrop", tr: "Renkli kâğıt fon" }, text: { en: "Choose from 24 colours; one roll per session.", tr: "24 renkten seçin; çekim başına bir rulo." }, price: 650 },
  { id: "paint", name: { en: "Cyclorama painted to colour", tr: "Sonsuz fonu renge boyama" }, text: { en: "The infinity wall painted the day before, repainted white after.", tr: "Sonsuz duvar bir gün önce boyanır, sonra yeniden beyaza döner." }, price: 4500 },
  { id: "raw", name: { en: "All RAW files", tr: "Tüm RAW dosyaları" }, text: { en: "Every frame from the day, unedited, by download link.", tr: "Günün tüm kareleri, düzenlenmemiş, indirme bağlantısıyla." }, price: 1800 },
  { id: "print", name: { en: "Fine-art print 30 × 40 cm", tr: "30 × 40 cm fine-art baskı" }, text: { en: "Your favourite frame on cotton rag paper, signed.", tr: "En sevdiğiniz kare pamuk kâğıda basılı, imzalı." }, price: 1150 },
  { id: "rush", name: { en: "48-hour delivery", tr: "48 saatte teslim" }, text: { en: "Retouched images in two working days instead of seven.", tr: "Rötuşlu kareler yedi yerine iki iş gününde." }, percent: 30 },
];

export interface Build {
  session: SessionId;
  hours: number;
  images: number;
  people: number;
  addons: AddonId[];
}

export const defaultBuild = (id: SessionId = "portrait"): Build => {
  const s = sessionById(id);
  return { session: id, hours: s.hours, images: s.images, people: s.people?.included ?? 1, addons: [] };
};

/** Preset starting points on the packages page. */
export const presets: { id: string; name: L; line: L; build: Build }[] = [
  { id: "starter", name: { en: "Starter", tr: "Başlangıç" }, line: { en: "A one-hour portrait, ten retouched frames.", tr: "Bir saatlik portre, on rötuşlu kare." }, build: defaultBuild("portrait") },
  { id: "team", name: { en: "Team day", tr: "Ekip günü" }, line: { en: "Twelve people, make-up on set, 48-hour delivery.", tr: "On iki kişi, sette makyaj, 48 saatte teslim." }, build: { session: "headshots", hours: 3, images: 24, people: 12, addons: ["mua", "rush"] } },
  { id: "campaign", name: { en: "Campaign", tr: "Kampanya" }, line: { en: "A full lookbook day with a painted wall, stylist and RAWs.", tr: "Boyalı duvar, stilist ve RAW’larla tam bir lookbook günü." }, build: { session: "editorial", hours: 8, images: 50, people: 1, addons: ["mua", "stylist", "paint", "raw"] } },
];

export const VAT = 0.2;
export const DEPOSIT = 0.3;

export interface Line {
  key: string;
  label: L;
  detail?: string;
  amount: number;
}

/** Line items, subtotal, VAT, total and deposit for a build. */
export function priceBuild(b: Build) {
  const s = sessionById(b.session);
  const lines: Line[] = [{ key: "base", label: s.name, detail: `${s.hours}h · ${s.images}`, amount: s.base }];
  const extraHours = Math.max(0, b.hours - s.hours);
  if (extraHours) lines.push({ key: "hours", label: { en: "Extra studio time", tr: "Ek stüdyo süresi" }, detail: `${extraHours}h × ${s.extraHour}`, amount: extraHours * s.extraHour });
  const extraImages = Math.max(0, b.images - s.images);
  if (extraImages) lines.push({ key: "images", label: { en: "Extra retouched images", tr: "Ek rötuşlu kare" }, detail: `${extraImages} × ${s.extraImage}`, amount: extraImages * s.extraImage });
  if (s.people) {
    const extraPeople = Math.max(0, b.people - s.people.included);
    if (extraPeople) lines.push({ key: "people", label: { en: "Extra people", tr: "Ek kişi" }, detail: `${extraPeople} × ${s.people.extra}`, amount: extraPeople * s.people.extra });
  }
  for (const a of addons) {
    if (!b.addons.includes(a.id) || a.percent) continue;
    lines.push({ key: a.id, label: a.name, amount: a.price ?? 0 });
  }
  const before = lines.reduce((sum, l) => sum + l.amount, 0);
  const rush = addons.find((a) => a.id === "rush")!;
  if (b.addons.includes("rush")) lines.push({ key: "rush", label: rush.name, detail: `+${rush.percent}%`, amount: Math.round((before * (rush.percent ?? 0)) / 100) });
  const subtotal = lines.reduce((sum, l) => sum + l.amount, 0);
  const vat = Math.round(subtotal * VAT);
  const total = subtotal + vat;
  return { lines, subtotal, vat, total, deposit: Math.round(total * DEPOSIT), delivery: b.addons.includes("rush") ? 2 : 7 };
}

// ---------------------------------------------------------------- booking

/** Deterministic demo availability: session starts, about two in three free. */
export function startsFor(day: string, hours: number): { start: string; available: boolean }[] {
  const dow = new Date(`${day}T12:00:00Z`).getUTCDay();
  const close = dow === 6 ? 17 : 20;
  const seed = Number(day.slice(8, 10)) + Number(day.slice(5, 7));
  const out: { start: string; available: boolean }[] = [];
  for (let h = 9, i = 0; h + Math.min(hours, 4) <= close; h += 1, i++) {
    out.push({ start: `${String(h).padStart(2, "0")}:00`, available: (seed * 5 + i * 7) % 3 !== 0 });
  }
  return out;
}

export const team = [
  { name: "Nil Ersoy", role: { en: "Founder, photographer", tr: "Kurucu, fotoğrafçı" }, bio: { en: "Shot fashion in Milan for nine years before opening Lumen Room in 2019 in an old printing works. Believes in one good light rather than five average ones.", tr: "2019’da eski bir matbaada Lumen Room’u açmadan önce dokuz yıl Milano’da moda çekti. Beş vasat ışık yerine tek iyi ışığa inanır." }, photo: { ...unsplash("1554080353-a576cf803bda", 1200, 1500), alt: { en: "Nil Ersoy holding a camera up to her eye at dusk", tr: "Akşamüstü fotoğraf makinesini gözüne kaldırmış Nil Ersoy" } } },
];

export const hours: OpeningHours = {
  timeZone: "Europe/Istanbul",
  weekly: {
    mon: [{ open: "09:00", close: "20:00" }],
    tue: [{ open: "09:00", close: "20:00" }],
    wed: [{ open: "09:00", close: "20:00" }],
    thu: [{ open: "09:00", close: "20:00" }],
    fri: [{ open: "09:00", close: "20:00" }],
    sat: [{ open: "09:00", close: "17:00" }],
    sun: [],
  },
};

const streetSvg =
  "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 900'><rect width='1200' height='900' fill='#f4f4f4'/>" +
  "<g fill='#e6e6e6'>" +
  Array.from({ length: 40 }, (_, i) => `<rect x='${(i % 8) * 150 + 10}' y='${Math.floor(i / 8) * 180 + 10}' width='130' height='160'/>`).join("") +
  "</g><path d='M-20 370 H1220' stroke='#ffffff' stroke-width='24'/><path d='M310 -20 L380 920' stroke='#ffffff' stroke-width='18'/></svg>";
export const streetMap = { src: `data:image/svg+xml,${encodeURIComponent(streetSvg)}`, width: 1200, height: 900, alt: "" };

export function branch(t: (v: Localized<string>) => string): Branch {
  return {
    name: "Lumen Room",
    address: { line: "Matbaa Sokak 18, Kat 3", district: "Rasimpaşa Mahallesi", city: "Kadıköy", region: "İstanbul", postalCode: "34716", country: "TR", geo: { lat: 40.9967, lng: 29.0329 } },
    phone: PHONE,
    email: EMAIL,
    hours,
    mapImage: streetMap,
    notes: t({ en: "Third floor, goods lift to the studio door for cases and rails. Loading bay on Matbaa Sokak for 20 minutes.", tr: "Üçüncü kat; çanta ve askılar için yük asansörü stüdyo kapısına kadar çıkar. Matbaa Sokak’ta 20 dakikalık yükleme cebi." }),
  };
}
