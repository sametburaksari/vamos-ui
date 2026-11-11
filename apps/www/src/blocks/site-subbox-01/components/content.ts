// Sample content for "Brewcraft Box", a fictional specialty-coffee subscription roasted in
// Istanbul. Every human-readable field is `{ en, tr }`. Money is TRY incl. 20% VAT; dates are
// `YYYY-MM-DD`. Roasting happens on Tuesdays, boxes ship on Wednesdays.
import { blockLabelsTr, pickLocale, site1LabelsTr, site2LabelsTr } from "@vamos-ui/react/blocks";
import { createFormatter } from "@vamos-ui/react/format";

export type SiteLocale = "en" | "tr";
export type L = { en: string; tr: string };

export const PHONE = "+902160000000";
export const EMAIL = "hello@brewcraft.example.com";
/** "Today" for the sample data (a Wednesday). */
export const TODAY = "2026-11-11";
/** Grams per cup used for the "per cup" figures (a 15 g filter brew). */
export const GRAMS_PER_CUP = 15;

export function copyFor(locale: SiteLocale) {
  const t = (value: L) => pickLocale(value, locale) ?? "";
  const intl = locale === "tr" ? "tr-TR" : "en-GB";
  const f = createFormatter(intl, { currency: "TRY", timeZone: "Europe/Istanbul" });
  /** "₺460" — whole lira, narrow symbol in both languages. */
  const tl = (n: number) => f.currency(n, { currency: "TRY", display: "narrowSymbol", minimumFractionDigits: 0, maximumFractionDigits: 0 });
  /** "₺27.50" — per-cup figures keep kuruş. */
  const tl2 = (n: number) => f.currency(n, { currency: "TRY", display: "narrowSymbol", minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return { t, f, tl, tl2, intl, labels: locale === "tr" ? { ...blockLabelsTr, ...site1LabelsTr, ...site2LabelsTr } : undefined };
}
export type Copy = ReturnType<typeof copyFor>;

const unsplash = (id: string, w: number, h: number) => ({ src: `https://images.unsplash.com/photo-${id}?w=${w}&q=70&auto=format&fit=crop`, width: w, height: h });

export const photos = {
  pour: { ...unsplash("1495474472287-4d71bcdd2085", 1400, 1750), alt: { en: "Filter coffee being poured into a glass carafe", tr: "Cam karafa dökülen filtre kahve" } as L },
  beans: { ...unsplash("1447933601403-0c6688de566e", 1600, 1100), alt: { en: "Freshly roasted coffee beans cooling in a tray", tr: "Tepside soğuyan taze kavrulmuş kahve çekirdekleri" } as L },
  roaster: { ...unsplash("1442512595331-e89e73853f31", 1600, 1100), alt: { en: "A drum roaster with beans tumbling in the cooling tray", tr: "Soğutma tepsisinde dönen çekirdeklerle bir tambur kavurucu" } as L },
};

/* ------------------------------------------------------------------ */
/* Plan builder                                                         */
/* ------------------------------------------------------------------ */

export type SizeId = "single" | "double" | "kilo";
export type FreqId = "weekly" | "fortnightly" | "monthly";
export type RoastId = "light" | "medium" | "dark" | "rotating";
export type GrindId = "whole" | "filter" | "espresso" | "moka";

export const sizes: { id: SizeId; name: L; bags: number; grams: number; price: number; note: L }[] = [
  { id: "single", name: { en: "One bag", tr: "Tek paket" }, bags: 1, grams: 250, price: 460, note: { en: "One person, a cup a day", tr: "Tek kişi, günde bir fincan" } },
  { id: "double", name: { en: "Two bags", tr: "İki paket" }, bags: 2, grams: 500, price: 860, note: { en: "Two people, or two origins", tr: "İki kişi ya da iki köken" } },
  { id: "kilo", name: { en: "Four bags · 1 kg", tr: "Dört paket · 1 kg" }, bags: 4, grams: 1000, price: 1560, note: { en: "A household or a small office", tr: "Bir hane ya da küçük bir ofis" } },
];

export const frequencies: { id: FreqId; name: L; short: L; days: number; discount: number }[] = [
  { id: "weekly", name: { en: "Every week", tr: "Her hafta" }, short: { en: "Weekly", tr: "Haftalık" }, days: 7, discount: 0.12 },
  { id: "fortnightly", name: { en: "Every 2 weeks", tr: "2 haftada bir" }, short: { en: "Fortnightly", tr: "2 haftalık" }, days: 14, discount: 0.08 },
  { id: "monthly", name: { en: "Every 4 weeks", tr: "4 haftada bir" }, short: { en: "Monthly", tr: "Aylık" }, days: 28, discount: 0 },
];

export const roasts: { id: RoastId; name: L; note: L }[] = [
  { id: "light", name: { en: "Light", tr: "Açık" }, note: { en: "Bright, tea-like; for filter", tr: "Canlı, çay gibi; filtre için" } },
  { id: "medium", name: { en: "Medium", tr: "Orta" }, note: { en: "Round and sweet; for everything", tr: "Yuvarlak ve tatlı; her şey için" } },
  { id: "dark", name: { en: "Dark", tr: "Koyu" }, note: { en: "Cocoa and body; for milk drinks", tr: "Kakao ve gövde; sütlü içecekler için" } },
  { id: "rotating", name: { en: "Roaster’s pick", tr: "Kavurucunun seçimi" }, note: { en: "A different one each box", tr: "Her kutuda farklı biri" } },
];

export const grinds: { id: GrindId; name: L }[] = [
  { id: "whole", name: { en: "Whole bean", tr: "Çekirdek" } },
  { id: "filter", name: { en: "Filter / V60", tr: "Filtre / V60" } },
  { id: "espresso", name: { en: "Espresso", tr: "Espresso" } },
  { id: "moka", name: { en: "Moka pot", tr: "Moka pot" } },
];

/** Price per delivery, rounded to 10 lira. */
export function priceFor(size: SizeId, freq: FreqId) {
  const s = sizes.find((x) => x.id === size)!;
  const fr = frequencies.find((x) => x.id === freq)!;
  return Math.round((s.price * (1 - fr.discount)) / 10) * 10;
}

/** Next Wednesday strictly after `iso` (the cut-off is Monday night). */
export function nextShipDate(iso: string) {
  const d = new Date(`${iso}T12:00:00Z`);
  const add = ((3 - d.getUTCDay() + 7) % 7) || 7;
  d.setUTCDate(d.getUTCDate() + add);
  return d.toISOString().slice(0, 10);
}

export function addDays(iso: string, days: number) {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/* ------------------------------------------------------------------ */
/* This month's box and the roasters                                   */
/* ------------------------------------------------------------------ */

export const BOX_NUMBER = 37;

export const coffees: { name: string; origin: L; process: L; altitude: string; roaster: string; notes: L[]; roast: RoastId; scores: { sweet: number; acid: number; body: number } }[] = [
  {
    name: "Kochere Chelchele",
    origin: { en: "Yirgacheffe, Ethiopia", tr: "Yirgacheffe, Etiyopya" },
    process: { en: "Washed", tr: "Yıkanmış" },
    altitude: "1,950–2,100 m",
    roaster: "Kuzguncuk Roastworks",
    notes: [{ en: "jasmine", tr: "yasemin" }, { en: "bergamot", tr: "bergamot" }, { en: "white peach", tr: "beyaz şeftali" }],
    roast: "light",
    scores: { sweet: 3, acid: 5, body: 2 },
  },
  {
    name: "Finca La Esperanza",
    origin: { en: "Huila, Colombia", tr: "Huila, Kolombiya" },
    process: { en: "Honey", tr: "Bal işlem" },
    altitude: "1,700 m",
    roaster: "Tahta Kavurma",
    notes: [{ en: "panela", tr: "panela şekeri" }, { en: "red apple", tr: "kırmızı elma" }, { en: "cocoa nib", tr: "kakao parçası" }],
    roast: "medium",
    scores: { sweet: 5, acid: 3, body: 4 },
  },
];

export const roasters: { name: string; place: L; since: number; note: L }[] = [
  { name: "Kuzguncuk Roastworks", place: { en: "Üsküdar, Istanbul", tr: "Üsküdar, İstanbul" }, since: 2017, note: { en: "A 12 kg roaster in a former bakery; light roasts only.", tr: "Eski bir fırında 12 kg’lık kavurucu; yalnızca açık kavrum." } },
  { name: "Tahta Kavurma", place: { en: "Karşıyaka, Izmir", tr: "Karşıyaka, İzmir" }, since: 2015, note: { en: "Two brothers, one Probat, a long list of Colombian farms.", tr: "İki kardeş, bir Probat ve uzun bir Kolombiya çiftlikleri listesi." } },
  { name: "Ayaz Coffee Lab", place: { en: "Çankaya, Ankara", tr: "Çankaya, Ankara" }, since: 2019, note: { en: "Espresso blends developed with cafés across the city.", tr: "Şehirdeki kafelerle geliştirilmiş espresso harmanları." } },
  { name: "Mavi Kapı Kavurucu", place: { en: "Ortahisar, Trabzon", tr: "Ortahisar, Trabzon" }, since: 2021, note: { en: "Small lots from Rwanda and Burundi, roasted to order.", tr: "Ruanda ve Burundi’den küçük partiler, siparişe göre kavrulur." } },
];

export const reviews: { quote: L; author: string; place: L }[] = [
  { quote: { en: "I switched to every two weeks after the first month. Two bags is exactly what two people and a moka pot get through.", tr: "İlk aydan sonra iki haftada bire geçtim. İki paket, iki kişi ve bir moka pot için tam yetiyor." }, author: "Leyla T.", place: { en: "Kadıköy", tr: "Kadıköy" } },
  { quote: { en: "The tasting card is the best part. I finally know why I like Ethiopian coffees and not the others.", tr: "En sevdiğim kısım tadım kartı. Neden Etiyopya kahvelerini sevip diğerlerini sevmediğimi sonunda öğrendim." }, author: "Burak S.", place: { en: "Bornova, Izmir", tr: "Bornova, İzmir" } },
  { quote: { en: "Skipped a box in August with one click while I was away. No email chain, no phone call.", tr: "Ağustosta uzaktayken bir kutuyu tek tıkla atladım. E-posta trafiği yok, telefon yok." }, author: "Defne A.", place: { en: "Çankaya, Ankara", tr: "Çankaya, Ankara" } },
];

export const faq: { q: L; a: L }[] = [
  { q: { en: "How fresh is the coffee?", tr: "Kahve ne kadar taze?" }, a: { en: "Roasted on Tuesday, packed the same evening and shipped on Wednesday. The roast date is printed on every bag.", tr: "Salı kavrulur, aynı akşam paketlenir ve çarşamba kargoya verilir. Kavrum tarihi her paketin üzerinde yazar." } },
  { q: { en: "Can I skip or pause a box?", tr: "Bir kutuyu atlayabilir ya da duraklatabilir miyim?" }, a: { en: "Yes, until Monday 23:59 before the shipping Wednesday. Pause for up to three months.", tr: "Evet, kargo çarşambasından önceki pazartesi 23.59’a kadar. Üç aya kadar duraklatabilirsiniz." } },
  { q: { en: "Where do you deliver?", tr: "Nereye teslim ediyorsunuz?" }, a: { en: "Everywhere in Türkiye, free of charge. Istanbul, Izmir and Ankara usually arrive on Thursday; elsewhere by Friday.", tr: "Türkiye’nin her yerine ücretsiz. İstanbul, İzmir ve Ankara genellikle perşembe, diğer şehirler cuma günü ulaşır." } },
  { q: { en: "Can I cancel?", tr: "İptal edebilir miyim?" }, a: { en: "Any time from your account, no minimum term. The box already roasted still ships.", tr: "Hesabınızdan istediğiniz zaman, asgari süre yok. Kavrulmuş olan kutu yine de gönderilir." } },
  { q: { en: "What if I don’t like a coffee?", tr: "Bir kahveyi beğenmezsem?" }, a: { en: "Tell us on the card’s QR form. We adjust your profile and replace the bag once per year.", tr: "Kartın QR formundan bize yazın. Profilinizi ayarlar ve yılda bir kez paketi değiştiririz." } },
];

/* ------------------------------------------------------------------ */
/* Gift                                                                */
/* ------------------------------------------------------------------ */

export type GiftLength = "3" | "6" | "12";
export const giftLengths: { id: GiftLength; months: number; discount: number; label: L }[] = [
  { id: "3", months: 3, discount: 0, label: { en: "3 months", tr: "3 ay" } },
  { id: "6", months: 6, discount: 0.05, label: { en: "6 months", tr: "6 ay" } },
  { id: "12", months: 12, discount: 0.1, label: { en: "12 months", tr: "12 ay" } },
];

/** A gift ships one box every 4 weeks. Rounded to 10 lira. */
export function giftPrice(size: SizeId, length: GiftLength) {
  const g = giftLengths.find((x) => x.id === length)!;
  return Math.round((priceFor(size, "monthly") * g.months * (1 - g.discount)) / 10) * 10;
}
