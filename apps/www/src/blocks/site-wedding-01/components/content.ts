// Sample content for the wedding of Ece Arslan and Daniel Whitlock (fictional couple, fictional
// estate). Every human-readable field is `Localized` ({ en, tr }) and resolved with `pickLocale`.
// Times are "HH:mm" in Europe/Istanbul, always on the 24-hour clock.
import { blockLabelsTr, pickLocale, site1LabelsTr, site2LabelsTr, type Branch, type Localized, type OpeningHours } from "@vamos-ui/react/blocks";
import { createFormatter } from "@vamos-ui/react/format";

export type SiteLocale = "en" | "tr";
export type L = Localized<string>;

/** Fictional contact details only. */
export const PHONE = "+902160000000";
export const EMAIL = "defne@eceanddaniel.example.com";
export const WEDDING_DAY = "2027-06-12";
export const RSVP_BY = "2027-04-01";
export const WEEKEND = ["2027-06-11", "2027-06-12", "2027-06-13"] as const;

const unsplash = (id: string, w: number, h: number) => ({ src: `https://images.unsplash.com/photo-${id}?w=${w}&q=70&auto=format&fit=crop`, width: w, height: h });

export function copyFor(locale: SiteLocale) {
  const t = (value: L) => pickLocale(value, locale) ?? "";
  const intl = locale === "tr" ? "tr-TR" : "en-GB";
  const f = createFormatter(intl, { currency: "TRY", timeZone: "Europe/Istanbul" });
  /** "17:00" in every locale. */
  const time = (hhmm: string) => f.time(`2027-06-12T${hhmm}:00+03:00`, { hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
  const date = (iso: string, o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(intl, { ...o, timeZone: "UTC" }).format(new Date(`${iso}T12:00:00Z`));
  const lira = (n: number) => f.currency(n, "TRY", { minimumFractionDigits: 0, maximumFractionDigits: 0, currencyDisplay: "narrowSymbol" });
  const img = <I extends { alt: L }>(image: I) => ({ ...image, alt: t(image.alt) });
  return {
    t,
    f,
    time,
    date,
    lira,
    img,
    intl,
    locale,
    labels: locale === "tr" ? { ...blockLabelsTr, ...site1LabelsTr, ...site2LabelsTr } : undefined,
  };
}
export type Copy = ReturnType<typeof copyFor>;

export const photos = {
  hills: { ...unsplash("1532712938310-34cb3982ef74", 1200, 1500), alt: { en: "Ece and Daniel walking hand in hand along a grassy ridge at dusk", tr: "Ece ve Daniel akşamüstü çimenli bir sırtta el ele yürüyor" } as L },
  table: { ...unsplash("1519225421980-715cb0215aed", 1600, 1200), alt: { en: "A long dinner table laid with white linen, glassware and small bunches of wild flowers", tr: "Beyaz örtü, kadehler ve küçük kır çiçeği demetleriyle kurulmuş uzun akşam yemeği masası" } as L },
  chairs: { ...unsplash("1522673607200-164d1b6ce486", 1400, 1400), alt: { en: "Two white chairs with flower garlands on a lawn, set for the ceremony", tr: "Tören için çimenlere konmuş, çiçek girlandlı iki beyaz sandalye" } as L },
  hands: { ...unsplash("1520854221256-17451cc331bf", 1200, 1500), alt: { en: "Two hands joined, their shadows on the grass", tr: "Birleşmiş iki el, gölgeleri çimenlerin üzerinde" } as L },
  rings: { ...unsplash("1606800052052-a08af7148866", 1200, 1200), alt: { en: "Two gold wedding bands resting on folded paper", tr: "Katlanmış kâğıdın üzerinde duran iki altın alyans" } as L },
  aisle: { ...unsplash("1469371670807-013ccf25f16a", 1600, 1100), alt: { en: "An outdoor aisle lined with flower stands leading to a white arch", tr: "Beyaz bir kemere uzanan, çiçek standlarıyla çevrili açık hava koridoru" } as L },
};

/* ------------------------------------------------------------------ */
/* Story                                                                */
/* ------------------------------------------------------------------ */

export const story: { year: string; title: L; body: L }[] = [
  {
    year: "2019",
    title: { en: "One dictionary, two hands", tr: "Bir sözlük, iki el" },
    body: {
      en: "A second-hand bookshop in Lisbon, the last Turkish–English dictionary on the shelf. Daniel was learning Turkish; Ece was buying a present. She let him have it on the condition that he used it to ask her to dinner.",
      tr: "Lizbon’da bir sahaf, raftaki son Türkçe–İngilizce sözlük. Daniel Türkçe öğreniyordu; Ece hediye arıyordu. Sözlüğü, onu yemeğe davet etmek için kullanması şartıyla ona bıraktı.",
    },
  },
  {
    year: "2021",
    title: { en: "Forty-one flights", tr: "Kırk bir uçuş" },
    body: {
      en: "Istanbul to Edinburgh and back, counted on a fridge magnet. Daniel’s Turkish got good enough to argue with taxi drivers.",
      tr: "İstanbul–Edinburgh arası gidiş dönüş, bir buzdolabı magnetinde sayıldı. Daniel’ın Türkçesi taksicilerle tartışacak kadar ilerledi.",
    },
  },
  {
    year: "2023",
    title: { en: "A flat in Kuzguncuk", tr: "Kuzguncuk’ta bir ev" },
    body: {
      en: "Two desks, one balcony, a grey cat called Simit who now runs the household.",
      tr: "İki masa, bir balkon ve artık evin patronu olan Simit adında gri bir kedi.",
    },
  },
  {
    year: "2026",
    title: { en: "Olive harvest, Urla", tr: "Zeytin hasadı, Urla" },
    body: {
      en: "Halfway up a ladder in Ece’s grandmother’s grove, with a basket in one hand and a ring in the other. She said yes before he finished the sentence — in Turkish.",
      tr: "Ece’nin babaannesinin bahçesinde, bir merdivenin ortasında; bir elde sepet, diğerinde yüzük. Ece cümle bitmeden evet dedi — Türkçe.",
    },
  },
];

/* ------------------------------------------------------------------ */
/* The weekend                                                          */
/* ------------------------------------------------------------------ */

export type EventIcon = "wine" | "bus" | "rings" | "glass" | "dinner" | "music" | "moon" | "coffee";
export interface WeekendEvent {
  day: 0 | 1 | 2;
  start: string;
  end?: string;
  title: L;
  place: L;
  note?: L;
  icon: EventIcon;
  /** Shown on the home page programme. */
  key?: boolean;
}

export const days: { label: L; theme: L }[] = [
  { label: { en: "Friday", tr: "Cuma" }, theme: { en: "Arrive slowly", tr: "Yavaşça gelin" } },
  { label: { en: "Saturday", tr: "Cumartesi" }, theme: { en: "The wedding", tr: "Düğün" } },
  { label: { en: "Sunday", tr: "Pazar" }, theme: { en: "Recover gently", tr: "Usulca toparlanın" } },
];

export const weekend: WeekendEvent[] = [
  { day: 0, start: "19:30", end: "23:00", key: true, icon: "wine", title: { en: "Welcome drinks", tr: "Hoş geldin içkisi" }, place: { en: "Değirmen Bahçe courtyard, Urla town", tr: "Değirmen Bahçe avlusu, Urla merkez" }, note: { en: "Wine from the estate and too many olives. Come as you are.", tr: "Bağın şarabı ve fazlasıyla zeytin. Nasılsanız öyle gelin." } },
  { day: 1, start: "16:15", icon: "bus", title: { en: "Shuttles leave", tr: "Servisler kalkar" }, place: { en: "Urla Cumhuriyet Square and the three partner hotels", tr: "Urla Cumhuriyet Meydanı ve üç anlaşmalı otel" }, note: { en: "A 12-minute ride. The last one waits until 16:30.", tr: "12 dakikalık yol. Sonuncusu 16:30’a kadar bekler." } },
  { day: 1, start: "17:00", key: true, icon: "rings", title: { en: "Ceremony", tr: "Nikâh töreni" }, place: { en: "Under the old olive tree", tr: "Yaşlı zeytin ağacının altında" }, note: { en: "Twenty minutes, in Turkish and English, phones in pockets.", tr: "Yirmi dakika, Türkçe ve İngilizce; telefonlar cepte." } },
  { day: 1, start: "17:45", icon: "glass", title: { en: "Drinks and meze", tr: "İçki ve meze" }, place: { en: "The stone terrace", tr: "Taş teras" } },
  { day: 1, start: "19:30", key: true, icon: "dinner", title: { en: "Dinner at the long table", tr: "Uzun masada akşam yemeği" }, place: { en: "Between the almond trees", tr: "Badem ağaçlarının arasında" }, note: { en: "Seventy metres of table, 132 of you.", tr: "Yetmiş metre masa, 132 kişi." } },
  { day: 1, start: "21:30", icon: "music", title: { en: "Speeches, first dance, dancing", tr: "Konuşmalar, ilk dans ve dans" }, place: { en: "The barn", tr: "Ahır salonu" }, note: { en: "Short speeches, we promise. Then a band until midnight and a DJ after.", tr: "Kısa konuşmalar, söz. Gece yarısına kadar grup, sonra DJ." } },
  { day: 1, start: "01:00", icon: "moon", title: { en: "Last shuttle", tr: "Son servis" }, place: { en: "Back to Urla and the hotels", tr: "Urla’ya ve otellere dönüş" }, note: { en: "Earlier shuttles at 23:00 and 00:00.", tr: "Daha erken servisler 23:00 ve 00:00’da." } },
  { day: 2, start: "12:00", end: "16:00", key: true, icon: "coffee", title: { en: "Lazy brunch and a swim", tr: "Tembel kahvaltı ve yüzme" }, place: { en: "Bademli Olive Estate, by the pool", tr: "Bademli Zeytinliği, havuz başı" }, note: { en: "Bring swimwear. Leave the hangover at the gate.", tr: "Mayonuzu getirin. Akşamdan kalmayı kapıda bırakın." } },
];

/* ------------------------------------------------------------------ */
/* Venue, travel, stay                                                  */
/* ------------------------------------------------------------------ */

/** The estate is ours on the wedding day and for Sunday brunch. */
const hours: OpeningHours = {
  timeZone: "Europe/Istanbul",
  weekly: { sat: [{ open: "16:15", close: "01:00" }], sun: [{ open: "12:00", close: "16:00" }] },
};

/** A neutral street-map preview for the map facade: lanes through groves, not a real map. */
const groveMap = {
  src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 900'%3E%3Cdefs%3E%3Cpattern id='o' width='60' height='60' patternUnits='userSpaceOnUse'%3E%3Crect width='60' height='60' fill='%23f6f6f2'/%3E%3Ccircle cx='15' cy='15' r='7' fill='%23e3e4dc'/%3E%3Ccircle cx='45' cy='45' r='7' fill='%23e3e4dc'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='1200' height='900' fill='url(%23o)'/%3E%3Cpath d='M0 0H1200V170C900 210 600 130 0 190Z' fill='%23dfe3e5'/%3E%3Cg fill='none' stroke-linecap='round'%3E%3Cg stroke='%23d6d5ce' stroke-width='28'%3E%3Cpath d='M-40 640C260 600 480 520 700 470S1000 420 1240 300'/%3E%3Cpath d='M620 960C610 760 640 600 700 470'/%3E%3C/g%3E%3Cg stroke='%23fff' stroke-width='18'%3E%3Cpath d='M-40 640C260 600 480 520 700 470S1000 420 1240 300'/%3E%3Cpath d='M620 960C610 760 640 600 700 470'/%3E%3C/g%3E%3Cpath d='M700 470C760 420 790 380 820 330' stroke='%23fff' stroke-width='10' stroke-dasharray='2 14'/%3E%3C/g%3E%3Crect x='770' y='260' width='120' height='70' rx='4' fill='%23d9dcd2'/%3E%3C/svg%3E",
  width: 1200,
  height: 900,
  alt: "",
};

export function venue(t: (v: L) => string): Branch {
  return {
    name: "Bademli Olive Estate",
    address: { line: "Zeytinlik Yolu 7", district: "Bademler", city: "Urla", region: "İzmir", postalCode: "35430", country: "TR", geo: { lat: 38.3239, lng: 26.7354 } },
    phone: PHONE,
    email: EMAIL,
    hours,
    mapImage: groveMap,
    notes: t({ en: "Gravel lanes and lawn: block heels or flats. A golf buggy runs from the car park to the terrace for anyone who would rather not walk.", tr: "Çakıl yollar ve çimen: kalın topuk ya da düz ayakkabı. Yürümek istemeyenler için otoparktan terasa golf arabası var." }),
  };
}

export const travel: { mode: L; title: L; body: L }[] = [
  { mode: { en: "Fly", tr: "Uçak" }, title: { en: "İzmir Adnan Menderes (ADB)", tr: "İzmir Adnan Menderes (ADB)" }, body: { en: "55 minutes by car. Direct flights from Istanbul every hour, and from London, Berlin and Amsterdam most days in June.", tr: "Arabayla 55 dakika. İstanbul’dan saat başı, Haziran’da Londra, Berlin ve Amsterdam’dan çoğu gün direkt uçuş var." } },
  { mode: { en: "Drive", tr: "Araba" }, title: { en: "Çeşme motorway, Urla exit", tr: "Çeşme otoyolu, Urla çıkışı" }, body: { en: "Then follow the signs for Bademler. 80 parking spaces at the estate; please share cars if you can.", tr: "Sonra Bademler tabelalarını izleyin. Zeytinlikte 80 park yeri var; mümkünse araç paylaşın." } },
  { mode: { en: "Shuttle", tr: "Servis" }, title: { en: "Free, on Saturday", tr: "Cumartesi, ücretsiz" }, body: { en: "From Urla Cumhuriyet Square and the three partner hotels at 16:15; back at 23:00, 00:00 and 01:00. Tick the box when you reply.", tr: "Urla Cumhuriyet Meydanı ve üç anlaşmalı otelden 16:15’te; dönüş 23:00, 00:00 ve 01:00’de. Yanıt verirken kutuyu işaretleyin." } },
];

export const hotels: { name: string; kind: L; distance: L; from: number; code: string; until: L }[] = [
  { name: "Kiraz Konak", kind: { en: "Stone house hotel, 14 rooms", tr: "Taş ev otel, 14 oda" }, distance: { en: "8 min from the estate", tr: "Zeytinliğe 8 dk" }, from: 4200, code: "ECEDAN27", until: { en: "held until 1 April", tr: "1 Nisan’a kadar ayrıldı" } },
  { name: "Bağ Evi Urla", kind: { en: "Vineyard guesthouse, 9 rooms", tr: "Bağ evi pansiyon, 9 oda" }, distance: { en: "12 min", tr: "12 dk" }, from: 3600, code: "ECEDAN27", until: { en: "held until 15 April", tr: "15 Nisan’a kadar ayrıldı" } },
  { name: "Taşlı Rooms", kind: { en: "Simple rooms by the sea", tr: "Deniz kenarında sade odalar" }, distance: { en: "20 min", tr: "20 dk" }, from: 2900, code: "WEDDING", until: { en: "book any time", tr: "istediğiniz zaman" } },
];

export const dressCode = {
  name: { en: "Garden formal", tr: "Bahçe şıklığı" } as L,
  lead: { en: "Dress up, but for a lawn in June, not a ballroom. The sun sets at 20:41; by midnight it’s about 19°C.", tr: "Şık olun, ama bir balo salonu için değil, Haziran’da bir çimen için. Güneş 20:41’de batıyor; gece yarısı hava 19°C civarında." } as L,
  yes: [
    { en: "Linen and light suits; a tie is welcome, not required", tr: "Keten ve hafif takımlar; kravat hoş olur, şart değil" },
    { en: "Midi or long dresses, any colour you love", tr: "Midi ya da uzun elbiseler, sevdiğiniz her renk" },
    { en: "Block heels, flats, loafers — the lanes are gravel", tr: "Kalın topuk, düz ayakkabı, loafer — yollar çakıl" },
    { en: "A light layer for after dark", tr: "Hava karardıktan sonrası için ince bir üst" },
  ] as L[],
  no: [
    { en: "White, ivory or cream — that one’s taken", tr: "Beyaz, fildişi ya da krem — o renk dolu" },
    { en: "Stilettos (the lawn will keep them)", tr: "İnce topuk (çimen geri vermez)" },
  ] as L[],
};

export const faq: { q: L; a: L }[] = [
  { q: { en: "Can I bring a plus-one?", tr: "Yanımda birini getirebilir miyim?" }, a: { en: "If your invitation includes one, the RSVP form will ask for their name. We’ve kept numbers small so everyone fits at one table.", tr: "Davetiyeniz bir misafir içeriyorsa, yanıt formu adını soracak. Herkes tek masaya sığsın diye sayıyı küçük tuttuk." } },
  { q: { en: "Are children invited?", tr: "Çocuklar davetli mi?" }, a: { en: "Our nieces and nephews are, and they are named on their family’s invitation. Otherwise the evening is adults only — Urla has two trusted babysitters we can put you in touch with.", tr: "Yeğenlerimiz davetli ve ailelerinin davetiyesinde adları yazıyor. Bunun dışında akşam yetişkinlere özel — Urla’da güvendiğimiz iki bakıcıyla sizi tanıştırabiliriz." } },
  { q: { en: "Is the ceremony unplugged?", tr: "Tören telefonsuz mu?" }, a: { en: "Yes — twenty minutes with phones in pockets. Our photographer, Mira Kaya, will share everything the week after.", tr: "Evet — yirmi dakika telefonlar cepte. Fotoğrafçımız Mira Kaya her şeyi bir hafta sonra paylaşacak." } },
  { q: { en: "What if it rains?", tr: "Yağmur yağarsa?" }, a: { en: "It hasn’t rained in Urla on 12 June for nine years. If it does, the ceremony moves under the covered terrace and dinner into the barn.", tr: "Urla’da dokuz yıldır 12 Haziran’da yağmur yağmadı. Yağarsa tören kapalı terasa, yemek ahır salonuna taşınır." } },
  { q: { en: "Is the estate step-free?", tr: "Zeytinlik basamaksız mı?" }, a: { en: "The terrace, the long table and the barn are step-free, and there is an accessible toilet. A golf buggy runs from the car park all evening.", tr: "Teras, uzun masa ve ahır salonu basamaksız; engelli tuvaleti var. Otoparktan akşam boyunca golf arabası çalışıyor." } },
  { q: { en: "Who do I ask about anything else?", tr: "Başka bir şey için kime sorayım?" }, a: { en: "Defne, Ece’s sister and our maid of honour, knows everything: defne@eceanddaniel.example.com or +90 216 000 00 00.", tr: "Ece’nin kız kardeşi ve nedimemiz Defne her şeyi biliyor: defne@eceanddaniel.example.com ya da +90 216 000 00 00." } },
];

/* ------------------------------------------------------------------ */
/* RSVP: invitations (fictional guest list) and menu                     */
/* ------------------------------------------------------------------ */

export interface Invitation {
  id: string;
  /** Guests named on the invitation. `child` gets the children’s menu. */
  guests: { name: string; child?: boolean }[];
  plusOne: boolean;
}

export const invitations: Invitation[] = [
  { id: "aksoy", guests: [{ name: "Selin Aksoy" }], plusOne: true },
  { id: "bellini", guests: [{ name: "Marco Bellini" }, { name: "Giulia Bellini" }], plusOne: false },
  { id: "demir", guests: [{ name: "Can Demir" }], plusOne: true },
  { id: "yildiz", guests: [{ name: "Aylin Yıldız" }, { name: "Kerem Yıldız" }, { name: "Deniz Yıldız", child: true }], plusOne: false },
  { id: "okafor", guests: [{ name: "Hannah Okafor" }], plusOne: false },
];

export type MealId = "lamb" | "bass" | "dolma" | "kids";
export const meals: { id: MealId; name: L; detail: L; tags: L[]; kids?: boolean }[] = [
  { id: "lamb", name: { en: "Slow-roasted lamb shoulder", tr: "Ağır ateşte kuzu omuz" }, detail: { en: "Freekeh, smoked aubergine, pomegranate", tr: "Firik, közlenmiş patlıcan, nar" }, tags: [] },
  { id: "bass", name: { en: "Sea bass from the Gulf", tr: "Körfez levreği" }, detail: { en: "Fennel, olive-oil potatoes, lemon", tr: "Rezene, zeytinyağlı patates, limon" }, tags: [{ en: "Gluten-free", tr: "Glutensiz" }] },
  { id: "dolma", name: { en: "Courgette-flower dolma", tr: "Kabak çiçeği dolması" }, detail: { en: "Broad-bean purée, dill, estate olive oil", tr: "Bakla ezmesi, dereotu, bahçenin zeytinyağı" }, tags: [{ en: "Vegan", tr: "Vegan" }, { en: "Gluten-free", tr: "Glutensiz" }] },
  { id: "kids", name: { en: "Children’s plate", tr: "Çocuk tabağı" }, detail: { en: "Köfte, chips, cucumber, then ice cream", tr: "Köfte, patates kızartması, salatalık, sonra dondurma" }, tags: [], kids: true },
];

export type DietId = "vegetarian" | "vegan" | "gluten" | "dairy" | "nuts" | "shellfish";
export const diets: { id: DietId; label: L }[] = [
  { id: "vegetarian", label: { en: "Vegetarian", tr: "Vejetaryen" } },
  { id: "vegan", label: { en: "Vegan", tr: "Vegan" } },
  { id: "gluten", label: { en: "No gluten", tr: "Glutensiz" } },
  { id: "dairy", label: { en: "No dairy", tr: "Süt ürünsüz" } },
  { id: "nuts", label: { en: "Nut allergy", tr: "Kuruyemiş alerjisi" } },
  { id: "shellfish", label: { en: "Shellfish allergy", tr: "Kabuklu deniz ürünü alerjisi" } },
];
