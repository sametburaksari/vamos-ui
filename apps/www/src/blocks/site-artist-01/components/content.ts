// Sample content for "Mira Sol", a fictional four-piece band from Izmir. Every human-readable
// field is `Localized` ({ en, tr }). Show dates are "YYYY-MM-DD", doors "HH:mm" local time;
// ticket prices are in the venue's own currency.
import { blockLabelsTr, pickLocale, site1LabelsTr, site2LabelsTr, type Localized } from "@vamos-ui/react/blocks";
import { createFormatter } from "@vamos-ui/react/format";

export type SiteLocale = "en" | "tr";
type L = Localized<string>;

export const EMAIL = "hello@mirasol.example.com";
export const PHONE = "+902160000000";

const unsplash = (id: string, w: number, h: number) => ({ src: `https://images.unsplash.com/photo-${id}?w=${w}&q=70&auto=format&fit=crop`, width: w, height: h });

export function copyFor(locale: SiteLocale) {
  const t = (value: L) => pickLocale(value, locale) ?? "";
  const intl = locale === "tr" ? "tr-TR" : "en-GB";
  const f = createFormatter(intl, { timeZone: "Europe/Istanbul" });
  const money = (n: number, currency: string) => f.currency(n, { currency, display: "narrowSymbol" }, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  /** "21:00" on the 24-hour clock in every locale. */
  const time = (hhmm: string) => f.time(hhmm, { hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
  return { locale, t, f, money, time, intl, labels: locale === "tr" ? { ...blockLabelsTr, ...site1LabelsTr, ...site2LabelsTr } : undefined };
}
export type Copy = ReturnType<typeof copyFor>;

export const photos = {
  hero: { ...unsplash("1501386761578-eac5c94b800a", 2000, 1300), alt: { en: "A packed crowd with hands up in front of the stage", tr: "Sahnenin önünde elleri havada kalabalık bir seyirci" } as L },
  stage: { ...unsplash("1516450360452-9312f5e86fc7", 1600, 1100), alt: { en: "The band on a stage washed in pink light", tr: "Pembe ışıkla yıkanan sahnede grup" } as L },
  rehearsal: { ...unsplash("1514320291840-2e0a9bf2a9ae", 1600, 1100), alt: { en: "A rehearsal room with a drum kit and a single lamp", tr: "Davul seti ve tek bir lambanın olduğu prova odası" } as L },
  guitarist: { ...unsplash("1484876065684-b683cf17d276", 1600, 1100), alt: { en: "A guitarist in silhouette against teal light", tr: "Turkuaz ışığa karşı siluet hâlinde bir gitarist" } as L },
  blue: { ...unsplash("1499364615650-ec38552f4f34", 1600, 1100), alt: { en: "The band from the back of a club under blue light", tr: "Mavi ışık altında, kulübün arkasından grup" } as L },
  hearts: { ...unsplash("1429962714451-bb934ecdc4ec", 1600, 1100), alt: { en: "Someone in the crowd making a heart with their hands", tr: "Kalabalıkta elleriyle kalp yapan biri" } as L },
};

export const merch = [
  { name: { en: "Salt Hour LP — pink vinyl", tr: "Salt Hour LP — pembe plak" } as L, price: 1200, note: { en: "Pre-order · ships 6 Feb", tr: "Ön sipariş · 6 Şubat’ta kargoda" } as L, photo: { ...unsplash("1483412033650-1015ddeb83d1", 900, 1100), alt: { en: "A row of records and headphones on a shelf", tr: "Rafta bir sıra plak ve kulaklık" } as L } },
  { name: { en: "Tour tee 2027", tr: "Turne tişörtü 2027" } as L, price: 850, note: { en: "Black, all dates on the back", tr: "Siyah, arkada tüm tarihler" } as L, photo: { ...unsplash("1503342217505-b0a15ec3261c", 900, 1100), alt: { en: "A person in a black band T-shirt against a pink wall", tr: "Pembe duvar önünde siyah grup tişörtü giymiş biri" } as L } },
  { name: { en: "Rehearsal room tee — white", tr: "Prova odası tişörtü — beyaz" } as L, price: 750, note: { en: "Heavy cotton, small print on the back, made in Izmir", tr: "Kalın pamuk, sırtta küçük baskı, İzmir’de üretildi" } as L, photo: { ...unsplash("1521572163474-6864f9cf17ab", 900, 1100), alt: { en: "A plain white T-shirt seen from behind", tr: "Arkadan görünen sade beyaz bir tişört" } as L } },
];

/* ------------------------------------------------------------------ */
/* Tour                                                                 */
/* ------------------------------------------------------------------ */

export type Region = "tr" | "eu" | "uk";
export type ShowStatus = "on-sale" | "few-left" | "sold-out" | "moved";

export interface Show {
  id: string;
  date: string;
  doors: string;
  city: L;
  country: L;
  venue: string;
  region: Region;
  status: ShowStatus;
  price?: { amount: number; currency: string };
  support?: string;
  /** For a moved show: the original date. */
  was?: string;
}

export const regions: { id: Region; name: L }[] = [
  { id: "tr", name: { en: "Türkiye", tr: "Türkiye" } },
  { id: "eu", name: { en: "Europe", tr: "Avrupa" } },
  { id: "uk", name: { en: "UK & Ireland", tr: "Birleşik Krallık ve İrlanda" } },
];

const TR = { en: "Türkiye", tr: "Türkiye" };
export const shows: Show[] = [
  { id: "izm", date: "2027-01-16", doors: "20:00", city: { en: "Izmir", tr: "İzmir" }, country: TR, venue: "Alsancak Depo", region: "tr", status: "sold-out", support: "Kıyı" },
  { id: "izm2", date: "2027-01-17", doors: "20:00", city: { en: "Izmir", tr: "İzmir" }, country: TR, venue: "Alsancak Depo", region: "tr", status: "few-left", price: { amount: 950, currency: "TRY" }, support: "Kıyı" },
  { id: "ank", date: "2027-01-22", doors: "20:30", city: { en: "Ankara", tr: "Ankara" }, country: TR, venue: "Tunalı Sahne", region: "tr", status: "on-sale", price: { amount: 850, currency: "TRY" } },
  { id: "esk", date: "2027-01-23", doors: "20:00", city: { en: "Eskişehir", tr: "Eskişehir" }, country: TR, venue: "Porsuk Hall", region: "tr", status: "on-sale", price: { amount: 700, currency: "TRY" } },
  { id: "ist", date: "2027-01-29", doors: "20:00", city: { en: "Istanbul", tr: "İstanbul" }, country: TR, venue: "Haliç Fabrika", region: "tr", status: "sold-out", support: "Ada Kara" },
  { id: "ist2", date: "2027-01-30", doors: "20:00", city: { en: "Istanbul", tr: "İstanbul" }, country: TR, venue: "Haliç Fabrika", region: "tr", status: "sold-out", support: "Ada Kara" },
  { id: "ber", date: "2027-02-11", doors: "19:30", city: { en: "Berlin", tr: "Berlin" }, country: { en: "Germany", tr: "Almanya" }, venue: "Kanal Saal", region: "eu", status: "few-left", price: { amount: 29, currency: "EUR" }, support: "Lotte Fern" },
  { id: "ham", date: "2027-02-12", doors: "19:30", city: { en: "Hamburg", tr: "Hamburg" }, country: { en: "Germany", tr: "Almanya" }, venue: "Hafenkeller", region: "eu", status: "on-sale", price: { amount: 27, currency: "EUR" }, support: "Lotte Fern" },
  { id: "ams", date: "2027-02-14", doors: "20:00", city: { en: "Amsterdam", tr: "Amsterdam" }, country: { en: "Netherlands", tr: "Hollanda" }, venue: "De Werf", region: "eu", status: "sold-out", support: "Lotte Fern" },
  { id: "bru", date: "2027-02-16", doors: "19:30", city: { en: "Brussels", tr: "Brüksel" }, country: { en: "Belgium", tr: "Belçika" }, venue: "La Serre", region: "eu", status: "moved", was: "2027-02-15", price: { amount: 26, currency: "EUR" }, support: "Lotte Fern" },
  { id: "par", date: "2027-02-18", doors: "19:30", city: { en: "Paris", tr: "Paris" }, country: { en: "France", tr: "Fransa" }, venue: "Le Quai 9", region: "eu", status: "on-sale", price: { amount: 30, currency: "EUR" }, support: "Lotte Fern" },
  { id: "lon", date: "2027-02-21", doors: "19:00", city: { en: "London", tr: "Londra" }, country: { en: "United Kingdom", tr: "Birleşik Krallık" }, venue: "The Arches Room", region: "uk", status: "sold-out" },
  { id: "man", date: "2027-02-22", doors: "19:00", city: { en: "Manchester", tr: "Manchester" }, country: { en: "United Kingdom", tr: "Birleşik Krallık" }, venue: "Mill Street Hall", region: "uk", status: "few-left", price: { amount: 24, currency: "GBP" } },
  { id: "gla", date: "2027-02-24", doors: "19:00", city: { en: "Glasgow", tr: "Glasgow" }, country: { en: "United Kingdom", tr: "Birleşik Krallık" }, venue: "Clydeside Ballroom", region: "uk", status: "on-sale", price: { amount: 22, currency: "GBP" } },
  { id: "dub", date: "2027-02-26", doors: "19:30", city: { en: "Dublin", tr: "Dublin" }, country: { en: "Ireland", tr: "İrlanda" }, venue: "Liffey Works", region: "uk", status: "on-sale", price: { amount: 28, currency: "EUR" } },
  { id: "ath", date: "2027-03-12", doors: "21:00", city: { en: "Athens", tr: "Atina" }, country: { en: "Greece", tr: "Yunanistan" }, venue: "Gazi Stage", region: "eu", status: "on-sale", price: { amount: 25, currency: "EUR" } },
  { id: "ant", date: "2027-03-20", doors: "20:30", city: { en: "Antalya", tr: "Antalya" }, country: TR, venue: "Kaleiçi Açıkhava", region: "tr", status: "on-sale", price: { amount: 750, currency: "TRY" } },
  { id: "bod", date: "2027-03-21", doors: "20:30", city: { en: "Bodrum", tr: "Bodrum" }, country: TR, venue: "Liman Sahne", region: "tr", status: "few-left", price: { amount: 900, currency: "TRY" } },
];

/* ------------------------------------------------------------------ */
/* Releases                                                             */
/* ------------------------------------------------------------------ */

export type ReleaseKind = "album" | "ep" | "single";
export interface Release {
  id: string;
  title: string;
  kind: ReleaseKind;
  date: string;
  /** Cover art direction: which token pattern to draw. */
  cover: "sun" | "stripes" | "grid" | "wave" | "dot";
  label: string;
  note: L;
  tracks: { title: string; length: string }[];
  upcoming?: boolean;
}

export const releases: Release[] = [
  {
    id: "salt-hour", title: "Salt Hour", kind: "album", date: "2027-02-05", cover: "sun", label: "Low Tide Records", upcoming: true,
    note: { en: "The second album. Recorded in eleven days in a disused tobacco warehouse in Torbalı, mostly live, mostly at night.", tr: "İkinci albüm. Torbalı’da kullanılmayan bir tütün deposunda on bir günde kaydedildi; çoğu canlı, çoğu gece." },
    tracks: [{ title: "Salt Hour", length: "4:12" }, { title: "Kordon", length: "3:38" }, { title: "Heat Map", length: "3:55" }, { title: "Ferry to Nowhere", length: "5:20" }, { title: "Lodos", length: "3:02" }, { title: "Small Hours", length: "4:41" }, { title: "Glass Bay", length: "3:47" }, { title: "Last Simit", length: "2:58" }, { title: "Open Water", length: "6:14" }],
  },
  {
    id: "lodos", title: "Lodos", kind: "single", date: "2026-10-09", cover: "wave", label: "Low Tide Records",
    note: { en: "The first single from Salt Hour, about the south wind that makes everyone in Izmir slightly unreasonable.", tr: "Salt Hour’un ilk teklisi; İzmir’de herkesi biraz mantıksız yapan güney rüzgârı üzerine." },
    tracks: [{ title: "Lodos", length: "3:02" }, { title: "Lodos (rehearsal take)", length: "3:30" }],
  },
  {
    id: "afterglow", title: "Afterglow Rooms", kind: "album", date: "2024-04-19", cover: "stripes", label: "Low Tide Records",
    note: { en: "The debut. Ten songs written in a flat above a bakery in Alsancak.", tr: "İlk albüm. Alsancak’ta bir fırının üstündeki dairede yazılmış on şarkı." },
    tracks: [{ title: "Afterglow", length: "3:48" }, { title: "Pink Noise", length: "3:21" }, { title: "Neighbours", length: "4:05" }, { title: "Tram Lines", length: "3:33" }, { title: "Fever Coast", length: "4:27" }, { title: "Weekday Saint", length: "3:10" }, { title: "Sugar Water", length: "3:52" }, { title: "Static Bloom", length: "4:18" }, { title: "Bakery Light", length: "2:46" }, { title: "Goodnight, Karşıyaka", length: "5:02" }],
  },
  {
    id: "tidal", title: "Tidal Debt", kind: "ep", date: "2023-03-10", cover: "grid", label: "self-released",
    note: { en: "Four songs, one microphone, a rehearsal room shared with a wedding band.", tr: "Dört şarkı, tek mikrofon, bir düğün orkestrasıyla paylaşılan prova odası." },
    tracks: [{ title: "Tidal Debt", length: "3:40" }, { title: "Concrete Beach", length: "3:15" }, { title: "Heron", length: "4:02" }, { title: "Back Seat", length: "3:27" }],
  },
  {
    id: "first", title: "Bus 202", kind: "single", date: "2022-09-02", cover: "dot", label: "self-released",
    note: { en: "The first song anyone heard. Named after the airport bus.", tr: "Herkesin duyduğu ilk şarkı. Adını havalimanı otobüsünden alıyor." },
    tracks: [{ title: "Bus 202", length: "3:19" }],
  },
];

export const videos: { id: string; title: L; meta: L; url: string; photo: keyof typeof photos }[] = [
  { id: "lodos", title: { en: "Lodos — official video", tr: "Lodos — resmî klip" }, meta: { en: "Directed by Zeynep Arslan · 3:04", tr: "Yönetmen Zeynep Arslan · 3:04" }, url: "https://www.youtube.com/watch?v=aqz-KE-bpKQ", photo: "stage" },
  { id: "live", title: { en: "Live at Alsancak Depo (full set)", tr: "Alsancak Depo’da canlı (tam set)" }, meta: { en: "Recorded 14 June 2026 · 58:20", tr: "14 Haziran 2026 kaydı · 58:20" }, url: "https://www.youtube.com/watch?v=aqz-KE-bpKQ", photo: "blue" },
  { id: "rehearsal", title: { en: "Salt Hour — rehearsal room session", tr: "Salt Hour — prova odası seansı" }, meta: { en: "One take, one lamp · 4:30", tr: "Tek çekim, tek lamba · 4:30" }, url: "https://www.youtube.com/watch?v=aqz-KE-bpKQ", photo: "rehearsal" },
];

export const band = [
  { name: "Mira Sol", role: { en: "Vocals, guitar", tr: "Vokal, gitar" } as L },
  { name: "Kerem Ateş", role: { en: "Bass", tr: "Bas" } as L },
  { name: "Ilgın Tuna", role: { en: "Synths", tr: "Synth" } as L },
  { name: "Rafael Costa", role: { en: "Drums", tr: "Davul" } as L },
];
