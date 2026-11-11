// Sample content for "Riverside District Office", a fictional local public office.
// Every human-readable field is { en, tr } and resolved with `pickLocale`. Streets, people,
// fees and numbers are invented; the phone number and e-mail domain are placeholders.
import { blockLabelsTr, pickLocale, site1LabelsTr, site2LabelsTr, type Branch, type OpeningHours } from "@vamos-ui/react/blocks";
import { createFormatter } from "@vamos-ui/react/format";

export type SiteLocale = "en" | "tr";
/** A string in both languages. */
export type L = { en: string; tr: string };

export const PHONE = "+902160000000";
export const EMAIL = "info@example.com";
export const BRAND: L = { en: "Riverside District Office", tr: "Riverside İlçe Ofisi" };

export function copyFor(locale: SiteLocale) {
  const t = (value: L) => pickLocale(value, locale) ?? "";
  const intl = locale === "tr" ? "tr-TR" : "en-GB";
  const f = createFormatter(intl, { currency: "TRY", timeZone: "Europe/Istanbul" });
  return {
    locale,
    t,
    f,
    intl,
    labels: locale === "tr" ? { ...blockLabelsTr, ...site1LabelsTr, ...site2LabelsTr } : undefined,
  };
}
export type Copy = ReturnType<typeof copyFor>;

/** Fees are decimal strings in TRY; `null` = free. */
const tl = (amount: string | null) => amount;

// ---------------------------------------------------------------- top tasks (home)

export interface TopTask {
  id: string;
  title: L;
  text: L;
  /** Service id on the services page. */
  service: string;
  meta: L;
}

export const topTasks: TopTask[] = [
  { id: "address", service: "address", title: { en: "Register a change of address", tr: "Adres değişikliği bildirin" }, text: { en: "Within 20 working days of moving in.", tr: "Taşındıktan sonraki 20 iş günü içinde." }, meta: { en: "Online · 10 min · free", tr: "Çevrimiçi · 10 dk · ücretsiz" } },
  { id: "parking", service: "parking", title: { en: "Apply for a residents’ parking permit", tr: "Sakin otopark izni başvurusu" }, text: { en: "One permit per household in zones A–D.", tr: "A–D bölgelerinde hane başına bir izin." }, meta: { en: "Online · 3 working days", tr: "Çevrimiçi · 3 iş günü" } },
  { id: "report", service: "report", title: { en: "Report a street problem", tr: "Sokaktaki bir sorunu bildirin" }, text: { en: "Potholes, broken lights, fly-tipping, blocked drains.", tr: "Çukur, arızalı lamba, kaçak döküm, tıkalı mazgal." }, meta: { en: "Online or phone · 24/7", tr: "Çevrimiçi ya da telefon · 7/24" } },
  { id: "tax", service: "property-tax", title: { en: "Pay property tax", tr: "Emlak vergisi ödeyin" }, text: { en: "Second instalment due 30 November 2026.", tr: "İkinci taksitin son günü 30 Kasım 2026." }, meta: { en: "Online · card or bank transfer", tr: "Çevrimiçi · kart ya da havale" } },
  { id: "bulky", service: "bulky", title: { en: "Book a bulky waste collection", tr: "Büyük atık toplama randevusu" }, text: { en: "Furniture and appliances, up to 5 items.", tr: "Mobilya ve beyaz eşya, en fazla 5 parça." }, meta: { en: "Online · free", tr: "Çevrimiçi · ücretsiz" } },
  { id: "marriage", service: "marriage", title: { en: "Book a civil marriage ceremony", tr: "Nikâh töreni randevusu" }, text: { en: "Riverside Hall or the Quay Pavilion.", tr: "Riverside Salonu ya da İskele Köşkü." }, meta: { en: "In person · from ₺1,250", tr: "Yüz yüze · 1.250 ₺’den başlayan" } },
];

// ---------------------------------------------------------------- services

export type ServiceCategory = "moving" | "property" | "family" | "streets" | "business";
export type Channel = "online" | "in-person" | "phone";

export const serviceCategories: { id: ServiceCategory; title: L }[] = [
  { id: "moving", title: { en: "Moving and residency", tr: "Taşınma ve ikamet" } },
  { id: "property", title: { en: "Housing and property", tr: "Konut ve mülk" } },
  { id: "family", title: { en: "Family and life events", tr: "Aile ve yaşam olayları" } },
  { id: "streets", title: { en: "Streets and environment", tr: "Sokaklar ve çevre" } },
  { id: "business", title: { en: "Business and licences", tr: "İşletme ve ruhsatlar" } },
];

export interface Service {
  id: string;
  category: ServiceCategory;
  title: L;
  summary: L;
  /** What to bring / have ready. */
  needs: L[];
  fee: string | null;
  feeNote?: L;
  time: L;
  channels: Channel[];
  /** Desk at the office, if in person. */
  desk?: string;
}

export const services: Service[] = [
  {
    id: "address",
    category: "moving",
    title: { en: "Change of address", tr: "Adres değişikliği" },
    summary: { en: "Tell us you have moved into the district so your records, school places and voting registration follow you.", tr: "İlçeye taşındığınızı bildirin; kayıtlarınız, okul yerleriniz ve seçmen kaydınız sizi takip etsin." },
    needs: [{ en: "ID card of every adult moving", tr: "Taşınan her yetişkinin kimlik kartı" }, { en: "Rental contract or title deed", tr: "Kira sözleşmesi ya da tapu" }, { en: "A recent utility bill for the new address", tr: "Yeni adrese ait güncel bir fatura" }],
    fee: tl(null),
    time: { en: "Same day", tr: "Aynı gün" },
    channels: ["online", "in-person"],
    desk: "A",
  },
  {
    id: "residence-doc",
    category: "moving",
    title: { en: "Certificate of residence", tr: "Yerleşim yeri belgesi" },
    summary: { en: "An official letter confirming where you live, for banks, schools and consulates.", tr: "Bankalar, okullar ve konsolosluklar için nerede oturduğunuzu doğrulayan resmî yazı." },
    needs: [{ en: "ID card", tr: "Kimlik kartı" }],
    fee: tl(null),
    time: { en: "Instant, as a signed PDF", tr: "Anında, imzalı PDF olarak" },
    channels: ["online", "in-person"],
    desk: "A",
  },
  {
    id: "parking",
    category: "moving",
    title: { en: "Residents’ parking permit", tr: "Sakin otopark izni" },
    summary: { en: "Park in your zone without the 2-hour limit. One permit per household; electric cars pay half.", tr: "Bölgenizde 2 saat sınırı olmadan park edin. Hane başına bir izin; elektrikli araçlara yüzde elli indirim." },
    needs: [{ en: "Vehicle registration in your name", tr: "Adınıza kayıtlı araç ruhsatı" }, { en: "Proof of address in zones A–D", tr: "A–D bölgelerinde adres kanıtı" }],
    fee: "480",
    feeNote: { en: "per year · ₺240 for electric cars", tr: "yıllık · elektrikli araçlar için 240 ₺" },
    time: { en: "3 working days", tr: "3 iş günü" },
    channels: ["online"],
  },
  {
    id: "property-tax",
    category: "property",
    title: { en: "Property tax", tr: "Emlak vergisi" },
    summary: { en: "Paid in two instalments: by 31 May and by 30 November. Pensioners with one home may be exempt.", tr: "İki taksitte ödenir: 31 Mayıs’a ve 30 Kasım’a kadar. Tek konutu olan emekliler muaf olabilir." },
    needs: [{ en: "Taxpayer number or ID number", tr: "Vergi kimlik ya da T.C. kimlik numarası" }],
    fee: null,
    feeNote: { en: "amount depends on the assessed value", tr: "tutar rayiç değere göre belirlenir" },
    time: { en: "Instant receipt", tr: "Anında makbuz" },
    channels: ["online", "in-person"],
    desk: "C",
  },
  {
    id: "building",
    category: "property",
    title: { en: "Building and renovation permit", tr: "Yapı ve tadilat ruhsatı" },
    summary: { en: "Needed for structural work, new openings in walls, extra floors and changes of use.", tr: "Taşıyıcı sistem işleri, duvarda yeni açıklıklar, kat ilavesi ve kullanım değişikliği için gerekir." },
    needs: [{ en: "Architect’s drawings, signed", tr: "İmzalı mimari projeler" }, { en: "Title deed", tr: "Tapu" }, { en: "Structural report for load-bearing changes", tr: "Taşıyıcı değişiklikler için statik rapor" }],
    fee: "3850",
    feeNote: { en: "base fee, plus ₺42 per m²", tr: "temel ücret, m² başına 42 ₺ eklenir" },
    time: { en: "Up to 30 days", tr: "30 güne kadar" },
    channels: ["in-person"],
    desk: "D",
  },
  {
    id: "marriage",
    category: "family",
    title: { en: "Civil marriage ceremony", tr: "Nikâh töreni" },
    summary: { en: "Ceremonies Tuesday to Saturday at Riverside Hall (80 guests) or the Quay Pavilion (40 guests).", tr: "Salıdan cumartesiye Riverside Salonu’nda (80 kişi) ya da İskele Köşkü’nde (40 kişi) tören." },
    needs: [{ en: "ID cards of both partners", tr: "Her iki tarafın kimlik kartı" }, { en: "Health report (less than 6 months old)", tr: "Sağlık raporu (6 aydan yeni)" }, { en: "Four passport photos each", tr: "Kişi başı dört vesikalık fotoğraf" }],
    fee: "1250",
    feeNote: { en: "weekdays · ₺2,400 on Saturdays", tr: "hafta içi · cumartesi 2.400 ₺" },
    time: { en: "Book 2–8 weeks ahead", tr: "2–8 hafta önceden randevu" },
    channels: ["in-person", "phone"],
    desk: "B",
  },
  {
    id: "birth",
    category: "family",
    title: { en: "Register a birth", tr: "Doğum bildirimi" },
    summary: { en: "Within 30 days of the birth. Hospitals in the district can register it for you.", tr: "Doğumdan sonraki 30 gün içinde. İlçedeki hastaneler bildirimi sizin yerinize yapabilir." },
    needs: [{ en: "Hospital birth report", tr: "Hastane doğum raporu" }, { en: "Parents’ ID cards", tr: "Ebeveynlerin kimlik kartları" }],
    fee: null,
    time: { en: "Same day", tr: "Aynı gün" },
    channels: ["in-person"],
    desk: "B",
  },
  {
    id: "care",
    category: "family",
    title: { en: "Home care visits for older residents", tr: "Yaşlı sakinler için evde bakım ziyareti" },
    summary: { en: "A social worker visits within a week to agree help with shopping, cleaning or getting to appointments.", tr: "Bir sosyal çalışmacı bir hafta içinde ziyaret eder; alışveriş, temizlik ya da randevulara ulaşım için destek planlanır." },
    needs: [{ en: "Name and address of the person who needs help", tr: "Desteğe ihtiyacı olan kişinin adı ve adresi" }],
    fee: null,
    time: { en: "First visit within 7 days", tr: "İlk ziyaret 7 gün içinde" },
    channels: ["phone", "in-person"],
  },
  {
    id: "report",
    category: "streets",
    title: { en: "Report a street problem", tr: "Sokak sorunu bildirimi" },
    summary: { en: "Potholes, broken streetlights, fly-tipping, graffiti and blocked drains. You get a reference number and updates by text.", tr: "Çukur, arızalı sokak lambası, kaçak döküm, duvar yazısı ve tıkalı mazgal. Bir takip numarası ve SMS ile güncelleme alırsınız." },
    needs: [{ en: "The location (street and nearest number)", tr: "Konum (sokak ve en yakın kapı numarası)" }, { en: "A photo, if you can", tr: "Mümkünse bir fotoğraf" }],
    fee: null,
    time: { en: "Urgent hazards within 4 hours", tr: "Acil tehlikeler 4 saat içinde" },
    channels: ["online", "phone"],
  },
  {
    id: "bulky",
    category: "streets",
    title: { en: "Bulky waste collection", tr: "Büyük atık toplama" },
    summary: { en: "We collect up to five large items from outside your building on your booked morning.", tr: "Randevu sabahınızda binanızın önünden en fazla beş büyük eşyayı alırız." },
    needs: [{ en: "A list of the items", tr: "Eşyaların listesi" }],
    fee: null,
    time: { en: "Next free slot, usually within 5 days", tr: "İlk boş gün, genellikle 5 gün içinde" },
    channels: ["online", "phone"],
  },
  {
    id: "tree",
    category: "streets",
    title: { en: "Street tree request", tr: "Sokak ağacı talebi" },
    summary: { en: "Ask for a tree outside your building. We plant between November and March.", tr: "Binanızın önüne ağaç dikilmesini isteyin. Kasım ile mart arasında dikim yaparız." },
    needs: [{ en: "Address and a photo of the pavement", tr: "Adres ve kaldırımın fotoğrafı" }],
    fee: null,
    time: { en: "Survey within 6 weeks", tr: "6 hafta içinde keşif" },
    channels: ["online"],
  },
  {
    id: "market",
    category: "business",
    title: { en: "Market stall licence", tr: "Pazar tezgâhı ruhsatı" },
    summary: { en: "For the Wednesday and Saturday markets on Iskele Square. Places are allocated by lot every January.", tr: "İskele Meydanı’ndaki çarşamba ve cumartesi pazarları için. Yerler her ocak ayında kurayla dağıtılır." },
    needs: [{ en: "Tax registration", tr: "Vergi kaydı" }, { en: "Food hygiene certificate (food stalls)", tr: "Gıda hijyen belgesi (gıda tezgâhları)" }],
    fee: "2600",
    feeNote: { en: "per year", tr: "yıllık" },
    time: { en: "Lot drawn 15 January 2027", tr: "Kura 15 Ocak 2027" },
    channels: ["in-person"],
    desk: "D",
  },
  {
    id: "terrace",
    category: "business",
    title: { en: "Pavement seating permit", tr: "Kaldırım masa izni" },
    summary: { en: "Tables and chairs on the pavement outside a shop or café, leaving at least 1.5 m free for walking.", tr: "Dükkân ya da kafe önünde kaldırıma masa ve sandalye; yürüme için en az 1,5 m boş bırakılarak." },
    needs: [{ en: "Business licence", tr: "İşyeri ruhsatı" }, { en: "A sketch with measurements", tr: "Ölçülü bir kroki" }],
    fee: "185",
    feeNote: { en: "per m² per year", tr: "m² başına yıllık" },
    time: { en: "10 working days", tr: "10 iş günü" },
    channels: ["online", "in-person"],
    desk: "D",
  },
];

// ---------------------------------------------------------------- announcements

export type NoticeKind = "works" | "meeting" | "consultation" | "closure" | "events";
export const noticeKinds: Record<NoticeKind, L> = {
  works: { en: "Roadworks", tr: "Yol çalışması" },
  meeting: { en: "Council meeting", tr: "Meclis toplantısı" },
  consultation: { en: "Consultation", tr: "Görüşe açık" },
  closure: { en: "Closure", tr: "Kapanış" },
  events: { en: "Event", tr: "Etkinlik" },
};

export interface Notice {
  id: string;
  kind: NoticeKind;
  date: string;
  title: L;
  text: L;
  /** The one with a full page. */
  page?: boolean;
}

export const notices: Notice[] = [
  { id: "water", kind: "works", date: "2026-11-09", page: true, title: { en: "Water main renewal on Iskele Caddesi, 12–14 November", tr: "İskele Caddesi’nde su hattı yenilemesi, 12–14 Kasım" }, text: { en: "Water off at numbers 1–58 and in Fener Sokak; buses 14 and 22 diverted.", tr: "1–58 numaralar ve Fener Sokak’ta su kesintisi; 14 ve 22 numaralı otobüsler güzergâh değiştiriyor." } },
  { id: "council", kind: "meeting", date: "2026-11-06", title: { en: "District council meets on 19 November at 18:00 — agenda published", tr: "İlçe meclisi 19 Kasım saat 18.00’de toplanıyor — gündem yayımlandı" }, text: { en: "Open to the public. Item 4: the 2027 budget; item 7: the Bayır Park playground.", tr: "Halka açık. 4. madde: 2027 bütçesi; 7. madde: Bayır Parkı oyun alanı." } },
  { id: "consult", kind: "consultation", date: "2026-11-02", title: { en: "Have your say: a car-free Saturday on the waterfront", tr: "Görüşünüzü bildirin: sahilde araçsız cumartesi" }, text: { en: "Survey open until 30 November. 1,184 responses so far.", tr: "Anket 30 Kasım’a kadar açık. Şimdiye kadar 1.184 yanıt." } },
  { id: "library", kind: "closure", date: "2026-10-28", title: { en: "Hilltop Library closed 23–27 November for new heating", tr: "Tepe Kütüphanesi 23–27 Kasım’da yeni ısıtma sistemi için kapalı" }, text: { en: "Returns at the Iskele branch; loans extended automatically.", tr: "İadeler İskele şubesine; ödünç süreleri otomatik uzatılır." } },
  { id: "lights", kind: "events", date: "2026-10-21", title: { en: "Lantern walk along the river, 5 December at 17:30", tr: "Nehir boyunca fener yürüyüşü, 5 Aralık saat 17.30" }, text: { en: "Free. Lantern workshops in all four community centres the week before.", tr: "Ücretsiz. Önceki hafta dört semt merkezinde fener atölyeleri." } },
];

// ---------------------------------------------------------------- the water works notice (inner page)

export const works = {
  start: "2026-11-12T09:00:00+03:00",
  end: "2026-11-14T18:00:00+03:00",
  ref: "RDO-2026-1187",
  streets: [
    { name: "Iskele Caddesi", detail: { en: "numbers 1–58, both sides", tr: "1–58 numaralar, iki taraf" } },
    { name: "Fener Sokak", detail: { en: "whole street", tr: "tüm sokak" } },
    { name: "Değirmen Çıkmazı", detail: { en: "numbers 2–12", tr: "2–12 numaralar" } },
    { name: "Kayıkhane Yolu", detail: { en: "lane closed, no water cut", tr: "şerit kapalı, su kesintisi yok" } },
  ],
  timeline: [
    { at: "2026-11-12T09:00:00+03:00", title: { en: "Water off, trench opened", tr: "Su kesilir, kazı açılır" }, text: { en: "Fill bottles and a bath the night before. Tankers at Iskele Square from 10:00.", tr: "Önceki akşam şişeleri ve küveti doldurun. Saat 10.00’dan itibaren İskele Meydanı’nda tanker." } },
    { at: "2026-11-13T08:00:00+03:00", title: { en: "Old cast-iron pipe replaced", tr: "Eski dökme demir boru değiştirilir" }, text: { en: "380 m of 1962 pipe replaced with polyethylene. Noise between 08:00 and 19:00.", tr: "1962’den kalma 380 m boru polietilenle değiştirilir. 08.00–19.00 arası gürültü." } },
    { at: "2026-11-14T14:00:00+03:00", title: { en: "Water back on, brown at first", tr: "Su geri gelir, ilk başta bulanık" }, text: { en: "Run the cold kitchen tap for 3 minutes before drinking.", tr: "İçmeden önce mutfaktaki soğuk musluğu 3 dakika akıtın." } },
    { at: "2026-11-14T18:00:00+03:00", title: { en: "Road reopened", tr: "Yol açılır" }, text: { en: "Final asphalt layer on 21 November, at night.", tr: "Son asfalt katmanı 21 Kasım’da, gece." } },
  ],
};

// ---------------------------------------------------------------- the office

export const hours: OpeningHours = {
  timeZone: "Europe/Istanbul",
  weekly: {
    mon: [{ open: "08:30", close: "17:30" }],
    tue: [{ open: "08:30", close: "17:30" }],
    wed: [{ open: "08:30", close: "19:00" }],
    thu: [{ open: "08:30", close: "17:30" }],
    fri: [{ open: "08:30", close: "17:30" }],
    sat: [{ open: "09:00", close: "13:00" }],
    sun: [],
  },
};

export function office(t: (v: L) => string): Branch {
  return {
    name: t(BRAND),
    address: { line: "Iskele Caddesi 14", district: "Riverside", city: "İstanbul", postalCode: "34000", country: "TR" },
    phone: PHONE,
    email: EMAIL,
    hours,
    notes: t({ en: "Step-free entrance on Fener Sokak, hearing loop at every desk, sign-language interpreter on Wednesdays 13:00–17:00 (book ahead).", tr: "Fener Sokak tarafında basamaksız giriş, her bankoda işitme döngüsü, çarşamba 13.00–17.00 arası işaret dili tercümanı (önceden randevu)." }),
  };
}

export const numbers = [
  { label: { en: "Requests closed in October", tr: "Ekim’de kapanan talepler" }, value: 2914 },
  { label: { en: "Median days to close", tr: "Kapanış süresi (medyan, gün)" }, value: 2.1 },
  { label: { en: "Streetlights repaired", tr: "Onarılan sokak lambası" }, value: 318 },
  { label: { en: "Calls answered within 60 s", tr: "60 sn içinde yanıtlanan çağrı" }, value: 94, unit: "%" },
];
