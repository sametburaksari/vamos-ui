// Sample content for "Open Shelf Foundation", a fictional charity that builds and stocks small
// community libraries in Istanbul neighbourhoods. Every human-readable field is `Localized`
// ({ en, tr }) and resolved with `pickLocale`. Money is Turkish lira, formatted per locale.
import { blockLabelsTr, pickLocale, site1LabelsTr, site2LabelsTr, type Localized } from "@vamos-ui/react/blocks";
import { createFormatter } from "@vamos-ui/react/format";

export type SiteLocale = "en" | "tr";
type L = Localized<string>;

/** Fictional numbers and domains only. */
export const PHONE = "+902160000000";
export const EMAIL = "hello@openshelf.example.com";
export const BRAND = "Open Shelf Foundation";

const unsplash = (id: string, w: number, h: number) => ({ src: `https://images.unsplash.com/photo-${id}?w=${w}&q=70&auto=format&fit=crop`, width: w, height: h });

export function copyFor(locale: SiteLocale) {
  const t = (value: L) => pickLocale(value, locale) ?? "";
  const intl = locale === "tr" ? "tr-TR" : "en-GB";
  const f = createFormatter(intl, { currency: "TRY", timeZone: "Europe/Istanbul" });
  /** Whole lira: "₺1,500" / "₺1.500". */
  const lira = (n: number) => f.currency(n, { currency: "TRY", display: "narrowSymbol" }, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  return {
    locale,
    t,
    f,
    lira,
    intl,
    labels: locale === "tr" ? { ...blockLabelsTr, ...site1LabelsTr, ...site2LabelsTr } : undefined,
  };
}
export type Copy = ReturnType<typeof copyFor>;

export const photos = {
  hero: { ...unsplash("1588072432836-e10032774350", 1600, 1200), alt: { en: "Children drawing and reading at a long table in a neighbourhood library room", tr: "Bir mahalle kütüphanesinde uzun bir masada resim yapan ve okuyan çocuklar" } as L },
  reader: { ...unsplash("1491841550275-ad7854e35ca6", 1600, 1000), alt: { en: "A child reading on a hillside at sunset, in silhouette", tr: "Gün batımında bir yamaçta kitap okuyan çocuğun silueti" } as L },
  shelves: { ...unsplash("1521587760476-6c12a4b040da", 1600, 1100), alt: { en: "Tall wooden shelves full of donated books", tr: "Bağış kitaplarla dolu yüksek ahşap raflar" } as L },
  open: { ...unsplash("1456513080510-7bf3a84b82f8", 1600, 1100), alt: { en: "Two open books on a reading-room table, shelves behind", tr: "Okuma salonunda bir masada açık duran iki kitap, arkada raflar" } as L },
};

/* ------------------------------------------------------------------ */
/* Campaign and impact                                                  */
/* ------------------------------------------------------------------ */

export const campaign = {
  name: { en: "Winter Reading Drive", tr: "Kış Okuma Kampanyası" } as L,
  raised: 1_284_600,
  goal: 2_000_000,
  donors: 1912,
  ends: "2027-01-31",
  /** What the goal pays for. */
  promise: { en: "40 new street shelves before the spring term, each with 120 books and a year of upkeep.", tr: "Bahar döneminden önce 40 yeni sokak rafı; her biri 120 kitap ve bir yıllık bakımıyla." } as L,
};

export const impact = [
  { value: 214, label: { en: "Street shelves open today", tr: "Bugün açık sokak rafı" } as L, source: { en: "Shelf register, 1 Nov 2026", tr: "Raf kaydı, 1 Kas 2026" } as L },
  { value: 46, label: { en: "Neighbourhoods across 11 districts", tr: "11 ilçede mahalle" } as L, source: { en: "Shelf register, 1 Nov 2026", tr: "Raf kaydı, 1 Kas 2026" } as L },
  { value: 138_400, label: { en: "Books borrowed in 2025", tr: "2025’te ödünç alınan kitap" } as L, source: { en: "Volunteer tallies, audited", tr: "Gönüllü sayımları, denetlenmiş" } as L },
  { value: 9_820, label: { en: "Children with their first library card", tr: "İlk kütüphane kartını alan çocuk" } as L, source: { en: "Card register since 2019", tr: "2019’dan beri kart kaydı" } as L },
];

/* ------------------------------------------------------------------ */
/* What a gift buys (the signature)                                     */
/* ------------------------------------------------------------------ */

export type GiftItemId = "shelf" | "box" | "hour" | "card";
export interface GiftItem {
  id: GiftItemId;
  price: number;
  /** Books on the shelf this item adds (drawn as spines). */
  books: number;
  one: L;
  many: L;
  detail: L;
  /** Catalogue-style code printed on the slip. */
  code: string;
}

/** Largest first: a gift is split greedily into these, the rest goes to the next card. */
export const giftItems: GiftItem[] = [
  { id: "shelf", price: 12_000, books: 120, code: "OSF-S", one: { en: "street shelf", tr: "sokak rafı" }, many: { en: "street shelves", tr: "sokak rafı" }, detail: { en: "Cabinet, 120 books, a keeper and a year of upkeep", tr: "Dolap, 120 kitap, bir raf sorumlusu ve bir yıllık bakım" } },
  { id: "box", price: 1_500, books: 30, code: "OSF-B", one: { en: "box of picture books", tr: "koli resimli kitap" }, many: { en: "boxes of picture books", tr: "koli resimli kitap" }, detail: { en: "30 new books in Turkish, Kurdish and Arabic", tr: "Türkçe, Kürtçe ve Arapça 30 yeni kitap" } },
  { id: "hour", price: 600, books: 0, code: "OSF-H", one: { en: "Saturday story hour", tr: "cumartesi masal saati" }, many: { en: "Saturday story hours", tr: "cumartesi masal saati" }, detail: { en: "A trained reader and snacks for 20 children", tr: "Eğitimli bir okuyucu ve 20 çocuk için atıştırmalık" } },
  { id: "card", price: 150, books: 1, code: "OSF-C", one: { en: "first library card", tr: "ilk kütüphane kartı" }, many: { en: "first library cards", tr: "ilk kütüphane kartı" }, detail: { en: "A card and a book the child keeps", tr: "Bir kart ve çocuğun saklayacağı bir kitap" } },
];

export const amounts = {
  once: [250, 600, 1_500, 5_000],
  monthly: [150, 300, 600, 1_500],
};

export interface GiftLine {
  item: GiftItem;
  count: number;
}

/** Splits an amount into what it buys, largest item first. `rest` is what is left over. */
export function splitGift(amount: number): { lines: GiftLine[]; rest: number; books: number } {
  let left = Math.max(0, Math.floor(amount));
  const lines: GiftLine[] = [];
  let books = 0;
  for (const item of giftItems) {
    const count = Math.floor(left / item.price);
    if (count > 0) {
      lines.push({ item, count });
      left -= count * item.price;
      books += count * item.books;
    }
  }
  return { lines, rest: left, books };
}

/* ------------------------------------------------------------------ */
/* Programmes and stories                                               */
/* ------------------------------------------------------------------ */

export const programmes: { code: string; name: L; text: L; fact: L; since: number }[] = [
  {
    code: "027.4 / S",
    name: { en: "Street Shelves", tr: "Sokak Rafları" },
    text: { en: "A weatherproof cabinet on a wall people already walk past — a grocer’s, a mosque courtyard, a bus stop. No card needed to borrow; a neighbour keeps it tidy and tells us what runs out.", tr: "İnsanların zaten önünden geçtiği bir duvarda — bakkal, cami avlusu, durak — hava koşullarına dayanıklı bir dolap. Ödünç almak için kart gerekmez; bir komşu rafı düzenli tutar ve neyin bittiğini bize bildirir." },
    fact: { en: "214 shelves · 46 neighbourhoods", tr: "214 raf · 46 mahalle" },
    since: 2019,
  },
  {
    code: "027.6 / H",
    name: { en: "Saturday Story Hour", tr: "Cumartesi Masal Saati" },
    text: { en: "One hour, every Saturday at 11:00, at 38 shelves. Volunteers trained by children’s librarians read aloud, then help each child choose a book to take home.", tr: "Her cumartesi 11:00’de, 38 rafta bir saat. Çocuk kütüphanecilerinden eğitim alan gönüllüler sesli okur, sonra her çocuğun eve götüreceği kitabı seçmesine yardım eder." },
    fact: { en: "1,760 sessions in 2025", tr: "2025’te 1.760 oturum" },
    since: 2020,
  },
  {
    code: "028.5 / M",
    name: { en: "Mother-Tongue Books", tr: "Ana Dilde Kitaplar" },
    text: { en: "A third of the children we meet grew up speaking Kurdish, Arabic or Persian at home. We buy and commission picture books in those languages, side by side with Turkish.", tr: "Tanıştığımız çocukların üçte biri evde Kürtçe, Arapça ya da Farsça konuşarak büyüdü. Bu dillerde resimli kitapları Türkçeleriyle yan yana satın alıyor ve yazdırıyoruz." },
    fact: { en: "4,300 titles in 4 languages", tr: "4 dilde 4.300 başlık" },
    since: 2021,
  },
  {
    code: "362.1 / W",
    name: { en: "Waiting-Room Shelves", tr: "Bekleme Salonu Rafları" },
    text: { en: "Family health centres hold a child for 40 minutes on average. We put a shelf in the waiting room and let them take the book home if the story isn’t finished.", tr: "Aile sağlığı merkezlerinde bir çocuk ortalama 40 dakika bekliyor. Bekleme salonuna bir raf koyuyoruz; hikâye bitmediyse kitabı eve götürebiliyorlar." },
    fact: { en: "19 health centres", tr: "19 sağlık merkezi" },
    since: 2023,
  },
];

export const stories: { quote: L; author: string; role: L }[] = [
  {
    quote: { en: "My son walks past the shelf on the way to school. Now he leaves ten minutes early so he can swap his book. I didn’t make him do that — the shelf did.", tr: "Oğlum okula giderken rafın önünden geçiyor. Artık kitabını değiştirebilmek için on dakika erken çıkıyor. Bunu ben yaptırmadım — raf yaptırdı." },
    author: "Hatice Demirel",
    role: { en: "Parent, Tarlabaşı shelf", tr: "Veli, Tarlabaşı rafı" },
  },
  {
    quote: { en: "I keep the shelf outside my shop. People come for the books and buy bread. Mostly they come for the books.", tr: "Raf dükkânımın önünde duruyor. İnsanlar kitap için geliyor, ekmek de alıyor. Çoğunlukla kitap için geliyorlar." },
    author: "Selim Arı",
    role: { en: "Grocer and shelf keeper, Kasımpaşa", tr: "Bakkal ve raf sorumlusu, Kasımpaşa" },
  },
];

/* ------------------------------------------------------------------ */
/* Report                                                               */
/* ------------------------------------------------------------------ */

/** Where each ₺100 of 2025 spending went. Adds up to 100. */
export const spendSplit: { key: string; share: number; label: L; note: L }[] = [
  { key: "books", share: 46, label: { en: "Books", tr: "Kitaplar" }, note: { en: "61,200 new books bought at publisher prices", tr: "Yayınevi fiyatından alınan 61.200 yeni kitap" } },
  { key: "shelves", share: 24, label: { en: "Shelves and upkeep", tr: "Raflar ve bakım" }, note: { en: "38 new cabinets, repairs to 61", tr: "38 yeni dolap, 61 dolapta onarım" } },
  { key: "people", share: 22, label: { en: "Programmes and training", tr: "Programlar ve eğitim" }, note: { en: "Story-hour readers, 3 field coordinators", tr: "Masal saati okuyucuları, 3 saha koordinatörü" } },
  { key: "running", share: 8, label: { en: "Running the foundation", tr: "Vakfın işleyişi" }, note: { en: "Office, audit, payment fees, fundraising", tr: "Ofis, denetim, ödeme komisyonları, bağış toplama" } },
];

export const ledger = {
  year: 2025,
  income: [
    { label: { en: "Individual gifts (one-off)", tr: "Bireysel bağışlar (tek seferlik)" } as L, amount: 3_412_800 },
    { label: { en: "Monthly givers (1,148 people)", tr: "Aylık bağışçılar (1.148 kişi)" } as L, amount: 2_976_400 },
    { label: { en: "Foundations and grants", tr: "Vakıflar ve hibeler" } as L, amount: 1_850_000 },
    { label: { en: "Book drives (in-kind, valued)", tr: "Kitap kampanyaları (ayni, değerlenmiş)" } as L, amount: 640_000 },
  ],
  spending: [
    { label: { en: "Books", tr: "Kitaplar" } as L, amount: 3_955_000 },
    { label: { en: "Shelves and upkeep", tr: "Raflar ve bakım" } as L, amount: 2_063_000 },
    { label: { en: "Programmes and training", tr: "Programlar ve eğitim" } as L, amount: 1_891_000 },
    { label: { en: "Running the foundation", tr: "Vakfın işleyişi" } as L, amount: 688_000 },
  ],
  /** Kept back for the first quarter of 2026 (three months of costs). */
  reserve: 282_200,
};

export const reportFiles: { name: L; meta: L; href: string }[] = [
  { name: { en: "Annual report 2025", tr: "2025 faaliyet raporu" }, meta: { en: "PDF · 36 pages · 4.2 MB", tr: "PDF · 36 sayfa · 4,2 MB" }, href: "https://openshelf.example.com/reports/2025.pdf" },
  { name: { en: "Audited accounts 2025", tr: "2025 denetlenmiş hesaplar" }, meta: { en: "PDF · 14 pages · Ilgaz & Partners, independent auditors", tr: "PDF · 14 sayfa · Ilgaz & Ortakları, bağımsız denetim" }, href: "https://openshelf.example.com/reports/2025-accounts.pdf" },
  { name: { en: "Shelf register (every shelf, every count)", tr: "Raf kaydı (her raf, her sayım)" }, meta: { en: "CSV · updated monthly", tr: "CSV · her ay güncellenir" }, href: "https://openshelf.example.com/data/shelves.csv" },
];

export const board: { name: string; role: L }[] = [
  { name: "Gülşen Tanrıkulu", role: { en: "Chair · retired children’s librarian", tr: "Başkan · emekli çocuk kütüphanecisi" } },
  { name: "Murat Esen", role: { en: "Treasurer · chartered accountant", tr: "Sayman · yeminli mali müşavir" } },
  { name: "Leyla Haddad", role: { en: "Trustee · translator", tr: "Mütevelli · çevirmen" } },
  { name: "Can Özdemir", role: { en: "Trustee · primary school teacher", tr: "Mütevelli · sınıf öğretmeni" } },
];
